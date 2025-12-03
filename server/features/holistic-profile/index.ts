import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import holisticProfileRoutes from './routes/holistic-profile.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.use('/', holisticProfileRoutes);

export default router;
