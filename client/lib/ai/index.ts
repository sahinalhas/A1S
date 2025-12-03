/**
 * Client-side AI Library
 * Centralized exports for AI utilities, hooks, and helpers
 */

// =================== UTILITIES ===================
export { getPriorityColor, getStatusColor, getScoreColor, getPriorityLabel, getUrgencyLabel } from './ai-utils.js';

// =================== HOOKS ===================
export { useAIRecommendations, type AIRecommendationOptions, type AIRecommendationResult } from './useAIRecommendations.js';
export { useAIChat, useAIAnalysis, useAIPolishText } from './hooks.js';

/**
 * Convenience API for AI operations
 * All endpoints are consolidated under /api/ai/ prefix
 */
export const AIClient = {
  /**
   * Polish text using AI
   * Endpoint: POST /api/ai/polish-text
   */
  polishText: async (text: string, context: 'academic' | 'counseling' | 'notes' | 'general' = 'general') => {
    const response = await fetch('/api/ai/polish-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, context })
    });
    return response.json();
  },

  /**
   * Get AI provider status
   * Endpoint: GET /api/ai/status
   */
  getStatus: async () => {
    const response = await fetch('/api/ai/status');
    return response.json();
  },

  /**
   * Get student profile analysis with AI insights
   * Endpoint: GET /api/ai/student-profile/:studentId/ai-analysis
   */
  getStudentAnalysis: async (studentId: string) => {
    const response = await fetch(`/api/ai/student-profile/${studentId}/ai-analysis`);
    return response.json();
  },

  /**
   * Get student profile scores
   * Endpoint: GET /api/ai/student-profile/:studentId/scores
   */
  getStudentScores: async (studentId: string) => {
    const response = await fetch(`/api/ai/student-profile/${studentId}/scores`);
    return response.json();
  },

  /**
   * Generate deep analysis for a student
   * Endpoint: POST /api/deep-analysis/:studentId
   */
  getDeepAnalysis: async (studentId: string, analysisType: string = 'comprehensive') => {
    const response = await fetch(`/api/deep-analysis/${studentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisType })
    });
    return response.json();
  },

  /**
   * Chat with AI assistant
   * Endpoint: POST /api/ai-assistant/chat
   */
  chat: async (message: string, studentId?: string, context?: string) => {
    const response = await fetch('/api/ai-assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, studentId, context })
    });
    return response.json();
  },
} as const;

export default AIClient;
