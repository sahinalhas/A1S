/**
 * API Types - Centralized Type Definitions
 * 
 * This module provides all API-related type definitions including:
 * - Request/Response types
 * - Error types
 * - Shared API contracts
 */

// Re-export common request/response types
export * from './requests';
export * from './responses';

// Re-export shared API contracts for backward compatibility
export type {
 ApiSuccessResponse,
 ApiErrorResponse,
 ApiResponse,
 ValidationError,
 ApiError,
 PaginatedResponse,
 PaginatedData,
 PaginationParams,
} from '@shared/types/api-contracts';

export {
 ApiErrorCode,
 isApiSuccessResponse,
 isApiErrorResponse,
 createSuccessResponse,
 createErrorResponse,
 createPaginatedResponse,
} from '@shared/types/api-contracts';

/**
 * User API Types
 */
export interface UserLoginRequest {
 email: string;
 password: string;
}

export interface UserRegisterRequest {
 name: string;
 email: string;
 password: string;
 role: 'counselor' | 'teacher' | 'student' | 'parent';
}

export interface UserPublic {
 id: string;
 name: string;
 email: string;
 role: 'counselor' | 'teacher' | 'student' | 'parent';
 permissions: string[];
}

export interface UserLoginResponse {
 success: true;
 data?: UserPublic;
 user?: UserPublic;
 message?: string;
}

/**
 * Backup API Types
 */
export interface BackupMetadata {
 id: string;
 filename: string;
 createdAt: string;
 createdBy: string;
 size: number;
 type: 'manual' | 'automatic';
 compressed: boolean;
 tables: string[];
 status: 'pending' | 'completed' | 'failed';
 error?: string;
}

/**
 * Analytics API Types
 */
export interface AnalyticsOverview {
 totalStudents: number;
 activeInterventions: number;
 upcomingSessions: number;
 recentAlerts: number;
}
