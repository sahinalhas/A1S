import getDatabase from '../../../lib/database/index.js';
import type { ExamBenchmark } from '../../../../shared/types/exam-management.types.js';
import { randomUUID } from 'crypto';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getBySession: db.prepare(`
      SELECT b.*, 
             s.fullName as student_name,
             es.name as session_name
      FROM exam_benchmarks b
      LEFT JOIN students s ON b.student_id = s.id
      LEFT JOIN exam_sessions es ON b.session_id = es.id
      WHERE b.session_id = ?
      ORDER BY b.percentile DESC
    `),
    getByStudent: db.prepare(`
      SELECT b.*, 
             es.name as session_name,
             es.exam_date
      FROM exam_benchmarks b
      LEFT JOIN exam_sessions es ON b.session_id = es.id
      WHERE b.student_id = ?
      ORDER BY es.exam_date DESC
    `),
    getById: db.prepare('SELECT * FROM exam_benchmarks WHERE id = ?'),
    create: db.prepare(`
      INSERT INTO exam_benchmarks (
        id, session_id, student_id, total_net, class_avg, school_avg,
        percentile, rank, total_participants, deviation_from_avg, performance_category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    upsert: db.prepare(`
      INSERT INTO exam_benchmarks (
        id, session_id, student_id, total_net, class_avg, school_avg,
        percentile, rank, total_participants, deviation_from_avg, performance_category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id, student_id) DO UPDATE SET
        total_net = excluded.total_net,
        class_avg = excluded.class_avg,
        school_avg = excluded.school_avg,
        percentile = excluded.percentile,
        rank = excluded.rank,
        total_participants = excluded.total_participants,
        deviation_from_avg = excluded.deviation_from_avg,
        performance_category = excluded.performance_category
    `),
  };
  
  isInitialized = true;
}

export function getBenchmarksBySession(sessionId: string): unknown[] {
  try {
    ensureInitialized();
    return statements.getBySession.all(sessionId);
  } catch (error) {
    console.error('Database error in getBenchmarksBySession:', error);
    return [];
  }
}

export function getBenchmarksByStudent(studentId: string): unknown[] {
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId);
  } catch (error) {
    console.error('Database error in getBenchmarksByStudent:', error);
    return [];
  }
}

export function createOrUpdateBenchmark(data: {
  session_id: string;
  student_id: string;
  total_net: number;
  class_avg: number;
  school_avg: number;
  percentile: number;
  rank?: number;
  total_participants?: number;
  performance_category?: string;
}): boolean {
  try {
    ensureInitialized();
    const id = randomUUID();
    const deviation = data.total_net - data.class_avg;
    
    statements.upsert.run(
      id,
      data.session_id,
      data.student_id,
      data.total_net,
      data.class_avg,
      data.school_avg,
      data.percentile,
      data.rank || null,
      data.total_participants || null,
      deviation,
      data.performance_category || null
    );
    return true;
  } catch (error) {
    console.error('Database error in createOrUpdateBenchmark:', error);
    return false;
  }
}
