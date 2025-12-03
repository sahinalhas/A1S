/**
 * Database Backup Service
 * Veritabanı Yedekleme Servisi
 */

import fs from 'fs/promises';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip, createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import getDatabase from '../../../lib/database';
import { logger } from '../../../utils/logger.js';

export interface BackupMetadata {
  id: string;
  filename: string;
  createdAt: string;
  createdBy: string;
  size: number;
  type: 'manual' | 'automatic';
  compressed: boolean;
  tables: string[];
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface BackupOptions {
  compress?: boolean;
  tables?: string[];
  includeSchema?: boolean;
  anonymize?: boolean;
}

export class BackupService {
  private backupDir = path.join(process.cwd(), 'backups');
  private maxBackups = 30;
  
  constructor() {
    // Backup directory artık otomatik oluşturulmuyor
  }
  
  private async ensureBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create backup directory', 'BackupService', error);
      throw error;
    }
  }
  
  async createBackup(
    createdBy: string,
    type: 'manual' | 'automatic' = 'manual',
    options: BackupOptions = {}
  ): Promise<BackupMetadata> {
    const {
      compress = true,
      tables = [],
      includeSchema = true,
      anonymize = false
    } = options;
    
    // Yedekleme yapılacağı zaman dizini oluştur
    await this.ensureBackupDirectory();
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5).replace(':', '-');
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const filename = `yedek_${dateStr}_${timeStr}.sql${compress ? '.gz' : ''}`;
    const filepath = path.join(this.backupDir, filename);
    
    const metadata: BackupMetadata = {
      id: backupId,
      filename,
      createdAt: new Date().toISOString(),
      createdBy,
      size: 0,
      type,
      compressed: compress,
      tables: tables.length > 0 ? tables : await this.getAllTables(),
      status: 'pending',
    };
    
    try {
      await this.saveBackupMetadata(metadata);
      
      const sqlDump = await this.generateSQLDump(metadata.tables, includeSchema, anonymize);
      
      if (compress) {
        await this.compressAndSave(sqlDump, filepath);
      } else {
        await fs.writeFile(filepath, sqlDump, 'utf-8');
      }
      
      const stats = await fs.stat(filepath);
      metadata.size = stats.size;
      metadata.status = 'completed';
      
      await this.updateBackupMetadata(metadata);
      await this.cleanupOldBackups();
      
      return metadata;
    } catch (error) {
      metadata.status = 'failed';
      metadata.error = error instanceof Error ? error.message : String(error);
      await this.updateBackupMetadata(metadata);
      throw error;
    }
  }
  
  async restoreBackup(backupId: string): Promise<void> {
    const metadata = await this.getBackupMetadata(backupId);
    
    if (!metadata) {
      throw new Error('Backup not found');
    }
    
    const filepath = path.join(this.backupDir, metadata.filename);
    
    let sqlContent: string;
    
    if (metadata.compressed) {
      sqlContent = await this.decompressFile(filepath);
    } else {
      sqlContent = await fs.readFile(filepath, 'utf-8');
    }
    
    await this.executeSQLDump(sqlContent);
  }
  
  async listBackups(): Promise<BackupMetadata[]> {
    await this.ensureBackupDirectory();
    
    const metadataFiles = await fs.readdir(this.backupDir);
    const metadataList: BackupMetadata[] = [];
    
    for (const file of metadataFiles) {
      if (file.endsWith('.meta.json')) {
        const content = await fs.readFile(path.join(this.backupDir, file), 'utf-8');
        metadataList.push(JSON.parse(content));
      }
    }
    
    return metadataList.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async deleteBackup(backupId: string): Promise<void> {
    const metadata = await this.getBackupMetadata(backupId);
    
    if (!metadata) {
      throw new Error('Backup not found');
    }
    
    const filepath = path.join(this.backupDir, metadata.filename);
    const metaPath = path.join(this.backupDir, `${backupId}.meta.json`);
    
    await Promise.all([
      fs.unlink(filepath).catch((err) => {
        logger.warn(`Failed to delete backup file: ${filepath}`, 'BackupService', err);
      }),
      fs.unlink(metaPath).catch((err) => {
        logger.warn(`Failed to delete metadata file: ${metaPath}`, 'BackupService', err);
      })
    ]);
  }
  
  async downloadBackup(backupId: string): Promise<{ data: Buffer; filename: string; size: number; compressed: boolean }> {
    const metadata = await this.getBackupMetadata(backupId);
    
    if (!metadata) {
      throw new Error('Backup not found');
    }
    
    if (metadata.status !== 'completed') {
      throw new Error('Backup is not completed yet');
    }
    
    const filepath = path.join(this.backupDir, metadata.filename);
    const data = await fs.readFile(filepath);
    
    return {
      data,
      filename: metadata.filename,
      size: metadata.size,
      compressed: metadata.compressed,
    };
  }
  
  async scheduleAutomaticBackup(userId: string): Promise<void> {
    await this.createBackup(userId, 'automatic', { compress: true });
  }
  
  async uploadAndRestoreBackup(file: Buffer, filename: string, compressed: boolean): Promise<void> {
    const Database = (await import('better-sqlite3')).default;
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const tempFilePath = path.join(tempDir, `upload_${Date.now()}_${filename}`);
    const tempDbPath = path.join(tempDir, `temp_validate_${Date.now()}.db`);
    
    try {
      await fs.writeFile(tempFilePath, file);
      
      let sqlContent: string;
      
      if (compressed) {
        sqlContent = await this.decompressFile(tempFilePath);
      } else {
        sqlContent = await fs.readFile(tempFilePath, 'utf-8');
      }
      
      logger.info('Validating and loading SQL into disposable database...', 'BackupService');
      
      const validatedTables = await this.validateAndTestSQLInDisposableDB(sqlContent, tempDbPath, Database);
      
      logger.info('SQL validation successful, migrating data to production database...', 'BackupService');
      
      await this.migrateFromTempDB(tempDbPath, validatedTables);
      
      logger.info('Data migration completed successfully', 'BackupService');
    } finally {
      const cleanupFiles = [tempFilePath, tempDbPath, `${tempDbPath}-shm`, `${tempDbPath}-wal`];
      for (const file of cleanupFiles) {
        await fs.unlink(file).catch((err) => {
          logger.debug(`Cleanup: could not delete ${file}`, 'BackupService', err);
        });
      }
    }
  }
  
  private async validateAndTestSQLInDisposableDB(
    sqlContent: string, 
    tempDbPath: string,
    Database: any
  ): Promise<string[]> {
    if (!sqlContent || sqlContent.trim().length === 0) {
      throw new Error('SQL dosyası boş veya geçersiz');
    }
    
    const basicChecks = [
      /DROP\s+DATABASE/i,
      /ATTACH\s+DATABASE/i,
      /DETACH\s+DATABASE/i,
      /PRAGMA\s+load_extension/i,
      /PRAGMA\s+writable_schema/i,
    ];
    
    for (const pattern of basicChecks) {
      if (pattern.test(sqlContent)) {
        logger.error(`Dangerous SQL command detected: ${pattern.source}`, 'BackupService');
        throw new Error(`SQL dosyası tehlikeli komutlar içeriyor: ${pattern.source}`);
      }
    }
    
    let tempDb: any = null;
    
    try {
      tempDb = new Database(tempDbPath);
      tempDb.exec('PRAGMA journal_mode=DELETE;');
      tempDb.exec('PRAGMA foreign_keys=OFF;');
      
      tempDb.exec(sqlContent);
      
      const tables = tempDb.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).all() as { name: string }[];
      
      if (tables.length === 0) {
        throw new Error('SQL dosyası hiçbir tablo oluşturmadı - geçersiz yedek dosyası');
      }
      
      logger.info(`Disposable DB validation successful: ${tables.length} tables created`, 'BackupService');
      
      tempDb.close();
      tempDb = null;
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return tables.map(t => t.name);
    } catch (error) {
      if (tempDb) {
        try {
          tempDb.close();
        } catch (closeError) {
          logger.error('Error closing temp database', 'BackupService', closeError);
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`SQL validation failed in disposable database: ${errorMessage}`, 'BackupService');
      throw new Error(`SQL dosyası geçersiz: ${errorMessage}`);
    }
  }
  
  private validateAndQuoteIdentifier(identifier: string): string {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
      throw new Error(`Geçersiz tablo adı: ${identifier}. Sadece harf, rakam ve alt çizgi kullanılabilir.`);
    }
    
    return `"${identifier.replace(/"/g, '""')}"`;
  }
  
  private validateSchemaSQL(schemaSQL: string, expectedTableName: string): void {
    const normalized = schemaSQL.trim().toUpperCase();
    
    if (!normalized.startsWith('CREATE TABLE')) {
      throw new Error(`Geçersiz şema SQL: CREATE TABLE ile başlamalı (tablo: ${expectedTableName})`);
    }
    
    // ON DELETE CASCADE, ON UPDATE CASCADE gibi meşru kullanımları hariç tut
    const schemaWithoutConstraints = schemaSQL.replace(/ON\s+(DELETE|UPDATE)\s+(CASCADE|SET\s+NULL|SET\s+DEFAULT|RESTRICT|NO\s+ACTION)/gi, '');
    
    const dangerousKeywords = [
      'DROP', 'DELETE', 'ATTACH', 'DETACH', 'PRAGMA', 'VACUUM', 'REINDEX'
    ];
    
    for (const keyword of dangerousKeywords) {
      const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
      if (pattern.test(schemaWithoutConstraints)) {
        throw new Error(`Şema SQL tehlikeli komut içeriyor: ${keyword} (tablo: ${expectedTableName})`);
      }
    }
    
    if (schemaSQL.split(';').filter(s => s.trim()).length > 1) {
      throw new Error(`Şema SQL birden fazla statement içeriyor (tablo: ${expectedTableName})`);
    }
  }
  
  private validateIndexSQL(indexSQL: string, indexName: string): void {
    const normalized = indexSQL.trim().toUpperCase();
    
    if (!normalized.startsWith('CREATE INDEX') && !normalized.startsWith('CREATE UNIQUE INDEX')) {
      throw new Error(`Geçersiz index SQL: CREATE INDEX ile başlamalı (index: ${indexName})`);
    }
    
    const dangerousKeywords = [
      'DROP', 'DELETE', 'UPDATE', 'ALTER', 'TRUNCATE',
      'ATTACH', 'DETACH', 'PRAGMA', 'VACUUM', 'REINDEX'
    ];
    
    for (const keyword of dangerousKeywords) {
      const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
      if (pattern.test(indexSQL)) {
        throw new Error(`Index SQL tehlikeli komut içeriyor: ${keyword} (index: ${indexName})`);
      }
    }
  }
  
  private validateTriggerSQL(triggerSQL: string, triggerName: string): void {
    const normalized = triggerSQL.trim().toUpperCase();
    
    if (!normalized.startsWith('CREATE TRIGGER')) {
      throw new Error(`Geçersiz trigger SQL: CREATE TRIGGER ile başlamalı (trigger: ${triggerName})`);
    }
    
    const dangerousKeywords = [
      'DROP', 'ATTACH', 'DETACH', 'PRAGMA', 'VACUUM', 'REINDEX'
    ];
    
    for (const keyword of dangerousKeywords) {
      const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
      if (pattern.test(triggerSQL)) {
        throw new Error(`Trigger SQL tehlikeli komut içeriyor: ${keyword} (trigger: ${triggerName})`);
      }
    }
  }
  
  private async migrateFromTempDB(tempDbPath: string, tables: string[]): Promise<void> {
    const db = getDatabase();
    
    try {
      db.exec('PRAGMA foreign_keys=OFF');
      
      db.exec(`ATTACH DATABASE '${tempDbPath.replace(/'/g, "''")}' AS temp_backup`);
      
      db.exec('BEGIN TRANSACTION');
      
      for (const table of tables) {
        const safeTableName = this.validateAndQuoteIdentifier(table);
        
        console.log(`Migrating table: ${table}`);
        
        db.exec(`DROP TABLE IF EXISTS ${safeTableName}`);
        
        const schema = db.prepare(`
          SELECT sql FROM temp_backup.sqlite_master 
          WHERE type='table' AND name=?
        `).get(table) as { sql: string } | undefined;
        
        if (!schema || !schema.sql) {
          throw new Error(`Tablo şeması bulunamadı: ${table}`);
        }
        
        this.validateSchemaSQL(schema.sql, table);
        
        db.exec(schema.sql);
        
        const rowCount = db.prepare(`SELECT COUNT(*) as count FROM temp_backup.${safeTableName}`).get() as { count: number };
        
        if (rowCount.count > 0) {
          db.exec(`INSERT INTO main.${safeTableName} SELECT * FROM temp_backup.${safeTableName}`);
        }
        
        console.log(`✅ Table ${table} migrated: ${rowCount.count} rows`);
      }
      
      const indexes = db.prepare(`
        SELECT name, sql FROM temp_backup.sqlite_master 
        WHERE type='index' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%'
      `).all() as { name: string; sql: string }[];
      
      for (const index of indexes) {
        try {
          this.validateIndexSQL(index.sql, index.name);
          db.exec(index.sql);
          console.log(`✅ Index migrated: ${index.name}`);
        } catch (error) {
          console.warn(`⚠️ Index migration skipped: ${index.name}`, error);
        }
      }
      
      const triggers = db.prepare(`
        SELECT name, sql FROM temp_backup.sqlite_master 
        WHERE type='trigger' AND sql IS NOT NULL
      `).all() as { name: string; sql: string }[];
      
      for (const trigger of triggers) {
        try {
          this.validateTriggerSQL(trigger.sql, trigger.name);
          db.exec(trigger.sql);
          console.log(`✅ Trigger migrated: ${trigger.name}`);
        } catch (error) {
          console.warn(`⚠️ Trigger migration skipped: ${trigger.name}`, error);
        }
      }
      
      db.exec('COMMIT');
      db.exec('PRAGMA foreign_keys=ON');
      
      db.exec(`DETACH DATABASE temp_backup`);
      
      console.log('✅ Migration completed successfully, foreign keys re-enabled');
    } catch (error) {
      try {
        db.exec('ROLLBACK');
      } catch (rollbackError) {
      }
      
      try {
        db.exec(`DETACH DATABASE temp_backup`);
      } catch (detachError) {
      }
      
      try {
        db.exec('PRAGMA foreign_keys=ON');
      } catch (pragmaError) {
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Migration failed: ${errorMessage}`);
      throw new Error(`Veri aktarımı başarısız: ${errorMessage}`);
    }
  }
  
  private async getAllTables(): Promise<string[]> {
    const db = getDatabase();
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all() as { name: string }[];
    
    return tables.map(t => t.name);
  }
  
  private getTableDependencies(db: any, table: string): string[] {
    try {
      const quotedTable = `"${table.replace(/"/g, '""')}"`;
      const foreignKeys = db.prepare(`PRAGMA foreign_key_list(${quotedTable})`).all() as Array<{ table: string }>;
      return foreignKeys.map(fk => fk.table);
    } catch (error) {
      console.warn(`Failed to get dependencies for table ${table}:`, error);
      return [];
    }
  }
  
  private topologicalSortTables(db: any, tables: string[]): string[] {
    const tableSet = new Set(tables);
    const dependencies = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();
    
    for (const table of tables) {
      const deps = this.getTableDependencies(db, table).filter(dep => tableSet.has(dep));
      dependencies.set(table, new Set(deps));
      inDegree.set(table, 0);
    }
    
    for (const table of tables) {
      for (const dep of dependencies.get(table) || []) {
        inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
      }
    }
    
    const queue: string[] = [];
    for (const table of tables) {
      if (inDegree.get(table) === 0) {
        queue.push(table);
      }
    }
    
    const sorted: string[] = [];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      sorted.push(current);
      
      for (const [table, deps] of dependencies.entries()) {
        if (deps.has(current)) {
          deps.delete(current);
          inDegree.set(table, (inDegree.get(table) || 0) - 1);
          if (inDegree.get(table) === 0) {
            queue.push(table);
          }
        }
      }
    }
    
    if (sorted.length !== tables.length) {
      console.warn('Topological sort incomplete (possible cycle), using original order');
      return tables;
    }
    
    return sorted.reverse();
  }
  
  private async generateSQLDump(
    tables: string[], 
    includeSchema: boolean, 
    anonymize: boolean
  ): Promise<string> {
    const db = getDatabase();
    
    const sortedTables = this.topologicalSortTables(db, tables);
    
    let dump = `-- Rehber360 Database Backup\n`;
    dump += `-- Created at: ${new Date().toISOString()}\n`;
    dump += `-- Tables: ${sortedTables.join(', ')}\n\n`;
    dump += `PRAGMA foreign_keys=OFF;\n\n`;
    
    for (const table of sortedTables) {
      const quotedTable = `"${table.replace(/"/g, '""')}"`;
      
      if (includeSchema) {
        const schema = db.prepare(`
          SELECT sql FROM sqlite_master WHERE type='table' AND name=?
        `).get(table) as { sql: string } | undefined;
        
        if (schema) {
          dump += `${schema.sql};\n\n`;
        }
      }
      
      const rows = db.prepare(`SELECT * FROM ${quotedTable}`).all();
      
      if (rows.length > 0) {
        const columns = Object.keys(rows[0] as Record<string, unknown>);
        const quotedColumns = columns.map(c => `"${c.replace(/"/g, '""')}"`);
        
        for (const row of rows) {
          const values = columns.map(col => {
            let value = (row as any)[col];
            
            if (anonymize && this.isSensitiveField(col)) {
              value = this.anonymizeValue(col, value);
            }
            
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            return value;
          });
          
          dump += `INSERT INTO ${quotedTable} (${quotedColumns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        
        dump += '\n';
      }
    }
    
    return dump;
  }
  
  private async executeSQLDump(sqlContent: string): Promise<void> {
    const db = getDatabase();
    
    db.exec(sqlContent);
  }
  
  private async compressAndSave(content: string, filepath: string): Promise<void> {
    const tempFile = `${filepath}.temp`;
    await fs.writeFile(tempFile, content, 'utf-8');
    
    const gzip = createGzip();
    const source = createReadStream(tempFile);
    const destination = createWriteStream(filepath);
    
    await pipeline(source, gzip, destination);
    await fs.unlink(tempFile);
  }
  
  private async decompressFile(filepath: string): Promise<string> {
    const gunzip = createGunzip();
    const source = createReadStream(filepath);
    
    const chunks: Buffer[] = [];
    
    return new Promise((resolve, reject) => {
      source
        .pipe(gunzip)
        .on('data', chunk => chunks.push(chunk))
        .on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
        .on('error', reject);
    });
  }
  
  private async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    const metaPath = path.join(this.backupDir, `${metadata.id}.meta.json`);
    await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');
  }
  
  private async updateBackupMetadata(metadata: BackupMetadata): Promise<void> {
    await this.saveBackupMetadata(metadata);
  }
  
  private async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    try {
      const metaPath = path.join(this.backupDir, `${backupId}.meta.json`);
      const content = await fs.readFile(metaPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  
  private async cleanupOldBackups(): Promise<void> {
    const backups = await this.listBackups();
    
    if (backups.length > this.maxBackups) {
      const toDelete = backups.slice(this.maxBackups);
      
      for (const backup of toDelete) {
        await this.deleteBackup(backup.id);
      }
    }
  }
  
  private isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = [
      'email', 'phone', 'tc_no', 'password', 'address',
      'parent_phone', 'emergency_contact'
    ];
    return sensitiveFields.some(f => fieldName.toLowerCase().includes(f));
  }
  
  private anonymizeValue(fieldName: string, value: any): string {
    if (value === null || value === undefined) return value;
    
    const str = String(value);
    
    if (fieldName.includes('email')) {
      return 'anonymized@example.com';
    }
    if (fieldName.includes('phone')) {
      return '05XXXXXXXXX';
    }
    if (fieldName.includes('tc_no')) {
      return 'XXXXXXXXXXXX';
    }
    if (fieldName.includes('address')) {
      return 'Gizli Adres';
    }
    
    return str.substring(0, 2) + 'X'.repeat(Math.max(0, str.length - 2));
  }
}

export const backupService = new BackupService();
