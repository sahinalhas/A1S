/**
 * Exam API Contracts
 * Sınav API Request/Response Type Tanımları
 * 
 * Bu dosya Exam feature'ı için tüm API contract'larını içerir.
 */

import type {
  ApiResponse,
  ApiSuccessResponse,
  CreateDTO,
  UpdateDTO,
  PaginatedResponse,
  FilterParams,
} from './api-contracts.js';
import type {
  ExamType,
  ExamSubject,
  ExamSession,
  ExamResult,
  ExamResultWithDetails,
  SchoolExamResult,
  BatchExamResultInput,
  ExamStatistics,
  StudentExamStatistics,
  SubjectPerformance,
  DashboardOverview,
} from './exam-management.types.js';

/**
 * ============================================================================
 * EXAM RESULT CRUD
 * ============================================================================
 */

export interface CreateExamResultRequest {
  studentId: string;
  examName?: string;
  examType?: string;
  examDate: string;
  totalScore?: number;
  maxScore?: number;
  subject?: string;
  semester?: string;
  year?: number;
  notes?: string;
  correctCount?: number;
  wrongCount?: number;
  emptyCount?: number;
}

export type UpdateExamResultRequest = Partial<CreateExamResultRequest>;

export interface ExamResultResponse {
  id: string;
  studentId: string;
  examName?: string;
  examType?: string;
  examDate: string;
  totalScore?: number;
  maxScore?: number;
  percentage?: number;
  subject?: string;
  semester?: string;
  year?: number;
  notes?: string;
  correctCount?: number;
  wrongCount?: number;
  emptyCount?: number;
  netScore?: number;
  created_at?: string;
  updated_at?: string;
}

export type GetExamResultsResponse = ApiResponse<ExamResultResponse[]>;
export type GetExamResultResponse = ApiResponse<ExamResultResponse>;
export type CreateExamResultResponse = ApiSuccessResponse<ExamResultResponse & { success: boolean; id: string }>;
export type UpdateExamResultResponse = ApiSuccessResponse<ExamResultResponse & { success: boolean }>;
export type DeleteExamResultResponse = ApiSuccessResponse<{ success: boolean; message: string }>;

/**
 * ============================================================================
 * EXAM SESSION MANAGEMENT
 * ============================================================================
 */

export type CreateExamSessionRequest = CreateDTO<ExamSession> & {
  exam_type_id: string;
  name: string;
  exam_date: string;
};

export interface UpdateExamSessionRequest {
  name?: string;
  exam_date?: string;
  description?: string;
}

export interface ExamSessionResponse extends ExamSession {
  id: string;
  exam_type_name?: string;
  participant_count?: number;
  completion_rate?: number;
}

export type GetExamSessionsResponse = ApiResponse<ExamSessionResponse[]>;
export type GetExamSessionResponse = ApiResponse<ExamSessionResponse>;
export type CreateExamSessionResponse = ApiSuccessResponse<ExamSessionResponse>;
export type UpdateExamSessionResponse = ApiSuccessResponse<ExamSessionResponse>;
export type DeleteExamSessionResponse = ApiSuccessResponse<{ message: string }>;

/**
 * ============================================================================
 * DETAILED EXAM RESULTS (TYT/AYT/LGS)
 * ============================================================================
 */

export interface CreateDetailedExamResultRequest {
  session_id: string;
  student_id: string;
  subject_id: string;
  correct_count: number;
  wrong_count: number;
  empty_count: number;
}

export type UpdateDetailedExamResultRequest = Partial<Omit<CreateDetailedExamResultRequest, 'session_id' | 'student_id' | 'subject_id'>>;

export interface DetailedExamResultResponse extends ExamResultWithDetails {
  id: string;
  net_score: number;
  penalty_divisor?: number;
}

export type GetDetailedExamResultsResponse = ApiResponse<DetailedExamResultResponse[]>;
export type GetDetailedExamResultResponse = ApiResponse<DetailedExamResultResponse>;
export type CreateDetailedExamResultResponse = ApiSuccessResponse<DetailedExamResultResponse>;
export type UpdateDetailedExamResultResponse = ApiSuccessResponse<DetailedExamResultResponse>;

/**
 * ============================================================================
 * BATCH EXAM RESULT ENTRY
 * ============================================================================
 */

export type BatchExamResultRequest = BatchExamResultInput;

export interface BatchExamResultResponse {
  success: boolean;
  created: number;
  updated: number;
  failed: number;
  errors: Array<{
    student_id: string;
    subject_id?: string;
    error: string;
  }>;
  message: string;
}

export type BatchExamResultApiResponse = ApiResponse<BatchExamResultResponse>;

/**
 * ============================================================================
 * SCHOOL EXAM RESULTS
 * ============================================================================
 */

export interface CreateSchoolExamResultRequest {
  student_id: string;
  subject_name: string;
  exam_type: string;
  score: number;
  max_score?: number;
  exam_date: string;
  semester?: string;
  year?: number;
  notes?: string;
}

export interface UpdateSchoolExamResultRequest {
  subject_name?: string;
  exam_type?: string;
  score?: number;
  max_score?: number;
  exam_date?: string;
  semester?: string;
  year?: number;
  notes?: string;
}

export interface SchoolExamResultResponse extends SchoolExamResult {
  id: string;
  percentage?: number;
  grade?: string;
}

export type GetSchoolExamResultsResponse = ApiResponse<SchoolExamResultResponse[]>;
export type GetSchoolExamResultResponse = ApiResponse<SchoolExamResultResponse>;
export type CreateSchoolExamResultResponse = ApiSuccessResponse<SchoolExamResultResponse>;
export type UpdateSchoolExamResultResponse = ApiSuccessResponse<SchoolExamResultResponse>;

/**
 * ============================================================================
 * EXAM STATISTICS & ANALYTICS
 * ============================================================================
 */

export interface ExamStatisticsRequest {
  session_id?: string;
  exam_type_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface ExamStatisticsResponse extends ExamStatistics {
  generated_at: string;
}

export type GetExamStatisticsResponse = ApiResponse<ExamStatisticsResponse>;

export interface StudentExamStatisticsRequest {
  student_id: string;
  exam_type_id?: string;
  limit?: number;
}

export type GetStudentExamStatisticsResponse = ApiResponse<StudentExamStatistics>;

/**
 * ============================================================================
 * STUDENT EXAM QUERIES
 * ============================================================================
 */

export interface GetStudentExamsRequest {
  studentId: string;
  examType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface StudentExamProgressResponse {
  studentId: string;
  examType: string;
  exams: ExamResultResponse[];
  statistics: {
    totalExams: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    trend: 'improving' | 'declining' | 'stable';
    improvementRate: number;
  };
  subjectPerformance: SubjectPerformance[];
}

export type GetStudentExamProgressResponse = ApiResponse<StudentExamProgressResponse>;

export interface LatestExamResultResponse {
  studentId: string;
  examType?: string;
  latestExam: ExamResultResponse | null;
  previousExam: ExamResultResponse | null;
  improvement?: number;
  message?: string;
}

export type GetLatestExamResultResponse = ApiResponse<LatestExamResultResponse>;

/**
 * ============================================================================
 * DASHBOARD & OVERVIEW
 * ============================================================================
 */

export interface ExamDashboardRequest {
  exam_type_id?: string;
  date_range?: {
    from: string;
    to: string;
  };
}

export type GetExamDashboardResponse = ApiResponse<DashboardOverview>;

/**
 * ============================================================================
 * FILTER & SEARCH
 * ============================================================================
 */

export interface ExamResultsFilterParams extends FilterParams {
  studentId?: string;
  examType?: string;
  subject?: string;
  semester?: string;
  year?: number;
  minScore?: number;
  maxScore?: number;
  dateRange?: {
    from?: string;
    to?: string;
  };
}

export interface ExamSessionFilterParams extends FilterParams {
  exam_type_id?: string;
  status?: 'upcoming' | 'completed' | 'in_progress';
  dateRange?: {
    from?: string;
    to?: string;
  };
}

/**
 * ============================================================================
 * IMPORT & EXPORT
 * ============================================================================
 */

export interface ImportExamResultsRequest {
  session_id: string;
  file: File | Buffer;
  format: 'excel' | 'csv';
  validateOnly?: boolean;
  skipErrors?: boolean;
}

export interface ImportExamResultError {
  row: number;
  student_id?: string;
  student_name?: string;
  subject_id?: string;
  error: string;
}

export interface ImportExamResultsResponse {
  success: boolean;
  imported: number;
  failed: number;
  errors: ImportExamResultError[];
  results: DetailedExamResultResponse[];
  message: string;
}

export type ImportExamResultsApiResponse = ApiResponse<ImportExamResultsResponse>;

export interface ExportExamResultsRequest {
  session_id?: string;
  student_id?: string;
  exam_type_id?: string;
  format: 'excel' | 'pdf' | 'csv';
  includeStatistics?: boolean;
  includeCharts?: boolean;
  dateRange?: {
    from?: string;
    to?: string;
  };
}

export interface ExportExamResultsResponse {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  fileSize?: number;
  format: 'excel' | 'pdf' | 'csv';
  error?: string;
}

export type ExportExamResultsApiResponse = ApiResponse<ExportExamResultsResponse>;

/**
 * ============================================================================
 * EXAM TEMPLATES & CONFIGURATION
 * ============================================================================
 */

export interface ExamTemplateRequest {
  exam_type_id: string;
  session_id?: string;
  include_student_info?: boolean;
}

export interface ExamTemplateResponse {
  success: boolean;
  template_url?: string;
  filename?: string;
  exam_type: string;
  subjects: Array<{
    subject_id: string;
    subject_name: string;
    question_count: number;
  }>;
}

export type GetExamTemplateResponse = ApiResponse<ExamTemplateResponse>;

/**
 * ============================================================================
 * EXAM TYPE & SUBJECT QUERIES
 * ============================================================================
 */

export type GetExamTypesResponse = ApiResponse<ExamType[]>;
export type GetExamTypeResponse = ApiResponse<ExamType>;

export interface ExamSubjectWithStats extends ExamSubject {
  avg_net?: number;
  total_results?: number;
}

export type GetExamSubjectsResponse = ApiResponse<ExamSubjectWithStats[]>;
export type GetExamSubjectResponse = ApiResponse<ExamSubjectWithStats>;

/**
 * ============================================================================
 * COMPARISON & RANKING
 * ============================================================================
 */

export interface CompareExamResultsRequest {
  student_ids: string[];
  session_id?: string;
  exam_type_id?: string;
}

export interface StudentComparison {
  student_id: string;
  student_name: string;
  total_net: number;
  rank: number;
  percentile: number;
  subject_nets: Array<{
    subject_name: string;
    net_score: number;
    rank: number;
  }>;
}

export interface CompareExamResultsResponse {
  comparison: StudentComparison[];
  session_info?: {
    session_id: string;
    session_name: string;
    exam_date: string;
    total_participants: number;
  };
}

export type CompareExamResultsApiResponse = ApiResponse<CompareExamResultsResponse>;

export interface StudentRankingRequest {
  session_id: string;
  subject_id?: string;
  limit?: number;
}

export interface StudentRanking {
  rank: number;
  student_id: string;
  student_name: string;
  net_score: number;
  correct_count: number;
  wrong_count: number;
  empty_count: number;
}

export interface StudentRankingResponse {
  session_id: string;
  session_name: string;
  subject_name?: string;
  total_students: number;
  rankings: StudentRanking[];
}

export type GetStudentRankingResponse = ApiResponse<StudentRankingResponse>;
