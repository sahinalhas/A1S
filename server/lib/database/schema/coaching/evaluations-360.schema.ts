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

export function createEvaluations360Table(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS evaluations_360 (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      evaluationDate TEXT NOT NULL,
      selfEvaluation TEXT,
      teacherEvaluation TEXT,
      peerEvaluation TEXT,
      parentEvaluation TEXT,
      strengths TEXT,
      areasForImprovement TEXT,
      actionPlan TEXT,
      notes TEXT,
      evaluatorType TEXT,
      evaluatorName TEXT,
      ratings TEXT,
      comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  safeAddColumn(db, 'evaluations_360', 'selfEvaluation', 'TEXT');
  safeAddColumn(db, 'evaluations_360', 'teacherEvaluation', 'TEXT');
  safeAddColumn(db, 'evaluations_360', 'peerEvaluation', 'TEXT');
  safeAddColumn(db, 'evaluations_360', 'parentEvaluation', 'TEXT');
  safeAddColumn(db, 'evaluations_360', 'strengths', 'TEXT');
  safeAddColumn(db, 'evaluations_360', 'areasForImprovement', 'TEXT');
  safeAddColumn(db, 'evaluations_360', 'actionPlan', 'TEXT');
  safeAddColumn(db, 'evaluations_360', 'notes', 'TEXT');
}
