/**
 * Survey API Contracts
 * Anket API Request/Response Type Tanımları
 * 
 * Bu dosya Survey feature'ı için tüm API contract'larını içerir.
 */

import type {
  ApiResponse,
  ApiSuccessResponse,
  CreateDTO,
  UpdateDTO,
  PaginatedResponse,
  FilterParams,
} from './api-contracts.js';

/**
 * ============================================================================
 * SURVEY TEMPLATE TYPES
 * ============================================================================
 */

export interface SurveyTemplate {
  id: string;
  title: string;
  description?: string;
  type: string;
  mebCompliant: boolean;
  isActive: boolean;
  createdBy?: string;
  tags: string[];
  estimatedDuration?: number;
  targetGrades: string[];
  created_at?: string;
  updated_at?: string;
}

export type CreateSurveyTemplateRequest = CreateDTO<SurveyTemplate> & {
  title: string;
  type: string;
  mebCompliant: boolean;
  isActive: boolean;
  tags: string[];
  targetGrades: string[];
};

export type UpdateSurveyTemplateRequest = Partial<CreateSurveyTemplateRequest>;

export interface SurveyTemplateResponse extends SurveyTemplate {
  id: string;
  questionCount?: number;
  distributionCount?: number;
}

export type GetSurveyTemplatesResponse = ApiResponse<SurveyTemplateResponse[]>;
export type GetSurveyTemplateResponse = ApiResponse<SurveyTemplateResponse>;
export type CreateSurveyTemplateResponse = ApiSuccessResponse<SurveyTemplateResponse>;
export type UpdateSurveyTemplateResponse = ApiSuccessResponse<SurveyTemplateResponse>;
export type DeleteSurveyTemplateResponse = ApiSuccessResponse<{ message: string }>;

/**
 * ============================================================================
 * SURVEY QUESTION TYPES
 * ============================================================================
 */

export type QuestionType = 'MULTIPLE_CHOICE' | 'OPEN_ENDED' | 'LIKERT' | 'YES_NO' | 'RATING' | 'DROPDOWN';

export interface QuestionValidation {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  required?: boolean;
}

export interface SurveyQuestion {
  id: string;
  templateId?: string;
  questionText: string;
  questionType: QuestionType;
  required: boolean;
  options?: string[];
  validation?: QuestionValidation;
  order?: number;
  category?: string;
}

export type CreateSurveyQuestionRequest = CreateDTO<SurveyQuestion> & {
  templateId: string;
  questionText: string;
  questionType: QuestionType;
  required: boolean;
};

export type UpdateSurveyQuestionRequest = Partial<CreateSurveyQuestionRequest>;

export interface SurveyQuestionResponse extends SurveyQuestion {
  id: string;
  templateId: string;
}

export type GetSurveyQuestionsResponse = ApiResponse<SurveyQuestionResponse[]>;
export type GetSurveyQuestionResponse = ApiResponse<SurveyQuestionResponse>;
export type CreateSurveyQuestionResponse = ApiSuccessResponse<SurveyQuestionResponse>;
export type UpdateSurveyQuestionResponse = ApiSuccessResponse<SurveyQuestionResponse>;
export type DeleteSurveyQuestionResponse = ApiSuccessResponse<{ message: string }>;

/**
 * ============================================================================
 * SURVEY DISTRIBUTION TYPES
 * ============================================================================
 */

export type DistributionStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface SurveyDistribution {
  id: string;
  templateId: string;
  title: string;
  description?: string;
  status: DistributionStatus;
  targetStudents?: string[];
  maxResponses?: number;
  startDate?: string;
  endDate?: string;
  publicLink?: string;
  created_at?: string;
  updated_at?: string;
  createdBy?: string;
}

export type CreateSurveyDistributionRequest = CreateDTO<SurveyDistribution> & {
  templateId: string;
  title: string;
  status: DistributionStatus;
};

export type UpdateSurveyDistributionRequest = Partial<CreateSurveyDistributionRequest>;

export interface SurveyDistributionResponse extends SurveyDistribution {
  id: string;
  templateTitle?: string;
  responseCount?: number;
  targetCount?: number;
  completionRate?: number;
}

export type GetSurveyDistributionsResponse = ApiResponse<SurveyDistributionResponse[]>;
export type GetSurveyDistributionResponse = ApiResponse<SurveyDistributionResponse>;
export type GetSurveyDistributionByLinkResponse = ApiResponse<SurveyDistributionResponse>;
export type CreateSurveyDistributionResponse = ApiSuccessResponse<SurveyDistributionResponse>;
export type UpdateSurveyDistributionResponse = ApiSuccessResponse<SurveyDistributionResponse>;
export type DeleteSurveyDistributionResponse = ApiSuccessResponse<{ message: string }>;

/**
 * ============================================================================
 * SURVEY RESPONSE TYPES
 * ============================================================================
 */

export interface SurveyResponse {
  id: string;
  distributionId: string;
  studentId?: string;
  responseData: Record<string, unknown>;
  submittedAt: string;
  completionTime?: number;
  submissionType?: 'online' | 'excel' | 'paper';
  isComplete?: boolean;
}

export type CreateSurveyResponseRequest = CreateDTO<SurveyResponse> & {
  distributionId: string;
  responseData: Record<string, unknown>;
};

export type UpdateSurveyResponseRequest = Partial<CreateSurveyResponseRequest>;

export interface SurveyResponseResponse extends SurveyResponse {
  id: string;
  distributionTitle?: string;
  studentName?: string;
}

export type GetSurveyResponsesResponse = ApiResponse<SurveyResponseResponse[]>;
export type GetSurveyResponseResponse = ApiResponse<SurveyResponseResponse>;
export type CreateSurveyResponseResponse = ApiSuccessResponse<SurveyResponseResponse>;
export type UpdateSurveyResponseResponse = ApiSuccessResponse<SurveyResponseResponse>;
export type DeleteSurveyResponseResponse = ApiSuccessResponse<{ message: string }>;

/**
 * ============================================================================
 * SURVEY RESPONSE IMPORT
 * ============================================================================
 */

export interface ImportSurveyResponsesRequest {
  distributionId: string;
  file: File | Buffer;
  format: 'excel' | 'csv';
  validateOnly?: boolean;
  skipInvalidRows?: boolean;
}

export interface ImportResponseError {
  row: number;
  studentId?: string;
  questionId?: string;
  error: string;
}

export interface ImportSurveyResponsesResponse {
  success: boolean;
  imported: number;
  skipped: number;
  errors: ImportResponseError[];
  message: string;
}

export type ImportSurveyResponsesApiResponse = ApiResponse<ImportSurveyResponsesResponse>;

/**
 * ============================================================================
 * SURVEY ANALYTICS TYPES
 * ============================================================================
 */

export interface OptionCount {
  option: string;
  count: number;
  percentage: string;
}

export interface RatingDistribution {
  [rating: string]: number;
}

export interface SentimentAnalysis {
  positive: number;
  negative: number;
  neutral: number;
  overall?: 'positive' | 'negative' | 'neutral';
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  totalResponses: number;
  responseRate: string;
  optionCounts?: OptionCount[];
  averageRating?: number | string;
  distribution?: RatingDistribution;
  yesCount?: number;
  noCount?: number;
  responses?: string[];
  averageLength?: number;
  sentiment?: SentimentAnalysis;
}

export interface SurveyAnalytics {
  distributionInfo: {
    id: string;
    title: string;
    templateTitle: string;
    status: DistributionStatus;
    totalTargets: number;
    totalResponses: number;
    responseRate: string;
  };
  overallStats: {
    averageCompletionTime: number | string;
    mostSkippedQuestion: string | null;
    satisfactionScore: string | number;
  };
  questionAnalytics: QuestionAnalytics[];
}

export type GetSurveyAnalyticsResponse = ApiResponse<SurveyAnalytics>;
export type GetQuestionAnalyticsResponse = ApiResponse<QuestionAnalytics>;

/**
 * ============================================================================
 * SURVEY STATISTICS TYPES
 * ============================================================================
 */

export interface DailyResponseCount {
  date: string;
  count: number;
}

export interface DemographicBreakdown {
  byGrade: Record<string, number>;
  byGender: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface SubmissionTypeBreakdown {
  excel: number;
  online: number;
  paper: number;
}

export interface DistributionStatistics {
  totalResponses: number;
  completionRate: string;
  responsesByDay: DailyResponseCount[];
  demographicBreakdown: DemographicBreakdown;
  submissionTypes: SubmissionTypeBreakdown;
}

export type GetDistributionStatisticsResponse = ApiResponse<DistributionStatistics>;

/**
 * ============================================================================
 * AI ANALYSIS TYPES
 * ============================================================================
 */

export interface SurveyAIAnalysisRequest {
  distributionId: string;
  analysisType: 'summary' | 'insights' | 'recommendations' | 'sentiment' | 'trends';
  includeQuestions?: string[];
  excludeQuestions?: string[];
  minConfidence?: number;
}

export interface AIInsight {
  category: string;
  insight: string;
  confidence: number;
  supportingData?: unknown;
}

export interface AIRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  recommendation: string;
  rationale: string;
  actionItems?: string[];
}

export interface SurveyAIAnalysisResponse {
  distributionId: string;
  analysisType: string;
  generatedAt: string;
  summary?: string;
  insights?: AIInsight[];
  recommendations?: AIRecommendation[];
  sentimentAnalysis?: {
    overall: 'positive' | 'negative' | 'neutral' | 'mixed';
    scores: {
      positive: number;
      negative: number;
      neutral: number;
    };
    keyThemes: string[];
  };
  trends?: {
    trend: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    significance: number;
  }[];
}

export type GetSurveyAIAnalysisResponse = ApiResponse<SurveyAIAnalysisResponse>;

/**
 * ============================================================================
 * FILTER & SEARCH TYPES
 * ============================================================================
 */

export interface SurveyTemplateFilterParams extends FilterParams {
  type?: string;
  mebCompliant?: boolean;
  isActive?: boolean;
  tags?: string[];
  targetGrades?: string[];
  createdBy?: string;
}

export interface SurveyDistributionFilterParams extends FilterParams {
  templateId?: string;
  status?: DistributionStatus;
  hasPublicLink?: boolean;
  createdBy?: string;
  dateRange?: {
    from?: string;
    to?: string;
  };
}

export interface SurveyResponseFilterParams extends FilterParams {
  distributionId?: string;
  studentId?: string;
  submissionType?: 'online' | 'excel' | 'paper';
  isComplete?: boolean;
  dateRange?: {
    from?: string;
    to?: string;
  };
}

/**
 * ============================================================================
 * EXPORT TYPES
 * ============================================================================
 */

export interface ExportSurveyAnalyticsRequest {
  distributionId: string;
  format: 'excel' | 'pdf' | 'csv';
  includeCharts?: boolean;
  includeRawData?: boolean;
  includeAIInsights?: boolean;
}

export interface ExportSurveyResponsesRequest {
  distributionId: string;
  format: 'excel' | 'csv';
  includeMetadata?: boolean;
  anonymize?: boolean;
}

export interface ExportSurveyResponse {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  fileSize?: number;
  format: 'excel' | 'pdf' | 'csv';
  error?: string;
}

export type ExportSurveyApiResponse = ApiResponse<ExportSurveyResponse>;

/**
 * ============================================================================
 * BATCH OPERATIONS
 * ============================================================================
 */

export interface BatchCreateQuestionsRequest {
  templateId: string;
  questions: CreateSurveyQuestionRequest[];
}

export interface BatchCreateQuestionsResponse {
  success: boolean;
  created: number;
  failed: number;
  results: Array<{
    question: CreateSurveyQuestionRequest;
    success: boolean;
    id?: string;
    error?: string;
  }>;
}

export type BatchCreateQuestionsApiResponse = ApiResponse<BatchCreateQuestionsResponse>;
