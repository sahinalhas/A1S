/**
 * AI Suggestion Queue Types
 * AI önerileri ve onay sistemi için tip tanımlamaları
 */

export type SuggestionType = 
  | 'PROFILE_UPDATE'
  | 'RISK_ALERT'
  | 'INTERVENTION_PLAN'
  | 'MEETING_SUGGESTION'
  | 'FOLLOW_UP'
  | 'BEHAVIOR_INSIGHT'
  | 'ACADEMIC_INSIGHT';

export type SuggestionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SuggestionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';

export interface ProposedChange {
  field: string;
  currentValue: unknown;
  proposedValue: unknown;
  reason: string;
}

export interface AISuggestion {
  id: string;
  studentId: string;
  suggestionType: SuggestionType;
  source: string;
  sourceId?: string;
  priority: SuggestionPriority;
  status: SuggestionStatus;
  
  // Öneri detayları
  title: string;
  description: string;
  reasoning?: string;
  confidence?: number; // 0-1 arası
  
  // Değişiklik detayları
  proposedChanges?: ProposedChange[];
  currentValues?: Record<string, unknown>;
  
  // AI metadata
  aiModel?: string;
  aiVersion?: string;
  analysisData?: Record<string, unknown>;
  
  // Kullanıcı etkileşimi
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  feedbackRating?: number; // 1-5 arası
  feedbackNotes?: string;
  
  // Zaman damgaları
  createdAt: string;
  expiresAt?: string;
  appliedAt?: string;
}

export interface CreateSuggestionRequest {
  studentId: string;
  suggestionType: SuggestionType;
  source: string;
  sourceId?: string;
  priority?: SuggestionPriority;
  
  title: string;
  description: string;
  reasoning?: string;
  confidence?: number;
  
  proposedChanges?: ProposedChange[];
  currentValues?: Record<string, any>;
  
  aiModel?: string;
  aiVersion?: string;
  analysisData?: Record<string, any>;
  
  expiresInHours?: number; // Varsayılan 72 saat
}

export interface ReviewSuggestionRequest {
  suggestionId: string;
  status: 'APPROVED' | 'REJECTED' | 'MODIFIED';
  reviewedBy: string;
  reviewNotes?: string;
  modifiedChanges?: ProposedChange[]; // MODIFIED durumunda
  feedbackRating?: number;
  feedbackNotes?: string;
}

export interface SuggestionStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalModified: number;
  byType: Record<SuggestionType, number>;
  byPriority: Record<SuggestionPriority, number>;
  avgConfidence: number;
  avgFeedbackRating: number;
  recentSuggestions: AISuggestion[];
}

export interface SuggestionFilters {
  studentId?: string;
  status?: SuggestionStatus[];
  priority?: SuggestionPriority[];
  type?: SuggestionType[];
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}
