import type Database from 'better-sqlite3';
import getDatabase from '../../../lib/database.js';
import { buildDynamicUpdate } from '../../../utils/helpers/repository.js';
import type { AcademicGoal } from '../types/coaching.types.js';

interface AcademicGoalStatements {
  getAllAcademicGoals: Database.Statement;
  getAcademicGoalsByStudent: Database.Statement;
  insertAcademicGoal: Database.Statement;
  upsertAcademicGoal: Database.Statement;
  deleteAcademicGoal: Database.Statement;
}

let statements: AcademicGoalStatements | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAllAcademicGoals: db.prepare('SELECT * FROM academic_goals ORDER BY created_at DESC'),
    getAcademicGoalsByStudent: db.prepare('SELECT * FROM academic_goals WHERE studentId = ? ORDER BY deadline'),
    insertAcademicGoal: db.prepare(`
      INSERT INTO academic_goals (id, studentId, title, description, targetScore, currentScore, examType, deadline, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    upsertAcademicGoal: db.prepare(`
      INSERT INTO academic_goals (id, studentId, title, description, targetScore, currentScore, examType, deadline, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        studentId = excluded.studentId,
        title = excluded.title,
        description = excluded.description,
        targetScore = excluded.targetScore,
        currentScore = excluded.currentScore,
        examType = excluded.examType,
        deadline = excluded.deadline,
        status = excluded.status
    `),
    deleteAcademicGoal: db.prepare('DELETE FROM academic_goals WHERE id = ?'),
    deleteAcademicGoalBySchool: db.prepare(`
      DELETE FROM academic_goals WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)
    `),
  };
  
  isInitialized = true;
}

export function getAllAcademicGoals(): AcademicGoal[] {
  try {
    ensureInitialized();
    if (!statements) throw new Error('Statements not initialized');
    return statements.getAllAcademicGoals.all() as AcademicGoal[];
  } catch (error) {
    console.error('Database error in getAllAcademicGoals:', error);
    throw error;
  }
}

export function getAcademicGoalsByStudent(studentId: string): AcademicGoal[] {
  try {
    ensureInitialized();
    if (!statements) throw new Error('Statements not initialized');
    return statements.getAcademicGoalsByStudent.all(studentId) as AcademicGoal[];
  } catch (error) {
    console.error('Database error in getAcademicGoalsByStudent:', error);
    throw error;
  }
}

export function insertAcademicGoal(goal: AcademicGoal): void {
  try {
    ensureInitialized();
    if (!statements) throw new Error('Statements not initialized');
    statements.insertAcademicGoal.run(
      goal.id,
      goal.studentId,
      goal.title,
      goal.description,
      goal.targetScore,
      goal.currentScore,
      goal.examType,
      goal.deadline,
      goal.status || 'active'
    );
  } catch (error) {
    console.error('Error inserting academic goal:', error);
    throw error;
  }
}

export function updateAcademicGoal(id: string, updates: Partial<AcademicGoal>): void {
  try {
    ensureInitialized();
    if (!statements) throw new Error('Statements not initialized');
    const db = getDatabase();
    
    buildDynamicUpdate(db, {
      tableName: 'academic_goals',
      id,
      updates,
      allowedFields: ['title', 'description', 'targetScore', 'currentScore', 'examType', 'deadline', 'status']
    });
  } catch (error) {
    console.error('Error updating academic goal:', error);
    throw error;
  }
}

export function upsertAcademicGoal(goal: AcademicGoal): void {
  try {
    ensureInitialized();
    if (!statements) throw new Error('Statements not initialized');
    statements.upsertAcademicGoal.run(
      goal.id,
      goal.studentId,
      goal.title,
      goal.description,
      goal.targetScore,
      goal.currentScore,
      goal.examType,
      goal.deadline,
      goal.status || 'active'
    );
  } catch (error) {
    console.error('Error upserting academic goal:', error);
    throw error;
  }
}

export function deleteAcademicGoal(id: string, schoolId?: string): void {
  try {
    ensureInitialized();
    if (!statements) throw new Error('Statements not initialized');
    if (schoolId) {
      statements.deleteAcademicGoalBySchool.run(id, schoolId);
    } else {
      statements.deleteAcademicGoal.run(id);
    }
  } catch (error) {
    console.error('Error deleting academic goal:', error);
    throw error;
  }
}
