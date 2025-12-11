import type Database from 'better-sqlite3';

/**
 * Parse combined class string to separate grade and section
 * Handles formats: "7A", "7-A", "7/A", "7. Sınıf A", "10B", "Hazırlık", etc.
 */
function parseClassToGradeSection(classStr: string): { grade: string; section: string } {
  if (!classStr) return { grade: '', section: '' };

  const trimmed = classStr.trim();

  // Handle special cases like "Hazırlık"
  if (trimmed.toLowerCase().includes('hazırlık')) {
    return { grade: 'Hazırlık', section: '' };
  }

  // Try to match patterns like "7A", "7-A", "7/A", "7 A", "10B"
  // Pattern: one or two digit number followed by optional separator and letter
  const match = trimmed.match(/^(\d{1,2})[\s\-\/\.]?\s*(?:sınıf)?\s*[\s\-\/\.]?\s*([A-Za-zÇŞĞÜÖİçşğüöı])?$/i);

  if (match) {
    return {
      grade: match[1],
      section: match[2]?.toUpperCase() || ''
    };
  }

  // Try pattern "X. Sınıf Y Şubesi" or "X. Sınıf / Y Şubesi"
  const longMatch = trimmed.match(/(\d{1,2})\.\s*sınıf\s*[\/\-]?\s*([A-Za-zÇŞĞÜÖİçşğüöı])\s*(?:şube)?/i);
  if (longMatch) {
    return {
      grade: longMatch[1],
      section: longMatch[2].toUpperCase()
    };
  }

  // Fallback: try to extract any number as grade
  const numMatch = trimmed.match(/(\d{1,2})/);
  const letterMatch = trimmed.match(/([A-Za-zÇŞĞÜÖİçşğüöı])$/);

  return {
    grade: numMatch ? numMatch[1] : trimmed,
    section: letterMatch ? letterMatch[1].toUpperCase() : ''
  };
}

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

  // Migration: Add grade and section columns for class/section separation
  try {
    db.exec(`ALTER TABLE students ADD COLUMN grade TEXT;`);
    console.log('✅ Added grade column to students table');
  } catch (err: any) {
    if (!err.message?.includes('duplicate column')) {
      console.warn('Warning adding grade column:', err.message);
    }
  }

  try {
    db.exec(`ALTER TABLE students ADD COLUMN section TEXT;`);
    console.log('✅ Added section column to students table');
  } catch (err: any) {
    if (!err.message?.includes('duplicate column')) {
      console.warn('Warning adding section column:', err.message);
    }
  }

  // Migration: Add isSpecialEducation column
  try {
    db.exec(`ALTER TABLE students ADD COLUMN isSpecialEducation INTEGER DEFAULT 0;`);
    console.log('✅ Added isSpecialEducation column to students table');
  } catch (err: any) {
    if (!err.message?.includes('duplicate column')) {
      console.warn('Warning adding isSpecialEducation column:', err.message);
    }
  }

  // Migrate existing class data to grade/section
  // Parse formats like "7A", "7-A", "7/A", "7. Sınıf A", "10B" etc.
  try {
    const studentsWithClass = db.prepare(`
      SELECT id, class FROM students 
      WHERE class IS NOT NULL AND class != '' 
      AND (grade IS NULL OR grade = '')
    `).all() as Array<{ id: string; class: string }>;

    if (studentsWithClass.length > 0) {
      const updateStmt = db.prepare(`UPDATE students SET grade = ?, section = ? WHERE id = ?`);

      for (const student of studentsWithClass) {
        const { grade, section } = parseClassToGradeSection(student.class);
        if (grade) {
          updateStmt.run(grade, section || '', student.id);
        }
      }
      console.log(`✅ Migrated ${studentsWithClass.length} students' class data to grade/section`);
    }
  } catch (err: any) {
    console.warn('Warning migrating class data:', err.message);
  }

  // Migration: Add extended student profile columns
  const extendedColumns = [
    // Identity & Location
    'birthPlace TEXT',
    'tcIdentityNo TEXT',
    'province TEXT',
    'district TEXT',
    // Mother Information
    'motherName TEXT',
    'motherEducation TEXT',
    'motherOccupation TEXT',
    'motherEmail TEXT',
    'motherPhone TEXT',
    'motherVitalStatus TEXT',
    'motherLivingStatus TEXT',
    // Father Information
    'fatherName TEXT',
    'fatherEducation TEXT',
    'fatherOccupation TEXT',
    'fatherEmail TEXT',
    'fatherPhone TEXT',
    'fatherVitalStatus TEXT',
    'fatherLivingStatus TEXT',
    // Guardian Information
    'guardianName TEXT',
    'guardianRelation TEXT',
    'guardianPhone TEXT',
    'guardianEmail TEXT',
    // Family Structure
    'numberOfSiblings INTEGER',
    // Living Situation
    'livingWith TEXT',
    'homeRentalStatus TEXT',
    'homeHeatingType TEXT',
    'transportationToSchool TEXT',
    'studentWorkStatus TEXT',
    // Assessment
    'counselor TEXT',
    'tags TEXT',
    // General Information
    'interests TEXT',
    'healthNote TEXT',
    'bloodType TEXT',
    // Additional Profile
    'languageSkills TEXT',
    'hobbiesDetailed TEXT',
    'extracurricularActivities TEXT',
    'studentExpectations TEXT',
    'familyExpectations TEXT',
    // Discipline History
    'disiplinCezalari TEXT',
    // Health Information
    'chronicDiseases TEXT',
    'allergies TEXT',
    'medications TEXT',
    'medicalHistory TEXT',
    'specialNeeds TEXT',
    'physicalLimitations TEXT',
    // Emergency Contacts
    'emergencyContact1Name TEXT',
    'emergencyContact1Phone TEXT',
    'emergencyContact1Relation TEXT',
    'emergencyContact2Name TEXT',
    'emergencyContact2Phone TEXT',
    'emergencyContact2Relation TEXT',
    'healthAdditionalNotes TEXT',
    // Talents & Interests
    'creativeTalents TEXT',
    'physicalTalents TEXT',
    'primaryInterests TEXT',
    'exploratoryInterests TEXT',
    'clubMemberships TEXT',
    'competitionsParticipated TEXT',
    'talentsAdditionalNotes TEXT',
  ];

  for (const columnDef of extendedColumns) {
    const columnName = columnDef.split(' ')[0];
    try {
      db.exec(`ALTER TABLE students ADD COLUMN ${columnDef};`);
      console.log(`✅ Added column ${columnName} to students table`);
    } catch (err: any) {
      if (!err.message?.includes('duplicate column')) {
        console.warn(`Warning adding ${columnName} column:`, err.message);
      }
    }
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
