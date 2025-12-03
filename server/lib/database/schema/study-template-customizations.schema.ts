import type Database from 'better-sqlite3';

export function createStudyTemplateCustomizationsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS study_template_customizations (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      templateId TEXT NOT NULL,
      dailyRepetitionEnabled INTEGER DEFAULT 0,
      dailyRepetitionDuration INTEGER,
      weeklyRepetitionEnabled INTEGER DEFAULT 0,
      weeklyRepetitionDuration INTEGER,
      weeklyRepetitionDay INTEGER,
      bookReadingEnabled INTEGER DEFAULT 0,
      bookReadingDaysPerWeek INTEGER,
      bookReadingDuration INTEGER,
      questionSolvingEnabled INTEGER DEFAULT 0,
      questionSolvingAskTeacher INTEGER DEFAULT 0,
      mockExamEnabled INTEGER DEFAULT 0,
      mockExamDuration INTEGER,
      mockExamDay INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      UNIQUE(studentId, templateId)
    );
  `);
}
