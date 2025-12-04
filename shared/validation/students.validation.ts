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
  // Required fields
  id: z.string().min(1, 'Student ID is required').max(50, 'Student ID too long'),
  name: z.string().min(1, 'First name is required').max(100),
  surname: z.string().min(1, 'Last name is required').max(100),
  enrollmentDate: z.string(),

  // Education Information
  class: z.string().max(20).optional().nullable(),
  studentNumber: z.string().max(50).optional().nullable(),
  gender: z.enum(['K', 'E']).optional().nullable(),
  birthDate: z.string().optional().nullable(),
  birthPlace: z.string().max(100).optional().nullable(),
  tcIdentityNo: z.string()
    .regex(/^\d{11}$/, 'TC Identity No must be 11 digits')
    .optional()
    .nullable(),

  // Contact Information
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().max(500).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
  district: z.string().max(100).optional().nullable(),

  // Mother Information (Anne Bilgileri)
  motherName: z.string().max(200).optional().nullable(),
  motherEducation: z.string().max(100).optional().nullable(),
  motherOccupation: z.string().max(100).optional().nullable(),
  motherEmail: z.string().email().optional().nullable().or(z.literal('')),
  motherPhone: z.string().max(20).optional().nullable(),
  motherVitalStatus: z.enum(['Sağ', 'Vefat Etmiş']).optional().nullable(),
  motherLivingStatus: z.enum(['Birlikte', 'Ayrı']).optional().nullable(),

  // Father Information (Baba Bilgileri)
  fatherName: z.string().max(200).optional().nullable(),
  fatherEducation: z.string().max(100).optional().nullable(),
  fatherOccupation: z.string().max(100).optional().nullable(),
  fatherEmail: z.string().email().optional().nullable().or(z.literal('')),
  fatherPhone: z.string().max(20).optional().nullable(),
  fatherVitalStatus: z.enum(['Sağ', 'Vefat Etmiş']).optional().nullable(),
  fatherLivingStatus: z.enum(['Birlikte', 'Ayrı']).optional().nullable(),

  // Guardian Information (Vasi/Acil İletişim)
  guardianName: z.string().max(200).optional().nullable(),
  guardianRelation: z.string().max(100).optional().nullable(),
  guardianPhone: z.string().max(20).optional().nullable(),
  guardianEmail: z.string().email().optional().nullable().or(z.literal('')),

  // Legacy Parent Fields
  parentName: z.string().max(200).optional().nullable(),
  parentContact: z.string().max(20).optional().nullable(),
  emergencyContact: z.string().max(200).optional().nullable(),
  emergencyPhone: z.string().max(20).optional().nullable(),

  // Family Structure (Aile Yapısı)
  numberOfSiblings: z.number().int().min(0).optional().nullable(),

  // Living Situation (Yaşam Durumu)
  livingWith: z.string().max(100).optional().nullable(),
  homeRentalStatus: z.string().max(100).optional().nullable(),
  homeHeatingType: z.string().max(100).optional().nullable(),
  transportationToSchool: z.string().max(100).optional().nullable(),
  studentWorkStatus: z.string().max(100).optional().nullable(),

  // System Information
  status: z.enum(['active', 'inactive', 'graduated']).optional().nullable(),
  avatar: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  schoolId: z.string().max(50).optional().nullable(),

  // Assessment Information
  risk: z.enum(['Düşük', 'Orta', 'Yüksek']).optional().nullable(),
  counselor: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),

  // General Information
  interests: z.array(z.string()).optional().nullable(),
  healthNote: z.string().max(500).optional().nullable(),
  bloodType: z.string().max(10).optional().nullable(),

  // Additional Profile Information
  languageSkills: z.string().max(500).optional().nullable(),
  hobbiesDetailed: z.string().max(500).optional().nullable(),
  extracurricularActivities: z.string().max(500).optional().nullable(),
  studentExpectations: z.string().max(1000).optional().nullable(),
  familyExpectations: z.string().max(1000).optional().nullable(),

  // Legacy/Compatibility fields
  primaryLearningStyle: z.string().max(100).optional().nullable(),
  englishScore: z.number().optional().nullable(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
}).passthrough(); // Allow additional unknown fields

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
}).passthrough();

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
