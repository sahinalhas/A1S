/**
 * Reports Feature Module (Consolidated)
 * Birleştirilmiş Raporlama Modülü
 * 
 * Combines:
 * - reports (auto reports - progress, RAM, BEP)
 * - advanced-reports (school stats, class comparisons, trends, exports)
 */

import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import autoReportsRoutes from './routes/auto-reports.routes.js';
import advancedReportsRoutes from '../advanced-reports/routes/advanced-reports.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.use('/', simpleRateLimit(20, 15 * 60 * 1000), autoReportsRoutes);

router.use('/advanced', advancedReportsRoutes);

export default router;
