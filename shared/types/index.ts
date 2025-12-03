/**
 * Shared Types Barrel Export
 * Tüm shared type tanımları için merkezi export noktası
 * 
 * Bu dosya tüm type tanımlarını tek bir yerden import etmeyi sağlar.
 * Usage: import { CreateStudentRequest, ApiResponse } from '@/shared/types';
 */

/**
 * ============================================================================
 * API CONTRACTS - Generic API Types
 * ============================================================================
 */
export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  PaginatedData,
  PaginatedResponse,
  PaginationParams,
  ValidationError,
  ApiError,
  BulkOperationRequest,
  BulkOperationResponse,
  FilterParams,
  ExportRequest,
  CreateDTO,
  UpdateDTO,
  ResponseDTO,
  TimestampFields,
  SoftDeleteFields,
  AuditFields,
} from './api-contracts.js';

export {
  ApiErrorCode,
  isApiSuccessResponse,
  isApiErrorResponse,
  isPaginatedResponse,
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
} from './api-contracts.js';

/**
 * ============================================================================
 * STUDENT API CONTRACTS
 * ============================================================================
 */
export type {
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentResponse,
  GetStudentsResponse,
  GetStudentResponse,
  CreateStudentResponse,
  UpdateStudentResponse,
  DeleteStudentResponse,
  GetPaginatedStudentsResponse,
  StudentFilterParams,
  StudentSearchRequest,
  StudentSearchResponse,
  BulkCreateStudentsRequest,
  BulkUpdateStudentsRequest,
  BulkDeleteStudentsRequest,
  BulkCreateStudentsResponse,
  BulkUpdateStudentsResponse,
  BulkDeleteStudentsResponse,
  DeleteStudentRequest,
  DeleteStudentResult,
  DeleteStudentApiResponse,
  ExamSummary,
  AcademicRecord,
  CreateAcademicRecordRequest,
  UpdateAcademicRecordRequest,
  AcademicRecordResponse,
  GetAcademicRecordsResponse,
  GetAcademicRecordResponse,
  CreateAcademicRecordResponse,
  UpdateAcademicRecordResponse,
  Progress,
  CreateProgressRequest,
  UpdateProgressRequest,
  ProgressResponse,
  GetProgressListResponse,
  GetProgressResponse,
  CreateProgressResponse,
  UpdateProgressResponse,
  ProfileCompleteness,
  UnifiedStudentScores,
  UnifiedProfileResponse,
  QualityReport,
  GetUnifiedProfileResponse,
  InitializeProfilesRequest,
  InitializeProfilesResponse,
  RecalculateScoresRequest,
  RecalculateScoresResponse,
  GetQualityReportResponse,
  ExportStudentsRequest,
  ExportStudentsResponse,
  ExportStudentsApiResponse,
  ImportStudentsRequest,
  ImportValidationError,
  ImportStudentsResponse,
  ImportStudentsApiResponse,
  StudentStatistics,
  GetStudentStatisticsResponse,
  StudentAnalytics,
  GetStudentAnalyticsResponse,
} from './student-api-contracts.js';

/**
 * ============================================================================
 * SURVEY API CONTRACTS
 * ============================================================================
 */
export type {
  SurveyTemplate,
  CreateSurveyTemplateRequest,
  UpdateSurveyTemplateRequest,
  SurveyTemplateResponse,
  GetSurveyTemplatesResponse,
  GetSurveyTemplateResponse,
  CreateSurveyTemplateResponse,
  UpdateSurveyTemplateResponse,
  DeleteSurveyTemplateResponse,
  QuestionType,
  QuestionValidation,
  SurveyQuestion,
  CreateSurveyQuestionRequest,
  UpdateSurveyQuestionRequest,
  SurveyQuestionResponse,
  GetSurveyQuestionsResponse,
  GetSurveyQuestionResponse,
  CreateSurveyQuestionResponse,
  UpdateSurveyQuestionResponse,
  DeleteSurveyQuestionResponse,
  DistributionStatus,
  SurveyDistribution,
  CreateSurveyDistributionRequest,
  UpdateSurveyDistributionRequest,
  SurveyDistributionResponse,
  GetSurveyDistributionsResponse,
  GetSurveyDistributionResponse,
  GetSurveyDistributionByLinkResponse,
  CreateSurveyDistributionResponse,
  UpdateSurveyDistributionResponse,
  DeleteSurveyDistributionResponse,
  SurveyResponse,
  CreateSurveyResponseRequest,
  UpdateSurveyResponseRequest,
  SurveyResponseResponse,
  GetSurveyResponsesResponse,
  GetSurveyResponseResponse,
  CreateSurveyResponseResponse,
  UpdateSurveyResponseResponse,
  DeleteSurveyResponseResponse,
  ImportSurveyResponsesRequest,
  ImportResponseError,
  ImportSurveyResponsesResponse,
  ImportSurveyResponsesApiResponse,
  OptionCount,
  RatingDistribution,
  SentimentAnalysis,
  QuestionAnalytics,
  SurveyAnalytics,
  GetSurveyAnalyticsResponse,
  GetQuestionAnalyticsResponse,
  DailyResponseCount,
  DemographicBreakdown,
  SubmissionTypeBreakdown,
  DistributionStatistics,
  GetDistributionStatisticsResponse,
  SurveyAIAnalysisRequest,
  AIInsight,
  AIRecommendation,
  SurveyAIAnalysisResponse,
  GetSurveyAIAnalysisResponse,
  SurveyTemplateFilterParams,
  SurveyDistributionFilterParams,
  SurveyResponseFilterParams,
  ExportSurveyAnalyticsRequest,
  ExportSurveyResponsesRequest,
  ExportSurveyResponse,
  ExportSurveyApiResponse,
  BatchCreateQuestionsRequest,
  BatchCreateQuestionsResponse,
  BatchCreateQuestionsApiResponse,
} from './survey-api-contracts.js';

/**
 * ============================================================================
 * EXAM API CONTRACTS
 * ============================================================================
 */
export type {
  CreateExamResultRequest,
  UpdateExamResultRequest,
  ExamResultResponse,
  GetExamResultsResponse,
  GetExamResultResponse,
  CreateExamResultResponse,
  UpdateExamResultResponse,
  DeleteExamResultResponse,
  CreateExamSessionRequest,
  UpdateExamSessionRequest,
  ExamSessionResponse,
  GetExamSessionsResponse,
  GetExamSessionResponse,
  CreateExamSessionResponse,
  UpdateExamSessionResponse,
  DeleteExamSessionResponse,
  CreateDetailedExamResultRequest,
  UpdateDetailedExamResultRequest,
  DetailedExamResultResponse,
  GetDetailedExamResultsResponse,
  GetDetailedExamResultResponse,
  CreateDetailedExamResultResponse,
  UpdateDetailedExamResultResponse,
  BatchExamResultRequest,
  BatchExamResultResponse,
  BatchExamResultApiResponse,
  CreateSchoolExamResultRequest,
  UpdateSchoolExamResultRequest,
  SchoolExamResultResponse,
  GetSchoolExamResultsResponse,
  GetSchoolExamResultResponse,
  CreateSchoolExamResultResponse,
  UpdateSchoolExamResultResponse,
  ExamStatisticsRequest,
  ExamStatisticsResponse,
  GetExamStatisticsResponse,
  StudentExamStatisticsRequest,
  GetStudentExamStatisticsResponse,
  GetStudentExamsRequest,
  StudentExamProgressResponse,
  GetStudentExamProgressResponse,
  LatestExamResultResponse,
  GetLatestExamResultResponse,
  ExamDashboardRequest,
  GetExamDashboardResponse,
  ExamResultsFilterParams,
  ExamSessionFilterParams,
  ImportExamResultsRequest,
  ImportExamResultError,
  ImportExamResultsResponse,
  ImportExamResultsApiResponse,
  ExportExamResultsRequest,
  ExportExamResultsResponse,
  ExportExamResultsApiResponse,
  ExamTemplateRequest,
  ExamTemplateResponse,
  GetExamTemplateResponse,
  GetExamTypesResponse,
  GetExamTypeResponse,
  ExamSubjectWithStats,
  GetExamSubjectsResponse,
  GetExamSubjectResponse,
  CompareExamResultsRequest,
  StudentComparison,
  CompareExamResultsResponse,
  CompareExamResultsApiResponse,
  StudentRankingRequest,
  StudentRanking,
  StudentRankingResponse,
  GetStudentRankingResponse,
} from './exam-api-contracts.js';

/**
 * ============================================================================
 * AI ASSISTANT API CONTRACTS
 * ============================================================================
 */
export type {
  AIProvider,
  AIProviderConfig,
  AIProviderStatus,
  GetAIProviderStatusResponse,
  AIModelsResponse,
  GetAIModelsResponse,
  SetAIProviderRequest,
  SetAIProviderResponse,
  SetAIProviderApiResponse,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  GetChatResponse,
  StreamChatRequest,
  StreamChunk,
  StudentContext,
  GetStudentContextResponse,
  AIAnalysisRequest,
  AIAnalysisResponse,
  GetAIAnalysisResponse,
  BulkAIAnalysisRequest,
  StudentAnalysisSummary,
  BulkAIAnalysisResponse,
  GetBulkAIAnalysisResponse,
  InterventionSuggestionRequest,
  InterventionSuggestion,
  InterventionSuggestionResponse,
  GetInterventionSuggestionResponse,
  TextPolishRequest,
  TextPolishResponse,
  GetTextPolishResponse,
  SummarizeRequest,
  SummarizeResponse,
  GetSummarizeResponse,
  AIHealthStatus,
  GetAIHealthResponse,
  AIUsageStats,
  GetAIUsageStatsResponse,
  PromptTemplate,
  GetPromptTemplatesResponse,
  GetPromptTemplateResponse,
  UsePromptTemplateRequest,
  UsePromptTemplateResponse,
  UsePromptTemplateApiResponse,
  SaveConversationRequest,
  ConversationHistory,
  SaveConversationResponse,
  GetConversationHistoriesResponse,
  GetConversationHistoryResponse,
} from './ai-assistant-api-contracts.js';

/**
 * ============================================================================
 * STUDENT DOMAIN TYPES
 * ============================================================================
 */
export type {
  Student,
  UnifiedStudent,
  BackendStudent,
} from './student.types.js';

export {
  STUDENT_VALIDATION_RULES,
  PROFILE_QUALITY_THRESHOLDS,
} from './student.types.js';

/**
 * ============================================================================
 * SURVEY DOMAIN TYPES (from shared/types/survey.types.ts)
 * ============================================================================
 */
export type {
  TableColumnInfo,
} from './survey.types.js';

/**
 * ============================================================================
 * EXAM MANAGEMENT TYPES
 * ============================================================================
 */
export type {
  ExamType,
  ExamTypeId,
  ExamSubject,
  ExamSession,
  CreateExamSessionInput,
  UpdateExamSessionInput,
  ExamResult,
  ExamResultWithDetails,
  CreateExamResultInput,
  UpdateExamResultInput,
  BatchExamResultInput,
  StudentExamResults,
  SubjectResults,
  SchoolExamResult,
  CreateSchoolExamResultInput,
  UpdateSchoolExamResultInput,
  ExamStatistics,
  SubjectStatistics,
  StudentExamStatistics,
  SubjectPerformance,
  RecentExamSummary,
  ExcelImportResult,
  ExcelImportError,
  ExcelTemplateConfig,
  ExamManagementApiResponse,
  ExamResultsFilter,
  SchoolExamResultsFilter,
  DashboardOverview,
  DashboardSummary,
  RecentSessionSummary,
  StudentPerformanceOverview,
  PerformanceDistribution,
  AtRiskStudent,
  QuickAction,
} from './exam-management.types.js';

/**
 * ============================================================================
 * GUIDANCE STANDARDS TYPES
 * ============================================================================
 */
export type {
  GuidanceItem,
  GuidanceCategory,
  GuidanceStandard,
  GuidanceStandardsResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateItemRequest,
  UpdateItemRequest,
  ReorderItemsRequest,
} from './guidance-standards.types.js';
