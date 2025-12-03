import type Database from 'better-sqlite3';
import { createMultipleIntelligenceTable } from './coaching/multiple-intelligence.schema';
import { createLearningStylesTable } from './coaching/learning-styles.schema';
import { createSmartGoalsTable } from './coaching/smart-goals.schema';
import { createCoachingRecommendationsTable } from './coaching/coaching-recommendations.schema';
import { createEvaluations360Table } from './coaching/evaluations-360.schema';
import { createAchievementsTable } from './coaching/achievements.schema';
import { createSelfAssessmentsTable } from './coaching/self-assessments.schema';

export function createCoachingTables(db: Database.Database): void {
  createMultipleIntelligenceTable(db);
  createLearningStylesTable(db);
  createSmartGoalsTable(db);
  createCoachingRecommendationsTable(db);
  createEvaluations360Table(db);
  createAchievementsTable(db);
  createSelfAssessmentsTable(db);

  db.exec(`
    CREATE TABLE IF NOT EXISTS family_context_profiles (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      assessmentDate TEXT NOT NULL,
      parentalInvolvementLevel TEXT CHECK(parentalInvolvementLevel IN ('YÜKSEK', 'ORTA', 'DÜŞÜK', 'İNCELENEMEDİ')),
      familyStabilityLevel TEXT CHECK(familyStabilityLevel IN ('STABLE', 'TRANSITIONING', 'UNSTABLE', 'UNKNOWN')),
      communicationQuality TEXT CHECK(communicationQuality IN ('DESTEKLEYICI', 'KARMA', 'SORUNLU', 'BELİRSİZ')),
      socioeconomicStatus TEXT,
      supportSystems TEXT,
      challenges TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_family_context_student ON family_context_profiles(studentId);
    CREATE INDEX IF NOT EXISTS idx_family_context_date ON family_context_profiles(assessmentDate);
  `);
}
