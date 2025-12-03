/**
 * AI Analysis Input Validation Schemas
 * Zod schemas for runtime validation of AI analysis requests
 */

import { z } from 'zod';

/**
 * Single student analysis request schema
 */
export const StudentAnalysisRequestSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required').max(50),
  analysisType: z.enum(['comprehensive', 'academic', 'career', 'psychological'], {
    errorMap: () => ({ message: 'Invalid analysis type' }),
  }).optional(),
  includeRecommendations: z.boolean().optional(),
}).strict();

/**
 * Bulk student analysis request schema
 */
export const BulkAnalysisRequestSchema = z.object({
  studentIds: z.array(z.string().min(1).max(50)).min(1, 'At least one student ID required').max(100, 'Cannot analyze more than 100 students at once'),
  analysisType: z.enum(['comprehensive', 'academic', 'career', 'psychological']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
}).strict();

/**
 * Student ID param schema
 */
export const StudentIdParamSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required').max(50),
});

/**
 * Class ID param schema
 */
export const ClassIdParamSchema = z.object({
  classId: z.string().min(1, 'Class ID is required').max(50),
});

/**
 * AI recommendation request schema
 */
export const AIRecommendationRequestSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required').max(50),
  context: z.string().max(2000).optional(),
  focusAreas: z.array(z.string()).optional(),
}).strict();

/**
 * Daily action plan request schema
 */
export const DailyActionPlanRequestSchema = z.object({
  date: z.string().optional(),
  counselorName: z.string().optional(),
  forceRegenerate: z.boolean().optional(),
});

/**
 * Comparative students request schema
 */
export const ComparativeStudentsRequestSchema = z.object({
  studentIds: z.array(z.string().min(1).max(50)).min(1, 'At least one student ID required').max(100),
});

/**
 * Type inference
 */
export type StudentAnalysisRequest = z.infer<typeof StudentAnalysisRequestSchema>;
export type BulkAnalysisRequest = z.infer<typeof BulkAnalysisRequestSchema>;
export type StudentIdParam = z.infer<typeof StudentIdParamSchema>;
export type ClassIdParam = z.infer<typeof ClassIdParamSchema>;
export type AIRecommendationRequest = z.infer<typeof AIRecommendationRequestSchema>;
export type DailyActionPlanRequest = z.infer<typeof DailyActionPlanRequestSchema>;
export type ComparativeStudentsRequest = z.infer<typeof ComparativeStudentsRequestSchema>;
