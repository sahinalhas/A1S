import getDatabase from '../../../lib/database.js';
import type { SelfAssessment } from '../types/coaching.types.js';
import type { Statement } from 'better-sqlite3';

let statements: { getSelfAssessmentsByStudent: Statement; insertSelfAssessment: Statement } | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getSelfAssessmentsByStudent: db.prepare('SELECT * FROM self_assessments WHERE studentId = ? ORDER BY assessmentDate DESC'),
    insertSelfAssessment: db.prepare(`
      INSERT INTO self_assessments (id, studentId, moodRating, motivationLevel, stressLevel, 
                                    confidenceLevel, studyDifficulty, socialInteraction, sleepQuality, 
                                    physicalActivity, dailyGoalsAchieved, todayHighlight, todayChallenge, 
                                    tomorrowGoal, notes, assessmentDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
  };
  
  isInitialized = true;
}

export function getSelfAssessmentsByStudent(studentId: string): SelfAssessment[] {
  try {
    ensureInitialized();
    return statements!.getSelfAssessmentsByStudent.all(studentId) as SelfAssessment[];
  } catch (error) {
    console.error('Database error in getSelfAssessmentsByStudent:', error);
    throw error;
  }
}

export function insertSelfAssessment(assessment: SelfAssessment): void {
  try {
    ensureInitialized();
    statements!.insertSelfAssessment.run(
      assessment.id,
      assessment.studentId,
      assessment.moodRating,
      assessment.motivationLevel,
      assessment.stressLevel,
      assessment.confidenceLevel,
      assessment.studyDifficulty,
      assessment.socialInteraction,
      assessment.sleepQuality,
      assessment.physicalActivity,
      assessment.dailyGoalsAchieved,
      assessment.todayHighlight,
      assessment.todayChallenge,
      assessment.tomorrowGoal,
      assessment.notes,
      assessment.assessmentDate
    );
  } catch (error) {
    console.error('Error inserting self assessment:', error);
    throw error;
  }
}
