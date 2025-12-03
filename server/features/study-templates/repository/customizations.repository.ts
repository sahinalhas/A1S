import getDatabase from '../../../lib/database.js';
import type { TemplateCustomization } from '../types.js';
import type BetterSqlite3 from 'better-sqlite3';
import { randomUUID } from 'crypto';

interface PreparedStatements {
  insertCustomization: BetterSqlite3.Statement;
  getCustomization: BetterSqlite3.Statement;
  updateCustomization: BetterSqlite3.Statement;
  deleteCustomization: BetterSqlite3.Statement;
}

let statements: PreparedStatements | null = null;

function ensureInitialized(): void {
  if (statements) return;
  const db = getDatabase();
  
  statements = {
    insertCustomization: db.prepare(`
      INSERT INTO study_template_customizations (
        id, studentId, templateId, 
        dailyRepetitionEnabled, dailyRepetitionDuration,
        weeklyRepetitionEnabled, weeklyRepetitionDuration, weeklyRepetitionDay,
        bookReadingEnabled, bookReadingDaysPerWeek, bookReadingDuration,
        questionSolvingEnabled, questionSolvingAskTeacher,
        mockExamEnabled, mockExamDuration, mockExamDay
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    getCustomization: db.prepare(`
      SELECT * FROM study_template_customizations WHERE studentId = ? AND templateId = ?
    `),
    updateCustomization: db.prepare(`
      UPDATE study_template_customizations SET
        dailyRepetitionEnabled = ?, dailyRepetitionDuration = ?,
        weeklyRepetitionEnabled = ?, weeklyRepetitionDuration = ?, weeklyRepetitionDay = ?,
        bookReadingEnabled = ?, bookReadingDaysPerWeek = ?, bookReadingDuration = ?,
        questionSolvingEnabled = ?, questionSolvingAskTeacher = ?,
        mockExamEnabled = ?, mockExamDuration = ?, mockExamDay = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE studentId = ? AND templateId = ?
    `),
    deleteCustomization: db.prepare(`
      DELETE FROM study_template_customizations WHERE studentId = ? AND templateId = ?
    `)
  };
}

export function saveCustomization(studentId: string, templateId: string, customization: TemplateCustomization): void {
  ensureInitialized();
  const id = randomUUID();
  
  statements!.insertCustomization.run(
    id, studentId, templateId,
    customization.dailyRepetition?.enabled ? 1 : 0,
    customization.dailyRepetition?.durationMinutes || null,
    customization.weeklyRepetition?.enabled ? 1 : 0,
    customization.weeklyRepetition?.durationMinutes || null,
    customization.weeklyRepetition?.day || null,
    customization.bookReading?.enabled ? 1 : 0,
    customization.bookReading?.daysPerWeek || null,
    customization.bookReading?.durationMinutes || null,
    customization.questionSolving?.enabled ? 1 : 0,
    customization.questionSolving?.askTeacher ? 1 : 0,
    customization.mockExam?.enabled ? 1 : 0,
    customization.mockExam?.durationMinutes || null,
    customization.mockExam?.day || null
  );
}

export function getCustomization(studentId: string, templateId: string): TemplateCustomization | null {
  ensureInitialized();
  const row = statements!.getCustomization.get(studentId, templateId) as any;
  
  if (!row) return null;
  
  return {
    dailyRepetition: row.dailyRepetitionEnabled ? {
      enabled: true,
      durationMinutes: row.dailyRepetitionDuration,
      weekdaysOnly: true
    } : undefined,
    weeklyRepetition: row.weeklyRepetitionEnabled ? {
      enabled: true,
      durationMinutes: row.weeklyRepetitionDuration,
      day: row.weeklyRepetitionDay
    } : undefined,
    bookReading: row.bookReadingEnabled ? {
      enabled: true,
      daysPerWeek: row.bookReadingDaysPerWeek,
      durationMinutes: row.bookReadingDuration
    } : undefined,
    questionSolving: row.questionSolvingEnabled ? {
      enabled: true,
      askTeacher: row.questionSolvingAskTeacher === 1
    } : undefined,
    mockExam: row.mockExamEnabled ? {
      enabled: true,
      durationMinutes: row.mockExamDuration,
      day: row.mockExamDay
    } : undefined
  };
}

export function updateCustomization(studentId: string, templateId: string, customization: TemplateCustomization): void {
  ensureInitialized();
  
  statements!.updateCustomization.run(
    customization.dailyRepetition?.enabled ? 1 : 0,
    customization.dailyRepetition?.durationMinutes || null,
    customization.weeklyRepetition?.enabled ? 1 : 0,
    customization.weeklyRepetition?.durationMinutes || null,
    customization.weeklyRepetition?.day || null,
    customization.bookReading?.enabled ? 1 : 0,
    customization.bookReading?.daysPerWeek || null,
    customization.bookReading?.durationMinutes || null,
    customization.questionSolving?.enabled ? 1 : 0,
    customization.questionSolving?.askTeacher ? 1 : 0,
    customization.mockExam?.enabled ? 1 : 0,
    customization.mockExam?.durationMinutes || null,
    customization.mockExam?.day || null,
    studentId,
    templateId
  );
}

export function deleteCustomization(studentId: string, templateId: string): void {
  ensureInitialized();
  statements!.deleteCustomization.run(studentId, templateId);
}
