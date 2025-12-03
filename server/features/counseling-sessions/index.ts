import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import { requireSecureAuth, requireRoleSecure } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import * as counselingSessionsRoutes from './routes/counseling-sessions.routes.js';
import * as remindersRoutes from './routes/reminders.routes.js';
import * as followUpsRoutes from './routes/follow-ups.routes.js';
import * as analyticsRoutes from './routes/analytics.routes.js';
import * as outcomesRoutes from './routes/outcomes.routes.js';
import * as tagsRoutes from './routes/tags.routes.js';
import * as aiExportRoutes from './routes/ai-export.routes.js';
import interventionAIRoutes from './routes/intervention-ai.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);
router.use(requireRoleSecure(['counselor']));

router.get('/', simpleRateLimit(200, 15 * 60 * 1000), counselingSessionsRoutes.getAllCounselingSessions);
router.get('/active', simpleRateLimit(200, 15 * 60 * 1000), counselingSessionsRoutes.getActiveCounselingSessions);
router.get('/class-hours', simpleRateLimit(200, 15 * 60 * 1000), counselingSessionsRoutes.getClassHours);
router.get('/topics', simpleRateLimit(200, 15 * 60 * 1000), counselingSessionsRoutes.getCounselingTopics);

router.get('/tags', simpleRateLimit(200, 15 * 60 * 1000), tagsRoutes.getAllTags);
router.get('/tags/suggest', simpleRateLimit(200, 15 * 60 * 1000), tagsRoutes.getSuggestedTags);
router.get('/tags/category/:category', simpleRateLimit(200, 15 * 60 * 1000), tagsRoutes.getTagsByCategory);
router.get('/tags/:id', simpleRateLimit(200, 15 * 60 * 1000), tagsRoutes.getTagDetails);

router.get('/analytics/overview', simpleRateLimit(200, 15 * 60 * 1000), analyticsRoutes.getOverview);
router.get('/analytics/time-series', simpleRateLimit(200, 15 * 60 * 1000), analyticsRoutes.getTimeSeries);
router.get('/analytics/topics', simpleRateLimit(200, 15 * 60 * 1000), analyticsRoutes.getTopics);
router.get('/analytics/participants', simpleRateLimit(200, 15 * 60 * 1000), analyticsRoutes.getParticipants);
router.get('/analytics/classes', simpleRateLimit(200, 15 * 60 * 1000), analyticsRoutes.getClasses);
router.get('/analytics/modes', simpleRateLimit(200, 15 * 60 * 1000), analyticsRoutes.getModes);
router.get('/analytics/student/:studentId', simpleRateLimit(200, 15 * 60 * 1000), analyticsRoutes.getStudentStats);

router.get('/reminders', simpleRateLimit(200, 15 * 60 * 1000), remindersRoutes.getAllReminders);
router.get('/reminders/pending', simpleRateLimit(200, 15 * 60 * 1000), remindersRoutes.getPendingReminders);
router.get('/reminders/:id', simpleRateLimit(200, 15 * 60 * 1000), remindersRoutes.getReminderById);
router.post('/reminders', simpleRateLimit(50, 15 * 60 * 1000), remindersRoutes.createReminder);
router.put('/reminders/:id', simpleRateLimit(50, 15 * 60 * 1000), remindersRoutes.updateReminder);
router.put('/reminders/:id/status', simpleRateLimit(50, 15 * 60 * 1000), remindersRoutes.updateReminderStatus);
router.delete('/reminders/:id', simpleRateLimit(20, 15 * 60 * 1000), remindersRoutes.deleteReminder);

router.get('/follow-ups', simpleRateLimit(200, 15 * 60 * 1000), followUpsRoutes.getAllFollowUps);
router.get('/follow-ups/overdue', simpleRateLimit(200, 15 * 60 * 1000), followUpsRoutes.getOverdueFollowUps);
router.get('/follow-ups/:id', simpleRateLimit(200, 15 * 60 * 1000), followUpsRoutes.getFollowUpById);
router.post('/follow-ups', simpleRateLimit(50, 15 * 60 * 1000), followUpsRoutes.createFollowUp);
router.put('/follow-ups/:id', simpleRateLimit(50, 15 * 60 * 1000), followUpsRoutes.updateFollowUp);
router.put('/follow-ups/:id/status', simpleRateLimit(50, 15 * 60 * 1000), followUpsRoutes.updateFollowUpStatus);
router.delete('/follow-ups/:id', simpleRateLimit(20, 15 * 60 * 1000), followUpsRoutes.deleteFollowUp);

router.get('/outcomes', simpleRateLimit(200, 15 * 60 * 1000), outcomesRoutes.getAllOutcomes);
router.get('/outcomes/follow-up-required', simpleRateLimit(200, 15 * 60 * 1000), outcomesRoutes.getOutcomesRequiringFollowUp);
router.get('/outcomes/session/:sessionId', simpleRateLimit(200, 15 * 60 * 1000), outcomesRoutes.getOutcomeBySessionId);
router.get('/outcomes/:id', simpleRateLimit(200, 15 * 60 * 1000), outcomesRoutes.getOutcomeById);
router.post('/outcomes', simpleRateLimit(50, 15 * 60 * 1000), outcomesRoutes.createOutcome);
router.put('/outcomes/:id', simpleRateLimit(50, 15 * 60 * 1000), outcomesRoutes.updateOutcome);
router.delete('/outcomes/:id', simpleRateLimit(20, 15 * 60 * 1000), outcomesRoutes.deleteOutcome);

router.post('/auto-complete', simpleRateLimit(20, 15 * 60 * 1000), counselingSessionsRoutes.autoCompleteCounselingSessions);
router.post('/', simpleRateLimit(50, 15 * 60 * 1000), counselingSessionsRoutes.createCounselingSession);
router.put('/:id/complete', simpleRateLimit(50, 15 * 60 * 1000), counselingSessionsRoutes.completeCounselingSession);
router.put('/:id/extend', simpleRateLimit(50, 15 * 60 * 1000), counselingSessionsRoutes.extendCounselingSession);
router.get('/:id', simpleRateLimit(200, 15 * 60 * 1000), counselingSessionsRoutes.getCounselingSessionById);
router.delete('/:id', simpleRateLimit(20, 15 * 60 * 1000), counselingSessionsRoutes.deleteCounselingSession);

router.get('/ai-export', simpleRateLimit(50, 15 * 60 * 1000), aiExportRoutes.exportForAI);
router.get('/ai-export/prompt/:sessionId', simpleRateLimit(50, 15 * 60 * 1000), aiExportRoutes.generatePrompt);
router.get('/ai-export/student/:studentId', simpleRateLimit(50, 15 * 60 * 1000), aiExportRoutes.getStudentAggregation);

router.use('/interventions', simpleRateLimit(30, 15 * 60 * 1000), interventionAIRoutes);

export default router;
