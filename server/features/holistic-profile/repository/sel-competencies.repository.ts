/**
 * SEL Competencies Repository
 * Öğrenci Sosyal-Duygusal Öğrenme Yetkinlikleri Veri Erişim Katmanı
 * 
 * [SECURITY] Tüm sorgular schoolId ile filtrelenerek okul veri izolasyonu sağlanır
 */

import getDatabase from '../../../lib/database.js';
import type { StudentSELCompetency } from '../../../../shared/types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getByStudent: db.prepare('SELECT * FROM student_sel_competencies WHERE studentId = ? ORDER BY assessmentDate DESC'),
    getByStudentAndSchool: db.prepare(`
      SELECT ssc.* FROM student_sel_competencies ssc
      INNER JOIN students s ON ssc.studentId = s.id
      WHERE ssc.studentId = ? AND s.schoolId = ?
      ORDER BY ssc.assessmentDate DESC
    `),
    getLatestByStudent: db.prepare('SELECT * FROM student_sel_competencies WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 1'),
    getLatestByStudentAndSchool: db.prepare(`
      SELECT ssc.* FROM student_sel_competencies ssc
      INNER JOIN students s ON ssc.studentId = s.id
      WHERE ssc.studentId = ? AND s.schoolId = ?
      ORDER BY ssc.assessmentDate DESC LIMIT 1
    `),
    getById: db.prepare('SELECT * FROM student_sel_competencies WHERE id = ?'),
    getByIdAndSchool: db.prepare(`
      SELECT ssc.* FROM student_sel_competencies ssc
      INNER JOIN students s ON ssc.studentId = s.id
      WHERE ssc.id = ? AND s.schoolId = ?
    `),
    insert: db.prepare(`
      INSERT INTO student_sel_competencies (
        id, studentId, assessmentDate, selfAwarenessLevel, emotionRecognition, emotionExpression,
        emotionRegulation, empathyLevel, socialAwareness, perspectiveTaking, relationshipSkills,
        cooperationSkills, communicationSkills, conflictManagement, problemSolvingApproach,
        problemSolvingSkills, decisionMakingSkills, responsibleDecisionMaking, selfManagement,
        impulseControl, stressCoping, stressManagementStrategies, resilienceLevel, adaptability,
        goalSetting, selfMotivation, optimismLevel, mindfulnessEngagement, notes, assessedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    delete: db.prepare('DELETE FROM student_sel_competencies WHERE id = ?'),
    deleteBySchool: db.prepare('DELETE FROM student_sel_competencies WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)'),
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

export function getSELCompetenciesByStudentAndSchool(studentId: string, schoolId: string): StudentSELCompetency[] {
  if (!schoolId) {
    throw new Error('[SECURITY] getSELCompetenciesByStudentAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    return statements.getByStudentAndSchool.all(studentId, schoolId) as StudentSELCompetency[];
  } catch (error) {
    console.error('Database error in getSELCompetenciesByStudentAndSchool:', error);
    throw error;
  }
}

export function getLatestSELCompetencyByStudentAndSchool(studentId: string, schoolId: string): StudentSELCompetency | null {
  if (!schoolId) {
    throw new Error('[SECURITY] getLatestSELCompetencyByStudentAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements.getLatestByStudentAndSchool.get(studentId, schoolId);
    return result || null;
  } catch (error) {
    console.error('Database error in getLatestSELCompetencyByStudentAndSchool:', error);
    throw error;
  }
}

export function getSELCompetencyByIdAndSchool(id: string, schoolId: string): StudentSELCompetency | null {
  if (!schoolId) {
    throw new Error('[SECURITY] getSELCompetencyByIdAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements.getByIdAndSchool.get(id, schoolId);
    return result || null;
  } catch (error) {
    console.error('Database error in getSELCompetencyByIdAndSchool:', error);
    throw error;
  }
}

export function insertSELCompetencyWithSchoolCheck(competency: StudentSELCompetency, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] insertSELCompetencyWithSchoolCheck requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    
    if (!studentBelongsToSchool(competency.studentId, schoolId)) {
      console.warn(`[SECURITY] Attempted to insert SEL competency for student ${competency.studentId} not belonging to school ${schoolId}`);
      return false;
    }
    
    statements.insert.run(
      competency.id,
      competency.studentId,
      competency.assessmentDate,
      competency.selfAwarenessLevel || null,
      competency.emotionRecognition || null,
      competency.emotionExpression || null,
      competency.emotionRegulation || null,
      competency.empathyLevel || null,
      competency.socialAwareness || null,
      competency.perspectiveTaking || null,
      competency.relationshipSkills || null,
      competency.cooperationSkills || null,
      competency.communicationSkills || null,
      competency.conflictManagement || null,
      competency.problemSolvingApproach || null,
      competency.problemSolvingSkills || null,
      competency.decisionMakingSkills || null,
      competency.responsibleDecisionMaking || null,
      competency.selfManagement || null,
      competency.impulseControl || null,
      competency.stressCoping || null,
      competency.stressManagementStrategies || null,
      competency.resilienceLevel || null,
      competency.adaptability || null,
      competency.goalSetting || null,
      competency.selfMotivation || null,
      competency.optimismLevel || null,
      competency.mindfulnessEngagement || null,
      competency.notes || null,
      competency.assessedBy || null
    );
    return true;
  } catch (error) {
    console.error('Database error in insertSELCompetencyWithSchoolCheck:', error);
    return false;
  }
}

export function deleteSELCompetencyBySchool(id: string, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] deleteSELCompetencyBySchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements.deleteBySchool.run(id, schoolId);
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in deleteSELCompetencyBySchool:', error);
    return false;
  }
}

// ================= DEPRECATED FUNCTIONS =================

/** @deprecated Use getSELCompetenciesByStudentAndSchool instead */
export function getSELCompetenciesByStudent(studentId: string): StudentSELCompetency[] {
  console.warn('[DEPRECATED] getSELCompetenciesByStudent() called without schoolId. Use getSELCompetenciesByStudentAndSchool() instead.');
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId) as StudentSELCompetency[];
  } catch (error) {
    console.error('Database error in getSELCompetenciesByStudent:', error);
    throw error;
  }
}

/** @deprecated Use getLatestSELCompetencyByStudentAndSchool instead */
export function getLatestSELCompetencyByStudent(studentId: string): StudentSELCompetency | null {
  console.warn('[DEPRECATED] getLatestSELCompetencyByStudent() called without schoolId. Use getLatestSELCompetencyByStudentAndSchool() instead.');
  try {
    ensureInitialized();
    const result = statements.getLatestByStudent.get(studentId);
    return result || null;
  } catch (error) {
    console.error('Database error in getLatestSELCompetencyByStudent:', error);
    throw error;
  }
}

/** @deprecated Use getSELCompetencyByIdAndSchool instead */
export function getSELCompetencyById(id: string): StudentSELCompetency | null {
  console.warn('[DEPRECATED] getSELCompetencyById() called without schoolId. Use getSELCompetencyByIdAndSchool() instead.');
  try {
    ensureInitialized();
    const result = statements.getById.get(id);
    return result || null;
  } catch (error) {
    console.error('Database error in getSELCompetencyById:', error);
    throw error;
  }
}

/** @deprecated Use insertSELCompetencyWithSchoolCheck instead */
export function insertSELCompetency(competency: StudentSELCompetency): void {
  console.warn('[DEPRECATED] insertSELCompetency() called without schoolId check. Use insertSELCompetencyWithSchoolCheck() instead.');
  try {
    ensureInitialized();
    statements.insert.run(
      competency.id,
      competency.studentId,
      competency.assessmentDate,
      competency.selfAwarenessLevel || null,
      competency.emotionRecognition || null,
      competency.emotionExpression || null,
      competency.emotionRegulation || null,
      competency.empathyLevel || null,
      competency.socialAwareness || null,
      competency.perspectiveTaking || null,
      competency.relationshipSkills || null,
      competency.cooperationSkills || null,
      competency.communicationSkills || null,
      competency.conflictManagement || null,
      competency.problemSolvingApproach || null,
      competency.problemSolvingSkills || null,
      competency.decisionMakingSkills || null,
      competency.responsibleDecisionMaking || null,
      competency.selfManagement || null,
      competency.impulseControl || null,
      competency.stressCoping || null,
      competency.stressManagementStrategies || null,
      competency.resilienceLevel || null,
      competency.adaptability || null,
      competency.goalSetting || null,
      competency.selfMotivation || null,
      competency.optimismLevel || null,
      competency.mindfulnessEngagement || null,
      competency.notes || null,
      competency.assessedBy || null
    );
  } catch (error) {
    console.error('Database error in insertSELCompetency:', error);
    throw error;
  }
}

/** @deprecated Use updateSELCompetencyBySchool instead */
export function updateSELCompetency(id: string, updates: Partial<StudentSELCompetency>): void {
  console.warn('[DEPRECATED] updateSELCompetency() called without schoolId. Use updateSELCompetencyBySchool() instead.');
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const allowedFields = [
      'assessmentDate', 'selfAwarenessLevel', 'emotionRecognition', 'emotionExpression',
      'emotionRegulation', 'empathyLevel', 'socialAwareness', 'perspectiveTaking',
      'relationshipSkills', 'cooperationSkills', 'communicationSkills', 'conflictManagement',
      'problemSolvingApproach', 'problemSolvingSkills', 'decisionMakingSkills',
      'responsibleDecisionMaking', 'selfManagement', 'impulseControl', 'stressCoping',
      'stressManagementStrategies', 'resilienceLevel', 'adaptability', 'goalSetting',
      'selfMotivation', 'optimismLevel', 'mindfulnessEngagement', 'notes', 'assessedBy'
    ];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length > 0) {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof StudentSELCompetency]);
      values.push(id);
      
      db.prepare(`UPDATE student_sel_competencies SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    }
  } catch (error) {
    console.error('Database error in updateSELCompetency:', error);
    throw error;
  }
}

/** @deprecated Use deleteSELCompetencyBySchool instead */
export function deleteSELCompetency(id: string, schoolId?: string): void {
  if (schoolId) {
    const success = deleteSELCompetencyBySchool(id, schoolId);
    if (!success) {
      throw new Error('SEL competency record not found or not accessible');
    }
    return;
  }
  
  console.warn('[DEPRECATED] deleteSELCompetency() called without schoolId. Use deleteSELCompetencyBySchool() instead.');
  try {
    ensureInitialized();
    statements.delete.run(id);
  } catch (error) {
    console.error('Database error in deleteSELCompetency:', error);
    throw error;
  }
}
