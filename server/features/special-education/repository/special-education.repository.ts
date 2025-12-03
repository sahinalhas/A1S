import getDatabase from '../../../lib/database.js';
import type { SpecialEducation } from '../../../../shared/types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getSpecialEducationByStudent: db.prepare('SELECT * FROM special_education WHERE studentId = ? ORDER BY created_at DESC'),
    insertSpecialEducation: db.prepare(`
      INSERT INTO special_education (id, studentId, hasIEP, iepStartDate, iepEndDate, iepGoals, 
                                    diagnosis, ramReportDate, ramReportSummary, supportServices, 
                                    accommodations, modifications, progressNotes, evaluationSchedule,
                                    specialistContacts, parentInvolvement, transitionPlan, 
                                    assistiveTechnology, behavioralSupport, status, nextReviewDate, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    deleteSpecialEducation: db.prepare('DELETE FROM special_education WHERE id = ?')
  };
  
  isInitialized = true;
}

export function getSpecialEducationByStudent(studentId: string): SpecialEducation[] {
  try {
    ensureInitialized();
    return statements.getSpecialEducationByStudent.all(studentId) as SpecialEducation[];
  } catch (error) {
    console.error('Database error in getSpecialEducationByStudent:', error);
    throw error;
  }
}

export function insertSpecialEducation(record: SpecialEducation): void {
  try {
    ensureInitialized();
    statements.insertSpecialEducation.run(
      record.id,
      record.studentId,
      record.hasIEP ? 1 : 0,
      record.iepStartDate || null,
      record.iepEndDate || null,
      record.iepGoals || null,
      record.diagnosis || null,
      record.ramReportDate || null,
      record.ramReportSummary || null,
      record.supportServices || null,
      record.accommodations || null,
      record.modifications || null,
      record.progressNotes || null,
      record.evaluationSchedule || null,
      record.specialistContacts || null,
      record.parentInvolvement || null,
      record.transitionPlan || null,
      record.assistiveTechnology || null,
      record.behavioralSupport || null,
      record.status || 'AKTİF',
      record.nextReviewDate || null,
      record.notes || null
    );
  } catch (error) {
    console.error('Database error in insertSpecialEducation:', error);
    throw error;
  }
}

export function updateSpecialEducation(id: string, updates: any): void {
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const allowedFields = ['hasIEP', 'iepStartDate', 'iepEndDate', 'iepGoals', 'diagnosis', 
                          'ramReportDate', 'ramReportSummary', 'supportServices', 'accommodations',
                          'modifications', 'progressNotes', 'evaluationSchedule', 'specialistContacts',
                          'parentInvolvement', 'transitionPlan', 'assistiveTechnology', 'behavioralSupport',
                          'status', 'nextReviewDate', 'notes'];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length > 0) {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field]);
      values.push(id);
      
      db.prepare(`UPDATE special_education SET ${setClause} WHERE id = ?`).run(...values);
    }
  } catch (error) {
    console.error('Database error in updateSpecialEducation:', error);
    throw error;
  }
}

export function deleteSpecialEducation(id: string): void {
  try {
    ensureInitialized();
    statements.deleteSpecialEducation.run(id);
  } catch (error) {
    console.error('Database error in deleteSpecialEducation:', error);
    throw error;
  }
}
