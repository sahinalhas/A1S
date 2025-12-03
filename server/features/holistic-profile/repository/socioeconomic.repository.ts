/**
 * Socioeconomic Repository
 * Öğrenci Sosyoekonomik Bilgileri Veri Erişim Katmanı
 * 
 * [SECURITY] Tüm sorgular schoolId ile filtrelenerek okul veri izolasyonu sağlanır
 */

import getDatabase from '../../../lib/database.js';
import type { StudentSocioeconomic } from '../../../../shared/types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getByStudent: db.prepare('SELECT * FROM student_socioeconomic WHERE studentId = ? ORDER BY assessmentDate DESC'),
    getByStudentAndSchool: db.prepare(`
      SELECT ss.* FROM student_socioeconomic ss
      INNER JOIN students s ON ss.studentId = s.id
      WHERE ss.studentId = ? AND s.schoolId = ?
      ORDER BY ss.assessmentDate DESC
    `),
    getLatestByStudent: db.prepare('SELECT * FROM student_socioeconomic WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 1'),
    getLatestByStudentAndSchool: db.prepare(`
      SELECT ss.* FROM student_socioeconomic ss
      INNER JOIN students s ON ss.studentId = s.id
      WHERE ss.studentId = ? AND s.schoolId = ?
      ORDER BY ss.assessmentDate DESC LIMIT 1
    `),
    getById: db.prepare('SELECT * FROM student_socioeconomic WHERE id = ?'),
    getByIdAndSchool: db.prepare(`
      SELECT ss.* FROM student_socioeconomic ss
      INNER JOIN students s ON ss.studentId = s.id
      WHERE ss.id = ? AND s.schoolId = ?
    `),
    insert: db.prepare(`
      INSERT INTO student_socioeconomic (
        id, studentId, assessmentDate, familyIncomeLevel, parentEmploymentStatus, motherEducationLevel,
        fatherEducationLevel, householdSize, numberOfSiblings, birthOrder, housingType, housingCondition,
        studySpaceAvailability, internetAccess, deviceAccess, schoolResourcesUsage, financialBarriers,
        resourcesAndSupports, scholarshipsOrAid, materialNeeds, nutritionStatus, transportationToSchool,
        extracurricularAccessibility, culturalCapital, socialCapital, communitySupport, economicStressors,
        familyFinancialStability, workResponsibilities, caregivingResponsibilities, notes,
        confidentialityLevel, assessedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    delete: db.prepare('DELETE FROM student_socioeconomic WHERE id = ?'),
    deleteBySchool: db.prepare('DELETE FROM student_socioeconomic WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)'),
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

export function getSocioeconomicByStudentAndSchool(studentId: string, schoolId: string): StudentSocioeconomic[] {
  if (!schoolId) {
    throw new Error('[SECURITY] getSocioeconomicByStudentAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    return statements.getByStudentAndSchool.all(studentId, schoolId) as StudentSocioeconomic[];
  } catch (error) {
    console.error('Database error in getSocioeconomicByStudentAndSchool:', error);
    throw error;
  }
}

export function getLatestSocioeconomicByStudentAndSchool(studentId: string, schoolId: string): StudentSocioeconomic | null {
  if (!schoolId) {
    throw new Error('[SECURITY] getLatestSocioeconomicByStudentAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements.getLatestByStudentAndSchool.get(studentId, schoolId);
    return result || null;
  } catch (error) {
    console.error('Database error in getLatestSocioeconomicByStudentAndSchool:', error);
    throw error;
  }
}

export function getSocioeconomicByIdAndSchool(id: string, schoolId: string): StudentSocioeconomic | null {
  if (!schoolId) {
    throw new Error('[SECURITY] getSocioeconomicByIdAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements.getByIdAndSchool.get(id, schoolId);
    return result || null;
  } catch (error) {
    console.error('Database error in getSocioeconomicByIdAndSchool:', error);
    throw error;
  }
}

export function insertSocioeconomicWithSchoolCheck(socioeconomic: StudentSocioeconomic, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] insertSocioeconomicWithSchoolCheck requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    
    if (!studentBelongsToSchool(socioeconomic.studentId, schoolId)) {
      console.warn(`[SECURITY] Attempted to insert socioeconomic for student ${socioeconomic.studentId} not belonging to school ${schoolId}`);
      return false;
    }
    
    statements.insert.run(
      socioeconomic.id,
      socioeconomic.studentId,
      socioeconomic.assessmentDate,
      socioeconomic.familyIncomeLevel || null,
      socioeconomic.parentEmploymentStatus || null,
      socioeconomic.motherEducationLevel || null,
      socioeconomic.fatherEducationLevel || null,
      socioeconomic.householdSize || null,
      socioeconomic.numberOfSiblings || null,
      socioeconomic.birthOrder || null,
      socioeconomic.housingType || null,
      socioeconomic.housingCondition || null,
      socioeconomic.studySpaceAvailability || null,
      socioeconomic.internetAccess || null,
      socioeconomic.deviceAccess || null,
      socioeconomic.schoolResourcesUsage || null,
      socioeconomic.financialBarriers || null,
      socioeconomic.resourcesAndSupports || null,
      socioeconomic.scholarshipsOrAid || null,
      socioeconomic.materialNeeds || null,
      socioeconomic.nutritionStatus || null,
      socioeconomic.transportationToSchool || null,
      socioeconomic.extracurricularAccessibility || null,
      socioeconomic.culturalCapital || null,
      socioeconomic.socialCapital || null,
      socioeconomic.communitySupport || null,
      socioeconomic.economicStressors || null,
      socioeconomic.familyFinancialStability || null,
      socioeconomic.workResponsibilities || null,
      socioeconomic.caregivingResponsibilities || null,
      socioeconomic.notes || null,
      socioeconomic.confidentialityLevel || 'GİZLİ',
      socioeconomic.assessedBy || null
    );
    return true;
  } catch (error) {
    console.error('Database error in insertSocioeconomicWithSchoolCheck:', error);
    return false;
  }
}

export function deleteSocioeconomicBySchool(id: string, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] deleteSocioeconomicBySchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements.deleteBySchool.run(id, schoolId);
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in deleteSocioeconomicBySchool:', error);
    return false;
  }
}

// ================= DEPRECATED FUNCTIONS =================

/** @deprecated Use getSocioeconomicByStudentAndSchool instead */
export function getSocioeconomicByStudent(studentId: string): StudentSocioeconomic[] {
  console.warn('[DEPRECATED] getSocioeconomicByStudent() called without schoolId. Use getSocioeconomicByStudentAndSchool() instead.');
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId) as StudentSocioeconomic[];
  } catch (error) {
    console.error('Database error in getSocioeconomicByStudent:', error);
    throw error;
  }
}

/** @deprecated Use getLatestSocioeconomicByStudentAndSchool instead */
export function getLatestSocioeconomicByStudent(studentId: string): StudentSocioeconomic | null {
  console.warn('[DEPRECATED] getLatestSocioeconomicByStudent() called without schoolId. Use getLatestSocioeconomicByStudentAndSchool() instead.');
  try {
    ensureInitialized();
    const result = statements.getLatestByStudent.get(studentId);
    return result || null;
  } catch (error) {
    console.error('Database error in getLatestSocioeconomicByStudent:', error);
    throw error;
  }
}

/** @deprecated Use getSocioeconomicByIdAndSchool instead */
export function getSocioeconomicById(id: string): StudentSocioeconomic | null {
  console.warn('[DEPRECATED] getSocioeconomicById() called without schoolId. Use getSocioeconomicByIdAndSchool() instead.');
  try {
    ensureInitialized();
    const result = statements.getById.get(id);
    return result || null;
  } catch (error) {
    console.error('Database error in getSocioeconomicById:', error);
    throw error;
  }
}

/** @deprecated Use insertSocioeconomicWithSchoolCheck instead */
export function insertSocioeconomic(socioeconomic: StudentSocioeconomic): void {
  console.warn('[DEPRECATED] insertSocioeconomic() called without schoolId check. Use insertSocioeconomicWithSchoolCheck() instead.');
  try {
    ensureInitialized();
    statements.insert.run(
      socioeconomic.id,
      socioeconomic.studentId,
      socioeconomic.assessmentDate,
      socioeconomic.familyIncomeLevel || null,
      socioeconomic.parentEmploymentStatus || null,
      socioeconomic.motherEducationLevel || null,
      socioeconomic.fatherEducationLevel || null,
      socioeconomic.householdSize || null,
      socioeconomic.numberOfSiblings || null,
      socioeconomic.birthOrder || null,
      socioeconomic.housingType || null,
      socioeconomic.housingCondition || null,
      socioeconomic.studySpaceAvailability || null,
      socioeconomic.internetAccess || null,
      socioeconomic.deviceAccess || null,
      socioeconomic.schoolResourcesUsage || null,
      socioeconomic.financialBarriers || null,
      socioeconomic.resourcesAndSupports || null,
      socioeconomic.scholarshipsOrAid || null,
      socioeconomic.materialNeeds || null,
      socioeconomic.nutritionStatus || null,
      socioeconomic.transportationToSchool || null,
      socioeconomic.extracurricularAccessibility || null,
      socioeconomic.culturalCapital || null,
      socioeconomic.socialCapital || null,
      socioeconomic.communitySupport || null,
      socioeconomic.economicStressors || null,
      socioeconomic.familyFinancialStability || null,
      socioeconomic.workResponsibilities || null,
      socioeconomic.caregivingResponsibilities || null,
      socioeconomic.notes || null,
      socioeconomic.confidentialityLevel || 'GİZLİ',
      socioeconomic.assessedBy || null
    );
  } catch (error) {
    console.error('Database error in insertSocioeconomic:', error);
    throw error;
  }
}

/** @deprecated Use updateSocioeconomicBySchool instead */
export function updateSocioeconomic(id: string, updates: Partial<StudentSocioeconomic>): void {
  console.warn('[DEPRECATED] updateSocioeconomic() called without schoolId. Use updateSocioeconomicBySchool() instead.');
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const allowedFields = [
      'assessmentDate', 'familyIncomeLevel', 'parentEmploymentStatus', 'motherEducationLevel',
      'fatherEducationLevel', 'householdSize', 'numberOfSiblings', 'birthOrder', 'housingType',
      'housingCondition', 'studySpaceAvailability', 'internetAccess', 'deviceAccess',
      'schoolResourcesUsage', 'financialBarriers', 'resourcesAndSupports', 'scholarshipsOrAid',
      'materialNeeds', 'nutritionStatus', 'transportationToSchool', 'extracurricularAccessibility',
      'culturalCapital', 'socialCapital', 'communitySupport', 'economicStressors',
      'familyFinancialStability', 'workResponsibilities', 'caregivingResponsibilities',
      'notes', 'confidentialityLevel', 'assessedBy'
    ];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length > 0) {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof StudentSocioeconomic]);
      values.push(id);
      
      db.prepare(`UPDATE student_socioeconomic SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    }
  } catch (error) {
    console.error('Database error in updateSocioeconomic:', error);
    throw error;
  }
}

/** @deprecated Use deleteSocioeconomicBySchool instead */
export function deleteSocioeconomic(id: string, schoolId?: string): void {
  if (schoolId) {
    const success = deleteSocioeconomicBySchool(id, schoolId);
    if (!success) {
      throw new Error('Socioeconomic record not found or not accessible');
    }
    return;
  }
  
  console.warn('[DEPRECATED] deleteSocioeconomic() called without schoolId. Use deleteSocioeconomicBySchool() instead.');
  try {
    ensureInitialized();
    statements.delete.run(id);
  } catch (error) {
    console.error('Database error in deleteSocioeconomic:', error);
    throw error;
  }
}
