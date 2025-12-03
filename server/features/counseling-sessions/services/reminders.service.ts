import * as repository from '../repository/reminders.repository.js';
import { sanitizeString } from '../../../middleware/validation.js';
import type { CounselingReminder } from '../types/counseling-sessions.types.js';

export function getAllReminders(): CounselingReminder[] {
  return repository.getAllReminders();
}

export function getAllRemindersBySchool(schoolId: string): CounselingReminder[] {
  return repository.getAllRemindersBySchool(schoolId);
}

export function getReminderById(id: string): CounselingReminder | null {
  const sanitizedId = sanitizeString(id);
  return repository.getReminderById(sanitizedId);
}

export function getReminderByIdAndSchool(id: string, schoolId: string): CounselingReminder | null {
  const sanitizedId = sanitizeString(id);
  return repository.getReminderByIdAndSchool(sanitizedId, schoolId);
}

export function getRemindersBySessionId(sessionId: string): CounselingReminder[] {
  const sanitizedId = sanitizeString(sessionId);
  return repository.getRemindersBySessionId(sanitizedId);
}

export function getRemindersBySessionIdAndSchool(sessionId: string, schoolId: string): CounselingReminder[] {
  const sanitizedId = sanitizeString(sessionId);
  return repository.getRemindersBySessionIdAndSchool(sanitizedId, schoolId);
}

export function getRemindersByStatus(status: string): CounselingReminder[] {
  const sanitizedStatus = sanitizeString(status);
  return repository.getRemindersByStatus(sanitizedStatus);
}

export function getRemindersByStatusAndSchool(status: string, schoolId: string): CounselingReminder[] {
  const sanitizedStatus = sanitizeString(status);
  return repository.getRemindersByStatusAndSchool(sanitizedStatus, schoolId);
}

export function getPendingReminders(): CounselingReminder[] {
  const currentDate = new Date().toISOString().split('T')[0];
  return repository.getPendingReminders(currentDate);
}

export function getPendingRemindersBySchool(schoolId: string): CounselingReminder[] {
  const currentDate = new Date().toISOString().split('T')[0];
  return repository.getPendingRemindersBySchool(currentDate, schoolId);
}

export function createReminder(data: any): { success: boolean; id: string } {
  const reminder: CounselingReminder = {
    id: data.id,
    sessionId: data.sessionId ? sanitizeString(data.sessionId) : undefined,
    reminderType: data.reminderType,
    reminderDate: data.reminderDate,
    reminderTime: data.reminderTime,
    title: sanitizeString(data.title),
    description: data.description ? sanitizeString(data.description) : undefined,
    studentIds: data.studentIds ? sanitizeString(data.studentIds) : undefined,
    status: data.status || 'pending',
    notificationSent: data.notificationSent ? 1 : 0
  };
  
  repository.insertReminder(reminder);
  return { success: true, id: reminder.id };
}

export function updateReminder(id: string, data: any): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  
  const existing = repository.getReminderById(sanitizedId);
  if (!existing) {
    return { success: false, notFound: true };
  }
  
  const reminder: CounselingReminder = {
    id: sanitizedId,
    sessionId: data.sessionId ? sanitizeString(data.sessionId) : existing.sessionId,
    reminderType: data.reminderType || existing.reminderType,
    reminderDate: data.reminderDate || existing.reminderDate,
    reminderTime: data.reminderTime || existing.reminderTime,
    title: data.title ? sanitizeString(data.title) : existing.title,
    description: data.description !== undefined ? (data.description ? sanitizeString(data.description) : undefined) : existing.description,
    studentIds: data.studentIds !== undefined ? (data.studentIds ? sanitizeString(data.studentIds) : undefined) : existing.studentIds,
    status: data.status || existing.status,
    notificationSent: data.notificationSent !== undefined ? (data.notificationSent ? 1 : 0) : existing.notificationSent
  };
  
  const result = repository.updateReminder(reminder);
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}

export function updateReminderStatus(id: string, status: string): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  const sanitizedStatus = sanitizeString(status);
  
  const result = repository.updateReminderStatus(sanitizedId, sanitizedStatus);
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}

export function updateReminderStatusBySchool(id: string, status: string, schoolId: string): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  const sanitizedStatus = sanitizeString(status);
  
  const result = repository.updateReminderStatusBySchool(sanitizedId, sanitizedStatus, schoolId);
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}

export function markNotificationSent(id: string): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  
  const result = repository.markNotificationSent(sanitizedId);
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}

export function deleteReminder(id: string): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  
  const result = repository.deleteReminder(sanitizedId);
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}

export function deleteReminderBySchool(id: string, schoolId: string): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  
  const result = repository.deleteReminder(sanitizedId, schoolId);
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}
