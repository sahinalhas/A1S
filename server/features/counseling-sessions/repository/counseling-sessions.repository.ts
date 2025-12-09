import getDatabase from '../../../lib/database.js';
import type { CounselingSession, CounselingSessionWithStudents, SessionFilters } from '../types/counseling-sessions.types.js';

interface DBStatements {
  getAllSessions: any;
  getSessionsBySchool: any;
  getActiveSessions: any;
  getActiveSessionsBySchool: any;
  getSessionById: any;
  getSessionByIdAndSchool: any;
  deleteSessionBySchool: any;
  getStudentsBySession: any;
  getStudentBySession: any;
  getStudentSessions: any;
  insertSession: any;
  insertSessionStudent: any;
  completeSession: any;
  completeSessionBySchool: any;
  extendSession: any;
  extendSessionBySchool: any;
  getSessionsToAutoComplete: any;
  getSessionsToAutoCompleteBySchool: any;
  autoCompleteSession: any;
  deleteSession: any;
  getAppSettings: any;
}

let statements: DBStatements | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAllSessions: db.prepare(`
      SELECT * FROM counseling_sessions 
      ORDER BY sessionDate DESC, entryTime DESC
    `),
    getSessionsBySchool: db.prepare(`
      SELECT * FROM counseling_sessions 
      WHERE schoolId = ?
      ORDER BY sessionDate DESC, entryTime DESC
    `),
    getActiveSessions: db.prepare(`
      SELECT * FROM counseling_sessions 
      WHERE completed = 0
      ORDER BY sessionDate DESC, entryTime DESC
    `),
    getActiveSessionsBySchool: db.prepare(`
      SELECT * FROM counseling_sessions 
      WHERE completed = 0 AND schoolId = ?
      ORDER BY sessionDate DESC, entryTime DESC
    `),
    getSessionById: db.prepare('SELECT * FROM counseling_sessions WHERE id = ?'),
    getSessionByIdAndSchool: db.prepare('SELECT * FROM counseling_sessions WHERE id = ? AND schoolId = ?'),
    deleteSessionBySchool: db.prepare('DELETE FROM counseling_sessions WHERE id = ? AND schoolId = ?'),
    getStudentsBySession: db.prepare(`
      SELECT s.* FROM students s
      INNER JOIN counseling_session_students css ON s.id = css.studentId
      WHERE css.sessionId = ?
    `),
    getStudentBySession: db.prepare(`
      SELECT s.* FROM students s
      INNER JOIN counseling_session_students css ON s.id = css.studentId
      WHERE css.sessionId = ?
      LIMIT 1
    `),
    getStudentSessions: db.prepare(`
      SELECT cs.*, css.studentId
      FROM counseling_sessions cs
      INNER JOIN counseling_session_students css ON cs.id = css.sessionId
      WHERE css.studentId = ? AND cs.completed = 1
      ORDER BY cs.sessionDate DESC, cs.entryTime DESC
    `),
    insertSession: db.prepare(`
      INSERT INTO counseling_sessions (
        id, sessionType, groupName, counselorId, schoolId, sessionDate, entryTime, entryClassHourId,
        participantType, relationshipType, otherParticipants, parentName,
        parentRelationship, teacherName, teacherBranch, otherParticipantDescription,
        sessionMode, sessionLocation, disciplineStatus, institutionalCooperation,
        sessionDetails, completed, drpHizmetAlaniId, drpBirId, drpIkiId, drpUcId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    insertSessionStudent: db.prepare(`
      INSERT INTO counseling_session_students (sessionId, studentId)
      VALUES (?, ?)
    `),
    completeSession: db.prepare(`
      UPDATE counseling_sessions 
      SET topic = ?, exitTime = ?, exitClassHourId = ?, detailedNotes = ?, 
          autoCompleted = ?, completed = 1,
          sessionFlow = ?, studentParticipationLevel = ?, cooperationLevel = ?,
          emotionalState = ?, physicalState = ?, communicationQuality = ?,
          sessionTags = ?, achievedOutcomes = ?, followUpNeeded = ?,
          followUpPlan = ?, actionItems = ?,
          drpHizmetAlaniId = ?, drpBirId = ?, drpIkiId = ?, drpUcId = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    completeSessionBySchool: db.prepare(`
      UPDATE counseling_sessions 
      SET topic = ?, exitTime = ?, exitClassHourId = ?, detailedNotes = ?, 
          autoCompleted = ?, completed = 1,
          sessionFlow = ?, studentParticipationLevel = ?, cooperationLevel = ?,
          emotionalState = ?, physicalState = ?, communicationQuality = ?,
          sessionTags = ?, achievedOutcomes = ?, followUpNeeded = ?,
          followUpPlan = ?, actionItems = ?,
          drpHizmetAlaniId = ?, drpBirId = ?, drpIkiId = ?, drpUcId = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND schoolId = ?
    `),
    extendSession: db.prepare(`
      UPDATE counseling_sessions 
      SET extensionGranted = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    extendSessionBySchool: db.prepare(`
      UPDATE counseling_sessions 
      SET extensionGranted = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND schoolId = ?
    `),
    getSessionsToAutoComplete: db.prepare(`
      SELECT * FROM counseling_sessions 
      WHERE completed = 0 
      AND (
        (extensionGranted = 0 AND 
         CAST((julianday('now', 'localtime') - julianday(sessionDate || ' ' || entryTime)) * 24 * 60 AS INTEGER) >= 60)
        OR 
        (extensionGranted = 1 AND 
         CAST((julianday('now', 'localtime') - julianday(sessionDate || ' ' || entryTime)) * 24 * 60 AS INTEGER) >= 75)
      )
    `),
    getSessionsToAutoCompleteBySchool: db.prepare(`
      SELECT * FROM counseling_sessions 
      WHERE completed = 0 AND schoolId = ?
      AND (
        (extensionGranted = 0 AND 
         CAST((julianday('now', 'localtime') - julianday(sessionDate || ' ' || entryTime)) * 24 * 60 AS INTEGER) >= 60)
        OR 
        (extensionGranted = 1 AND 
         CAST((julianday('now', 'localtime') - julianday(sessionDate || ' ' || entryTime)) * 24 * 60 AS INTEGER) >= 75)
      )
    `),
    autoCompleteSession: db.prepare(`
      UPDATE counseling_sessions 
      SET exitTime = ?, 
          exitClassHourId = NULL,
          completed = 1, 
          autoCompleted = 1, 
          detailedNotes = COALESCE(detailedNotes, '') || CHAR(10) || CHAR(10) || '⚠️ Bu görüşme otomatik olarak tamamlanmıştır (60+ dakika).',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND completed = 0
    `),
    deleteSession: db.prepare('DELETE FROM counseling_sessions WHERE id = ?'),
    getAppSettings: db.prepare('SELECT settings FROM app_settings WHERE id = 1')
  };
  
  isInitialized = true;
}

export function getAllSessions(): CounselingSession[] {
  ensureInitialized();
  return statements!.getAllSessions.all() as CounselingSession[];
}

export function getSessionsBySchool(schoolId: string): CounselingSession[] {
  ensureInitialized();
  return statements!.getSessionsBySchool.all(schoolId) as CounselingSession[];
}

export function getActiveSessions(): CounselingSession[] {
  ensureInitialized();
  return statements!.getActiveSessions.all() as CounselingSession[];
}

export function getActiveSessionsBySchool(schoolId: string): CounselingSession[] {
  ensureInitialized();
  return statements!.getActiveSessionsBySchool.all(schoolId) as CounselingSession[];
}

export function getSessionById(id: string): CounselingSession | null {
  ensureInitialized();
  return statements!.getSessionById.get(id) as CounselingSession | null;
}

export function getSessionByIdAndSchool(id: string, schoolId: string): CounselingSession | null {
  ensureInitialized();
  return statements!.getSessionByIdAndSchool.get(id, schoolId) as CounselingSession | null;
}

export function deleteSessionBySchool(id: string, schoolId: string): { changes: number } {
  ensureInitialized();
  const result = statements!.deleteSessionBySchool.run(id, schoolId);
  return { changes: result.changes };
}

export function getStudentsBySessionId(sessionId: string): Array<{ id: string; name: string; surname: string; class: string; studentNumber?: string; gender?: string }> {
  ensureInitialized();
  return statements!.getStudentsBySession.all(sessionId);
}

export function getStudentBySessionId(sessionId: string): { id: string; name: string; surname: string; class: string; studentNumber?: string; gender?: string } | null {
  ensureInitialized();
  return statements!.getStudentBySession.get(sessionId);
}

export function createSession(session: CounselingSession, studentIds: string[]): void {
  ensureInitialized();
  const db = getDatabase();
  
  const transaction = db.transaction(() => {
    statements!.insertSession.run(
      session.id,
      session.sessionType,
      session.groupName || null,
      session.counselorId,
      session.schoolId || null,
      session.sessionDate,
      session.entryTime,
      session.entryClassHourId || null,
      session.participantType,
      session.relationshipType || null,
      session.otherParticipants || null,
      session.parentName || null,
      session.parentRelationship || null,
      session.teacherName || null,
      session.teacherBranch || null,
      session.otherParticipantDescription || null,
      session.sessionMode,
      session.sessionLocation,
      session.disciplineStatus || null,
      session.institutionalCooperation || null,
      session.sessionDetails || null,
      0,
      session.drpHizmetAlaniId || null,
      session.drpBirId || null,
      session.drpIkiId || null,
      session.drpUcId || null
    );
    
    for (const studentId of studentIds) {
      statements!.insertSessionStudent.run(session.id, studentId);
    }
  });
  
  transaction();
}

export function completeSession(
  id: string,
  topic: string,
  exitTime: string,
  exitClassHourId: number | null,
  detailedNotes: string | null,
  autoCompleted: boolean,
  sessionFlow?: string,
  studentParticipationLevel?: string,
  cooperationLevel?: number,
  emotionalState?: string,
  physicalState?: string,
  communicationQuality?: string,
  sessionTags?: string | null,
  achievedOutcomes?: string | null,
  followUpNeeded?: number,
  followUpPlan?: string | null,
  actionItems?: string | null,
  drpHizmetAlaniId?: number | null,
  drpBirId?: number | null,
  drpIkiId?: number | null,
  drpUcId?: number | null
): { changes: number } {
  console.warn('[DEPRECATED] completeSession() called without schoolId. Use completeSessionBySchool() instead.');
  ensureInitialized();
  const result = statements!.completeSession.run(
    topic,
    exitTime,
    exitClassHourId || null,
    detailedNotes || null,
    autoCompleted ? 1 : 0,
    sessionFlow || null,
    studentParticipationLevel || null,
    cooperationLevel || null,
    emotionalState || null,
    physicalState || null,
    communicationQuality || null,
    sessionTags || null,
    achievedOutcomes || null,
    followUpNeeded !== undefined ? followUpNeeded : 0,
    followUpPlan || null,
    actionItems || null,
    drpHizmetAlaniId || null,
    drpBirId || null,
    drpIkiId || null,
    drpUcId || null,
    id
  );
  return { changes: result.changes };
}

export function completeSessionBySchool(
  id: string,
  schoolId: string,
  topic: string,
  exitTime: string,
  exitClassHourId: number | null,
  detailedNotes: string | null,
  autoCompleted: boolean,
  sessionFlow?: string,
  studentParticipationLevel?: string,
  cooperationLevel?: number,
  emotionalState?: string,
  physicalState?: string,
  communicationQuality?: string,
  sessionTags?: string | null,
  achievedOutcomes?: string | null,
  followUpNeeded?: number,
  followUpPlan?: string | null,
  actionItems?: string | null,
  drpHizmetAlaniId?: number | null,
  drpBirId?: number | null,
  drpIkiId?: number | null,
  drpUcId?: number | null
): { changes: number } {
  ensureInitialized();
  const result = statements!.completeSessionBySchool.run(
    topic,
    exitTime,
    exitClassHourId || null,
    detailedNotes || null,
    autoCompleted ? 1 : 0,
    sessionFlow || null,
    studentParticipationLevel || null,
    cooperationLevel || null,
    emotionalState || null,
    physicalState || null,
    communicationQuality || null,
    sessionTags || null,
    achievedOutcomes || null,
    followUpNeeded !== undefined ? followUpNeeded : 0,
    followUpPlan || null,
    actionItems || null,
    drpHizmetAlaniId || null,
    drpBirId || null,
    drpIkiId || null,
    drpUcId || null,
    id,
    schoolId
  );
  return { changes: result.changes };
}

export function extendSession(id: string): { changes: number } {
  console.warn('[DEPRECATED] extendSession() called without schoolId. Use extendSessionBySchool() instead.');
  ensureInitialized();
  const result = statements!.extendSession.run(id);
  return { changes: result.changes };
}

export function extendSessionBySchool(id: string, schoolId: string): { changes: number } {
  ensureInitialized();
  const result = statements!.extendSessionBySchool.run(id, schoolId);
  return { changes: result.changes };
}

export function getSessionsToAutoComplete(): CounselingSession[] {
  ensureInitialized();
  return statements!.getSessionsToAutoComplete.all() as CounselingSession[];
}

export function getSessionsToAutoCompleteBySchool(schoolId: string): CounselingSession[] {
  ensureInitialized();
  return statements!.getSessionsToAutoCompleteBySchool.all(schoolId) as CounselingSession[];
}

export function autoCompleteSession(id: string, exitTime: string): void {
  ensureInitialized();
  statements!.autoCompleteSession.run(exitTime, id);
}

export function deleteSession(id: string): { changes: number } {
  ensureInitialized();
  const result = statements!.deleteSession.run(id);
  return { changes: result.changes };
}

export function getAppSettings(): { settings: string } | undefined {
  ensureInitialized();
  const row = statements!.getAppSettings.get();
  return row;
}

export function getStudentSessionHistory(studentId: string): {
  sessionCount: number;
  lastSessionDate: string | null;
  topics: string[];
  history: Array<{ sessionId: string; sessionDate: string; topic: string; sessionMode: string; duration: number }>;
} {
  ensureInitialized();
  const db = getDatabase();
  
  interface SessionRow {
    id: string;
    sessionDate: string;
    topic: string;
    sessionMode: string;
    entryTime: string;
    exitTime: string | null;
  }

  // Get all completed sessions for this student
  const sessions = db.prepare(`
    SELECT cs.*, css.studentId
    FROM counseling_sessions cs
    INNER JOIN counseling_session_students css ON cs.id = css.sessionId
    WHERE css.studentId = ? AND cs.completed = 1
    ORDER BY cs.sessionDate DESC, cs.entryTime DESC
  `).all(studentId) as SessionRow[];

  // Extract topics
  const topics = [...new Set(sessions.map(s => s.topic).filter(Boolean))];
  
  // Get last session date
  const lastSessionDate = sessions.length > 0 ? sessions[0].sessionDate : null;
  
  // Map to history format
  const history = sessions.map((session: SessionRow) => {
    let duration = 0;
    if (session.exitTime && session.entryTime) {
      const [entryHour, entryMin] = session.entryTime.split(':').map(Number);
      const [exitHour, exitMin] = session.exitTime.split(':').map(Number);
      duration = (exitHour * 60 + exitMin) - (entryHour * 60 + entryMin);
    }
    
    return {
      sessionId: session.id,
      sessionDate: session.sessionDate,
      topic: session.topic,
      sessionMode: session.sessionMode,
      duration: duration
    };
  });
  
  return {
    sessionCount: sessions.length,
    lastSessionDate: lastSessionDate,
    topics: topics,
    history: history
  };
}

export function getFilteredSessions(filters: SessionFilters): CounselingSession[] {
  const db = getDatabase();
  
  let query = 'SELECT DISTINCT cs.* FROM counseling_sessions cs';
  const params: (string | number)[] = [];
  const whereConditions: string[] = [];
  
  if (filters.className || filters.studentId) {
    query += ' LEFT JOIN counseling_session_students css ON cs.id = css.sessionId';
    query += ' LEFT JOIN students s ON css.studentId = s.id';
  }
  
  if (filters.startDate && filters.startDate.trim() !== '') {
    whereConditions.push('cs.sessionDate >= ?');
    params.push(filters.startDate);
  }
  
  if (filters.endDate && filters.endDate.trim() !== '') {
    whereConditions.push('cs.sessionDate <= ?');
    params.push(filters.endDate);
  }
  
  if (filters.topic && filters.topic.trim() !== '') {
    whereConditions.push('LOWER(cs.topic) LIKE LOWER(?)');
    params.push(`%${filters.topic}%`);
  }
  
  if (filters.className && filters.className.trim() !== '') {
    whereConditions.push('s.class = ?');
    params.push(filters.className);
  }
  
  if (filters.status === 'completed') {
    whereConditions.push('cs.completed = 1');
  } else if (filters.status === 'active') {
    whereConditions.push('cs.completed = 0');
  }
  
  if (filters.participantType && filters.participantType.trim() !== '') {
    whereConditions.push('cs.participantType = ?');
    params.push(filters.participantType);
  }
  
  if (filters.sessionType && filters.sessionType !== 'all' && filters.sessionType.trim() !== '') {
    whereConditions.push('cs.sessionType = ?');
    params.push(filters.sessionType);
  }
  
  if (filters.sessionMode && filters.sessionMode.trim() !== '') {
    whereConditions.push('cs.sessionMode = ?');
    params.push(filters.sessionMode);
  }
  
  if (filters.studentId && filters.studentId.trim() !== '') {
    whereConditions.push('css.studentId = ?');
    params.push(filters.studentId);
  }
  
  if (whereConditions.length > 0) {
    query += ' WHERE ' + whereConditions.join(' AND ');
  }
  
  query += ' ORDER BY cs.sessionDate DESC, cs.entryTime DESC';
  
  const stmt = db.prepare(query);
  return stmt.all(...params) as CounselingSession[];
}

export function getFilteredSessionsBySchool(schoolId: string, filters: SessionFilters): CounselingSession[] {
  const db = getDatabase();
  
  let query = 'SELECT DISTINCT cs.* FROM counseling_sessions cs';
  const params: (string | number)[] = [];
  const whereConditions: string[] = ['cs.schoolId = ?'];
  params.push(schoolId);
  
  query += ' LEFT JOIN counseling_session_students css ON cs.id = css.sessionId';
  query += ' LEFT JOIN students s ON css.studentId = s.id';
  
  if (filters.startDate && filters.startDate.trim() !== '') {
    whereConditions.push('cs.sessionDate >= ?');
    params.push(filters.startDate);
  }
  
  if (filters.endDate && filters.endDate.trim() !== '') {
    whereConditions.push('cs.sessionDate <= ?');
    params.push(filters.endDate);
  }
  
  if (filters.topic && filters.topic.trim() !== '') {
    whereConditions.push('LOWER(cs.topic) LIKE LOWER(?)');
    params.push(`%${filters.topic}%`);
  }
  
  if (filters.className && filters.className.trim() !== '') {
    whereConditions.push('s.class = ?');
    params.push(filters.className);
  }
  
  if (filters.status === 'completed') {
    whereConditions.push('cs.completed = 1');
  } else if (filters.status === 'active') {
    whereConditions.push('cs.completed = 0');
  }
  
  if (filters.participantType && filters.participantType.trim() !== '') {
    whereConditions.push('cs.participantType = ?');
    params.push(filters.participantType);
  }
  
  if (filters.sessionType && filters.sessionType !== 'all' && filters.sessionType.trim() !== '') {
    whereConditions.push('cs.sessionType = ?');
    params.push(filters.sessionType);
  }
  
  if (filters.sessionMode && filters.sessionMode.trim() !== '') {
    whereConditions.push('cs.sessionMode = ?');
    params.push(filters.sessionMode);
  }
  
  if (filters.studentId && filters.studentId.trim() !== '') {
    whereConditions.push('css.studentId = ?');
    params.push(filters.studentId);
  }
  
  query += ' WHERE ' + whereConditions.join(' AND ');
  query += ' ORDER BY cs.sessionDate DESC, cs.entryTime DESC';
  
  const stmt = db.prepare(query);
  return stmt.all(...params) as CounselingSession[];
}
