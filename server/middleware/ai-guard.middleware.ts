/**
 * AI Guard Middleware
 * Protects AI endpoints by checking if AI features are enabled
 */

import type { Request, Response, NextFunction } from 'express';
import { AppSettingsService } from '../services/app-settings.service.js';
import { logger } from '../utils/logger.js';

export function requireAIEnabled(req: Request, res: Response, next: NextFunction): void {
  try {
    const isEnabled = AppSettingsService.isAIEnabled();
    
    if (!isEnabled) {
      logger.warn('AI feature access attempted while disabled', 'AIGuard', {
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      
      res.status(403).json({
        success: false,
        error: 'AI özellikleri şu anda kapalı. Lütfen Ayarlar sayfasından AI özelliklerini aktif edin.'
      });
      return;
    }
    
    next();
  } catch (error) {
    logger.error('AI guard check failed', 'AIGuard', error);
    res.status(500).json({
      success: false,
      error: 'AI durumu kontrol edilemedi'
    });
  }
}
