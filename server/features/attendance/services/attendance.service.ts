import * as repository from '../repository/attendance.repository.js';
import type { AttendanceRecord } from '../types/attendance.types.js';

export function validateAttendance(attendance: any): { valid: boolean; error?: string } {
  if (!attendance || typeof attendance !== 'object') {
    return { valid: false, error: "Geçersiz devam kaydı verisi" };
  }
  
  if (!attendance.studentId || !attendance.date || !attendance.status) {
    return { valid: false, error: "Öğrenci ID, tarih ve durum alanları gereklidir" };
  }
  
  if (isNaN(Date.parse(attendance.date))) {
    return { valid: false, error: "Geçersiz tarih formatı" };
  }
  
  if (!['Devamsız', 'Geç', 'Var'].includes(attendance.status)) {
    return { valid: false, error: "Geçersiz devam durumu" };
  }
  
  return { valid: true };
}

export function getStudentAttendance(studentId: string): AttendanceRecord[] {
  if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
    throw new Error("Geçersiz öğrenci ID");
  }
  
  const records = repository.getAttendanceByStudent(studentId);
  
  return records.map((record: any) => ({
    ...record,
    reason: record.notes,
    notes: undefined
  }));
}

export function createAttendance(attendance: any, generatedId: string): void {
  const validation = validateAttendance(attendance);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const id = attendance.id || generatedId;
  const notes = attendance.reason || attendance.notes || null;
  
  repository.insertAttendance(
    id,
    attendance.studentId,
    attendance.date,
    attendance.status,
    notes
  );
}

// ================= SCHOOL-SCOPED FUNCTIONS =================

export function studentBelongsToSchool(studentId: string, schoolId: string): boolean {
  return repository.studentBelongsToSchool(studentId, schoolId);
}

export function getStudentAttendanceBySchool(studentId: string, schoolId: string): AttendanceRecord[] {
  if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
    throw new Error("Geçersiz öğrenci ID");
  }
  
  const records = repository.getAttendanceByStudentAndSchool(studentId, schoolId);
  
  return records.map((record: any) => ({
    ...record,
    reason: record.notes,
    notes: undefined
  }));
}

export function createAttendanceWithSchoolCheck(attendance: any, generatedId: string, schoolId: string): { success: boolean; error?: string } {
  const validation = validateAttendance(attendance);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  const id = attendance.id || generatedId;
  const notes = attendance.reason || attendance.notes || null;
  
  const result = repository.insertAttendanceWithSchoolCheck(
    id,
    attendance.studentId,
    attendance.date,
    attendance.status,
    notes,
    schoolId
  );
  
  if (!result) {
    return { success: false, error: 'Öğrenci bu okula ait değil' };
  }
  
  return { success: true };
}
