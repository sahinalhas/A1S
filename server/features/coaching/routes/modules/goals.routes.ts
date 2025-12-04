import { RequestHandler } from 'express';
import * as coachingService from '../../services/coaching.service.js';
import { 
  createSuccessResponse, 
  createErrorResponse,
  ApiErrorCode 
} from '../../../../../shared/types/api-contracts.js';

export const getAcademicGoals: RequestHandler = (req, res) => {
  try {
    const goals = coachingService.getAllAcademicGoals();
    res.json(createSuccessResponse(goals));
  } catch (error) {
    console.error('Error fetching academic goals:', error);
    res.status(500).json(createErrorResponse('Akademik hedefler yüklenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const getAcademicGoalsByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const goals = coachingService.getStudentAcademicGoals(studentId);
    res.json(createSuccessResponse(goals));
  } catch (error) {
    console.error('Error fetching student academic goals:', error);
    res.status(500).json(createErrorResponse('Öğrenci akademik hedefleri yüklenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const createAcademicGoal: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createAcademicGoal(req.body);
    res.json(createSuccessResponse(result, 'Akademik hedef oluşturuldu'));
  } catch (error) {
    console.error('Error creating academic goal:', error);
    res.status(500).json(createErrorResponse('Akademik hedef kaydedilemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const updateAcademicGoal: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const result = coachingService.updateAcademicGoal(id, req.body);
    res.json(createSuccessResponse(result, 'Akademik hedef güncellendi'));
  } catch (error) {
    console.error('Error updating academic goal:', error);
    res.status(500).json(createErrorResponse('Akademik hedef güncellenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const deleteAcademicGoal: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const result = coachingService.deleteAcademicGoal(id);
    res.json(createSuccessResponse(result, 'Akademik hedef silindi'));
  } catch (error) {
    console.error('Error deleting academic goal:', error);
    res.status(500).json(createErrorResponse('Akademik hedef silinemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const getSmartGoalsByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const goals = coachingService.getStudentSmartGoals(studentId);
    res.json(createSuccessResponse(goals));
  } catch (error) {
    console.error('Error fetching smart goals:', error);
    res.status(500).json(createErrorResponse('SMART hedefler yüklenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const createSmartGoal: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createSmartGoal(req.body);
    res.json(createSuccessResponse(result, 'SMART hedef oluşturuldu'));
  } catch (error) {
    console.error('Error creating smart goal:', error);
    res.status(500).json(createErrorResponse('SMART hedef kaydedilemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const updateSmartGoal: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const result = coachingService.updateSmartGoal(id, req.body);
    res.json(createSuccessResponse(result, 'SMART hedef güncellendi'));
  } catch (error) {
    console.error('Error updating smart goal:', error);
    res.status(500).json(createErrorResponse('SMART hedef güncellenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};
