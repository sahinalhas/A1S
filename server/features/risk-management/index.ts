/**
 * Risk Management Feature Module (Consolidated)
 * Birleştirilmiş Risk Yönetimi Modülü
 * 
 * Combines:
 * - enhanced-risk (advanced risk prediction, trend analysis)
 * - early-warning (alerts, risk scores, recommendations, interventions)
 */

import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';

import enhancedRiskRoutes from './routes/enhanced-risk.routes.js';
import * as earlyWarningRoutes from './routes/early-warning.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.use('/enhanced', simpleRateLimit(100, 15 * 60 * 1000), enhancedRiskRoutes);

router.post('/warning/analyze/:studentId', simpleRateLimit(50, 15 * 60 * 1000), earlyWarningRoutes.analyzeStudentRisk);
router.get('/warning/risk-score/:studentId/history', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getRiskScoreHistory);
router.get('/warning/risk-score/:studentId/latest', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getLatestRiskScore);

router.get('/warning/alerts', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getAllAlerts);
router.get('/warning/alerts/active', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getActiveAlerts);
router.get('/warning/alerts/student/:studentId', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getAlertsByStudent);
router.get('/warning/alerts/:id', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getAlertById);
router.put('/warning/alerts/:id/status', simpleRateLimit(50, 15 * 60 * 1000), earlyWarningRoutes.updateAlertStatus);
router.put('/warning/alerts/:id', simpleRateLimit(50, 15 * 60 * 1000), earlyWarningRoutes.updateAlert);
router.delete('/warning/alerts/:id', simpleRateLimit(20, 15 * 60 * 1000), earlyWarningRoutes.deleteAlert);

router.get('/warning/recommendations/active', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getActiveRecommendations);
router.get('/warning/recommendations/student/:studentId', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getRecommendationsByStudent);
router.get('/warning/recommendations/alert/:alertId', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getRecommendationsByAlert);
router.put('/warning/recommendations/:id/status', simpleRateLimit(50, 15 * 60 * 1000), earlyWarningRoutes.updateRecommendationStatus);
router.put('/warning/recommendations/:id', simpleRateLimit(50, 15 * 60 * 1000), earlyWarningRoutes.updateRecommendation);
router.delete('/warning/recommendations/:id', simpleRateLimit(20, 15 * 60 * 1000), earlyWarningRoutes.deleteRecommendation);

router.get('/warning/high-risk-students', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getHighRiskStudents);
router.get('/warning/dashboard/summary', simpleRateLimit(200, 15 * 60 * 1000), earlyWarningRoutes.getDashboardSummary);

export default router;
