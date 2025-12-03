import type Database from 'better-sqlite3';

export function createAchievementsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      date TEXT NOT NULL,
      earnedAt TEXT,
      points INTEGER DEFAULT 0,
      evidence TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);
}
