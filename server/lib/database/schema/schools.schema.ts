import type Database from 'better-sqlite3';

export function createSchoolsTables(db: Database.Database): void {
  // Schools table
  db.exec(`
    CREATE TABLE IF NOT EXISTS schools (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      code TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      principal TEXT,
      website TEXT,
      socialMedia TEXT,
      viceEducationDirector TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
    CREATE INDEX IF NOT EXISTS idx_schools_code ON schools(code);
  `);

  // User-Schools association (many-to-many)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_schools (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      schoolId TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'counselor' CHECK(role IN ('owner', 'admin', 'counselor')),
      isDefault INTEGER DEFAULT 0,
      joinedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE,
      UNIQUE(userId, schoolId)
    );

    CREATE INDEX IF NOT EXISTS idx_user_schools_userId ON user_schools(userId);
    CREATE INDEX IF NOT EXISTS idx_user_schools_schoolId ON user_schools(schoolId);
  `);
}

