import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as subjectsRoutes from './routes/subjects.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.get("/", simpleRateLimit(200, 15 * 60 * 1000), subjectsRoutes.getSubjects);
router.post("/", simpleRateLimit(50, 15 * 60 * 1000), subjectsRoutes.saveSubjectsHandler);
router.get("/topics", simpleRateLimit(200, 15 * 60 * 1000), subjectsRoutes.getTopics);
router.get("/:id/topics", simpleRateLimit(200, 15 * 60 * 1000), subjectsRoutes.getTopicsBySubjectId);
router.post("/topics", simpleRateLimit(50, 15 * 60 * 1000), subjectsRoutes.saveTopicsHandler);
router.post("/reset", simpleRateLimit(10, 15 * 60 * 1000), subjectsRoutes.resetToDefaultsHandler);

export default router;
