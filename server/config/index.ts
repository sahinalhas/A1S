/**
 * Centralized Configuration Module
 * 
 * This module exports all configuration objects and utilities.
 * Import from here to access any configuration in your application.
 * 
 * Usage:
 * ```typescript
 * import { env, databaseConfig, aiConfig, corsConfig } from './config';
 * 
 * const port = env.PORT;
 * const dbPath = databaseConfig.path;
 * const hasOpenAI = aiConfig.openai.enabled;
 * ```
 */

export { env, type Env } from './env.js';
export { databaseConfig, getDatabaseConfig, type DatabaseConfig } from './database.js';
export { aiConfig, getAIConfig, hasAnyAIProvider, getEnabledProviders, type AIProviderConfig } from './ai.js';
export { corsConfig, getCorsOptions } from './cors.js';
