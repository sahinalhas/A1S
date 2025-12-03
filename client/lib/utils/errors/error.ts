import { toast } from "sonner";
import { API_ERROR_MESSAGES } from "../../constants/messages.constants";

/**
 * Error Handling Utility
 * Standardize error handling across the application
 */

export interface ErrorConfig {
 title?: string;
 description?: string;
 showToast?: boolean;
 logToConsole?: boolean;
 context?: string;
}

/**
 * Handle API errors with standardized toast messages
 */
export function handleApiError(
 error: unknown,
 config: ErrorConfig = {}
): void {
 const {
 title = API_ERROR_MESSAGES.GENERIC.OPERATION_ERROR,
 description = API_ERROR_MESSAGES.GENERIC.OPERATION_ERROR_DESCRIPTION,
 showToast = true,
 logToConsole = true,
 context = 'API Error'
 } = config;

 const errorMessage = error instanceof Error ? error.message : String(error);

 if (logToConsole) {
 console.error(`[${context}]`, errorMessage, error);
 }

 if (showToast) {
 toast.error(title, {
 description: description
 });
 }
}

/**
 * Handle load errors with standardized messages
 */
export function handleLoadError(
 error: unknown,
 resourceName?: string
): void {
 handleApiError(error, {
 title: resourceName 
 ? `${resourceName} yüklenirken hata oluştu`
 : API_ERROR_MESSAGES.GENERIC.LOAD_ERROR,
 description: API_ERROR_MESSAGES.GENERIC.LOAD_ERROR_DESCRIPTION,
 context: 'Load Error'
 });
}

/**
 * Handle save errors with standardized messages
 */
export function handleSaveError(
 error: unknown,
 resourceName?: string
): void {
 handleApiError(error, {
 title: resourceName 
 ? `${resourceName} kaydedilemedi`
 : API_ERROR_MESSAGES.GENERIC.SAVE_ERROR,
 description: API_ERROR_MESSAGES.GENERIC.SAVE_ERROR_DESCRIPTION,
 context: 'Save Error'
 });
}

/**
 * Handle delete errors with standardized messages
 */
export function handleDeleteError(
 error: unknown,
 resourceName?: string
): void {
 handleApiError(error, {
 title: resourceName 
 ? `${resourceName} silinemedi`
 : API_ERROR_MESSAGES.GENERIC.DELETE_ERROR,
 description: API_ERROR_MESSAGES.GENERIC.DELETE_ERROR_DESCRIPTION,
 context: 'Delete Error'
 });
}

/**
 * Handle update errors with standardized messages
 */
export function handleUpdateError(
 error: unknown,
 resourceName?: string
): void {
 handleApiError(error, {
 title: resourceName 
 ? `${resourceName} güncellenemedi`
 : API_ERROR_MESSAGES.GENERIC.UPDATE_ERROR,
 description: API_ERROR_MESSAGES.GENERIC.UPDATE_ERROR_DESCRIPTION,
 context: 'Update Error'
 });
}

/**
 * Show success toast with standardized styling
 */
export function showSuccessToast(
 title: string,
 description?: string
): void {
 toast.success(title, {
 description
 });
}

/**
 * Extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
 if (error instanceof Error) {
 return error.message;
 }
 if (typeof error === 'string') {
 return error;
 }
 if (error && typeof error === 'object' && 'message' in error) {
 return String((error as { message: unknown }).message);
 }
 return API_ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
 const message = getErrorMessage(error);
 return message.toLowerCase().includes('network') || 
 message.toLowerCase().includes('fetch') ||
 message.toLowerCase().includes('connection');
}

/**
 * Safe async handler that catches errors and shows toast
 */
export function createSafeHandler<T extends any[]>(
 handler: (...args: T) => Promise<void>,
 errorConfig?: ErrorConfig
) {
 return async (...args: T) => {
 try {
 await handler(...args);
 } catch (error) {
 handleApiError(error, errorConfig);
 }
 };
}
