import getDatabase from '../../../lib/database.js';
import type { StudySession } from '../types/sessions.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getStudySessionsByStudent: db.prepare('SELECT * FROM study_sessions WHERE studentId = ? ORDER BY startTime DESC'),
    getStudySessionsByStudentAndSchool: db.prepare(`
      SELECT ss.* FROM study_sessions ss
      INNER JOIN students s ON ss.studentId = s.id
      WHERE ss.studentId = ? AND s.schoolId = ?
      ORDER BY ss.startTime DESC
    `),
    insertStudySession: db.prepare(`
      INSERT INTO study_sessions (id, studentId, topicId, startTime, endTime, duration, notes, efficiency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
  };
  
  isInitialized = true;
}

export function getStudySessionsByStudent(studentId: string): StudySession[] {
  console.warn('[DEPRECATED] getStudySessionsByStudent() called without schoolId. Use getStudySessionsByStudentAndSchool() instead.');
  try {
    ensureInitialized();
    return statements.getStudySessionsByStudent.all(studentId) as StudySession[];
  } catch (error) {
    console.error('Database error in getStudySessionsByStudent:', error);
    throw error;
  }
}

export function getStudySessionsByStudentAndSchool(studentId: string, schoolId: string): StudySession[] {
  if (!schoolId) {
    throw new Error('schoolId is required for getStudySessionsByStudentAndSchool');
  }
  
  try {
    ensureInitialized();
    return statements.getStudySessionsByStudentAndSchool.all(studentId, schoolId) as StudySession[];
  } catch (error) {
    console.error('Database error in getStudySessionsByStudentAndSchool:', error);
    throw error;
  }
}

export function insertStudySession(session: StudySession): void {
  try {
    ensureInitialized();
    statements.insertStudySession.run(
      session.id,
      session.studentId,
      session.topicId,
      session.startTime,
      session.endTime,
      session.duration,
      session.notes,
      session.efficiency
    );
  } catch (error) {
    console.error('Error inserting study session:', error);
    throw error;
  }
}
