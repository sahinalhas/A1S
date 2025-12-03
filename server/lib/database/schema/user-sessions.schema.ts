import type Database from 'better-sqlite3';

export function createUserSessionsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      userId TEXT PRIMARY KEY,
      userData TEXT NOT NULL,
      lastActive DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
