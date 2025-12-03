import type Database from 'better-sqlite3';

export function createSpecialEducationTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS special_education (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      hasIEP BOOLEAN DEFAULT FALSE,
      iepStartDate TEXT,
      iepEndDate TEXT,
      iepGoals TEXT,
      diagnosis TEXT,
      ramReportDate TEXT,
      ramReportSummary TEXT,
      supportServices TEXT,
      accommodations TEXT,
      modifications TEXT,
      progressNotes TEXT,
      evaluationSchedule TEXT,
      specialistContacts TEXT,
      parentInvolvement TEXT,
      transitionPlan TEXT,
      assistiveTechnology TEXT,
      behavioralSupport TEXT,
      status TEXT DEFAULT 'AKTİF',
      nextReviewDate TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);
}
