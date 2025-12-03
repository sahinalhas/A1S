/**
 * AI Assistant API Contracts
 * AI Asistan API Request/Response Type Tanımları
 * 
 * Bu dosya AI Assistant feature'ı için tüm API contract'larını içerir.
 */

import type {
  ApiResponse,
  ApiSuccessResponse,
} from './api-contracts.js';

/**
 * ============================================================================
 * AI PROVIDER TYPES
 * ============================================================================
 */

export type AIProvider = 'openai' | 'gemini' | 'ollama';

export interface AIProviderConfig {
  provider: AIProvider;
  model: string;
  ollamaBaseUrl?: string;
  apiKey?: string;
}

export interface AIProviderStatus {
  provider: AIProvider | null;
  providerName: string;
  model: string | null;
  isActive: boolean;
  status: 'healthy' | 'unavailable' | 'error';
  errorMessage?: string;
}

export type GetAIProviderStatusResponse = ApiResponse<AIProviderStatus>;

/**
 * ============================================================================
 * AI MODELS
 * ============================================================================
 */

export interface AIModelsResponse {
  provider: AIProvider;
  currentModel: string;
  availableModels: string[];
  isAvailable: boolean;
}

export type GetAIModelsResponse = ApiResponse<AIModelsResponse>;

/**
 * ============================================================================
 * SET PROVIDER
 * ============================================================================
 */

export interface SetAIProviderRequest {
  provider: AIProvider;
  model?: string;
  ollamaBaseUrl?: string;
}

export interface SetAIProviderResponse {
  provider: AIProvider;
  model: string;
  message: string;
}

export type SetAIProviderApiResponse = ApiSuccessResponse<SetAIProviderResponse>;

/**
 * ============================================================================
 * CHAT TYPES
 * ============================================================================
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  studentId?: string;
  conversationHistory?: ChatMessage[];
  context?: Record<string, unknown>;
  stream?: boolean;
}

export interface ChatResponse {
  message: string;
  role: 'assistant';
  timestamp: string;
  tokensUsed?: number;
  model?: string;
  finishReason?: 'stop' | 'length' | 'content_filter';
}

export type GetChatResponse = ApiSuccessResponse<ChatResponse>;

/**
 * ============================================================================
 * STREAMING CHAT
 * ============================================================================
 */

export interface StreamChatRequest extends ChatRequest {
  stream: true;
}

export interface StreamChunk {
  delta: string;
  done: boolean;
  tokensUsed?: number;
  finishReason?: 'stop' | 'length' | 'content_filter';
}

/**
 * ============================================================================
 * STUDENT CONTEXT
 * ============================================================================
 */

export interface StudentContext {
  studentId: string;
  basicInfo: {
    name: string;
    class?: string;
    age?: number;
    gender?: 'K' | 'E';
  };
  academicProfile: {
    gpa?: number;
    recentExams?: Array<{
      name: string;
      score: number;
      date: string;
    }>;
    strengths?: string[];
    weaknesses?: string[];
  };
  behavioralProfile: {
    riskLevel?: 'Düşük' | 'Orta' | 'Yüksek';
    incidents?: number;
    notes?: string;
  };
  socialEmotionalProfile?: {
    empathy?: number;
    selfAwareness?: number;
    emotionRegulation?: number;
  };
  recentActivities?: Array<{
    type: string;
    date: string;
    description: string;
  }>;
}

export type GetStudentContextResponse = ApiResponse<StudentContext>;

/**
 * ============================================================================
 * AI ANALYSIS TYPES
 * ============================================================================
 */

export interface AIAnalysisRequest {
  studentId?: string;
  analysisType: 'profile' | 'academic' | 'behavioral' | 'intervention' | 'risk' | 'comprehensive';
  includeRecommendations?: boolean;
  context?: Record<string, unknown>;
}

export interface AIInsight {
  category: string;
  insight: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  supportingData?: unknown;
}

export interface AIRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  actionItems: string[];
  expectedOutcome?: string;
  timeframe?: string;
}

export interface AIAnalysisResponse {
  studentId?: string;
  analysisType: string;
  generatedAt: string;
  summary: string;
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  riskAssessment?: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigationStrategies: string[];
  };
  nextSteps?: string[];
}

export type GetAIAnalysisResponse = ApiSuccessResponse<AIAnalysisResponse>;

/**
 * ============================================================================
 * BULK ANALYSIS
 * ============================================================================
 */

export interface BulkAIAnalysisRequest {
  studentIds: string[];
  analysisType: 'profile' | 'academic' | 'behavioral' | 'risk';
  compareStudents?: boolean;
  generateReport?: boolean;
}

export interface StudentAnalysisSummary {
  studentId: string;
  studentName: string;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  keyInsights: string[];
  priorityRecommendations: AIRecommendation[];
}

export interface BulkAIAnalysisResponse {
  totalStudents: number;
  analysisType: string;
  generatedAt: string;
  summaries: StudentAnalysisSummary[];
  comparativeInsights?: {
    topPerformers: string[];
    needsAttention: string[];
    commonPatterns: string[];
    groupRecommendations: AIRecommendation[];
  };
  reportUrl?: string;
}

export type GetBulkAIAnalysisResponse = ApiSuccessResponse<BulkAIAnalysisResponse>;

/**
 * ============================================================================
 * INTERVENTION SUGGESTIONS
 * ============================================================================
 */

export interface InterventionSuggestionRequest {
  studentId: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  context?: string;
  existingInterventions?: string[];
}

export interface InterventionSuggestion {
  title: string;
  description: string;
  type: 'academic' | 'behavioral' | 'social-emotional' | 'family' | 'other';
  duration: string;
  resources: string[];
  steps: Array<{
    step: number;
    action: string;
    responsibility: string;
    timeline: string;
  }>;
  expectedOutcomes: string[];
  successMetrics: string[];
  alternatives?: string[];
}

export interface InterventionSuggestionResponse {
  studentId: string;
  issue: string;
  suggestions: InterventionSuggestion[];
  urgency: 'immediate' | 'soon' | 'moderate' | 'low';
  additionalNotes?: string[];
}

export type GetInterventionSuggestionResponse = ApiSuccessResponse<InterventionSuggestionResponse>;

/**
 * ============================================================================
 * TEXT PROCESSING
 * ============================================================================
 */

export interface TextPolishRequest {
  text: string;
  purpose: 'formal_report' | 'parent_communication' | 'meeting_notes' | 'recommendation_letter' | 'general';
  tone?: 'professional' | 'friendly' | 'empathetic' | 'authoritative';
  maxLength?: number;
}

export interface TextPolishResponse {
  originalText: string;
  polishedText: string;
  changes: Array<{
    type: 'grammar' | 'clarity' | 'tone' | 'structure';
    description: string;
  }>;
  suggestions?: string[];
}

export type GetTextPolishResponse = ApiSuccessResponse<TextPolishResponse>;

export interface SummarizeRequest {
  text: string;
  maxLength?: number;
  style?: 'bullet_points' | 'paragraph' | 'key_points';
}

export interface SummarizeResponse {
  originalLength: number;
  summaryLength: number;
  summary: string;
  keyPoints?: string[];
}

export type GetSummarizeResponse = ApiSuccessResponse<SummarizeResponse>;

/**
 * ============================================================================
 * AI HEALTH & MONITORING
 * ============================================================================
 */

export interface AIHealthStatus {
  provider: AIProvider;
  available: boolean;
  model: string;
  latency?: number;
  lastChecked: string;
  errorCount?: number;
  successRate?: number;
}

export type GetAIHealthResponse = ApiSuccessResponse<AIHealthStatus>;

/**
 * ============================================================================
 * AI COST TRACKING
 * ============================================================================
 */

export interface AIUsageStats {
  provider: AIProvider;
  period: {
    start: string;
    end: string;
  };
  totalRequests: number;
  totalTokens: number;
  estimatedCost: number;
  breakdown: {
    chat: { requests: number; tokens: number; cost: number };
    analysis: { requests: number; tokens: number; cost: number };
    streaming: { requests: number; tokens: number; cost: number };
  };
}

export type GetAIUsageStatsResponse = ApiResponse<AIUsageStats>;

/**
 * ============================================================================
 * PROMPT TEMPLATES
 * ============================================================================
 */

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  variables: string[];
  examples?: string[];
}

export type GetPromptTemplatesResponse = ApiResponse<PromptTemplate[]>;
export type GetPromptTemplateResponse = ApiResponse<PromptTemplate>;

export interface UsePromptTemplateRequest {
  templateId: string;
  variables: Record<string, string>;
  studentId?: string;
}

export interface UsePromptTemplateResponse {
  prompt: string;
  template: PromptTemplate;
}

export type UsePromptTemplateApiResponse = ApiSuccessResponse<UsePromptTemplateResponse>;

/**
 * ============================================================================
 * CONVERSATION HISTORY
 * ============================================================================
 */

export interface SaveConversationRequest {
  studentId?: string;
  title?: string;
  messages: ChatMessage[];
  tags?: string[];
}

export interface ConversationHistory {
  id: string;
  studentId?: string;
  title: string;
  messages: ChatMessage[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type SaveConversationResponse = ApiSuccessResponse<ConversationHistory>;
export type GetConversationHistoriesResponse = ApiResponse<ConversationHistory[]>;
export type GetConversationHistoryResponse = ApiResponse<ConversationHistory>;
