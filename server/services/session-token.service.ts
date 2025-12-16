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
  sessionStartAt: number;  // Track original session start for max duration
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
   * This is the initial token lifetime
   */
  private readonly tokenValidityMs = 24 * 60 * 60 * 1000;

  /**
   * Renewal threshold - token will be renewed if remaining time is less than this
   * (12 hours)
   */
  private readonly renewalThresholdMs = 12 * 60 * 60 * 1000;

  /**
   * Maximum session duration - even with renewals, session cannot exceed this
   * (7 days)
   */
  private readonly maxSessionDurationMs = 7 * 24 * 60 * 60 * 1000;

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
   * @param existingSessionStart - Optional: timestamp of original session start (for renewal)
   * @returns Signed session token
   * 
   * @example
   * ```typescript
   * // New session
   * const token = sessionTokenService.createToken('user123');
   * 
   * // Renew existing session
   * const renewed = sessionTokenService.createToken('user123', existingPayload.sessionStartAt);
   * ```
   */
  createToken(userId: string, existingSessionStart?: number): string {
    const now = Date.now();
    const sessionStartAt = existingSessionStart || now;

    const payload: SessionTokenPayload = {
      userId,
      issuedAt: now,
      expiresAt: now + this.tokenValidityMs,
      sessionStartAt,
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
      sessionAge: now - sessionStartAt,
      isRenewal: !!existingSessionStart,
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

    // Preserve original session start time
    return this.createToken(verified.userId, verified.sessionStartAt);
  }

  /**
   * Determines if a token should be renewed based on remaining time and max session
   * 
   * @param payload - Verified token payload
   * @returns Object with renewal decision and reason
   */
  shouldRenewToken(payload: SessionTokenPayload): {
    shouldRenew: boolean;
    reason?: string;
    timeRemaining?: number;
    sessionAge?: number;
  } {
    const now = Date.now();
    const timeRemaining = payload.expiresAt - now;
    const sessionAge = now - payload.sessionStartAt;

    // Check if session exceeded maximum duration
    if (sessionAge >= this.maxSessionDurationMs) {
      return {
        shouldRenew: false,
        reason: 'MAX_SESSION_EXCEEDED',
        timeRemaining,
        sessionAge,
      };
    }

    // Check if token needs renewal (< 12 hours remaining)
    if (timeRemaining < this.renewalThresholdMs) {
      return {
        shouldRenew: true,
        reason: 'APPROACHING_EXPIRATION',
        timeRemaining,
        sessionAge,
      };
    }

    return {
      shouldRenew: false,
      reason: 'NOT_NEEDED',
      timeRemaining,
      sessionAge,
    };
  }
}

/**
 * Singleton instance of SessionTokenService
 */
export const sessionTokenService = new SessionTokenService();
