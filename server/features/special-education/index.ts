import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as specialEducationRoutes from './routes/special-education.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.get('/:studentId', simpleRateLimit(200, 15 * 60 * 1000), specialEducationRoutes.getSpecialEducationByStudent);
router.post('/', simpleRateLimit(50, 15 * 60 * 1000), specialEducationRoutes.createSpecialEducation);
router.put('/:id', simpleRateLimit(50, 15 * 60 * 1000), specialEducationRoutes.updateSpecialEducation);
router.delete('/:id', simpleRateLimit(20, 15 * 60 * 1000), specialEducationRoutes.deleteSpecialEducation);

export default router;
