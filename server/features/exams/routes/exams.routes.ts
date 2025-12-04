import { RequestHandler } from 'express';
import * as examsService from '../services/exams.service.js';
import { autoSyncHooks } from '../../profile-sync/services/auto-sync-hooks.service.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';

export const getExamResultsByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    const results = examsService.getStudentExamResults(studentId, schoolId);
    res.json(results);
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({ success: false, error: 'Sınav sonuçları yüklenemedi' });
  }
};

export const getExamResultsByType: RequestHandler = (req, res) => {
  try {
    const { studentId, examType } = req.params;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    const results = examsService.getStudentExamResultsByType(studentId, examType, schoolId);
    res.json(results);
  } catch (error) {
    console.error('Error fetching exam results by type:', error);
    res.status(500).json({ success: false, error: 'Sınav sonuçları yüklenemedi' });
  }
};

export const getLatestExamResult: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const { examType } = req.query;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    const result = examsService.getStudentLatestExamResult(studentId, schoolId, examType as string | undefined);
    res.json(result);
  } catch (error) {
    console.error('Error fetching latest exam result:', error);
    res.status(500).json({ success: false, error: 'En son sınav sonucu yüklenemedi' });
  }
};

export const getExamProgressAnalysis: RequestHandler = (req, res) => {
  try {
    const { studentId, examType } = req.params;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    const results = examsService.getStudentExamProgress(studentId, examType, schoolId);
    res.json(results);
  } catch (error) {
    console.error('Error fetching exam progress analysis:', error);
    res.status(500).json({ success: false, error: 'Sınav gelişim analizi yüklenemedi' });
  }
};

export const createExamResult: RequestHandler = (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    const result = examsService.createExamResult(req.body, schoolId);
    
    if (result.success && req.body.studentId) {
      autoSyncHooks.onExamResultAdded({
        id: result.id,
        studentId: req.body.studentId,
        examName: req.body.examName,
        score: req.body.totalScore,
        subject: req.body.examType,
        date: req.body.examDate,
        ...req.body
      }).catch(error => {
        console.error('Profile sync failed after exam result:', error);
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error creating exam result:', error);
    res.status(500).json({ success: false, error: 'Sınav sonucu kaydedilemedi' });
  }
};

export const updateExamResult: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    const result = examsService.updateExamResult(id, req.body, schoolId);
    res.json(result);
  } catch (error) {
    console.error('Error updating exam result:', error);
    res.status(500).json({ success: false, error: 'Sınav sonucu güncellenemedi' });
  }
};

export const deleteExamResult: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    const result = examsService.deleteExamResult(id, schoolId);
    res.json(result);
  } catch (error) {
    console.error('Error deleting exam result:', error);
    res.status(500).json({ success: false, error: 'Sınav sonucu silinemedi' });
  }
};
