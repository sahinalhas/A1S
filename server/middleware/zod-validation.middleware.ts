/**
 * Zod Validation Middleware
 * Provides runtime validation for request body, params, and query using Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { 
  createErrorResponse, 
  ApiErrorCode,
  type ValidationError 
} from '../../shared/types/api-contracts.js';

/**
 * Validation target type
 */
export type ValidationTarget = 'body' | 'params' | 'query';

/**
 * Formats Zod validation errors into API-friendly format
 */
function formatZodErrors(error: ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    value: err.code === 'invalid_type' ? undefined : String(err.input),
  }));
}

/**
 * Creates a validation middleware for a specific schema and target
 * 
 * @param schema - Zod schema to validate against
 * @param target - Where to validate: 'body', 'params', or 'query'
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * router.post('/students', 
 *   validateRequest(StudentSchema, 'body'),
 *   studentController
 * );
 * ```
 */
export function validateRequest<T>(
  schema: ZodSchema<T>,
  target: ValidationTarget = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[target];
      
      // Parse and validate
      const validatedData = schema.parse(dataToValidate);
      
      // Replace request data with validated (and potentially transformed) data
      (req as Record<string, unknown>)[target] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = formatZodErrors(error);
        
        logger.warn('Request validation failed', 'ZodValidation', {
          target,
          path: req.path,
          errors: validationErrors,
        });
        
        res.status(400).json(
          createErrorResponse(
            'Request validation failed',
            ApiErrorCode.VALIDATION_ERROR,
            validationErrors
          )
        );
      } else {
        logger.error('Unexpected validation error', 'ZodValidation', error);
        res.status(500).json(
          createErrorResponse(
            'Internal validation error',
            ApiErrorCode.INTERNAL_ERROR
          )
        );
      }
    }
  };
}

/**
 * Validates request body
 * Convenience wrapper around validateRequest
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return validateRequest(schema, 'body');
}

/**
 * Validates request params
 * Convenience wrapper around validateRequest
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return validateRequest(schema, 'params');
}

/**
 * Validates request query
 * Convenience wrapper around validateRequest
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return validateRequest(schema, 'query');
}
