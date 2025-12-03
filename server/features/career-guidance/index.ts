/**
 * Career Guidance Feature Entry Point
 * Kariyer Rehberliği Özellik Giriş Noktası
 */

import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import { careerGuidanceRoutes } from './routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.use('/', simpleRateLimit(100, 15 * 60 * 1000), careerGuidanceRoutes);

export default router;
