import * as repository from '../repository/special-education.repository.js';
import { sanitizeString } from '../../../middleware/validation.js';
import type { SpecialEducation } from '../../../../shared/types.js';

export function getSpecialEducationByStudent(studentId: string): SpecialEducation[] {
  const sanitizedId = sanitizeString(studentId);
  return repository.getSpecialEducationByStudent(sanitizedId);
}

export function createSpecialEducation(data: any): { success: boolean; id: string } {
  const record: SpecialEducation = {
    id: data.id,
    studentId: sanitizeString(data.studentId),
    hasIEP: data.hasIEP,
    iepStartDate: data.iepStartDate,
    iepEndDate: data.iepEndDate,
    iepGoals: data.iepGoals ? sanitizeString(data.iepGoals) : undefined,
    diagnosis: data.diagnosis ? sanitizeString(data.diagnosis) : undefined,
    ramReportDate: data.ramReportDate,
    ramReportSummary: data.ramReportSummary ? sanitizeString(data.ramReportSummary) : undefined,
    supportServices: data.supportServices ? sanitizeString(data.supportServices) : undefined,
    accommodations: data.accommodations ? sanitizeString(data.accommodations) : undefined,
    modifications: data.modifications ? sanitizeString(data.modifications) : undefined,
    progressNotes: data.progressNotes ? sanitizeString(data.progressNotes) : undefined,
    evaluationSchedule: data.evaluationSchedule ? sanitizeString(data.evaluationSchedule) : undefined,
    specialistContacts: data.specialistContacts ? sanitizeString(data.specialistContacts) : undefined,
    parentInvolvement: data.parentInvolvement ? sanitizeString(data.parentInvolvement) : undefined,
    transitionPlan: data.transitionPlan ? sanitizeString(data.transitionPlan) : undefined,
    assistiveTechnology: data.assistiveTechnology ? sanitizeString(data.assistiveTechnology) : undefined,
    behavioralSupport: data.behavioralSupport ? sanitizeString(data.behavioralSupport) : undefined,
    status: data.status ? sanitizeString(data.status) : 'AKTİF',
    nextReviewDate: data.nextReviewDate,
    notes: data.notes ? sanitizeString(data.notes) : undefined
  };
  
  repository.insertSpecialEducation(record);
  return { success: true, id: record.id };
}

export function updateSpecialEducation(id: string, updates: any): { success: boolean } {
  const sanitizedUpdates: any = {};
  
  if (updates.hasIEP !== undefined) sanitizedUpdates.hasIEP = updates.hasIEP ? 1 : 0;
  if (updates.iepStartDate) sanitizedUpdates.iepStartDate = updates.iepStartDate;
  if (updates.iepEndDate) sanitizedUpdates.iepEndDate = updates.iepEndDate;
  if (updates.iepGoals) sanitizedUpdates.iepGoals = sanitizeString(updates.iepGoals);
  if (updates.diagnosis) sanitizedUpdates.diagnosis = sanitizeString(updates.diagnosis);
  if (updates.ramReportDate) sanitizedUpdates.ramReportDate = updates.ramReportDate;
  if (updates.ramReportSummary) sanitizedUpdates.ramReportSummary = sanitizeString(updates.ramReportSummary);
  if (updates.supportServices) sanitizedUpdates.supportServices = sanitizeString(updates.supportServices);
  if (updates.accommodations) sanitizedUpdates.accommodations = sanitizeString(updates.accommodations);
  if (updates.modifications) sanitizedUpdates.modifications = sanitizeString(updates.modifications);
  if (updates.progressNotes) sanitizedUpdates.progressNotes = sanitizeString(updates.progressNotes);
  if (updates.evaluationSchedule) sanitizedUpdates.evaluationSchedule = sanitizeString(updates.evaluationSchedule);
  if (updates.specialistContacts) sanitizedUpdates.specialistContacts = sanitizeString(updates.specialistContacts);
  if (updates.parentInvolvement) sanitizedUpdates.parentInvolvement = sanitizeString(updates.parentInvolvement);
  if (updates.transitionPlan) sanitizedUpdates.transitionPlan = sanitizeString(updates.transitionPlan);
  if (updates.assistiveTechnology) sanitizedUpdates.assistiveTechnology = sanitizeString(updates.assistiveTechnology);
  if (updates.behavioralSupport) sanitizedUpdates.behavioralSupport = sanitizeString(updates.behavioralSupport);
  if (updates.status) sanitizedUpdates.status = sanitizeString(updates.status);
  if (updates.nextReviewDate) sanitizedUpdates.nextReviewDate = updates.nextReviewDate;
  if (updates.notes) sanitizedUpdates.notes = sanitizeString(updates.notes);
  
  repository.updateSpecialEducation(id, sanitizedUpdates);
  return { success: true };
}

export function deleteSpecialEducation(id: string): { success: boolean } {
  repository.deleteSpecialEducation(id);
  return { success: true };
}
