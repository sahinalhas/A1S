import getDatabase from '../../../lib/database/index.js';
import type { ExamType, ExamSubject } from '../../../../shared/types/exam-management.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAllTypes: db.prepare('SELECT * FROM exam_types WHERE is_active = 1 ORDER BY name'),
    getTypeById: db.prepare('SELECT * FROM exam_types WHERE id = ?'),
    getSubjectsByType: db.prepare('SELECT * FROM exam_subjects WHERE exam_type_id = ? ORDER BY order_index'),
    getSubjectById: db.prepare('SELECT * FROM exam_subjects WHERE id = ?'),
  };
  
  isInitialized = true;
}

export function getAllExamTypes(): ExamType[] {
  try {
    ensureInitialized();
    return statements.getAllTypes.all() as ExamType[];
  } catch (error) {
    console.error('Database error in getAllExamTypes:', error);
    return [];
  }
}

export function getExamTypeById(id: string): ExamType | null {
  try {
    ensureInitialized();
    const result = statements.getTypeById.get(id);
    return result ? (result as ExamType) : null;
  } catch (error) {
    console.error('Database error in getExamTypeById:', error);
    return null;
  }
}

export function getSubjectsByExamType(examTypeId: string): ExamSubject[] {
  try {
    ensureInitialized();
    return statements.getSubjectsByType.all(examTypeId) as ExamSubject[];
  } catch (error) {
    console.error('Database error in getSubjectsByExamType:', error);
    return [];
  }
}

export function getSubjectById(id: string): ExamSubject | null {
  try {
    ensureInitialized();
    const result = statements.getSubjectById.get(id);
    return result ? (result as ExamSubject) : null;
  } catch (error) {
    console.error('Database error in getSubjectById:', error);
    return null;
  }
}
