import type Database from 'better-sqlite3';

export function createAIAnalysisTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_analysis_summary (
      date TEXT PRIMARY KEY,
      total_analyses INTEGER DEFAULT 0,
      successful_analyses INTEGER DEFAULT 0,
      avg_confidence REAL DEFAULT 0,
      avg_processing_time REAL DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_ai_analysis_summary_date 
    ON ai_analysis_summary(date DESC);
  `);

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS ai_analysis_last_n (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        sessionId TEXT,
        inputLength INTEGER,
        confidence INTEGER,
        processingTime INTEGER,
        aiProvider TEXT,
        modelVersion TEXT,
        success BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
      );
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_ai_analysis_last_n_created 
      ON ai_analysis_last_n(created_at DESC);
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_ai_analysis_last_n_student
      ON ai_analysis_last_n(studentId);
    `);
  } catch (error) {
    console.log('ai_analysis_last_n table already exists or error creating it');
  }
}
