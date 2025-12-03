/**
 * Live Profile Sync Database Schema
 * Canlı profil senkronizasyonu için database tabloları
 */

import type Database from 'better-sqlite3';

export function createProfileSyncTables(db: Database.Database): void {
  
  // 1. Unified Student Identity - "Öğrenci Kimdir?" bilgisi
  db.exec(`
    CREATE TABLE IF NOT EXISTS unified_student_identity (
      studentId TEXT PRIMARY KEY,
      lastUpdated TEXT NOT NULL,
      
      -- Core Identity
      summary TEXT NOT NULL,
      keyCharacteristics TEXT, -- JSON array
      currentState TEXT,
      
      -- Domain Scores (0-100)
      academicScore INTEGER DEFAULT 50,
      socialEmotionalScore INTEGER DEFAULT 50,
      behavioralScore INTEGER DEFAULT 50,
      motivationScore INTEGER DEFAULT 50,
      riskLevel INTEGER DEFAULT 50,
      
      -- Quick Facts
      strengths TEXT, -- JSON array
      challenges TEXT, -- JSON array
      recentChanges TEXT, -- JSON array
      
      -- AI Insights
      personalityProfile TEXT,
      learningStyle TEXT,
      interventionPriority TEXT DEFAULT 'medium',
      recommendedActions TEXT, -- JSON array
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  // 2. Profile Sync Logs - Tüm profil güncellemeleri
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile_sync_logs (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      source TEXT NOT NULL, -- counseling_session, survey_response, etc.
      sourceId TEXT NOT NULL,
      domain TEXT NOT NULL, -- academic, social_emotional, etc.
      action TEXT NOT NULL, -- created, updated, validated, rejected
      validationScore INTEGER,
      aiReasoning TEXT,
      extractedInsights TEXT, -- JSON
      timestamp TEXT NOT NULL,
      processedBy TEXT DEFAULT 'ai', -- ai, manual
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  // 3. Conflict Resolutions - Çelişki çözümleri
  db.exec(`
    CREATE TABLE IF NOT EXISTS conflict_resolutions (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      conflictType TEXT NOT NULL,
      domain TEXT NOT NULL,
      oldValue TEXT,
      newValue TEXT,
      resolvedValue TEXT,
      resolutionMethod TEXT NOT NULL, -- ai_auto, time_based, confidence_based, manual
      severity TEXT NOT NULL, -- low, medium, high
      reasoning TEXT,
      timestamp TEXT NOT NULL,
      resolvedBy TEXT, -- user_id or 'ai'
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  // 4. Profile Update Queue - Bekleyen güncellemeler (opsiyonel)
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile_update_queue (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      source TEXT NOT NULL,
      sourceId TEXT NOT NULL,
      rawData TEXT NOT NULL, -- JSON
      status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
      priority INTEGER DEFAULT 1,
      retryCount INTEGER DEFAULT 0,
      errorMessage TEXT,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME,
      
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  // 5. AI Corrections - Manuel AI düzeltmeleri
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_corrections (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      domain TEXT NOT NULL,
      field TEXT NOT NULL,
      oldValue TEXT,
      newValue TEXT,
      reason TEXT,
      correctedBy TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  // 6. Undo Operations - Geri alma işlemleri
  db.exec(`
    CREATE TABLE IF NOT EXISTS undo_operations (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      logId TEXT NOT NULL,
      previousState TEXT, -- JSON
      timestamp TEXT NOT NULL,
      performedBy TEXT NOT NULL,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (logId) REFERENCES profile_sync_logs (id) ON DELETE CASCADE
    );
  `);

  // Indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sync_logs_student ON profile_sync_logs(studentId);
    CREATE INDEX IF NOT EXISTS idx_sync_logs_source ON profile_sync_logs(source);
    CREATE INDEX IF NOT EXISTS idx_sync_logs_timestamp ON profile_sync_logs(timestamp);
    
    CREATE INDEX IF NOT EXISTS idx_conflicts_student ON conflict_resolutions(studentId);
    CREATE INDEX IF NOT EXISTS idx_conflicts_severity ON conflict_resolutions(severity);
    
    CREATE INDEX IF NOT EXISTS idx_update_queue_status ON profile_update_queue(status);
    CREATE INDEX IF NOT EXISTS idx_update_queue_priority ON profile_update_queue(priority);
    
    CREATE INDEX IF NOT EXISTS idx_ai_corrections_student ON ai_corrections(studentId);
    CREATE INDEX IF NOT EXISTS idx_ai_corrections_timestamp ON ai_corrections(timestamp);
    
    CREATE INDEX IF NOT EXISTS idx_undo_operations_student ON undo_operations(studentId);
    CREATE INDEX IF NOT EXISTS idx_undo_operations_log ON undo_operations(logId);
  `);

  console.log('✅ Profile sync tables created successfully');
}
