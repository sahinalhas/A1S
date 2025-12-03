/**
 * Student API Contracts
 * Öğrenci API Request/Response Type Tanımları
 * 
 * Bu dosya Student feature'ı için tüm API contract'larını içerir.
 */

import type {
  ApiResponse,
  ApiSuccessResponse,
  CreateDTO,
  UpdateDTO,
  PaginatedResponse,
  BulkOperationRequest,
  BulkOperationResponse,
  FilterParams,
} from './api-contracts.js';
import type { Student } from './student.types.js';

/**
 * ============================================================================
 * STUDENT CRUD REQUESTS & RESPONSES
 * ============================================================================
 */

export type CreateStudentRequest = CreateDTO<Student> & {
  name: string;
  surname: string;
  enrollmentDate: string;
};

export type UpdateStudentRequest = Partial<CreateStudentRequest>;

export interface StudentResponse extends Student {
  id: string;
  name: string;
  surname: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated';
}

export type GetStudentsResponse = ApiResponse<StudentResponse[]>;
export type GetStudentResponse = ApiResponse<StudentResponse>;
export type CreateStudentResponse = ApiSuccessResponse<StudentResponse>;
export type UpdateStudentResponse = ApiSuccessResponse<StudentResponse>;
export type DeleteStudentResponse = ApiSuccessResponse<{ message: string }>;

export type GetPaginatedStudentsResponse = PaginatedResponse<StudentResponse>;

/**
 * ============================================================================
 * STUDENT FILTER & SEARCH
 * ============================================================================
 */

export interface StudentFilterParams extends FilterParams {
  class?: string;
  status?: 'active' | 'inactive' | 'graduated';
  risk?: 'Düşük' | 'Orta' | 'Yüksek';
  gender?: 'K' | 'E';
  enrollmentYear?: number;
  hasAvatar?: boolean;
  hasNotes?: boolean;
}

export interface StudentSearchRequest {
  query: string;
  filters?: StudentFilterParams;
  includeInactive?: boolean;
  limit?: number;
}

export type StudentSearchResponse = ApiResponse<StudentResponse[]>;

/**
 * ============================================================================
 * BULK OPERATIONS
 * ============================================================================
 */

export type BulkCreateStudentsRequest = BulkOperationRequest<CreateStudentRequest>;
export type BulkUpdateStudentsRequest = BulkOperationRequest<UpdateStudentRequest & { id: string }>;
export type BulkDeleteStudentsRequest = BulkOperationRequest<{ id: string; confirmationName?: string }>;

export type BulkCreateStudentsResponse = ApiSuccessResponse<BulkOperationResponse<StudentResponse>>;
export type BulkUpdateStudentsResponse = ApiSuccessResponse<BulkOperationResponse<StudentResponse>>;
export type BulkDeleteStudentsResponse = ApiSuccessResponse<BulkOperationResponse<{ id: string }>>;

/**
 * ============================================================================
 * STUDENT DELETION
 * ============================================================================
 */

export interface DeleteStudentRequest {
  id: string;
  confirmationName?: string;
}

export interface DeleteStudentResult {
  success: boolean;
  studentName: string;
  message: string;
}

export type DeleteStudentApiResponse = ApiResponse<DeleteStudentResult>;

/**
 * ============================================================================
 * ACADEMIC RECORDS
 * ============================================================================
 */

export interface ExamSummary {
  examId?: string;
  examName?: string;
  score?: number;
  date?: string;
}

export interface AcademicRecord {
  id?: number;
  studentId: string;
  semester: string;
  gpa?: number;
  year: number;
  exams?: ExamSummary[];
  notes?: string;
}

export type CreateAcademicRecordRequest = CreateDTO<AcademicRecord> & {
  studentId: string;
  semester: string;
  year: number;
};

export type UpdateAcademicRecordRequest = Partial<CreateAcademicRecordRequest>;

export interface AcademicRecordResponse extends AcademicRecord {
  id: number;
  studentId: string;
  semester: string;
  year: number;
}

export type GetAcademicRecordsResponse = ApiResponse<AcademicRecordResponse[]>;
export type GetAcademicRecordResponse = ApiResponse<AcademicRecordResponse>;
export type CreateAcademicRecordResponse = ApiSuccessResponse<AcademicRecordResponse>;
export type UpdateAcademicRecordResponse = ApiSuccessResponse<AcademicRecordResponse>;

/**
 * ============================================================================
 * STUDENT PROGRESS
 * ============================================================================
 */

export interface Progress {
  id: string;
  studentId: string;
  topicId: string;
  completed: number;
  remaining: number;
  lastStudied?: string;
  notes?: string;
}

export type CreateProgressRequest = CreateDTO<Progress> & {
  studentId: string;
  topicId: string;
  completed: number;
  remaining: number;
};

export type UpdateProgressRequest = Partial<CreateProgressRequest>;

export interface ProgressResponse extends Progress {
  id: string;
  studentId: string;
  topicId: string;
  completed: number;
  remaining: number;
}

export type GetProgressListResponse = ApiResponse<ProgressResponse[]>;
export type GetProgressResponse = ApiResponse<ProgressResponse>;
export type CreateProgressResponse = ApiSuccessResponse<ProgressResponse>;
export type UpdateProgressResponse = ApiSuccessResponse<ProgressResponse>;

/**
 * ============================================================================
 * UNIFIED PROFILE
 * ============================================================================
 */

export interface ProfileCompleteness {
  overall: number;
  temelBilgiler: number;
  iletisimBilgileri: number;
  veliBilgileri: number;
  akademikProfil: number;
  sosyalDuygusalProfil: number;
  yetenekIlgiProfil: number;
  saglikProfil: number;
  davranisalProfil: number;
  eksikAlanlar: {
    kategori: string;
    alanlar: string[];
  }[];
}

export interface UnifiedStudentScores {
  studentId: string;
  lastUpdated: string;
  akademikSkor: number;
  sosyalDuygusalSkor: number;
  davranissalSkor: number;
  motivasyonSkor: number;
  riskSkoru: number;
  akademikDetay: {
    notOrtalamasi?: number;
    devamDurumu?: number;
    odeklikSeviyesi?: number;
  };
  sosyalDuygusalDetay: {
    empati?: number;
    ozFarkinalik?: number;
    duyguDuzenlemesi?: number;
    iliski?: number;
  };
  davranissalDetay: {
    olumluDavranis?: number;
    olumsuzDavranis?: number;
    mudahaleEtkinligi?: number;
  };
}

export interface UnifiedProfileResponse {
  student: StudentResponse;
  completeness: ProfileCompleteness;
  scores: UnifiedStudentScores;
  qualityReport?: QualityReport;
}

export interface QualityReport {
  overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
  qualityScore: number;
  dataCompleteness: number;
  dataAccuracy: number;
  lastUpdated: string;
  recommendations: string[];
  criticalIssues: string[];
}

export type GetUnifiedProfileResponse = ApiResponse<UnifiedProfileResponse>;

export interface InitializeProfilesRequest {
  studentId: string;
  initializeAll?: boolean;
  profiles?: string[];
}

export type InitializeProfilesResponse = ApiSuccessResponse<{
  initialized: string[];
  skipped: string[];
  message: string;
}>;

export interface RecalculateScoresRequest {
  studentId: string;
  recalculateAll?: boolean;
  scoreTypes?: string[];
}

export type RecalculateScoresResponse = ApiSuccessResponse<UnifiedStudentScores>;

export type GetQualityReportResponse = ApiResponse<QualityReport>;

/**
 * ============================================================================
 * EXPORT OPERATIONS
 * ============================================================================
 */

export interface ExportStudentsRequest {
  format: 'excel' | 'pdf' | 'csv';
  filters?: StudentFilterParams;
  includeFields?: string[];
  excludeFields?: string[];
  includeAcademics?: boolean;
  includeProgress?: boolean;
}

export interface ExportStudentsResponse {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  fileSize?: number;
  format: 'excel' | 'pdf' | 'csv';
  error?: string;
}

export type ExportStudentsApiResponse = ApiResponse<ExportStudentsResponse>;

/**
 * ============================================================================
 * IMPORT OPERATIONS
 * ============================================================================
 */

export interface ImportStudentsRequest {
  file: File | Buffer;
  format: 'excel' | 'csv';
  validateOnly?: boolean;
  skipDuplicates?: boolean;
  updateExisting?: boolean;
}

export interface ImportValidationError {
  row: number;
  field: string;
  value: unknown;
  error: string;
}

export interface ImportStudentsResponse {
  success: boolean;
  imported: number;
  updated: number;
  skipped: number;
  errors: ImportValidationError[];
  message: string;
}

export type ImportStudentsApiResponse = ApiResponse<ImportStudentsResponse>;

/**
 * ============================================================================
 * STATISTICS & ANALYTICS
 * ============================================================================
 */

export interface StudentStatistics {
  total: number;
  active: number;
  inactive: number;
  graduated: number;
  byClass: Record<string, number>;
  byRisk: Record<string, number>;
  byGender: Record<string, number>;
  averageAge?: number;
  enrollmentTrend?: {
    year: number;
    count: number;
  }[];
}

export type GetStudentStatisticsResponse = ApiResponse<StudentStatistics>;

export interface StudentAnalytics {
  studentId: string;
  academicPerformance: {
    currentGPA?: number;
    trend: 'improving' | 'declining' | 'stable';
    strengths: string[];
    weaknesses: string[];
  };
  attendance: {
    rate: number;
    trend: 'improving' | 'declining' | 'stable';
  };
  behavioral: {
    riskLevel: 'Düşük' | 'Orta' | 'Yüksek';
    incidents: number;
    improvements: string[];
  };
  recommendations: string[];
}

export type GetStudentAnalyticsResponse = ApiResponse<StudentAnalytics>;