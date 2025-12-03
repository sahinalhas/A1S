import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import { requireSecureAuth, requireRoleSecure } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import * as examsRoutes from './routes/exams.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.get('/:studentId', simpleRateLimit(200, 15 * 60 * 1000), examsRoutes.getExamResultsByStudent);
router.get('/:studentId/type/:examType', simpleRateLimit(200, 15 * 60 * 1000), examsRoutes.getExamResultsByType);
router.get('/:studentId/latest', simpleRateLimit(200, 15 * 60 * 1000), examsRoutes.getLatestExamResult);
router.get('/:studentId/progress/:examType', simpleRateLimit(200, 15 * 60 * 1000), examsRoutes.getExamProgressAnalysis);
router.post('/', requireRoleSecure(['counselor', 'teacher']), simpleRateLimit(50, 15 * 60 * 1000), examsRoutes.createExamResult);
router.put('/:id', requireRoleSecure(['counselor', 'teacher']), simpleRateLimit(50, 15 * 60 * 1000), examsRoutes.updateExamResult);
router.delete('/:id', requireRoleSecure(['counselor']), simpleRateLimit(20, 15 * 60 * 1000), examsRoutes.deleteExamResult);

export default router;
