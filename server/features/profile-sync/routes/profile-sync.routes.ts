/**
 * Profile Sync Routes
 * Canlı profil senkronizasyon API endpoints
 */

import { Request, Response } from 'express';
import * as repository from '../repository/profile-sync.repository.js';
import { ProfileAggregationService } from '../services/profile-aggregation.service.js';
import type { ProfileUpdateRequest } from '../types/profile-sync.types.js';

const aggregationService = new ProfileAggregationService();

// ==================== UNIFIED IDENTITY ====================

export function getStudentIdentity(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    
    const identity = repository.getUnifiedIdentity(studentId);
    
    if (!identity) {
      // Return a default identity instead of 404 error
      const defaultIdentity = {
        studentId,
        lastUpdated: new Date().toISOString(),
        summary: 'Öğrenci profili henüz oluşturulmadı',
        keyCharacteristics: [],
        currentState: 'Veri bekleniyor',
        academicScore: 0,
        socialEmotionalScore: 0,
        behavioralScore: 0,
        motivationScore: 0,
        riskLevel: 0,
        strengths: [],
        challenges: [],
        recentChanges: [],
        personalityProfile: '',
        learningStyle: '',
        interventionPriority: 'low' as const,
        recommendedActions: []
      };
      return res.json(defaultIdentity);
    }
    
    res.json(identity);
  } catch (error) {
    console.error('Error fetching student identity:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Öğrenci kimliği yüklenemedi' 
    });
  }
}

export function getAllIdentities(req: Request, res: Response) {
  try {
    const identities = repository.getAllUnifiedIdentities();
    res.json(identities);
  } catch (error) {
    console.error('Error fetching all identities:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Kimlikler yüklenemedi' 
    });
  }
}

export function refreshStudentIdentity(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    
    // Async olarak yenile ama hemen yanıt dön
    aggregationService.refreshUnifiedIdentity(studentId)
      .then(identity => {
        console.log(`✅ Identity refreshed for student ${studentId}`);
      })
      .catch(error => {
        console.error(`❌ Failed to refresh identity for ${studentId}:`, error);
      });
    
    res.json({ 
      success: true, 
      message: 'Kimlik yenileme başlatıldı' 
    });
  } catch (error) {
    console.error('Error triggering identity refresh:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Kimlik yenilenemedi' 
    });
  }
}

// ==================== PROFILE UPDATES ====================

export function processProfileUpdate(req: Request, res: Response) {
  try {
    const request: ProfileUpdateRequest = req.body;
    
    if (!request.studentId || !request.source || !request.rawData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Eksik parametreler: studentId, source ve rawData gerekli' 
      });
    }
    
    // Async olarak işle
    aggregationService.processDataUpdate(request)
      .then(result => {
        console.log(`✅ Profile updated:`, result.message);
      })
      .catch(error => {
        console.error(`❌ Profile update failed:`, error);
      });
    
    res.json({ 
      success: true, 
      message: 'Profil güncelleme başlatıldı' 
    });
  } catch (error) {
    console.error('Error processing profile update:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Profil güncellenemedi' 
    });
  }
}

// ==================== SYNC LOGS ====================

export function getStudentSyncLogs(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const logs = repository.getSyncLogsByStudent(studentId, limit);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching sync logs:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Senkronizasyon logları yüklenemedi' 
    });
  }
}

export function getSyncLogsBySource(req: Request, res: Response) {
  try {
    const { source } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const logs = repository.getSyncLogsBySource(source, limit);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching sync logs by source:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Kaynak logları yüklenemedi' 
    });
  }
}

// ==================== CONFLICTS ====================

export function getStudentConflicts(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    
    const conflicts = repository.getConflictsByStudent(studentId);
    res.json(conflicts);
  } catch (error) {
    console.error('Error fetching conflicts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Çelişkiler yüklenemedi' 
    });
  }
}

export function getHighSeverityConflicts(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const conflicts = repository.getHighSeverityConflicts(limit);
    res.json(conflicts);
  } catch (error) {
    console.error('Error fetching high severity conflicts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Yüksek öncelikli çelişkiler yüklenemedi' 
    });
  }
}

// ==================== STATISTICS ====================

export function getSyncStatistics(req: Request, res: Response) {
  try {
    const { studentId } = req.query;
    
    const stats = repository.getSyncStatistics(studentId as string | undefined);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching sync statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'İstatistikler yüklenemedi' 
    });
  }
}
