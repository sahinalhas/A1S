/**
 * API Client - Modern Architecture
 * 
 * Centralized API client with organized structure:
 * - core/ → API client, interceptors, error handling
 * - endpoints/ → API endpoint functions
 * - hooks/ → React Query hooks (queries & mutations)
 * - types/ → API request/response types
 */

// Core API infrastructure
export * from './core';

// API endpoints
export * from './endpoints';

// React Query hooks
export * from './hooks';

// API types
export * from './types';
