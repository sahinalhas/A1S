import type Database from 'better-sqlite3';

export function createAnalyticsSnapshotTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_analytics_snapshot (
      student_id TEXT PRIMARY KEY,
      student_name TEXT NOT NULL,
      class_name TEXT,
      risk_score INTEGER NOT NULL DEFAULT 0,
      risk_level TEXT NOT NULL,
      success_probability INTEGER NOT NULL DEFAULT 0,
      attendance_rate INTEGER NOT NULL DEFAULT 0,
      academic_trend REAL NOT NULL DEFAULT 0,
      study_consistency REAL NOT NULL DEFAULT 0,
      avg_exam_score REAL NOT NULL DEFAULT 0,
      total_sessions INTEGER NOT NULL DEFAULT 0,
      early_warnings TEXT,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_snapshot_risk ON student_analytics_snapshot(risk_score);
    CREATE INDEX IF NOT EXISTS idx_analytics_snapshot_level ON student_analytics_snapshot(risk_level);
    CREATE INDEX IF NOT EXISTS idx_analytics_snapshot_class ON student_analytics_snapshot(class_name);
  `);
}
