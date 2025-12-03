import getDatabase from '../../../lib/database.js';
import type { Achievement } from '../types/coaching.types.js';
import type { Statement } from 'better-sqlite3';

let statements: { getAchievementsByStudent: Statement; insertAchievement: Statement } | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAchievementsByStudent: db.prepare('SELECT * FROM achievements WHERE studentId = ? ORDER BY earnedAt DESC'),
    insertAchievement: db.prepare(`
      INSERT INTO achievements (id, studentId, title, description, category, earnedAt, points)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `),
  };
  
  isInitialized = true;
}

export function getAchievementsByStudent(studentId: string): Achievement[] {
  try {
    ensureInitialized();
    return statements!.getAchievementsByStudent.all(studentId) as Achievement[];
  } catch (error) {
    console.error('Database error in getAchievementsByStudent:', error);
    throw error;
  }
}

export function insertAchievement(achievement: Achievement): void {
  try {
    ensureInitialized();
    statements!.insertAchievement.run(
      achievement.id,
      achievement.studentId,
      achievement.title,
      achievement.description,
      achievement.category,
      achievement.earnedAt,
      achievement.points || 0
    );
  } catch (error) {
    console.error('Error inserting achievement:', error);
    throw error;
  }
}
