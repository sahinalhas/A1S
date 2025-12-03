import type Database from 'better-sqlite3';

export function createStudyPlanTables(db: Database.Database): void {
  // Daily Action Plans - Günlük aksiyon planları
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_action_plans (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      counselor_name TEXT,
      plan_data TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      is_auto_generated INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date, counselor_name)
    );
  `);

  // Konu bazlı haftalk planlama - Student planned topics for the week
  db.exec(`
    CREATE TABLE IF NOT EXISTS planned_topics (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      weekStartDate TEXT NOT NULL,
      date TEXT NOT NULL,
      start TEXT NOT NULL,
      end TEXT NOT NULL,
      subjectId TEXT NOT NULL,
      topicId TEXT NOT NULL,
      allocated INTEGER NOT NULL,
      remainingAfter INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(studentId, weekStartDate, topicId, date)
    );
  `);

  // Indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_daily_action_plans_date ON daily_action_plans(date DESC);
    CREATE INDEX IF NOT EXISTS idx_daily_action_plans_counselor ON daily_action_plans(counselor_name);
    CREATE INDEX IF NOT EXISTS idx_planned_topics_student_week ON planned_topics(studentId, weekStartDate);
    CREATE INDEX IF NOT EXISTS idx_planned_topics_date ON planned_topics(date DESC);
  `);
}
