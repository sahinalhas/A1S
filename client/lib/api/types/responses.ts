/**
 * Common API Response Types
 * 
 * Type definitions for responses received from the API
 */

/**
 * Standard success response wrapper
 */
export interface SuccessResponse<T = unknown> {
 success: true;
 data: T;
 message?: string;
}

/**
 * Standard error response
 */
export interface ErrorResponse {
 success: false;
 error: string;
 message: string;
 details?: Record<string, string> | Array<{ field: string; message: string }>;
 code?: string;
 statusCode?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponseData<T> {
 items: T[];
 total: number;
 page: number;
 limit: number;
 totalPages: number;
 hasMore: boolean;
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse {
 success: boolean;
 processed: number;
 failed: number;
 errors?: Array<{
 index: number;
 error: string;
 }>;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
 success: boolean;
 fileId: string;
 url: string;
 filename: string;
 size: number;
 mimeType: string;
}

/**
 * Statistics response
 */
export interface StatsResponse {
 [key: string]: number | string | boolean | null;
}
