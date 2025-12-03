// Survey System Types

export type SurveyQuestionType = 
 | 'MULTIPLE_CHOICE' 
 | 'OPEN_ENDED' 
 | 'LIKERT' 
 | 'YES_NO' 
 | 'RATING' 
 | 'DROPDOWN';

export type ParticipationType = 
 | 'PUBLIC' 
 | 'STUDENT_INFO' 
 | 'SECURITY_CODE';

export type DistributionType = ParticipationType;

export type SubmissionType = 
 | 'ONLINE' 
 | 'EXCEL_UPLOAD' 
 | 'MANUAL_ENTRY';

export type DistributionStatus = 
 | 'DRAFT' 
 | 'ACTIVE' 
 | 'CLOSED' 
 | 'ARCHIVED';

export type TargetAudience =
 | 'STUDENT'
 | 'PARENT'
 | 'TEACHER'
 | 'ADMINISTRATOR'
 | 'STAFF'
 | 'ALUMNI'
 | 'EXTERNAL_STAKEHOLDER';

export interface SurveyTemplate {
 id: string;
 title: string;
 description?: string;
 createdBy?: string;
 tags?: string[];
 targetAudience: TargetAudience;
 estimatedDuration?: number;
 mebCompliant?: boolean;
 created_at: string;
 updated_at: string;
}

export interface SurveyQuestion {
 id: string;
 templateId: string;
 questionText: string;
 questionType: SurveyQuestionType;
 required: boolean;
 orderIndex: number;
 options?: string[]; // For multiple choice, dropdown etc
 validation?: {
 minLength?: number;
 maxLength?: number;
 minValue?: number;
 maxValue?: number;
 pattern?: string;
 };
 created_at: string;
}

export interface LikertScale {
 min: number;
 max: number;
 minLabel: string;
 maxLabel: string;
 steps?: { value: number; label: string }[];
}

export interface SurveyDistribution {
 id: string;
 templateId: string;
 title: string;
 description?: string;
 targetClasses?: string[]; // ['9/A', '10/B']
 targetStudents?: string[]; // student IDs
 participationType: ParticipationType;
 excelTemplate?: string; // Base64 encoded Excel file
 publicLink?: string; // UUID for public access
 startDate?: string;
 endDate?: string;
 maxResponses?: number;
 status: DistributionStatus;
 createdBy?: string;
 created_at: string;
 updated_at: string;
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

export interface StudentInfo {
 name?: string;
 class?: string;
 number?: string;
 studentId?: string;
}

export interface SurveyResponse {
 id: string;
 distributionId: string;
 studentId?: string;
 studentInfo?: StudentInfo;
 responseData: Record<string, any>; // questionId -> answer
 submissionType: SubmissionType;
 isComplete: boolean;
 submittedAt?: string;
 ipAddress?: string;
 userAgent?: string;
 created_at: string;
 updated_at: string;
}


// Survey Analytics Types
export interface SurveyAnalytics {
 totalResponses: number;
 completionRate: number;
 averageCompletionTime?: number;
 responsesByClass: Record<string, number>;
 questionAnalytics: QuestionAnalytics[];
}

export interface QuestionAnalytics {
 questionId: string;
 questionText: string;
 questionType: SurveyQuestionType;
 totalResponses: number;
 skipRate: number;
 responses: {
 value: any;
 count: number;
 percentage: number;
 }[];
 averageRating?: number; // For LIKERT and RATING questions
 sentiment?: 'positive' | 'neutral' | 'negative'; // For OPEN_ENDED questions
}

export interface ExcelTemplateConfig {
 includeStudentInfo: boolean;
 includeInstructions: boolean;
 customHeaders?: string[];
 responseFormat: 'single_sheet' | 'multi_sheet';
 includeValidation: boolean;
}

export interface DistributionStatistics {
 distributionId: string;
 totalResponses: number;
 completedResponses: number;
 pendingResponses: number;
 completionRate: number;
 lastResponseAt?: string;
 responsesByDay: { date: string; count: number }[];
}