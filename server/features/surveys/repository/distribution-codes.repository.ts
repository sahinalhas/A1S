import getDatabase from '../../../lib/database.js';
import { v4 as uuidv4 } from 'uuid';
import type BetterSqlite3 from 'better-sqlite3';

interface PreparedStatements {
  insertCode: BetterSqlite3.Statement;
  getCodeByCode: BetterSqlite3.Statement;
  getCodesByDistribution: BetterSqlite3.Statement;
  markCodeAsUsed: BetterSqlite3.Statement;
  deleteCodesByDistribution: BetterSqlite3.Statement;
}

let statements: PreparedStatements | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    insertCode: db.prepare(`
      INSERT INTO survey_distribution_codes (id, distributionId, studentId, code, qrCode, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `),
    getCodeByCode: db.prepare(`
      SELECT id, distributionId, studentId, code, qrCode, isUsed, usedAt, created_at, updated_at
      FROM survey_distribution_codes WHERE code = ?
    `),
    getCodesByDistribution: db.prepare(`
      SELECT id, distributionId, studentId, code, qrCode, isUsed, usedAt, created_at, updated_at
      FROM survey_distribution_codes WHERE distributionId = ?
    `),
    markCodeAsUsed: db.prepare(`
      UPDATE survey_distribution_codes SET isUsed = 1, usedAt = datetime('now'), updated_at = datetime('now')
      WHERE code = ?
    `),
    deleteCodesByDistribution: db.prepare(`
      DELETE FROM survey_distribution_codes WHERE distributionId = ?
    `),
  };
  
  isInitialized = true;
}

export interface DistributionCode {
  id: string;
  distributionId: string;
  studentId?: string;
  code: string;
  qrCode?: string;
  isUsed: boolean;
  usedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function createDistributionCode(
  distributionId: string,
  studentId?: string,
  qrCode?: string
): DistributionCode {
  try {
    ensureInitialized();
    const id = uuidv4();
    const code = generateCode();
    
    statements!.insertCode.run(id, distributionId, studentId || null, code, qrCode || null);
    
    return {
      id,
      distributionId,
      studentId,
      code,
      qrCode,
      isUsed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating distribution code:', error);
    throw error;
  }
}

export function getCodeByCode(code: string): DistributionCode | null {
  try {
    ensureInitialized();
    const result = statements!.getCodeByCode.get(code) as any;
    
    if (!result) return null;
    
    return {
      ...result,
      isUsed: Boolean(result.isUsed),
    };
  } catch (error) {
    console.error('Error getting code:', error);
    return null;
  }
}

export function getCodesByDistribution(distributionId: string): DistributionCode[] {
  try {
    ensureInitialized();
    const results = statements!.getCodesByDistribution.all(distributionId) as any[];
    
    return results.map(r => ({
      ...r,
      isUsed: Boolean(r.isUsed),
    }));
  } catch (error) {
    console.error('Error getting codes by distribution:', error);
    return [];
  }
}

export function markCodeAsUsed(code: string): void {
  try {
    ensureInitialized();
    statements!.markCodeAsUsed.run(code);
  } catch (error) {
    console.error('Error marking code as used:', error);
    throw error;
  }
}

export function deleteCodesByDistribution(distributionId: string): void {
  try {
    ensureInitialized();
    statements!.deleteCodesByDistribution.run(distributionId);
  } catch (error) {
    console.error('Error deleting codes:', error);
    throw error;
  }
}
