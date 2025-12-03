import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import guidanceTipsRoutes from './routes/guidance-tips.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);
router.use('/', guidanceTipsRoutes);

export default router;

export { startGuidanceTipsScheduler, stopGuidanceTipsScheduler } from './services/guidance-tips-scheduler.service.js';
export { guidanceTipsService } from './services/guidance-tips.service.js';
