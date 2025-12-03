/**
 * Core API Infrastructure
 * 
 * Centralized exports for API client, interceptors, and error handling
 */

export { apiClient, createApiHandler, safeFetch } from './client';
export type { HttpMethod, ApiRequestConfig, ApiResponse } from './client';

export {
 InterceptorManager,
 createDefaultErrorInterceptor,
 createDefaultSuccessInterceptor,
} from './interceptors';
export type {
 RequestInterceptor,
 ResponseInterceptor,
 ErrorInterceptor,
 ToastConfig,
} from './interceptors';

export {
 createApiError,
 parseApiError,
 handleNetworkError,
 showErrorToast,
 createSafeApiCall,
 retryApiCall,
} from './error-handler';
