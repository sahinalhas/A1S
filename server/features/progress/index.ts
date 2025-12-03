import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import { requireSecureAuth, requireRoleSecure } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import * as progressRoutes from './routes/progress.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.get("/", requireRoleSecure(['counselor', 'teacher']), simpleRateLimit(200, 15 * 60 * 1000), progressRoutes.getAllProgressHandler);
router.get("/:studentId", simpleRateLimit(200, 15 * 60 * 1000), progressRoutes.getProgress);
router.post("/", simpleRateLimit(50, 15 * 60 * 1000), progressRoutes.saveProgressHandler);

router.get("/academic-goals/:studentId", simpleRateLimit(200, 15 * 60 * 1000), progressRoutes.getAcademicGoals);
router.post("/academic-goals", requireRoleSecure(['counselor', 'teacher']), simpleRateLimit(50, 15 * 60 * 1000), progressRoutes.saveAcademicGoalsHandler);

export default router;
