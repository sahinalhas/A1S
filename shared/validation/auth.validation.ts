/**
 * Authentication Input Validation Schemas
 * Zod schemas for runtime validation of auth-related requests
 */

import { z } from 'zod';

/**
 * Login request schema
 */
export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
}).strict();

/**
 * Register request schema
 */
export const RegisterRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['counselor', 'teacher', 'student', 'parent']),
  institution: z.string().min(1, 'Institution is required').max(200),
}).strict();

/**
 * Type inference
 */
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
