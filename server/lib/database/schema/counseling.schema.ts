import type Database from 'better-sqlite3';

function columnExists(db: Database.Database, tableName: string, columnName: string): boolean {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  return columns.some(col => col.name === columnName);
}

function safeAddColumn(db: Database.Database, tableName: string, columnName: string, columnDef: string): void {
  if (!columnExists(db, tableName, columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
  }
}

export function createCounselingTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meeting_notes (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('Bireysel', 'Grup', 'Veli')),
      note TEXT NOT NULL,
      plan TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  safeAddColumn(db, 'meeting_notes', 'schoolId', 'TEXT');
  db.exec(`CREATE INDEX IF NOT EXISTS idx_meeting_notes_schoolId ON meeting_notes(schoolId);`);
  db.exec(`
    UPDATE meeting_notes 
    SET schoolId = (SELECT schoolId FROM students WHERE students.id = meeting_notes.studentId)
    WHERE schoolId IS NULL AND studentId IS NOT NULL
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS counseling_sessions (
      id TEXT PRIMARY KEY,
      sessionType TEXT NOT NULL CHECK (sessionType IN ('individual', 'group')),
      groupName TEXT,
      counselorId TEXT NOT NULL,
      schoolId TEXT DEFAULT 'school-default-001',
      sessionDate TEXT NOT NULL,
      entryTime TEXT NOT NULL,
      entryClassHourId INTEGER,
      exitTime TEXT,
      exitClassHourId INTEGER,
      topic TEXT,
      participantType TEXT NOT NULL,
      relationshipType TEXT,
      otherParticipants TEXT,
      parentName TEXT,
      parentRelationship TEXT,
      teacherName TEXT,
      teacherBranch TEXT,
      otherParticipantDescription TEXT,
      sessionMode TEXT NOT NULL CHECK (sessionMode IN ('yüz_yüze', 'telefon', 'online')),
      sessionLocation TEXT NOT NULL,
      disciplineStatus TEXT,
      institutionalCooperation TEXT,
      sessionDetails TEXT,
      detailedNotes TEXT,
      sessionFlow TEXT CHECK (sessionFlow IN ('çok_olumlu', 'olumlu', 'nötr', 'sorunlu', 'kriz')),
      studentParticipationLevel TEXT,
      cooperationLevel INTEGER,
      emotionalState TEXT,
      physicalState TEXT,
      communicationQuality TEXT,
      sessionTags TEXT,
      achievedOutcomes TEXT,
      followUpNeeded BOOLEAN DEFAULT FALSE,
      followUpPlan TEXT,
      actionItems TEXT,
      autoCompleted BOOLEAN DEFAULT FALSE,
      extensionGranted BOOLEAN DEFAULT FALSE,
      completed BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  safeAddColumn(db, 'counseling_sessions', 'schoolId', "TEXT DEFAULT 'school-default-001'");

  db.exec(`UPDATE counseling_sessions SET schoolId = 'school-default-001' WHERE schoolId IS NULL OR schoolId = ''`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_counseling_sessions_schoolId ON counseling_sessions(schoolId)`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS counseling_session_students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId TEXT NOT NULL,
      studentId TEXT NOT NULL,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sessionId) REFERENCES counseling_sessions (id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE,
      UNIQUE(sessionId, studentId)
    );
  `);

  safeAddColumn(db, 'counseling_session_students', 'schoolId', 'TEXT');
  db.exec(`CREATE INDEX IF NOT EXISTS idx_counseling_session_students_schoolId ON counseling_session_students(schoolId);`);
  db.exec(`
    UPDATE counseling_session_students 
    SET schoolId = (SELECT schoolId FROM students WHERE students.id = counseling_session_students.studentId)
    WHERE schoolId IS NULL AND studentId IS NOT NULL
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS parent_meetings (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      meetingDate TEXT NOT NULL,
      time TEXT,
      type TEXT,
      participants TEXT,
      mainTopics TEXT,
      concerns TEXT,
      decisions TEXT,
      actionPlan TEXT,
      nextMeetingDate TEXT,
      parentSatisfaction INTEGER,
      followUpRequired BOOLEAN,
      notes TEXT,
      createdBy TEXT,
      createdAt TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  safeAddColumn(db, 'parent_meetings', 'schoolId', 'TEXT');
  db.exec(`CREATE INDEX IF NOT EXISTS idx_parent_meetings_schoolId ON parent_meetings(schoolId);`);
  db.exec(`
    UPDATE parent_meetings 
    SET schoolId = (SELECT schoolId FROM students WHERE students.id = parent_meetings.studentId)
    WHERE schoolId IS NULL AND studentId IS NOT NULL
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS home_visits (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      visitDuration INTEGER,
      visitors TEXT,
      familyPresent TEXT,
      homeEnvironment TEXT,
      familyInteraction TEXT,
      observations TEXT,
      recommendations TEXT,
      concerns TEXT,
      resources TEXT,
      followUpActions TEXT,
      nextVisitPlanned TEXT,
      notes TEXT,
      createdBy TEXT,
      createdAt TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  safeAddColumn(db, 'home_visits', 'schoolId', 'TEXT');
  db.exec(`CREATE INDEX IF NOT EXISTS idx_home_visits_schoolId ON home_visits(schoolId);`);
  db.exec(`
    UPDATE home_visits 
    SET schoolId = (SELECT schoolId FROM students WHERE students.id = home_visits.studentId)
    WHERE schoolId IS NULL AND studentId IS NOT NULL
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS family_participation (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      eventType TEXT NOT NULL,
      eventName TEXT,
      eventDate TEXT NOT NULL,
      participationStatus TEXT,
      participants TEXT,
      engagementLevel TEXT,
      communicationFrequency TEXT,
      preferredContactMethod TEXT,
      parentAvailability TEXT,
      notes TEXT,
      recordedBy TEXT,
      recordedAt TEXT,
      description TEXT,
      participantNames TEXT,
      outcomes TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  safeAddColumn(db, 'family_participation', 'schoolId', 'TEXT');
  db.exec(`CREATE INDEX IF NOT EXISTS idx_family_participation_schoolId ON family_participation(schoolId);`);
  db.exec(`
    UPDATE family_participation 
    SET schoolId = (SELECT schoolId FROM students WHERE students.id = family_participation.studentId)
    WHERE schoolId IS NULL AND studentId IS NOT NULL
  `);

  safeAddColumn(db, 'family_participation', 'eventName', 'TEXT');
  safeAddColumn(db, 'family_participation', 'participationStatus', 'TEXT');
  safeAddColumn(db, 'family_participation', 'participants', 'TEXT');
  safeAddColumn(db, 'family_participation', 'engagementLevel', 'TEXT');
  safeAddColumn(db, 'family_participation', 'communicationFrequency', 'TEXT');
  safeAddColumn(db, 'family_participation', 'preferredContactMethod', 'TEXT');
  safeAddColumn(db, 'family_participation', 'parentAvailability', 'TEXT');
  safeAddColumn(db, 'family_participation', 'recordedBy', 'TEXT');
  safeAddColumn(db, 'family_participation', 'recordedAt', 'TEXT');
  safeAddColumn(db, 'family_participation', 'notes', 'TEXT');

  safeAddColumn(db, 'counseling_sessions', 'mebbis_transferred', 'INTEGER DEFAULT 0');
  safeAddColumn(db, 'counseling_sessions', 'mebbis_transfer_date', 'TEXT');
  safeAddColumn(db, 'counseling_sessions', 'mebbis_transfer_error', 'TEXT');
  safeAddColumn(db, 'counseling_sessions', 'mebbis_retry_count', 'INTEGER DEFAULT 0');

  db.exec(`
    CREATE TABLE IF NOT EXISTS counseling_reminders (
      id TEXT PRIMARY KEY,
      sessionId TEXT,
      reminderType TEXT NOT NULL CHECK (reminderType IN ('planned_session', 'follow_up', 'parent_meeting')),
      reminderDate TEXT NOT NULL,
      reminderTime TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      studentIds TEXT,
      status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
      notificationSent BOOLEAN DEFAULT FALSE,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sessionId) REFERENCES counseling_sessions (id) ON DELETE SET NULL,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  safeAddColumn(db, 'counseling_reminders', 'schoolId', 'TEXT');
  db.exec(`CREATE INDEX IF NOT EXISTS idx_counseling_reminders_schoolId ON counseling_reminders(schoolId);`);
  db.exec(`
    UPDATE counseling_reminders 
    SET schoolId = (SELECT schoolId FROM counseling_sessions WHERE counseling_sessions.id = counseling_reminders.sessionId)
    WHERE schoolId IS NULL AND sessionId IS NOT NULL
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS counseling_follow_ups (
      id TEXT PRIMARY KEY,
      sessionId TEXT,
      followUpDate TEXT NOT NULL,
      assignedTo TEXT NOT NULL,
      priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
      status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
      actionItems TEXT NOT NULL,
      notes TEXT,
      completedDate TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sessionId) REFERENCES counseling_sessions (id) ON DELETE SET NULL,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  safeAddColumn(db, 'counseling_follow_ups', 'schoolId', 'TEXT');
  db.exec(`CREATE INDEX IF NOT EXISTS idx_counseling_follow_ups_schoolId ON counseling_follow_ups(schoolId);`);
  db.exec(`
    UPDATE counseling_follow_ups 
    SET schoolId = (SELECT schoolId FROM counseling_sessions WHERE counseling_sessions.id = counseling_follow_ups.sessionId)
    WHERE schoolId IS NULL AND sessionId IS NOT NULL
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS counseling_outcomes (
      id TEXT PRIMARY KEY,
      sessionId TEXT NOT NULL,
      effectivenessRating INTEGER CHECK (effectivenessRating BETWEEN 1 AND 5),
      progressNotes TEXT,
      goalsAchieved TEXT,
      nextSteps TEXT,
      recommendations TEXT,
      followUpRequired BOOLEAN DEFAULT FALSE,
      followUpDate TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sessionId) REFERENCES counseling_sessions (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );
  `);

  safeAddColumn(db, 'counseling_outcomes', 'schoolId', 'TEXT');
  db.exec(`CREATE INDEX IF NOT EXISTS idx_counseling_outcomes_schoolId ON counseling_outcomes(schoolId);`);
  db.exec(`
    UPDATE counseling_outcomes 
    SET schoolId = (SELECT schoolId FROM counseling_sessions WHERE counseling_sessions.id = counseling_outcomes.sessionId)
    WHERE schoolId IS NULL AND sessionId IS NOT NULL
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS peer_relationships (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      peerId TEXT NOT NULL,
      relationshipType TEXT NOT NULL CHECK(relationshipType IN ('FRIEND', 'CLOSE_FRIEND', 'STUDY_PARTNER', 'ACQUAINTANCE', 'CONFLICT')),
      relationshipStrength INTEGER DEFAULT 5,
      notes TEXT,
      schoolId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (peerId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_peer_relationships_student ON peer_relationships(studentId);
    CREATE INDEX IF NOT EXISTS idx_peer_relationships_peer ON peer_relationships(peerId);
    CREATE INDEX IF NOT EXISTS idx_peer_relationships_type ON peer_relationships(relationshipType);
    CREATE INDEX IF NOT EXISTS idx_peer_relationships_schoolId ON peer_relationships(schoolId);
  `);

  safeAddColumn(db, 'peer_relationships', 'schoolId', 'TEXT');
  db.exec(`
    UPDATE peer_relationships 
    SET schoolId = (SELECT schoolId FROM students WHERE students.id = peer_relationships.studentId)
    WHERE schoolId IS NULL AND studentId IS NOT NULL
  `);
}
