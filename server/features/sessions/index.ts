import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import { validateBody, validateParams } from '../../middleware/zod-validation.middleware.js';
import * as sessionsRoutes from './routes/sessions.routes.js';
import {
  SessionSchema,
  StudentIdParamSchema,
} from '../../../shared/validation/sessions.validation.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.get('/:studentId', validateParams(StudentIdParamSchema), simpleRateLimit(200, 15 * 60 * 1000), sessionsRoutes.getStudySessions);
router.post('/', validateBody(SessionSchema), simpleRateLimit(50, 15 * 60 * 1000), sessionsRoutes.saveStudySession);

export default router;
