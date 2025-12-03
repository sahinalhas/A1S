import type Database from 'better-sqlite3';

export function createSmartGoalsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS smart_goals (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      title TEXT NOT NULL,
      specific TEXT NOT NULL,
      measurable TEXT NOT NULL,
      achievable TEXT NOT NULL,
      relevant TEXT NOT NULL,
      timeBound TEXT NOT NULL,
      category TEXT,
      status TEXT DEFAULT 'active',
      progress REAL DEFAULT 0,
      startDate TEXT,
      targetDate TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);
}
