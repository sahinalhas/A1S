import { RequestHandler } from 'express';
import * as customizationRepo from './repository/customizations.repository.js';
import type { TemplateCustomization } from './types.js';

export const saveTemplateCustomization: RequestHandler = (req, res) => {
  try {
    const { studentId, templateId } = req.params;
    const customization: TemplateCustomization = req.body;
    
    const existing = customizationRepo.getCustomization(studentId, templateId);
    
    if (existing) {
      customizationRepo.updateCustomization(studentId, templateId, customization);
    } else {
      customizationRepo.saveCustomization(studentId, templateId, customization);
    }
    
    res.json({ success: true, message: 'Özelleştirme kaydedildi' });
  } catch (error) {
    console.error('Error saving customization:', error);
    res.status(500).json({ success: false, error: 'Özelleştirme kaydedilemedi' });
  }
};

export const getTemplateCustomization: RequestHandler = (req, res) => {
  try {
    const { studentId, templateId } = req.params;
    const customization = customizationRepo.getCustomization(studentId, templateId);
    
    res.json(customization || {});
  } catch (error) {
    console.error('Error fetching customization:', error);
    res.status(500).json({ success: false, error: 'Özelleştirme yüklenemedi' });
  }
};
