import type Database from 'better-sqlite3';

export function createSelfAssessmentsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS self_assessments (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      assessmentType TEXT NOT NULL,
      scores TEXT NOT NULL,
      moodRating INTEGER,
      motivationLevel INTEGER,
      stressLevel INTEGER,
      confidenceLevel INTEGER,
      studyDifficulty INTEGER,
      socialInteraction INTEGER,
      sleepQuality INTEGER,
      physicalActivity INTEGER,
      dailyGoalsAchieved INTEGER,
      todayHighlight TEXT,
      todayChallenge TEXT,
      tomorrowGoal TEXT,
      notes TEXT,
      reflections TEXT,
      assessmentDate TEXT NOT NULL,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  // Migration: Add schoolId
  try {
    const columnCheck = db.prepare(`PRAGMA table_info(self_assessments)`).all() as Array<{ name: string }>;
    const hasSchoolId = columnCheck.some(col => col.name === 'schoolId');
    if (!hasSchoolId) {
      db.exec(`ALTER TABLE self_assessments ADD COLUMN schoolId TEXT;`);
      db.exec(`UPDATE self_assessments SET schoolId = (SELECT schoolId FROM students WHERE students.id = self_assessments.studentId) WHERE schoolId IS NULL;`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_self_assessments_schoolId ON self_assessments(schoolId);`);
    }
  } catch (err: any) {
    if (!err.message?.includes('duplicate column')) console.warn('Warning migrating self_assessments:', err.message);
  }
}
