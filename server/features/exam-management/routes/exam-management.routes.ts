import { Request, Response, NextFunction, RequestHandler } from 'express';
import * as examTypesRepo from '../repository/exam-types.repository.js';
import * as examSessionsRepo from '../repository/exam-sessions.repository.js';
import * as examResultsRepo from '../repository/exam-results.repository.js';
import * as schoolExamsRepo from '../repository/school-exams.repository.js';
import * as studentsService from '../../students/services/students.service.js';
import * as statisticsService from '../services/statistics.service.js';
import * as excelService from '../services/excel.service.js';
import * as dashboardService from '../services/dashboard-overview.service.js';
import * as comparisonService from '../services/comparison.service.js';
import * as aiAnalysisService from '../services/ai-analysis.service.js';
import * as pdfReportService from '../services/pdf-report.service.js';
import { sanitizeString } from '../../../middleware/validation.js';
import { validateSchoolAccess, type SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';
import { uploadExcelFile } from '../../../middleware/file-validation.middleware.js';

function getSchoolId(req: Request): string {
  const schoolId = (req as SchoolScopedRequest).schoolId;
  if (!schoolId) {
    throw new Error('School ID is required');
  }
  return schoolId;
}

export const getExamTypes: RequestHandler = (req, res) => {
  try {
    const types = examTypesRepo.getAllExamTypes();
    res.json({ success: true, data: types });
  } catch (error) {
    console.error('Error fetching exam types:', error);
    res.status(500).json({ success: false, error: 'Sınav türleri yüklenemedi' });
  }
};

export const getSubjectsByType: RequestHandler = (req, res) => {
  try {
    const { typeId } = req.params;
    const subjects = examTypesRepo.getSubjectsByExamType(typeId);
    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ success: false, error: 'Dersler yüklenemedi' });
  }
};

export const getAllExamSessions: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { typeId } = req.query;
    const sessions = typeId 
      ? examSessionsRepo.getExamSessionsByTypeAndSchool(typeId as string, schoolId)
      : examSessionsRepo.getExamSessionsBySchool(schoolId);
    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Error fetching exam sessions:', error);
    res.status(500).json({ success: false, error: 'Deneme sınavları yüklenemedi' });
  }
};

export const getExamSessionById: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { id } = req.params;
    const session = examSessionsRepo.getExamSessionByIdAndSchool(id, schoolId);
    
    if (!session) {
      return res.status(404).json({ success: false, error: 'Deneme sınavı bulunamadı' });
    }
    
    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Error fetching exam session:', error);
    res.status(500).json({ success: false, error: 'Deneme sınavı yüklenemedi' });
  }
};

export const createExamSession: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const input = req.body;
    
    if (!input.exam_type_id || !input.name || !input.exam_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Sınav türü, deneme adı ve tarihi zorunludur' 
      });
    }
    
    const session = examSessionsRepo.createExamSessionForSchool(input, schoolId);
    res.json({ success: true, data: session, message: 'Deneme sınavı oluşturuldu' });
  } catch (error) {
    console.error('Error creating exam session:', error);
    res.status(500).json({ success: false, error: 'Deneme sınavı oluşturulamadı' });
  }
};

export const updateExamSession: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { id } = req.params;
    const input = req.body;
    
    const session = examSessionsRepo.updateExamSessionForSchool(id, input, schoolId);
    res.json({ success: true, data: session, message: 'Deneme sınavı güncellendi' });
  } catch (error: unknown) {
    console.error('Error updating exam session:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('not found') || errorMessage.includes('does not belong')) {
      return res.status(404).json({ success: false, error: 'Deneme sınavı bulunamadı veya bu okula ait değil' });
    }
    res.status(500).json({ success: false, error: 'Deneme sınavı güncellenemedi' });
  }
};

export const deleteExamSession: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { id } = req.params;
    const deleted = examSessionsRepo.deleteExamSessionBySchool(id, schoolId);
    
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Deneme sınavı bulunamadı veya bu okula ait değil' });
    }
    
    res.json({ success: true, message: 'Deneme sınavı silindi' });
  } catch (error) {
    console.error('Error deleting exam session:', error);
    res.status(500).json({ success: false, error: 'Deneme sınavı silinemedi' });
  }
};

export const getResultsBySession: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { sessionId } = req.params;
    
    const session = examSessionsRepo.getExamSessionByIdAndSchool(sessionId, schoolId);
    if (!session) {
      return res.status(403).json({ success: false, error: 'Bu oturum seçili okula ait değil' });
    }
    
    const results = examResultsRepo.getExamResultsBySessionAndSchool(sessionId, schoolId);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching results by session:', error);
    res.status(500).json({ success: false, error: 'Sınav sonuçları yüklenemedi' });
  }
};

export const getResultsByStudent: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { studentId } = req.params;
    const results = examResultsRepo.getExamResultsByStudentAndSchool(studentId, schoolId);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching results by student:', error);
    res.status(500).json({ success: false, error: 'Öğrenci sınav sonuçları yüklenemedi' });
  }
};

export const getResultsBySessionAndStudent: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { sessionId, studentId } = req.params;
    
    const session = examSessionsRepo.getExamSessionByIdAndSchool(sessionId, schoolId);
    if (!session) {
      return res.status(403).json({ success: false, error: 'Bu oturum seçili okula ait değil' });
    }
    
    const student = studentsService.getStudentByIdAndSchool(studentId, schoolId);
    if (!student) {
      return res.status(403).json({ success: false, error: 'Bu öğrenci seçili okula ait değil' });
    }
    
    const results = examResultsRepo.getExamResultsBySessionAndStudent(sessionId, studentId);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching results by session and student:', error);
    res.status(500).json({ success: false, error: 'Öğrenci sınav sonuçları yüklenemedi' });
  }
};

export const createExamResult: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const input = req.body;
    
    if (!input.session_id || !input.student_id || !input.subject_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Deneme, öğrenci ve ders bilgisi zorunludur' 
      });
    }
    
    const session = examSessionsRepo.getExamSessionByIdAndSchool(input.session_id, schoolId);
    if (!session) {
      return res.status(403).json({ success: false, error: 'Bu oturum seçili okula ait değil' });
    }
    
    const student = studentsService.getStudentByIdAndSchool(input.student_id, schoolId);
    if (!student) {
      return res.status(403).json({ success: false, error: 'Bu öğrenci seçili okula ait değil' });
    }
    
    const result = examResultsRepo.createExamResult(input);
    res.json({ success: true, data: result, message: 'Sonuç kaydedildi' });
  } catch (error: unknown) {
    console.error('Error creating exam result:', error);
    if (error instanceof Error ? error.message : String(error).includes('already exists')) {
      return res.status(409).json({ success: false, error: 'Bu sonuç zaten mevcut' });
    }
    res.status(500).json({ success: false, error: 'Sonuç kaydedilemedi' });
  }
};

export const upsertExamResult: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const input = req.body;
    
    if (!input.session_id || !input.student_id || !input.subject_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Deneme, öğrenci ve ders bilgisi zorunludur' 
      });
    }
    
    const session = examSessionsRepo.getExamSessionByIdAndSchool(input.session_id, schoolId);
    if (!session) {
      return res.status(403).json({ success: false, error: 'Bu oturum seçili okula ait değil' });
    }
    
    const student = studentsService.getStudentByIdAndSchool(input.student_id, schoolId);
    if (!student) {
      return res.status(403).json({ success: false, error: 'Bu öğrenci seçili okula ait değil' });
    }
    
    const result = examResultsRepo.upsertExamResult(input);
    res.json({ success: true, data: result, message: 'Sonuç kaydedildi' });
  } catch (error) {
    console.error('Error upserting exam result:', error);
    res.status(500).json({ success: false, error: 'Sonuç kaydedilemedi' });
  }
};

export const batchUpsertResults: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { results } = req.body;
    
    if (!Array.isArray(results)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Sonuçlar array olmalıdır' 
      });
    }
    
    const sessionIds = [...new Set(results.map(r => r.session_id))];
    for (const sessionId of sessionIds) {
      const session = examSessionsRepo.getExamSessionByIdAndSchool(sessionId, schoolId);
      if (!session) {
        return res.status(403).json({ 
          success: false, 
          error: `Oturum ${sessionId} seçili okula ait değil` 
        });
      }
    }
    
    const studentIds = [...new Set(results.map(r => r.student_id))];
    for (const studentId of studentIds) {
      const student = studentsService.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        return res.status(403).json({ 
          success: false, 
          error: `Öğrenci ${studentId} seçili okula ait değil` 
        });
      }
    }
    
    const savedResults = examResultsRepo.batchUpsertExamResults(results);
    res.json({ 
      success: true, 
      data: savedResults, 
      message: `${savedResults.length} sonuç kaydedildi` 
    });
  } catch (error) {
    console.error('Error batch upserting results:', error);
    res.status(500).json({ success: false, error: 'Sonuçlar kaydedilemedi' });
  }
};

export const updateExamResult: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { id } = req.params;
    const input = req.body;
    
    const existingResult = examResultsRepo.getExamResultById(id);
    if (existingResult) {
      const session = examSessionsRepo.getExamSessionByIdAndSchool(existingResult.session_id, schoolId);
      if (!session) {
        return res.status(403).json({ success: false, error: 'Bu sonuç seçili okula ait değil' });
      }
    }
    
    const result = examResultsRepo.updateExamResult(id, input);
    res.json({ success: true, data: result, message: 'Sonuç güncellendi' });
  } catch (error: unknown) {
    console.error('Error updating exam result:', error);
    if (error instanceof Error ? error.message : String(error).includes('not found')) {
      return res.status(404).json({ success: false, error: 'Sonuç bulunamadı' });
    }
    res.status(500).json({ success: false, error: 'Sonuç güncellenemedi' });
  }
};

export const deleteExamResult: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { id } = req.params;
    examResultsRepo.deleteExamResult(id, schoolId);
    res.json({ success: true, message: 'Sonuç silindi' });
  } catch (error) {
    console.error('Error deleting exam result:', error);
    res.status(500).json({ success: false, error: 'Sonuç silinemedi' });
  }
};

export const getSessionStatistics: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { sessionId } = req.params;
    
    const session = examSessionsRepo.getExamSessionByIdAndSchool(sessionId, schoolId);
    if (!session) {
      return res.status(403).json({ success: false, error: 'Bu oturum seçili okula ait değil' });
    }
    
    const stats = statisticsService.calculateExamSessionStatistics(sessionId);
    
    if (!stats) {
      return res.status(404).json({ success: false, error: 'İstatistik hesaplanamadı' });
    }
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error calculating session statistics:', error);
    res.status(500).json({ success: false, error: 'İstatistik hesaplanamadı' });
  }
};

export const getStudentStatistics: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const { examTypeId } = req.query;
    
    const stats = statisticsService.calculateStudentExamStatistics(
      studentId, 
      examTypeId as string | undefined
    );
    
    if (!stats) {
      return res.status(404).json({ success: false, error: 'İstatistik hesaplanamadı' });
    }
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error calculating student statistics:', error);
    res.status(500).json({ success: false, error: 'İstatistik hesaplanamadı' });
  }
};

export const downloadExcelTemplate: RequestHandler = (req, res) => {
  try {
    const { examTypeId } = req.params;
    const includeStudents = req.query.includeStudents === 'true';
    const schoolId = req.headers['x-school-id'] as string;
    
    const buffer = excelService.generateExcelTemplate({
      exam_type_id: examTypeId,
      include_student_info: includeStudents,
      schoolId: schoolId
    });
    
    const examType = examTypesRepo.getExamTypeById(examTypeId);
    const filename = `${examType?.name || 'Sinav'}_Sablonu.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error generating Excel template:', error);
    res.status(500).json({ success: false, error: 'Excel şablonu oluşturulamadı' });
  }
};

export const importExcelResults = [
  ...uploadExcelFile,
  (async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      const schoolId = req.headers['x-school-id'] as string;
      
      if (!sessionId) {
        return res.status(400).json({ success: false, error: 'Deneme sınavı ID gerekli' });
      }
      
      if (!schoolId) {
        return res.status(400).json({ success: false, error: 'Okul seçimi gerekli' });
      }
      
      // File validation is already done by uploadExcelFile middleware
      const file = req.file;
      if (!file || !file.buffer) {
        return res.status(400).json({ success: false, error: 'Excel dosyası yüklenmedi' });
      }
      
      const result = await excelService.importExcelResults(sessionId, file.buffer, schoolId);
      
      res.json({ 
        success: result.success, 
        data: result,
        message: result.success 
          ? `${result.imported_count} sonuç başarıyla yüklendi` 
          : 'Excel dosyası işlenirken hata oluştu'
      });
    } catch (error) {
      console.error('Error importing Excel results:', error);
      res.status(500).json({ success: false, error: 'Excel dosyası işlenemedi' });
    }
  }) as RequestHandler
];

export const exportExcelResults: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { sessionId } = req.params;
    
    const session = examSessionsRepo.getExamSessionByIdAndSchool(sessionId, schoolId);
    if (!session) {
      return res.status(403).json({ success: false, error: 'Bu oturum seçili okula ait değil' });
    }
    
    const buffer = excelService.exportExamResultsToExcel(sessionId);
    const filename = `${session?.name || 'Sinav'}_Sonuclari.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting Excel results:', error);
    res.status(500).json({ success: false, error: 'Excel raporu oluşturulamadı' });
  }
};

export const getSchoolExamsByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const results = schoolExamsRepo.getSchoolExamResultsByStudent(studentId);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching school exam results:', error);
    res.status(500).json({ success: false, error: 'Okul sınav sonuçları yüklenemedi' });
  }
};

export const createSchoolExam: RequestHandler = (req, res) => {
  try {
    const input = req.body;
    
    if (!input.student_id || !input.subject_name || !input.exam_type || !input.exam_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Öğrenci, ders, sınav türü ve tarih zorunludur' 
      });
    }
    
    const result = schoolExamsRepo.createSchoolExamResult(input);
    res.json({ success: true, data: result, message: 'Okul sınav sonucu kaydedildi' });
  } catch (error) {
    console.error('Error creating school exam result:', error);
    res.status(500).json({ success: false, error: 'Okul sınav sonucu kaydedilemedi' });
  }
};

export const updateSchoolExam: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const input = req.body;
    
    const result = schoolExamsRepo.updateSchoolExamResult(id, input);
    res.json({ success: true, data: result, message: 'Okul sınav sonucu güncellendi' });
  } catch (error: unknown) {
    console.error('Error updating school exam result:', error);
    if (error instanceof Error ? error.message : String(error).includes('not found')) {
      return res.status(404).json({ success: false, error: 'Sonuç bulunamadı' });
    }
    res.status(500).json({ success: false, error: 'Okul sınav sonucu güncellenemedi' });
  }
};

export const deleteSchoolExam: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    schoolExamsRepo.deleteSchoolExamResult(id);
    res.json({ success: true, message: 'Okul sınav sonucu silindi' });
  } catch (error) {
    console.error('Error deleting school exam result:', error);
    res.status(500).json({ success: false, error: 'Okul sınav sonucu silinemedi' });
  }
};

export const getDashboardOverview: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const overview = dashboardService.getDashboardOverviewBySchool(schoolId);
    res.json({ success: true, data: overview });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ success: false, error: 'Dashboard verileri yüklenemedi' });
  }
};

export const getSessionComparison: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { sessionIds, comparisonType } = req.body;
    
    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length < 2) {
      return res.status(400).json({ 
        success: false, 
        error: 'En az 2 deneme seçilmelidir' 
      });
    }
    
    for (const sessionId of sessionIds) {
      const session = examSessionsRepo.getExamSessionByIdAndSchool(sessionId, schoolId);
      if (!session) {
        return res.status(403).json({ 
          success: false, 
          error: `Oturum ${sessionId} seçili okula ait değil` 
        });
      }
    }
    
    const comparison = comparisonService.compareExamSessions(
      sessionIds, 
      comparisonType as 'overall' | 'subject' | 'student'
    );
    
    if (!comparison) {
      return res.status(404).json({ success: false, error: 'Karşılaştırma yapılamadı' });
    }
    
    res.json({ success: true, data: comparison });
  } catch (error) {
    console.error('Error comparing sessions:', error);
    res.status(500).json({ success: false, error: 'Karşılaştırma yapılamadı' });
  }
};

export const getTrendAnalysis: RequestHandler = (req, res) => {
  try {
    const { examTypeId } = req.params;
    const { period } = req.query;
    
    const trend = comparisonService.getTrendAnalysis(
      examTypeId,
      (period as 'last_6' | 'last_12' | 'all') || 'last_6'
    );
    
    if (!trend) {
      return res.status(404).json({ success: false, error: 'Trend analizi yapılamadı' });
    }
    
    res.json({ success: true, data: trend });
  } catch (error) {
    console.error('Error analyzing trend:', error);
    res.status(500).json({ success: false, error: 'Trend analizi yapılamadı' });
  }
};

export const getStudentRiskAnalysis: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    
    const analysis = aiAnalysisService.analyzeStudentRisk(studentId);
    
    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Risk analizi yapılamadı' });
    }
    
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error analyzing student risk:', error);
    res.status(500).json({ success: false, error: 'Risk analizi yapılamadı' });
  }
};

export const getWeakSubjects: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    
    const analysis = aiAnalysisService.identifyWeakSubjects(studentId);
    
    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Zayıf konu analizi yapılamadı' });
    }
    
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error identifying weak subjects:', error);
    res.status(500).json({ success: false, error: 'Zayıf konu analizi yapılamadı' });
  }
};

export const getSessionRecommendations: RequestHandler = (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const analysis = aiAnalysisService.generateSessionRecommendations(sessionId);
    
    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Öneri oluşturulamadı' });
    }
    
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ success: false, error: 'Öneri oluşturulamadı' });
  }
};

export const generateSessionReportData: RequestHandler = (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const reportData = pdfReportService.generateSessionReport(sessionId);
    
    if (!reportData) {
      return res.status(404).json({ success: false, error: 'Rapor oluşturulamadı' });
    }
    
    res.json({ success: true, data: reportData });
  } catch (error) {
    console.error('Error generating session report:', error);
    res.status(500).json({ success: false, error: 'Rapor oluşturulamadı' });
  }
};

export const generateStudentReportData: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const { examTypeId } = req.query;
    
    const reportData = pdfReportService.generateStudentReport(studentId, examTypeId as string | undefined);
    
    if (!reportData) {
      return res.status(404).json({ success: false, error: 'Rapor oluşturulamadı' });
    }
    
    res.json({ success: true, data: reportData });
  } catch (error) {
    console.error('Error generating student report:', error);
    res.status(500).json({ success: false, error: 'Rapor oluşturulamadı' });
  }
};

// ============================================================================
// Advanced Features Endpoints
// ============================================================================

import * as goalsRepo from '../repository/goals.repository.js';
import * as alertsRepo from '../repository/alerts.repository.js';
import * as benchmarkRepo from '../repository/benchmarks.repository.js';
import * as dashboardMetrics from '../services/dashboard-metrics.service.js';
import * as questionAnalysis from '../services/question-analysis.service.js';
import * as heatmapService from '../services/heatmap.service.js';
import * as benchmarkService from '../services/benchmark.service.js';
import * as timeAnalysisService from '../services/time-analysis.service.js';
import * as predictionService from '../services/prediction.service.js';

// Dashboard Metrics
export const getDashboardMetrics: RequestHandler = (req, res) => {
  try {
    const metrics = dashboardMetrics.getRealTimeDashboardMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ success: false, error: 'Dashboard metrikleri yüklenemedi' });
  }
};

// Student Goals
export const getStudentGoals: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const goals = goalsRepo.getGoalsByStudent(studentId);
    res.json({ success: true, data: goals });
  } catch (error) {
    console.error('Error fetching student goals:', error);
    res.status(500).json({ success: false, error: 'Hedefler yüklenemedi' });
  }
};

export const createStudentGoal: RequestHandler = (req, res) => {
  try {
    const input = req.body;
    
    if (!input.student_id || !input.exam_type_id || !input.target_net) {
      return res.status(400).json({ 
        success: false, 
        error: 'Öğrenci, sınav türü ve hedef net zorunludur' 
      });
    }
    
    const goal = goalsRepo.createGoal(input);
    res.json({ success: true, data: goal, message: 'Hedef oluşturuldu' });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ success: false, error: 'Hedef oluşturulamadı' });
  }
};

export const updateGoalProgress: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { currentNet, status } = req.body;
    
    const success = goalsRepo.updateGoalProgress(id, currentNet, status);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Hedef bulunamadı' });
    }
    
    res.json({ success: true, message: 'Hedef güncellendi' });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ success: false, error: 'Hedef güncellenemedi' });
  }
};

export const deleteGoal: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const success = goalsRepo.deleteGoal(id);
    
    if (!success) {
      return res.status(404).json({ success: false, error: 'Hedef bulunamadı' });
    }
    
    res.json({ success: true, message: 'Hedef silindi' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ success: false, error: 'Hedef silinemedi' });
  }
};

// Question Analysis
export const analyzeSessionQuestions: RequestHandler = (req, res) => {
  try {
    const { sessionId } = req.params;
    const analysis = questionAnalysis.analyzeQuestions(sessionId);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error analyzing questions:', error);
    res.status(500).json({ success: false, error: 'Soru analizi yapılamadı' });
  }
};

export const getQuestionAnalysis: RequestHandler = (req, res) => {
  try {
    const { sessionId } = req.params;
    const analysis = questionAnalysis.getQuestionAnalysis(sessionId);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error fetching question analysis:', error);
    res.status(500).json({ success: false, error: 'Soru analizi yüklenemedi' });
  }
};

// Heatmap
export const getHeatmapData: RequestHandler = (req, res) => {
  try {
    const { studentId, examTypeId } = req.params;
    const heatmap = heatmapService.getHeatmapData(studentId, examTypeId);
    res.json({ success: true, data: heatmap });
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    res.status(500).json({ success: false, error: 'Isı haritası yüklenemedi' });
  }
};

export const calculateHeatmap: RequestHandler = (req, res) => {
  try {
    const { studentId, examTypeId } = req.params;
    const heatmap = heatmapService.calculateHeatmap(studentId, examTypeId);
    res.json({ success: true, data: heatmap, message: 'Isı haritası hesaplandı' });
  } catch (error) {
    console.error('Error calculating heatmap:', error);
    res.status(500).json({ success: false, error: 'Isı haritası hesaplanamadı' });
  }
};

// Benchmarks
export const calculateSessionBenchmarks: RequestHandler = (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = benchmarkService.calculateBenchmarks(sessionId);
    res.json({ success: true, data: result, message: 'Benchmark hesaplandı' });
  } catch (error) {
    console.error('Error calculating benchmarks:', error);
    res.status(500).json({ success: false, error: 'Benchmark hesaplanamadı' });
  }
};

export const getBenchmarkComparison: RequestHandler = (req, res) => {
  try {
    const { sessionId, studentId } = req.params;
    const comparison = benchmarkService.getBenchmarkComparison(sessionId, studentId);
    
    if (!comparison) {
      return res.status(404).json({ success: false, error: 'Benchmark bulunamadı' });
    }
    
    res.json({ success: true, data: comparison });
  } catch (error) {
    console.error('Error fetching benchmark:', error);
    res.status(500).json({ success: false, error: 'Benchmark yüklenemedi' });
  }
};

export const getStudentBenchmarks: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const benchmarks = benchmarkRepo.getBenchmarksByStudent(studentId);
    res.json({ success: true, data: benchmarks });
  } catch (error) {
    console.error('Error fetching benchmarks:', error);
    res.status(500).json({ success: false, error: 'Benchmark\'lar yüklenemedi' });
  }
};

// Time Analysis
export const getTimeAnalysis: RequestHandler = (req, res) => {
  try {
    const { studentId, examTypeId } = req.params;
    const analysis = timeAnalysisService.calculateTimeAnalysis(studentId, examTypeId);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error calculating time analysis:', error);
    res.status(500).json({ success: false, error: 'Zaman analizi yapılamadı' });
  }
};

// Predictions
export const getPredictiveAnalysis: RequestHandler = (req, res) => {
  try {
    const { studentId, examTypeId } = req.params;
    const prediction = predictionService.predictPerformance(studentId, examTypeId);
    res.json({ success: true, data: prediction });
  } catch (error) {
    console.error('Error generating prediction:', error);
    res.status(500).json({ success: false, error: 'Tahmin oluşturulamadı' });
  }
};

// Alerts
export const getStudentAlerts: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const alerts = alertsRepo.getAlertsByStudent(studentId);
    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, error: 'Uyarılar yüklenemedi' });
  }
};

export const getAllUnreadAlerts: RequestHandler = (req, res) => {
  try {
    const alerts = alertsRepo.getUnreadAlerts();
    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Error fetching unread alerts:', error);
    res.status(500).json({ success: false, error: 'Okunmamış uyarılar yüklenemedi' });
  }
};

export const markAlertRead: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const success = alertsRepo.markAlertAsRead(id);
    
    if (!success) {
      return res.status(404).json({ success: false, error: 'Uyarı bulunamadı' });
    }
    
    res.json({ success: true, message: 'Uyarı okundu olarak işaretlendi' });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(500).json({ success: false, error: 'Uyarı güncellenemedi' });
  }
};

// PDF Reports
export const generateDetailedPDFReport: RequestHandler = async (req, res) => {
  try {
    const { studentId, examTypeId } = req.params;
    
    const report = pdfReportService.generateStudentDetailedReport(studentId, examTypeId);
    const pdfBuffer = await pdfReportService.generatePDF(report);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rapor-${studentId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({ success: false, error: 'PDF rapor oluşturulamadı' });
  }
};

export const getDetailedReportData: RequestHandler = (req, res) => {
  try {
    const { studentId, examTypeId } = req.params;
    
    const report = pdfReportService.generateStudentDetailedReport(studentId, examTypeId);
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error generating detailed report:', error);
    res.status(500).json({ success: false, error: 'Detaylı rapor oluşturulamadı' });
  }
};
