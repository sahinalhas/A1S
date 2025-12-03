/**
 * Consolidated AI Hooks
 * Central location for all AI-related custom hooks
 */

export { useAIRecommendations } from './useAIRecommendations.js';
export * from './ai-utils.js';

/**
 * useAIChat - Hook for AI chat operations
 * @deprecated - Use individual hooks instead
 */
export const useAIChat = () => {
  const chat = async (messages: any[]) => {
    const response = await fetch('/api/ai-assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
    return response.json();
  };

  return { chat };
};

/**
 * useAIAnalysis - Hook for AI analysis operations
 * Uses the consolidated deep-analysis endpoint
 */
export const useAIAnalysis = () => {
  const analyze = async (studentId: string, analysisType?: string) => {
    const response = await fetch(`/api/deep-analysis/${studentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisType: analysisType || 'comprehensive' })
    });
    return response.json();
  };

  return { analyze };
};

/**
 * useAIPolishText - Hook for text polishing
 */
export const useAIPolishText = () => {
  const polish = async (text: string, context: 'academic' | 'counseling' | 'notes' | 'general' = 'general') => {
    const response = await fetch('/api/ai/polish-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, context })
    });
    return response.json();
  };

  return { polish };
};
