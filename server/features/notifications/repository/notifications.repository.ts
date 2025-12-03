import getDatabase from '../../../lib/database.js';
import { randomUUID } from 'crypto';
import type { 
  NotificationLog, 
  NotificationPreference, 
  NotificationTemplate,
  ParentAccessToken,
  ScheduledTask
} from '../../../../shared/types/notification.types';

const db = getDatabase();

// ==================== NOTIFICATION LOGS ====================

export function createNotification(notification: Omit<NotificationLog, 'id' | 'created_at' | 'updated_at'>): string {
  const id = randomUUID();
  
  const stmt = db.prepare(`
    INSERT INTO notification_logs (
      id, recipientType, recipientId, recipientName, recipientContact,
      notificationType, channel, subject, message,
      studentId, alertId, interventionId,
      status, priority, metadata, templateId
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    notification.recipientType,
    notification.recipientId || null,
    notification.recipientName || null,
    notification.recipientContact || null,
    notification.notificationType,
    notification.channel,
    notification.subject || null,
    notification.message,
    notification.studentId || null,
    notification.alertId || null,
    notification.interventionId || null,
    notification.status,
    notification.priority || 'NORMAL',
    notification.metadata || null,
    notification.templateId || null
  );
  
  return id;
}

export function updateNotificationStatus(
  id: string, 
  status: NotificationLog['status'],
  additionalData?: {
    sentAt?: string;
    deliveredAt?: string;
    readAt?: string;
    failureReason?: string;
  }
): void {
  const stmt = db.prepare(`
    UPDATE notification_logs
    SET status = ?,
        sentAt = COALESCE(?, sentAt),
        deliveredAt = COALESCE(?, deliveredAt),
        readAt = COALESCE(?, readAt),
        failureReason = COALESCE(?, failureReason)
    WHERE id = ?
  `);
  
  stmt.run(
    status,
    additionalData?.sentAt || null,
    additionalData?.deliveredAt || null,
    additionalData?.readAt || null,
    additionalData?.failureReason || null,
    id
  );
}

export function getNotificationsByStudent(studentId: string): NotificationLog[] {
  const stmt = db.prepare(`
    SELECT * FROM notification_logs 
    WHERE studentId = ? 
    ORDER BY created_at DESC
  `);
  return stmt.all(studentId) as NotificationLog[];
}

export function getPendingNotifications(): NotificationLog[] {
  const stmt = db.prepare(`
    SELECT * FROM notification_logs 
    WHERE status = 'PENDING'
    ORDER BY priority DESC, created_at ASC
  `);
  return stmt.all() as NotificationLog[];
}

export function getNotificationsByStatus(status?: string, limit?: number): NotificationLog[] {
  let query = 'SELECT * FROM notification_logs';
  const params: unknown[] = [];
  
  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY created_at DESC';
  
  if (limit) {
    query += ' LIMIT ?';
    params.push(limit);
  }
  
  const stmt = db.prepare(query);
  return stmt.all(...params) as NotificationLog[];
}

export function getNotificationStats(dateFrom?: string): any {
  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'SENT' THEN 1 ELSE 0 END) as sent,
      SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) as delivered,
      SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
      SUM(CASE WHEN status = 'READ' THEN 1 ELSE 0 END) as read
    FROM notification_logs
    ${dateFrom ? 'WHERE created_at >= ?' : ''}
  `);
  
  return dateFrom ? stmt.get(dateFrom) : stmt.get();
}

export function getUnreadCount(): number {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM notification_logs 
    WHERE status != 'READ'
  `);
  const result = stmt.get() as { count: number };
  return result?.count || 0;
}

export function markAllAsRead(): number {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE notification_logs 
    SET status = 'READ', readAt = ?
    WHERE status != 'READ'
  `);
  const result = stmt.run(now);
  return result.changes;
}

// ==================== NOTIFICATION PREFERENCES ====================

export function createOrUpdatePreference(pref: Omit<NotificationPreference, 'id' | 'created_at' | 'updated_at'>): string {
  const id = randomUUID();
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO notification_preferences (
      id, userId, parentId, studentId, userType,
      emailEnabled, smsEnabled, pushEnabled, inAppEnabled,
      emailAddress, phoneNumber, alertTypes, riskLevels,
      quietHoursStart, quietHoursEnd, weeklyDigest, monthlyReport, language
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    pref.userId || null,
    pref.parentId || null,
    pref.studentId || null,
    pref.userType,
    pref.emailEnabled,
    pref.smsEnabled,
    pref.pushEnabled,
    pref.inAppEnabled,
    pref.emailAddress || null,
    pref.phoneNumber || null,
    pref.alertTypes || null,
    pref.riskLevels || null,
    pref.quietHoursStart || null,
    pref.quietHoursEnd || null,
    pref.weeklyDigest,
    pref.monthlyReport,
    pref.language || 'tr'
  );
  
  return id;
}

export function getPreferenceByUser(userId: string, userType: string): NotificationPreference | null {
  const stmt = db.prepare(`
    SELECT * FROM notification_preferences 
    WHERE userId = ? AND userType = ?
  `);
  return stmt.get(userId, userType) as NotificationPreference | null;
}

export function getPreferenceByParent(studentId: string): NotificationPreference | null {
  const stmt = db.prepare(`
    SELECT * FROM notification_preferences 
    WHERE studentId = ? AND userType = 'PARENT'
  `);
  return stmt.get(studentId) as NotificationPreference | null;
}

// ==================== NOTIFICATION TEMPLATES ====================

export function getTemplateById(id: string): NotificationTemplate | null {
  const stmt = db.prepare('SELECT * FROM notification_templates WHERE id = ?');
  return stmt.get(id) as NotificationTemplate | null;
}

export function getTemplateByName(name: string): NotificationTemplate | null {
  const stmt = db.prepare('SELECT * FROM notification_templates WHERE templateName = ? AND isActive = 1');
  return stmt.get(name) as NotificationTemplate | null;
}

export function getAllTemplates(category?: string): NotificationTemplate[] {
  const stmt = category
    ? db.prepare('SELECT * FROM notification_templates WHERE category = ? AND isActive = 1')
    : db.prepare('SELECT * FROM notification_templates WHERE isActive = 1');
  
  return category ? stmt.all(category) as NotificationTemplate[] : stmt.all() as NotificationTemplate[];
}

// ==================== PARENT ACCESS TOKENS ====================

export function createParentAccessToken(token: Omit<ParentAccessToken, 'id' | 'created_at' | 'updated_at'>): string {
  const id = randomUUID();
  
  const stmt = db.prepare(`
    INSERT INTO parent_access_tokens (
      id, studentId, parentName, parentContact, accessToken,
      accessLevel, expiresAt, isActive, createdBy
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    token.studentId,
    token.parentName,
    token.parentContact,
    token.accessToken,
    token.accessLevel || 'VIEW_ONLY',
    token.expiresAt || null,
    token.isActive,
    token.createdBy || null
  );
  
  return id;
}

export function getTokenByValue(accessToken: string): ParentAccessToken | null {
  const stmt = db.prepare(`
    SELECT * FROM parent_access_tokens 
    WHERE accessToken = ? AND isActive = 1
  `);
  return stmt.get(accessToken) as ParentAccessToken | null;
}

export function updateTokenAccess(accessToken: string): void {
  const stmt = db.prepare(`
    UPDATE parent_access_tokens
    SET lastAccessedAt = CURRENT_TIMESTAMP,
        accessCount = accessCount + 1
    WHERE accessToken = ?
  `);
  stmt.run(accessToken);
}

export function revokeToken(id: string): void {
  const stmt = db.prepare('UPDATE parent_access_tokens SET isActive = 0 WHERE id = ?');
  stmt.run(id);
}

export function getTokensByStudent(studentId: string): ParentAccessToken[] {
  const stmt = db.prepare(`
    SELECT * FROM parent_access_tokens 
    WHERE studentId = ?
    ORDER BY created_at DESC
  `);
  return stmt.all(studentId) as ParentAccessToken[];
}

// ==================== SCHEDULED TASKS ====================

export function createScheduledTask(task: Omit<ScheduledTask, 'id' | 'created_at' | 'updated_at'>): string {
  const id = randomUUID();
  
  const stmt = db.prepare(`
    INSERT INTO scheduled_tasks (
      id, taskType, targetType, targetId, scheduleType,
      scheduledTime, nextRun, status, taskData
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    task.taskType,
    task.targetType,
    task.targetId || null,
    task.scheduleType,
    task.scheduledTime,
    task.nextRun,
    task.status || 'ACTIVE',
    task.taskData || null
  );
  
  return id;
}

export function getDueScheduledTasks(): ScheduledTask[] {
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    SELECT * FROM scheduled_tasks 
    WHERE status = 'ACTIVE' AND nextRun <= ?
    ORDER BY nextRun ASC
  `);
  
  return stmt.all(now) as ScheduledTask[];
}

export function updateScheduledTaskRun(id: string, nextRun: string): void {
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    UPDATE scheduled_tasks
    SET lastRun = ?,
        nextRun = ?
    WHERE id = ?
  `);
  
  stmt.run(now, nextRun, id);
}

export function updateScheduledTaskStatus(id: string, status: ScheduledTask['status']): void {
  const stmt = db.prepare('UPDATE scheduled_tasks SET status = ? WHERE id = ?');
  stmt.run(status, id);
}
