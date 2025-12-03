/**
 * Secure Authentication Middleware
 * Uses cryptographically signed session tokens with cookie-based storage
 * 
 * Validates session tokens and retrieves user data from the database
 */

import { Request, Response, NextFunction } from 'express';
import { getUserById } from '../features/users/services/users.service.js';
import { AuthenticationError } from '../lib/error-handler.js';
import { logger } from '../utils/logger.js';
import { sessionTokenService } from '../services/session-token.service.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    institution: string;
  };
}

/**
 * Secure authentication middleware using signed session tokens
 * Validates cryptographic signatures to prevent session spoofing
 * 
 * Token can be provided via:
 * 1. HttpOnly cookie: 'session_token' (recommended)
 * 2. Authorization header: 'Bearer <token>'
 * 
 * @example
 * ```typescript
 * // Apply to protected routes
 * router.get('/api/protected', requireSecureAuth, handler);
 * ```
 */
export function requireSecureAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    // Extract token from cookie or Authorization header
    const token = 
      req.cookies?.session_token || 
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AuthenticationError('No session token provided');
    }

    // Verify token signature and expiration
    const verified = sessionTokenService.verifyToken(token);
    
    if (!verified) {
      throw new AuthenticationError('Invalid or expired session token');
    }

    // Get user data from database
    const user = getUserById(verified.userId);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    // Attach verified user to request
    (req as AuthenticatedRequest).user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      institution: user.institution
    };

    // Only log in development for debugging
    // logger.debug('Authentication successful', 'SecureAuthMiddleware', {
    //   userId: verified.userId,
    //   method: req.cookies?.session_token ? 'cookie' : 'header'
    // });

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      logger.warn('Authentication failed', 'SecureAuthMiddleware', { 
        error: error.message,
        path: req.path
      });
      res.status(error.statusCode).json({ 
        error: error.message,
        code: error.code
      });
    } else {
      logger.error('Unexpected authentication error', 'SecureAuthMiddleware', error);
      res.status(401).json({ 
        error: 'Authentication failed',
        code: 'AUTHENTICATION_ERROR'
      });
    }
  }
}

/**
 * Middleware to check if user has specific permission (secure version)
 */
export function requirePermissionSecure(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_ERROR'
      });
    }

    if (!authReq.user.permissions.includes(permission)) {
      logger.warn('Permission denied', 'SecureAuthMiddleware', {
        userId: authReq.user.id,
        required: permission,
        has: authReq.user.permissions
      });
      
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        code: 'AUTHORIZATION_ERROR'
      });
    }

    next();
  };
}

/**
 * Middleware to check if user has specific role (secure version)
 */
export function requireRoleSecure(allowedRoles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_ERROR'
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(authReq.user.role)) {
      logger.warn('Role check failed', 'SecureAuthMiddleware', {
        userId: authReq.user.id,
        userRole: authReq.user.role,
        required: roles
      });
      
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles.join(' or '),
        code: 'AUTHORIZATION_ERROR'
      });
    }

    next();
  };
}
