import getDatabase from '../../../lib/database.js';
import type { Progress, AcademicGoal } from '../types/progress.types.js';

let statements: {
  getAllProgress: any;
  getProgressByStudent: any;
  upsertProgress: any;
  getAcademicGoalsByStudent: any;
  upsertAcademicGoal: any;
  deleteAcademicGoalsByStudents: any;
} | null = null;

function ensureStatements() {
  if (statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAllProgress: db.prepare('SELECT * FROM progress ORDER BY lastStudied DESC'),
    getProgressByStudent: db.prepare('SELECT * FROM progress WHERE studentId = ? ORDER BY lastStudied DESC'),
    upsertProgress: db.prepare(`
      INSERT INTO progress (id, studentId, topicId, completed, remaining, lastStudied, notes, completedFlag, reviewCount, nextReviewDate, questionsSolved, questionsCorrect, questionsWrong)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(studentId, topicId) DO UPDATE SET
        completed = excluded.completed,
        remaining = excluded.remaining,
        lastStudied = excluded.lastStudied,
        notes = excluded.notes,
        completedFlag = excluded.completedFlag,
        reviewCount = excluded.reviewCount,
        nextReviewDate = excluded.nextReviewDate,
        questionsSolved = excluded.questionsSolved,
        questionsCorrect = excluded.questionsCorrect,
        questionsWrong = excluded.questionsWrong,
        updated_at = CURRENT_TIMESTAMP
    `),
    getAcademicGoalsByStudent: db.prepare('SELECT * FROM academic_goals WHERE studentId = ? ORDER BY deadline'),
    upsertAcademicGoal: db.prepare(`
      INSERT INTO academic_goals (id, studentId, title, description, targetScore, currentScore, examType, deadline, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        targetScore = excluded.targetScore,
        currentScore = excluded.currentScore,
        examType = excluded.examType,
        deadline = excluded.deadline,
        status = excluded.status
    `),
    deleteAcademicGoalsByStudents: db.prepare('DELETE FROM academic_goals WHERE studentId IN (SELECT value FROM json_each(?))')
  };
}

export function getAllProgress(): Progress[] {
  try {
    ensureStatements();
    return statements!.getAllProgress.all() as Progress[];
  } catch (error) {
    console.error('Error loading all progress:', error);
    return [];
  }
}

export function getProgressByStudent(studentId: string): Progress[] {
  try {
    ensureStatements();
    return statements!.getProgressByStudent.all(studentId) as Progress[];
  } catch (error) {
    console.error('Error loading progress:', error);
    return [];
  }
}

export function saveProgress(progress: Progress[]) {
  ensureStatements();
  const transaction = getDatabase().transaction(() => {
    for (const p of progress) {
      statements!.upsertProgress.run(
        p.id, p.studentId, p.topicId, p.completed,
        p.remaining, p.lastStudied, p.notes,
        p.completedFlag ? 1 : 0,
        p.reviewCount || 0,
        p.nextReviewDate || null,
        p.questionsSolved || 0,
        p.questionsCorrect || 0,
        p.questionsWrong || 0
      );
    }
  });
  
  transaction();
}

export function getAcademicGoalsByStudent(studentId: string): AcademicGoal[] {
  try {
    ensureStatements();
    return statements!.getAcademicGoalsByStudent.all(studentId) as AcademicGoal[];
  } catch (error) {
    console.error('Error loading academic goals:', error);
    return [];
  }
}

export function saveAcademicGoals(goals: AcademicGoal[], options?: { studentIds?: string[], clearAll?: boolean }) {
  ensureStatements();
  const transaction = getDatabase().transaction(() => {
    let targetStudentIds: string[];
    
    if (options?.clearAll) {
      getDatabase().prepare('DELETE FROM academic_goals').run();
    } else if (options?.studentIds) {
      targetStudentIds = options.studentIds;
    } else if (goals.length > 0) {
      targetStudentIds = [...new Set(goals.map(g => g.studentId))];
    } else {
      console.error('saveAcademicGoals: Cannot clear goals without student context. Use options.studentIds or options.clearAll');
      throw new Error('Cannot clear academic goals without explicit student context. Provide studentIds in options.');
    }
    
    if (targetStudentIds!) {
      statements!.deleteAcademicGoalsByStudents.run(JSON.stringify(targetStudentIds));
    }
    
    for (const goal of goals) {
      statements!.upsertAcademicGoal.run(
        goal.id, goal.studentId, goal.title, goal.description,
        goal.targetScore, goal.currentScore, goal.examType,
        goal.deadline, goal.status
      );
    }
  });
  
  transaction();
}
