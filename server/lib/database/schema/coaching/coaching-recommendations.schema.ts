import type Database from 'better-sqlite3';

export function createCoachingRecommendationsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS coaching_recommendations (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'Öneri',
      automated BOOLEAN DEFAULT 0,
      implementationSteps TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);
}
