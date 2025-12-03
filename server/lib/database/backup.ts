import type Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export function createBackup(db: Database.Database, backupPath?: string): string {
  if (!backupPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupsDir = path.join(process.cwd(), 'backups');
    
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    
    backupPath = path.join(backupsDir, `backup-${timestamp}.db`);
  }
  
  try {
    db.prepare(`VACUUM INTO ?`).run(backupPath);
    console.log(`Database backup created: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
}

export function cleanupOldBackups(keepCount: number = 10): void {
  const backupsDir = path.join(process.cwd(), 'backups');
  
  if (!fs.existsSync(backupsDir)) {
    return;
  }
  
  try {
    const files = fs.readdirSync(backupsDir)
      .filter((file: string) => file.endsWith('.db'))
      .map((file: string) => ({
        name: file,
        path: path.join(backupsDir, file),
        time: fs.statSync(path.join(backupsDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
    
    if (files.length > keepCount) {
      const filesToDelete = files.slice(keepCount);
      filesToDelete.forEach((file) => {
        fs.unlinkSync(file.path);
        console.log(`Deleted old backup: ${file.name}`);
      });
    }
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
  }
}

export function scheduleAutoBackup(db: Database.Database, intervalHours: number = 24): NodeJS.Timeout {
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  createBackup(db);
  cleanupOldBackups();
  
  const backupInterval = setInterval(() => {
    try {
      createBackup(db);
      cleanupOldBackups();
    } catch (error) {
      console.error('Scheduled backup failed:', error);
    }
  }, intervalMs);
  
  console.log(`Automatic backups scheduled every ${intervalHours} hours`);
  return backupInterval;
}
