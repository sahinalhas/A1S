import { RequestHandler } from "express";
import * as surveyService from '../../services/surveys.service.js';
import { autoSyncHooks } from '../../../profile-sync/index.js';
import { uploadExcelFile } from '../../../../middleware/file-validation.middleware.js';
import { validateSchoolAccess } from '../../../../middleware/school-access.middleware.js';

export const getSurveyResponses: RequestHandler = (req, res) => {
  try {
    const { distributionId, studentId } = req.query;
    
    let responses;
    if (distributionId) {
      responses = surveyService.getResponses({ distributionId: distributionId as string });
    } else if (studentId) {
      responses = surveyService.getResponses({ studentId: studentId as string });
    } else {
      responses = surveyService.getResponses();
    }
    
    res.json(responses);
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    res.status(500).json({ success: false, error: 'Anket yanıtları yüklenemedi' });
  }
};

export const createSurveyResponse: RequestHandler = (req, res) => {
  try {
    const response = req.body;
    console.log('🔍 Received response:', { 
      distributionId: response.distributionId,
      hasResponseData: !!response.responseData,
      studentInfo: response.studentInfo,
      fullBody: JSON.stringify(response).substring(0, 200)
    });
    
    if (!response.distributionId || !response.responseData) {
      console.error('❌ Missing required fields:', {
        distributionId: response.distributionId,
        responseData: response.responseData
      });
      return res.status(400).json({ 
        success: false, 
        error: 'Dağıtım ID ve yanıt verisi gereklidir' 
      });
    }

    const distribution = surveyService.getDistributionById(response.distributionId);
    if (!distribution) {
      return res.status(404).json({ 
        success: false, 
        error: 'Anket dağıtımı bulunamadı' 
      });
    }

    const template = surveyService.getTemplateById(distribution.templateId);
    if (!template) {
      return res.status(404).json({ 
        success: false, 
        error: 'Anket şablonu bulunamadı' 
      });
    }

    const questions = surveyService.getTemplateQuestions(distribution.templateId);
    
    // Duplicate submission kontrolü - PUBLIC olmayan dağıtımlarda
    if (distribution.participationType !== 'PUBLIC' && response.studentInfo) {
      const isDuplicate = surveyService.checkDuplicateResponse(response.distributionId, response.studentInfo);
      if (isDuplicate) {
        return res.status(409).json({ 
          success: false, 
          error: 'Bu anket zaten doldurulmuş. Tekrar dolduralamazsınız.' 
        });
      }
    }
    
    try {
      surveyService.validateResponseData(distribution, questions, response.responseData, response.studentInfo);
    } catch (error: any) {
      return res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }

    surveyService.createResponse(response);
    
    // 🔥 OTOMATIK PROFİL SENKRONIZASYONU - Anket cevaplandığında profili güncelle
    autoSyncHooks.onSurveyResponseSubmitted({
      id: response.id || `response_${Date.now()}`,
      ...response
    }).catch(error => {
      console.error('Profile sync failed after survey response:', error);
    });
    
    res.json({ success: true, message: 'Anket yanıtı başarıyla kaydedildi' });
  } catch (error) {
    console.error('Error creating survey response:', error);
    res.status(500).json({ success: false, error: 'Anket yanıtı kaydedilemedi' });
  }
};

export const updateSurveyResponseHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const response = req.body;
    
    surveyService.updateResponse(id, response);
    res.json({ success: true, message: 'Anket yanıtı başarıyla güncellendi' });
  } catch (error) {
    console.error('Error updating survey response:', error);
    res.status(500).json({ success: false, error: 'Anket yanıtı güncellenemedi' });
  }
};

export const deleteSurveyResponseHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    surveyService.deleteResponse(id);
    res.json({ success: true, message: 'Anket yanıtı başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting survey response:', error);
    res.status(500).json({ success: false, error: 'Anket yanıtı silinemedi' });
  }
};

export const importExcelResponsesHandler: RequestHandler = async (req, res) => {
  try {
    const { distributionId } = req.params;
    
    if (!distributionId) {
      return res.status(400).json({
        success: false,
        error: 'Dağıtım ID gereklidir'
      });
    }
    
    // File validation is already done by uploadExcelFile middleware
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        error: 'Excel dosyası yüklenmedi'
      });
    }

    const fileBuffer = req.file.buffer;
    const result = await surveyService.importSurveyResponsesFromExcel(distributionId, fileBuffer);

    if (result.success) {
      res.json({
        ...result,
        message: `${result.successCount} yanıt başarıyla yüklendi`
      });
    } else {
      res.status(400).json({
        ...result,
        message: `${result.successCount} yanıt yüklendi, ${result.errorCount} hata oluştu`
      });
    }
  } catch (error: any) {
    console.error('Error importing Excel responses:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Excel yükleme işlemi başarısız oldu'
    });
  }
};

// Secure Excel upload middleware with comprehensive validation
export const uploadMiddleware = uploadExcelFile;
