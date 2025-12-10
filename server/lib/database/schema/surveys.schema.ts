import type Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { SurveyTemplateDefault } from '../../../../shared/types/survey-data.types';

export function createSurveysTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS survey_templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      isActive BOOLEAN DEFAULT TRUE,
      createdBy TEXT,
      tags TEXT,
      targetAudience TEXT DEFAULT 'STUDENT',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS survey_questions (
      id TEXT PRIMARY KEY,
      templateId TEXT NOT NULL,
      questionText TEXT NOT NULL,
      questionType TEXT NOT NULL,
      required BOOLEAN DEFAULT FALSE,
      orderIndex INTEGER NOT NULL,
      options TEXT,
      validation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (templateId) REFERENCES survey_templates (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS survey_distributions (
      id TEXT PRIMARY KEY,
      templateId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      targetClasses TEXT,
      targetStudents TEXT,
      participationType TEXT NOT NULL DEFAULT 'PUBLIC',
      excelTemplate TEXT,
      publicLink TEXT,
      startDate TEXT,
      endDate TEXT,
      maxResponses INTEGER,
      status TEXT DEFAULT 'DRAFT',
      createdBy TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (templateId) REFERENCES survey_templates (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS survey_responses (
      id TEXT PRIMARY KEY,
      distributionId TEXT NOT NULL,
      studentId TEXT,
      studentInfo TEXT,
      responseData TEXT NOT NULL,
      submissionType TEXT NOT NULL,
      isComplete BOOLEAN DEFAULT FALSE,
      submittedAt DATETIME,
      ipAddress TEXT,
      userAgent TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (distributionId) REFERENCES survey_distributions (id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE SET NULL,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS surveys (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      type TEXT NOT NULL,
      questions TEXT NOT NULL,
      responses TEXT,
      completed BOOLEAN DEFAULT FALSE,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS survey_distribution_codes (
      id TEXT PRIMARY KEY,
      distributionId TEXT NOT NULL,
      studentId TEXT,
      code TEXT NOT NULL UNIQUE,
      qrCode TEXT,
      isUsed BOOLEAN DEFAULT FALSE,
      usedAt DATETIME,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (distributionId) REFERENCES survey_distributions (id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE SET NULL,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  // Migration: Add schoolId to survey tables
  const surveyTables = [
    { name: 'survey_distributions', studentColumn: null, parentTable: null },
    { name: 'survey_responses', studentColumn: 'studentId', parentTable: 'students' },
    { name: 'surveys', studentColumn: 'studentId', parentTable: 'students' },
    { name: 'survey_distribution_codes', studentColumn: 'studentId', parentTable: 'students' }
  ];

  for (const table of surveyTables) {
    try {
      const columnCheck = db.prepare(`PRAGMA table_info(${table.name})`).all() as Array<{ name: string }>;
      const hasSchoolId = columnCheck.some(col => col.name === 'schoolId');

      if (!hasSchoolId) {
        db.exec(`ALTER TABLE ${table.name} ADD COLUMN schoolId TEXT;`);

        if (table.studentColumn && table.parentTable) {
          db.exec(`
            UPDATE ${table.name} 
            SET schoolId = (SELECT schoolId FROM ${table.parentTable} WHERE ${table.parentTable}.id = ${table.name}.${table.studentColumn})
            WHERE schoolId IS NULL AND ${table.studentColumn} IS NOT NULL
          `);
        }

        db.exec(`CREATE INDEX IF NOT EXISTS idx_${table.name}_schoolId ON ${table.name}(schoolId);`);
        console.log(`✅ Added schoolId to ${table.name}`);
      }
    } catch (err: any) {
      if (!err.message?.includes('duplicate column')) {
        console.warn(`Warning migrating ${table.name}:`, err.message);
      }
    }
  }
}

export function seedSurveysDefaultTemplates(db: Database.Database): void {
  const checkTemplate = db.prepare('SELECT id FROM survey_templates WHERE id = ?');

  const upsertTemplate = db.prepare(`
    INSERT INTO survey_templates (id, title, description, isActive, createdBy, tags, targetAudience, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      isActive = excluded.isActive,
      tags = excluded.tags,
      targetAudience = excluded.targetAudience,
      updated_at = datetime('now')
  `);

  const insertQuestion = db.prepare(`
    INSERT INTO survey_questions (id, templateId, questionText, questionType, required, orderIndex, options, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      questionText = excluded.questionText,
      questionType = excluded.questionType,
      required = excluded.required,
      orderIndex = excluded.orderIndex,
      options = excluded.options
  `);

  let seededCount = 0;

  // Find survey data directory
  let surveyDataDir = path.resolve(process.cwd(), 'shared', 'data', 'surveys');
  if (!fs.existsSync(surveyDataDir)) {
    // Try relative path from this file
    surveyDataDir = path.resolve(__dirname, '../../../../../shared/data/surveys');
  }

  if (!fs.existsSync(surveyDataDir)) {
    console.warn('⚠️ Survey data directory not found, skipping seed.');
    return;
  }

  const files = fs.readdirSync(surveyDataDir).filter(file => file.endsWith('.json'));

  const seedTransaction = db.transaction(() => {
    for (const file of files) {
      try {
        const filePath = path.join(surveyDataDir, file);
        const templates: SurveyTemplateDefault[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        for (const surveyTemplate of templates) {
          const templateExists = checkTemplate.get(surveyTemplate.template.id);

          upsertTemplate.run(
            surveyTemplate.template.id,
            surveyTemplate.template.title,
            surveyTemplate.template.description,
            surveyTemplate.template.isActive ? 1 : 0,
            surveyTemplate.template.createdBy,
            JSON.stringify(surveyTemplate.template.tags),
            surveyTemplate.template.targetAudience
          );

          if (!templateExists) {
            seededCount++;
          }

          surveyTemplate.questions.forEach((question, index) => {
            const questionId = question.id || `${surveyTemplate.template.id}-q-${index}`;

            insertQuestion.run(
              questionId,
              surveyTemplate.template.id,
              question.questionText,
              question.questionType,
              question.required ? 1 : 0,
              index,
              question.options ? JSON.stringify(question.options) : null
            );
          });
        }
      } catch (err) {
        console.error(`❌ Error seeding survey from ${file}:`, err);
      }
    }
  });

  seedTransaction();

  if (seededCount > 0) {
    console.log(`✅ Varsayılan anketler yüklendi: ${seededCount} yeni anket`);
  }
}
