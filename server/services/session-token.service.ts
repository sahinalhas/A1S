/**
 * Session Token Service
 * Provides cryptographically signed session tokens to prevent session spoofing
 * Replaces the insecure x-user-id header trust mechanism
 * 
 * Uses HMAC-SHA256 for signing and verification
 */

import crypto from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * Session token payload structure
 */
export interface SessionTokenPayload {
  userId: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Parsed and verified session token
 */
export interface VerifiedToken extends SessionTokenPayload {
  valid: true;
}

/**
 * Session token service for creating and verifying signed tokens
 * Uses HMAC-SHA256 to prevent token tampering
 */
export class SessionTokenService {
  private readonly secret: string;
  private readonly algorithm = 'sha256';
  
  /**
   * Token validity duration in milliseconds (24 hours)
   */
  private readonly tokenValidityMs = 24 * 60 * 60 * 1000;

  constructor() {
    // In production, SESSION_SECRET is mandatory
    if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
      const error = 'FATAL: SESSION_SECRET environment variable must be set in production';
      logger.error(error, 'SessionTokenService');
      throw new Error(error);
    }
    
    // Get secret from environment or generate a random one (development only)
    this.secret = process.env.SESSION_SECRET || this.generateDevelopmentSecret();
    
    if (!process.env.SESSION_SECRET) {
      logger.warn(
        'SESSION_SECRET not set in environment, using generated secret (development only)',
        'SessionTokenService'
      );
    } else {
      logger.info('SESSION_SECRET loaded from environment', 'SessionTokenService');
    }
  }

  /**
   * Generates a random secret for development
   * ⚠️ WARNING: In production, always set SESSION_SECRET environment variable
   */
  private generateDevelopmentSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Creates a signed session token for a user
   * 
   * @param userId - User identifier
   * @returns Signed session token
   * 
   * @example
   * ```typescript
   * const token = sessionTokenService.createToken('user123');
   * res.cookie('session_token', token, { httpOnly: true, secure: true });
   * ```
   */
  createToken(userId: string): string {
    const now = Date.now();
    
    const payload: SessionTokenPayload = {
      userId,
      issuedAt: now,
      expiresAt: now + this.tokenValidityMs,
    };

    const payloadString = JSON.stringify(payload);
    const payloadBase64 = Buffer.from(payloadString).toString('base64url');
    
    // Create HMAC signature
    const signature = crypto
      .createHmac(this.algorithm, this.secret)
      .update(payloadBase64)
      .digest('base64url');

    // Token format: payload.signature
    const token = `${payloadBase64}.${signature}`;
    
    logger.debug('Session token created', 'SessionTokenService', {
      userId,
      expiresAt: new Date(payload.expiresAt).toISOString(),
    });
    
    return token;
  }

  /**
   * Verifies a session token and returns the payload
   * 
   * @param token - Session token to verify
   * @returns Verified token payload or null if invalid
   * 
   * @example
   * ```typescript
   * const verified = sessionTokenService.verifyToken(token);
   * if (verified) {
   *   console.log('User ID:', verified.userId);
   * }
   * ```
   */
  verifyToken(token: string | undefined | null): VerifiedToken | null {
    if (!token) {
      return null;
    }

    try {
      // Split token into payload and signature
      const parts = token.split('.');
      if (parts.length !== 2) {
        logger.warn('Invalid token format', 'SessionTokenService');
        return null;
      }

      const [payloadBase64, providedSignature] = parts;

      // Verify signature
      const expectedSignature = crypto
        .createHmac(this.algorithm, this.secret)
        .update(payloadBase64)
        .digest('base64url');

      // Constant-time comparison to prevent timing attacks
      if (!crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(providedSignature)
      )) {
        logger.warn('Token signature mismatch', 'SessionTokenService');
        return null;
      }

      // Decode and parse payload
      const payloadString = Buffer.from(payloadBase64, 'base64url').toString();
      const payload: SessionTokenPayload = JSON.parse(payloadString);

      // Check expiration
      if (Date.now() > payload.expiresAt) {
        logger.debug('Token expired', 'SessionTokenService', {
          userId: payload.userId,
          expiredAt: new Date(payload.expiresAt).toISOString(),
        });
        return null;
      }

      return {
        ...payload,
        valid: true,
      };
    } catch (error) {
      logger.error('Token verification failed', 'SessionTokenService', error);
      return null;
    }
  }

  /**
   * Refreshes a token if it's still valid
   * Creates a new token with extended expiration
   * 
   * @param token - Current session token
   * @returns New token or null if current token is invalid
   */
  refreshToken(token: string): string | null {
    const verified = this.verifyToken(token);
    
    if (!verified) {
      return null;
    }

    return this.createToken(verified.userId);
  }
}

/**
 * Singleton instance of SessionTokenService
 */
export const sessionTokenService = new SessionTokenService();
