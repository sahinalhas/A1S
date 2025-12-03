import { Database } from 'better-sqlite3';

export interface QueryConfig {
  tableName: string;
  columns: string[];
  whereClause?: string;
  orderBy?: string;
}

export class RepositoryHelper {
  constructor(private db: Database) {}

  prepareSelect(config: QueryConfig) {
    const { tableName, columns, whereClause, orderBy } = config;
    const columnList = columns.length > 0 ? columns.join(', ') : '*';
    
    let query = `SELECT ${columnList} FROM ${tableName}`;
    
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }
    
    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }
    
    return this.db.prepare(query);
  }

  prepareInsert(tableName: string, columns: string[]) {
    const placeholders = columns.map(() => '?').join(', ');
    const columnList = columns.join(', ');
    
    const query = `INSERT INTO ${tableName} (${columnList}) VALUES (${placeholders})`;
    return this.db.prepare(query);
  }

  prepareUpsert(tableName: string, columns: string[], conflictColumn: string = 'id') {
    const placeholders = columns.map(() => '?').join(', ');
    const columnList = columns.join(', ');
    
    const updateSet = columns
      .filter(col => col !== conflictColumn)
      .map(col => `${col} = excluded.${col}`)
      .join(', ');
    
    const query = `
      INSERT INTO ${tableName} (${columnList}) 
      VALUES (${placeholders})
      ON CONFLICT(${conflictColumn}) DO UPDATE SET ${updateSet}
    `;
    
    return this.db.prepare(query);
  }

  prepareUpdate(tableName: string, columns: string[], whereClause: string = 'id = ?') {
    const setClause = columns.map(col => `${col} = ?`).join(', ');
    const query = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
    
    return this.db.prepare(query);
  }

  prepareDelete(tableName: string, whereClause: string = 'id = ?') {
    const query = `DELETE FROM ${tableName} WHERE ${whereClause}`;
    return this.db.prepare(query);
  }

  prepareBulkInsert(tableName: string, columns: string[], rowCount: number) {
    const singleRow = `(${columns.map(() => '?').join(', ')})`;
    const allRows = Array(rowCount).fill(singleRow).join(', ');
    const columnList = columns.join(', ');
    
    const query = `INSERT INTO ${tableName} (${columnList}) VALUES ${allRows}`;
    return this.db.prepare(query);
  }

  createGenericRepository<T extends Record<string, any>>(
    tableName: string,
    columns: string[]
  ) {
    return {
      getAll: () => {
        return this.prepareSelect({
          tableName,
          columns,
          orderBy: 'created_at DESC'
        }).all() as T[];
      },

      getById: (id: string) => {
        return this.prepareSelect({
          tableName,
          columns,
          whereClause: 'id = ?'
        }).get(id) as T | undefined;
      },

      getByField: (field: string, value: any, orderBy?: string) => {
        return this.prepareSelect({
          tableName,
          columns,
          whereClause: `${field} = ?`,
          orderBy
        }).all(value) as T[];
      },

      insert: (data: T) => {
        const values = columns.map(col => data[col]);
        this.prepareInsert(tableName, columns).run(...values);
      },

      upsert: (data: T) => {
        const values = columns.map(col => data[col]);
        this.prepareUpsert(tableName, columns).run(...values);
      },

      update: (id: string, data: Partial<T>) => {
        const updateColumns = Object.keys(data).filter(key => key !== 'id');
        
        if (updateColumns.length === 0) {
          throw new Error('No fields to update');
        }
        
        const values = [...updateColumns.map(col => data[col]), id];
        this.prepareUpdate(tableName, updateColumns).run(...values);
      },

      delete: (id: string) => {
        this.prepareDelete(tableName).run(id);
      }
    };
  }
}

export function createRepositoryHelper(db: Database): RepositoryHelper {
  return new RepositoryHelper(db);
}

export interface DynamicUpdateConfig {
  tableName: string;
  id: string;
  updates: Record<string, any>;
  allowedFields: string[];
  jsonFields?: string[];
  booleanFields?: string[];
}

export function buildDynamicUpdate(db: Database, config: DynamicUpdateConfig): void {
  const { tableName, id, updates, allowedFields, jsonFields = [], booleanFields = [] } = config;
  
  const processedUpdates = { ...updates };
  
  jsonFields.forEach(field => {
    if (updates[field] !== undefined && updates[field] !== null) {
      processedUpdates[field] = JSON.stringify(updates[field]);
    }
  });
  
  booleanFields.forEach(field => {
    if (updates[field] !== undefined) {
      processedUpdates[field] = updates[field] ? 1 : 0;
    }
  });
  
  const fields = Object.keys(processedUpdates).filter(key => allowedFields.includes(key));
  
  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }
  
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => processedUpdates[field]);
  values.push(id);
  
  db.prepare(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`).run(...values);
}
