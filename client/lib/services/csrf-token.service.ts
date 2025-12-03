/**
 * CSRF Token Service (Legacy - No longer needed)
 * 
 * Modern CSRF protection uses SameSite cookies instead of tokens.
 * This service is kept for backwards compatibility but no longer fetches tokens.
 * 
 * Modern approach:
 * - SameSite=Lax cookies prevent CSRF attacks automatically
 * - No token synchronization needed
 * - Simpler, more reliable protection
 */

class CsrfTokenService {
 // No-op methods for backwards compatibility
 async getToken(): Promise<string> {
 return '';
 }

 refreshToken(): void {
 // No longer needed
 }

 hasToken(): boolean {
 return true; // Always return true to avoid breaking existing checks
 }
}

export const csrfTokenService = new CsrfTokenService();
