import type Database from 'better-sqlite3';

// Assume getDatabase() is defined elsewhere and returns a Database instance
declare function getDatabase(): Database.Database;

export class TransactionHelper {
  constructor(private db: Database.Database) {}

  executeTransaction<T>(fn: () => T): T {
    const transaction = this.db.transaction(fn);
    return transaction();
  }

  beginTransaction(): void {
    this.db.exec('BEGIN IMMEDIATE TRANSACTION');
  }

  commit(): void {
    this.db.exec('COMMIT');
  }

  rollback(): void {
    this.db.exec('ROLLBACK');
  }

  executeWithManualTransaction<T>(fn: () => T): T {
    try {
      this.beginTransaction();
      const result = fn();
      this.commit();
      return result;
    } catch (error) {
      this.rollback();
      throw error;
    }
  }

  async executeAsyncWithManualTransaction<T>(fn: () => Promise<T>): Promise<T> {
    try {
      this.beginTransaction();
      const result = await fn();
      this.commit();
      return result;
    } catch (error) {
      this.rollback();
      throw error;
    }
  }
}

export function withTransaction<T>(db: Database.Database, fn: () => T): T {
  const helper = new TransactionHelper(db);
  return helper.executeWithManualTransaction(fn);
}

export async function withAsyncTransaction<T>(
  db: Database.Database,
  fn: () => Promise<T>
): Promise<T> {
  const helper = new TransactionHelper(db);
  return helper.executeAsyncWithManualTransaction(fn);
}

export function createTransactionHelper(db: Database.Database): TransactionHelper {
  return new TransactionHelper(db);
}

export async function withRetryableTransaction<T>(
  operation: (db: Database.Database) => T,
  options: { maxRetries?: number; retryDelay?: number } = {}
): Promise<T> {
  const { maxRetries = 3, retryDelay = 100 } = options;
  const db = getDatabase();

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      db.exec('BEGIN IMMEDIATE TRANSACTION');
      const result = operation(db);
      db.exec('COMMIT');
      return result;
    } catch (error) {
      db.exec('ROLLBACK');
      lastError = error as Error;

      // Retry on database locked errors
      if (error instanceof Error && error instanceof Error ? error.message : String(error).includes('database is locked')) {
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }
      }

      // Don't retry on other errors
      throw error;
    }
  }

  throw lastError || new Error('Transaction failed after retries');
}