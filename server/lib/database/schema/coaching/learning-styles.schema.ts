import type Database from 'better-sqlite3';

export function createLearningStylesTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS learning_styles (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      visual REAL DEFAULT 0,
      auditory REAL DEFAULT 0,
      kinesthetic REAL DEFAULT 0,
      reading REAL DEFAULT 0,
      primaryLearningStyle TEXT,
      secondaryLearningStyle TEXT,
      learningPreferences TEXT,
      notes TEXT,
      assessmentDate TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);
}
