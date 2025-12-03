import type Database from 'better-sqlite3';

export function createAppSettingsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      settings TEXT NOT NULL,
      ai_enabled INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  migrateAppSettingsTable(db);
}

export function migrateAppSettingsTable(db: Database.Database): void {
  const columns = db.pragma('table_info(app_settings)') as Array<{ name: string }>;
  const hasAiEnabled = columns.some((col) => col.name === 'ai_enabled');
  
  if (!hasAiEnabled) {
    db.exec(`ALTER TABLE app_settings ADD COLUMN ai_enabled INTEGER NOT NULL DEFAULT 1;`);
    console.log('✅ Migration: Added ai_enabled column to app_settings');
  }
}
