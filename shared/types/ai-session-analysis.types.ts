export interface AISessionAnalysisRequest {
  rawNotes: string;
  sessionId?: string;
  studentId: string;
  sessionType: 'individual' | 'group';
  sessionDate: Date | string;
  entryTime: string;
  sessionTopic?: string;
}

export interface AISessionSummary {
  professional: string;
  keyTopics: string[];
  studentQuotes: string[];
  outcomes: string[];
  importantNotes: string[];
}

export interface AIFormSuggestions {
  emotionalState: 'sakin' | 'kaygılı' | 'üzgün' | 'sinirli' | 'mutlu' | 'karışık' | 'diğer';
  physicalState: 'normal' | 'yorgun' | 'enerjik' | 'huzursuz' | 'hasta';
  cooperationLevel: number;
  communicationQuality: 'açık' | 'çekingen' | 'dirençli' | 'sınırlı';
  sessionFlow: 'çok_olumlu' | 'olumlu' | 'nötr' | 'sorunlu' | 'kriz';
  studentParticipationLevel: 'çok_aktif' | 'aktif' | 'pasif' | 'dirençli' | 'kapalı';
  confidence: number;
  reasoning: string;
}

export interface AIActionItem {
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: 'student' | 'counselor' | 'teacher' | 'parent';
  dueDate?: Date | string;
  category: 'academic' | 'social' | 'emotional' | 'behavioral' | 'family';
}

export interface AIFollowUpRecommendation {
  needed: boolean;
  suggestedDate?: Date | string;
  suggestedDays?: number;
  reason: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AIAnalysisMetadata {
  processingTime: number;
  tokensUsed?: number;
  aiProvider: 'openai' | 'gemini' | 'ollama';
  modelVersion: string;
}

export interface AISessionAnalysisResponse {
  summary: AISessionSummary;
  formSuggestions: AIFormSuggestions;
  actionItems: AIActionItem[];
  followUpRecommendation: AIFollowUpRecommendation;
  metadata: AIAnalysisMetadata;
}

// Re-export shared types for backward compatibility
export type { BasicStudentContext as StudentContext, PreviousSession, RiskAlert } from './student-context.types.js';
