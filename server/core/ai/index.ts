/**
 * AI Core Layer Index
 * Merkezi AI servisleri ve utilities erişimi
 * 
 * Bu file tüm AI-related services'i organize ederek kolay import sağlar.
 */

// =================== AI PROVIDER LAYER ===================
export { AIProviderService, type AIProvider, type ChatMessage, type ChatCompletionRequest } from '../../services/ai-provider.service.js';
export { AIAdapterFactory } from '../../services/ai-adapters/adapter-factory.js';
export type { AIAdapter } from '../../services/ai-adapters/base-adapter.js';

// =================== AI MIDDLEWARE LAYER ===================
export { AICacheService } from '../../services/ai-cache.service.js';
export { AICostTracker } from '../../services/ai-cost-tracker.service.js';
export { AIErrorHandlerService, aiErrorHandler, type AIErrorContext, type AIErrorDetails, type AIServiceType, type AIErrorSeverity } from '../../services/ai-error-handler.service.js';
export { AIContextRouter, type AITaskContext, type AITaskType } from '../../services/ai-context-router.service.js';

// =================== AI MONITORING ===================
export { AIHealthMonitor } from '../../services/ai-health-monitor.service.js';

// =================== AI ANALYZERS ===================
export { AIProfileAnalyzerService } from '../../services/ai-profile-analyzer.service.js';
export { AISessionAnalyzerService } from '../../services/ai-session-analyzer.service.js';

// =================== AI PROMPTS ===================
export { CounselorPrompts } from '../../prompts/counselor-prompts.js';

// =================== UTILITIES ===================
export { AIPromptBuilder } from '../../services/ai-prompt-builder.service.js';

/**
 * Convenience API for common AI operations
 */
export const AICore = {
  /**
   * Get the current AI provider instance
   */
  getProvider: () => {
    return require('../../services/ai-provider.service.js').AIProviderService.getInstance();
  },

  /**
   * Get cost tracking service
   */
  getCostTracker: () => {
    return require('../../services/ai-cost-tracker.service.js').AICostTracker;
  },

  /**
   * Get error handler service
   */
  getErrorHandler: () => {
    return require('../../services/ai-error-handler.service.js').AIErrorHandlerService.getInstance();
  },

  /**
   * Get cache service
   */
  getCache: () => {
    return require('../../services/ai-cache.service.js').AICacheService;
  },

  /**
   * Get context router for task-based model selection
   */
  getContextRouter: () => {
    return require('../../services/ai-context-router.service.js').AIContextRouter;
  },

  /**
   * Get health monitor
   */
  getHealthMonitor: () => {
    return require('../../services/ai-health-monitor.service.js').AIHealthMonitor;
  },
} as const;

export default AICore;
