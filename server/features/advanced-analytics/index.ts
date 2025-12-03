import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import advancedAnalyticsRoutes from './routes/advanced-analytics.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.use('/', simpleRateLimit(100, 15 * 60 * 1000), advancedAnalyticsRoutes);

export default router;
