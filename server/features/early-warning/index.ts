import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as earlyWarningRoutes from './routes/early-warning.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.post('/analyze/:studentId', simpleRateLimit(50, 15 * 60 * 1000), earlyWarningRoutes.analyzeStudentRisk);
router.get('/risk-score/:studentId/history', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getRiskScoreHistory);
router.get('/risk-score/:studentId/latest', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getLatestRiskScore);

router.get('/alerts', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getAllAlerts);
router.get('/alerts/active', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getActiveAlerts);
router.get('/alerts/student/:studentId', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getAlertsByStudent);
router.get('/alerts/:id', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getAlertById);
router.put('/alerts/:id/status', simpleRateLimit(50, 15 * 60 * 1000), earlyWarningRoutes.updateAlertStatus);
router.put('/alerts/:id', simpleRateLimit(50, 15 * 60 * 1000), earlyWarningRoutes.updateAlert);
router.delete('/alerts/:id', simpleRateLimit(20, 15 * 60 * 1000), earlyWarningRoutes.deleteAlert);

router.get('/recommendations/active', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getActiveRecommendations);
router.get('/recommendations/student/:studentId', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getRecommendationsByStudent);
router.get('/recommendations/alert/:alertId', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getRecommendationsByAlert);
router.put('/recommendations/:id/status', simpleRateLimit(50, 15 * 60 * 1000), earlyWarningRoutes.updateRecommendationStatus);
router.put('/recommendations/:id', simpleRateLimit(50, 15 * 60 * 1000), earlyWarningRoutes.updateRecommendation);
router.delete('/recommendations/:id', simpleRateLimit(20, 15 * 60 * 1000), earlyWarningRoutes.deleteRecommendation);

router.get('/high-risk-students', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getHighRiskStudents);
router.get('/dashboard/summary', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getDashboardSummary);

export default router;
