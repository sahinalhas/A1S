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
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  // Migration: Add schoolId
  try {
    const columnCheck = db.prepare(`PRAGMA table_info(coaching_recommendations)`).all() as Array<{ name: string }>;
    const hasSchoolId = columnCheck.some(col => col.name === 'schoolId');
    if (!hasSchoolId) {
      db.exec(`ALTER TABLE coaching_recommendations ADD COLUMN schoolId TEXT;`);
      db.exec(`UPDATE coaching_recommendations SET schoolId = (SELECT schoolId FROM students WHERE students.id = coaching_recommendations.studentId) WHERE schoolId IS NULL;`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_coaching_recommendations_schoolId ON coaching_recommendations(schoolId);`);
    }
  } catch (err: any) {
    if (!err.message?.includes('duplicate column')) console.warn('Warning migrating coaching_recommendations:', err.message);
  }
}
