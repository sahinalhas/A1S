/**
 * Enhanced API Error Handling Utility
 * Provides comprehensive error handling with type safety
 */

import { toast } from 'sonner';
import { ApiError, ApiErrorCode, ApiErrorResponse, isApiErrorResponse, ValidationError } from '../../types/api-types';
import { API_ERROR_MESSAGES } from '../../constants/messages.constants';

/**
 * Create a typed API error
 */
export function createApiError(
 message: string,
 code: ApiErrorCode = ApiErrorCode.INTERNAL_ERROR,
 statusCode?: number,
 details?: Record<string, string> | ValidationError[]
): ApiError {
 const error = new Error(message) as ApiError;
 error.code = code;
 error.statusCode = statusCode;
 error.details = details;
 return error;
}

/**
 * Parse API error response
 */
export function parseApiError(response: Response, data: unknown): ApiError {
 const statusCode = response.status;
 
 // Handle different status codes
 if (statusCode === 400) {
 const errorResponse = data as ApiErrorResponse;
 return createApiError(
 errorResponse.error || errorResponse.message || 'Geçersiz istek',
 ApiErrorCode.VALIDATION_ERROR,
 statusCode,
 errorResponse.details
 );
 }
 
 if (statusCode === 401) {
 return createApiError(
 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
 ApiErrorCode.AUTHENTICATION_ERROR,
 statusCode
 );
 }
 
 if (statusCode === 403) {
 return createApiError(
 'Bu işlem için yetkiniz yok.',
 ApiErrorCode.AUTHORIZATION_ERROR,
 statusCode
 );
 }
 
 if (statusCode === 404) {
 return createApiError(
 'İstenen kaynak bulunamadı.',
 ApiErrorCode.NOT_FOUND,
 statusCode
 );
 }
 
 if (statusCode === 409) {
 const errorResponse = data as ApiErrorResponse;
 return createApiError(
 errorResponse.error || errorResponse.message || 'Çakışma hatası',
 ApiErrorCode.CONFLICT,
 statusCode
 );
 }
 
 if (statusCode >= 500) {
 return createApiError(
 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
 ApiErrorCode.INTERNAL_ERROR,
 statusCode
 );
 }
 
 // Generic error
 const errorResponse = data as ApiErrorResponse;
 return createApiError(
 errorResponse.error || errorResponse.message || 'Beklenmeyen bir hata oluştu',
 ApiErrorCode.INTERNAL_ERROR,
 statusCode
 );
}

/**
 * Handle network errors
 */
export function handleNetworkError(error: Error): ApiError {
 if (error instanceof Error && error.name === 'AbortError') {
 return createApiError(
 'İstek iptal edildi.',
 ApiErrorCode.TIMEOUT_ERROR
 );
 }
 
 if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('Network'))) {
 return createApiError(
 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.',
 ApiErrorCode.NETWORK_ERROR
 );
 }
 
 return createApiError(
 error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu',
 ApiErrorCode.INTERNAL_ERROR
 );
}

/**
 * Display error toast with proper formatting
 */
export function showErrorToast(error: ApiError | Error): void {
 if ('code' in error && error.code) {
 const apiError = error as ApiError;
 
 // Special handling for validation errors
 if (apiError.code === ApiErrorCode.VALIDATION_ERROR && apiError.details) {
 const validationMessages = Object.values(apiError.details).join('\n');
 toast.error('Doğrulama Hatası', {
 description: validationMessages
 });
 return;
 }
 
 // Show error with code-specific styling
 toast.error(apiError.message, {
 description: apiError.code !== ApiErrorCode.INTERNAL_ERROR 
 ? `Hata Kodu: ${apiError.code}` 
 : undefined
 });
 } else {
 toast.error(error instanceof Error ? error instanceof Error ? error.message : String(error) : API_ERROR_MESSAGES.GENERIC.OPERATION_ERROR);
 }
}

/**
 * Create a safe API call wrapper with enhanced error handling
 */
export function createSafeApiCall<T, TArgs extends unknown[]>(
 apiCall: (...args: TArgs) => Promise<T>,
 options: {
 errorMessage?: string;
 showToast?: boolean;
 onError?: (error: ApiError) => void;
 } = {}
): (...args: TArgs) => Promise<T | null> {
 return async (...args: TArgs): Promise<T | null> => {
 try {
 return await apiCall(...args);
 } catch (error) {
 const apiError = error instanceof Error && 'code' in error
 ? error as ApiError
 : handleNetworkError(error as Error);
 
 if (options.showToast !== false) {
 if (options.errorMessage) {
 toast.error(options.errorMessage);
 } else {
 showErrorToast(apiError);
 }
 }
 
 if (options.onError) {
 options.onError(apiError);
 }
 
 console.error('API Error:', apiError);
 return null;
 }
 };
}

/**
 * Enhanced fetch with error handling
 */
export async function safeFetch<T = unknown>(
 url: string,
 options?: RequestInit
): Promise<T> {
 try {
 const response = await fetch(url, options);
 
 // Parse response body
 const contentType = response.headers.get('content-type');
 const data = contentType?.includes('application/json')
 ? await response.json()
 : await response.text();
 
 // Handle error responses
 if (!response.ok) {
 throw parseApiError(response, data);
 }
 
 // Check for API error format
 if (isApiErrorResponse(data)) {
 throw createApiError(
 data.error || data.message || 'API error',
 ApiErrorCode.INTERNAL_ERROR,
 response.status,
 data.details
 );
 }
 
 return data as T;
 } catch (error) {
 if (error instanceof Error && 'code' in error) {
 throw error; // Already an ApiError
 }
 throw handleNetworkError(error as Error);
 }
}

/**
 * Retry logic for failed requests
 */
export async function retryApiCall<T>(
 apiCall: () => Promise<T>,
 options: {
 maxRetries?: number;
 retryDelay?: number;
 shouldRetry?: (error: ApiError) => boolean;
 } = {}
): Promise<T> {
 const { maxRetries = 3, retryDelay = 1000, shouldRetry } = options;
 
 let lastError: ApiError | null = null;
 
 for (let attempt = 0; attempt <= maxRetries; attempt++) {
 try {
 return await apiCall();
 } catch (error) {
 lastError = error instanceof Error && 'code' in error
 ? error as ApiError
 : handleNetworkError(error as Error);
 
 // Check if we should retry
 const canRetry = shouldRetry
 ? shouldRetry(lastError)
 : lastError.code === ApiErrorCode.NETWORK_ERROR || lastError.code === ApiErrorCode.TIMEOUT_ERROR;
 
 if (!canRetry || attempt === maxRetries) {
 throw lastError;
 }
 
 // Wait before retrying
 await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
 }
 }
 
 throw lastError!;
}
