import type Database from 'better-sqlite3';

export function createLearningStylesTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS learning_styles (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      visual REAL DEFAULT 0,
      auditory REAL DEFAULT 0,
      kinesthetic REAL DEFAULT 0,
      reading REAL DEFAULT 0,
      primaryLearningStyle TEXT,
      secondaryLearningStyle TEXT,
      learningPreferences TEXT,
      notes TEXT,
      assessmentDate TEXT NOT NULL,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );\n  `);

  // Migration: Add schoolId
  try {
    const columnCheck = db.prepare(`PRAGMA table_info(learning_styles)`).all() as Array<{ name: string }>;
    const hasSchoolId = columnCheck.some(col => col.name === 'schoolId');
    if (!hasSchoolId) {
      db.exec(`ALTER TABLE learning_styles ADD COLUMN schoolId TEXT;`);
      db.exec(`UPDATE learning_styles SET schoolId = (SELECT schoolId FROM students WHERE students.id = learning_styles.studentId) WHERE schoolId IS NULL;`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_learning_styles_schoolId ON learning_styles(schoolId);`);
    }
  } catch (err: any) {
    if (!err.message?.includes('duplicate column')) console.warn('Warning migrating learning_styles:', err.message);
  }
}
