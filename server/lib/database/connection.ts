import Database from 'better-sqlite3';
import { databaseConfig } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import * as fs from 'fs';
import * as path from 'path';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    try {
      const dbPath = databaseConfig.path;
      
      // Ensure database directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      db = new Database(dbPath);
      
      try {
        db.prepare('SELECT 1').get();
      } catch (connectionError) {
        logger.error('Database connection test failed', 'DatabaseConnection', connectionError);
        db.close();
        db = null;
        throw new Error('Failed to establish database connection');
      }
      
      try {
        db.pragma(`journal_mode = ${databaseConfig.pragmas.journalMode}`);
        db.pragma(`foreign_keys = ${databaseConfig.pragmas.foreignKeys ? 'ON' : 'OFF'}`);
        db.pragma(`encoding = "${databaseConfig.pragmas.encoding}"`);
      } catch (pragmaError) {
        logger.error('Failed to set database pragmas', 'DatabaseConnection', pragmaError);
        db.close();
        db = null;
        throw new Error('Failed to configure database settings');
      }
    } catch (error) {
      logger.error('Error initializing database', 'DatabaseConnection', error);
      if (db) {
        try {
          db.close();
        } catch (closeError) {
          logger.error('Error closing database after initialization failure', 'DatabaseConnection', closeError);
        }
        db = null;
      }
      throw error;
    }
  }
  return db;
}

/**
 * Closes the database connection gracefully
 * This should be called during application shutdown to ensure:
 * - WAL (Write-Ahead Logging) is properly flushed
 * - All pending writes are committed
 * - Lock files are cleaned up
 * - Database file integrity is maintained
 */
export function closeDatabase(): void {
  if (db) {
    try {
      logger.info('Closing database connection...', 'DatabaseConnection');
      db.close();
      db = null;
      logger.info('Database connection closed successfully', 'DatabaseConnection');
    } catch (error) {
      logger.error('Error closing database', 'DatabaseConnection', error);
      throw error;
    }
  }
}
