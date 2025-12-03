import { z } from 'zod';

export const aiSessionAnalysisRequestSchema = z.object({
  rawNotes: z.string().min(10, 'En az 10 karakter gerekli').max(10000, 'Maksimum 10000 karakter'),
  sessionId: z.string().optional(),
  studentId: z.string().min(1, 'Geçerli bir öğrenci ID gerekli'),
  sessionType: z.enum(['individual', 'group']),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Geçerli tarih formatı gerekli'),
  entryTime: z.string().regex(/^\d{2}:\d{2}$/, 'Geçerli saat formatı: HH:MM'),
  sessionTopic: z.string().nullish()
});

export const aiSessionSummarySchema = z.object({
  professional: z.string().min(50, 'Profesyonel özet en az 50 karakter olmalı'),
  keyTopics: z.array(z.string()).min(1).max(10),
  studentQuotes: z.array(z.string()).max(5),
  outcomes: z.array(z.string()).max(5),
  importantNotes: z.array(z.string()).max(5)
});

export const aiFormSuggestionsSchema = z.object({
  emotionalState: z.enum(['sakin', 'kaygılı', 'üzgün', 'sinirli', 'mutlu', 'karışık', 'diğer']),
  physicalState: z.enum(['normal', 'yorgun', 'enerjik', 'huzursuz', 'hasta']),
  cooperationLevel: z.number().int().min(1).max(5),
  communicationQuality: z.enum(['açık', 'çekingen', 'dirençli', 'sınırlı']),
  sessionFlow: z.enum(['çok_olumlu', 'olumlu', 'nötr', 'sorunlu', 'kriz']),
  studentParticipationLevel: z.enum(['çok_aktif', 'aktif', 'pasif', 'dirençli', 'kapalı']),
  confidence: z.number().min(0).max(100),
  reasoning: z.string()
});

export const aiActionItemSchema = z.object({
  description: z.string().min(5, 'Aksiyon açıklaması en az 5 karakter olmalı'),
  priority: z.enum(['low', 'medium', 'high']),
  assignedTo: z.enum(['student', 'counselor', 'teacher', 'parent']),
  category: z.enum(['academic', 'social', 'emotional', 'behavioral', 'family']),
  dueDate: z.union([z.date(), z.string().datetime()]).optional()
});

export const aiFollowUpRecommendationSchema = z.object({
  needed: z.boolean(),
  suggestedDate: z.union([z.date(), z.string().datetime()]).optional(),
  suggestedDays: z.number().int().positive().optional(),
  reason: z.string(),
  priority: z.enum(['low', 'medium', 'high'])
});

export const aiSessionAnalysisResponseSchema = z.object({
  summary: aiSessionSummarySchema,
  formSuggestions: aiFormSuggestionsSchema,
  actionItems: z.array(aiActionItemSchema).default([]),
  followUpRecommendation: aiFollowUpRecommendationSchema,
  metadata: z.object({
    processingTime: z.number().positive(),
    tokensUsed: z.number().optional(),
    aiProvider: z.enum(['openai', 'gemini', 'ollama']),
    modelVersion: z.string()
  })
});

export type AISessionAnalysisRequest = z.infer<typeof aiSessionAnalysisRequestSchema>;
export type AISessionSummary = z.infer<typeof aiSessionSummarySchema>;
export type AIFormSuggestions = z.infer<typeof aiFormSuggestionsSchema>;
export type AIActionItem = z.infer<typeof aiActionItemSchema>;
export type AIFollowUpRecommendation = z.infer<typeof aiFollowUpRecommendationSchema>;
export type AISessionAnalysisResponse = z.infer<typeof aiSessionAnalysisResponseSchema>;
