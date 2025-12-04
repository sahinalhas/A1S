import type Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { DEFAULT_SUBJECTS } from '../../../../shared/data/default-subjects-topics';

function columnExists(db: Database.Database, tableName: string, columnName: string): boolean {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  return columns.some(col => col.name === columnName);
}

function safeAddSchoolIdColumn(db: Database.Database, tableName: string): void {
  if (!columnExists(db, tableName, 'schoolId')) {
    try {
      db.exec(`ALTER TABLE ${tableName} ADD COLUMN schoolId TEXT`);
      console.log(`✅ Migration: Added schoolId column to ${tableName}`);
    } catch (err: any) {
      if (!err.message?.includes('duplicate column')) {
        console.warn(`Warning adding schoolId to ${tableName}:`, err.message);
      }
    }
  }
  
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_${tableName}_schoolId ON ${tableName}(schoolId)`);
  } catch (err: any) {
    if (!err.message?.includes('already exists')) {
      console.warn(`Warning creating schoolId index on ${tableName}:`, err.message);
    }
  }
}

export function createAcademicTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS academic_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId TEXT NOT NULL,
      semester TEXT NOT NULL,
      gpa REAL,
      year INTEGER,
      exams TEXT,
      notes TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS interventions (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Planlandı', 'Devam', 'Tamamlandı')),
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT,
      description TEXT,
      color TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      subjectId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      difficulty TEXT,
      estimatedHours INTEGER DEFAULT 1,
      avgMinutes INTEGER,
      "order" INTEGER,
      energyLevel TEXT,
      difficultyScore INTEGER,
      priority INTEGER,
      deadline TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subjectId) REFERENCES subjects (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      topicId TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      remaining INTEGER DEFAULT 0,
      lastStudied DATETIME,
      notes TEXT,
      completedFlag INTEGER DEFAULT 0,
      reviewCount INTEGER DEFAULT 0,
      nextReviewDate TEXT,
      questionsSolved INTEGER DEFAULT 0,
      questionsCorrect INTEGER DEFAULT 0,
      questionsWrong INTEGER DEFAULT 0,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (topicId) REFERENCES topics (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE,
      UNIQUE(studentId, topicId)
    );
  `);

  const progressColumns = db.prepare("PRAGMA table_info(progress)").all() as Array<{ name: string }>;
  const columnNames = progressColumns.map(col => col.name);

  if (!columnNames.includes('completedFlag')) {
    db.exec(`ALTER TABLE progress ADD COLUMN completedFlag INTEGER DEFAULT 0;`);
    console.log('✅ Migration: Added completedFlag column to progress');
  }

  if (!columnNames.includes('reviewCount')) {
    db.exec(`ALTER TABLE progress ADD COLUMN reviewCount INTEGER DEFAULT 0;`);
    console.log('✅ Migration: Added reviewCount column to progress');
  }

  if (!columnNames.includes('nextReviewDate')) {
    db.exec(`ALTER TABLE progress ADD COLUMN nextReviewDate TEXT;`);
    console.log('✅ Migration: Added nextReviewDate column to progress');
  }

  if (!columnNames.includes('questionsSolved')) {
    db.exec(`ALTER TABLE progress ADD COLUMN questionsSolved INTEGER DEFAULT 0;`);
    console.log('✅ Migration: Added questionsSolved column to progress');
  }

  if (!columnNames.includes('questionsCorrect')) {
    db.exec(`ALTER TABLE progress ADD COLUMN questionsCorrect INTEGER DEFAULT 0;`);
    console.log('✅ Migration: Added questionsCorrect column to progress');
  }

  if (!columnNames.includes('questionsWrong')) {
    db.exec(`ALTER TABLE progress ADD COLUMN questionsWrong INTEGER DEFAULT 0;`);
    console.log('✅ Migration: Added questionsWrong column to progress');
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS academic_goals (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      targetScore REAL,
      currentScore REAL,
      examType TEXT,
      deadline TEXT,
      status TEXT DEFAULT 'active',
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS study_sessions (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      topicId TEXT NOT NULL,
      startTime DATETIME NOT NULL,
      endTime DATETIME,
      duration INTEGER,
      notes TEXT,
      efficiency REAL,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (topicId) REFERENCES topics (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      category TEXT,
      tags TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS study_assignments (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      topicId TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
      notes TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (topicId) REFERENCES topics (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_results (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      examType TEXT NOT NULL CHECK (examType IN ('LGS', 'YKS', 'TYT', 'AYT', 'YDT', 'DENEME', 'KONU_TARAMA', 'DİĞER')),
      examName TEXT NOT NULL,
      examDate TEXT NOT NULL,
      examProvider TEXT,
      totalScore REAL,
      percentileRank REAL,
      turkishScore REAL,
      mathScore REAL,
      scienceScore REAL,
      socialScore REAL,
      foreignLanguageScore REAL,
      englishScore REAL,
      religionScore REAL,
      physicalEducationScore REAL,
      turkishNet REAL,
      mathNet REAL,
      scienceNet REAL,
      socialNet REAL,
      foreignLanguageNet REAL,
      totalNet REAL,
      correctAnswers INTEGER,
      wrongAnswers INTEGER,
      emptyAnswers INTEGER,
      totalQuestions INTEGER,
      subjectBreakdown TEXT,
      topicAnalysis TEXT,
      strengthAreas TEXT,
      weaknessAreas TEXT,
      improvementSuggestions TEXT,
      comparedToGoal TEXT,
      comparedToPrevious TEXT,
      comparedToClassAverage REAL,
      schoolRank INTEGER,
      classRank INTEGER,
      isOfficial BOOLEAN DEFAULT FALSE,
      certificateUrl TEXT,
      answerKeyUrl TEXT,
      detailedReportUrl TEXT,
      goalsMet BOOLEAN DEFAULT FALSE,
      parentNotified BOOLEAN DEFAULT FALSE,
      counselorNotes TEXT,
      actionPlan TEXT,
      notes TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS behavior_incidents (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      incidentDate TEXT NOT NULL,
      incidentTime TEXT NOT NULL,
      location TEXT NOT NULL,
      behaviorType TEXT NOT NULL,
      behaviorCategory TEXT NOT NULL,
      description TEXT NOT NULL,
      antecedent TEXT,
      consequence TEXT,
      duration INTEGER,
      intensity TEXT,
      frequency TEXT,
      witnessedBy TEXT,
      othersInvolved TEXT,
      interventionUsed TEXT,
      interventionEffectiveness TEXT,
      parentNotified BOOLEAN DEFAULT FALSE,
      parentNotificationMethod TEXT,
      parentResponse TEXT,
      followUpRequired BOOLEAN DEFAULT FALSE,
      followUpDate TEXT,
      followUpNotes TEXT,
      adminNotified BOOLEAN DEFAULT FALSE,
      consequenceGiven TEXT,
      supportProvided TEXT,
      triggerAnalysis TEXT,
      patternNotes TEXT,
      positiveAlternative TEXT,
      status TEXT NOT NULL DEFAULT 'Açık',
      recordedBy TEXT NOT NULL,
      notes TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Devamsız', 'Geç', 'Mevcut', 'Mazeret')),
      reason TEXT,
      notes TEXT,
      recordedBy TEXT,
      parentNotified BOOLEAN DEFAULT FALSE,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  // Migration: Add schoolId to existing tables
  const tablesToMigrate = [
    'academic_records',
    'interventions', 
    'progress',
    'academic_goals',
    'study_sessions',
    'notes',
    'study_assignments',
    'exam_results',
    'behavior_incidents',
    'attendance_records'
  ];
  
  for (const tableName of tablesToMigrate) {
    safeAddSchoolIdColumn(db, tableName);
  }

  // Populate schoolId from students table for existing records
  try {
    for (const tableName of tablesToMigrate) {
      db.exec(`
        UPDATE ${tableName} 
        SET schoolId = (SELECT schoolId FROM students WHERE students.id = ${tableName}.studentId)
        WHERE schoolId IS NULL AND studentId IS NOT NULL
      `);
    }
    console.log('✅ Migration: Populated schoolId from students for academic tables');
  } catch (err: any) {
    console.warn('Warning populating schoolId for academic tables:', err.message);
  }
}

export function seedSubjectsAndTopics(db: Database.Database): void {
  const subjectCount = db.prepare('SELECT COUNT(*) as count FROM subjects').get() as { count: number };
  
  if (subjectCount.count > 0) {
    console.log('✓ Dersler ve konular zaten mevcut, otomatik doldurma atlanıyor');
    return;
  }

  console.log('📚 Veritabanına dersler ve konular ekleniyor...');

  const findSubject = db.prepare('SELECT id FROM subjects WHERE name = ? AND category = ?');
  const insertSubject = db.prepare(`
    INSERT INTO subjects (id, name, category, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `);
  const insertTopic = db.prepare(`
    INSERT INTO topics (
      id, subjectId, name, "order", avgMinutes, energyLevel, 
      difficultyScore, priority, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  let subjectInserted = 0;
  let topicInserted = 0;

  const insertTransaction = db.transaction(() => {
    for (const subjectData of DEFAULT_SUBJECTS) {
      let subjectId: string;
      const existingSubject = findSubject.get(subjectData.name, subjectData.category) as { id: string } | undefined;
      
      if (existingSubject) {
        subjectId = existingSubject.id;
      } else {
        subjectId = randomUUID();
        insertSubject.run(subjectId, subjectData.name, subjectData.category);
        subjectInserted++;
      }
      
      if (subjectData.topics.length > 0) {
        subjectData.topics.forEach((topicData, index) => {
          const topicId = randomUUID();
          insertTopic.run(
            topicId, 
            subjectId, 
            topicData.name, 
            index + 1,
            topicData.avgMinutes || 60,
            topicData.energyLevel || 'medium',
            topicData.difficultyScore,
            topicData.priority
          );
          topicInserted++;
        });
      }
    }
  });

  insertTransaction();

  console.log(`✓ ${subjectInserted} ders ve ${topicInserted} konu başarıyla eklendi`);
  
  const stats = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM subjects 
    WHERE category IS NOT NULL 
    GROUP BY category
  `).all() as Array<{ category: string; count: number }>;
  
  console.log('📊 Kategori özeti:');
  stats.forEach((stat) => {
    const topicCountForCategory = db.prepare(`
      SELECT COUNT(*) as count 
      FROM topics t 
      JOIN subjects s ON t.subjectId = s.id 
      WHERE s.category = ?
    `).get(stat.category) as { count: number };
    
    console.log(`   ${stat.category}: ${stat.count} ders, ${topicCountForCategory.count} konu`);
  });
}
