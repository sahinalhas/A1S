/**
 * AI Services Feature Module (Consolidated)
 * Birleştirilmiş AI Servisleri Modülü
 * 
 * Combines:
 * - ai-assistant (chat, meeting prep, recommendations)
 * - ai-suggestions (approval-based AI suggestions)
 * - deep-analysis (comprehensive student analysis)
 */

import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { aiRateLimiter } from '../../middleware/rate-limit.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import { requireAIEnabled } from '../../middleware/ai-guard.middleware.js';
import { validateBody, validateParams } from '../../middleware/zod-validation.middleware.js';

import aiAssistantRoutes from './routes/ai-assistant.routes.js';
import sessionAnalysisRoutes from './routes/session-analysis.routes.js';
import * as meetingPrepRoutes from './routes/meeting-prep.routes.js';
import * as recommendationsRoutes from './routes/recommendations.routes.js';
import aiUtilitiesRouter from './routes/ai-utilities.routes.js';

import aiSuggestionsRoutes from './routes/ai-suggestions.routes.js';

import * as deepAnalysisRoutes from './routes/deep-analysis.routes.js';
import {
  StudentIdParamSchema,
  ClassIdParamSchema,
  DailyActionPlanRequestSchema,
  ComparativeStudentsRequestSchema,
  BulkAnalysisRequestSchema,
} from '../../../shared/validation/ai-analysis.validation.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.use('/utilities', aiUtilitiesRouter);

router.use('/suggestions', simpleRateLimit(100, 15 * 60 * 1000), aiSuggestionsRoutes);

const assistantRouter = Router();
assistantRouter.use(aiRateLimiter);
assistantRouter.use('/', aiAssistantRoutes);
assistantRouter.use('/', sessionAnalysisRoutes);
assistantRouter.post('/meeting-prep/parent', requireAIEnabled, meetingPrepRoutes.generateParentMeetingPrep);
assistantRouter.post('/meeting-prep/intervention', requireAIEnabled, meetingPrepRoutes.generateInterventionPlan);
assistantRouter.post('/meeting-prep/teacher', requireAIEnabled, meetingPrepRoutes.generateTeacherMeetingPrep);
assistantRouter.get('/recommendations/priority-students', recommendationsRoutes.getPriorityStudents);
assistantRouter.get('/recommendations/interventions', recommendationsRoutes.getInterventionRecommendations);
assistantRouter.get('/recommendations/resources', recommendationsRoutes.getResourceRecommendations);
router.use('/assistant', assistantRouter);

const analysisRouter = Router();
analysisRouter.use(aiRateLimiter);
analysisRouter.post('/batch', validateBody(BulkAnalysisRequestSchema), deepAnalysisRoutes.generateBatchAnalysis);
analysisRouter.post('/:studentId', validateParams(StudentIdParamSchema), deepAnalysisRoutes.generateAnalysis);
analysisRouter.post('/psychological/:studentId', validateParams(StudentIdParamSchema), deepAnalysisRoutes.generatePsychologicalAnalysis);
analysisRouter.post('/predictive-timeline/:studentId', validateParams(StudentIdParamSchema), deepAnalysisRoutes.generatePredictiveTimeline);
analysisRouter.post('/daily-action-plan', validateBody(DailyActionPlanRequestSchema), deepAnalysisRoutes.generateDailyActionPlan);
analysisRouter.get('/action-plan/today', deepAnalysisRoutes.getTodayActionPlan);
analysisRouter.post('/student-timeline/:studentId', validateParams(StudentIdParamSchema), deepAnalysisRoutes.generateStudentTimeline);
analysisRouter.post('/comparative-class/:classId', validateParams(ClassIdParamSchema), deepAnalysisRoutes.generateClassComparison);
analysisRouter.post('/comparative-students', validateBody(ComparativeStudentsRequestSchema), deepAnalysisRoutes.generateMultiStudentComparison);
analysisRouter.post('/comprehensive/:studentId', validateParams(StudentIdParamSchema), deepAnalysisRoutes.generateComprehensiveAnalysis);
analysisRouter.get('/stream/:studentId', deepAnalysisRoutes.streamStudentAnalysis);
analysisRouter.get('/stream/comprehensive/:studentId', deepAnalysisRoutes.streamComprehensiveAnalysis);
router.use('/analysis', analysisRouter);

export default router;
