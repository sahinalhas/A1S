import type Database from 'better-sqlite3';

export function createStudentsTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      birthDate TEXT,
      address TEXT,
      class TEXT,
      studentNumber TEXT,
      enrollmentDate TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      avatar TEXT,
      parentContact TEXT,
      notes TEXT,
      gender TEXT CHECK (gender IN ('K', 'E')) DEFAULT 'K',
      risk TEXT CHECK (risk IN ('Düşük', 'Orta', 'Yüksek')) DEFAULT 'Düşük',
      primaryLearningStyle TEXT,
      englishScore INTEGER,
      schoolId TEXT DEFAULT 'school-default-001',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  // Migration: Add studentNumber column if it doesn't exist
  try {
    db.exec(`ALTER TABLE students ADD COLUMN studentNumber TEXT;`);
  } catch (err: any) {
    if (!err.message?.includes('duplicate column')) {
      console.warn('Warning adding studentNumber column:', err.message);
    }
  }

  // Migration: Add schoolId column if it doesn't exist
  try {
    db.exec(`ALTER TABLE students ADD COLUMN schoolId TEXT DEFAULT 'school-default-001';`);
  } catch (err: any) {
    if (!err.message?.includes('duplicate column')) {
      console.warn('Warning adding schoolId column:', err.message);
    }
  }

  // Update existing students with default schoolId
  try {
    db.exec(`UPDATE students SET schoolId = 'school-default-001' WHERE schoolId IS NULL OR schoolId = '';`);
  } catch (err: any) {
    console.warn('Warning updating schoolId:', err.message);
  }

  // Create index for schoolId (after column exists)
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_students_schoolId ON students(schoolId);`);
  } catch (err: any) {
    console.warn('Warning creating schoolId index:', err.message);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS student_documents (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      dataUrl TEXT NOT NULL,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      reason TEXT,
      notes TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  // Migration: Add schoolId to student_documents and attendance
  const studentTables = ['student_documents', 'attendance'];

  for (const tableName of studentTables) {
    try {
      const columnCheck = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
      const hasSchoolId = columnCheck.some(col => col.name === 'schoolId');

      if (!hasSchoolId) {
        db.exec(`ALTER TABLE ${tableName} ADD COLUMN schoolId TEXT;`);
        db.exec(`
          UPDATE ${tableName} 
          SET schoolId = (SELECT schoolId FROM students WHERE students.id = ${tableName}.studentId)
          WHERE schoolId IS NULL AND studentId IS NOT NULL
        `);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_${tableName}_schoolId ON ${tableName}(schoolId);`);
        console.log(`✅ Added schoolId to ${tableName}`);
      }
    } catch (err: any) {
      if (!err.message?.includes('duplicate column')) {
        console.warn(`Warning migrating ${tableName}:`, err.message);
      }
    }
  }
}
