import { Router } from 'express';
import { requireSecureAuth, requireRoleSecure } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import { exportRateLimiter, bulkOperationsRateLimiter } from '../../middleware/rate-limit.middleware.js';
import * as routes from './routes/exam-management.routes.js';
import * as legacyRoutes from './routes/legacy-exams.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

router.get('/legacy/:studentId', simpleRateLimit(200, 15 * 60 * 1000), legacyRoutes.getExamResultsByStudent);
router.get('/legacy/:studentId/type/:examType', simpleRateLimit(200, 15 * 60 * 1000), legacyRoutes.getExamResultsByType);
router.get('/legacy/:studentId/latest', simpleRateLimit(200, 15 * 60 * 1000), legacyRoutes.getLatestExamResult);
router.get('/legacy/:studentId/progress/:examType', simpleRateLimit(200, 15 * 60 * 1000), legacyRoutes.getExamProgressAnalysis);
router.post('/legacy', requireRoleSecure(['counselor', 'teacher']), simpleRateLimit(50, 15 * 60 * 1000), legacyRoutes.createExamResult);
router.put('/legacy/:id', requireRoleSecure(['counselor', 'teacher']), simpleRateLimit(50, 15 * 60 * 1000), legacyRoutes.updateExamResult);
router.delete('/legacy/:id', requireRoleSecure(['counselor']), simpleRateLimit(20, 15 * 60 * 1000), legacyRoutes.deleteExamResult);

router.get('/types', routes.getExamTypes);
router.get('/types/:typeId/subjects', routes.getSubjectsByType);

router.get('/sessions', routes.getAllExamSessions);
router.get('/sessions/:id', routes.getExamSessionById);
router.post('/sessions', simpleRateLimit(30, 60 * 60 * 1000), routes.createExamSession);
router.put('/sessions/:id', simpleRateLimit(30, 60 * 60 * 1000), routes.updateExamSession);
router.delete('/sessions/:id', simpleRateLimit(20, 60 * 60 * 1000), routes.deleteExamSession);

router.get('/results/session/:sessionId', routes.getResultsBySession);
router.get('/results/student/:studentId', routes.getResultsByStudent);
router.get('/results/session/:sessionId/student/:studentId', routes.getResultsBySessionAndStudent);
router.post('/results', simpleRateLimit(100, 60 * 60 * 1000), routes.createExamResult);
router.post('/results/upsert', simpleRateLimit(100, 60 * 60 * 1000), routes.upsertExamResult);
router.post('/results/batch', simpleRateLimit(20, 60 * 60 * 1000), routes.batchUpsertResults);
router.put('/results/:id', simpleRateLimit(100, 60 * 60 * 1000), routes.updateExamResult);
router.delete('/results/:id', simpleRateLimit(50, 60 * 60 * 1000), routes.deleteExamResult);

router.get('/statistics/session/:sessionId', routes.getSessionStatistics);
router.get('/statistics/student/:studentId', routes.getStudentStatistics);

router.get('/excel/template/:examTypeId', exportRateLimiter, routes.downloadExcelTemplate);
router.post('/excel/import', bulkOperationsRateLimiter, ...routes.importExcelResults);
router.get('/excel/export/:sessionId', exportRateLimiter, routes.exportExcelResults);

router.get('/school-exams/student/:studentId', routes.getSchoolExamsByStudent);
router.post('/school-exams', simpleRateLimit(100, 60 * 60 * 1000), routes.createSchoolExam);
router.put('/school-exams/:id', simpleRateLimit(100, 60 * 60 * 1000), routes.updateSchoolExam);
router.delete('/school-exams/:id', simpleRateLimit(50, 60 * 60 * 1000), routes.deleteSchoolExam);

router.get('/dashboard/overview', routes.getDashboardOverview);
router.post('/comparison/sessions', routes.getSessionComparison);
router.get('/trend/:examTypeId', routes.getTrendAnalysis);

router.get('/ai/risk/:studentId', routes.getStudentRiskAnalysis);
router.get('/ai/weak-subjects/:studentId', routes.getWeakSubjects);
router.get('/ai/recommendations/:sessionId', routes.getSessionRecommendations);

router.get('/reports/session/:sessionId', routes.generateSessionReportData);
router.get('/reports/student/:studentId', routes.generateStudentReportData);

// Advanced Features Routes
router.get('/dashboard/metrics', routes.getDashboardMetrics);

router.get('/goals/student/:studentId', routes.getStudentGoals);
router.post('/goals', simpleRateLimit(50, 60 * 60 * 1000), routes.createStudentGoal);
router.put('/goals/:id', simpleRateLimit(50, 60 * 60 * 1000), routes.updateGoalProgress);
router.delete('/goals/:id', simpleRateLimit(30, 60 * 60 * 1000), routes.deleteGoal);

router.post('/question-analysis/:sessionId/analyze', routes.analyzeSessionQuestions);
router.get('/question-analysis/:sessionId', routes.getQuestionAnalysis);

router.get('/heatmap/:studentId/:examTypeId', routes.getHeatmapData);
router.post('/heatmap/:studentId/:examTypeId/calculate', routes.calculateHeatmap);

router.post('/benchmarks/:sessionId/calculate', routes.calculateSessionBenchmarks);
router.get('/benchmarks/:sessionId/:studentId', routes.getBenchmarkComparison);
router.get('/benchmarks/student/:studentId', routes.getStudentBenchmarks);

router.get('/time-analysis/:studentId/:examTypeId', routes.getTimeAnalysis);

router.get('/predictions/:studentId/:examTypeId', routes.getPredictiveAnalysis);

router.get('/alerts/student/:studentId', routes.getStudentAlerts);
router.get('/alerts/unread', routes.getAllUnreadAlerts);
router.put('/alerts/:id/read', routes.markAlertRead);

router.get('/reports/detailed/:studentId/:examTypeId/data', routes.getDetailedReportData);
router.get('/reports/detailed/:studentId/:examTypeId/pdf', exportRateLimiter, routes.generateDetailedPDFReport);

export default router;
