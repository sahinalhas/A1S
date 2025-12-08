import type { CorsOptions } from 'cors';
import { env } from './env.js';

/**
 * CORS Configuration
 * 
 * Centralized CORS configuration with environment-based origin handling.
 * Supports development, production, and Replit-specific origins.
 */

const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
];

/**
 * Check if origin is a Replit domain
 */
function isReplitOrigin(origin: string): boolean {
  return origin.includes('.replit.dev') || origin.includes('.repl.co');
}

/**
 * Check if origin is localhost
 */
function isLocalOrigin(origin: string): boolean {
  return origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
}

/**
 * Build production allowed origins from environment
 */
function buildProductionAllowedOrigins(): string[] {
  const allowedOrigins: string[] = [];

  // Add Replit domain if available
  if (process.env.REPLIT_DEV_DOMAIN) {
    allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  }

  // Add custom origins from environment
  if (env.ALLOWED_ORIGINS) {
    allowedOrigins.push(...env.ALLOWED_ORIGINS);
  }

  return allowedOrigins;
}

/**
 * Check if production origin is allowed
 */
function isProductionOriginAllowed(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
): void {
  if (!origin) {
    return callback(null, true);
  }

  const allowedOrigins = buildProductionAllowedOrigins();

  // If no explicit origins configured in production, reject the request
  if (allowedOrigins.length === 0) {
    console.error(
      `CORS: No explicit origins configured in production. Rejecting origin: ${origin}. ` +
        'Set ALLOWED_ORIGINS environment variable with your production domain.'
    );
    return callback(new Error('Not allowed by CORS - no origins configured'), false);
  }

  // Check if origin is in allowed list
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  return callback(new Error('Not allowed by CORS'), false);
}

/**
 * Check if development origin is allowed
 */
function isDevelopmentOriginAllowed(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
): void {
  if (!origin) {
    return callback(null, true);
  }

  if (DEV_ORIGINS.includes(origin) || isLocalOrigin(origin) || isReplitOrigin(origin)) {
    return callback(null, true);
  }

  console.warn(`CORS: Blocked origin in development: ${origin}`);
  return callback(new Error('Not allowed by CORS in development'), false);
}

/**
 * Get CORS options based on environment
 */
export function getCorsOptions(): CorsOptions {
  return {
    origin: (origin, callback) => {
      const isProduction = env.NODE_ENV === 'production';

      if (isProduction) {
        isProductionOriginAllowed(origin, callback);
      } else {
        isDevelopmentOriginAllowed(origin, callback);
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  };
}

/**
 * CORS configuration instance
 */
export const corsConfig = getCorsOptions();
