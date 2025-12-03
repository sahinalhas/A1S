import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import { bulkOperationsRateLimiter } from '../../middleware/rate-limit.middleware.js';
import { requireSecureAuth, requireRoleSecure } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { validateBody, validateParams } from '../../middleware/zod-validation.middleware.js';
import * as studentsRoutes from './routes/students.routes.js';
import * as unifiedProfileRoutes from './routes/unified-profile.routes.js';
import * as customizationRoutes from '../study-templates/routes.js';
import {
  StudentSchema,
  BulkStudentSaveSchema,
  StudentIdParamSchema,
  AcademicRecordSchema,
  StudentDeletionBodySchema,
} from '../../../shared/validation/students.validation.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.get("/", requireRoleSecure(['counselor', 'teacher']), studentsRoutes.getStudents);
router.post("/", requireRoleSecure(['counselor']), validateBody(StudentSchema), studentsRoutes.saveStudentHandler);
router.post("/bulk", requireRoleSecure(['counselor']), validateBody(BulkStudentSaveSchema), studentsRoutes.saveStudentsHandler);
router.delete("/:id", requireRoleSecure(['counselor']), validateParams(StudentIdParamSchema), validateBody(StudentDeletionBodySchema), studentsRoutes.deleteStudentHandler);
router.get("/:id/academics", studentsRoutes.getStudentAcademics);
router.post("/academics", requireRoleSecure(['counselor', 'teacher']), validateBody(AcademicRecordSchema), studentsRoutes.addStudentAcademic);
router.get("/:id/progress", studentsRoutes.getStudentProgress);

router.get("/:id/unified-profile", validateParams(StudentIdParamSchema), unifiedProfileRoutes.getUnifiedProfile);
router.post("/:id/initialize-profiles", requireRoleSecure(['counselor']), validateParams(StudentIdParamSchema), unifiedProfileRoutes.initializeProfiles);
router.post("/:id/recalculate-scores", requireRoleSecure(['counselor']), validateParams(StudentIdParamSchema), unifiedProfileRoutes.recalculateScores);
router.get("/:id/quality-report", validateParams(StudentIdParamSchema), unifiedProfileRoutes.getQualityReport);

router.post("/:studentId/templates/:templateId/customizations", customizationRoutes.saveTemplateCustomization);
router.get("/:studentId/templates/:templateId/customizations", customizationRoutes.getTemplateCustomization);

export default router;
