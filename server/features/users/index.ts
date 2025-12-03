import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import { authRateLimiter } from '../../middleware/rate-limit.middleware.js';
import { requireSecureAuth, requireRoleSecure } from '../../middleware/auth-secure.middleware.js';
import * as usersRoutes from './routes/users.routes.js';

const router = Router();

router.post('/login', authRateLimiter, usersRoutes.login);
router.post('/logout', requireSecureAuth, authRateLimiter, usersRoutes.logout);
router.get('/current', requireSecureAuth, authRateLimiter, usersRoutes.getCurrentUser);
router.post('/', simpleRateLimit(10, 60 * 60 * 1000), usersRoutes.createUser);
router.get('/', requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(100, 15 * 60 * 1000), usersRoutes.getAllUsers);
router.get('/count', requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(100, 15 * 60 * 1000), usersRoutes.getUsersCount);
router.get('/:id', requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(100, 15 * 60 * 1000), usersRoutes.getUserById);
router.put('/:id', requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(50, 15 * 60 * 1000), usersRoutes.updateUser);
router.put('/:id/password', requireSecureAuth, simpleRateLimit(10, 60 * 60 * 1000), usersRoutes.updateUserPassword);
router.delete('/:id', requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(10, 60 * 60 * 1000), usersRoutes.deactivateUser);

export default router;
