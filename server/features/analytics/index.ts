/**
 * Analytics Feature Module (Consolidated)
 * Birleştirilmiş Analitik Modülü
 * 
 * Combines:
 * - analytics (basic analytics, reports overview)
 * - advanced-analytics (dashboard, AI reports)
 */

import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import analyticsRouter from './routes/analytics.routes.js';
import bulkAIAnalysisRoutes from './routes/bulk-ai-analysis.routes.js';
import advancedAnalyticsRoutes from './routes/advanced-analytics.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.use('/', analyticsRouter);
router.use('/bulk-ai', bulkAIAnalysisRoutes);

router.use('/advanced', simpleRateLimit(100, 15 * 60 * 1000), advancedAnalyticsRoutes);

export default router;
