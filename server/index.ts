import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env, corsConfig } from "./config/index.js";
import { securityHeaders } from "./middleware/security-headers.js";
import { sanitizeAllInputs } from "./middleware/validation.js";
import { ensureCsrfSession } from "./middleware/csrf.middleware.js";
import { handleMulterError } from "./middleware/file-validation.middleware.js";
import { logger } from "./utils/logger.js";

/**
 * BACKEND MODULARIZATION - COMPLETE
 * 
 * All features have been successfully migrated to a feature-based modular architecture.
 */

const fallbackRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
  validate: { trustProxy: false },
});

export async function createServer() {
  const app = express();

  app.set('trust proxy', true);

  app.use(securityHeaders);
  app.use(cors(corsConfig));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb',
    parameterLimit: 1000
  }));

  app.use(cookieParser());
  app.use(express.static('public'));
  app.use(ensureCsrfSession);
  app.use('/api', fallbackRateLimiter);
  app.use(sanitizeAllInputs);

  app.get("/api/ping", (_req, res) => {
    res.json({ message: env.PING_MESSAGE });
  });

  try {
    const featuresModule = await import("./features/index.js");
    const featureRegistry = featuresModule.default;
    if (featureRegistry && typeof featureRegistry === 'function') {
      app.use("/api", featureRegistry);
      console.log('[Server] Feature registry loaded successfully');
    } else {
      console.error('[Server] Feature registry is not a valid router:', typeof featureRegistry);
    }
  } catch (error) {
    console.error('[Server] Failed to load feature registry:', error);
  }

  app.use(handleMulterError);

  app.use((err: Error & { statusCode?: number; code?: string }, req: Request, res: Response, _next: NextFunction) => {
    logger.error('Unhandled error', 'ErrorHandler', err);

    const isDevelopment = env.NODE_ENV === 'development';

    res.status(err.statusCode || 500).json({
      success: false,
      error: isDevelopment ? err.message : 'Internal server error',
      code: err.code || 'INTERNAL_ERROR',
      ...(isDevelopment && { stack: err.stack }),
    });
  });

  return app;
}
