/**
 * Student Profile Feature Module (Consolidated)
 * Birleştirilmiş Öğrenci Profili Modülü
 * 
 * Combines:
 * - standardized-profile (academic, social-emotional, talents, health, interventions)
 * - holistic-profile (strengths, social relations, interests, future vision, SEL, socioeconomic)
 */

import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';

import standardizedProfileRouter from './routes/standardized-profile.routes.js';
import holisticProfileRouter from './routes/holistic-profile.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.use('/standardized', simpleRateLimit(200, 15 * 60 * 1000), standardizedProfileRouter);

router.use('/holistic', simpleRateLimit(200, 15 * 60 * 1000), holisticProfileRouter);

export default router;
