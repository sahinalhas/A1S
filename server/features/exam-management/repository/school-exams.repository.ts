import getDatabase from '../../../lib/database/index.js';
import type { 
  SchoolExamResult,
  CreateSchoolExamResultInput,
  UpdateSchoolExamResultInput,
  SchoolExamResultsFilter
} from '../../../../shared/types/exam-management.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getById: db.prepare('SELECT * FROM school_exam_results WHERE id = ?'),
    getByStudent: db.prepare(`
      SELECT * FROM school_exam_results 
      WHERE student_id = ?
      ORDER BY exam_date DESC, subject_name
    `),
    insert: db.prepare(`
      INSERT INTO school_exam_results (
        id, student_id, subject_name, exam_type, score, max_score,
        exam_date, semester, year, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    update: db.prepare(`
      UPDATE school_exam_results 
      SET subject_name = ?, exam_type = ?, score = ?, max_score = ?,
          exam_date = ?, semester = ?, year = ?, notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    delete: db.prepare('DELETE FROM school_exam_results WHERE id = ?'),
  };
  
  isInitialized = true;
}

export function getSchoolExamResultById(id: string): SchoolExamResult | null {
  try {
    ensureInitialized();
    const result = statements.getById.get(id);
    return result ? (result as SchoolExamResult) : null;
  } catch (error) {
    console.error('Database error in getSchoolExamResultById:', error);
    return null;
  }
}

export function getSchoolExamResultsByStudent(studentId: string): SchoolExamResult[] {
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId) as SchoolExamResult[];
  } catch (error) {
    console.error('Database error in getSchoolExamResultsByStudent:', error);
    return [];
  }
}

export function createSchoolExamResult(input: CreateSchoolExamResultInput): SchoolExamResult {
  try {
    ensureInitialized();
    const id = `school_exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    statements.insert.run(
      id,
      input.student_id,
      input.subject_name,
      input.exam_type,
      input.score,
      input.max_score || 100,
      input.exam_date,
      input.semester || null,
      input.year || null,
      input.notes || null
    );
    
    const created = statements.getById.get(id);
    if (!created) {
      throw new Error('Failed to create school exam result');
    }
    
    return created as SchoolExamResult;
  } catch (error) {
    console.error('Database error in createSchoolExamResult:', error);
    throw error;
  }
}

export function updateSchoolExamResult(id: string, input: UpdateSchoolExamResultInput): SchoolExamResult {
  try {
    ensureInitialized();
    
    const existing = statements.getById.get(id);
    if (!existing) {
      throw new Error('School exam result not found');
    }
    
    const subjectName = input.subject_name ?? existing.subject_name;
    const examType = input.exam_type ?? existing.exam_type;
    const score = input.score ?? existing.score;
    const maxScore = input.max_score ?? existing.max_score;
    const examDate = input.exam_date ?? existing.exam_date;
    const semester = input.semester ?? existing.semester;
    const year = input.year ?? existing.year;
    const notes = input.notes ?? existing.notes;
    
    statements.update.run(
      subjectName, examType, score, maxScore, examDate, 
      semester, year, notes, id
    );
    
    const updated = statements.getById.get(id);
    if (!updated) {
      throw new Error('Failed to update school exam result');
    }
    
    return updated as SchoolExamResult;
  } catch (error) {
    console.error('Database error in updateSchoolExamResult:', error);
    throw error;
  }
}

export function deleteSchoolExamResult(id: string): void {
  try {
    ensureInitialized();
    statements.delete.run(id);
  } catch (error) {
    console.error('Database error in deleteSchoolExamResult:', error);
    throw error;
  }
}
