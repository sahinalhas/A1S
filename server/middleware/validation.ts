import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  sanitizeString as sanitizeStringUtil,
  sanitizeObject as sanitizeObjectUtil,
  sanitizeAIPrompt as sanitizeAIPromptUtil,
  sanitizeAIObject as sanitizeAIObjectUtil,
} from '../utils/validators/sanitization.js';
import { env } from '../config/index.js';

// Re-export sanitization utilities for backward compatibility
export const sanitizeString = sanitizeStringUtil;
export const sanitizeObject = sanitizeObjectUtil;
export const sanitizeAIPrompt = sanitizeAIPromptUtil;
export const sanitizeAIPromptObject = sanitizeAIObjectUtil;

// Middleware to sanitize request body
export function sanitizeRequestBody(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}

// Enhanced input validation middleware
export function validateRequestBody(schema: z.ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if body exists
      if (!req.body) {
        return res.status(400).json({
          success: false,
          error: 'Request body is required'
        });
      }

      // Validate with schema
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: env.NODE_ENV === 'development' ? result.error.issues : undefined
        });
      }
      
      // Replace body with validated data
      req.body = result.data;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Request validation failed'
      });
    }
  };
}

// Rate limiting helper with per-endpoint tracking
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export function simpleRateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Create a compound key using IP + route pattern + method to prevent interference between endpoints
    // Use route pattern (e.g., /api/students/:id) instead of actual path (e.g., /api/students/123)
    // to ensure all requests to the same endpoint share the same counter
    const ip = req.ip || 'unknown';
    const routePattern = req.route?.path || req.path;
    const baseUrl = req.baseUrl || '';
    const fullRoute = `${req.method}:${baseUrl}${routePattern}`;
    const key = `${ip}:${fullRoute}`;
    const now = Date.now();
    
    // Clean up old entries periodically
    Object.keys(rateLimitStore).forEach(k => {
      if (rateLimitStore[k].resetTime < now) {
        delete rateLimitStore[k];
      }
    });
    
    // Check current key
    if (!rateLimitStore[key]) {
      rateLimitStore[key] = {
        count: 1,
        resetTime: now + windowMs
      };
    } else {
      rateLimitStore[key].count++;
    }
    
    if (rateLimitStore[key].count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.'
      });
    }
    
    next();
  };
}

// Parameter validation
export function validateParams(allowedParams: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const paramKeys = Object.keys(req.params);
    const invalidParams = paramKeys.filter(key => !allowedParams.includes(key));
    
    if (invalidParams.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters'
      });
    }
    
    // Sanitize parameter values
    for (const key of paramKeys) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = sanitizeString(req.params[key]);
      }
    }
    
    next();
  };
}


/**
 * Middleware: AI endpoint'leri için özel sanitizasyon
 */
export function sanitizeAIRequest(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeAIObjectUtil(req.body);
  }
  
  if (req.query && typeof req.query === 'object') {
    const sanitized = sanitizeAIObjectUtil(req.query as Record<string, any>);
    for (const key in req.query) {
      delete req.query[key];
    }
    Object.assign(req.query, sanitized);
  }
  
  next();
}

/**
 * Comprehensive input validation middleware
 * Tüm endpoint'lerde kullanılabilir - query params, body ve params'ı sanitize eder
 */
export function sanitizeAllInputs(req: Request, res: Response, next: NextFunction) {
  // Body sanitization
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  // Query params sanitization
  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery: any = {};
    for (const key in req.query) {
      const value = req.query[key];
      if (typeof value === 'string') {
        sanitizedQuery[key] = sanitizeString(value);
      } else if (Array.isArray(value)) {
        sanitizedQuery[key] = value.map(v => 
          typeof v === 'string' ? sanitizeString(v) : v
        );
      } else {
        sanitizedQuery[key] = value;
      }
    }
    for (const key in req.query) {
      delete req.query[key];
    }
    Object.assign(req.query, sanitizedQuery);
  }
  
  // URL params sanitization
  if (req.params && typeof req.params === 'object') {
    const sanitizedParams: any = {};
    for (const key in req.params) {
      if (typeof req.params[key] === 'string') {
        sanitizedParams[key] = sanitizeString(req.params[key]);
      } else {
        sanitizedParams[key] = req.params[key];
      }
    }
    for (const key in req.params) {
      delete req.params[key];
    }
    Object.assign(req.params, sanitizedParams);
  }
  
  next();
}