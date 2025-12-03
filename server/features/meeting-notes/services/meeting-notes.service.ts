import * as repository from '../repository/meeting-notes.repository.js';
import type { MeetingNote } from '../../../../shared/types/meeting-notes.types.js';

export function validateMeetingNote(note: any): { valid: boolean; error?: string } {
  if (!note || typeof note !== 'object') {
    return { valid: false, error: "Geçersiz not verisi" };
  }
  
  if (!note.id || !note.studentId || !note.date || !note.type || !note.note) {
    return { valid: false, error: "Zorunlu alanlar eksik" };
  }
  
  if (!['Bireysel', 'Grup', 'Veli'].includes(note.type)) {
    return { valid: false, error: "Geçerli bir görüşme tipi belirtilmelidir" };
  }
  
  if (typeof note.note !== 'string' || note.note.length === 0) {
    return { valid: false, error: "Not içeriği zorunludur" };
  }
  
  return { valid: true };
}

export function validateMeetingNoteUpdate(note: any): { valid: boolean; error?: string } {
  if (!note || typeof note !== 'object') {
    return { valid: false, error: "Geçersiz not verisi" };
  }
  
  if (!note.date || typeof note.date !== 'string' || note.date.length === 0) {
    return { valid: false, error: "Tarih alanı zorunludur" };
  }
  
  if (!note.type || !['Bireysel', 'Grup', 'Veli'].includes(note.type)) {
    return { valid: false, error: "Geçerli bir görüşme tipi belirtilmelidir" };
  }
  
  if (!note.note || typeof note.note !== 'string' || note.note.length === 0) {
    return { valid: false, error: "Not içeriği zorunludur" };
  }
  
  return { valid: true };
}

export function getStudentMeetingNotes(studentId: string): MeetingNote[] {
  if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
    throw new Error("Geçersiz öğrenci ID");
  }
  
  return repository.getMeetingNotesByStudent(studentId);
}

export function createMeetingNote(note: any): void {
  const validation = validateMeetingNote(note);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  repository.saveMeetingNote(note);
}

export function modifyMeetingNote(id: string, note: any): void {
  if (!id || typeof id !== 'string' || id.length > 50) {
    throw new Error("Geçersiz not ID");
  }
  
  const validation = validateMeetingNoteUpdate(note);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  repository.updateMeetingNote(id, note);
}

export function removeMeetingNote(id: string): void {
  if (!id || typeof id !== 'string' || id.length > 50) {
    throw new Error("Geçersiz not ID");
  }
  
  repository.deleteMeetingNote(id);
}

export function getMeetingNoteById(id: string): MeetingNote | null {
  if (!id || typeof id !== 'string' || id.length > 50) {
    throw new Error("Geçersiz not ID");
  }
  
  return repository.getMeetingNoteById(id);
}
