import type { AIAdapter } from './base-adapter.js';
import { OllamaAdapter } from './ollama-adapter.js';
import { OpenAIAdapter } from './openai-adapter.js';
import { GeminiAdapter } from './gemini-adapter.js';
import { DisabledAdapter } from './disabled-adapter.js';
import type { AIProvider, AIProviderConfig } from '../ai-provider.service.js';

export class AIAdapterFactory {
  static createAdapter(config: AIProviderConfig): AIAdapter {
    try {
      switch (config.provider) {
        case 'ollama':
          return new OllamaAdapter(
            config.model,
            config.temperature,
            config.ollamaBaseUrl
          );
        
        case 'openai':
          return new OpenAIAdapter(
            config.model,
            config.temperature
          );
        
        case 'gemini':
          return new GeminiAdapter(
            config.model,
            config.temperature
          );
        
        default:
          throw new Error(`Unsupported AI provider: ${config.provider}`);
      }
    } catch (error) {
      console.warn(`⚠️  ${config.provider} adapter oluşturulamadı, disabled mode'a geçiliyor:`, error instanceof Error ? error.message : String(error));
      return new DisabledAdapter(config.provider, config.model);
    }
  }
}
