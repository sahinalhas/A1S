import { env } from './env.js';

/**
 * AI Provider Configuration
 * 
 * Centralized configuration for AI providers (OpenAI, Gemini, Ollama).
 * Determines which providers are available based on environment variables.
 */

export interface AIProviderConfig {
  openai: {
    apiKey?: string;
    enabled: boolean;
  };
  gemini: {
    apiKey?: string;
    enabled: boolean;
  };
  ollama: {
    baseUrl: string;
    enabled: boolean;
  };
}

/**
 * Get AI provider configuration
 */
export function getAIConfig(): AIProviderConfig {
  return {
    openai: {
      apiKey: env.OPENAI_API_KEY,
      enabled: !!env.OPENAI_API_KEY,
    },
    gemini: {
      apiKey: env.GEMINI_API_KEY,
      enabled: !!env.GEMINI_API_KEY,
    },
    ollama: {
      baseUrl: env.OLLAMA_BASE_URL,
      enabled: true, // Ollama is always available (local)
    },
  };
}

/**
 * Check if any AI provider is configured
 */
export function hasAnyAIProvider(): boolean {
  const config = getAIConfig();
  return config.openai.enabled || config.gemini.enabled || config.ollama.enabled;
}

/**
 * Get list of enabled AI providers
 */
export function getEnabledProviders(): string[] {
  const config = getAIConfig();
  const providers: string[] = [];

  if (config.openai.enabled) providers.push('OpenAI');
  if (config.gemini.enabled) providers.push('Gemini');
  if (config.ollama.enabled) providers.push('Ollama');

  return providers;
}

/**
 * AI configuration instance
 */
export const aiConfig = getAIConfig();
