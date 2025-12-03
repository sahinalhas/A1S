import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as studyRoutes from './routes/study.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.get("/study-assignments/:studentId", simpleRateLimit(200, 15 * 60 * 1000), studyRoutes.getStudyAssignments);
router.post("/study-assignments", simpleRateLimit(50, 15 * 60 * 1000), studyRoutes.saveStudyAssignmentHandler);
router.put("/study-assignments/:id", simpleRateLimit(50, 15 * 60 * 1000), studyRoutes.updateStudyAssignmentHandler);
router.delete("/study-assignments/:id", simpleRateLimit(50, 15 * 60 * 1000), studyRoutes.deleteStudyAssignmentHandler);

router.get("/weekly-slots", simpleRateLimit(200, 15 * 60 * 1000), studyRoutes.getAllWeeklySlotsHandler);
router.get("/weekly-slots/:studentId", simpleRateLimit(200, 15 * 60 * 1000), studyRoutes.getWeeklySlots);
router.post("/weekly-slots", simpleRateLimit(50, 15 * 60 * 1000), studyRoutes.saveWeeklySlotHandler);
router.put("/weekly-slots/:id", simpleRateLimit(50, 15 * 60 * 1000), studyRoutes.updateWeeklySlotHandler);
router.delete("/weekly-slots/:id", simpleRateLimit(50, 15 * 60 * 1000), studyRoutes.deleteWeeklySlotHandler);

// Planned topics routes - Konu bazlı plan
router.get("/planned-topics/:studentId/:weekStartDate", simpleRateLimit(200, 15 * 60 * 1000), studyRoutes.getPlannedTopicsHandler);
router.post("/planned-topics/:studentId/:weekStartDate", simpleRateLimit(50, 15 * 60 * 1000), studyRoutes.savePlannedTopicsHandler);

export default router;
