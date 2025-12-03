import type Database from 'better-sqlite3';

export function createNotificationTables(db: Database.Database): void {
  // Notification Logs - Tüm gönderilen bildirimler
  db.exec(`
    CREATE TABLE IF NOT EXISTS notification_logs (
      id TEXT PRIMARY KEY,
      recipientType TEXT NOT NULL CHECK (recipientType IN ('COUNSELOR', 'PARENT', 'ADMIN', 'TEACHER')),
      recipientId TEXT,
      recipientName TEXT,
      recipientContact TEXT,
      notificationType TEXT NOT NULL CHECK (notificationType IN ('RISK_ALERT', 'INTERVENTION_REMINDER', 'PROGRESS_UPDATE', 'MEETING_SCHEDULED', 'WEEKLY_DIGEST', 'MONTHLY_REPORT', 'CUSTOM')),
      channel TEXT NOT NULL CHECK (channel IN ('EMAIL', 'SMS', 'PUSH', 'IN_APP')),
      subject TEXT,
      message TEXT NOT NULL,
      studentId TEXT,
      alertId TEXT,
      interventionId TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ')),
      priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
      metadata TEXT,
      templateId TEXT,
      sentAt TEXT,
      deliveredAt TEXT,
      readAt TEXT,
      failureReason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  // Notification Preferences - Kullanıcı bildirim tercihleri
  db.exec(`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id TEXT PRIMARY KEY,
      userId TEXT,
      parentId TEXT,
      studentId TEXT,
      userType TEXT NOT NULL CHECK (userType IN ('COUNSELOR', 'PARENT', 'ADMIN', 'TEACHER')),
      emailEnabled BOOLEAN DEFAULT TRUE,
      smsEnabled BOOLEAN DEFAULT FALSE,
      pushEnabled BOOLEAN DEFAULT TRUE,
      inAppEnabled BOOLEAN DEFAULT TRUE,
      emailAddress TEXT,
      phoneNumber TEXT,
      alertTypes TEXT,
      riskLevels TEXT,
      quietHoursStart TEXT,
      quietHoursEnd TEXT,
      weeklyDigest BOOLEAN DEFAULT FALSE,
      monthlyReport BOOLEAN DEFAULT FALSE,
      language TEXT DEFAULT 'tr',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(userId, userType)
    );
  `);

  // Notification Templates - Bildirim şablonları
  db.exec(`
    CREATE TABLE IF NOT EXISTS notification_templates (
      id TEXT PRIMARY KEY,
      templateName TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL CHECK (category IN ('RISK_ALERT', 'INTERVENTION', 'PROGRESS', 'MEETING', 'DIGEST', 'CUSTOM')),
      channel TEXT NOT NULL CHECK (channel IN ('EMAIL', 'SMS', 'PUSH', 'IN_APP', 'ALL')),
      subject TEXT,
      bodyTemplate TEXT NOT NULL,
      variables TEXT,
      isActive BOOLEAN DEFAULT TRUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Parent Access Tokens - Veli erişim tokenleri
  db.exec(`
    CREATE TABLE IF NOT EXISTS parent_access_tokens (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      parentName TEXT NOT NULL,
      parentContact TEXT NOT NULL,
      accessToken TEXT NOT NULL UNIQUE,
      accessLevel TEXT NOT NULL DEFAULT 'VIEW_ONLY' CHECK (accessLevel IN ('VIEW_ONLY', 'LIMITED', 'FULL')),
      expiresAt TEXT,
      isActive BOOLEAN DEFAULT TRUE,
      createdBy TEXT,
      lastAccessedAt TEXT,
      accessCount INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  // Scheduled Tasks - Zamanlanmış görevler
  db.exec(`
    CREATE TABLE IF NOT EXISTS scheduled_tasks (
      id TEXT PRIMARY KEY,
      taskType TEXT NOT NULL CHECK (taskType IN ('WEEKLY_DIGEST', 'MONTHLY_REPORT', 'DAILY_ALERTS', 'REMINDER', 'CUSTOM')),
      targetType TEXT NOT NULL CHECK (targetType IN ('USER', 'STUDENT', 'CLASS', 'ALL')),
      targetId TEXT,
      scheduleType TEXT NOT NULL CHECK (scheduleType IN ('ONCE', 'DAILY', 'WEEKLY', 'MONTHLY')),
      scheduledTime TEXT NOT NULL,
      nextRun TEXT NOT NULL,
      lastRun TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')),
      taskData TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_notification_logs_student ON notification_logs(studentId);
    CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
    CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient ON notification_logs(recipientId);
    CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(notificationType);
    CREATE INDEX IF NOT EXISTS idx_notification_logs_created ON notification_logs(created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(userId);
    CREATE INDEX IF NOT EXISTS idx_notification_preferences_student ON notification_preferences(studentId);
    
    CREATE INDEX IF NOT EXISTS idx_notification_templates_name ON notification_templates(templateName);
    CREATE INDEX IF NOT EXISTS idx_notification_templates_category ON notification_templates(category);
    
    CREATE INDEX IF NOT EXISTS idx_parent_access_tokens_student ON parent_access_tokens(studentId);
    CREATE INDEX IF NOT EXISTS idx_parent_access_tokens_token ON parent_access_tokens(accessToken);
    CREATE INDEX IF NOT EXISTS idx_parent_access_tokens_active ON parent_access_tokens(isActive);
    
    CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON scheduled_tasks(status);
    CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_next_run ON scheduled_tasks(nextRun);
  `);
}
