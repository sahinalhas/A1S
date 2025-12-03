/**
 * Unified Profile Routes
 * Birleşik Profil API Rotaları
 * 
 * Tüm öğrenci profil verilerini tek bir endpoint'ten sunar
 */

import { Request, Response } from 'express';
import UnifiedScoringEngine from '../../../services/unified-scoring-engine.service.js';
import AutoProfileInitializer from '../../../services/auto-profile-initializer.service.js';
import ProfileQualityValidator from '../../../services/profile-quality-validator.service.js';
import getDatabase from '../../../lib/database.js';
import { logger } from '../../../utils/logger.js';
import type { Student } from '../../../../shared/types/student.types.js';

const scoringEngine = new UnifiedScoringEngine();
const profileInitializer = new AutoProfileInitializer();
const qualityValidator = new ProfileQualityValidator();

/**
 * GET /api/students/:id/unified-profile
 * Öğrencinin tüm profil verilerini tek seferde getirir
 */
export async function getUnifiedProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const db = getDatabase();
    
    // Öğrenci temel bilgileri
    const studentStmt = db.prepare('SELECT * FROM students WHERE id = ?');
    const student = studentStmt.get(id) as Student | undefined;
    
    if (!student) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }
    
    // Profil tamlık kontrolü
    const completeness = await scoringEngine.calculateProfileCompleteness(id);
    
    // Skorları hesapla veya veritabanından al
    let scores = await scoringEngine.getSavedAggregateScores(id);
    
    if (!scores) {
      scores = await scoringEngine.calculateUnifiedScores(id);
      await scoringEngine.saveAggregateScores(id, scores);
    }
    
    // Profil kalitesi raporu
    const { StandardizedProfileRepository } = await import('../../standardized-profile/repository/standardized-profile.repository.js');
    const profileRepo = new StandardizedProfileRepository(db);
    
    const academic = profileRepo.getAcademicProfile(id);
    const socialEmotional = profileRepo.getSocialEmotionalProfile(id);
    const talentsInterests = profileRepo.getTalentsInterestsProfile(id);
    const health = profileRepo.getStandardizedHealthProfile(id);
    const motivation = profileRepo.getMotivationProfile(id);
    const riskProtective = profileRepo.getRiskProtectiveProfile(id);
    
    const qualityReport = qualityValidator.generateStudentQualityReport(
      student,
      academic,
      socialEmotional,
      talentsInterests,
      health,
      motivation,
      riskProtective
    );
    
    // Birleşik yanıt
    res.json({
      student,
      completeness,
      scores,
      qualityReport,
      profiles: {
        academic,
        socialEmotional,
        talentsInterests,
        health,
        motivation,
        riskProtective
      }
    });
  } catch (error) {
    logger.error('Unified profile error', 'UnifiedProfileRoutes', error);
    res.status(500).json({ error: 'Profil verileri alınırken hata oluştu' });
  }
}

/**
 * POST /api/students/:id/initialize-profiles
 * Eksik profilleri otomatik oluşturur
 */
export async function initializeProfiles(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { assessedBy = 'SYSTEM' } = req.body;
    
    const db = getDatabase();
    const studentStmt = db.prepare('SELECT * FROM students WHERE id = ?');
    const student = studentStmt.get(id);
    
    if (!student) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }
    
    // Eksik profilleri oluştur
    await profileInitializer.initializeMissingProfiles(id, assessedBy);
    
    // Güncellenmiş durum
    const profilesExist = await profileInitializer.checkProfilesExist(id);
    
    res.json({
      message: 'Profiller başarıyla oluşturuldu',
      profilesExist
    });
  } catch (error) {
    logger.error('Profile initialization error', 'UnifiedProfileRoutes', error);
    res.status(500).json({ error: 'Profiller oluşturulurken hata oluştu' });
  }
}

/**
 * POST /api/students/:id/recalculate-scores
 * Skorları yeniden hesaplar
 */
export async function recalculateScores(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const scores = await scoringEngine.calculateUnifiedScores(id);
    await scoringEngine.saveAggregateScores(id, scores);
    
    res.json({
      message: 'Skorlar başarıyla yeniden hesaplandı',
      scores
    });
  } catch (error) {
    logger.error('Score recalculation error', 'UnifiedProfileRoutes', error);
    res.status(500).json({ error: 'Skorlar hesaplanırken hata oluştu' });
  }
}

/**
 * GET /api/students/:id/quality-report
 * Veri kalitesi raporu
 */
export async function getQualityReport(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const db = getDatabase();
    const studentStmt = db.prepare('SELECT * FROM students WHERE id = ?');
    const student = studentStmt.get(id);
    
    if (!student) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }
    
    const { StandardizedProfileRepository } = await import('../../standardized-profile/repository/standardized-profile.repository.js');
    const profileRepo = new StandardizedProfileRepository(db);
    
    const academic = profileRepo.getAcademicProfile(id);
    const socialEmotional = profileRepo.getSocialEmotionalProfile(id);
    const talentsInterests = profileRepo.getTalentsInterestsProfile(id);
    const health = profileRepo.getStandardizedHealthProfile(id);
    const motivation = profileRepo.getMotivationProfile(id);
    const riskProtective = profileRepo.getRiskProtectiveProfile(id);
    
    const qualityReport = qualityValidator.generateStudentQualityReport(
      student,
      academic,
      socialEmotional,
      talentsInterests,
      health,
      motivation,
      riskProtective
    );
    
    res.json(qualityReport);
  } catch (error) {
    logger.error('Quality report error', 'UnifiedProfileRoutes', error);
    res.status(500).json({ error: 'Kalite raporu oluşturulurken hata oluştu' });
  }
}
