import type Database from 'better-sqlite3';

export function createAnalyticsCacheTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_cache (
      id TEXT PRIMARY KEY,
      cache_key TEXT NOT NULL UNIQUE,
      cache_type TEXT NOT NULL CHECK(cache_type IN ('reports_overview', 'student_analytics', 'class_comparison', 'risk_profiles', 'early_warnings')),
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      metadata TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_cache_key ON analytics_cache(cache_key);
    CREATE INDEX IF NOT EXISTS idx_analytics_cache_type ON analytics_cache(cache_type);
    CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires ON analytics_cache(expires_at);
  `);
}
