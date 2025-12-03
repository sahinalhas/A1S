/**
 * API Contracts
 * Merkezi API Request/Response Type Tanımları
 * 
 * Bu dosya client ve server arasında tip güvenliğini sağlar.
 * Tüm API endpoint'leri için contract tanımlamaları içerir.
 */

/**
 * ============================================================================
 * GENERIC API RESPONSE TYPES
 * ============================================================================
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
  timestamp?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: ApiErrorCode;
  details?: ValidationError[] | Record<string, string>;
  statusCode?: number;
  timestamp?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * ============================================================================
 * PAGINATION TYPES
 * ============================================================================
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedData<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaginatedResponse<T> extends ApiSuccessResponse<PaginatedData<T>> {
  data: PaginatedData<T>;
}

/**
 * ============================================================================
 * ERROR TYPES
 * ============================================================================
 */

export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ApiError extends Error {
  code: ApiErrorCode;
  statusCode?: number;
  details?: ValidationError[] | Record<string, string>;
}

/**
 * ============================================================================
 * COMMON REQUEST TYPES
 * ============================================================================
 */

export interface BulkOperationRequest<T> {
  items: T[];
  validate?: boolean;
  skipErrors?: boolean;
}

export interface BulkOperationResponse<T> {
  success: number;
  failed: number;
  total: number;
  results: Array<{
    item: T;
    success: boolean;
    error?: string;
  }>;
}

export interface FilterParams {
  search?: string;
  filters?: Record<string, unknown>;
  dateRange?: {
    from?: string;
    to?: string;
  };
}

export interface ExportRequest {
  format: 'excel' | 'pdf' | 'csv';
  filters?: FilterParams;
  columns?: string[];
  includeHeaders?: boolean;
}

/**
 * ============================================================================
 * TYPE GUARDS
 * ============================================================================
 */

export function isApiSuccessResponse<T>(
  response: unknown
): response is ApiSuccessResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    (response as ApiResponse<T>).success === true
  );
}

export function isApiErrorResponse(
  response: unknown
): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    (response as ApiResponse).success === false
  );
}

export function isPaginatedResponse<T>(
  response: unknown
): response is PaginatedResponse<T> {
  return (
    isApiSuccessResponse(response) &&
    typeof response.data === 'object' &&
    response.data !== null &&
    'items' in response.data &&
    'pagination' in response.data
  );
}

/**
 * ============================================================================
 * UTILITY TYPES
 * ============================================================================
 */

export type CreateDTO<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
export type UpdateDTO<T> = Partial<CreateDTO<T>>;
export type ResponseDTO<T> = T;

export interface TimestampFields {
  created_at: string;
  updated_at: string;
}

export interface SoftDeleteFields extends TimestampFields {
  deleted_at?: string;
  is_deleted?: boolean;
}

export interface AuditFields extends TimestampFields {
  created_by?: string;
  updated_by?: string;
}

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 */

export function createSuccessResponse<T>(
  data?: T,
  message?: string
): ApiSuccessResponse<T> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    timestamp: new Date().toISOString(),
  };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  if (message) {
    response.message = message;
  }
  
  return response;
}

export function createErrorResponse(
  error: string,
  code: ApiErrorCode = ApiErrorCode.INTERNAL_ERROR,
  details?: ValidationError[] | Record<string, string>
): ApiErrorResponse {
  return {
    success: false,
    error,
    code,
    details,
    timestamp: new Date().toISOString(),
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  totalItems: number,
  message?: string
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    success: true,
    data: {
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
    message,
    timestamp: new Date().toISOString(),
  };
}
