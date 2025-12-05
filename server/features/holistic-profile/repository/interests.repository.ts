/**
 * Interests Repository
 * Öğrenci İlgi Alanları Veri Erişim Katmanı
 * 
 * [SECURITY] Tüm sorgular schoolId ile filtrelenerek okul veri izolasyonu sağlanır
 */

import getDatabase from '../../../lib/database.js';
import type { StudentInterest } from '../../../../shared/types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getByStudent: db.prepare('SELECT * FROM student_interests WHERE studentId = ? ORDER BY assessmentDate DESC'),
    getByStudentAndSchool: db.prepare(`
      SELECT si.* FROM student_interests si
      INNER JOIN students s ON si.studentId = s.id
      WHERE si.studentId = ? AND s.schoolId = ?
      ORDER BY si.assessmentDate DESC
    `),
    getLatestByStudent: db.prepare('SELECT * FROM student_interests WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 1'),
    getLatestByStudentAndSchool: db.prepare(`
      SELECT si.* FROM student_interests si
      INNER JOIN students s ON si.studentId = s.id
      WHERE si.studentId = ? AND s.schoolId = ?
      ORDER BY si.assessmentDate DESC LIMIT 1
    `),
    getById: db.prepare('SELECT * FROM student_interests WHERE id = ?'),
    getByIdAndSchool: db.prepare(`
      SELECT si.* FROM student_interests si
      INNER JOIN students s ON si.studentId = s.id
      WHERE si.id = ? AND s.schoolId = ?
    `),
    insert: db.prepare(`
      INSERT INTO student_interests (
        id, studentId, assessmentDate, hobbies, passions, favoriteSubjects, leastFavoriteSubjects,
        specialTalents, creativeExpressionForms, sportsActivities, artisticActivities, musicInterests,
        technologicalInterests, readingHabits, favoriteBooks, favoriteMoviesShows, curiosityAreas,
        explorativeTopics, careerInterests, clubMemberships, volunteerWork, partTimeJobs,
        projectsUndertaken, skillsDevelopment, learningPreferences, motivationalTopics, notes, assessedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    delete: db.prepare('DELETE FROM student_interests WHERE id = ?'),
    deleteBySchool: db.prepare('DELETE FROM student_interests WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)'),
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

export function getInterestsByStudentAndSchool(studentId: string, schoolId: string): StudentInterest[] {
  if (!schoolId) {
    throw new Error('[SECURITY] getInterestsByStudentAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    return statements.getByStudentAndSchool.all(studentId, schoolId) as StudentInterest[];
  } catch (error) {
    console.error('Database error in getInterestsByStudentAndSchool:', error);
    throw error;
  }
}

export function getLatestInterestByStudentAndSchool(studentId: string, schoolId: string): StudentInterest | null {
  if (!schoolId) {
    throw new Error('[SECURITY] getLatestInterestByStudentAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements.getLatestByStudentAndSchool.get(studentId, schoolId);
    return result || null;
  } catch (error) {
    console.error('Database error in getLatestInterestByStudentAndSchool:', error);
    throw error;
  }
}

export function getInterestByIdAndSchool(id: string, schoolId: string): StudentInterest | null {
  if (!schoolId) {
    throw new Error('[SECURITY] getInterestByIdAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements.getByIdAndSchool.get(id, schoolId);
    return result || null;
  } catch (error) {
    console.error('Database error in getInterestByIdAndSchool:', error);
    throw error;
  }
}

export function insertInterestWithSchoolCheck(interest: StudentInterest, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] insertInterestWithSchoolCheck requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    
    if (!studentBelongsToSchool(interest.studentId, schoolId)) {
      console.warn(`[SECURITY] Attempted to insert interest for student ${interest.studentId} not belonging to school ${schoolId}`);
      return false;
    }
    
    statements.insert.run(
      interest.id,
      interest.studentId,
      interest.assessmentDate,
      interest.hobbies || null,
      interest.passions || null,
      interest.favoriteSubjects || null,
      interest.leastFavoriteSubjects || null,
      interest.specialTalents || null,
      interest.creativeExpressionForms || null,
      interest.sportsActivities || null,
      interest.artisticActivities || null,
      interest.musicInterests || null,
      interest.technologicalInterests || null,
      interest.readingHabits || null,
      interest.favoriteBooks || null,
      interest.favoriteMoviesShows || null,
      interest.curiosityAreas || null,
      interest.explorativeTopics || null,
      interest.careerInterests || null,
      interest.clubMemberships || null,
      interest.volunteerWork || null,
      interest.partTimeJobs || null,
      interest.projectsUndertaken || null,
      interest.skillsDevelopment || null,
      interest.learningPreferences || null,
      interest.motivationalTopics || null,
      interest.notes || null,
      interest.assessedBy || null
    );
    return true;
  } catch (error) {
    console.error('Database error in insertInterestWithSchoolCheck:', error);
    return false;
  }
}

export function deleteInterestBySchool(id: string, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] deleteInterestBySchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements.deleteBySchool.run(id, schoolId);
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in deleteInterestBySchool:', error);
    return false;
  }
}

// ================= DEPRECATED FUNCTIONS =================

/** @deprecated Use getInterestsByStudentAndSchool instead */
export function getInterestsByStudent(studentId: string): StudentInterest[] {
  console.warn('[DEPRECATED] getInterestsByStudent() called without schoolId. Use getInterestsByStudentAndSchool() instead.');
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId) as StudentInterest[];
  } catch (error) {
    console.error('Database error in getInterestsByStudent:', error);
    throw error;
  }
}

/** @deprecated Use getLatestInterestByStudentAndSchool instead */
export function getLatestInterestByStudent(studentId: string): StudentInterest | null {
  console.warn('[DEPRECATED] getLatestInterestByStudent() called without schoolId. Use getLatestInterestByStudentAndSchool() instead.');
  try {
    ensureInitialized();
    const result = statements.getLatestByStudent.get(studentId);
    return result || null;
  } catch (error) {
    console.error('Database error in getLatestInterestByStudent:', error);
    throw error;
  }
}

/** @deprecated Use getInterestByIdAndSchool instead */
export function getInterestById(id: string): StudentInterest | null {
  console.warn('[DEPRECATED] getInterestById() called without schoolId. Use getInterestByIdAndSchool() instead.');
  try {
    ensureInitialized();
    const result = statements.getById.get(id);
    return result || null;
  } catch (error) {
    console.error('Database error in getInterestById:', error);
    throw error;
  }
}

/** @deprecated Use insertInterestWithSchoolCheck instead */
export function insertInterest(interest: StudentInterest): void {
  console.warn('[DEPRECATED] insertInterest() called without schoolId check. Use insertInterestWithSchoolCheck() instead.');
  try {
    ensureInitialized();
    statements.insert.run(
      interest.id,
      interest.studentId,
      interest.assessmentDate,
      interest.hobbies || null,
      interest.passions || null,
      interest.favoriteSubjects || null,
      interest.leastFavoriteSubjects || null,
      interest.specialTalents || null,
      interest.creativeExpressionForms || null,
      interest.sportsActivities || null,
      interest.artisticActivities || null,
      interest.musicInterests || null,
      interest.technologicalInterests || null,
      interest.readingHabits || null,
      interest.favoriteBooks || null,
      interest.favoriteMoviesShows || null,
      interest.curiosityAreas || null,
      interest.explorativeTopics || null,
      interest.careerInterests || null,
      interest.clubMemberships || null,
      interest.volunteerWork || null,
      interest.partTimeJobs || null,
      interest.projectsUndertaken || null,
      interest.skillsDevelopment || null,
      interest.learningPreferences || null,
      interest.motivationalTopics || null,
      interest.notes || null,
      interest.assessedBy || null
    );
  } catch (error) {
    console.error('Database error in insertInterest:', error);
    throw error;
  }
}

/** @deprecated Use updateInterestBySchool instead */
export function updateInterest(id: string, updates: Partial<StudentInterest>): void {
  console.warn('[DEPRECATED] updateInterest() called without schoolId. Use updateInterestBySchool() instead.');
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const allowedFields = [
      'assessmentDate', 'hobbies', 'passions', 'favoriteSubjects', 'leastFavoriteSubjects',
      'specialTalents', 'creativeExpressionForms', 'sportsActivities', 'artisticActivities',
      'musicInterests', 'technologicalInterests', 'readingHabits', 'favoriteBooks',
      'favoriteMoviesShows', 'curiosityAreas', 'explorativeTopics', 'careerInterests',
      'clubMemberships', 'volunteerWork', 'partTimeJobs', 'projectsUndertaken',
      'skillsDevelopment', 'learningPreferences', 'motivationalTopics', 'notes', 'assessedBy'
    ];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length > 0) {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof StudentInterest]);
      values.push(id);
      
      db.prepare(`UPDATE student_interests SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    }
  } catch (error) {
    console.error('Database error in updateInterest:', error);
    throw error;
  }
}

/** @deprecated Use deleteInterestBySchool instead */
export function deleteInterest(id: string, schoolId?: string): void {
  if (schoolId) {
    const success = deleteInterestBySchool(id, schoolId);
    if (!success) {
      throw new Error('Interest record not found or not accessible');
    }
    return;
  }
  
  console.warn('[DEPRECATED] deleteInterest() called without schoolId. Use deleteInterestBySchool() instead.');
  try {
    ensureInitialized();
    statements.delete.run(id);
  } catch (error) {
    console.error('Database error in deleteInterest:', error);
    throw error;
  }
}
