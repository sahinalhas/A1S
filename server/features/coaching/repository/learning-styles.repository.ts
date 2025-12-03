import getDatabase from '../../../lib/database.js';
import type { LearningStyle } from '../types/coaching.types.js';
import type { Statement } from 'better-sqlite3';

let statements: { getLearningStylesByStudent: Statement; insertLearningStyle: Statement } | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getLearningStylesByStudent: db.prepare('SELECT * FROM learning_styles WHERE studentId = ? ORDER BY assessmentDate DESC'),
    insertLearningStyle: db.prepare(`
      INSERT INTO learning_styles (id, studentId, assessmentDate, visual, auditory, kinesthetic, reading, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `),
  };
  
  isInitialized = true;
}

export function getLearningStylesByStudent(studentId: string): LearningStyle[] {
  try {
    ensureInitialized();
    return statements!.getLearningStylesByStudent.all(studentId) as LearningStyle[];
  } catch (error) {
    console.error('Database error in getLearningStylesByStudent:', error);
    throw error;
  }
}

export function insertLearningStyle(record: LearningStyle): void {
  try {
    ensureInitialized();
    statements!.insertLearningStyle.run(
      record.id,
      record.studentId,
      record.assessmentDate,
      record.visual,
      record.auditory,
      record.kinesthetic,
      record.reading,
      record.notes
    );
  } catch (error) {
    console.error('Error inserting learning style:', error);
    throw error;
  }
}
