import { Router } from 'express';
import { NotificationEngineService } from '../services/notification-engine.service.js';
import { NotificationRulesService } from '../services/notification-rules.service.js';
import * as repository from '../repository/notifications.repository.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

const router = Router();
router.use(validateSchoolAccess);
const notificationEngine = new NotificationEngineService();
const notificationRules = new NotificationRulesService();

router.post('/send', async (req, res) => {
  try {
    const result = await notificationEngine.sendNotification(req.body);
    res.json(result);
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/send-bulk', async (req, res) => {
  try {
    const { notifications } = req.body;
    const result = await notificationEngine.sendBulkNotifications(notifications);
    res.json(result);
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/send-templated', async (req, res) => {
  try {
    const { templateName, recipientContact, recipientType, variables, options } = req.body;
    const result = await notificationEngine.sendTemplatedNotification(
      templateName,
      recipientContact,
      recipientType,
      variables,
      options
    );
    res.json(result);
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const notifications = repository.getNotificationsByStudent(studentId);
    res.json({ success: true, data: notifications });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/pending', async (req, res) => {
  try {
    const notifications = await notificationEngine.getPendingNotifications();
    res.json({ success: true, data: notifications });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const { status, limit } = req.query;
    const notifications = repository.getNotificationsByStatus(
      status as string,
      limit ? Number(limit) : undefined
    );
    res.json({ success: true, data: notifications });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const { dateFrom } = req.query;
    const stats = await notificationEngine.getNotificationStats(dateFrom as string);
    res.json({ success: true, data: stats });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/retry-failed', async (req, res) => {
  try {
    const retried = await notificationEngine.retryFailedNotifications();
    res.json({ success: true, data: { retried } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/unread-count', async (req, res) => {
  try {
    const count = repository.getUnreadCount();
    res.json({ success: true, count });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/mark-all-read', async (req, res) => {
  try {
    const count = repository.markAllAsRead();
    res.json({ success: true, count });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...additionalData } = req.body;
    repository.updateNotificationStatus(id, status, additionalData);
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/alert-notification', async (req, res) => {
  try {
    const { alert } = req.body;
    await notificationRules.processAlertNotifications(alert);
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/intervention-notification', async (req, res) => {
  try {
    const { interventionId, studentId, interventionTitle, startDate } = req.body;
    await notificationRules.processInterventionNotifications(
      interventionId,
      studentId,
      interventionTitle,
      startDate
    );
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/weekly-digest/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { progressSummary } = req.body;
    await notificationRules.sendWeeklyDigest(studentId, progressSummary);
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/meeting-invitation', async (req, res) => {
  try {
    const { studentId, meetingDate, meetingTime, meetingTopic } = req.body;
    await notificationRules.scheduleMeetingInvitation(
      studentId,
      meetingDate,
      meetingTime,
      meetingTopic
    );
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType } = req.query;
    const prefs = repository.getPreferenceByUser(userId, userType as string);
    res.json({ success: true, data: prefs });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/preferences', async (req, res) => {
  try {
    const id = repository.createOrUpdatePreference(req.body);
    res.json({ success: true, id });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const { category } = req.query;
    const templates = repository.getAllTemplates(category as string);
    res.json({ success: true, data: templates });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = repository.getTemplateById(id);
    res.json({ success: true, data: template });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/parent-access', async (req, res) => {
  try {
    const id = repository.createParentAccessToken(req.body);
    const token = repository.getTokensByStudent(req.body.studentId).find(t => t.id === id);
    res.json({ success: true, data: token });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/parent-access/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const accessToken = repository.getTokenByValue(token);
    
    if (!accessToken || !accessToken.isActive) {
      return res.status(404).json({ success: false, error: 'Invalid or expired token' });
    }

    repository.updateTokenAccess(token);
    res.json({ success: true, data: accessToken });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.delete('/parent-access/:id', async (req, res) => {
  try {
    const { id } = req.params;
    repository.revokeToken(id);
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/parent-access/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const tokens = repository.getTokensByStudent(studentId);
    res.json({ success: true, data: tokens });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
