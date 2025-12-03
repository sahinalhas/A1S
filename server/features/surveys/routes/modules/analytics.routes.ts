import { RequestHandler } from "express";
import * as surveyService from '../../services/surveys.service.js';

export const getSurveyAnalytics: RequestHandler = (req, res) => {
  try {
    const { distributionId } = req.params;
    
    if (!distributionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Dağıtım ID gereklidir' 
      });
    }

    const distribution = surveyService.getDistributionById(distributionId);
    if (!distribution) {
      return res.status(404).json({ success: false, error: 'Anket dağıtımı bulunamadı' });
    }

    const template = surveyService.getTemplateById(distribution.templateId);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Anket şablonu bulunamadı' });
    }

    const questions = surveyService.getTemplateQuestions(distribution.templateId);
    const responses = surveyService.getResponses({ distributionId });

    const analytics = surveyService.calculateSurveyAnalytics(distribution, template, questions, responses);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error getting survey analytics:', error);
    res.status(500).json({ success: false, error: 'Anket analizleri yüklenemedi' });
  }
};

export const getSurveyQuestionAnalytics: RequestHandler = (req, res) => {
  try {
    const { distributionId, questionId } = req.params;
    
    const distribution = surveyService.getDistributionById(distributionId);
    if (!distribution) {
      return res.status(404).json({ success: false, error: 'Anket dağıtımı bulunamadı' });
    }

    const questions = surveyService.getTemplateQuestions(distribution.templateId);
    const question = questions.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ success: false, error: 'Soru bulunamadı' });
    }

    const responses = surveyService.getResponses({ distributionId });
    
    const analytics = surveyService.calculateQuestionAnalytics(question, responses);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error getting question analytics:', error);
    res.status(500).json({ success: false, error: 'Soru analizleri yüklenemedi' });
  }
};

export const getDistributionStatistics: RequestHandler = (req, res) => {
  try {
    const { distributionId } = req.params;
    
    const distribution = surveyService.getDistributionById(distributionId);
    if (!distribution) {
      return res.status(404).json({ success: false, error: 'Anket dağıtımı bulunamadı' });
    }

    const responses = surveyService.getResponses({ distributionId });
    
    const stats = surveyService.calculateDistributionStatistics(distribution, responses);
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting distribution statistics:', error);
    res.status(500).json({ success: false, error: 'Dağıtım istatistikleri yüklenemedi' });
  }
};
