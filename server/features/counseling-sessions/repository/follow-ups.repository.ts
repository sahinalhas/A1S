import getDatabase from '../../../lib/database.js';
import type { CounselingFollowUp } from '../types/counseling-sessions.types.js';
import type { Statement } from 'better-sqlite3';

let statements: Record<string, Statement> | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAllFollowUps: db.prepare(`
      SELECT * FROM counseling_follow_ups 
      ORDER BY followUpDate DESC
    `),
    getAllFollowUpsBySchool: db.prepare(`
      SELECT cf.* FROM counseling_follow_ups cf
      INNER JOIN counseling_sessions cs ON cf.sessionId = cs.id
      WHERE cs.schoolId = ?
      ORDER BY cf.followUpDate DESC
    `),
    getFollowUpById: db.prepare('SELECT * FROM counseling_follow_ups WHERE id = ?'),
    getFollowUpByIdAndSchool: db.prepare(`
      SELECT cf.* FROM counseling_follow_ups cf
      INNER JOIN counseling_sessions cs ON cf.sessionId = cs.id
      WHERE cf.id = ? AND cs.schoolId = ?
    `),
    getFollowUpsBySessionId: db.prepare(`
      SELECT * FROM counseling_follow_ups 
      WHERE sessionId = ?
      ORDER BY followUpDate DESC
    `),
    getFollowUpsBySessionIdAndSchool: db.prepare(`
      SELECT cf.* FROM counseling_follow_ups cf
      INNER JOIN counseling_sessions cs ON cf.sessionId = cs.id
      WHERE cf.sessionId = ? AND cs.schoolId = ?
      ORDER BY cf.followUpDate DESC
    `),
    getFollowUpsByStatus: db.prepare(`
      SELECT * FROM counseling_follow_ups 
      WHERE status = ?
      ORDER BY followUpDate DESC
    `),
    getFollowUpsByStatusAndSchool: db.prepare(`
      SELECT cf.* FROM counseling_follow_ups cf
      INNER JOIN counseling_sessions cs ON cf.sessionId = cs.id
      WHERE cf.status = ? AND cs.schoolId = ?
      ORDER BY cf.followUpDate DESC
    `),
    getFollowUpsByAssignee: db.prepare(`
      SELECT * FROM counseling_follow_ups 
      WHERE assignedTo = ?
      ORDER BY followUpDate DESC
    `),
    getFollowUpsByAssigneeAndSchool: db.prepare(`
      SELECT cf.* FROM counseling_follow_ups cf
      INNER JOIN counseling_sessions cs ON cf.sessionId = cs.id
      WHERE cf.assignedTo = ? AND cs.schoolId = ?
      ORDER BY cf.followUpDate DESC
    `),
    getOverdueFollowUps: db.prepare(`
      SELECT * FROM counseling_follow_ups 
      WHERE status != 'completed' AND followUpDate < ?
      ORDER BY priority DESC, followUpDate ASC
    `),
    getOverdueFollowUpsBySchool: db.prepare(`
      SELECT cf.* FROM counseling_follow_ups cf
      INNER JOIN counseling_sessions cs ON cf.sessionId = cs.id
      WHERE cf.status != 'completed' AND cf.followUpDate < ? AND cs.schoolId = ?
      ORDER BY cf.priority DESC, cf.followUpDate ASC
    `),
    getFollowUpsByPriority: db.prepare(`
      SELECT * FROM counseling_follow_ups 
      WHERE priority = ? AND status != 'completed'
      ORDER BY followUpDate ASC
    `),
    getFollowUpsByPriorityAndSchool: db.prepare(`
      SELECT cf.* FROM counseling_follow_ups cf
      INNER JOIN counseling_sessions cs ON cf.sessionId = cs.id
      WHERE cf.priority = ? AND cf.status != 'completed' AND cs.schoolId = ?
      ORDER BY cf.followUpDate ASC
    `),
    insertFollowUp: db.prepare(`
      INSERT INTO counseling_follow_ups (
        id, sessionId, followUpDate, assignedTo, priority,
        status, actionItems, notes, completedDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    updateFollowUp: db.prepare(`
      UPDATE counseling_follow_ups 
      SET sessionId = ?, followUpDate = ?, assignedTo = ?, priority = ?,
          status = ?, actionItems = ?, notes = ?, completedDate = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    updateFollowUpBySchool: db.prepare(`
      UPDATE counseling_follow_ups 
      SET sessionId = ?, followUpDate = ?, assignedTo = ?, priority = ?,
          status = ?, actionItems = ?, notes = ?, completedDate = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND sessionId IN (
        SELECT id FROM counseling_sessions WHERE schoolId = ?
      )
    `),
    updateFollowUpStatus: db.prepare(`
      UPDATE counseling_follow_ups 
      SET status = ?, completedDate = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    updateFollowUpStatusBySchool: db.prepare(`
      UPDATE counseling_follow_ups 
      SET status = ?, completedDate = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND sessionId IN (
        SELECT id FROM counseling_sessions WHERE schoolId = ?
      )
    `),
    deleteFollowUp: db.prepare('DELETE FROM counseling_follow_ups WHERE id = ?'),
    deleteFollowUpBySchool: db.prepare(`
      DELETE FROM counseling_follow_ups 
      WHERE id = ? AND sessionId IN (
        SELECT id FROM counseling_sessions WHERE schoolId = ?
      )
    `)
  };
  
  isInitialized = true;
}

export function getAllFollowUps(): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getAllFollowUps.all() as CounselingFollowUp[];
}

export function getAllFollowUpsBySchool(schoolId: string): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getAllFollowUpsBySchool.all(schoolId) as CounselingFollowUp[];
}

export function getFollowUpById(id: string): CounselingFollowUp | null {
  ensureInitialized();
  return statements!.getFollowUpById.get(id) as CounselingFollowUp | null;
}

export function getFollowUpByIdAndSchool(id: string, schoolId: string): CounselingFollowUp | null {
  ensureInitialized();
  return statements!.getFollowUpByIdAndSchool.get(id, schoolId) as CounselingFollowUp | null;
}

export function getFollowUpsBySessionId(sessionId: string): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getFollowUpsBySessionId.all(sessionId) as CounselingFollowUp[];
}

export function getFollowUpsBySessionIdAndSchool(sessionId: string, schoolId: string): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getFollowUpsBySessionIdAndSchool.all(sessionId, schoolId) as CounselingFollowUp[];
}

export function getFollowUpsByStatus(status: string): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getFollowUpsByStatus.all(status) as CounselingFollowUp[];
}

export function getFollowUpsByStatusAndSchool(status: string, schoolId: string): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getFollowUpsByStatusAndSchool.all(status, schoolId) as CounselingFollowUp[];
}

export function getFollowUpsByAssignee(assignedTo: string): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getFollowUpsByAssignee.all(assignedTo) as CounselingFollowUp[];
}

export function getFollowUpsByAssigneeAndSchool(assignedTo: string, schoolId: string): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getFollowUpsByAssigneeAndSchool.all(assignedTo, schoolId) as CounselingFollowUp[];
}

export function getOverdueFollowUps(currentDate: string): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getOverdueFollowUps.all(currentDate) as CounselingFollowUp[];
}

export function getOverdueFollowUpsBySchool(currentDate: string, schoolId: string): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getOverdueFollowUpsBySchool.all(currentDate, schoolId) as CounselingFollowUp[];
}

export function getFollowUpsByPriority(priority: string): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getFollowUpsByPriority.all(priority) as CounselingFollowUp[];
}

export function getFollowUpsByPriorityAndSchool(priority: string, schoolId: string): CounselingFollowUp[] {
  ensureInitialized();
  return statements!.getFollowUpsByPriorityAndSchool.all(priority, schoolId) as CounselingFollowUp[];
}

export function insertFollowUp(followUp: CounselingFollowUp): void {
  ensureInitialized();
  statements!.insertFollowUp.run(
    followUp.id,
    followUp.sessionId || null,
    followUp.followUpDate,
    followUp.assignedTo,
    followUp.priority,
    followUp.status,
    followUp.actionItems,
    followUp.notes || null,
    followUp.completedDate || null
  );
}

export function updateFollowUp(followUp: CounselingFollowUp): { changes: number } {
  ensureInitialized();
  const result = statements!.updateFollowUp.run(
    followUp.sessionId || null,
    followUp.followUpDate,
    followUp.assignedTo,
    followUp.priority,
    followUp.status,
    followUp.actionItems,
    followUp.notes || null,
    followUp.completedDate || null,
    followUp.id
  );
  return { changes: result.changes };
}

export function updateFollowUpBySchool(followUp: CounselingFollowUp, schoolId: string): { changes: number } {
  ensureInitialized();
  const result = statements!.updateFollowUpBySchool.run(
    followUp.sessionId || null,
    followUp.followUpDate,
    followUp.assignedTo,
    followUp.priority,
    followUp.status,
    followUp.actionItems,
    followUp.notes || null,
    followUp.completedDate || null,
    followUp.id,
    schoolId
  );
  return { changes: result.changes };
}

export function updateFollowUpStatus(id: string, status: string, completedDate: string | null): { changes: number } {
  ensureInitialized();
  const result = statements!.updateFollowUpStatus.run(status, completedDate || null, id);
  return { changes: result.changes };
}

export function updateFollowUpStatusBySchool(id: string, status: string, completedDate: string | null, schoolId: string): { changes: number } {
  ensureInitialized();
  const result = statements!.updateFollowUpStatusBySchool.run(status, completedDate || null, id, schoolId);
  return { changes: result.changes };
}

export function deleteFollowUp(id: string, schoolId?: string): { changes: number } {
  ensureInitialized();
  const result = schoolId 
    ? statements!.deleteFollowUpBySchool.run(id, schoolId)
    : statements!.deleteFollowUp.run(id);
  return { changes: result.changes };
}
