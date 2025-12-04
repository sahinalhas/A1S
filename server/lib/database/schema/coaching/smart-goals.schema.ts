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
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  // Migration: Add schoolId
  try {
    const columnCheck = db.prepare(`PRAGMA table_info(smart_goals)`).all() as Array<{ name: string }>;
    const hasSchoolId = columnCheck.some(col => col.name === 'schoolId');
    if (!hasSchoolId) {
      db.exec(`ALTER TABLE smart_goals ADD COLUMN schoolId TEXT;`);
      db.exec(`UPDATE smart_goals SET schoolId = (SELECT schoolId FROM students WHERE students.id = smart_goals.studentId) WHERE schoolId IS NULL;`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_smart_goals_schoolId ON smart_goals(schoolId);`);
    }
  } catch (err: any) {
    if (!err.message?.includes('duplicate column')) console.warn('Warning migrating smart_goals:', err.message);
  }
}
