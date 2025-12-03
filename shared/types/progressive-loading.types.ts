/**
 * Progressive Data Loading Types
 * Aşamalı Veri Yükleme Tipleri
 */

/**
 * Streaming chunk type
 * Her bir veri parçasının tipi
 */
export type StreamChunkType = 
  | 'basic'           // Temel öğrenci bilgileri
  | 'academic'        // Akademik veriler
  | 'behavior'        // Davranış verileri
  | 'psychological'   // Psikolojik analiz
  | 'predictive'      // Tahmine dayalı analiz
  | 'timeline'        // Zaman çizelgesi
  | 'complete'        // Tamamlanma sinyali
  | 'error';          // Hata durumu

/**
 * Generic streaming chunk
 */
export interface StreamChunk<T = any> {
  type: StreamChunkType;
  data: T;
  timestamp: string;
  progress?: number; // 0-100 arası ilerleme yüzdesi
}

/**
 * Temel öğrenci bilgileri (hızlı yüklenir)
 */
export interface BasicStudentInfo {
  id: string;
  name: string;
  studentNumber: string;
  grade: number;
  className?: string;
  profilePhoto?: string;
  lastUpdated: string;
}

/**
 * Akademik performans özeti
 */
export interface AcademicSummary {
  gpa: number;
  gradeCount: number;
  averageAttendance: number;
  strongSubjects: string[];
  weakSubjects: string[];
  recentTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

/**
 * Davranış özeti
 */
export interface BehaviorSummary {
  behaviorScore: number;
  positiveIncidents: number;
  negativeIncidents: number;
  counselingSessionCount: number;
  lastIncidentDate?: string;
  overallTrend: 'IMPROVING' | 'STABLE' | 'CONCERNING';
}

/**
 * Progressive analysis state
 * Frontend'de kullanılacak state interface'i
 */
export interface ProgressiveAnalysisState {
  basic: BasicStudentInfo | null;
  academic: AcademicSummary | null;
  behavior: BehaviorSummary | null;
  psychological: any | null;  // PsychologicalDepthAnalysis
  predictive: any | null;     // PredictiveRiskTimeline
  timeline: any | null;       // StudentTimeline
  isComplete: boolean;
  error: string | null;
  progress: number; // 0-100
}

/**
 * Streaming options
 */
export interface StreamingOptions {
  studentId: string;
  includeAI?: boolean;       // AI analizlerini dahil et (opsiyonel, yavaş)
  cacheDuration?: number;    // Cache süresi (saniye)
}

/**
 * Stream error
 */
export interface StreamError {
  code: string;
  message: string;
  details?: any;
}
