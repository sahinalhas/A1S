import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import analyticsRouter from './routes/analytics.routes.js';
import bulkAIAnalysisRoutes from './routes/bulk-ai-analysis.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.use('/', analyticsRouter);
router.use('/bulk-ai', bulkAIAnalysisRoutes);

export default router;
