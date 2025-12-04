import { RequestHandler } from 'express';
import * as coachingService from '../../services/coaching.service.js';
import { 
  createSuccessResponse, 
  createErrorResponse,
  ApiErrorCode 
} from '../../../../../shared/types/api-contracts.js';

export const getMultipleIntelligenceByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const records = coachingService.getStudentMultipleIntelligence(studentId);
    res.json(createSuccessResponse(records));
  } catch (error) {
    console.error('Error fetching multiple intelligence:', error);
    res.status(500).json(createErrorResponse('Çoklu zeka verileri yüklenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const createMultipleIntelligence: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createMultipleIntelligence(req.body);
    res.json(createSuccessResponse(result, 'Çoklu zeka değerlendirmesi kaydedildi'));
  } catch (error) {
    console.error('Error creating multiple intelligence:', error);
    res.status(500).json(createErrorResponse('Çoklu zeka değerlendirmesi kaydedilemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const getLearningStylesByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const records = coachingService.getStudentLearningStyles(studentId);
    res.json(createSuccessResponse(records));
  } catch (error) {
    console.error('Error fetching learning styles:', error);
    res.status(500).json(createErrorResponse('Öğrenme stilleri yüklenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const createLearningStyle: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createLearningStyle(req.body);
    res.json(createSuccessResponse(result, 'Öğrenme stili kaydedildi'));
  } catch (error) {
    console.error('Error creating learning style:', error);
    res.status(500).json(createErrorResponse('Öğrenme stili kaydedilemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const getEvaluations360ByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const evals = coachingService.getStudent360Evaluations(studentId);
    res.json(createSuccessResponse(evals));
  } catch (error) {
    console.error('Error fetching 360 evaluations:', error);
    res.status(500).json(createErrorResponse('360 değerlendirmeler yüklenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const createEvaluation360: RequestHandler = (req, res) => {
  try {
    const result = coachingService.create360Evaluation(req.body);
    res.json(createSuccessResponse(result, '360 değerlendirme kaydedildi'));
  } catch (error) {
    console.error('Error creating 360 evaluation:', error);
    res.status(500).json(createErrorResponse('360 değerlendirme kaydedilemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const getSelfAssessmentsByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const assessments = coachingService.getStudentSelfAssessments(studentId);
    res.json(createSuccessResponse(assessments));
  } catch (error) {
    console.error('Error fetching self assessments:', error);
    res.status(500).json(createErrorResponse('Öz değerlendirmeler yüklenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const createSelfAssessment: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createSelfAssessment(req.body);
    res.json(createSuccessResponse(result, 'Öz değerlendirme kaydedildi'));
  } catch (error) {
    console.error('Error creating self assessment:', error);
    res.status(500).json(createErrorResponse('Öz değerlendirme kaydedilemedi', ApiErrorCode.INTERNAL_ERROR));
  }
};
