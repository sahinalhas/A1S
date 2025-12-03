import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { aiRateLimiter } from '../../middleware/rate-limit.middleware.js';
import * as dailyInsightsRoutes from './routes/daily-insights.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

// Apply AI rate limiter to all daily insights routes (10 req/min)
router.use(aiRateLimiter);

// Daily insights endpoints
router.get('/today', dailyInsightsRoutes.getTodayInsights);
router.post('/generate', dailyInsightsRoutes.generateInsights);
router.get('/history', dailyInsightsRoutes.getInsightsHistory);
router.get('/stats', dailyInsightsRoutes.getDailyStats);

// Student status
router.get('/student/:studentId', dailyInsightsRoutes.getStudentStatus);

// Alerts
router.get('/alerts', dailyInsightsRoutes.getAlerts);
router.put('/alerts/:id/status', dailyInsightsRoutes.updateAlertStatus);
router.put('/alerts/:id/assign', dailyInsightsRoutes.assignAlert);

export default router;
