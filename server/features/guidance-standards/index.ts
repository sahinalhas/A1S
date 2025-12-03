import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import guidanceStandardsRoutes from './routes/guidance-standards.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);
router.use('/', guidanceStandardsRoutes);

export default router;
