import path from 'path';
import { env } from './env.js';

/**
 * Database Configuration
 * 
 * Centralized database configuration for SQLite.
 * Uses environment variables with sensible defaults.
 */

export interface DatabaseConfig {
  path: string;
  pragmas: {
    journalMode: string;
    foreignKeys: boolean;
    encoding: string;
  };
}

/**
 * Get database configuration from environment
 */
export function getDatabaseConfig(): DatabaseConfig {
  const dbPath = path.isAbsolute(env.DATABASE_PATH)
    ? env.DATABASE_PATH
    : path.join(process.cwd(), env.DATABASE_PATH);

  return {
    path: dbPath,
    pragmas: {
      journalMode: 'WAL',
      foreignKeys: true,
      encoding: 'UTF-8',
    },
  };
}

/**
 * Database configuration instance
 */
export const databaseConfig = getDatabaseConfig();
