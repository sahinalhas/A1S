import getDatabase from '../../../lib/database/index.js';
import type { 
  ExamSession, 
  CreateExamSessionInput, 
  UpdateExamSessionInput 
} from '../../../../shared/types/exam-management.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAll: db.prepare(`
      SELECT * FROM exam_sessions 
      ORDER BY exam_date DESC, created_at DESC
    `),
    getAllBySchool: db.prepare(`
      SELECT * FROM exam_sessions 
      WHERE school_id = ?
      ORDER BY exam_date DESC, created_at DESC
    `),
    getAllByType: db.prepare(`
      SELECT * FROM exam_sessions 
      WHERE exam_type_id = ?
      ORDER BY exam_date DESC, created_at DESC
    `),
    getAllByTypeAndSchool: db.prepare(`
      SELECT * FROM exam_sessions 
      WHERE exam_type_id = ? AND school_id = ?
      ORDER BY exam_date DESC, created_at DESC
    `),
    getById: db.prepare('SELECT * FROM exam_sessions WHERE id = ?'),
    getByIdAndSchool: db.prepare('SELECT * FROM exam_sessions WHERE id = ? AND school_id = ?'),
    insert: db.prepare(`
      INSERT INTO exam_sessions (id, exam_type_id, school_id, name, exam_date, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `),
    update: db.prepare(`
      UPDATE exam_sessions 
      SET name = ?, exam_date = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND school_id = ?
    `),
    delete: db.prepare('DELETE FROM exam_sessions WHERE id = ?'),
    deleteBySchool: db.prepare(`
      DELETE FROM exam_sessions WHERE id = ? AND school_id = ?
    `),
  };
  
  isInitialized = true;
}

/**
 * @deprecated Bu fonksiyon schoolId filtresi kullanmıyor ve veri karışıklığına yol açabilir.
 * Bunun yerine getExamSessionsBySchool(schoolId) kullanın.
 */
export function getAllExamSessions(): ExamSession[] {
  console.warn('[DEPRECATED] getAllExamSessions() called without schoolId. Use getExamSessionsBySchool(schoolId) instead.');
  try {
    ensureInitialized();
    return statements.getAll.all() as ExamSession[];
  } catch (error) {
    console.error('Database error in getAllExamSessions:', error);
    return [];
  }
}

/**
 * Belirli bir okula ait sınav oturumlarını getirir.
 * @param schoolId - Okul ID'si (zorunlu)
 */
export function getExamSessionsBySchool(schoolId: string): ExamSession[] {
  if (!schoolId) {
    throw new Error('schoolId is required for getExamSessionsBySchool');
  }
  
  try {
    ensureInitialized();
    return statements.getAllBySchool.all(schoolId) as ExamSession[];
  } catch (error) {
    console.error('Database error in getExamSessionsBySchool:', error);
    return [];
  }
}

/**
 * @deprecated Bu fonksiyon schoolId filtresi kullanmıyor.
 * Bunun yerine getExamSessionsByTypeAndSchool(examTypeId, schoolId) kullanın.
 */
export function getExamSessionsByType(examTypeId: string): ExamSession[] {
  console.warn('[DEPRECATED] getExamSessionsByType() called without schoolId. Use getExamSessionsByTypeAndSchool(examTypeId, schoolId) instead.');
  try {
    ensureInitialized();
    return statements.getAllByType.all(examTypeId) as ExamSession[];
  } catch (error) {
    console.error('Database error in getExamSessionsByType:', error);
    return [];
  }
}

/**
 * Belirli bir okula ve sınav türüne ait sınav oturumlarını getirir.
 * @param examTypeId - Sınav türü ID'si
 * @param schoolId - Okul ID'si (zorunlu)
 */
export function getExamSessionsByTypeAndSchool(examTypeId: string, schoolId: string): ExamSession[] {
  if (!schoolId) {
    throw new Error('schoolId is required for getExamSessionsByTypeAndSchool');
  }
  
  try {
    ensureInitialized();
    return statements.getAllByTypeAndSchool.all(examTypeId, schoolId) as ExamSession[];
  } catch (error) {
    console.error('Database error in getExamSessionsByTypeAndSchool:', error);
    return [];
  }
}

/**
 * @deprecated Bu fonksiyon schoolId kontrolü yapmıyor.
 * Bunun yerine getExamSessionByIdAndSchool(id, schoolId) kullanın.
 */
export function getExamSessionById(id: string): ExamSession | null {
  console.warn('[DEPRECATED] getExamSessionById() called without schoolId. Use getExamSessionByIdAndSchool(id, schoolId) instead.');
  try {
    ensureInitialized();
    const result = statements.getById.get(id);
    return result ? (result as ExamSession) : null;
  } catch (error) {
    console.error('Database error in getExamSessionById:', error);
    return null;
  }
}

/**
 * Belirli bir okula ait sınav oturumunu ID ile getirir.
 * @param id - Sınav oturumu ID'si
 * @param schoolId - Okul ID'si (zorunlu)
 */
export function getExamSessionByIdAndSchool(id: string, schoolId: string): ExamSession | null {
  if (!schoolId) {
    throw new Error('schoolId is required for getExamSessionByIdAndSchool');
  }
  
  try {
    ensureInitialized();
    const result = statements.getByIdAndSchool.get(id, schoolId);
    return result ? (result as ExamSession) : null;
  } catch (error) {
    console.error('Database error in getExamSessionByIdAndSchool:', error);
    return null;
  }
}

/**
 * @deprecated Bu fonksiyon schoolId olmadan sınav oturumu oluşturur.
 * Bunun yerine createExamSessionForSchool(input, schoolId) kullanın.
 */
export function createExamSession(input: CreateExamSessionInput): ExamSession {
  console.warn('[DEPRECATED] createExamSession() called without schoolId. Use createExamSessionForSchool(input, schoolId) instead.');
  try {
    ensureInitialized();
    const id = `exam_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    statements.insert.run(
      id,
      input.exam_type_id,
      'school-default-001',
      input.name,
      input.exam_date,
      input.description || null,
      input.created_by || null
    );
    
    const created = statements.getById.get(id);
    if (!created) {
      throw new Error('Failed to create exam session');
    }
    
    return created as ExamSession;
  } catch (error) {
    console.error('Database error in createExamSession:', error);
    throw error;
  }
}

/**
 * Belirli bir okul için sınav oturumu oluşturur.
 * @param input - Sınav oturumu verileri
 * @param schoolId - Okul ID'si (zorunlu)
 */
export function createExamSessionForSchool(input: CreateExamSessionInput, schoolId: string): ExamSession {
  if (!schoolId) {
    throw new Error('schoolId is required for createExamSessionForSchool');
  }
  
  try {
    ensureInitialized();
    const id = `exam_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    statements.insert.run(
      id,
      input.exam_type_id,
      schoolId,
      input.name,
      input.exam_date,
      input.description || null,
      input.created_by || null
    );
    
    const created = statements.getByIdAndSchool.get(id, schoolId);
    if (!created) {
      throw new Error('Failed to create exam session');
    }
    
    return created as ExamSession;
  } catch (error) {
    console.error('Database error in createExamSessionForSchool:', error);
    throw error;
  }
}

/**
 * @deprecated Bu fonksiyon schoolId kontrolü yapmıyor.
 * Bunun yerine updateExamSessionForSchool(id, input, schoolId) kullanın.
 */
export function updateExamSession(id: string, input: UpdateExamSessionInput): ExamSession {
  console.warn('[DEPRECATED] updateExamSession() called without schoolId. Use updateExamSessionForSchool(id, input, schoolId) instead.');
  try {
    ensureInitialized();
    
    const existing = statements.getById.get(id);
    if (!existing) {
      throw new Error('Exam session not found');
    }
    
    const name = input.name ?? existing.name;
    const exam_date = input.exam_date ?? existing.exam_date;
    const description = input.description ?? existing.description;
    
    statements.update.run(name, exam_date, description, id, existing.school_id || 'school-default-001');
    
    const updated = statements.getById.get(id);
    if (!updated) {
      throw new Error('Failed to update exam session');
    }
    
    return updated as ExamSession;
  } catch (error) {
    console.error('Database error in updateExamSession:', error);
    throw error;
  }
}

/**
 * Belirli bir okula ait sınav oturumunu günceller.
 * @param id - Sınav oturumu ID'si
 * @param input - Güncellenecek veriler
 * @param schoolId - Okul ID'si (zorunlu)
 */
export function updateExamSessionForSchool(id: string, input: UpdateExamSessionInput, schoolId: string): ExamSession {
  if (!schoolId) {
    throw new Error('schoolId is required for updateExamSessionForSchool');
  }
  
  try {
    ensureInitialized();
    
    const existing = statements.getByIdAndSchool.get(id, schoolId);
    if (!existing) {
      throw new Error('Exam session not found or does not belong to this school');
    }
    
    const name = input.name ?? existing.name;
    const exam_date = input.exam_date ?? existing.exam_date;
    const description = input.description ?? existing.description;
    
    statements.update.run(name, exam_date, description, id, schoolId);
    
    const updated = statements.getByIdAndSchool.get(id, schoolId);
    if (!updated) {
      throw new Error('Failed to update exam session');
    }
    
    return updated as ExamSession;
  } catch (error) {
    console.error('Database error in updateExamSessionForSchool:', error);
    throw error;
  }
}

/**
 * @deprecated Bu fonksiyon schoolId kontrolü yapmıyor.
 * Bunun yerine deleteExamSessionBySchool(id, schoolId) kullanın.
 */
export function deleteExamSession(id: string): void {
  console.warn('[DEPRECATED] deleteExamSession() called without schoolId. Use deleteExamSessionBySchool(id, schoolId) instead.');
  try {
    ensureInitialized();
    statements.delete.run(id);
  } catch (error) {
    console.error('Database error in deleteExamSession:', error);
    throw error;
  }
}

/**
 * Belirli bir okula ait sınav oturumunu siler.
 * @param id - Sınav oturumu ID'si
 * @param schoolId - Okul ID'si (zorunlu)
 * @returns Silme işlemi başarılı olursa true
 */
export function deleteExamSessionBySchool(id: string, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('schoolId is required for deleteExamSessionBySchool');
  }
  
  try {
    ensureInitialized();
    const result = statements.deleteBySchool.run(id, schoolId);
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in deleteExamSessionBySchool:', error);
    throw error;
  }
}
