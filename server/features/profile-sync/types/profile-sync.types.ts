/**
 * Live Profile Sync System Types
 * Canlı Öğrenci Profili Senkronizasyon Sistemi
 */

export type DataSource = 
  | 'counseling_session'
  | 'survey_response'
  | 'exam_result'
  | 'behavior_incident'
  | 'meeting_note'
  | 'attendance'
  | 'parent_meeting'
  | 'self_assessment'
  | 'manual_input';

export type ProfileDomain = 
  | 'academic'
  | 'social_emotional'
  | 'behavioral'
  | 'motivation'
  | 'risk_factors'
  | 'talents_interests'
  | 'health'
  | 'family';

export interface DataValidationResult {
  isValid: boolean;
  confidence: number; // 0-100
  reasoning: string;
  suggestedDomain: ProfileDomain[];
  extractedInsights: Record<string, unknown>;
  conflicts?: DataConflict[];
  recommendations?: string[];
}

export interface DataConflict {
  domain: ProfileDomain;
  existingValue: unknown;
  newValue: unknown;
  severity: 'low' | 'medium' | 'high';
  resolutionSuggestion: string;
}

export interface ProfileUpdateRequest {
  studentId: string;
  source: DataSource;
  sourceId: string;
  rawData: Record<string, unknown>;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ProfileUpdateResult {
  success: boolean;
  updatedDomains: ProfileDomain[];
  validationResult: DataValidationResult;
  conflicts: DataConflict[];
  autoResolved: boolean;
  message: string;
}

export interface UnifiedStudentIdentity {
  studentId: string;
  lastUpdated: string;
  
  // Core Identity
  summary: string; // AI-generated summary: "Kim bu öğrenci?"
  keyCharacteristics: string[];
  currentState: string;
  
  // Domain Scores (0-100)
  academicScore: number;
  socialEmotionalScore: number;
  behavioralScore: number;
  motivationScore: number;
  riskLevel: number;
  
  // Quick Facts
  strengths: string[];
  challenges: string[];
  recentChanges: string[];
  
  // AI Insights
  personalityProfile: string;
  learningStyle: string;
  interventionPriority: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: string[];
}

export interface ProfileSyncLog {
  id: string;
  studentId: string;
  source: DataSource;
  sourceId: string;
  domain: ProfileDomain;
  action: 'created' | 'updated' | 'validated' | 'rejected';
  validationScore: number;
  aiReasoning: string;
  extractedInsights?: Record<string, unknown>;
  timestamp: string;
  processedBy: 'ai' | 'manual';
  created_at?: string;
}

export interface ConflictResolution {
  id: string;
  studentId: string;
  conflictType: string;
  domain?: ProfileDomain;
  oldValue: any;
  newValue: any;
  resolvedValue: any;
  resolutionMethod: 'ai_auto' | 'time_based' | 'confidence_based' | 'manual';
  severity?: 'low' | 'medium' | 'high';
  reasoning: string;
  timestamp: string;
  resolvedBy?: 'ai' | 'manual';
  created_at?: string;
}
