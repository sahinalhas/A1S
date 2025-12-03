/**
 * AI Provider Service
 * OpenAI ve Ollama arasında geçiş için birleşik arayüz
 * Singleton pattern ile tüm servisler aynı provider kullanır
 * Adapter pattern ile provider-specific logic ayrıştırılmıştır
 */

import type { AIAdapter } from './ai-adapters/base-adapter.js';
import { AIAdapterFactory } from './ai-adapters/adapter-factory.js';
import { AppSettingsService } from './app-settings.service.js';
import { aiErrorHandler } from './ai-error-handler.service.js';
import { logger } from '../utils/logger.js';

export type AIProvider = 'openai' | 'ollama' | 'gemini';

export interface AIProviderConfig {
  provider: AIProvider;
  model: string;
  temperature?: number;
  ollamaBaseUrl?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  format?: 'json' | 'text';
}

// Rate limiting cache - significantly increased limits for better UX
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(provider: string): boolean {
  const now = Date.now();
  const limit = rateLimitCache.get(provider);

  if (!limit || now > limit.resetTime) {
    rateLimitCache.set(provider, { count: 1, resetTime: now + 60000 });
    return true;
  }

  // Generous limits - rely on external rate limiters instead
  const maxRequests = provider === 'gemini' ? 100 : provider === 'openai' ? 200 : 1000;

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}

// Dummy functions for getCurrentProvider and AIRequestOptions to make the code runnable
// In a real application, these would be defined elsewhere.
function getCurrentProvider(): AIProvider {
  // This is a placeholder. In a real app, this would get the current provider from settings or context.
  return 'openai';
}

interface AIRequestOptions {
  provider?: AIProvider;
  // other options...
}

export class AIProviderService {
  private static instance: AIProviderService;
  private config: AIProviderConfig;
  private adapter: AIAdapter;

  private constructor(config?: Partial<AIProviderConfig>) {
    const savedSettings = AppSettingsService.getAIProvider();

    // 1. Provider ve model seçimi
    const provider = this.selectProvider(config, savedSettings);
    const model = this.selectModel(config, savedSettings, provider);

    // 2. Final config oluştur
    this.config = {
      provider,
      model,
      temperature: config?.temperature || 0,
      ollamaBaseUrl: config?.ollamaBaseUrl || savedSettings?.ollamaBaseUrl || 'http://localhost:11434'
    };

    // 3. Adapter oluştur
    this.adapter = AIAdapterFactory.createAdapter(this.config);

    logger.info(`AI Provider initialized: ${provider} (${model})`, 'AIProviderService', {
      provider,
      model,
      source: savedSettings?.provider ? 'user_settings' : 'default'
    });
  }

  /**
   * Provider seçim öncelik mantığı
   * Öncelik sırası: config > savedSettings (cloud üzerinde Ollama hariç) > API key mevcut olan provider > ollama
   * NOT: Ollama local olduğu için cloud ortamlarında (Replit gibi) çalışmaz.
   * Bu nedenle Ollama seçiliyse ve cloud API key'leri varsa, onları tercih ederiz.
   */
  private selectProvider(
    config?: Partial<AIProviderConfig>,
    savedSettings?: Record<string, unknown>
  ): AIProvider {
    // 1. ÖNCELİK: Programatik config
    if (config?.provider) {
      return config.provider;
    }

    // 2. ÖNCELİK: Kullanıcı ayarları (cloud provider'lar için)
    if (savedSettings?.provider && savedSettings.provider !== 'ollama') {
      logger.info(`Provider loaded from user settings: ${savedSettings.provider}`, 'AIProviderService');
      return savedSettings.provider as AIProvider;
    }

    // 3. Ollama seçili veya ayar yoksa, mevcut API key'lere göre akıllı seçim yap
    // Ollama cloud ortamlarında çalışmaz, bu yüzden cloud provider'ları tercih et
    const hasGeminiKey = this.hasValidAPIKey('GEMINI_API_KEY');
    const hasOpenAIKey = this.hasValidAPIKey('OPENAI_API_KEY');
    
    if (hasGeminiKey) {
      if (savedSettings?.provider === 'ollama') {
        logger.info('Ollama was selected but Gemini API key available - using Gemini as fallback', 'AIProviderService');
      } else {
        logger.info('No saved settings, using Gemini (API key available)', 'AIProviderService');
      }
      return 'gemini';
    }
    
    if (hasOpenAIKey) {
      if (savedSettings?.provider === 'ollama') {
        logger.info('Ollama was selected but OpenAI API key available - using OpenAI as fallback', 'AIProviderService');
      } else {
        logger.info('No saved settings, using OpenAI (API key available)', 'AIProviderService');
      }
      return 'openai';
    }

    // 4. Kullanıcı Ollama seçtiyse ve API key yoksa, Ollama kullan
    if (savedSettings?.provider === 'ollama') {
      logger.info('Provider loaded from user settings: ollama (no cloud API keys available)', 'AIProviderService');
      return 'ollama';
    }

    // 5. Varsayılan: Ollama (local, API key gerektirmez - ama Replit'te çalışmayabilir)
    logger.info('No saved settings or API keys, using Ollama as default provider', 'AIProviderService');
    return 'ollama';
  }

  /**
   * Model seçim mantığı
   * Öncelik: config.model > savedSettings.model (eşleşirse) > default
   */
  private selectModel(
    config: Partial<AIProviderConfig> | undefined,
    savedSettings: Record<string, unknown> | undefined,
    provider: AIProvider
  ): string {
    // 1. Config'den gelen model öncelikli
    if (config?.model) {
      return config.model;
    }

    // 2. Kaydedilmiş provider ile aynıysa, kaydedilmiş modeli kullan
    if (savedSettings?.provider === provider && savedSettings?.model) {
      return savedSettings.model as string;
    }

    // 3. Provider'a uygun varsayılan model
    return this.getDefaultModelForProvider(provider);
  }

  /**
   * API key varlığını kontrol et
   */
  private hasValidAPIKey(keyName: string): boolean {
    const key = process.env[keyName];
    return !!(key && key.trim().length > 0);
  }

  private getDefaultModelForProvider(provider: AIProvider): string {
    switch (provider) {
      case 'gemini':
        return 'gemini-2.5-flash';
      case 'openai':
        return 'gpt-4o-mini';
      case 'ollama':
        return 'llama3.2:3b';
      default:
        return 'gemini-2.5-flash';
    }
  }

  /**
   * Get singleton instance
   * NOT: Singleton her zaman korunur, config parametresi sadece ilk oluşturmada kullanılır
   * Mevcut provider'ı değiştirmek için setProvider() kullanın
   */
  public static getInstance(config?: Partial<AIProviderConfig>): AIProviderService {
    if (!AIProviderService.instance) {
      // İlk oluşturmada config kullan
      AIProviderService.instance = new AIProviderService(config);
    }
    // Zaten varsa mevcut instance'ı döndür (config parametresi görmezden gelinir)
    return AIProviderService.instance;
  }

  /**
   * Reset singleton instance (for testing or manual refresh)
   */
  public static resetInstance(): void {
    AIProviderService.instance = null as any;
  }

  /**
   * Get current provider
   */
  getProvider(): AIProvider {
    return this.config.provider;
  }

  /**
   * Get current model
   */
  getModel(): string {
    return this.config.model;
  }

  /**
   * Set provider
   */
  setProvider(provider: AIProvider, model?: string, ollamaBaseUrl?: string): void {
    this.config.provider = provider;
    if (model) {
      this.config.model = model;
    }
    if (ollamaBaseUrl) {
      this.config.ollamaBaseUrl = ollamaBaseUrl;
    }

    // Ayarları database'e kaydet
    AppSettingsService.saveAIProvider(provider, this.config.model, this.config.ollamaBaseUrl);

    // Adapter'ı yeniden oluştur (DisabledAdapter fallback zaten AIAdapterFactory'de var)
    this.adapter = AIAdapterFactory.createAdapter(this.config);

    logger.info(`AI Provider changed: ${provider} (${this.config.model})`, 'AIProviderService');
  }

  /**
   * Check if provider is available
   */
  async isAvailable(): Promise<boolean> {
    return await this.adapter.isAvailable();
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    return await this.adapter.listModels();
  }

  /**
   * Chat completion
   */
  async chat(request: ChatCompletionRequest): Promise<string> {
    try {
      // Rate limit check
      if (!checkRateLimit(this.config.provider)) {
        throw new Error(`Rate limit exceeded for ${this.config.provider}. Please try again in a minute.`);
      }
      return await this.adapter.chat(request);
    } catch (error) {
      await aiErrorHandler.handleAIError(
        error as Error,
        {
          serviceType: 'chat',
          provider: this.config.provider,
          model: this.config.model,
          operation: 'chat-completion'
        },
        false
      );
      // AI servisi kullanılamadığında daha kullanıcı dostu bir hata mesajı göster
      if ((error instanceof Error ? error.message : String(error)).includes('is not available')) {
        throw new Error(`AI servisi şu an kullanılamıyor. Lütfen internet bağlantınızı kontrol edin veya ayarlardan farklı bir AI sağlayıcı seçin.`);
      }
      throw error;
    }
  }

  /**
   * Streaming chat completion
   */
  async *chatStream(request: ChatCompletionRequest): AsyncGenerator<string, void, unknown> {
    try {
      // Rate limit check
      if (!checkRateLimit(this.config.provider)) {
        throw new Error(`Rate limit exceeded for ${this.config.provider}. Please try again in a minute.`);
      }
      yield* this.adapter.chatStream(request);
    } catch (error) {
      await aiErrorHandler.handleAIError(
        error as Error,
        {
          serviceType: 'chat',
          provider: this.config.provider,
          model: this.config.model,
          operation: 'chat-stream'
        },
        false
      );
      // AI servisi kullanılamadığında daha kullanıcı dostu bir hata mesajı göster
      if ((error instanceof Error ? error.message : String(error)).includes('is not available')) {
        throw new Error(`AI servisi şu an kullanılamıyor. Lütfen internet bağlantınızı kontrol edin veya ayarlardan farklı bir AI sağlayıcı seçin.`);
      }
      throw error;
    }
  }
}

// Removed redundant wrapper - use AIProviderService.getInstance() directly