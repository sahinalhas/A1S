import type Database from 'better-sqlite3';
import getDatabase from './database';

export abstract class BaseRepository<T = any> {
  protected db: Database.Database;
  protected statements: Record<string, Database.Statement> = {};
  protected isInitialized = false;

  constructor() {
    this.db = getDatabase();
  }

  protected abstract initializeStatements(): void;

  protected ensureInitialized(): void {
    if (this.isInitialized) return;
    
    this.initializeStatements();
    this.isInitialized = true;
  }

  protected prepareStatement(name: string, sql: string): void {
    this.statements[name] = this.db.prepare(sql);
  }

  protected getStatement(name: string): Database.Statement {
    if (!this.statements[name]) {
      throw new Error(`Statement "${name}" not found. Ensure repository is initialized.`);
    }
    return this.statements[name];
  }

  protected executeGet<R = T>(statementName: string, ...params: unknown[]): R | undefined {
    this.ensureInitialized();
    return this.getStatement(statementName).get(...params) as R | undefined;
  }

  protected executeAll<R = T>(statementName: string, ...params: unknown[]): R[] {
    this.ensureInitialized();
    return this.getStatement(statementName).all(...params) as R[];
  }

  protected executeRun(statementName: string, ...params: unknown[]): Database.RunResult {
    this.ensureInitialized();
    return this.getStatement(statementName).run(...params);
  }
}

export interface CRUDRepository<T> {
  getAll(): T[];
  getById(id: string): T | undefined;
  create(data: Partial<T>): T;
  update(id: string, data: Partial<T>): T;
  delete(id: string): void;
}

export function createBaseCRUDHelpers<T extends { id: string }>(
  tableName: string,
  idField: string = 'id'
) {
  return {
    buildInsert(data: Partial<T>): { sql: string; values: unknown[] } {
      const fields = Object.keys(data);
      const placeholders = fields.map(() => '?').join(', ');
      const sql = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
      const values = fields.map(f => (data as Record<string, unknown>)[f]);
      return { sql, values };
    },

    buildUpdate(id: string, data: Partial<T>): { sql: string; values: unknown[] } {
      const fields = Object.keys(data).filter(k => k !== idField);
      const setClause = fields.map(f => `${f} = ?`).join(', ');
      const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${idField} = ?`;
      const values = [...fields.map(f => (data as Record<string, unknown>)[f]), id];
      return { sql, values };
    },

    buildSelectAll(): string {
      return `SELECT * FROM ${tableName}`;
    },

    buildSelectById(): string {
      return `SELECT * FROM ${tableName} WHERE ${idField} = ?`;
    },

    buildDelete(): string {
      return `DELETE FROM ${tableName} WHERE ${idField} = ?`;
    },
  };
}
