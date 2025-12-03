/**
 * AI Assistant Feature Module
 * AI Rehber Öğretmen Asistan Modülü
 */

import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { aiRateLimiter } from '../../middleware/rate-limit.middleware.js';
import { requireAIEnabled } from '../../middleware/ai-guard.middleware.js';
import aiAssistantRoutes from './routes/ai-assistant.routes.js';
import sessionAnalysisRoutes from './routes/session-analysis.routes.js';
import * as meetingPrepRoutes from './routes/meeting-prep.routes.js';
import * as recommendationsRoutes from './routes/recommendations.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

// Apply AI rate limiter to all AI assistant routes (10 req/min)
router.use(aiRateLimiter);

// Main AI assistant routes
router.use('/', aiAssistantRoutes);

// Session analysis routes
router.use('/', sessionAnalysisRoutes);

// Meeting preparation routes (AI-powered)
router.post('/meeting-prep/parent', requireAIEnabled, meetingPrepRoutes.generateParentMeetingPrep);
router.post('/meeting-prep/intervention', requireAIEnabled, meetingPrepRoutes.generateInterventionPlan);
router.post('/meeting-prep/teacher', requireAIEnabled, meetingPrepRoutes.generateTeacherMeetingPrep);

// Smart recommendations routes
router.get('/recommendations/priority-students', recommendationsRoutes.getPriorityStudents);
router.get('/recommendations/interventions', recommendationsRoutes.getInterventionRecommendations);
router.get('/recommendations/resources', recommendationsRoutes.getResourceRecommendations);

export default router;
