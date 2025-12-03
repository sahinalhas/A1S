import getDatabase from '../../../lib/database.js';
import { buildDynamicUpdate } from '../../../utils/helpers/repository.js';
import type { CoachingRecommendation } from '../types/coaching.types.js';
import type { Statement } from 'better-sqlite3';

let statements: { getCoachingRecommendationsByStudent: Statement; insertCoachingRecommendation: Statement } | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getCoachingRecommendationsByStudent: db.prepare('SELECT * FROM coaching_recommendations WHERE studentId = ? ORDER BY created_at DESC'),
    insertCoachingRecommendation: db.prepare(`
      INSERT INTO coaching_recommendations (id, studentId, type, title, description, priority, 
                                           status, automated, implementationSteps, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
  };
  
  isInitialized = true;
}

export function getCoachingRecommendationsByStudent(studentId: string): CoachingRecommendation[] {
  try {
    ensureInitialized();
    const recs = statements!.getCoachingRecommendationsByStudent.all(studentId) as CoachingRecommendation[];
    
    return recs.map((rec) => ({
      ...rec,
      implementationSteps: rec.implementationSteps ? JSON.parse(rec.implementationSteps as unknown as string) : []
    }));
  } catch (error) {
    console.error('Database error in getCoachingRecommendationsByStudent:', error);
    throw error;
  }
}

export function insertCoachingRecommendation(rec: CoachingRecommendation): void {
  try {
    ensureInitialized();
    const stepsJson = JSON.stringify(rec.implementationSteps || []);
    
    statements!.insertCoachingRecommendation.run(
      rec.id,
      rec.studentId,
      rec.type,
      rec.title,
      rec.description,
      rec.priority,
      rec.status || 'Öneri',
      rec.automated ? 1 : 0,
      stepsJson,
      rec.createdAt
    );
  } catch (error) {
    console.error('Error inserting coaching recommendation:', error);
    throw error;
  }
}

export function updateCoachingRecommendation(id: string, updates: Partial<CoachingRecommendation>): void {
  try {
    ensureInitialized();
    const db = getDatabase();
    
    buildDynamicUpdate(db, {
      tableName: 'coaching_recommendations',
      id,
      updates,
      allowedFields: ['type', 'title', 'description', 'priority', 'status', 'implementationSteps'],
      jsonFields: ['implementationSteps']
    });
  } catch (error) {
    console.error('Error updating coaching recommendation:', error);
    throw error;
  }
}
