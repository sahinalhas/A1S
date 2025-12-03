/**
 * Deep Analysis Feature Module - Consolidated AI Analysis
 * Birleştirilmiş AI Analiz Modülü
 * 
 * Tüm AI analiz endpoint'lerini tek bir modül altında toplar:
 * - Deep Analysis (kapsamlı öğrenci analizi)
 * - Psychological Analysis (psikolojik derinlik)
 * - Predictive Timeline (öngörücü risk)
 * - Daily Action Plan (günlük eylem planı)
 * - Student Timeline (öğrenci zaman çizelgesi)
 * - Comparative Analysis (karşılaştırmalı analiz)
 * - Streaming (progressive data loading)
 */

import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { aiRateLimiter } from '../../middleware/rate-limit.middleware.js';
import { validateBody, validateParams } from '../../middleware/zod-validation.middleware.js';
import * as deepAnalysisRoutes from './routes/deep-analysis.routes.js';
import {
  StudentIdParamSchema,
  ClassIdParamSchema,
  DailyActionPlanRequestSchema,
  ComparativeStudentsRequestSchema,
  BulkAnalysisRequestSchema,
} from '../../../shared/validation/ai-analysis.validation.js';

const router = Router();

// Security middleware
router.use(requireSecureAuth);
router.use(validateSchoolAccess);

// Apply AI rate limiter to all routes (10 req/min)
router.use(aiRateLimiter);

// =================== DEEP ANALYSIS CORE ===================
// Note: /batch route must come before /:studentId to avoid 'batch' being captured as studentId
router.post('/batch', validateBody(BulkAnalysisRequestSchema), deepAnalysisRoutes.generateBatchAnalysis);
router.post('/:studentId', validateParams(StudentIdParamSchema), deepAnalysisRoutes.generateAnalysis);

// =================== PSYCHOLOGICAL ANALYSIS ===================
router.post('/psychological/:studentId', validateParams(StudentIdParamSchema), deepAnalysisRoutes.generatePsychologicalAnalysis);

// =================== PREDICTIVE TIMELINE ===================
router.post('/predictive-timeline/:studentId', validateParams(StudentIdParamSchema), deepAnalysisRoutes.generatePredictiveTimeline);

// =================== DAILY ACTION PLAN ===================
router.post('/daily-action-plan', validateBody(DailyActionPlanRequestSchema), deepAnalysisRoutes.generateDailyActionPlan);
router.get('/action-plan/today', deepAnalysisRoutes.getTodayActionPlan);

// =================== STUDENT TIMELINE ===================
router.post('/student-timeline/:studentId', validateParams(StudentIdParamSchema), deepAnalysisRoutes.generateStudentTimeline);

// =================== COMPARATIVE ANALYSIS ===================
router.post('/comparative-class/:classId', validateParams(ClassIdParamSchema), deepAnalysisRoutes.generateClassComparison);
router.post('/comparative-students', validateBody(ComparativeStudentsRequestSchema), deepAnalysisRoutes.generateMultiStudentComparison);

// =================== COMPREHENSIVE ANALYSIS ===================
router.post('/comprehensive/:studentId', validateParams(StudentIdParamSchema), deepAnalysisRoutes.generateComprehensiveAnalysis);

// =================== STREAMING ENDPOINTS ===================
router.get('/stream/:studentId', deepAnalysisRoutes.streamStudentAnalysis);
router.get('/stream/comprehensive/:studentId', deepAnalysisRoutes.streamComprehensiveAnalysis);

export default router;
