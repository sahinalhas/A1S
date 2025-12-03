/**
 * Career Guidance System Database Schema
 * Kariyer Rehberliği Sistemi Veritabanı Şeması
 */

import type { Database } from 'better-sqlite3';

// Meslek Profilleri Tablosu
export const createCareerProfilesTable = `
CREATE TABLE IF NOT EXISTS career_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'STEM', 'HEALTH', 'EDUCATION', 'BUSINESS', 'ARTS', 
    'SOCIAL_SERVICES', 'LAW', 'SPORTS', 'MEDIA', 'TRADES'
  )),
  description TEXT NOT NULL,
  requiredEducationLevel TEXT NOT NULL,
  averageSalary TEXT,
  jobOutlook TEXT,
  workEnvironment TEXT,
  requiredCompetencies TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);`;

// Öğrenci Kariyer Hedefleri Tablosu
export const createStudentCareerTargetsTable = `
CREATE TABLE IF NOT EXISTS student_career_targets (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  careerId TEXT NOT NULL,
  setDate TEXT NOT NULL,
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (careerId) REFERENCES career_profiles(id) ON DELETE CASCADE,
  UNIQUE(studentId, careerId)
);`;

// Kariyer Analiz Geçmişi Tablosu
export const createCareerAnalysisHistoryTable = `
CREATE TABLE IF NOT EXISTS career_analysis_history (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  analysisDate TEXT NOT NULL,
  analysisResult TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

// Kariyer Yol Haritaları Tablosu
export const createCareerRoadmapsTable = `
CREATE TABLE IF NOT EXISTS career_roadmaps (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  targetCareerId TEXT NOT NULL,
  targetCareerName TEXT NOT NULL,
  currentMatchScore REAL NOT NULL,
  projectedMatchScore REAL NOT NULL,
  estimatedCompletionTime TEXT NOT NULL,
  developmentSteps TEXT NOT NULL,
  aiRecommendations TEXT NOT NULL,
  motivationalInsights TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED')),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (targetCareerId) REFERENCES career_profiles(id) ON DELETE CASCADE
);`;

// Öğrenci Yetkinlikleri Tablosu (Derived from existing profiles)
export const createStudentCompetenciesTable = `
CREATE TABLE IF NOT EXISTS student_competencies (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  competencyId TEXT NOT NULL,
  competencyName TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'ACADEMIC', 'SOCIAL_EMOTIONAL', 'TECHNICAL', 'CREATIVE', 
    'PHYSICAL', 'LEADERSHIP', 'COMMUNICATION'
  )),
  currentLevel INTEGER NOT NULL CHECK (currentLevel >= 1 AND currentLevel <= 10),
  assessmentDate TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN (
    'ACADEMIC', 'SOCIAL_EMOTIONAL', 'TALENTS', 'SELF_ASSESSMENT', 'TEACHER_ASSESSMENT'
  )),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(studentId, competencyId)
);`;

// İndeksler
export const createCareerGuidanceIndexes = `
CREATE INDEX IF NOT EXISTS idx_student_career_targets_student 
  ON student_career_targets(studentId);

CREATE INDEX IF NOT EXISTS idx_student_career_targets_career 
  ON student_career_targets(careerId);

CREATE INDEX IF NOT EXISTS idx_career_analysis_history_student 
  ON career_analysis_history(studentId);

CREATE INDEX IF NOT EXISTS idx_career_analysis_history_date 
  ON career_analysis_history(analysisDate DESC);

CREATE INDEX IF NOT EXISTS idx_career_roadmaps_student 
  ON career_roadmaps(studentId);

CREATE INDEX IF NOT EXISTS idx_career_roadmaps_status 
  ON career_roadmaps(status);

CREATE INDEX IF NOT EXISTS idx_career_roadmaps_target 
  ON career_roadmaps(targetCareerId);

CREATE INDEX IF NOT EXISTS idx_student_competencies_student 
  ON student_competencies(studentId);

CREATE INDEX IF NOT EXISTS idx_student_competencies_category 
  ON student_competencies(category);

CREATE INDEX IF NOT EXISTS idx_career_profiles_category 
  ON career_profiles(category);
`;

// Tüm tabloları oluştur
export function createCareerGuidanceTables(db: Database): void {
  db.exec(createCareerProfilesTable);
  db.exec(createStudentCareerTargetsTable);
  db.exec(createCareerAnalysisHistoryTable);
  db.exec(createCareerRoadmapsTable);
  db.exec(createStudentCompetenciesTable);
  db.exec(createCareerGuidanceIndexes);
  
  console.log('✅ Career Guidance tables created successfully');
}

// Seed data - Meslek profillerini yükle
export async function seedCareerProfiles(db: Database): Promise<void> {
  const { CAREER_PROFILES } = await import('../../../../shared/constants/career-profiles.js');
  
  const insert = db.prepare(`
    INSERT OR REPLACE INTO career_profiles (
      id, name, category, description, requiredEducationLevel,
      averageSalary, jobOutlook, workEnvironment, requiredCompetencies
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((profiles) => {
    for (const profile of profiles) {
      insert.run(
        profile.id,
        profile.name,
        profile.category,
        profile.description,
        profile.requiredEducationLevel,
        profile.averageSalary || null,
        profile.jobOutlook || null,
        profile.workEnvironment || null,
        JSON.stringify(profile.requiredCompetencies)
      );
    }
  });

  insertMany(CAREER_PROFILES);
  console.log(`✅ Seeded ${CAREER_PROFILES.length} career profiles`);
}
