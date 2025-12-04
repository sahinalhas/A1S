import { RequestHandler } from 'express';
import * as coachingService from '../../services/coaching.service.js';

export const getMultipleIntelligenceByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const records = coachingService.getStudentMultipleIntelligence(studentId);
    res.json(records);
  } catch (error) {
    console.error('Error fetching multiple intelligence:', error);
    res.status(500).json({ success: false, error: 'Çoklu zeka verileri yüklenemedi' });
  }
};

export const createMultipleIntelligence: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createMultipleIntelligence(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating multiple intelligence:', error);
    res.status(500).json({ success: false, error: 'Çoklu zeka değerlendirmesi kaydedilemedi' });
  }
};

export const getLearningStylesByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const records = coachingService.getStudentLearningStyles(studentId);
    res.json(records);
  } catch (error) {
    console.error('Error fetching learning styles:', error);
    res.status(500).json({ success: false, error: 'Öğrenme stilleri yüklenemedi' });
  }
};

export const createLearningStyle: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createLearningStyle(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating learning style:', error);
    res.status(500).json({ success: false, error: 'Öğrenme stili kaydedilemedi' });
  }
};

export const getEvaluations360ByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const evals = coachingService.getStudent360Evaluations(studentId);
    res.json(evals);
  } catch (error) {
    console.error('Error fetching 360 evaluations:', error);
    res.status(500).json({ success: false, error: '360 değerlendirmeler yüklenemedi' });
  }
};

export const createEvaluation360: RequestHandler = (req, res) => {
  try {
    const result = coachingService.create360Evaluation(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating 360 evaluation:', error);
    res.status(500).json({ success: false, error: '360 değerlendirme kaydedilemedi' });
  }
};

export const getSelfAssessmentsByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const assessments = coachingService.getStudentSelfAssessments(studentId);
    res.json(assessments);
  } catch (error) {
    console.error('Error fetching self assessments:', error);
    res.status(500).json({ success: false, error: 'Öz değerlendirmeler yüklenemedi' });
  }
};

export const createSelfAssessment: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createSelfAssessment(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating self assessment:', error);
    res.status(500).json({ success: false, error: 'Öz değerlendirme kaydedilemedi' });
  }
};
