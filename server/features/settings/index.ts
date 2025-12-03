import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import { requireSecureAuth, requireRoleSecure } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import * as settingsRoutes from './routes/settings.routes.js';

const router = Router();

router.get("/", simpleRateLimit(200, 15 * 60 * 1000), settingsRoutes.getSettings);
router.post("/", requireSecureAuth, validateSchoolAccess, requireRoleSecure(['counselor']), simpleRateLimit(30, 15 * 60 * 1000), settingsRoutes.saveSettingsHandler);
router.put("/", requireSecureAuth, validateSchoolAccess, requireRoleSecure(['counselor']), simpleRateLimit(30, 15 * 60 * 1000), settingsRoutes.saveSettingsHandler);
router.post("/ai-enabled", requireSecureAuth, validateSchoolAccess, requireRoleSecure(['counselor']), simpleRateLimit(30, 15 * 60 * 1000), settingsRoutes.setAIEnabled);

export default router;
