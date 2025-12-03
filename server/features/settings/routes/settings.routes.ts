import { RequestHandler } from "express";
import * as settingsService from '../services/settings.service.js';
import { AppSettingsService } from '../../../services/app-settings.service.js';

export const getSettings: RequestHandler = (req, res) => {
  try {
    const settings = settingsService.getSettings();
    const aiEnabled = AppSettingsService.isAIEnabled();
    res.json({
      success: true,
      data: {
        ...settings,
        aiEnabled
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: 'Ayarlar getirilirken hata oluştu' });
  }
};

export const saveSettingsHandler: RequestHandler = (req, res) => {
  try {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ 
        success: false, 
        error: "Geçersiz ayar verisi" 
      });
    }
    
    settingsService.saveSettings(settings);
    res.json({ success: true, message: 'Ayarlar kaydedildi' });
  } catch (error) {
    console.error('Error saving settings:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ 
      success: false, 
      error: `Ayarlar kaydedilemedi: ${errorMessage}` 
    });
  }
};

export const setAIEnabled: RequestHandler = (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        error: "enabled alanı boolean olmalıdır" 
      });
    }
    
    AppSettingsService.setAIEnabled(enabled);
    res.json({ 
      success: true, 
      message: enabled ? 'AI özellikleri aktif edildi' : 'AI özellikleri kapatıldı',
      data: { aiEnabled: enabled }
    });
  } catch (error) {
    console.error('Error setting AI enabled:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ 
      success: false, 
      error: `AI durumu güncellenemedi: ${errorMessage}` 
    });
  }
};
