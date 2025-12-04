import type Database from 'better-sqlite3';

export function createAchievementsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      date TEXT NOT NULL,
      earnedAt TEXT,
      points INTEGER DEFAULT 0,
      evidence TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  // Migration: Add schoolId
  try {
    const columnCheck = db.prepare(`PRAGMA table_info(achievements)`).all() as Array<{ name: string }>;
    const hasSchoolId = columnCheck.some(col => col.name === 'schoolId');
    if (!hasSchoolId) {
      db.exec(`ALTER TABLE achievements ADD COLUMN schoolId TEXT;`);
      db.exec(`UPDATE achievements SET schoolId = (SELECT schoolId FROM students WHERE students.id = achievements.studentId) WHERE schoolId IS NULL;`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_achievements_schoolId ON achievements(schoolId);`);
    }
  } catch (err: any) {
    if (!err.message?.includes('duplicate column')) console.warn('Warning migrating achievements:', err.message);
  }
}
