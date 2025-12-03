import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as meetingNotesRoutes from './routes/meeting-notes.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.get("/:studentId", simpleRateLimit(200, 15 * 60 * 1000), meetingNotesRoutes.getMeetingNotes);
router.post("/", simpleRateLimit(50, 15 * 60 * 1000), meetingNotesRoutes.saveMeetingNoteHandler);
router.put("/:id", simpleRateLimit(50, 15 * 60 * 1000), meetingNotesRoutes.updateMeetingNoteHandler);
router.delete("/:id", simpleRateLimit(50, 15 * 60 * 1000), meetingNotesRoutes.deleteMeetingNoteHandler);

export default router;
