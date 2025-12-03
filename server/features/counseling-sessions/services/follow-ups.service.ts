import * as repository from '../repository/follow-ups.repository.js';
import { sanitizeString } from '../../../middleware/validation.js';
import type { CounselingFollowUp } from '../types/counseling-sessions.types.js';

export function getAllFollowUps(): CounselingFollowUp[] {
  return repository.getAllFollowUps();
}

export function getAllFollowUpsBySchool(schoolId: string): CounselingFollowUp[] {
  return repository.getAllFollowUpsBySchool(schoolId);
}

export function getFollowUpById(id: string): CounselingFollowUp | null {
  const sanitizedId = sanitizeString(id);
  return repository.getFollowUpById(sanitizedId);
}

export function getFollowUpByIdAndSchool(id: string, schoolId: string): CounselingFollowUp | null {
  const sanitizedId = sanitizeString(id);
  return repository.getFollowUpByIdAndSchool(sanitizedId, schoolId);
}

export function getFollowUpsBySessionId(sessionId: string): CounselingFollowUp[] {
  const sanitizedId = sanitizeString(sessionId);
  return repository.getFollowUpsBySessionId(sanitizedId);
}

export function getFollowUpsBySessionIdAndSchool(sessionId: string, schoolId: string): CounselingFollowUp[] {
  const sanitizedId = sanitizeString(sessionId);
  return repository.getFollowUpsBySessionIdAndSchool(sanitizedId, schoolId);
}

export function getFollowUpsByStatus(status: string): CounselingFollowUp[] {
  const sanitizedStatus = sanitizeString(status);
  return repository.getFollowUpsByStatus(sanitizedStatus);
}

export function getFollowUpsByStatusAndSchool(status: string, schoolId: string): CounselingFollowUp[] {
  const sanitizedStatus = sanitizeString(status);
  return repository.getFollowUpsByStatusAndSchool(sanitizedStatus, schoolId);
}

export function getFollowUpsByAssignee(assignedTo: string): CounselingFollowUp[] {
  const sanitizedAssignee = sanitizeString(assignedTo);
  return repository.getFollowUpsByAssignee(sanitizedAssignee);
}

export function getFollowUpsByAssigneeAndSchool(assignedTo: string, schoolId: string): CounselingFollowUp[] {
  const sanitizedAssignee = sanitizeString(assignedTo);
  return repository.getFollowUpsByAssigneeAndSchool(sanitizedAssignee, schoolId);
}

export function getOverdueFollowUps(): CounselingFollowUp[] {
  const currentDate = new Date().toISOString().split('T')[0];
  return repository.getOverdueFollowUps(currentDate);
}

export function getOverdueFollowUpsBySchool(schoolId: string): CounselingFollowUp[] {
  const currentDate = new Date().toISOString().split('T')[0];
  return repository.getOverdueFollowUpsBySchool(currentDate, schoolId);
}

export function getFollowUpsByPriority(priority: string): CounselingFollowUp[] {
  const sanitizedPriority = sanitizeString(priority);
  return repository.getFollowUpsByPriority(sanitizedPriority);
}

export function getFollowUpsByPriorityAndSchool(priority: string, schoolId: string): CounselingFollowUp[] {
  const sanitizedPriority = sanitizeString(priority);
  return repository.getFollowUpsByPriorityAndSchool(sanitizedPriority, schoolId);
}

export function createFollowUp(data: any): { success: boolean; id: string } {
  const followUp: CounselingFollowUp = {
    id: data.id,
    sessionId: data.sessionId ? sanitizeString(data.sessionId) : undefined,
    followUpDate: data.followUpDate,
    assignedTo: sanitizeString(data.assignedTo),
    priority: data.priority || 'medium',
    status: data.status || 'pending',
    actionItems: sanitizeString(data.actionItems),
    notes: data.notes ? sanitizeString(data.notes) : undefined,
    completedDate: data.completedDate || undefined
  };
  
  repository.insertFollowUp(followUp);
  return { success: true, id: followUp.id };
}

export function updateFollowUp(id: string, data: any): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  
  const existing = repository.getFollowUpById(sanitizedId);
  if (!existing) {
    return { success: false, notFound: true };
  }
  
  const followUp: CounselingFollowUp = {
    id: sanitizedId,
    sessionId: data.sessionId !== undefined ? (data.sessionId ? sanitizeString(data.sessionId) : undefined) : existing.sessionId,
    followUpDate: data.followUpDate || existing.followUpDate,
    assignedTo: data.assignedTo ? sanitizeString(data.assignedTo) : existing.assignedTo,
    priority: data.priority || existing.priority,
    status: data.status || existing.status,
    actionItems: data.actionItems ? sanitizeString(data.actionItems) : existing.actionItems,
    notes: data.notes !== undefined ? (data.notes ? sanitizeString(data.notes) : undefined) : existing.notes,
    completedDate: data.completedDate !== undefined ? data.completedDate : existing.completedDate
  };
  
  const result = repository.updateFollowUp(followUp);
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}

export function updateFollowUpStatus(id: string, status: string, completedDate?: string): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  const sanitizedStatus = sanitizeString(status);
  
  const result = repository.updateFollowUpStatus(
    sanitizedId, 
    sanitizedStatus, 
    completedDate || null
  );
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}

export function updateFollowUpStatusBySchool(id: string, status: string, schoolId: string, completedDate?: string): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  const sanitizedStatus = sanitizeString(status);
  
  const result = repository.updateFollowUpStatusBySchool(
    sanitizedId, 
    sanitizedStatus, 
    completedDate || null,
    schoolId
  );
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}

export function deleteFollowUp(id: string): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  
  const result = repository.deleteFollowUp(sanitizedId);
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}

export function deleteFollowUpBySchool(id: string, schoolId: string): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  
  const result = repository.deleteFollowUp(sanitizedId, schoolId);
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}
