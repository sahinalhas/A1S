import type Database from 'better-sqlite3';

function columnExists(db: Database.Database, tableName: string, columnName: string): boolean {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  return columns.some(col => col.name === columnName);
}

export function createAnalyticsCacheTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_cache (
      id TEXT PRIMARY KEY,
      cache_key TEXT NOT NULL,
      cache_type TEXT NOT NULL CHECK(cache_type IN ('reports_overview', 'student_analytics', 'class_comparison', 'risk_profiles', 'early_warnings')),
      data TEXT NOT NULL,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      metadata TEXT,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE,
      UNIQUE(cache_key, schoolId)
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_cache_key ON analytics_cache(cache_key);
    CREATE INDEX IF NOT EXISTS idx_analytics_cache_type ON analytics_cache(cache_type);
    CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires ON analytics_cache(expires_at);
    CREATE INDEX IF NOT EXISTS idx_analytics_cache_schoolId ON analytics_cache(schoolId);
  `);

  // Migration: Add schoolId column if it doesn't exist
  if (!columnExists(db, 'analytics_cache', 'schoolId')) {
    try {
      db.exec(`ALTER TABLE analytics_cache ADD COLUMN schoolId TEXT`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_analytics_cache_schoolId ON analytics_cache(schoolId)`);
      console.log('✅ Migration: Added schoolId column to analytics_cache');
    } catch (err: any) {
      if (!err.message?.includes('duplicate column')) {
        console.warn('Warning adding schoolId to analytics_cache:', err.message);
      }
    }
  }
}
