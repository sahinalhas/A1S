import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Base class for custom application errors
 * Provides structured error handling with HTTP status codes
 */
export abstract class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: Error
  ) {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with ID ${id} not found` : `${resource} not found`,
      404,
      'NOT_FOUND'
    );
    this.name = 'NotFoundError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export function handleDatabaseError(
  operation: string,
  error: unknown,
  userMessage?: string
): never {
  const message = userMessage || 'Veritabanı işlemi başarısız oldu';
  
  if (error instanceof Error) {
    logger.error(`Database operation failed: ${operation}`, 'DatabaseError', {
      operation,
      error: error.message,
      stack: error.stack,
    });
    throw new DatabaseError(message, operation, error);
  }
  
  logger.error(`Database operation failed: ${operation}`, 'DatabaseError', { operation, error });
  throw new DatabaseError(message, operation);
}

export function wrapRepositoryMethod<T extends unknown[], R>(
  operation: string,
  method: (...args: T) => R,
  userMessage?: string
): (...args: T) => R {
  return (...args: T): R => {
    try {
      return method(...args);
    } catch (error) {
      handleDatabaseError(operation, error, userMessage);
    }
  };
}

export function asyncWrapRepositoryMethod<T extends unknown[], R>(
  operation: string,
  method: (...args: T) => Promise<R>,
  userMessage?: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await method(...args);
    } catch (error) {
      handleDatabaseError(operation, error, userMessage);
    }
  };
}

/**
 * Centralized API error handler with production-safe error messages
 * Logs detailed errors internally but returns sanitized messages to clients
 */
export function handleApiError(
  error: unknown,
  res: Response,
  defaultMessage = 'İşlem başarısız oldu'
): void {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Handle known AppError instances
  if (error instanceof AppError) {
    logger.error(
      `API Error: ${error.message}`,
      error.name,
      {
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack,
        ...(error instanceof DatabaseError && { operation: error.operation }),
        ...(error instanceof ValidationError && { field: error.field }),
      }
    );

    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
      ...(isDevelopment && { stack: error.stack }),
    });
    return;
  }

  // Handle unknown errors - hide details in production
  const internalMessage = error instanceof Error ? error.message : String(error);
  logger.error('Unhandled API error', 'UnknownError', {
    error: internalMessage,
    stack: error instanceof Error ? error.stack : undefined,
  });

  res.status(500).json({
    success: false,
    error: isDevelopment ? internalMessage : defaultMessage,
    code: 'INTERNAL_ERROR',
    ...(isDevelopment && error instanceof Error && { stack: error.stack }),
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  handleApiError(err, res);
}
