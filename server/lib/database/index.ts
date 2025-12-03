import { getDatabase as getDbConnection } from './connection';
import { initializeDatabaseSchema } from './schema';
import { setupDatabaseTriggers } from './triggers';
import { setupDatabaseIndexes } from './indexes';
import { createBackup, cleanupOldBackups, scheduleAutoBackup } from './backup';
import Database from 'better-sqlite3';

let isInitialized = false;

function getDatabase(): Database.Database {
  const db = getDbConnection();
  
  if (!isInitialized) {
    try {
      initializeDatabaseSchema(db);
      setupDatabaseTriggers(db);
      setupDatabaseIndexes(db);
      isInitialized = true;
    } catch (initError) {
      console.error('Failed to initialize database:', initError);
      throw new Error('Failed to initialize database');
    }
  }
  
  return db;
}

export default getDatabase;

export function initializeDatabase(): void {
  const db = getDatabase();
  
  try {
    initializeDatabaseSchema(db);
    setupDatabaseTriggers(db);
    setupDatabaseIndexes(db);
  } catch (initError) {
    console.error('Failed to initialize database:', initError);
    throw new Error('Failed to initialize database');
  }
}

export function setupTriggers(): void {
  const db = getDatabase();
  setupDatabaseTriggers(db);
}

export { 
  createBackup,
  cleanupOldBackups,
  scheduleAutoBackup
};
