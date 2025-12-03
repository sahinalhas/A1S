/**
 * Session Input Validation Schemas
 * Zod schemas for runtime validation of counseling session requests
 */

import { z } from 'zod';

/**
 * Session ID param schema
 */
export const SessionIdParamSchema = z.object({
  id: z.string().min(1, 'Session ID is required').max(50),
});

/**
 * Student ID param schema
 */
export const StudentIdParamSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required').max(50),
});

/**
 * Session creation/update schema
 */
export const SessionSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required').max(50),
  date: z.string().min(1, 'Date is required'),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute').max(480, 'Duration cannot exceed 8 hours').optional(),
  type: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  actionItems: z.string().max(1000).optional(),
  followUpDate: z.string().optional(),
  topics: z.array(z.string()).optional(),
  aiSummary: z.string().max(2000).optional(),
}).strict();

/**
 * Session streaming body schema
 */
export const SessionStreamingBodySchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required').max(50),
  message: z.string().min(1, 'Message is required').max(5000),
}).strict();

/**
 * Type inference
 */
export type SessionIdParam = z.infer<typeof SessionIdParamSchema>;
export type StudentIdParam = z.infer<typeof StudentIdParamSchema>;
export type SessionInput = z.infer<typeof SessionSchema>;
export type SessionStreamingBody = z.infer<typeof SessionStreamingBodySchema>;
