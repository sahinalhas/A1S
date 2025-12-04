import { RequestHandler } from "express";
import { randomUUID } from 'crypto';
import * as studyService from '../services/study.service.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';

export const getStudyAssignments: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    const assignments = studyService.getStudentAssignments(studentId, schoolId);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching study assignments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Çalışma ödevleri getirilirken hata oluştu';
    res.status((error instanceof Error ? error.message : String(error)).includes('Geçersiz') ? 400 : 500)
      .json({ success: false, error: errorMessage });
  }
};

export const saveStudyAssignmentHandler: RequestHandler = (req, res) => {
  try {
    const assignment = req.body;
    const generatedId = randomUUID();
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    studyService.createStudyAssignment(assignment, generatedId, schoolId);
    
    res.json({ success: true, message: 'Çalışma ödevi kaydedildi' });
  } catch (error) {
    console.error('Error saving study assignment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Çalışma ödevi kaydedilemedi';
    res.status((error instanceof Error ? error.message : String(error)).includes('Geçersiz') ? 400 : 500)
      .json({ success: false, error: errorMessage });
  }
};

export const updateStudyAssignmentHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    studyService.updateAssignment(id, status, notes, schoolId);
    res.json({ success: true, message: 'Çalışma ödevi güncellendi' });
  } catch (error) {
    console.error('Error updating study assignment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Çalışma ödevi güncellenemedi';
    res.status((error instanceof Error ? error.message : String(error)).includes('Geçersiz') ? 400 : 500)
      .json({ success: false, error: errorMessage });
  }
};

export const deleteStudyAssignmentHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    studyService.deleteAssignment(id, schoolId);
    res.json({ success: true, message: 'Çalışma ödevi silindi' });
  } catch (error) {
    console.error('Error deleting study assignment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Çalışma ödevi silinemedi';
    res.status((error instanceof Error ? error.message : String(error)).includes('Geçersiz') ? 400 : 500)
      .json({ success: false, error: errorMessage });
  }
};

export const getAllWeeklySlotsHandler: RequestHandler = (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    const slots = studyService.getAllSlotsBySchool(schoolId);
    res.json(slots);
  } catch (error) {
    console.error('Error fetching all weekly slots:', error);
    res.status(500).json({ success: false, error: 'Haftalık program getirilirken hata oluştu' });
  }
};

export const getWeeklySlots: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    const slots = studyService.getStudentSlots(studentId, schoolId);
    res.json(slots);
  } catch (error) {
    console.error('Error fetching weekly slots:', error);
    const errorMessage = error instanceof Error ? error.message : 'Haftalık program getirilirken hata oluştu';
    res.status((error instanceof Error ? error.message : String(error)).includes('Geçersiz') ? 400 : 500)
      .json({ success: false, error: errorMessage });
  }
};

export const saveWeeklySlotHandler: RequestHandler = (req, res) => {
  try {
    const data = req.body;
    const generatedId = randomUUID();
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    studyService.createWeeklySlots(data, generatedId, schoolId);
    
    res.json({ success: true, message: 'Haftalık program kaydedildi' });
  } catch (error) {
    console.error('Error saving weekly slot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Haftalık program kaydedilemedi';
    res.status((error instanceof Error ? error.message : String(error)).includes('Geçersiz') ? 400 : 500)
      .json({ success: false, error: errorMessage });
  }
};

export const updateWeeklySlotHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    studyService.updateSlot(id, body, schoolId);
    res.json({ success: true, message: 'Haftalık program güncellendi' });
  } catch (error) {
    console.error('Error updating weekly slot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Haftalık program güncellenemedi';
    res.status((error instanceof Error ? error.message : String(error)).includes('Geçersiz') ? 400 : 500)
      .json({ success: false, error: errorMessage });
  }
};

export const deleteWeeklySlotHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    studyService.deleteSlot(id, schoolId);
    res.json({ success: true, message: 'Haftalık program silindi' });
  } catch (error) {
    console.error('Error deleting weekly slot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Haftalık program silinemedi';
    res.status((error instanceof Error ? error.message : String(error)).includes('Geçersiz') ? 400 : 500)
      .json({ success: false, error: errorMessage });
  }
};

export const savePlannedTopicsHandler: RequestHandler = (req, res) => {
  try {
    const { studentId, weekStartDate } = req.params;
    const plannedTopics = req.body;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    studyService.savePlannedTopics(plannedTopics, studentId, weekStartDate, schoolId);
    res.json({ success: true, message: 'Konu bazlı plan kaydedildi' });
  } catch (error) {
    console.error('Error saving planned topics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Konu bazlı plan kaydedilemedi';
    res.status(400).json({ success: false, error: errorMessage });
  }
};

export const getPlannedTopicsHandler: RequestHandler = (req, res) => {
  try {
    const { studentId, weekStartDate } = req.params;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    const topics = studyService.getPlannedTopics(studentId, weekStartDate, schoolId);
    res.json(topics);
  } catch (error) {
    console.error('Error getting planned topics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Konu bazlı plan getirilirken hata oluştu';
    res.status(400).json({ success: false, error: errorMessage });
  }
};
