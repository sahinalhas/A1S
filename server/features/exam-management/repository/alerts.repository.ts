import getDatabase from '../../../lib/database/index.js';
import type { ExamAlert } from '../../../../shared/types/exam-management.types.js';
import { randomUUID } from 'crypto';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getByStudent: db.prepare(`
      SELECT a.*, COALESCE(CAST((s.name || ' ' || s.surname) AS TEXT), s.name) as student_name
      FROM exam_alerts a
      LEFT JOIN students s ON a.student_id = s.id
      WHERE a.student_id = ?
      ORDER BY a.created_at DESC
    `),
    getUnread: db.prepare(`
      SELECT a.*, COALESCE(CAST((s.name || ' ' || s.surname) AS TEXT), s.name) as student_name
      FROM exam_alerts a
      LEFT JOIN students s ON a.student_id = s.id
      WHERE a.is_read = FALSE
      ORDER BY a.severity DESC, a.created_at DESC
    `),
    getRecent: db.prepare(`
      SELECT a.*, COALESCE(CAST((s.name || ' ' || s.surname) AS TEXT), s.name) as student_name
      FROM exam_alerts a
      LEFT JOIN students s ON a.student_id = s.id
      WHERE a.created_at >= datetime('now', '-7 days')
      ORDER BY a.created_at DESC
      LIMIT ?
    `),
    create: db.prepare(`
      INSERT INTO exam_alerts (
        id, student_id, alert_type, severity, title, message, data
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `),
    markRead: db.prepare('UPDATE exam_alerts SET is_read = TRUE WHERE id = ?'),
    markAction: db.prepare('UPDATE exam_alerts SET action_taken = TRUE WHERE id = ?'),
  };
  
  isInitialized = true;
}

export function getAlertsByStudent(studentId: string): unknown[] {
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId);
  } catch (error) {
    console.error('Database error in getAlertsByStudent:', error);
    return [];
  }
}

export function getUnreadAlerts(): unknown[] {
  try {
    ensureInitialized();
    return statements.getUnread.all();
  } catch (error) {
    console.error('Database error in getUnreadAlerts:', error);
    return [];
  }
}

export function getRecentAlerts(limit: number = 50): unknown[] {
  try {
    ensureInitialized();
    return statements.getRecent.all(limit);
  } catch (error) {
    console.error('Database error in getRecentAlerts:', error);
    return [];
  }
}

export function createAlert(data: {
  student_id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  data?: any;
}): boolean {
  try {
    ensureInitialized();
    const id = randomUUID();
    
    statements.create.run(
      id,
      data.student_id,
      data.alert_type,
      data.severity,
      data.title,
      data.message,
      data.data ? JSON.stringify(data.data) : null
    );
    return true;
  } catch (error) {
    console.error('Database error in createAlert:', error);
    return false;
  }
}

export function markAlertAsRead(id: string): boolean {
  try {
    ensureInitialized();
    const result = statements.markRead.run(id);
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in markAlertAsRead:', error);
    return false;
  }
}

export function markAlertActionTaken(id: string): boolean {
  try {
    ensureInitialized();
    const result = statements.markAction.run(id);
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in markAlertActionTaken:', error);
    return false;
  }
}
