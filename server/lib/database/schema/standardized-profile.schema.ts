/**
 * Database schema for standardized student profile data
 * Designed for AI analysis with structured, measurable fields
 */

export const createAcademicProfileTable = `
CREATE TABLE IF NOT EXISTS academic_profiles (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  assessmentDate TEXT NOT NULL,
  strongSubjects TEXT, -- JSON array of subject codes
  weakSubjects TEXT, -- JSON array of subject codes
  strongSkills TEXT, -- JSON array of skill codes
  weakSkills TEXT, -- JSON array of skill codes
  primaryLearningStyle TEXT,
  secondaryLearningStyle TEXT,
  overallMotivation INTEGER,
  studyHoursPerWeek REAL,
  homeworkCompletionRate INTEGER,
  additionalNotes TEXT,
  assessedBy TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createSocialEmotionalProfileTable = `
CREATE TABLE IF NOT EXISTS social_emotional_profiles (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  assessmentDate TEXT NOT NULL,
  strongSocialSkills TEXT, -- JSON array
  developingSocialSkills TEXT, -- JSON array
  empathyLevel INTEGER,
  selfAwarenessLevel INTEGER,
  emotionRegulationLevel INTEGER,
  conflictResolutionLevel INTEGER,
  leadershipLevel INTEGER,
  teamworkLevel INTEGER,
  communicationLevel INTEGER,
  friendCircleSize TEXT CHECK (friendCircleSize IN ('YOK', 'AZ', 'ORTA', 'GENİŞ')),
  friendCircleQuality TEXT CHECK (friendCircleQuality IN ('ZAYIF', 'ORTA', 'İYİ', 'ÇOK_İYİ')),
  socialRole TEXT CHECK (socialRole IN ('LİDER', 'AKTİF_ÜYE', 'TAKİPÇİ', 'GÖZLEMCİ', 'İZOLE')),
  bullyingStatus TEXT CHECK (bullyingStatus IN ('YOK', 'MAĞDUR', 'FAİL', 'HER_İKİSİ', 'GÖZLEMCİ')),
  socialIntegrationLevel TEXT CHECK (socialIntegrationLevel IN ('İYİ_ENTEGRE', 'ORTA_ENTEGRE', 'İZOLE', 'KRİTİK_İZOLASYON')),
  friendshipQuality TEXT CHECK (friendshipQuality IN ('SAĞLIKLI', 'GELIŞEN', 'SORUNLU', 'YOK')),
  peerAcceptance INTEGER,
  identifiedRiskFactors TEXT, -- JSON array
  protectiveFactors TEXT, -- JSON array
  recommendedInterventions TEXT, -- JSON array
  additionalNotes TEXT,
  assessedBy TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createTalentsInterestsProfileTable = `
CREATE TABLE IF NOT EXISTS talents_interests_profiles (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  assessmentDate TEXT NOT NULL,
  creativeTalents TEXT, -- JSON array
  physicalTalents TEXT, -- JSON array
  primaryInterests TEXT, -- JSON array
  exploratoryInterests TEXT, -- JSON array
  talentProficiency TEXT, -- JSON object {talent: score}
  weeklyEngagementHours REAL,
  clubMemberships TEXT, -- JSON array
  competitionsParticipated TEXT, -- JSON array
  hobbiesDetailed TEXT, -- Detailed hobbies description
  extracurricularActivities TEXT, -- Extracurricular activities
  additionalNotes TEXT,
  assessedBy TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createStandardizedHealthProfileTable = `
CREATE TABLE IF NOT EXISTS standardized_health_profiles (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  assessmentDate TEXT NOT NULL,
  bloodType TEXT,
  chronicDiseases TEXT, -- JSON array of disease codes
  chronicConditions TEXT, -- JSON array
  allergies TEXT, -- JSON array of allergy codes
  currentMedications TEXT, -- JSON array of medication codes
  medicationCompliance TEXT,
  healthConcerns TEXT,
  medicalHistory TEXT,
  specialNeeds TEXT,
  physicalLimitations TEXT,
  emergencyContact1Name TEXT,
  emergencyContact1Phone TEXT,
  emergencyContact1Relation TEXT,
  emergencyContact2Name TEXT,
  emergencyContact2Phone TEXT,
  emergencyContact2Relation TEXT,
  physicianName TEXT,
  physicianPhone TEXT,
  lastHealthCheckup TEXT,
  additionalNotes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createStandardizedInterventionTable = `
CREATE TABLE IF NOT EXISTS standardized_interventions (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  interventionType TEXT NOT NULL,
  interventionCategory TEXT NOT NULL CHECK (interventionCategory IN ('akademik', 'davranışsal', 'sosyal', 'aile', 'psikolojik', 'kariyer')),
  targetIssues TEXT, -- JSON array
  targetSkills TEXT, -- JSON array
  startDate TEXT NOT NULL,
  endDate TEXT,
  sessionFrequency TEXT CHECK (sessionFrequency IN ('GÜNLÜK', 'HAFTALIK', 'İKİ_HAFTADA', 'AYLIK')),
  totalSessions INTEGER,
  completedSessions INTEGER DEFAULT 0,
  initialAssessment INTEGER,
  currentAssessment INTEGER,
  effectiveness TEXT CHECK (effectiveness IN ('ÇOK_ETKİLİ', 'ETKİLİ', 'KISMEN_ETKİLİ', 'ETKİSİZ', 'DEĞERLENDİRİLMEDİ')),
  status TEXT NOT NULL CHECK (status IN ('PLANLANDI', 'DEVAM_EDIYOR', 'TAMAMLANDI', 'İPTAL', 'BEKLEMEDE')),
  assignedCounselor TEXT,
  otherStaff TEXT, -- JSON array
  description TEXT,
  progressNotes TEXT,
  outcomeNotes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createStandardizedBehaviorIncidentTable = `
CREATE TABLE IF NOT EXISTS standardized_behavior_incidents (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  incidentDate TEXT NOT NULL,
  incidentTime TEXT,
  location TEXT NOT NULL,
  behaviorCategory TEXT NOT NULL,
  behaviorType TEXT NOT NULL CHECK (behaviorType IN ('OLUMLU', 'KÜÇÜK_İHLAL', 'ORTA_DÜZEY', 'CİDDİ', 'ÇOK_CİDDİ')),
  antecedent TEXT,
  description TEXT NOT NULL,
  consequence TEXT,
  interventionsUsed TEXT, -- JSON array
  interventionEffectiveness TEXT CHECK (interventionEffectiveness IN ('ÇOK_ETKİLİ', 'ETKİLİ', 'KISMEN_ETKİLİ', 'ETKİSİZ')),
  parentNotified INTEGER DEFAULT 0,
  adminNotified INTEGER DEFAULT 0,
  followUpNeeded INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('AÇIK', 'DEVAM_EDIYOR', 'ÇÖZÜLDÜ', 'İZLENIYOR')),
  reportedBy TEXT NOT NULL,
  witnessedBy TEXT, -- JSON array
  additionalNotes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createMotivationProfileTable = `
CREATE TABLE IF NOT EXISTS motivation_profiles (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  assessmentDate TEXT NOT NULL,
  primaryMotivationSources TEXT, -- JSON array (UI: primaryMotivators)
  academicMotivation INTEGER,
  socialMotivation INTEGER,
  achievementMotivation INTEGER,
  intrinsicMotivation INTEGER, -- UI: intrinsicMotivationLevel
  extrinsicMotivation INTEGER, -- UI: extrinsicMotivationLevel
  hasShortTermGoals INTEGER DEFAULT 0,
  hasLongTermGoals INTEGER DEFAULT 0,
  goalClarityLevel INTEGER,
  goalCommitmentLevel INTEGER,
  goalOrientation TEXT,
  resilienceLevel INTEGER,
  careerAspirations TEXT, -- JSON array
  universityPreferences TEXT, -- JSON array
  academicGoals TEXT, -- JSON array (added in migration 024)
  persistenceLevel INTEGER, -- 1-10 scale (added in migration 024)
  futureOrientationLevel INTEGER, -- 1-10 scale (added in migration 024)
  shortTermGoals TEXT, -- Text field (added in migration 024)
  longTermGoals TEXT, -- Text field (added in migration 024)
  obstacles TEXT, -- Text field (added in migration 024)
  supportNeeds TEXT, -- Text field (added in migration 024)
  studentExpectations TEXT, -- Student's own expectations for future
  familyExpectations TEXT, -- Family's expectations from student
  additionalNotes TEXT,
  assessedBy TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createRiskProtectiveProfileTable = `
CREATE TABLE IF NOT EXISTS risk_protective_profiles (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  assessmentDate TEXT NOT NULL,
  -- Risk levels (TEXT enum for backward compatibility)
  academicRiskLevel TEXT CHECK (academicRiskLevel IN ('DÜŞÜK', 'ORTA', 'YÜKSEK', 'KRİTİK')),
  behavioralRiskLevel TEXT CHECK (behavioralRiskLevel IN ('DÜŞÜK', 'ORTA', 'YÜKSEK', 'KRİTİK')),
  socialEmotionalRiskLevel TEXT CHECK (socialEmotionalRiskLevel IN ('DÜŞÜK', 'ORTA', 'YÜKSEK', 'KRİTİK')),
  attendanceRiskLevel TEXT CHECK (attendanceRiskLevel IN ('DÜŞÜK', 'ORTA', 'YÜKSEK', 'KRİTİK')),
  dropoutRisk TEXT CHECK (dropoutRisk IN ('DÜŞÜK', 'ORTA', 'YÜKSEK', 'KRİTİK')),
  -- Numeric risk levels (1-10 scale for UI sliders)
  overallRiskLevel INTEGER, -- UI: overallRiskLevel (1-10)
  academicRiskLevelInt INTEGER, -- UI: academicRiskLevel (1-10)
  behavioralRiskLevelInt INTEGER, -- UI: behavioralRiskLevel (1-10)
  emotionalRiskLevel INTEGER, -- UI: emotionalRiskLevel (1-10)
  socialRiskLevel INTEGER, -- UI: socialRiskLevel (1-10)
  -- Protective factor levels (1-10 scale)
  familySupport INTEGER, -- UI: familySupport (1-10)
  peerSupport INTEGER, -- UI: peerSupport (1-10)
  schoolEngagement INTEGER, -- UI: schoolEngagement (1-10)
  resilienceLevel INTEGER, -- UI: resilienceLevel (1-10)
  copingSkills INTEGER, -- UI: copingSkills (1-10)
  -- Risk and protective factors (JSON arrays)
  activeProtectiveFactors TEXT, -- JSON array (UI: protectiveFactors)
  identifiedRiskFactors TEXT, -- JSON array (UI: identifiedRiskFactors)
  academicRiskFactors TEXT,
  behavioralRiskFactors TEXT,
  socialRiskFactors TEXT,
  familyRiskFactors TEXT,
  overallRiskScore INTEGER,
  recommendedInterventions TEXT, -- JSON array
  -- Assessment and planning
  riskAssessmentNotes TEXT, -- UI: riskAssessmentNotes
  interventionPlan TEXT, -- UI: interventionPlan
  monitoringFrequency TEXT, -- UI: monitoringFrequency ('GÜN', 'HAFTA', 'AY', 'ÜÇAY', 'YARI_YIL')
  assignedCounselor TEXT,
  parentNotified INTEGER DEFAULT 0,
  nextAssessmentDate TEXT,
  additionalNotes TEXT,
  assessedBy TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createAggregateScoresTable = `
CREATE TABLE IF NOT EXISTS student_aggregate_scores (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL UNIQUE,
  lastUpdated TEXT NOT NULL,
  academicPerformance INTEGER,
  socialCompetence INTEGER,
  emotionalWellbeing INTEGER,
  behavioralHealth INTEGER,
  motivationLevel INTEGER,
  overallRisk INTEGER,
  protectiveFactorsScore INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createAIInsightsTable = `
CREATE TABLE IF NOT EXISTS student_ai_insights (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  generatedAt TEXT NOT NULL,
  strengthsSummary TEXT, -- JSON array
  concernsSummary TEXT, -- JSON array
  recommendedActions TEXT, -- JSON array
  predictedOutcomes TEXT, -- JSON array
  confidenceScore REAL,
  modelVersion TEXT,
  dataSourcesUsed TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createSocialNetworkMetricsTable = `
CREATE TABLE IF NOT EXISTS social_network_metrics (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  className TEXT,
  assessmentDate TEXT NOT NULL,
  centralityScore REAL,
  betweennessScore REAL,
  degreeCount INTEGER,
  isolationRisk TEXT CHECK (isolationRisk IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  socialRole TEXT CHECK (socialRole IN ('LEADER', 'BRIDGE', 'FOLLOWER', 'ISOLATE', 'PERIPHERAL')),
  influenceScore REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createSocialGroupsTable = `
CREATE TABLE IF NOT EXISTS social_groups (
  id TEXT PRIMARY KEY,
  groupName TEXT NOT NULL,
  groupType TEXT,
  className TEXT,
  description TEXT,
  isActive INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`;

export const createSocialGroupMembersTable = `
CREATE TABLE IF NOT EXISTS social_group_members (
  id TEXT PRIMARY KEY,
  groupId TEXT NOT NULL,
  studentId TEXT NOT NULL,
  role TEXT,
  joinedDate TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (groupId) REFERENCES social_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createStudentSocioeconomicTable = `
CREATE TABLE IF NOT EXISTS student_socioeconomic (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  assessmentDate TEXT NOT NULL,
  familyIncomeLevel TEXT,
  parentEmploymentStatus TEXT,
  motherEducationLevel TEXT,
  fatherEducationLevel TEXT,
  householdSize INTEGER,
  numberOfSiblings INTEGER,
  birthOrder INTEGER,
  housingType TEXT,
  housingCondition TEXT,
  studySpaceAvailability TEXT,
  internetAccess TEXT,
  deviceAccess TEXT,
  schoolResourcesUsage TEXT,
  financialBarriers TEXT,
  resourcesAndSupports TEXT,
  scholarshipsOrAid TEXT,
  materialNeeds TEXT,
  nutritionStatus TEXT,
  transportationToSchool TEXT,
  extracurricularAccessibility TEXT,
  culturalCapital TEXT,
  socialCapital TEXT,
  communitySupport TEXT,
  economicStressors TEXT,
  familyFinancialStability TEXT,
  workResponsibilities TEXT,
  caregivingResponsibilities TEXT,
  notes TEXT,
  confidentialityLevel TEXT DEFAULT 'GİZLİ',
  assessedBy TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createStudentInterestsTable = `
CREATE TABLE IF NOT EXISTS student_interests (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  assessmentDate TEXT NOT NULL,
  hobbies TEXT,
  passions TEXT,
  favoriteSubjects TEXT,
  leastFavoriteSubjects TEXT,
  specialTalents TEXT,
  creativeExpressionForms TEXT,
  sportsActivities TEXT,
  artisticActivities TEXT,
  musicInterests TEXT,
  technologicalInterests TEXT,
  readingHabits TEXT,
  favoriteBooks TEXT,
  favoriteMoviesShows TEXT,
  curiosityAreas TEXT,
  explorativeTopics TEXT,
  careerInterests TEXT,
  clubMemberships TEXT,
  volunteerWork TEXT,
  partTimeJobs TEXT,
  projectsUndertaken TEXT,
  skillsDevelopment TEXT,
  learningPreferences TEXT,
  motivationalTopics TEXT,
  notes TEXT,
  assessedBy TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);`;

export const createIndexes = `
CREATE INDEX IF NOT EXISTS idx_academic_profiles_student ON academic_profiles(studentId);
CREATE INDEX IF NOT EXISTS idx_social_emotional_profiles_student ON social_emotional_profiles(studentId);
CREATE INDEX IF NOT EXISTS idx_talents_interests_profiles_student ON talents_interests_profiles(studentId);
CREATE INDEX IF NOT EXISTS idx_standardized_interventions_student ON standardized_interventions(studentId);
CREATE INDEX IF NOT EXISTS idx_standardized_interventions_status ON standardized_interventions(status);
CREATE INDEX IF NOT EXISTS idx_standardized_behavior_incidents_student ON standardized_behavior_incidents(studentId);
CREATE INDEX IF NOT EXISTS idx_standardized_behavior_incidents_date ON standardized_behavior_incidents(incidentDate);
CREATE INDEX IF NOT EXISTS idx_motivation_profiles_student ON motivation_profiles(studentId);
CREATE INDEX IF NOT EXISTS idx_risk_protective_profiles_student ON risk_protective_profiles(studentId);
CREATE INDEX IF NOT EXISTS idx_ai_insights_student ON student_ai_insights(studentId);
CREATE INDEX IF NOT EXISTS idx_social_network_metrics_student ON social_network_metrics(studentId);
CREATE INDEX IF NOT EXISTS idx_social_network_metrics_class ON social_network_metrics(className);
CREATE INDEX IF NOT EXISTS idx_social_group_members_group ON social_group_members(groupId);
CREATE INDEX IF NOT EXISTS idx_social_group_members_student ON social_group_members(studentId);
CREATE INDEX IF NOT EXISTS idx_student_socioeconomic_student ON student_socioeconomic(studentId);
CREATE INDEX IF NOT EXISTS idx_student_socioeconomic_date ON student_socioeconomic(assessmentDate);
CREATE INDEX IF NOT EXISTS idx_student_interests_student ON student_interests(studentId);
CREATE INDEX IF NOT EXISTS idx_student_interests_date ON student_interests(assessmentDate);
`;

function safeAddColumn(db: any, tableName: string, columnDef: string): void {
  const columnName = columnDef.split(' ')[0];
  try {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnDef}`);
    console.log(`✅ Migration: Added ${columnName} to ${tableName}`);
  } catch (err: any) {
    if (!err.message?.includes('duplicate column')) {
      console.warn(`Warning adding ${columnName} to ${tableName}:`, err.message);
    }
  }
}

export const initStandardizedProfileTables = (db: any) => {
  db.exec(createAcademicProfileTable);
  db.exec(createSocialEmotionalProfileTable);
  db.exec(createTalentsInterestsProfileTable);
  db.exec(createStandardizedHealthProfileTable);
  db.exec(createStandardizedInterventionTable);
  db.exec(createStandardizedBehaviorIncidentTable);
  db.exec(createMotivationProfileTable);
  db.exec(createRiskProtectiveProfileTable);
  db.exec(createAggregateScoresTable);
  db.exec(createAIInsightsTable);
  db.exec(createSocialNetworkMetricsTable);
  db.exec(createSocialGroupsTable);
  db.exec(createSocialGroupMembersTable);
  db.exec(createStudentSocioeconomicTable);
  db.exec(createStudentInterestsTable);
  db.exec(createIndexes);

  // Migration: Add new columns to motivation_profiles
  safeAddColumn(db, 'motivation_profiles', 'studentExpectations TEXT');
  safeAddColumn(db, 'motivation_profiles', 'familyExpectations TEXT');

  // Migration: Add new columns to risk_protective_profiles
  const riskColumns = [
    'overallRiskLevel INTEGER',
    'academicRiskLevelInt INTEGER',
    'behavioralRiskLevelInt INTEGER',
    'emotionalRiskLevel INTEGER',
    'socialRiskLevel INTEGER',
    'familySupport INTEGER',
    'peerSupport INTEGER',
    'schoolEngagement INTEGER',
    'resilienceLevel INTEGER',
    'copingSkills INTEGER',
    'identifiedRiskFactors TEXT',
    'riskAssessmentNotes TEXT',
    'interventionPlan TEXT',
    'monitoringFrequency TEXT',
  ];

  for (const columnDef of riskColumns) {
    safeAddColumn(db, 'risk_protective_profiles', columnDef);
  }

  // Migration: Add new columns to talents_interests_profiles
  safeAddColumn(db, 'talents_interests_profiles', 'hobbiesDetailed TEXT');
  safeAddColumn(db, 'talents_interests_profiles', 'extracurricularActivities TEXT');

  console.log('✅ Standardized profile tables and migrations completed');
};
