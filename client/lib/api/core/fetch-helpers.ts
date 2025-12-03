import { getSelectedSchoolId } from '@/lib/school-context';

/**
 * Helper function to add X-School-Id header to fetch requests
 */
export function getRequestHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const schoolId = getSelectedSchoolId();
  const headers = { ...additionalHeaders };
  
  if (schoolId) {
    headers['X-School-Id'] = schoolId;
  } else {
    console.warn('[FetchHelpers] No school selected - request may fail');
  }
  
  return headers;
}

/**
 * Get current school ID for use in request validation
 */
export function getCurrentSchoolId(): string | null {
  return getSelectedSchoolId();
}

/**
 * Wrapper for fetch with automatic X-School-Id header
 * Ensures all requests include the current school context
 */
export async function fetchWithSchool(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const schoolId = getSelectedSchoolId();
  
  if (!schoolId) {
    console.error('[FetchWithSchool] No school selected for request:', endpoint);
  }
  
  const headers = getRequestHeaders(
    (options.headers as Record<string, string>) || {}
  );
  
  return fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include'
  });
}

/**
 * Wrapper for fetch that requires school context - throws if no school selected
 */
export async function fetchWithSchoolRequired(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const schoolId = getSelectedSchoolId();
  
  if (!schoolId) {
    throw new Error('School selection required for this operation');
  }
  
  const headers = getRequestHeaders(
    (options.headers as Record<string, string>) || {}
  );
  
  return fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include'
  });
}
