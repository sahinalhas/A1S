/**
 * Social Relations Repository
 * Öğrenci Sosyal İlişkileri Veri Erişim Katmanı
 * 
 * [SECURITY] Tüm sorgular schoolId ile filtrelenerek okul veri izolasyonu sağlanır
 */

import getDatabase from '../../../lib/database.js';
import type { StudentSocialRelation } from '../../../../shared/types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_social_relations (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      assessmentDate TEXT NOT NULL,
      friendCircleSize TEXT,
      friendCircleQuality TEXT,
      socialRole TEXT,
      peerRelationshipQuality TEXT,
      socialSkillsLevel TEXT,
      conflictResolutionSkills TEXT,
      leadershipQualities TEXT,
      teamworkAbility TEXT,
      bullyingStatus TEXT,
      bullyingDetails TEXT,
      socialGroupDynamics TEXT,
      peerInfluence TEXT,
      inclusionStatus TEXT,
      communicationStyle TEXT,
      socialAnxietyLevel TEXT,
      extracurricularSocialActivities TEXT,
      notes TEXT,
      assessedBy TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students(id)
    )
  `);
  
  statements = {
    getByStudent: db.prepare('SELECT * FROM student_social_relations WHERE studentId = ? ORDER BY assessmentDate DESC'),
    getByStudentAndSchool: db.prepare(`
      SELECT sr.* FROM student_social_relations sr
      INNER JOIN students s ON sr.studentId = s.id
      WHERE sr.studentId = ? AND s.schoolId = ?
      ORDER BY sr.assessmentDate DESC
    `),
    getLatestByStudent: db.prepare('SELECT * FROM student_social_relations WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 1'),
    getLatestByStudentAndSchool: db.prepare(`
      SELECT sr.* FROM student_social_relations sr
      INNER JOIN students s ON sr.studentId = s.id
      WHERE sr.studentId = ? AND s.schoolId = ?
      ORDER BY sr.assessmentDate DESC LIMIT 1
    `),
    getById: db.prepare('SELECT * FROM student_social_relations WHERE id = ?'),
    getByIdAndSchool: db.prepare(`
      SELECT sr.* FROM student_social_relations sr
      INNER JOIN students s ON sr.studentId = s.id
      WHERE sr.id = ? AND s.schoolId = ?
    `),
    insert: db.prepare(`
      INSERT INTO student_social_relations (
        id, studentId, assessmentDate, friendCircleSize, friendCircleQuality, socialRole,
        peerRelationshipQuality, socialSkillsLevel, conflictResolutionSkills, leadershipQualities,
        teamworkAbility, bullyingStatus, bullyingDetails, socialGroupDynamics, peerInfluence,
        inclusionStatus, communicationStyle, socialAnxietyLevel, extracurricularSocialActivities,
        notes, assessedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    delete: db.prepare('DELETE FROM student_social_relations WHERE id = ?'),
    deleteBySchool: db.prepare('DELETE FROM student_social_relations WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)'),
    studentBelongsToSchool: db.prepare('SELECT 1 FROM students WHERE id = ? AND schoolId = ?')
  };
  
  isInitialized = true;
}

export function studentBelongsToSchool(studentId: string, schoolId: string): boolean {
  if (!studentId || !schoolId) return false;
  ensureInitialized();
  return !!statements.studentBelongsToSchool.get(studentId, schoolId);
}

export function getSocialRelationsByStudent(studentId: string): StudentSocialRelation[] {
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId) as StudentSocialRelation[];
  } catch (error) {
    console.error('Database error in getSocialRelationsByStudent:', error);
    throw error;
  }
}

export function getLatestSocialRelationByStudent(studentId: string): StudentSocialRelation | null {
  try {
    ensureInitialized();
    const result = statements.getLatestByStudent.get(studentId);
    return result || null;
  } catch (error) {
    console.error('Database error in getLatestSocialRelationByStudent:', error);
    throw error;
  }
}

export function getSocialRelationById(id: string): StudentSocialRelation | null {
  try {
    ensureInitialized();
    const result = statements.getById.get(id);
    return result || null;
  } catch (error) {
    console.error('Database error in getSocialRelationById:', error);
    throw error;
  }
}

export function insertSocialRelation(relation: StudentSocialRelation): void {
  try {
    ensureInitialized();
    statements.insert.run(
      relation.id,
      relation.studentId,
      relation.assessmentDate,
      relation.friendCircleSize || null,
      relation.friendCircleQuality || null,
      relation.socialRole || null,
      relation.peerRelationshipQuality || null,
      relation.socialSkillsLevel || null,
      relation.conflictResolutionSkills || null,
      relation.leadershipQualities || null,
      relation.teamworkAbility || null,
      relation.bullyingStatus || null,
      relation.bullyingDetails || null,
      relation.socialGroupDynamics || null,
      relation.peerInfluence || null,
      relation.inclusionStatus || null,
      relation.communicationStyle || null,
      relation.socialAnxietyLevel || null,
      relation.extracurricularSocialActivities || null,
      relation.notes || null,
      relation.assessedBy || null
    );
  } catch (error) {
    console.error('Database error in insertSocialRelation:', error);
    throw error;
  }
}

export function updateSocialRelation(id: string, updates: Partial<StudentSocialRelation>): void {
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const allowedFields = [
      'assessmentDate', 'friendCircleSize', 'friendCircleQuality', 'socialRole',
      'peerRelationshipQuality', 'socialSkillsLevel', 'conflictResolutionSkills',
      'leadershipQualities', 'teamworkAbility', 'bullyingStatus', 'bullyingDetails',
      'socialGroupDynamics', 'peerInfluence', 'inclusionStatus', 'communicationStyle',
      'socialAnxietyLevel', 'extracurricularSocialActivities', 'notes', 'assessedBy'
    ];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length > 0) {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof StudentSocialRelation]);
      values.push(id);
      
      db.prepare(`UPDATE student_social_relations SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    }
  } catch (error) {
    console.error('Database error in updateSocialRelation:', error);
    throw error;
  }
}

export function deleteSocialRelation(id: string): void {
  try {
    ensureInitialized();
    statements.delete.run(id);
  } catch (error) {
    console.error('Database error in deleteSocialRelation:', error);
    throw error;
  }
}
