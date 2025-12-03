/**
 * Strengths Repository
 * Öğrenci Güçlü Yönleri Veri Erişim Katmanı
 * 
 * [SECURITY] Tüm sorgular schoolId ile filtrelenerek okul veri izolasyonu sağlanır
 */

import getDatabase from '../../../lib/database.js';
import type { StudentStrength } from '../../../../shared/types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getByStudent: db.prepare('SELECT * FROM student_strengths WHERE studentId = ? ORDER BY assessmentDate DESC'),
    getByStudentAndSchool: db.prepare(`
      SELECT ss.* FROM student_strengths ss
      INNER JOIN students s ON ss.studentId = s.id
      WHERE ss.studentId = ? AND s.schoolId = ?
      ORDER BY ss.assessmentDate DESC
    `),
    getLatestByStudent: db.prepare('SELECT * FROM student_strengths WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 1'),
    getLatestByStudentAndSchool: db.prepare(`
      SELECT ss.* FROM student_strengths ss
      INNER JOIN students s ON ss.studentId = s.id
      WHERE ss.studentId = ? AND s.schoolId = ?
      ORDER BY ss.assessmentDate DESC LIMIT 1
    `),
    getById: db.prepare('SELECT * FROM student_strengths WHERE id = ?'),
    getByIdAndSchool: db.prepare(`
      SELECT ss.* FROM student_strengths ss
      INNER JOIN students s ON ss.studentId = s.id
      WHERE ss.id = ? AND s.schoolId = ?
    `),
    insert: db.prepare(`
      INSERT INTO student_strengths (
        id, studentId, assessmentDate, personalStrengths, academicStrengths, socialStrengths,
        creativeStrengths, physicalStrengths, successStories, resilienceFactors, supportSystems,
        copingStrategies, achievements, skills, talents, positiveFeedback, growthMindsetIndicators,
        notes, assessedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    delete: db.prepare('DELETE FROM student_strengths WHERE id = ?'),
    deleteBySchool: db.prepare('DELETE FROM student_strengths WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)'),
    studentBelongsToSchool: db.prepare('SELECT 1 FROM students WHERE id = ? AND schoolId = ?')
  };
  
  isInitialized = true;
}

// ================= SCHOOL-SCOPED FUNCTIONS (RECOMMENDED) =================

export function studentBelongsToSchool(studentId: string, schoolId: string): boolean {
  if (!studentId || !schoolId) return false;
  ensureInitialized();
  return !!statements.studentBelongsToSchool.get(studentId, schoolId);
}

export function getStrengthsByStudentAndSchool(studentId: string, schoolId: string): StudentStrength[] {
  if (!schoolId) {
    throw new Error('[SECURITY] getStrengthsByStudentAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    return statements.getByStudentAndSchool.all(studentId, schoolId) as StudentStrength[];
  } catch (error) {
    console.error('Database error in getStrengthsByStudentAndSchool:', error);
    throw error;
  }
}

export function getLatestStrengthByStudentAndSchool(studentId: string, schoolId: string): StudentStrength | null {
  if (!schoolId) {
    throw new Error('[SECURITY] getLatestStrengthByStudentAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements.getLatestByStudentAndSchool.get(studentId, schoolId);
    return result || null;
  } catch (error) {
    console.error('Database error in getLatestStrengthByStudentAndSchool:', error);
    throw error;
  }
}

export function getStrengthByIdAndSchool(id: string, schoolId: string): StudentStrength | null {
  if (!schoolId) {
    throw new Error('[SECURITY] getStrengthByIdAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements.getByIdAndSchool.get(id, schoolId);
    return result || null;
  } catch (error) {
    console.error('Database error in getStrengthByIdAndSchool:', error);
    throw error;
  }
}

export function insertStrengthWithSchoolCheck(strength: StudentStrength, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] insertStrengthWithSchoolCheck requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    
    if (!studentBelongsToSchool(strength.studentId, schoolId)) {
      console.warn(`[SECURITY] Attempted to insert strength for student ${strength.studentId} not belonging to school ${schoolId}`);
      return false;
    }
    
    statements.insert.run(
      strength.id,
      strength.studentId,
      strength.assessmentDate,
      strength.personalStrengths || null,
      strength.academicStrengths || null,
      strength.socialStrengths || null,
      strength.creativeStrengths || null,
      strength.physicalStrengths || null,
      strength.successStories || null,
      strength.resilienceFactors || null,
      strength.supportSystems || null,
      strength.copingStrategies || null,
      strength.achievements || null,
      strength.skills || null,
      strength.talents || null,
      strength.positiveFeedback || null,
      strength.growthMindsetIndicators || null,
      strength.notes || null,
      strength.assessedBy || null
    );
    return true;
  } catch (error) {
    console.error('Database error in insertStrengthWithSchoolCheck:', error);
    return false;
  }
}

export function updateStrengthBySchool(id: string, updates: Partial<StudentStrength>, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] updateStrengthBySchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const checkStmt = db.prepare(`
      SELECT 1 FROM student_strengths ss
      INNER JOIN students s ON ss.studentId = s.id
      WHERE ss.id = ? AND s.schoolId = ?
    `);
    
    if (!checkStmt.get(id, schoolId)) {
      console.warn(`[SECURITY] Attempted to update strength ${id} not belonging to school ${schoolId}`);
      return false;
    }
    
    const allowedFields = [
      'assessmentDate', 'personalStrengths', 'academicStrengths', 'socialStrengths',
      'creativeStrengths', 'physicalStrengths', 'successStories', 'resilienceFactors',
      'supportSystems', 'copingStrategies', 'achievements', 'skills', 'talents',
      'positiveFeedback', 'growthMindsetIndicators', 'notes', 'assessedBy'
    ];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length > 0) {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof StudentStrength]);
      values.push(id);
      
      db.prepare(`UPDATE student_strengths SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    }
    return true;
  } catch (error) {
    console.error('Database error in updateStrengthBySchool:', error);
    return false;
  }
}

export function deleteStrengthBySchool(id: string, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] deleteStrengthBySchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements.deleteBySchool.run(id, schoolId);
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in deleteStrengthBySchool:', error);
    return false;
  }
}

// ================= DEPRECATED FUNCTIONS =================

/** @deprecated Use getStrengthsByStudentAndSchool instead */
export function getStrengthsByStudent(studentId: string): StudentStrength[] {
  console.warn('[DEPRECATED] getStrengthsByStudent() called without schoolId. Use getStrengthsByStudentAndSchool() instead.');
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId) as StudentStrength[];
  } catch (error) {
    console.error('Database error in getStrengthsByStudent:', error);
    throw error;
  }
}

/** @deprecated Use getLatestStrengthByStudentAndSchool instead */
export function getLatestStrengthByStudent(studentId: string): StudentStrength | null {
  console.warn('[DEPRECATED] getLatestStrengthByStudent() called without schoolId. Use getLatestStrengthByStudentAndSchool() instead.');
  try {
    ensureInitialized();
    const result = statements.getLatestByStudent.get(studentId);
    return result || null;
  } catch (error) {
    console.error('Database error in getLatestStrengthByStudent:', error);
    throw error;
  }
}

/** @deprecated Use getStrengthByIdAndSchool instead */
export function getStrengthById(id: string): StudentStrength | null {
  console.warn('[DEPRECATED] getStrengthById() called without schoolId. Use getStrengthByIdAndSchool() instead.');
  try {
    ensureInitialized();
    const result = statements.getById.get(id);
    return result || null;
  } catch (error) {
    console.error('Database error in getStrengthById:', error);
    throw error;
  }
}

/** @deprecated Use insertStrengthWithSchoolCheck instead */
export function insertStrength(strength: StudentStrength): void {
  console.warn('[DEPRECATED] insertStrength() called without schoolId check. Use insertStrengthWithSchoolCheck() instead.');
  try {
    ensureInitialized();
    statements.insert.run(
      strength.id,
      strength.studentId,
      strength.assessmentDate,
      strength.personalStrengths || null,
      strength.academicStrengths || null,
      strength.socialStrengths || null,
      strength.creativeStrengths || null,
      strength.physicalStrengths || null,
      strength.successStories || null,
      strength.resilienceFactors || null,
      strength.supportSystems || null,
      strength.copingStrategies || null,
      strength.achievements || null,
      strength.skills || null,
      strength.talents || null,
      strength.positiveFeedback || null,
      strength.growthMindsetIndicators || null,
      strength.notes || null,
      strength.assessedBy || null
    );
  } catch (error) {
    console.error('Database error in insertStrength:', error);
    throw error;
  }
}

/** @deprecated Use updateStrengthBySchool instead */
export function updateStrength(id: string, updates: Partial<StudentStrength>): void {
  console.warn('[DEPRECATED] updateStrength() called without schoolId. Use updateStrengthBySchool() instead.');
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const allowedFields = [
      'assessmentDate', 'personalStrengths', 'academicStrengths', 'socialStrengths',
      'creativeStrengths', 'physicalStrengths', 'successStories', 'resilienceFactors',
      'supportSystems', 'copingStrategies', 'achievements', 'skills', 'talents',
      'positiveFeedback', 'growthMindsetIndicators', 'notes', 'assessedBy'
    ];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length > 0) {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof StudentStrength]);
      values.push(id);
      
      db.prepare(`UPDATE student_strengths SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    }
  } catch (error) {
    console.error('Database error in updateStrength:', error);
    throw error;
  }
}

/** @deprecated Use deleteStrengthBySchool instead */
export function deleteStrength(id: string, schoolId?: string): void {
  if (schoolId) {
    const success = deleteStrengthBySchool(id, schoolId);
    if (!success) {
      throw new Error('Strength record not found or not accessible');
    }
    return;
  }
  
  console.warn('[DEPRECATED] deleteStrength() called without schoolId. Use deleteStrengthBySchool() instead.');
  try {
    ensureInitialized();
    statements.delete.run(id);
  } catch (error) {
    console.error('Database error in deleteStrength:', error);
    throw error;
  }
}
