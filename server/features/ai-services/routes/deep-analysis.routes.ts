/**
 * Deep Analysis Routes - Consolidated AI Analysis
 * Tüm AI analiz endpoint'lerini birleştiren tek modül
 * 
 * Consolidation: advanced-ai-analysis + deep-analysis = unified deep-analysis
 */

import { Router, RequestHandler } from 'express';
import * as deepAnalysisService from '../services/deep-analysis.service.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';

// Import advanced AI services
import PsychologicalDepthAnalysisService from '../../../services/psychological-depth-analysis.service.js';
import PredictiveRiskTimelineService from '../../../services/predictive-risk-timeline.service.js';
import HourlyActionPlannerService from '../../../services/hourly-action-planner.service.js';
import StudentTimelineAnalyzerService from '../../../services/student-timeline-analyzer.service.js';
import ComparativeMultiStudentAnalysisService from '../../../services/comparative-multi-student-analysis.service.js';
import { ProgressiveAnalysisService } from '../../../services/progressive-analysis.service.js';
import type { StreamChunk } from '../../../../shared/types/progressive-loading.types.js';

// Service instances (singleton pattern for efficiency)
const psychologicalService = new PsychologicalDepthAnalysisService();
const predictiveService = new PredictiveRiskTimelineService();
const actionPlannerService = new HourlyActionPlannerService();
const timelineService = new StudentTimelineAnalyzerService();
const comparativeService = new ComparativeMultiStudentAnalysisService();
const progressiveService = new ProgressiveAnalysisService();

// Connection tracking for streaming (DoS prevention)
const activeConnections = new Map<string, number>();
const MAX_CONCURRENT_STREAMS = 3;

// =================== DEEP ANALYSIS ENDPOINTS ===================

/**
 * POST /api/deep-analysis/:studentId
 * Öğrenci için derin analiz raporu oluştur
 */
export const generateAnalysis: RequestHandler = async (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { studentId } = req.params;
    
    const report = await deepAnalysisService.generateDeepAnalysis(studentId, schoolId);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error: unknown) {
    console.error('Error generating deep analysis:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Derin analiz oluşturulamadı'
    });
  }
};

/**
 * POST /api/deep-analysis/batch
 * Toplu öğrenci analizi
 */
export const generateBatchAnalysis: RequestHandler = async (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { studentIds } = req.body;
    
    if (!Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        error: 'studentIds dizisi gerekli'
      });
    }
    
    const result = await deepAnalysisService.generateBatchAnalysis(studentIds, schoolId);
    
    res.json({
      success: true,
      data: {
        totalStudents: studentIds.length,
        completed: result.reports.length,
        failed: result.errors.length,
        reports: result.reports,
        errors: result.errors
      }
    });
  } catch (error: unknown) {
    console.error('Error in batch analysis:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Toplu analiz başarısız'
    });
  }
};

// =================== PSYCHOLOGICAL ANALYSIS ===================

/**
 * POST /api/deep-analysis/psychological/:studentId
 * Psikolojik derinlik analizi
 */
export const generatePsychologicalAnalysis: RequestHandler = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const analysis = await psychologicalService.generatePsychologicalAnalysis(studentId);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error: unknown) {
    console.error('Psychological analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Psikolojik analiz oluşturulamadı'
    });
  }
};

// =================== PREDICTIVE TIMELINE ===================

/**
 * POST /api/deep-analysis/predictive-timeline/:studentId
 * Öngörücü risk zaman çizelgesi
 */
export const generatePredictiveTimeline: RequestHandler = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const timeline = await predictiveService.generatePredictiveTimeline(studentId);
    
    res.json({
      success: true,
      data: timeline
    });
  } catch (error: unknown) {
    console.error('Predictive timeline error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Öngörücü zaman çizelgesi oluşturulamadı'
    });
  }
};

// =================== DAILY ACTION PLAN ===================

/**
 * POST /api/deep-analysis/daily-action-plan
 * Günlük eylem planı oluştur
 */
export const generateDailyActionPlan: RequestHandler = async (req, res) => {
  try {
    const { date, counselorName, forceRegenerate } = req.body;
    
    const plan = await actionPlannerService.generateDailyPlan(
      date || new Date().toISOString().split('T')[0],
      counselorName,
      forceRegenerate || false
    );
    
    res.json({
      success: true,
      data: plan
    });
  } catch (error: unknown) {
    console.error('Daily action plan error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Günlük eylem planı oluşturulamadı'
    });
  }
};

/**
 * GET /api/deep-analysis/action-plan/today
 * Bugünkü eylem planını getir (cached)
 */
export const getTodayActionPlan: RequestHandler = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const plan = await actionPlannerService.generateDailyPlan(today, undefined, false);
    
    res.json({
      success: true,
      data: plan,
      cached: true
    });
  } catch (error: unknown) {
    console.error('Today action plan error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Günlük plan oluşturulamadı'
    });
  }
};

// =================== STUDENT TIMELINE ===================

/**
 * POST /api/deep-analysis/student-timeline/:studentId
 * Öğrenci zaman çizelgesi analizi
 */
export const generateStudentTimeline: RequestHandler = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.body;
    
    const timeline = await timelineService.generateStudentTimeline(studentId, startDate, endDate);
    
    res.json({
      success: true,
      data: timeline
    });
  } catch (error: unknown) {
    console.error('Student timeline error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Öğrenci zaman çizelgesi oluşturulamadı'
    });
  }
};

// =================== COMPARATIVE ANALYSIS ===================

/**
 * POST /api/deep-analysis/comparative-class/:classId
 * Sınıf karşılaştırmalı analizi
 */
export const generateClassComparison: RequestHandler = async (req, res) => {
  try {
    const { classId } = req.params;
    
    const analysis = await comparativeService.analyzeClass(classId);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error: unknown) {
    console.error('Class comparison error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Sınıf analizi oluşturulamadı'
    });
  }
};

/**
 * POST /api/deep-analysis/comparative-students
 * Çoklu öğrenci karşılaştırmalı analizi
 */
export const generateMultiStudentComparison: RequestHandler = async (req, res) => {
  try {
    const { studentIds } = req.body;
    
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'studentIds dizisi gerekli'
      });
    }
    
    const analysis = await comparativeService.analyzeMultipleStudents(studentIds);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error: unknown) {
    console.error('Multi-student comparison error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Çoklu öğrenci analizi oluşturulamadı'
    });
  }
};

// =================== COMPREHENSIVE ANALYSIS ===================

/**
 * POST /api/deep-analysis/comprehensive/:studentId
 * Kapsamlı analiz (tüm analizleri birlikte)
 */
export const generateComprehensiveAnalysis: RequestHandler = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [psychological, predictive, timeline] = await Promise.all([
      psychologicalService.generatePsychologicalAnalysis(studentId),
      predictiveService.generatePredictiveTimeline(studentId),
      timelineService.generateStudentTimeline(studentId)
    ]);
    
    res.json({
      success: true,
      data: {
        psychological,
        predictive,
        timeline,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error: unknown) {
    console.error('Comprehensive analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Kapsamlı analiz oluşturulamadı'
    });
  }
};

// =================== STREAMING ENDPOINTS ===================

/**
 * GET /api/deep-analysis/stream/:studentId
 * Progressive data loading endpoint (SSE)
 */
export const streamStudentAnalysis: RequestHandler = async (req, res) => {
  const { studentId } = req.params;
  const includeAI = req.query.includeAI === 'true';
  const userId = ((req as any)?.session?.userId) || req.ip || 'anonymous';

  try {
    // Connection limit kontrolü (DoS koruması)
    const currentConnections = activeConnections.get(userId) || 0;
    if (currentConnections >= MAX_CONCURRENT_STREAMS) {
      return res.status(429).json({
        error: 'Çok fazla eşzamanlı bağlantı. Lütfen mevcut stream\'lerin tamamlanmasını bekleyin.',
      });
    }

    activeConnections.set(userId, currentConnections + 1);

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const cleanup = () => {
      const current = activeConnections.get(userId) || 0;
      if (current > 0) {
        activeConnections.set(userId, current - 1);
      }
      if (current <= 1) {
        activeConnections.delete(userId);
      }
    };

    req.on('close', cleanup);
    res.on('finish', cleanup);

    const sendChunk = (chunk: StreamChunk) => {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    };

    // 1. BASIC INFO
    try {
      const basicInfo = await progressiveService.getBasicInfo(studentId);
      sendChunk(progressiveService.createChunk('basic', basicInfo, 16));
    } catch (error) {
      console.error('Basic info error:', error);
      sendChunk({ type: 'error', data: { message: 'Temel bilgiler alınamadı' }, timestamp: new Date().toISOString() });
    }

    // 2. ACADEMIC SUMMARY
    try {
      const academicSummary = await progressiveService.getAcademicSummary(studentId);
      sendChunk(progressiveService.createChunk('academic', academicSummary, 33));
    } catch (error) {
      console.error('Academic summary error:', error);
      sendChunk({ type: 'error', data: { message: 'Akademik özet alınamadı' }, timestamp: new Date().toISOString() });
    }

    // 3. BEHAVIOR SUMMARY
    try {
      const behaviorSummary = await progressiveService.getBehaviorSummary(studentId);
      sendChunk(progressiveService.createChunk('behavior', behaviorSummary, 50));
    } catch (error) {
      console.error('Behavior summary error:', error);
      sendChunk({ type: 'error', data: { message: 'Davranış özeti alınamadı' }, timestamp: new Date().toISOString() });
    }

    // AI ANALİZLERİ (opsiyonel)
    if (includeAI) {
      try {
        const psychological = await psychologicalService.generatePsychologicalAnalysis(studentId);
        sendChunk(progressiveService.createChunk('psychological', psychological, 70));
      } catch (error) {
        console.error('Psychological analysis error:', error);
      }

      try {
        const predictive = await predictiveService.generatePredictiveTimeline(studentId);
        sendChunk(progressiveService.createChunk('predictive', predictive, 85));
      } catch (error) {
        console.error('Predictive timeline error:', error);
      }

      try {
        const timeline = await timelineService.generateStudentTimeline(studentId, undefined, undefined);
        sendChunk(progressiveService.createChunk('timeline', timeline, 95));
      } catch (error) {
        console.error('Timeline analysis error:', error);
      }
    }

    // COMPLETE SIGNAL
    sendChunk({ type: 'complete', data: { completed: true }, timestamp: new Date().toISOString(), progress: 100 });
    res.end();

  } catch (error) {
    console.error('Stream analysis error:', error);
    const currentConnections = activeConnections.get(userId) || 0;
    if (currentConnections > 0) {
      activeConnections.set(userId, currentConnections - 1);
    }
    res.write(`data: ${JSON.stringify({ type: 'error', data: { message: error instanceof Error ? error.message : 'Bilinmeyen hata' }, timestamp: new Date().toISOString() })}\n\n`);
    res.end();
  }
};

/**
 * GET /api/deep-analysis/stream/comprehensive/:studentId
 * Kapsamlı analiz için streaming endpoint
 */
export const streamComprehensiveAnalysis: RequestHandler = async (req, res, next) => {
  req.query.includeAI = 'true';
  return streamStudentAnalysis(req, res, next);
};
