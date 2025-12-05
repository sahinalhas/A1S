/**
 * Future Vision Repository
 * Öğrenci Gelecek Vizyonu Veri Erişim Katmanı
 * 
 * [SECURITY] Tüm sorgular schoolId ile filtrelenerek okul veri izolasyonu sağlanır
 */

import getDatabase from '../../../lib/database.js';
import type { StudentFutureVision } from '../../../../shared/types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getByStudent: db.prepare('SELECT * FROM student_future_vision WHERE studentId = ? ORDER BY assessmentDate DESC'),
    getByStudentAndSchool: db.prepare(`
      SELECT sfv.* FROM student_future_vision sfv
      INNER JOIN students s ON sfv.studentId = s.id
      WHERE sfv.studentId = ? AND s.schoolId = ?
      ORDER BY sfv.assessmentDate DESC
    `),
    getLatestByStudent: db.prepare('SELECT * FROM student_future_vision WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 1'),
    getLatestByStudentAndSchool: db.prepare(`
      SELECT sfv.* FROM student_future_vision sfv
      INNER JOIN students s ON sfv.studentId = s.id
      WHERE sfv.studentId = ? AND s.schoolId = ?
      ORDER BY sfv.assessmentDate DESC LIMIT 1
    `),
    getById: db.prepare('SELECT * FROM student_future_vision WHERE id = ?'),
    getByIdAndSchool: db.prepare(`
      SELECT sfv.* FROM student_future_vision sfv
      INNER JOIN students s ON sfv.studentId = s.id
      WHERE sfv.id = ? AND s.schoolId = ?
    `),
    insert: db.prepare(`
      INSERT INTO student_future_vision (
        id, studentId, assessmentDate, shortTermGoals, longTermGoals, careerAspirations, dreamJob,
        educationalGoals, universityPreferences, majorPreferences, lifeGoals, personalDreams,
        fearsAndConcerns, perceivedBarriers, motivationSources, motivationLevel, selfEfficacyLevel,
        growthMindset, futureOrientation, roleModels, inspirationSources, valuesAndPriorities,
        planningAbility, timeManagementSkills, decisionMakingStyle, riskTakingTendency,
        actionSteps, progressTracking, notes, assessedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    delete: db.prepare('DELETE FROM student_future_vision WHERE id = ?'),
    deleteBySchool: db.prepare('DELETE FROM student_future_vision WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)'),
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

export function getFutureVisionByStudentAndSchool(studentId: string, schoolId: string): StudentFutureVision[] {
  if (!schoolId) {
    throw new Error('[SECURITY] getFutureVisionByStudentAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    return statements.getByStudentAndSchool.all(studentId, schoolId) as StudentFutureVision[];
  } catch (error) {
    console.error('Database error in getFutureVisionByStudentAndSchool:', error);
    throw error;
  }
}

export function getLatestFutureVisionByStudentAndSchool(studentId: string, schoolId: string): StudentFutureVision | null {
  if (!schoolId) {
    throw new Error('[SECURITY] getLatestFutureVisionByStudentAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements.getLatestByStudentAndSchool.get(studentId, schoolId);
    return result || null;
  } catch (error) {
    console.error('Database error in getLatestFutureVisionByStudentAndSchool:', error);
    throw error;
  }
}

export function getFutureVisionByIdAndSchool(id: string, schoolId: string): StudentFutureVision | null {
  if (!schoolId) {
    throw new Error('[SECURITY] getFutureVisionByIdAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements.getByIdAndSchool.get(id, schoolId);
    return result || null;
  } catch (error) {
    console.error('Database error in getFutureVisionByIdAndSchool:', error);
    throw error;
  }
}

export function insertFutureVisionWithSchoolCheck(vision: StudentFutureVision, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] insertFutureVisionWithSchoolCheck requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    
    if (!studentBelongsToSchool(vision.studentId, schoolId)) {
      console.warn(`[SECURITY] Attempted to insert future vision for student ${vision.studentId} not belonging to school ${schoolId}`);
      return false;
    }
    
    statements.insert.run(
      vision.id,
      vision.studentId,
      vision.assessmentDate,
      vision.shortTermGoals || null,
      vision.longTermGoals || null,
      vision.careerAspirations || null,
      vision.dreamJob || null,
      vision.educationalGoals || null,
      vision.universityPreferences || null,
      vision.majorPreferences || null,
      vision.lifeGoals || null,
      vision.personalDreams || null,
      vision.fearsAndConcerns || null,
      vision.perceivedBarriers || null,
      vision.motivationSources || null,
      vision.motivationLevel || null,
      vision.selfEfficacyLevel || null,
      vision.growthMindset || null,
      vision.futureOrientation || null,
      vision.roleModels || null,
      vision.inspirationSources || null,
      vision.valuesAndPriorities || null,
      vision.planningAbility || null,
      vision.timeManagementSkills || null,
      vision.decisionMakingStyle || null,
      vision.riskTakingTendency || null,
      vision.actionSteps || null,
      vision.progressTracking || null,
      vision.notes || null,
      vision.assessedBy || null
    );
    return true;
  } catch (error) {
    console.error('Database error in insertFutureVisionWithSchoolCheck:', error);
    return false;
  }
}

export function deleteFutureVisionBySchool(id: string, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] deleteFutureVisionBySchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements.deleteBySchool.run(id, schoolId);
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in deleteFutureVisionBySchool:', error);
    return false;
  }
}

// ================= DEPRECATED FUNCTIONS =================

/** @deprecated Use getFutureVisionByStudentAndSchool instead */
export function getFutureVisionByStudent(studentId: string): StudentFutureVision[] {
  console.warn('[DEPRECATED] getFutureVisionByStudent() called without schoolId. Use getFutureVisionByStudentAndSchool() instead.');
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId) as StudentFutureVision[];
  } catch (error) {
    console.error('Database error in getFutureVisionByStudent:', error);
    throw error;
  }
}

/** @deprecated Use getLatestFutureVisionByStudentAndSchool instead */
export function getLatestFutureVisionByStudent(studentId: string): StudentFutureVision | null {
  console.warn('[DEPRECATED] getLatestFutureVisionByStudent() called without schoolId. Use getLatestFutureVisionByStudentAndSchool() instead.');
  try {
    ensureInitialized();
    const result = statements.getLatestByStudent.get(studentId);
    return result || null;
  } catch (error) {
    console.error('Database error in getLatestFutureVisionByStudent:', error);
    throw error;
  }
}

/** @deprecated Use getFutureVisionByIdAndSchool instead */
export function getFutureVisionById(id: string): StudentFutureVision | null {
  console.warn('[DEPRECATED] getFutureVisionById() called without schoolId. Use getFutureVisionByIdAndSchool() instead.');
  try {
    ensureInitialized();
    const result = statements.getById.get(id);
    return result || null;
  } catch (error) {
    console.error('Database error in getFutureVisionById:', error);
    throw error;
  }
}

/** @deprecated Use insertFutureVisionWithSchoolCheck instead */
export function insertFutureVision(vision: StudentFutureVision): void {
  console.warn('[DEPRECATED] insertFutureVision() called without schoolId check. Use insertFutureVisionWithSchoolCheck() instead.');
  try {
    ensureInitialized();
    statements.insert.run(
      vision.id,
      vision.studentId,
      vision.assessmentDate,
      vision.shortTermGoals || null,
      vision.longTermGoals || null,
      vision.careerAspirations || null,
      vision.dreamJob || null,
      vision.educationalGoals || null,
      vision.universityPreferences || null,
      vision.majorPreferences || null,
      vision.lifeGoals || null,
      vision.personalDreams || null,
      vision.fearsAndConcerns || null,
      vision.perceivedBarriers || null,
      vision.motivationSources || null,
      vision.motivationLevel || null,
      vision.selfEfficacyLevel || null,
      vision.growthMindset || null,
      vision.futureOrientation || null,
      vision.roleModels || null,
      vision.inspirationSources || null,
      vision.valuesAndPriorities || null,
      vision.planningAbility || null,
      vision.timeManagementSkills || null,
      vision.decisionMakingStyle || null,
      vision.riskTakingTendency || null,
      vision.actionSteps || null,
      vision.progressTracking || null,
      vision.notes || null,
      vision.assessedBy || null
    );
  } catch (error) {
    console.error('Database error in insertFutureVision:', error);
    throw error;
  }
}

/** @deprecated Use updateFutureVisionBySchool instead */
export function updateFutureVision(id: string, updates: Partial<StudentFutureVision>): void {
  console.warn('[DEPRECATED] updateFutureVision() called without schoolId. Use updateFutureVisionBySchool() instead.');
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const allowedFields = [
      'assessmentDate', 'shortTermGoals', 'longTermGoals', 'careerAspirations', 'dreamJob',
      'educationalGoals', 'universityPreferences', 'majorPreferences', 'lifeGoals', 'personalDreams',
      'fearsAndConcerns', 'perceivedBarriers', 'motivationSources', 'motivationLevel',
      'selfEfficacyLevel', 'growthMindset', 'futureOrientation', 'roleModels', 'inspirationSources',
      'valuesAndPriorities', 'planningAbility', 'timeManagementSkills', 'decisionMakingStyle',
      'riskTakingTendency', 'actionSteps', 'progressTracking', 'notes', 'assessedBy'
    ];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length > 0) {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof StudentFutureVision]);
      values.push(id);
      
      db.prepare(`UPDATE student_future_vision SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    }
  } catch (error) {
    console.error('Database error in updateFutureVision:', error);
    throw error;
  }
}

/** @deprecated Use deleteFutureVisionBySchool instead */
export function deleteFutureVision(id: string, schoolId?: string): void {
  if (schoolId) {
    const success = deleteFutureVisionBySchool(id, schoolId);
    if (!success) {
      throw new Error('Future vision record not found or not accessible');
    }
    return;
  }
  
  console.warn('[DEPRECATED] deleteFutureVision() called without schoolId. Use deleteFutureVisionBySchool() instead.');
  try {
    ensureInitialized();
    statements.delete.run(id);
  } catch (error) {
    console.error('Database error in deleteFutureVision:', error);
    throw error;
  }
}
