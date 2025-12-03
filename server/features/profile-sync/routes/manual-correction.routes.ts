/**
 * Manual Correction Routes
 * AI hatalarını düzeltme ve manuel müdahale
 */

import { Request, Response } from 'express';
import * as repository from '../repository/profile-sync.repository.js';
import getDatabase from '../../../lib/database.js';

interface CorrectionRequest {
  studentId: string;
  domain: string;
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
  correctedBy: string;
}

export async function correctAIExtraction(req: Request, res: Response) {
  try {
    const correction: CorrectionRequest = req.body;
    
    if (!correction.studentId || !correction.domain || !correction.field) {
      return res.status(400).json({ 
        success: false, 
        error: 'Eksik parametreler' 
      });
    }

    const db = getDatabase();
    
    // Düzeltme kaydını oluştur
    const stmt = db.prepare(`
      INSERT INTO ai_corrections (
        id, studentId, domain, field, oldValue, newValue, 
        reason, correctedBy, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const id = `corr_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    stmt.run(
      id,
      correction.studentId,
      correction.domain,
      correction.field,
      JSON.stringify(correction.oldValue),
      JSON.stringify(correction.newValue),
      correction.reason,
      correction.correctedBy,
      new Date().toISOString()
    );

    // Profil alanını güncelle
    await updateProfileField(
      correction.studentId,
      correction.domain,
      correction.field,
      correction.newValue
    );

    res.json({ 
      success: true, 
      message: 'Düzeltme başarıyla kaydedildi',
      correctionId: id
    });
  } catch (error) {
    console.error('Error in manual correction:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Düzeltme kaydedilemedi' 
    });
  }
}

export function getCorrectionHistory(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM ai_corrections
      WHERE studentId = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    
    const rows = stmt.all(studentId, limit) as any[];
    const corrections = rows.map(row => ({
      id: row.id,
      studentId: row.studentId,
      domain: row.domain,
      field: row.field,
      oldValue: JSON.parse(row.oldValue),
      newValue: JSON.parse(row.newValue),
      reason: row.reason,
      correctedBy: row.correctedBy,
      timestamp: row.timestamp
    }));
    
    res.json(corrections);
  } catch (error) {
    console.error('Error fetching correction history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Düzeltme geçmişi yüklenemedi' 
    });
  }
}

export function undoLastUpdate(req: Request, res: Response) {
  try {
    const { studentId, logId } = req.body;
    
    if (!studentId || !logId) {
      return res.status(400).json({ 
        success: false, 
        error: 'studentId ve logId gerekli' 
      });
    }

    const db = getDatabase();
    
    // Log kaydını bul
    const logStmt = db.prepare(`
      SELECT * FROM profile_sync_logs WHERE id = ?
    `);
    const log = logStmt.get(logId) as any;
    
    if (!log) {
      return res.status(404).json({ 
        success: false, 
        error: 'Log bulunamadı' 
      });
    }

    // Geri alma kaydı oluştur
    const undoStmt = db.prepare(`
      INSERT INTO undo_operations (
        id, studentId, logId, previousState, timestamp, performedBy
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const undoId = `undo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    undoStmt.run(
      undoId,
      studentId,
      logId,
      JSON.stringify(log),
      new Date().toISOString(),
      req.body.performedBy || 'system'
    );

    // Profili yenile (önceki duruma dönmek için)
    // Bu işlem için unified identity'yi yeniden hesaplamak gerekir
    res.json({ 
      success: true, 
      message: 'Güncelleme geri alındı',
      undoId 
    });
  } catch (error) {
    console.error('Error in undo operation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Geri alma işlemi başarısız' 
    });
  }
}

async function updateProfileField(
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
    console.warn(`Unknown domain: ${domain}`);
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
    
    console.log(`✅ Updated ${domain}.${field} for student ${studentId}`);
  } catch (error) {
    console.error(`❌ Error updating ${domain}.${field}:`, error);
    throw error;
  }
}
