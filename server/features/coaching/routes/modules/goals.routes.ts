import { RequestHandler } from 'express';
import * as coachingService from '../../services/coaching.service.js';

export const getAcademicGoals: RequestHandler = (req, res) => {
  try {
    const goals = coachingService.getAllAcademicGoals();
    res.json(goals);
  } catch (error) {
    console.error('Error fetching academic goals:', error);
    res.status(500).json({ success: false, error: 'Akademik hedefler yüklenemedi' });
  }
};

export const getAcademicGoalsByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const goals = coachingService.getStudentAcademicGoals(studentId);
    res.json(goals);
  } catch (error) {
    console.error('Error fetching student academic goals:', error);
    res.status(500).json({ success: false, error: 'Öğrenci akademik hedefleri yüklenemedi' });
  }
};

export const createAcademicGoal: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createAcademicGoal(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating academic goal:', error);
    res.status(500).json({ success: false, error: 'Akademik hedef kaydedilemedi' });
  }
};

export const updateAcademicGoal: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const result = coachingService.updateAcademicGoal(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating academic goal:', error);
    res.status(500).json({ success: false, error: 'Akademik hedef güncellenemedi' });
  }
};

export const deleteAcademicGoal: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const result = coachingService.deleteAcademicGoal(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting academic goal:', error);
    res.status(500).json({ success: false, error: 'Akademik hedef silinemedi' });
  }
};

export const getSmartGoalsByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const goals = coachingService.getStudentSmartGoals(studentId);
    res.json(goals);
  } catch (error) {
    console.error('Error fetching smart goals:', error);
    res.status(500).json({ success: false, error: 'SMART hedefler yüklenemedi' });
  }
};

export const createSmartGoal: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createSmartGoal(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating smart goal:', error);
    res.status(500).json({ success: false, error: 'SMART hedef kaydedilemedi' });
  }
};

export const updateSmartGoal: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const result = coachingService.updateSmartGoal(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating smart goal:', error);
    res.status(500).json({ success: false, error: 'SMART hedef güncellenemedi' });
  }
};
