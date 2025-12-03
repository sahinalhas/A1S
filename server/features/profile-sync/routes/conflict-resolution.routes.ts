/**
 * Conflict Resolution Routes
 * Çelişki çözümleme - Manuel karar verme
 */

import { Request, Response } from 'express';
import * as repository from '../repository/profile-sync.repository.js';
import getDatabase from '../../../lib/database.js';

interface ManualResolutionRequest {
  conflictId: string;
  selectedValue: any;
  reason: string;
  resolvedBy: string;
}

export async function resolveConflictManually(req: Request, res: Response) {
  try {
    const resolution: ManualResolutionRequest = req.body;
    
    if (!resolution.conflictId || !resolution.selectedValue) {
      return res.status(400).json({ 
        success: false, 
        error: 'conflictId ve selectedValue gerekli' 
      });
    }

    const db = getDatabase();
    
    // Çelişki kaydını güncelle
    const updateStmt = db.prepare(`
      UPDATE conflict_resolutions
      SET resolvedValue = ?, 
          resolutionMethod = 'manual',
          reasoning = ?,
          resolvedBy = ?,
          timestamp = ?
      WHERE id = ?
    `);
    
    updateStmt.run(
      JSON.stringify(resolution.selectedValue),
      resolution.reason,
      resolution.resolvedBy,
      new Date().toISOString(),
      resolution.conflictId
    );

    // Çelişkiyi getir ve profile'ı güncelle
    const conflict = repository.getConflictById(resolution.conflictId);
    
    if (conflict && conflict.domain) {
      // Seçilen değeri profile'a uygula
      await applyResolvedValue(
        conflict.studentId,
        conflict.domain,
        conflict.conflictType, // field name from conflictType
        resolution.selectedValue
      );
    }

    res.json({ 
      success: true, 
      message: 'Çelişki manuel olarak çözüldü' 
    });
  } catch (error) {
    console.error('Error resolving conflict:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Çelişki çözümlenemedi' 
    });
  }
}

export function getPendingConflicts(req: Request, res: Response) {
  try {
    const { studentId } = req.query;
    
    const db = getDatabase();
    let stmt;
    let params: unknown[];
    
    if (studentId) {
      stmt = db.prepare(`
        SELECT * FROM conflict_resolutions
        WHERE studentId = ? AND resolutionMethod = 'pending'
        ORDER BY timestamp DESC
      `);
      params = [studentId];
    } else {
      stmt = db.prepare(`
        SELECT * FROM conflict_resolutions
        WHERE resolutionMethod = 'pending'
        ORDER BY severity DESC, timestamp DESC
        LIMIT 50
      `);
      params = [];
    }
    
    const rows = stmt.all(...params) as any[];
    const conflicts = rows.map(row => ({
      id: row.id,
      studentId: row.studentId,
      conflictType: row.conflictType,
      domain: row.domain,
      oldValue: JSON.parse(row.oldValue),
      newValue: JSON.parse(row.newValue),
      severity: row.severity,
      reasoning: row.reasoning,
      timestamp: row.timestamp
    }));
    
    res.json(conflicts);
  } catch (error) {
    console.error('Error fetching pending conflicts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Bekleyen çelişkiler yüklenemedi' 
    });
  }
}

export function bulkResolveConflicts(req: Request, res: Response) {
  try {
    const { resolutions, resolvedBy } = req.body;
    
    if (!resolutions || !Array.isArray(resolutions)) {
      return res.status(400).json({ 
        success: false, 
        error: 'resolutions array gerekli' 
      });
    }

    const db = getDatabase();
    const results: Array<{ conflictId: string; success: boolean; error?: string }> = [];
    
    for (const resolution of resolutions) {
      try {
        const updateStmt = db.prepare(`
          UPDATE conflict_resolutions
          SET resolvedValue = ?, 
              resolutionMethod = 'manual_bulk',
              reasoning = ?,
              resolvedBy = ?,
              timestamp = ?
          WHERE id = ?
        `);
        
        updateStmt.run(
          JSON.stringify(resolution.selectedValue),
          resolution.reason || 'Toplu çözüm',
          resolvedBy,
          new Date().toISOString(),
          resolution.conflictId
        );
        
        results.push({ 
          conflictId: resolution.conflictId, 
          success: true 
        });
      } catch (error) {
        results.push({ 
          conflictId: resolution.conflictId, 
          success: false, 
          error: String(error) 
        });
      }
    }

    res.json({ 
      success: true, 
      message: `${results.filter(r => r.success).length} çelişki çözüldü`,
      results 
    });
  } catch (error) {
    console.error('Error in bulk conflict resolution:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Toplu çözümleme başarısız' 
    });
  }
}

async function applyResolvedValue(
  studentId: string,
  domain: string,
  field: string,
  value: any
): Promise<void> {
  const db = getDatabase();
  
  const tableMap: Record<string, string> = {
    'health': 'health_profile',
    'academic': 'academic_profile', 
    'social_emotional': 'social_emotional_profile',
    'talents_interests': 'talents_interests_profile'
  };
  
  const tableName = tableMap[domain];
  if (!tableName) {
    console.warn(`Unknown domain for conflict resolution: ${domain}`);
    return;
  }
  
  try {
    // Önce mevcut kaydı kontrol et
    const checkStmt = db.prepare(`SELECT * FROM ${tableName} WHERE studentId = ?`);
    const existing = checkStmt.get(studentId) as any;
    
    if (!existing) {
      // Eğer kayıt yoksa, önce oluştur
      const createStmt = db.prepare(`
        INSERT INTO ${tableName} (studentId, ${field}, createdAt, updatedAt)
        VALUES (?, ?, ?, ?)
      `);
      createStmt.run(
        studentId,
        typeof value === 'object' ? JSON.stringify(value) : value,
        new Date().toISOString(),
        new Date().toISOString()
      );
    } else {
      // Kayıt varsa güncelle
      const updateStmt = db.prepare(`
        UPDATE ${tableName}
        SET ${field} = ?, updatedAt = ?
        WHERE studentId = ?
      `);
      updateStmt.run(
        typeof value === 'object' ? JSON.stringify(value) : value,
        new Date().toISOString(),
        studentId
      );
    }
    
    console.log(`✅ Applied resolved value to ${domain}.${field} for student ${studentId}`);
  } catch (error) {
    console.error(`❌ Error applying resolved value to ${domain}.${field}:`, error);
    throw error;
  }
}
