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

export function createMultipleIntelligenceTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS multiple_intelligence (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      assessmentDate TEXT NOT NULL,
      linguisticVerbal REAL DEFAULT 0,
      logicalMathematical REAL DEFAULT 0,
      visualSpatial REAL DEFAULT 0,
      bodilyKinesthetic REAL DEFAULT 0,
      musicalRhythmic REAL DEFAULT 0,
      interpersonal REAL DEFAULT 0,
      intrapersonal REAL DEFAULT 0,
      naturalistic REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  safeAddColumn(db, 'multiple_intelligence', 'linguisticVerbal', 'REAL DEFAULT 0');
  safeAddColumn(db, 'multiple_intelligence', 'visualSpatial', 'REAL DEFAULT 0');
  safeAddColumn(db, 'multiple_intelligence', 'naturalistic', 'REAL DEFAULT 0');

  if (columnExists(db, 'multiple_intelligence', 'linguistic')) {
    db.exec(`
      UPDATE multiple_intelligence 
      SET linguisticVerbal = COALESCE(linguistic, 0),
          visualSpatial = COALESCE(spatial, 0),
          naturalistic = COALESCE(naturalist, 0)
      WHERE linguisticVerbal IS NULL OR visualSpatial IS NULL OR naturalistic IS NULL
    `);
  }
}
