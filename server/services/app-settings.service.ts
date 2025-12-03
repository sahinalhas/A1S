/**
 * App Settings Service
 * Uygulama ayarlarını yönetir
 */

import getDatabase from '../lib/database.js';
import { logger } from '../utils/logger.js';
import {
  AppSettingsSchema,
  type AppSettings,
  type AIProviderConfig,
  safeJsonParse,
  validateWithSchema,
} from '../schemas/app-settings.schema.js';

export class AppSettingsService {
  private static getDefaultSettings(): AppSettings {
    return {
      aiProvider: {
        provider: 'ollama',
        model: 'llama3.2:3b',
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
      }
    };
  }

  static getSettings(): AppSettings {
    const db = getDatabase();
    
    try {
      const row = db.prepare('SELECT settings FROM app_settings WHERE id = 1').get() as { settings: string } | undefined;
      
      if (!row) {
        const defaults = this.getDefaultSettings();
        this.saveSettings(defaults);
        return defaults;
      }
      
      return safeJsonParse(
        AppSettingsSchema,
        row.settings,
        this.getDefaultSettings(),
        'app_settings'
      );
    } catch (error) {
      logger.error('Failed to get app settings', 'AppSettingsService', error);
      return this.getDefaultSettings();
    }
  }

  static saveSettings(settings: AppSettings): void {
    const db = getDatabase();
    
    try {
      // Validate settings before saving
      const validatedSettings = validateWithSchema(
        AppSettingsSchema,
        settings,
        'app_settings'
      );
      
      const settingsJson = JSON.stringify(validatedSettings);
      
      db.prepare(`
        INSERT INTO app_settings (id, settings, updated_at)
        VALUES (1, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          settings = excluded.settings,
          updated_at = CURRENT_TIMESTAMP
      `).run(settingsJson);
    } catch (error) {
      logger.error('Failed to save app settings', 'AppSettingsService', error);
      throw new Error('Failed to save settings');
    }
  }

  static getAIProvider(): AIProviderConfig | undefined {
    const settings = this.getSettings();
    let result = settings.aiProvider || this.getDefaultSettings().aiProvider;
    
    if (result?.provider === 'gemini') {
      const hasGeminiKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
      if (!hasGeminiKey) {
        logger.warn('Gemini provider selected but API key not configured', 'AppSettingsService', {
          solution: 'Add GEMINI_API_KEY to environment or select a different provider'
        });
      }
    }
    
    if (result?.provider === 'openai') {
      const hasOpenAIKey = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0);
      if (!hasOpenAIKey) {
        logger.warn('OpenAI provider selected but API key not configured', 'AppSettingsService', {
          solution: 'Add OPENAI_API_KEY to environment or select a different provider'
        });
      }
    }
    
    // Auto-migrate deprecated Gemini models to current version
    if (result?.model === 'gemini-1.5-flash' || result?.model === 'gemini-1.5-pro') {
      logger.info('🔄 Auto-migrating deprecated Gemini model: ' + result.model + ' → gemini-2.5-flash', 'AppSettingsService');
      result.model = 'gemini-2.5-flash';
      this.saveAIProvider(result.provider, result.model, result.ollamaBaseUrl);
    }
    
    // Auto-migrate deprecated Ollama 'llama3' to 'llama3.2:3b'
    if (result?.provider === 'ollama' && result?.model === 'llama3') {
      logger.info('🔄 Auto-migrating deprecated Ollama model: ' + result.model + ' → llama3.2:3b', 'AppSettingsService');
      result.model = 'llama3.2:3b';
      this.saveAIProvider(result.provider, result.model, result.ollamaBaseUrl);
    }
    
    return result;
  }

  static saveAIProvider(provider: string, model: string, ollamaBaseUrl?: string): void {
    const settings = this.getSettings();
    
    const aiProviderConfig: AIProviderConfig = {
      provider: provider as 'openai' | 'ollama' | 'gemini',
      model,
      ...(ollamaBaseUrl && { ollamaBaseUrl })
    };
    
    settings.aiProvider = aiProviderConfig;
    this.saveSettings(settings);
  }

  static isAIEnabled(): boolean {
    const db = getDatabase();
    
    try {
      const row = db.prepare('SELECT ai_enabled FROM app_settings WHERE id = 1').get() as { ai_enabled: number } | undefined;
      return row ? row.ai_enabled === 1 : true;
    } catch (error) {
      logger.error('Failed to check AI enabled status', 'AppSettingsService', error);
      return true;
    }
  }

  static setAIEnabled(enabled: boolean): void {
    const db = getDatabase();
    
    try {
      const aiEnabledValue = enabled ? 1 : 0;
      
      db.prepare(`
        INSERT INTO app_settings (id, settings, ai_enabled, updated_at)
        VALUES (1, '{}', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          ai_enabled = excluded.ai_enabled,
          updated_at = CURRENT_TIMESTAMP
      `).run(aiEnabledValue);
      
      logger.info(`AI features ${enabled ? 'enabled' : 'disabled'}`, 'AppSettingsService');
    } catch (error) {
      logger.error('Failed to set AI enabled status', 'AppSettingsService', error);
      throw new Error('Failed to update AI settings');
    }
  }
}
