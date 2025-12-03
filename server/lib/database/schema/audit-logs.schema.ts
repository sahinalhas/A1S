import type Database from 'better-sqlite3';

export function createAuditLogsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      resource_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      details TEXT,
      timestamp TEXT NOT NULL,
      success INTEGER NOT NULL DEFAULT 1,
      error_message TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource);
    CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
  `);
}
