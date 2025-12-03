import type Database from 'better-sqlite3';

export function createDailyInsightsTables(db: Database.Database): void {
  // Daily Insights - Günlük içgörüler ve raporlar (okul bazlı)
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_insights (
      id TEXT PRIMARY KEY,
      schoolId TEXT,
      insightDate TEXT NOT NULL,
      reportType TEXT NOT NULL CHECK (reportType IN ('GÜNLÜK', 'HAFTALIK', 'AYLIK')),
      summary TEXT,
      totalStudents INTEGER DEFAULT 0,
      highRiskCount INTEGER DEFAULT 0,
      mediumRiskCount INTEGER DEFAULT 0,
      criticalAlertsCount INTEGER DEFAULT 0,
      newAlertsCount INTEGER DEFAULT 0,
      keyFindings TEXT,
      priorityActions TEXT,
      suggestedMeetings TEXT,
      aiInsights TEXT,
      trendAnalysis TEXT,
      generatedBy TEXT NOT NULL,
      generatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(insightDate, reportType, schoolId)
    );
  `);
  
  // Add schoolId column if not exists (migration for existing tables)
  try {
    db.exec(`ALTER TABLE daily_insights ADD COLUMN schoolId TEXT`);
  } catch (e) {
    // Column already exists
  }
  
  // Drop old unique constraint and create new one with schoolId (for existing tables)
  try {
    db.exec(`DROP INDEX IF EXISTS sqlite_autoindex_daily_insights_1`);
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_insights_school_date_type ON daily_insights(insightDate, reportType, schoolId)`);
  } catch (e) {
    // Index may already exist or other error
  }

  // Student Daily Status - Öğrenci günlük durum takibi
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_daily_status (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      statusDate TEXT NOT NULL,
      overallStatus TEXT NOT NULL CHECK (overallStatus IN ('İYİ', 'DİKKAT', 'RİSK', 'KRİTİK')),
      statusNotes TEXT,
      academicChange TEXT,
      behaviorChange TEXT,
      attendanceChange TEXT,
      needsAttention BOOLEAN DEFAULT FALSE,
      hasNewAlert BOOLEAN DEFAULT FALSE,
      hasCriticalAlert BOOLEAN DEFAULT FALSE,
      detectedPatterns TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      UNIQUE(studentId, statusDate)
    );
  `);

  // Proactive Alerts - Proaktif uyarılar
  db.exec(`
    CREATE TABLE IF NOT EXISTS proactive_alerts (
      id TEXT PRIMARY KEY,
      studentId TEXT,
      alertCategory TEXT NOT NULL CHECK (alertCategory IN ('AKADEMİK_DÜŞÜŞ', 'DEVAMSIZLIK_ARTIŞ', 'DAVRANIŞSAL_SORUN', 'SOSYAL_İZOLASYON', 'MOTİVASYON_KAYBI', 'SAĞLIK_ENDİŞESİ')),
      severity TEXT NOT NULL CHECK (severity IN ('DÜŞÜK', 'ORTA', 'YÜKSEK', 'KRİTİK')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      evidence TEXT,
      recommendation TEXT,
      status TEXT NOT NULL DEFAULT 'YENİ' CHECK (status IN ('YENİ', 'GÖRÜLDÜ', 'AKSIYONA_ALINDI', 'ÇÖZÜLDÜ', 'GÖRMEZDEN_GELİNDİ')),
      assignedTo TEXT,
      actionTaken TEXT,
      detectedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      acknowledgedAt DATETIME,
      resolvedAt DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  // Indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_daily_insights_date ON daily_insights(insightDate DESC);
    CREATE INDEX IF NOT EXISTS idx_daily_insights_type ON daily_insights(reportType);
    CREATE INDEX IF NOT EXISTS idx_daily_insights_school ON daily_insights(schoolId);

    CREATE INDEX IF NOT EXISTS idx_student_daily_status_student ON student_daily_status(studentId);
    CREATE INDEX IF NOT EXISTS idx_student_daily_status_date ON student_daily_status(statusDate DESC);
    CREATE INDEX IF NOT EXISTS idx_student_daily_status_attention ON student_daily_status(needsAttention);
    CREATE INDEX IF NOT EXISTS idx_student_daily_status_critical ON student_daily_status(hasCriticalAlert);

    CREATE INDEX IF NOT EXISTS idx_proactive_alerts_student ON proactive_alerts(studentId);
    CREATE INDEX IF NOT EXISTS idx_proactive_alerts_status ON proactive_alerts(status);
    CREATE INDEX IF NOT EXISTS idx_proactive_alerts_severity ON proactive_alerts(severity);
    CREATE INDEX IF NOT EXISTS idx_proactive_alerts_category ON proactive_alerts(alertCategory);
    CREATE INDEX IF NOT EXISTS idx_proactive_alerts_detected ON proactive_alerts(detectedAt DESC);
  `);
}
