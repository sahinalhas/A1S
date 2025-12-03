/**
 * Common API Request Types
 * 
 * Type definitions for request payloads sent to the API
 */

/**
 * Pagination request parameters
 */
export interface PaginationRequest {
 page?: number;
 limit?: number;
 offset?: number;
}

/**
 * Sort request parameters
 */
export interface SortRequest {
 sortBy?: string;
 sortOrder?: 'asc' | 'desc';
}

/**
 * Filter request parameters
 */
export interface FilterRequest {
 search?: string;
 filters?: Record<string, unknown>;
}

/**
 * Common list request with pagination, sorting, and filtering
 */
export interface ListRequest extends PaginationRequest, SortRequest, FilterRequest {
 // Combines pagination, sort, and filter requests
}

/**
 * Bulk operation request
 */
export interface BulkOperationRequest<T> {
 items: T[];
 operation: 'create' | 'update' | 'delete';
}

/**
 * File upload request metadata
 */
export interface FileUploadRequest {
 file: File;
 metadata?: Record<string, unknown>;
 category?: string;
}
