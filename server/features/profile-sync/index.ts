/**
 * Profile Sync Feature - Main Export
 * Canlı Öğrenci Profili Senkronizasyon Sistemi
 */

import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import * as routes from './routes/profile-sync.routes.js';
import * as manualCorrection from './routes/manual-correction.routes.js';
import * as conflictResolution from './routes/conflict-resolution.routes.js';
import * as classAnalytics from './routes/class-analytics.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

// Unified Student Identity endpoints
router.get('/identity/:studentId', routes.getStudentIdentity);
router.get('/identities', routes.getAllIdentities);
router.post('/identity/:studentId/refresh', routes.refreshStudentIdentity);

// Profile Update endpoints
router.post('/update', routes.processProfileUpdate);

// Sync Logs endpoints
router.get('/logs/student/:studentId', routes.getStudentSyncLogs);
router.get('/logs/source/:source', routes.getSyncLogsBySource);

// Conflicts endpoints
router.get('/conflicts/student/:studentId', routes.getStudentConflicts);
router.get('/conflicts/high-severity', routes.getHighSeverityConflicts);

// Statistics
router.get('/statistics', routes.getSyncStatistics);

// Manual Correction endpoints
router.post('/correction', manualCorrection.correctAIExtraction);
router.get('/corrections/:studentId', manualCorrection.getCorrectionHistory);
router.post('/undo', manualCorrection.undoLastUpdate);

// Conflict Resolution endpoints
router.post('/conflicts/resolve', conflictResolution.resolveConflictManually);
router.get('/conflicts/pending', conflictResolution.getPendingConflicts);
router.post('/conflicts/bulk-resolve', conflictResolution.bulkResolveConflicts);

// Class Analytics endpoints
router.get('/class/:classId/summary', classAnalytics.getClassProfileSummary);
router.get('/class/:classId/trends', classAnalytics.getClassTrends);
router.get('/class/compare', classAnalytics.compareClasses);

export default router;

// Export services for internal use
export { autoSyncHooks } from './services/auto-sync-hooks.service.js';
export { ProfileAggregationService } from './services/profile-aggregation.service.js';
export { DataValidationService } from './services/data-validation.service.js';
