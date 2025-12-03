import getDatabase from '../../../lib/database.js';
import { buildDynamicUpdate } from '../../../utils/helpers/repository.js';
import type { SmartGoal } from '../types/coaching.types.js';
import type { Statement } from 'better-sqlite3';

let statements: { getSmartGoalsByStudent: Statement; insertSmartGoal: Statement } | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getSmartGoalsByStudent: db.prepare('SELECT * FROM smart_goals WHERE studentId = ? ORDER BY created_at DESC'),
    insertSmartGoal: db.prepare(`
      INSERT INTO smart_goals (id, studentId, title, specific, measurable, achievable, relevant, 
                              timeBound, category, status, progress, startDate, targetDate, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
  };
  
  isInitialized = true;
}

export function getSmartGoalsByStudent(studentId: string): SmartGoal[] {
  try {
    ensureInitialized();
    return statements!.getSmartGoalsByStudent.all(studentId) as SmartGoal[];
  } catch (error) {
    console.error('Database error in getSmartGoalsByStudent:', error);
    throw error;
  }
}

export function insertSmartGoal(goal: SmartGoal): void {
  try {
    ensureInitialized();
    statements!.insertSmartGoal.run(
      goal.id,
      goal.studentId,
      goal.title,
      goal.specific,
      goal.measurable,
      goal.achievable,
      goal.relevant,
      goal.timeBound,
      goal.category,
      goal.status || 'active',
      goal.progress || 0,
      goal.startDate,
      goal.targetDate,
      goal.notes
    );
  } catch (error) {
    console.error('Error inserting smart goal:', error);
    throw error;
  }
}

export function updateSmartGoal(id: string, updates: Partial<SmartGoal>): void {
  try {
    ensureInitialized();
    const db = getDatabase();
    
    buildDynamicUpdate(db, {
      tableName: 'smart_goals',
      id,
      updates,
      allowedFields: ['title', 'specific', 'measurable', 'achievable', 'relevant', 'timeBound', 
                     'category', 'status', 'progress', 'startDate', 'targetDate', 'notes']
    });
  } catch (error) {
    console.error('Error updating smart goal:', error);
    throw error;
  }
}
