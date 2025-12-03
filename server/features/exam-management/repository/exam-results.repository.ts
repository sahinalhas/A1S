import getDatabase from '../../../lib/database/index.js';
import type { 
  ExamResult, 
  ExamResultWithDetails,
  CreateExamResultInput,
  UpdateExamResultInput,
  ExamResultsFilter
} from '../../../../shared/types/exam-management.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getById: db.prepare('SELECT * FROM exam_session_results WHERE id = ?'),
    getByIdAndSchool: db.prepare(`
      SELECT er.* FROM exam_session_results er
      INNER JOIN exam_sessions sess ON er.session_id = sess.id
      WHERE er.id = ? AND sess.school_id = ?
    `),
    getPenaltyDivisor: db.prepare(`
      SELECT et.penalty_divisor
      FROM exam_sessions sess
      LEFT JOIN exam_types et ON sess.exam_type_id = et.id
      WHERE sess.id = ?
    `),
    getBySession: db.prepare(`
      SELECT 
        er.*,
        s.name as student_name,
        es.subject_name,
        sess.name as session_name,
        sess.exam_type_id,
        et.penalty_divisor
      FROM exam_session_results er
      LEFT JOIN students s ON er.student_id = s.id
      LEFT JOIN exam_subjects es ON er.subject_id = es.id
      LEFT JOIN exam_sessions sess ON er.session_id = sess.id
      LEFT JOIN exam_types et ON sess.exam_type_id = et.id
      WHERE er.session_id = ?
      ORDER BY s.name, es.order_index
    `),
    getBySessionAndSchool: db.prepare(`
      SELECT 
        er.*,
        s.name as student_name,
        es.subject_name,
        sess.name as session_name,
        sess.exam_type_id,
        et.penalty_divisor
      FROM exam_session_results er
      LEFT JOIN students s ON er.student_id = s.id
      LEFT JOIN exam_subjects es ON er.subject_id = es.id
      INNER JOIN exam_sessions sess ON er.session_id = sess.id
      LEFT JOIN exam_types et ON sess.exam_type_id = et.id
      WHERE er.session_id = ? AND sess.school_id = ?
      ORDER BY s.name, es.order_index
    `),
    getByStudent: db.prepare(`
      SELECT 
        er.*,
        s.name as student_name,
        es.subject_name,
        sess.name as session_name,
        sess.exam_type_id,
        sess.exam_date,
        et.penalty_divisor
      FROM exam_session_results er
      LEFT JOIN students s ON er.student_id = s.id
      LEFT JOIN exam_subjects es ON er.subject_id = es.id
      LEFT JOIN exam_sessions sess ON er.session_id = sess.id
      LEFT JOIN exam_types et ON sess.exam_type_id = et.id
      WHERE er.student_id = ?
      ORDER BY sess.exam_date DESC, es.order_index
    `),
    getByStudentAndSchool: db.prepare(`
      SELECT 
        er.*,
        s.name as student_name,
        es.subject_name,
        sess.name as session_name,
        sess.exam_type_id,
        sess.exam_date,
        et.penalty_divisor
      FROM exam_session_results er
      LEFT JOIN students s ON er.student_id = s.id
      LEFT JOIN exam_subjects es ON er.subject_id = es.id
      INNER JOIN exam_sessions sess ON er.session_id = sess.id
      LEFT JOIN exam_types et ON sess.exam_type_id = et.id
      WHERE er.student_id = ? AND sess.school_id = ? AND s.schoolId = ?
      ORDER BY sess.exam_date DESC, es.order_index
    `),
    getBySessionAndStudent: db.prepare(`
      SELECT * FROM exam_session_results 
      WHERE session_id = ? AND student_id = ?
    `),
    checkExists: db.prepare(`
      SELECT id FROM exam_session_results 
      WHERE session_id = ? AND student_id = ? AND subject_id = ?
    `),
    insert: db.prepare(`
      INSERT INTO exam_session_results (
        id, session_id, student_id, subject_id, 
        correct_count, wrong_count, empty_count, net_score
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `),
    update: db.prepare(`
      UPDATE exam_session_results 
      SET correct_count = ?, wrong_count = ?, empty_count = ?, 
          net_score = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    updateBySchool: db.prepare(`
      UPDATE exam_session_results 
      SET correct_count = ?, wrong_count = ?, empty_count = ?, 
          net_score = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND session_id IN (SELECT id FROM exam_sessions WHERE school_id = ?)
    `),
    upsert: db.prepare(`
      INSERT INTO exam_session_results (
        id, session_id, student_id, subject_id, 
        correct_count, wrong_count, empty_count, net_score
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id, student_id, subject_id) 
      DO UPDATE SET
        correct_count = excluded.correct_count,
        wrong_count = excluded.wrong_count,
        empty_count = excluded.empty_count,
        net_score = excluded.net_score,
        updated_at = CURRENT_TIMESTAMP
    `),
    delete: db.prepare('DELETE FROM exam_session_results WHERE id = ?'),
    deleteBySchool: db.prepare(`
      DELETE FROM exam_session_results WHERE id = ? AND session_id IN (
        SELECT id FROM exam_sessions WHERE school_id = ?
      )
    `),
    deleteBySession: db.prepare('DELETE FROM exam_session_results WHERE session_id = ?'),
  };
  
  isInitialized = true;
}

function calculateNetScore(correct: number, wrong: number, penaltyDivisor: number = 4): number {
  return Math.max(0, correct - (wrong / penaltyDivisor));
}

export function getExamResultById(id: string): ExamResult | null {
  try {
    ensureInitialized();
    const result = statements.getById.get(id);
    return result ? (result as ExamResult) : null;
  } catch (error) {
    console.error('Database error in getExamResultById:', error);
    return null;
  }
}

export function getExamResultByIdAndSchool(id: string, schoolId: string): ExamResult | null {
  if (!schoolId) {
    throw new Error('schoolId is required for getExamResultByIdAndSchool');
  }
  try {
    ensureInitialized();
    const result = statements.getByIdAndSchool.get(id, schoolId);
    return result ? (result as ExamResult) : null;
  } catch (error) {
    console.error('Database error in getExamResultByIdAndSchool:', error);
    return null;
  }
}

export function getExamResultsBySession(sessionId: string): ExamResultWithDetails[] {
  try {
    ensureInitialized();
    return statements.getBySession.all(sessionId) as ExamResultWithDetails[];
  } catch (error) {
    console.error('Database error in getExamResultsBySession:', error);
    return [];
  }
}

export function getExamResultsBySessionAndSchool(sessionId: string, schoolId: string): ExamResultWithDetails[] {
  if (!schoolId) {
    throw new Error('schoolId is required for getExamResultsBySessionAndSchool');
  }
  try {
    ensureInitialized();
    return statements.getBySessionAndSchool.all(sessionId, schoolId) as ExamResultWithDetails[];
  } catch (error) {
    console.error('Database error in getExamResultsBySessionAndSchool:', error);
    return [];
  }
}

export function getExamResultsByStudent(studentId: string): ExamResultWithDetails[] {
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId) as ExamResultWithDetails[];
  } catch (error) {
    console.error('Database error in getExamResultsByStudent:', error);
    return [];
  }
}

export function getExamResultsByStudentAndSchool(studentId: string, schoolId: string): ExamResultWithDetails[] {
  if (!schoolId) {
    throw new Error('schoolId is required for getExamResultsByStudentAndSchool');
  }
  try {
    ensureInitialized();
    return statements.getByStudentAndSchool.all(studentId, schoolId, schoolId) as ExamResultWithDetails[];
  } catch (error) {
    console.error('Database error in getExamResultsByStudentAndSchool:', error);
    return [];
  }
}

export function getExamResultsBySessionAndStudent(sessionId: string, studentId: string): ExamResult[] {
  try {
    ensureInitialized();
    return statements.getBySessionAndStudent.all(sessionId, studentId) as ExamResult[];
  } catch (error) {
    console.error('Database error in getExamResultsBySessionAndStudent:', error);
    return [];
  }
}

export function createExamResult(input: CreateExamResultInput): ExamResult {
  try {
    ensureInitialized();
    
    const existing = statements.checkExists.get(
      input.session_id,
      input.student_id,
      input.subject_id
    );
    
    if (existing) {
      throw new Error('Exam result already exists for this student and subject');
    }
    
    const penaltyInfo = statements.getPenaltyDivisor.get(input.session_id) as { penalty_divisor: number } | undefined;
    const penaltyDivisor = penaltyInfo?.penalty_divisor || 4;
    
    const id = `exam_result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const netScore = calculateNetScore(input.correct_count, input.wrong_count, penaltyDivisor);
    
    statements.insert.run(
      id,
      input.session_id,
      input.student_id,
      input.subject_id,
      input.correct_count,
      input.wrong_count,
      input.empty_count,
      netScore
    );
    
    const created = statements.getById.get(id);
    if (!created) {
      throw new Error('Failed to create exam result');
    }
    
    return created as ExamResult;
  } catch (error) {
    console.error('Database error in createExamResult:', error);
    throw error;
  }
}

export function upsertExamResult(input: CreateExamResultInput): ExamResult {
  try {
    ensureInitialized();
    
    const existing = statements.checkExists.get(
      input.session_id,
      input.student_id,
      input.subject_id
    );
    
    const penaltyInfo = statements.getPenaltyDivisor.get(input.session_id) as { penalty_divisor: number } | undefined;
    const penaltyDivisor = penaltyInfo?.penalty_divisor || 4;
    
    const id = existing?.id || `exam_result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const netScore = calculateNetScore(input.correct_count, input.wrong_count, penaltyDivisor);
    
    statements.upsert.run(
      id,
      input.session_id,
      input.student_id,
      input.subject_id,
      input.correct_count,
      input.wrong_count,
      input.empty_count,
      netScore
    );
    
    const result = statements.checkExists.get(
      input.session_id,
      input.student_id,
      input.subject_id
    );
    
    if (!result) {
      throw new Error('Failed to upsert exam result');
    }
    
    const upserted = statements.getById.get(result.id);
    return upserted as ExamResult;
  } catch (error) {
    console.error('Database error in upsertExamResult:', error);
    throw error;
  }
}

export function updateExamResult(id: string, input: UpdateExamResultInput): ExamResult {
  try {
    ensureInitialized();
    
    const existing = statements.getById.get(id);
    if (!existing) {
      throw new Error('Exam result not found');
    }
    
    const penaltyInfo = statements.getPenaltyDivisor.get(existing.session_id) as { penalty_divisor: number } | undefined;
    const penaltyDivisor = penaltyInfo?.penalty_divisor || 4;
    
    const correctCount = input.correct_count ?? existing.correct_count;
    const wrongCount = input.wrong_count ?? existing.wrong_count;
    const emptyCount = input.empty_count ?? existing.empty_count;
    const netScore = calculateNetScore(correctCount, wrongCount, penaltyDivisor);
    
    statements.update.run(correctCount, wrongCount, emptyCount, netScore, id);
    
    const updated = statements.getById.get(id);
    if (!updated) {
      throw new Error('Failed to update exam result');
    }
    
    return updated as ExamResult;
  } catch (error) {
    console.error('Database error in updateExamResult:', error);
    throw error;
  }
}

export function deleteExamResult(id: string, schoolId?: string): void {
  try {
    ensureInitialized();
    if (schoolId) {
      statements.deleteBySchool.run(id, schoolId);
    } else {
      statements.delete.run(id);
    }
  } catch (error) {
    console.error('Database error in deleteExamResult:', error);
    throw error;
  }
}

export function deleteExamResultsBySession(sessionId: string): void {
  try {
    ensureInitialized();
    statements.deleteBySession.run(sessionId);
  } catch (error) {
    console.error('Database error in deleteExamResultsBySession:', error);
    throw error;
  }
}

export function batchUpsertExamResults(results: CreateExamResultInput[]): ExamResult[] {
  try {
    ensureInitialized();
    const db = getDatabase();
    const created: ExamResult[] = [];
    
    const transaction = db.transaction(() => {
      for (const result of results) {
        const upserted = upsertExamResult(result);
        created.push(upserted);
      }
    });
    
    transaction();
    return created;
  } catch (error) {
    console.error('Database error in batchUpsertExamResults:', error);
    throw error;
  }
}
