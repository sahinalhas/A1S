export enum TargetAudience {
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  ADMINISTRATOR = 'ADMINISTRATOR',
  STAFF = 'STAFF',
  ALUMNI = 'ALUMNI',
  EXTERNAL_STAKEHOLDER = 'EXTERNAL_STAKEHOLDER'
}

export interface SurveyTemplate {
  id: string;
  title: string;
  description?: string;
  createdBy?: string;
  tags: string[];
  targetAudience: TargetAudience;
  created_at?: string;
  updated_at?: string;
}

export interface SurveyQuestion {
  id: string;
  templateId: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'OPEN_ENDED' | 'LIKERT' | 'YES_NO' | 'RATING' | 'DROPDOWN';
  required: boolean;
  orderIndex: number;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
  };
  helpText?: string;
  placeholder?: string;
}

export interface SurveyResponse {
  id: string;
  distributionId: string;
  studentId?: string;
  studentInfo?: { name: string; surname: string; class: string };
  responseData: Record<string, unknown>;
  submittedAt: string;
  completionTime?: number;
  submissionType?: string;
  isComplete?: boolean;
  ipAddress?: string;
  userAgent?: string;
  created_at?: string;
}

export interface SurveyDistribution {
  id: string;
  templateId: string;
  title: string;
  description?: string;
  status: string;
  targetStudents?: string[];
  targetClasses?: string[];
  maxResponses?: number;
  startDate?: string;
  endDate?: string;
  publicLink?: string;
  participationType: 'PUBLIC' | 'STUDENT_INFO' | 'SECURITY_CODE';
  excelTemplate?: string;
  createdBy?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DistributionCode {
  id: string;
  distributionId: string;
  studentId?: string;
  code: string;
  qrCode?: string;
  isUsed: boolean;
  usedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  questionType: string;
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

export interface SurveyAnalytics {
  distributionInfo: {
    id: string;
    title: string;
    templateTitle: string;
    status: string;
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

export interface DistributionStatistics {
  totalResponses: number;
  completionRate: string;
  responsesByDay: any;
  demographicBreakdown: any;
  submissionTypes: any;
}
