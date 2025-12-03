import type Database from 'better-sqlite3';

export function createAISuggestionsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_suggestion_queue (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      suggestionType TEXT NOT NULL,
      source TEXT NOT NULL,
      sourceId TEXT,
      priority TEXT DEFAULT 'MEDIUM' CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      reasoning TEXT,
      confidence REAL,
      proposedChanges TEXT,
      currentValues TEXT,
      aiModel TEXT,
      aiVersion TEXT,
      analysisData TEXT,
      status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'MODIFIED')),
      reviewedBy TEXT,
      reviewedAt TEXT,
      reviewNotes TEXT,
      feedbackRating INTEGER CHECK(feedbackRating BETWEEN 1 AND 5),
      feedbackNotes TEXT,
      expiresAt TEXT NOT NULL,
      appliedAt TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_ai_suggestions_student ON ai_suggestion_queue(studentId);
    CREATE INDEX IF NOT EXISTS idx_ai_suggestions_status ON ai_suggestion_queue(status);
    CREATE INDEX IF NOT EXISTS idx_ai_suggestions_priority ON ai_suggestion_queue(priority);
    CREATE INDEX IF NOT EXISTS idx_ai_suggestions_expires ON ai_suggestion_queue(expiresAt);
  `);
}
