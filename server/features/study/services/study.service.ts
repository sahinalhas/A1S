import * as repository from '../repository/study.repository.js';
import type { StudyAssignment, WeeklySlot, WeeklySlotResponse, PlannedTopic } from '../types/study.types.js';
import { randomUUID } from 'crypto';
import { getStudentByIdAndSchool } from '../../students/repository/students.repository.js';

function validateStudentBelongsToSchool(studentId: string, schoolId: string): boolean {
  const student = getStudentByIdAndSchool(studentId, schoolId);
  return student !== null;
}

export function validateStudyAssignment(assignment: any): { valid: boolean; error?: string } {
  if (!assignment || typeof assignment !== 'object') {
    return { valid: false, error: "Geçersiz ödev verisi" };
  }
  
  if (!assignment.studentId || !assignment.topicId || !assignment.dueDate) {
    return { valid: false, error: "Zorunlu alanlar eksik" };
  }
  
  return { valid: true };
}

export function validateWeeklySlot(slot: any): { valid: boolean; error?: string } {
  if (!slot || typeof slot !== 'object') {
    return { valid: false, error: "Geçersiz program verisi" };
  }
  
  const startTime = slot.startTime || slot.start;
  const endTime = slot.endTime || slot.end;
  
  if (!slot.studentId || !slot.day || !startTime || !endTime || !slot.subjectId) {
    return { valid: false, error: "Zorunlu alanlar eksik" };
  }
  
  if (typeof slot.day !== 'number' || slot.day < 1 || slot.day > 7) {
    return { valid: false, error: "Geçersiz gün değeri" };
  }
  
  return { valid: true };
}

export function getStudentAssignments(studentId: string, schoolId: string): StudyAssignment[] {
  if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
    throw new Error("Geçersiz öğrenci ID");
  }
  
  return repository.getStudyAssignmentsByStudentAndSchool(studentId, schoolId);
}

export function createStudyAssignment(assignment: any, generatedId: string, schoolId: string): void {
  const validation = validateStudyAssignment(assignment);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  if (!validateStudentBelongsToSchool(assignment.studentId, schoolId)) {
    throw new Error('Student not found or does not belong to this school');
  }
  
  const id = assignment.id || generatedId;
  const status = assignment.status || 'pending';
  const notes = assignment.notes || null;
  
  repository.insertStudyAssignment(
    id,
    assignment.studentId,
    assignment.topicId,
    assignment.dueDate,
    status,
    notes
  );
}

export function updateAssignment(id: string, status: string, notes: string | null, schoolId: string): void {
  if (!id || typeof id !== 'string' || id.length > 50) {
    throw new Error("Geçersiz ödev ID");
  }
  
  repository.updateStudyAssignmentBySchool(id, status, notes, schoolId);
}

export function deleteAssignment(id: string, schoolId: string): void {
  if (!id || typeof id !== 'string' || id.length > 50) {
    throw new Error("Geçersiz ödev ID");
  }
  
  repository.deleteStudyAssignmentBySchool(id, schoolId);
}

export function getAllSlotsBySchool(schoolId: string): WeeklySlotResponse[] {
  const slots = repository.getAllWeeklySlotsBySchool(schoolId);
  
  return slots.map((slot: WeeklySlot) => ({
    id: slot.id,
    studentId: slot.studentId,
    day: slot.day,
    start: slot.startTime,
    end: slot.endTime,
    subjectId: slot.subjectId
  }));
}

export function getStudentSlots(studentId: string, schoolId: string): WeeklySlotResponse[] {
  if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
    throw new Error("Geçersiz öğrenci ID");
  }
  
  const slots = repository.getWeeklySlotsByStudentAndSchool(studentId, schoolId);
  
  return slots.map((slot: WeeklySlot) => ({
    id: slot.id,
    studentId: slot.studentId,
    day: slot.day,
    start: slot.startTime,
    end: slot.endTime,
    subjectId: slot.subjectId
  }));
}

export function createWeeklySlots(data: any, generatedId: string, schoolId: string): void {
  const slots = Array.isArray(data) ? data : [data];
  
  for (const slot of slots) {
    const validation = validateWeeklySlot(slot);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    if (!validateStudentBelongsToSchool(slot.studentId, schoolId)) {
      throw new Error('Student not found or does not belong to this school');
    }
    
    const id = slot.id || randomUUID();
    const startTime = slot.startTime || slot.start;
    const endTime = slot.endTime || slot.end;
    
    repository.insertWeeklySlot(
      id,
      slot.studentId,
      slot.day,
      startTime,
      endTime,
      slot.subjectId
    );
  }
}

export function updateSlot(id: string, body: any, schoolId: string): void {
  if (!id || typeof id !== 'string' || id.length > 50) {
    throw new Error("Geçersiz program ID");
  }
  
  const startTime = body.startTime || body.start;
  const endTime = body.endTime || body.end;
  
  if (!body.day || typeof body.day !== 'number' || body.day < 1 || body.day > 7) {
    throw new Error("Geçersiz gün değeri");
  }
  
  if (!startTime || typeof startTime !== 'string') {
    throw new Error("Başlangıç saati gerekli");
  }
  
  if (!endTime || typeof endTime !== 'string') {
    throw new Error("Bitiş saati gerekli");
  }
  
  if (!body.subjectId || typeof body.subjectId !== 'string') {
    throw new Error("Ders ID gerekli");
  }
  
  repository.updateWeeklySlotBySchool(id, body.day, startTime, endTime, body.subjectId, schoolId);
}

export function deleteSlot(id: string, schoolId: string): void {
  if (!id || typeof id !== 'string' || id.length > 50) {
    throw new Error("Geçersiz program ID");
  }
  
  repository.deleteWeeklySlotBySchool(id, schoolId);
}

export function savePlannedTopics(plannedTopics: any, studentId: string, weekStartDate: string, schoolId: string): void {
  if (!Array.isArray(plannedTopics)) {
    throw new Error("Konu planı dizi olmalıdır");
  }
  if (!studentId || !weekStartDate) {
    throw new Error("Öğrenci ID ve hafta başlangıç tarihi gerekli");
  }
  
  if (!validateStudentBelongsToSchool(studentId, schoolId)) {
    throw new Error('Student not found or does not belong to this school');
  }
  
  for (const t of plannedTopics) {
    if (!t.date || !t.start || !t.end || !t.subjectId || !t.topicId || typeof t.allocated !== 'number') {
      throw new Error("Konu planı eksik veya hatalı veriler içeriyor");
    }
  }
  
  repository.deletePlannedTopicsByWeek(studentId, weekStartDate);
  
  const topics: PlannedTopic[] = plannedTopics.map((t: any) => ({
    id: t.id || randomUUID(),
    studentId,
    weekStartDate,
    date: t.date,
    start: t.start,
    end: t.end,
    subjectId: t.subjectId,
    topicId: t.topicId,
    allocated: Number(t.allocated) || 0,
    remainingAfter: Number(t.remainingAfter) || 0,
  }));
  
  repository.insertPlannedTopics(topics);
}

export function getPlannedTopics(studentId: string, weekStartDate: string, schoolId: string): PlannedTopic[] {
  if (!studentId || !weekStartDate) {
    throw new Error("Öğrenci ID ve hafta başlangıç tarihi gerekli");
  }
  
  return repository.getPlannedTopicsBySchool(studentId, weekStartDate, schoolId);
}
