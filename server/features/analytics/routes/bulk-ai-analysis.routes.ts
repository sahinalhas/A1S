/**
 * Bulk AI Analysis Routes
 */

import { Router } from 'express';
import { aiRateLimiter } from '../../../middleware/rate-limit.middleware.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';
import { BulkAIAnalysisService } from '../services/bulk-ai-analysis.service.js';

const router = Router();
router.use(validateSchoolAccess);
const bulkAnalysisService = new BulkAIAnalysisService();

// Apply AI rate limiter to all bulk AI analysis routes (10 req/min)
router.use(aiRateLimiter);

/**
 * GET /api/bulk-analysis/classes
 * Sınıflar arası karşılaştırmalı analiz
 */
router.get('/classes', async (req, res) => {
  try {
    const analysis = await bulkAnalysisService.compareClasses();

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: unknown) {
    console.error('Class comparison error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Sınıf karşılaştırması başarısız'
    });
  }
});

/**
 * GET /api/bulk-analysis/school-wide
 * Okul geneli analiz
 */
router.get('/school-wide', async (req, res) => {
  try {
    const analysis = await bulkAnalysisService.analyzeSchoolWide();

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: unknown) {
    console.error('School-wide analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Okul geneli analiz başarısız'
    });
  }
});

/**
 * GET /api/bulk-analysis/early-warning
 * Erken uyarı sistemi raporu
 */
router.get('/early-warning', async (req, res) => {
  try {
    const report = await bulkAnalysisService.generateEarlyWarningReport();

    res.json({
      success: true,
      data: report
    });
  } catch (error: unknown) {
    console.error('Early warning report error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Erken uyarı raporu oluşturulamadı'
    });
  }
});

/**
 * GET /api/bulk-analysis/trends/:timeRange
 * Trend analizi
 */
router.get('/trends/:timeRange', async (req, res) => {
  try {
    const { timeRange } = req.params;
    
    if (!['week', 'month', 'semester'].includes(timeRange)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz zaman aralığı'
      });
    }

    const analysis = await bulkAnalysisService.analyzeTrends(
      timeRange as 'week' | 'month' | 'semester'
    );

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: unknown) {
    console.error('Trend analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Trend analizi başarısız'
    });
  }
});

export default router;
