import type Database from 'better-sqlite3';

export function createHolisticProfileTables(db: Database.Database): void {
  // Student Future Vision Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_future_vision (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      assessmentDate TEXT NOT NULL,
      shortTermGoals TEXT,
      longTermGoals TEXT,
      careerAspirations TEXT,
      dreamJob TEXT,
      educationalGoals TEXT,
      universityPreferences TEXT,
      majorPreferences TEXT,
      lifeGoals TEXT,
      personalDreams TEXT,
      fearsAndConcerns TEXT,
      perceivedBarriers TEXT,
      motivationSources TEXT,
      motivationLevel INTEGER,
      selfEfficacyLevel INTEGER,
      growthMindset TEXT,
      futureOrientation TEXT,
      roleModels TEXT,
      inspirationSources TEXT,
      valuesAndPriorities TEXT,
      planningAbility INTEGER,
      timeManagementSkills INTEGER,
      decisionMakingStyle TEXT,
      riskTakingTendency TEXT,
      actionSteps TEXT,
      progressTracking TEXT,
      notes TEXT,
      assessedBy TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  // Student Strengths Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_strengths (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      assessmentDate TEXT NOT NULL,
      personalStrengths TEXT,
      academicStrengths TEXT,
      socialStrengths TEXT,
      creativeStrengths TEXT,
      physicalStrengths TEXT,
      successStories TEXT,
      resilienceFactors TEXT,
      supportSystems TEXT,
      copingStrategies TEXT,
      achievements TEXT,
      skills TEXT,
      talents TEXT,
      positiveFeedback TEXT,
      growthMindsetIndicators TEXT,
      notes TEXT,
      assessedBy TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  // Student Interests Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_interests (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      assessmentDate TEXT NOT NULL,
      academicInterests TEXT,
      careerInterests TEXT,
      hobbies TEXT,
      extracurricularActivities TEXT,
      clubsAndOrganizations TEXT,
      volunteerWork TEXT,
      sportsAndPhysicalActivities TEXT,
      artsAndCreativeActivities TEXT,
      technologyInterests TEXT,
      readingPreferences TEXT,
      mediaConsumption TEXT,
      socialActivities TEXT,
      culturalInterests TEXT,
      environmentalConcerns TEXT,
      communityInvolvement TEXT,
      leadershipRoles TEXT,
      projectsAndInitiatives TEXT,
      learningPreferences TEXT,
      explorationAreas TEXT,
      notes TEXT,
      assessedBy TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  // Student SEL Competencies Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_sel_competencies (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      assessmentDate TEXT NOT NULL,
      selfAwareness INTEGER,
      selfManagement INTEGER,
      socialAwareness INTEGER,
      relationshipSkills INTEGER,
      responsibleDecisionMaking INTEGER,
      emotionalRegulation INTEGER,
      stressManagement INTEGER,
      impulseControl INTEGER,
      goalSetting INTEGER,
      organizationSkills INTEGER,
      empathy INTEGER,
      perspectiveTaking INTEGER,
      respectForDiversity INTEGER,
      communication INTEGER,
      cooperation INTEGER,
      conflictResolution INTEGER,
      helpSeeking INTEGER,
      problemSolving INTEGER,
      ethicalResponsibility INTEGER,
      criticalThinking INTEGER,
      reflectivePractice INTEGER,
      growthMindset INTEGER,
      resilience INTEGER,
      adaptability INTEGER,
      notes TEXT,
      assessedBy TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  // Student Socioeconomic Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_socioeconomic (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      assessmentDate TEXT NOT NULL,
      familyStructure TEXT,
      householdSize INTEGER,
      primaryLanguage TEXT,
      languagesSpoken TEXT,
      parentalEducationLevel TEXT,
      parentalEmploymentStatus TEXT,
      householdIncome TEXT,
      housingStatus TEXT,
      neighborhoodCharacteristics TEXT,
      accessToResources TEXT,
      transportationAccess TEXT,
      technologyAccess TEXT,
      internetAccess TEXT,
      studySpaceAvailability TEXT,
      nutritionAndFood TEXT,
      healthcareAccess TEXT,
      parentalInvolvement TEXT,
      familySupport TEXT,
      culturalBackground TEXT,
      religiousAffiliation TEXT,
      immigrationStatus TEXT,
      specialCircumstances TEXT,
      notes TEXT,
      assessedBy TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_future_vision_student ON student_future_vision(studentId);
    CREATE INDEX IF NOT EXISTS idx_future_vision_date ON student_future_vision(assessmentDate);
    CREATE INDEX IF NOT EXISTS idx_strengths_student ON student_strengths(studentId);
    CREATE INDEX IF NOT EXISTS idx_strengths_date ON student_strengths(assessmentDate);
    CREATE INDEX IF NOT EXISTS idx_interests_student ON student_interests(studentId);
    CREATE INDEX IF NOT EXISTS idx_interests_date ON student_interests(assessmentDate);
    CREATE INDEX IF NOT EXISTS idx_sel_student ON student_sel_competencies(studentId);
    CREATE INDEX IF NOT EXISTS idx_sel_date ON student_sel_competencies(assessmentDate);
    CREATE INDEX IF NOT EXISTS idx_socioeconomic_student ON student_socioeconomic(studentId);
    CREATE INDEX IF NOT EXISTS idx_socioeconomic_date ON student_socioeconomic(assessmentDate);
  `);
  
  console.log('✅ Holistic profile tables created successfully');
}
