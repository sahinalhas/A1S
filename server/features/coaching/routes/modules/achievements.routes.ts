import { RequestHandler } from 'express';
import * as coachingService from '../../services/coaching.service.js';
import { 
  createSuccessResponse, 
  createErrorResponse,
  ApiErrorCode 
} from '../../../../../shared/types/api-contracts.js';

export const getCoachingRecommendationsByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const recs = coachingService.getStudentCoachingRecommendations(studentId);
    res.json(createSuccessResponse(recs));
  } catch (error) {
    console.error('Error fetching coaching recommendations:', error);
    res.status(500).json(createErrorResponse('Koçluk önerileri yüklenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const createCoachingRecommendation: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createCoachingRecommendation(req.body);
    res.json(createSuccessResponse(result, 'Koçluk önerisi kaydedildi'));
  } catch (error) {
    console.error('Error creating coaching recommendation:', error);
    res.status(500).json(createErrorResponse('Koçluk önerisi kaydedilemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const updateCoachingRecommendation: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const result = coachingService.updateCoachingRecommendation(id, req.body);
    res.json(createSuccessResponse(result, 'Koçluk önerisi güncellendi'));
  } catch (error) {
    console.error('Error updating coaching recommendation:', error);
    res.status(500).json(createErrorResponse('Koçluk önerisi güncellenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const getAchievementsByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const achievements = coachingService.getStudentAchievements(studentId);
    res.json(createSuccessResponse(achievements));
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json(createErrorResponse('Başarılar yüklenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const createAchievement: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createAchievement(req.body);
    res.json(createSuccessResponse(result, 'Başarı kaydedildi'));
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json(createErrorResponse('Başarı kaydedilemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};
