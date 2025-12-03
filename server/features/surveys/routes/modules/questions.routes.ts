import { RequestHandler } from "express";
import * as surveyService from '../../services/surveys.service.js';
import { sanitizeObject } from '../../../../middleware/validation.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

export const getQuestionsByTemplateId: RequestHandler = (req, res) => {
  try {
    const { templateId } = req.params;
    const questions = surveyService.getTemplateQuestions(templateId);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ success: false, error: 'Sorular yüklenemedi' });
  }
};

export const createSurveyQuestion: RequestHandler = (req, res) => {
  try {
    const question = sanitizeObject(req.body);
    
    if (!question.templateId || !question.questionText || !question.questionType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Şablon ID, soru metni ve soru türü gereklidir' 
      });
    }

    surveyService.createQuestion(question);
    res.json({ success: true, message: 'Soru başarıyla oluşturuldu' });
  } catch (error) {
    console.error('Error creating survey question:', error);
    const errorMessage = error instanceof Error ? error.message : 'Soru oluşturulamadı';
    res.status(500).json({ success: false, error: errorMessage });
  }
};

export const updateSurveyQuestionHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const question = sanitizeObject(req.body);
    
    surveyService.updateQuestion(id, question);
    res.json({ success: true, message: 'Soru başarıyla güncellendi' });
  } catch (error) {
    console.error('Error updating survey question:', error);
    const errorMessage = error instanceof Error ? error.message : 'Soru güncellenemedi';
    res.status(500).json({ success: false, error: errorMessage });
  }
};

export const deleteSurveyQuestionHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    surveyService.deleteQuestion(id);
    res.json({ success: true, message: 'Soru başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting survey question:', error);
    res.status(500).json({ success: false, error: 'Soru silinemedi' });
  }
};

export const deleteQuestionsByTemplateHandler: RequestHandler = (req, res) => {
  try {
    const { templateId } = req.params;
    surveyService.deleteTemplateQuestions(templateId);
    res.json({ success: true, message: 'Şablon soruları başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting template questions:', error);
    res.status(500).json({ success: false, error: 'Şablon soruları silinemedi' });
  }
};
