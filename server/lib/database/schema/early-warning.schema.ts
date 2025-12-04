import type Database from 'better-sqlite3';

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

export function createEarlyWarningTables(db: Database.Database): void {
  // Risk Score History - Öğrenci risk skorları geçmişi
  db.exec(`
    CREATE TABLE IF NOT EXISTS risk_score_history (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      assessmentDate TEXT NOT NULL,
      academicScore INTEGER,
      behavioralScore INTEGER,
      attendanceScore INTEGER,
      socialEmotionalScore INTEGER,
      overallRiskScore INTEGER NOT NULL,
      riskLevel TEXT NOT NULL CHECK (riskLevel IN ('DÜŞÜK', 'ORTA', 'YÜKSEK', 'KRİTİK')),
      dataPoints TEXT,
      calculationMethod TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  // Early Warning Alerts - Erken uyarı sisteminden gelen uyarılar
  db.exec(`
    CREATE TABLE IF NOT EXISTS early_warning_alerts (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      alertType TEXT NOT NULL CHECK (alertType IN ('AKADEMİK', 'DAVRANIŞSAL', 'DEVAMSIZLIK', 'SOSYAL_DUYGUSAL', 'KARMA')),
      alertLevel TEXT NOT NULL CHECK (alertLevel IN ('DÜŞÜK', 'ORTA', 'YÜKSEK', 'KRİTİK')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      triggerCondition TEXT,
      triggerValue TEXT,
      threshold TEXT,
      dataSource TEXT,
      status TEXT NOT NULL DEFAULT 'AÇIK' CHECK (status IN ('AÇIK', 'İNCELENİYOR', 'ÇÖZÜLDÜ', 'İPTAL')),
      assignedTo TEXT,
      notifiedAt TEXT,
      reviewedAt TEXT,
      resolvedAt TEXT,
      resolution TEXT,
      notes TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  // Intervention Recommendations - Müdahale önerileri
  db.exec(`
    CREATE TABLE IF NOT EXISTS intervention_recommendations (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      alertId TEXT,
      recommendationType TEXT NOT NULL CHECK (recommendationType IN ('AKADEMİK_DESTEK', 'DAVRANIŞSAL_DESTEK', 'SOSYAL_DESTEK', 'PSİKOLOJİK_DESTEK', 'AİLE_KATILIMI', 'ÖZEL_EĞİTİM')),
      priority TEXT NOT NULL CHECK (priority IN ('DÜŞÜK', 'ORTA', 'YÜKSEK', 'ACİL')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      suggestedActions TEXT,
      targetArea TEXT,
      expectedOutcome TEXT,
      resources TEXT,
      estimatedDuration TEXT,
      status TEXT NOT NULL DEFAULT 'ÖNERİLDİ' CHECK (status IN ('ÖNERİLDİ', 'PLANLANDI', 'UYGULANMAKTA', 'TAMAMLANDI', 'İPTAL')),
      implementedBy TEXT,
      implementedAt TEXT,
      effectiveness TEXT,
      followUpDate TEXT,
      notes TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (alertId) REFERENCES early_warning_alerts (id) ON DELETE SET NULL,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  // Intervention Effectiveness - Müdahale etkinlik takibi
  db.exec(`
    CREATE TABLE IF NOT EXISTS intervention_effectiveness (
      id TEXT PRIMARY KEY,
      interventionId TEXT NOT NULL,
      studentId TEXT NOT NULL,
      interventionType TEXT NOT NULL,
      interventionTitle TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT,
      duration INTEGER,
      preInterventionMetrics TEXT,
      postInterventionMetrics TEXT,
      academicImpact TEXT,
      behavioralImpact TEXT,
      attendanceImpact TEXT,
      socialEmotionalImpact TEXT,
      overallEffectiveness INTEGER,
      effectivenessLevel TEXT CHECK (effectivenessLevel IN ('ÇOK_ETKİLİ', 'ETKİLİ', 'KISMEN_ETKİLİ', 'ETKİSİZ', 'PENDING')),
      successFactors TEXT,
      challenges TEXT,
      lessonsLearned TEXT,
      recommendations TEXT,
      aiAnalysis TEXT,
      patternMatches TEXT,
      similarInterventions TEXT,
      evaluatedBy TEXT,
      evaluatedAt TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  // Parent Feedback - Veli geri bildirimleri
  db.exec(`
    CREATE TABLE IF NOT EXISTS parent_feedback (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      parentName TEXT NOT NULL,
      parentContact TEXT,
      feedbackType TEXT NOT NULL CHECK (feedbackType IN ('MÜDAHALE', 'GENEL', 'TOPLANTI', 'RAPOR')),
      relatedId TEXT,
      rating INTEGER CHECK (rating BETWEEN 1 AND 5),
      feedbackText TEXT,
      concerns TEXT,
      suggestions TEXT,
      appreciations TEXT,
      followUpRequired BOOLEAN DEFAULT FALSE,
      followUpNotes TEXT,
      respondedBy TEXT,
      respondedAt TEXT,
      status TEXT NOT NULL DEFAULT 'YENİ' CHECK (status IN ('YENİ', 'İNCELENDİ', 'YANIT_VERİLDİ', 'KAPALI')),
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  // Escalation Logs - Yönlendirme/Yükseltme kayıtları
  db.exec(`
    CREATE TABLE IF NOT EXISTS escalation_logs (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      alertId TEXT,
      interventionId TEXT,
      escalationType TEXT NOT NULL CHECK (escalationType IN ('COUNSELOR', 'PRINCIPAL', 'PSYCHOLOGIST', 'SPECIAL_ED', 'EXTERNAL_AGENCY', 'FAMILY_COUNSELING')),
      currentLevel TEXT NOT NULL,
      escalatedTo TEXT NOT NULL,
      triggerReason TEXT NOT NULL,
      riskLevel TEXT CHECK (riskLevel IN ('DÜŞÜK', 'ORTA', 'YÜKSEK', 'KRİTİK')),
      escalatedBy TEXT,
      escalatedAt TEXT NOT NULL,
      responseTime INTEGER,
      respondedBy TEXT,
      respondedAt TEXT,
      actionTaken TEXT,
      resolution TEXT,
      status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED_FURTHER')),
      notificationsSent TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (alertId) REFERENCES early_warning_alerts (id) ON DELETE SET NULL,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  // Indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_risk_score_history_student ON risk_score_history(studentId);
    CREATE INDEX IF NOT EXISTS idx_risk_score_history_date ON risk_score_history(assessmentDate DESC);
    CREATE INDEX IF NOT EXISTS idx_risk_score_history_level ON risk_score_history(riskLevel);

    CREATE INDEX IF NOT EXISTS idx_early_warning_alerts_student ON early_warning_alerts(studentId);
    CREATE INDEX IF NOT EXISTS idx_early_warning_alerts_status ON early_warning_alerts(status);
    CREATE INDEX IF NOT EXISTS idx_early_warning_alerts_level ON early_warning_alerts(alertLevel);
    CREATE INDEX IF NOT EXISTS idx_early_warning_alerts_type ON early_warning_alerts(alertType);

    CREATE INDEX IF NOT EXISTS idx_intervention_recommendations_student ON intervention_recommendations(studentId);
    CREATE INDEX IF NOT EXISTS idx_intervention_recommendations_alert ON intervention_recommendations(alertId);
    CREATE INDEX IF NOT EXISTS idx_intervention_recommendations_status ON intervention_recommendations(status);
    CREATE INDEX IF NOT EXISTS idx_intervention_recommendations_priority ON intervention_recommendations(priority);

    CREATE INDEX IF NOT EXISTS idx_intervention_effectiveness_student ON intervention_effectiveness(studentId);
    CREATE INDEX IF NOT EXISTS idx_intervention_effectiveness_intervention ON intervention_effectiveness(interventionId);
    CREATE INDEX IF NOT EXISTS idx_intervention_effectiveness_level ON intervention_effectiveness(effectivenessLevel);

    CREATE INDEX IF NOT EXISTS idx_parent_feedback_student ON parent_feedback(studentId);
    CREATE INDEX IF NOT EXISTS idx_parent_feedback_status ON parent_feedback(status);
    CREATE INDEX IF NOT EXISTS idx_parent_feedback_type ON parent_feedback(feedbackType);

    CREATE INDEX IF NOT EXISTS idx_escalation_logs_student ON escalation_logs(studentId);
    CREATE INDEX IF NOT EXISTS idx_escalation_logs_intervention ON escalation_logs(interventionId);
    CREATE INDEX IF NOT EXISTS idx_escalation_logs_type ON escalation_logs(escalationType);
    CREATE INDEX IF NOT EXISTS idx_escalation_logs_risk ON escalation_logs(riskLevel);
  `);

  // Migration: Add schoolId to existing tables
  const tablesToMigrate = [
    'risk_score_history',
    'early_warning_alerts',
    'intervention_recommendations',
    'intervention_effectiveness',
    'parent_feedback',
    'escalation_logs'
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
    console.log('✅ Migration: Populated schoolId from students for early warning tables');
  } catch (err: any) {
    console.warn('Warning populating schoolId for early warning tables:', err.message);
  }
}
