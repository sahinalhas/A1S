import getDatabase from '../../../lib/database/index.js';
import { randomUUID } from 'crypto';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getByStudent: db.prepare(`
      SELECT h.*, 
             s.subject_name,
             e.name as exam_type_name
      FROM subject_performance_heatmap h
      LEFT JOIN exam_subjects s ON h.subject_id = s.id
      LEFT JOIN exam_types e ON h.exam_type_id = e.id
      WHERE h.student_id = ? AND h.exam_type_id = ?
      ORDER BY h.performance_score ASC
    `),
    getById: db.prepare('SELECT * FROM subject_performance_heatmap WHERE id = ?'),
    upsert: db.prepare(`
      INSERT INTO subject_performance_heatmap (
        id, student_id, subject_id, exam_type_id, performance_score, 
        trend, last_6_avg, last_12_avg, total_sessions, strength_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(student_id, subject_id, exam_type_id) DO UPDATE SET
        performance_score = excluded.performance_score,
        trend = excluded.trend,
        last_6_avg = excluded.last_6_avg,
        last_12_avg = excluded.last_12_avg,
        total_sessions = excluded.total_sessions,
        strength_level = excluded.strength_level,
        updated_at = CURRENT_TIMESTAMP
    `),
  };
  
  isInitialized = true;
}

export function getHeatmapByStudent(studentId: string, examTypeId: string): unknown[] {
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId, examTypeId);
  } catch (error) {
    console.error('Database error in getHeatmapByStudent:', error);
    return [];
  }
}

export function updateHeatmap(data: {
  student_id: string;
  subject_id: string;
  exam_type_id: string;
  performance_score: number;
  trend: string;
  last_6_avg: number;
  last_12_avg: number;
  total_sessions: number;
  strength_level: string;
}): boolean {
  try {
    ensureInitialized();
    const id = randomUUID();
    
    statements.upsert.run(
      id,
      data.student_id,
      data.subject_id,
      data.exam_type_id,
      data.performance_score,
      data.trend,
      data.last_6_avg,
      data.last_12_avg,
      data.total_sessions,
      data.strength_level
    );
    return true;
  } catch (error) {
    console.error('Database error in updateHeatmap:', error);
    return false;
  }
}
