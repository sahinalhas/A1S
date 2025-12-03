import getDatabase from '../../../lib/database.js';
import type { CounselingReminder } from '../types/counseling-sessions.types.js';
import type { Statement } from 'better-sqlite3';

let statements: Record<string, Statement> | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAllReminders: db.prepare(`
      SELECT * FROM counseling_reminders 
      ORDER BY reminderDate DESC, reminderTime DESC
    `),
    getAllRemindersBySchool: db.prepare(`
      SELECT cr.* FROM counseling_reminders cr
      INNER JOIN counseling_sessions cs ON cr.sessionId = cs.id
      WHERE cs.schoolId = ?
      ORDER BY cr.reminderDate DESC, cr.reminderTime DESC
    `),
    getReminderById: db.prepare('SELECT * FROM counseling_reminders WHERE id = ?'),
    getReminderByIdAndSchool: db.prepare(`
      SELECT cr.* FROM counseling_reminders cr
      INNER JOIN counseling_sessions cs ON cr.sessionId = cs.id
      WHERE cr.id = ? AND cs.schoolId = ?
    `),
    getRemindersBySessionId: db.prepare(`
      SELECT * FROM counseling_reminders 
      WHERE sessionId = ?
      ORDER BY reminderDate DESC, reminderTime DESC
    `),
    getRemindersBySessionIdAndSchool: db.prepare(`
      SELECT cr.* FROM counseling_reminders cr
      INNER JOIN counseling_sessions cs ON cr.sessionId = cs.id
      WHERE cr.sessionId = ? AND cs.schoolId = ?
      ORDER BY cr.reminderDate DESC, cr.reminderTime DESC
    `),
    getRemindersByStatus: db.prepare(`
      SELECT * FROM counseling_reminders 
      WHERE status = ?
      ORDER BY reminderDate DESC, reminderTime DESC
    `),
    getRemindersByStatusAndSchool: db.prepare(`
      SELECT cr.* FROM counseling_reminders cr
      INNER JOIN counseling_sessions cs ON cr.sessionId = cs.id
      WHERE cr.status = ? AND cs.schoolId = ?
      ORDER BY cr.reminderDate DESC, cr.reminderTime DESC
    `),
    getPendingReminders: db.prepare(`
      SELECT * FROM counseling_reminders 
      WHERE status = 'pending' AND reminderDate <= ?
      ORDER BY reminderDate ASC, reminderTime ASC
    `),
    getPendingRemindersBySchool: db.prepare(`
      SELECT cr.* FROM counseling_reminders cr
      INNER JOIN counseling_sessions cs ON cr.sessionId = cs.id
      WHERE cr.status = 'pending' AND cr.reminderDate <= ? AND cs.schoolId = ?
      ORDER BY cr.reminderDate ASC, cr.reminderTime ASC
    `),
    insertReminder: db.prepare(`
      INSERT INTO counseling_reminders (
        id, sessionId, reminderType, reminderDate, reminderTime,
        title, description, studentIds, status, notificationSent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    updateReminder: db.prepare(`
      UPDATE counseling_reminders 
      SET sessionId = ?, reminderType = ?, reminderDate = ?, reminderTime = ?,
          title = ?, description = ?, studentIds = ?, status = ?,
          notificationSent = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    updateReminderBySchool: db.prepare(`
      UPDATE counseling_reminders 
      SET sessionId = ?, reminderType = ?, reminderDate = ?, reminderTime = ?,
          title = ?, description = ?, studentIds = ?, status = ?,
          notificationSent = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND sessionId IN (
        SELECT id FROM counseling_sessions WHERE schoolId = ?
      )
    `),
    updateReminderStatus: db.prepare(`
      UPDATE counseling_reminders 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    updateReminderStatusBySchool: db.prepare(`
      UPDATE counseling_reminders 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND sessionId IN (
        SELECT id FROM counseling_sessions WHERE schoolId = ?
      )
    `),
    markNotificationSent: db.prepare(`
      UPDATE counseling_reminders 
      SET notificationSent = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    deleteReminder: db.prepare('DELETE FROM counseling_reminders WHERE id = ?'),
    deleteReminderBySchool: db.prepare(`
      DELETE FROM counseling_reminders 
      WHERE id = ? AND sessionId IN (
        SELECT id FROM counseling_sessions WHERE schoolId = ?
      )
    `)
  };
  
  isInitialized = true;
}

export function getAllReminders(): CounselingReminder[] {
  ensureInitialized();
  return statements!.getAllReminders.all() as CounselingReminder[];
}

export function getAllRemindersBySchool(schoolId: string): CounselingReminder[] {
  ensureInitialized();
  return statements!.getAllRemindersBySchool.all(schoolId) as CounselingReminder[];
}

export function getReminderById(id: string): CounselingReminder | null {
  ensureInitialized();
  return statements!.getReminderById.get(id) as CounselingReminder | null;
}

export function getReminderByIdAndSchool(id: string, schoolId: string): CounselingReminder | null {
  ensureInitialized();
  return statements!.getReminderByIdAndSchool.get(id, schoolId) as CounselingReminder | null;
}

export function getRemindersBySessionId(sessionId: string): CounselingReminder[] {
  ensureInitialized();
  return statements!.getRemindersBySessionId.all(sessionId) as CounselingReminder[];
}

export function getRemindersBySessionIdAndSchool(sessionId: string, schoolId: string): CounselingReminder[] {
  ensureInitialized();
  return statements!.getRemindersBySessionIdAndSchool.all(sessionId, schoolId) as CounselingReminder[];
}

export function getRemindersByStatus(status: string): CounselingReminder[] {
  ensureInitialized();
  return statements!.getRemindersByStatus.all(status) as CounselingReminder[];
}

export function getRemindersByStatusAndSchool(status: string, schoolId: string): CounselingReminder[] {
  ensureInitialized();
  return statements!.getRemindersByStatusAndSchool.all(status, schoolId) as CounselingReminder[];
}

export function getPendingReminders(currentDate: string): CounselingReminder[] {
  ensureInitialized();
  return statements!.getPendingReminders.all(currentDate) as CounselingReminder[];
}

export function getPendingRemindersBySchool(currentDate: string, schoolId: string): CounselingReminder[] {
  ensureInitialized();
  return statements!.getPendingRemindersBySchool.all(currentDate, schoolId) as CounselingReminder[];
}

export function insertReminder(reminder: CounselingReminder): void {
  ensureInitialized();
  statements!.insertReminder.run(
    reminder.id,
    reminder.sessionId || null,
    reminder.reminderType,
    reminder.reminderDate,
    reminder.reminderTime,
    reminder.title,
    reminder.description || null,
    reminder.studentIds || null,
    reminder.status,
    reminder.notificationSent ? 1 : 0
  );
}

export function updateReminder(reminder: CounselingReminder): { changes: number } {
  ensureInitialized();
  const result = statements!.updateReminder.run(
    reminder.sessionId || null,
    reminder.reminderType,
    reminder.reminderDate,
    reminder.reminderTime,
    reminder.title,
    reminder.description || null,
    reminder.studentIds || null,
    reminder.status,
    reminder.notificationSent ? 1 : 0,
    reminder.id
  );
  return { changes: result.changes };
}

export function updateReminderStatus(id: string, status: string): { changes: number } {
  ensureInitialized();
  const result = statements!.updateReminderStatus.run(status, id);
  return { changes: result.changes };
}

export function updateReminderStatusBySchool(id: string, status: string, schoolId: string): { changes: number } {
  ensureInitialized();
  const result = statements!.updateReminderStatusBySchool.run(status, id, schoolId);
  return { changes: result.changes };
}

export function markNotificationSent(id: string): { changes: number } {
  ensureInitialized();
  const result = statements!.markNotificationSent.run(id);
  return { changes: result.changes };
}

export function deleteReminder(id: string, schoolId?: string): { changes: number } {
  ensureInitialized();
  const result = schoolId 
    ? statements!.deleteReminderBySchool.run(id, schoolId)
    : statements!.deleteReminder.run(id);
  return { changes: result.changes };
}
