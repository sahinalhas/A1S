import * as repository from '../repository/outcomes.repository.js';
import { sanitizeString } from '../../../middleware/validation.js';
import type { CounselingOutcome } from '../types/counseling-sessions.types.js';

export function getAllOutcomes(): CounselingOutcome[] {
  return repository.getAllOutcomes();
}

export function getAllOutcomesBySchool(schoolId: string): CounselingOutcome[] {
  return repository.getAllOutcomesBySchool(schoolId);
}

export function getOutcomeById(id: string): CounselingOutcome | null {
  const sanitizedId = sanitizeString(id);
  return repository.getOutcomeById(sanitizedId);
}

export function getOutcomeByIdAndSchool(id: string, schoolId: string): CounselingOutcome | null {
  const sanitizedId = sanitizeString(id);
  return repository.getOutcomeByIdAndSchool(sanitizedId, schoolId);
}

export function getOutcomeBySessionId(sessionId: string): CounselingOutcome | null {
  const sanitizedSessionId = sanitizeString(sessionId);
  return repository.getOutcomeBySessionId(sanitizedSessionId);
}

export function getOutcomeBySessionIdAndSchool(sessionId: string, schoolId: string): CounselingOutcome | null {
  const sanitizedSessionId = sanitizeString(sessionId);
  return repository.getOutcomeBySessionIdAndSchool(sanitizedSessionId, schoolId);
}

export function getOutcomesRequiringFollowUp(): CounselingOutcome[] {
  const currentDate = new Date().toISOString().split('T')[0];
  return repository.getOutcomesRequiringFollowUp(currentDate);
}

export function getOutcomesRequiringFollowUpBySchool(schoolId: string): CounselingOutcome[] {
  const currentDate = new Date().toISOString().split('T')[0];
  return repository.getOutcomesRequiringFollowUpBySchool(currentDate, schoolId);
}

export function getOutcomesByRating(rating: number): CounselingOutcome[] {
  if (rating < 1 || rating > 5) {
    throw new Error('Etkinlik puanı 1-5 arasında olmalıdır');
  }
  return repository.getOutcomesByRating(rating);
}

export function createOutcome(data: any): { success: boolean; id: string } {
  if (data.effectivenessRating !== undefined && data.effectivenessRating !== null) {
    const rating = Number(data.effectivenessRating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      throw new Error('Etkinlik puanı 1-5 arasında olmalıdır');
    }
  }

  const outcome: CounselingOutcome = {
    id: data.id,
    sessionId: sanitizeString(data.sessionId),
    effectivenessRating: data.effectivenessRating !== undefined && data.effectivenessRating !== null 
      ? Number(data.effectivenessRating) 
      : undefined,
    progressNotes: data.progressNotes ? sanitizeString(data.progressNotes) : undefined,
    goalsAchieved: data.goalsAchieved ? sanitizeString(data.goalsAchieved) : undefined,
    nextSteps: data.nextSteps ? sanitizeString(data.nextSteps) : undefined,
    recommendations: data.recommendations ? sanitizeString(data.recommendations) : undefined,
    followUpRequired: Boolean(data.followUpRequired),
    followUpDate: data.followUpDate ? sanitizeString(data.followUpDate) : undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  repository.insertOutcome(outcome);
  return { success: true, id: outcome.id };
}

export function updateOutcome(id: string, data: any): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  
  if (data.effectivenessRating !== undefined && data.effectivenessRating !== null) {
    const rating = Number(data.effectivenessRating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      throw new Error('Etkinlik puanı 1-5 arasında olmalıdır');
    }
  }
  
  const updateData: Partial<CounselingOutcome> = {
    effectivenessRating: data.effectivenessRating !== undefined && data.effectivenessRating !== null 
      ? Number(data.effectivenessRating) 
      : undefined,
    progressNotes: data.progressNotes ? sanitizeString(data.progressNotes) : undefined,
    goalsAchieved: data.goalsAchieved ? sanitizeString(data.goalsAchieved) : undefined,
    nextSteps: data.nextSteps ? sanitizeString(data.nextSteps) : undefined,
    recommendations: data.recommendations ? sanitizeString(data.recommendations) : undefined,
    followUpRequired: data.followUpRequired !== undefined ? Boolean(data.followUpRequired) : undefined,
    followUpDate: data.followUpDate ? sanitizeString(data.followUpDate) : undefined
  };
  
  const result = repository.updateOutcome(sanitizedId, updateData);
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}

export function deleteOutcome(id: string): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  const result = repository.deleteOutcome(sanitizedId);
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}

export function deleteOutcomeBySchool(id: string, schoolId: string): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  const result = repository.deleteOutcome(sanitizedId, schoolId);
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}
