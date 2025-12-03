import getDatabase from '../../../lib/database.js';
import type { MeetingNote } from '../../../../shared/types/meeting-notes.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getMeetingNotesByStudent: db.prepare('SELECT * FROM meeting_notes WHERE studentId = ? ORDER BY date DESC'),
    getMeetingNote: db.prepare('SELECT * FROM meeting_notes WHERE id = ?'),
    insertMeetingNote: db.prepare(`
      INSERT INTO meeting_notes (id, studentId, date, type, note, plan)
      VALUES (?, ?, ?, ?, ?, ?)
    `),
    updateMeetingNote: db.prepare(`
      UPDATE meeting_notes SET date = ?, type = ?, note = ?, plan = ?
      WHERE id = ?
    `),
    deleteMeetingNote: db.prepare('DELETE FROM meeting_notes WHERE id = ?'),
  };
  
  isInitialized = true;
}

export function getMeetingNotesByStudent(studentId: string): MeetingNote[] {
  try {
    ensureInitialized();
    return statements.getMeetingNotesByStudent.all(studentId) as MeetingNote[];
  } catch (error) {
    console.error('Database error in getMeetingNotesByStudent:', error);
    return [];
  }
}

export function getMeetingNoteById(id: string): MeetingNote | null {
  try {
    ensureInitialized();
    return statements.getMeetingNote.get(id) as MeetingNote | null;
  } catch (error) {
    console.error('Database error in getMeetingNoteById:', error);
    return null;
  }
}

export function saveMeetingNote(note: MeetingNote): void {
  try {
    ensureInitialized();
    statements.insertMeetingNote.run(
      note.id,
      note.studentId,
      note.date,
      note.type,
      note.note,
      note.plan || null
    );
  } catch (error) {
    console.error('Error inserting meeting note:', error);
    throw error;
  }
}

export function updateMeetingNote(id: string, note: Partial<MeetingNote>): void {
  try {
    ensureInitialized();
    statements.updateMeetingNote.run(
      note.date,
      note.type,
      note.note,
      note.plan || null,
      id
    );
  } catch (error) {
    console.error('Error updating meeting note:', error);
    throw error;
  }
}

export function deleteMeetingNote(id: string): void {
  try {
    ensureInitialized();
    statements.deleteMeetingNote.run(id);
  } catch (error) {
    console.error('Error deleting meeting note:', error);
    throw error;
  }
}
