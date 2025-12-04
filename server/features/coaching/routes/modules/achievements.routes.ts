import { RequestHandler } from 'express';
import * as coachingService from '../../services/coaching.service.js';

export const getCoachingRecommendationsByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const recs = coachingService.getStudentCoachingRecommendations(studentId);
    res.json(recs);
  } catch (error) {
    console.error('Error fetching coaching recommendations:', error);
    res.status(500).json({ success: false, error: 'Koçluk önerileri yüklenemedi' });
  }
};

export const createCoachingRecommendation: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createCoachingRecommendation(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating coaching recommendation:', error);
    res.status(500).json({ success: false, error: 'Koçluk önerisi kaydedilemedi' });
  }
};

export const updateCoachingRecommendation: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const result = coachingService.updateCoachingRecommendation(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating coaching recommendation:', error);
    res.status(500).json({ success: false, error: 'Koçluk önerisi güncellenemedi' });
  }
};

export const getAchievementsByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const achievements = coachingService.getStudentAchievements(studentId);
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ success: false, error: 'Başarılar yüklenemedi' });
  }
};

export const createAchievement: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createAchievement(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({ success: false, error: 'Başarı kaydedilemedi' });
  }
};
