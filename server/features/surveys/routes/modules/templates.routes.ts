import { RequestHandler } from "express";
import * as surveyService from '../../services/surveys.service.js';
import { sanitizeObject } from '../../../../middleware/validation.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

export const getSurveyTemplates: RequestHandler = (req, res) => {
  try {
    const templates = surveyService.getAllTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching survey templates:', error);
    res.status(500).json({ success: false, error: 'Anket şablonları yüklenemedi' });
  }
};

export const getSurveyTemplateById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const template = surveyService.getTemplateById(id);
    
    if (!template) {
      return res.status(404).json({ success: false, error: 'Anket şablonu bulunamadı' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching survey template:', error);
    res.status(500).json({ success: false, error: 'Anket şablonu yüklenemedi' });
  }
};

export const createSurveyTemplate: RequestHandler = (req, res) => {
  try {
    const template = sanitizeObject(req.body);
    
    if (!template.title) {
      return res.status(400).json({ 
        success: false, 
        error: 'Başlık alanı gereklidir' 
      });
    }

    surveyService.createTemplate(template);
    res.json({ success: true, message: 'Anket şablonu başarıyla oluşturuldu' });
  } catch (error) {
    console.error('Error creating survey template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Anket şablonu oluşturulamadı';
    res.status(500).json({ success: false, error: errorMessage });
  }
};

export const updateSurveyTemplateHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const template = sanitizeObject(req.body);
    
    surveyService.updateTemplate(id, template);
    return res.json({ success: true, message: 'Anket şablonu başarıyla güncellendi' });
  } catch (error) {
    console.error('Error updating survey template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Anket şablonu güncellenemedi';
    return res.status(500).json({ success: false, error: errorMessage });
  }
};

export const deleteSurveyTemplateHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    surveyService.deleteTemplate(id);
    res.json({ success: true, message: 'Anket şablonu başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting survey template:', error);
    res.status(500).json({ success: false, error: 'Anket şablonu silinemedi' });
  }
};

export const resetSurveyTemplatesToDefaults: RequestHandler = (req, res) => {
  try {
    surveyService.resetToDefaults();
    res.json({ success: true, message: 'Anket şablonları varsayılana sıfırlandı' });
  } catch (error) {
    console.error('Error resetting survey templates:', error);
    res.status(500).json({ success: false, error: 'Anket şablonları sıfırlanamadı' });
  }
};
