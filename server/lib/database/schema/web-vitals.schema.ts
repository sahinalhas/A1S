import type Database from 'better-sqlite3';

export function createWebVitalsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS web_vitals_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric_name TEXT NOT NULL,
      value REAL NOT NULL,
      rating TEXT CHECK (rating IN ('good', 'needs-improvement', 'poor')),
      delta REAL,
      metric_id TEXT,
      navigation_type TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name 
    ON web_vitals_metrics(metric_name);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_web_vitals_created_at 
    ON web_vitals_metrics(created_at);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_web_vitals_rating 
    ON web_vitals_metrics(rating);
  `);
}
