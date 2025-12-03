import { RequestHandler } from 'express';
import * as dailyInsightsService from '../services/daily-insights.service.js';
import * as repository from '../repository/daily-insights.repository.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

/**
 * GET /api/daily-insights/today
 * Bugünkü insights özeti
 */
export const getTodayInsights: RequestHandler = async (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const summary = await dailyInsightsService.getTodayInsights(schoolId);
    
    if (!summary) {
      return res.status(404).json({
        success: false,
        error: 'Bugünkü insight bulunamadı'
      });
    }
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting today insights:', error);
    res.status(500).json({
      success: false,
      error: 'Günlük insights alınamadı'
    });
  }
};

/**
 * POST /api/daily-insights/generate
 * Yeni günlük insight oluştur
 */
export const generateInsights: RequestHandler = async (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { date } = req.body || {};
    
    const insight = await dailyInsightsService.generateDailyInsight(schoolId, date || new Date().toISOString().split('T')[0]);
    
    res.json({
      success: true,
      data: insight
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      error: 'Insight oluşturulamadı'
    });
  }
};

/**
 * GET /api/daily-insights/history
 * Geçmiş insights listesi
 */
export const getInsightsHistory: RequestHandler = (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const limit = parseInt(req.query.limit as string) || 7;
    const insights = repository.getLatestDailyInsights(limit, schoolId);
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error getting insights history:', error);
    res.status(500).json({
      success: false,
      error: 'Geçmiş insights alınamadı'
    });
  }
};

/**
 * GET /api/daily-insights/student/:studentId
 * Öğrenci için günlük durum (school-scoped)
 */
export const getStudentStatus: RequestHandler = (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { studentId } = req.params;
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    
    // Verify student belongs to this school
    const student = require('../../students/repository/students.repository.js').getStudentByIdAndSchool(studentId, schoolId);
    if (!student) {
      return res.status(403).json({
        success: false,
        error: 'Bu öğrenciye erişim izniniz yok'
      });
    }
    
    const status = repository.getStudentDailyStatus(studentId, date);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Öğrenci durumu bulunamadı'
      });
    }
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting student status:', error);
    res.status(500).json({
      success: false,
      error: 'Öğrenci durumu alınamadı'
    });
  }
};

/**
 * GET /api/daily-insights/alerts
 * Proaktif uyarılar listesi (school-scoped)
 */
export const getAlerts: RequestHandler = (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    
    // Get school-scoped student IDs
    const studentsRepo = require('../../students/repository/students.repository.js');
    const schoolStudents = studentsRepo.loadStudentsBySchool(schoolId);
    const studentIds = schoolStudents.map((s: any) => s.id);
    
    const filters = {
      status: req.query.status as string,
      severity: req.query.severity as string,
      studentId: req.query.studentId as string,
      studentIds: studentIds,
      limit: parseInt(req.query.limit as string) || 50
    };
    
    const alerts = repository.getProactiveAlerts(filters);
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Uyarılar alınamadı'
    });
  }
};

/**
 * PUT /api/daily-insights/alerts/:id/status
 * Uyarı durumunu güncelle (with ownership validation)
 */
export const updateAlertStatus: RequestHandler = (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    const { status, actionTaken } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Durum gerekli'
      });
    }
    
    // Verify alert belongs to a student in this school
    const studentsRepo = require('../../students/repository/students.repository.js');
    const schoolStudents = studentsRepo.loadStudentsBySchool(schoolId);
    const studentIds = schoolStudents.map((s: any) => s.id);
    
    if (!repository.isAlertOwnedByStudents(id, studentIds)) {
      return res.status(403).json({
        success: false,
        error: 'Bu uyarıya erişim izniniz yok'
      });
    }
    
    dailyInsightsService.updateAlertStatus(id, status, actionTaken);
    
    res.json({
      success: true,
      message: 'Uyarı durumu güncellendi'
    });
  } catch (error) {
    console.error('Error updating alert status:', error);
    res.status(500).json({
      success: false,
      error: 'Uyarı durumu güncellenemedi'
    });
  }
};

/**
 * PUT /api/daily-insights/alerts/:id/assign
 * Uyarıyı atama (with ownership validation)
 */
export const assignAlert: RequestHandler = (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    const { assignedTo } = req.body;
    
    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        error: 'Atanacak kişi gerekli'
      });
    }
    
    // Verify alert belongs to a student in this school
    const studentsRepo = require('../../students/repository/students.repository.js');
    const schoolStudents = studentsRepo.loadStudentsBySchool(schoolId);
    const studentIds = schoolStudents.map((s: any) => s.id);
    
    if (!repository.isAlertOwnedByStudents(id, studentIds)) {
      return res.status(403).json({
        success: false,
        error: 'Bu uyarıya erişim izniniz yok'
      });
    }
    
    repository.assignProactiveAlert(id, assignedTo);
    
    res.json({
      success: true,
      message: 'Uyarı atandı'
    });
  } catch (error) {
    console.error('Error assigning alert:', error);
    res.status(500).json({
      success: false,
      error: 'Uyarı atanamadı'
    });
  }
};

/**
 * GET /api/daily-insights/stats
 * Günlük istatistikler (school-scoped)
 */
export const getDailyStats: RequestHandler = (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    
    // Get school-scoped student IDs
    const studentsRepo = require('../../students/repository/students.repository.js');
    const schoolStudents = studentsRepo.loadStudentsBySchool(schoolId);
    const studentIds = schoolStudents.map((s: any) => s.id);
    
    const stats = repository.getDailyInsightsStats(date, studentIds);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting daily stats:', error);
    res.status(500).json({
      success: false,
      error: 'İstatistikler alınamadı'
    });
  }
};
