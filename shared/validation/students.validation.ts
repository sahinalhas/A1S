/**
 * Student Input Validation Schemas
 * Zod schemas for runtime validation of student-related requests
 */

import { z } from 'zod';

/**
 * Student creation/update schema
 * Uses English field names to match frontend Student interface
 */
export const StudentSchema = z.object({
  id: z.string().min(1, 'Student ID is required').max(50, 'Student ID too long'),
  name: z.string().min(1, 'First name is required').max(100),
  surname: z.string().min(1, 'Last name is required').max(100),
  class: z.string().max(20).optional(),
  studentNumber: z.string().max(50).optional(),
  gender: z.enum(['K', 'E']).optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().max(100).optional(),
  tcIdentityNo: z.string()
    .regex(/^\d{11}$/, 'TC Identity No must be 11 digits')
    .optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  province: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  parentName: z.string().max(200).optional(),
  parentContact: z.string().max(20).optional(),
  emergencyContact: z.string().max(200).optional(),
  emergencyPhone: z.string().max(20).optional(),
  motherOccupation: z.string().max(100).optional(),
  fatherOccupation: z.string().max(100).optional(),
  numberOfSiblings: z.number().int().min(0).optional(),
  enrollmentDate: z.string(),
  status: z.enum(['active', 'inactive', 'graduated']).optional(),
  avatar: z.string().optional(),
  notes: z.string().optional(),
  risk: z.enum(['Düşük', 'Orta', 'Yüksek']).optional(),
  counselor: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  healthNote: z.string().max(500).optional(),
  bloodType: z.string().max(10).optional(),
  languageSkills: z.string().max(500).optional(),
  hobbiesDetailed: z.string().max(500).optional(),
  extracurricularActivities: z.string().max(500).optional(),
  studentExpectations: z.string().max(1000).optional(),
  familyExpectations: z.string().max(1000).optional(),
}).strict();

/**
 * Bulk student save schema
 */
export const BulkStudentSaveSchema = z.array(StudentSchema).min(1, 'At least one student required');

/**
 * Student ID param schema
 */
export const StudentIdParamSchema = z.object({
  id: z.string().min(1).max(50),
});

/**
 * Academic record schema
 */
export const AcademicRecordSchema = z.object({
  studentId: z.string().min(1).max(50),
  semester: z.string().min(1).max(20),
  subject: z.string().max(100).optional(),
  grade: z.number().min(0).max(100).optional(),
  notes: z.string().max(500).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
}).strict();

/**
 * Student deletion body schema
 */
export const StudentDeletionBodySchema = z.object({
  confirmationName: z.string().min(1, 'Confirmation name is required'),
}).strict();

/**
 * Type inference
 */
export type StudentInput = z.infer<typeof StudentSchema>;
export type BulkStudentSaveInput = z.infer<typeof BulkStudentSaveSchema>;
export type StudentIdParam = z.infer<typeof StudentIdParamSchema>;
export type AcademicRecordInput = z.infer<typeof AcademicRecordSchema>;
export type StudentDeletionBody = z.infer<typeof StudentDeletionBodySchema>;
