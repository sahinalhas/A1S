/**
 * Deep Analysis API Client (Consolidated AI Analysis)
 * Birleştirilmiş AI Analiz API İstemcisi
 * 
 * @deprecated Individual functions are deprecated.
 * Use DEEP_ANALYSIS_ENDPOINTS directly or import from deep-analysis.api.ts
 */

import type {
 PsychologicalDepthAnalysis,
 PredictiveRiskTimeline,
 CounselorDailyPlan,
 StudentTimeline,
 ComparativeAnalysisReport
} from '@shared/types/advanced-ai-analysis.types';
import { apiClient } from '../core/client';
import { DEEP_ANALYSIS_ENDPOINTS } from '../../constants/api-endpoints';

export interface ComprehensiveAnalysisResponse {
 psychological: PsychologicalDepthAnalysis;
 predictive: PredictiveRiskTimeline;
 timeline: StudentTimeline;
 generatedAt: string;
}

interface ApiResponse<T> {
 data: T;
}

export async function generatePsychologicalAnalysis(studentId: string): Promise<PsychologicalDepthAnalysis> {
 const response = await apiClient.post<ApiResponse<PsychologicalDepthAnalysis>>(
 DEEP_ANALYSIS_ENDPOINTS.PSYCHOLOGICAL(studentId),
 undefined,
 {
 showSuccessToast: true,
 successMessage: 'Psikolojik analiz oluşturuldu',
 errorMessage: 'Psikolojik analiz oluşturulamadı',
 }
 );
 return response.data;
}

export async function generatePredictiveTimeline(studentId: string): Promise<PredictiveRiskTimeline> {
 const response = await apiClient.post<ApiResponse<PredictiveRiskTimeline>>(
 DEEP_ANALYSIS_ENDPOINTS.PREDICTIVE_TIMELINE(studentId),
 undefined,
 {
 showSuccessToast: true,
 successMessage: 'Öngörücü zaman çizelgesi oluşturuldu',
 errorMessage: 'Öngörücü zaman çizelgesi oluşturulamadı',
 }
 );
 return response.data;
}

export async function generateDailyActionPlan(
 date?: string,
 counselorName?: string,
 forceRegenerate?: boolean
): Promise<CounselorDailyPlan> {
 const response = await apiClient.post<ApiResponse<CounselorDailyPlan>>(
 DEEP_ANALYSIS_ENDPOINTS.DAILY_ACTION_PLAN,
 {
 date: date || new Date().toISOString().split('T')[0],
 counselorName,
 forceRegenerate: forceRegenerate || false
 },
 {
 showSuccessToast: true,
 successMessage: 'Günlük eylem planı oluşturuldu',
 errorMessage: 'Günlük eylem planı oluşturulamadı',
 }
 );
 return response.data;
}

export async function getTodayActionPlan(): Promise<CounselorDailyPlan> {
 const response = await apiClient.get<ApiResponse<CounselorDailyPlan>>(
 DEEP_ANALYSIS_ENDPOINTS.ACTION_PLAN_TODAY,
 {
 errorMessage: 'Günlük plan alınamadı',
 }
 );
 return response.data;
}

export async function generateStudentTimeline(
 studentId: string,
 startDate?: string,
 endDate?: string
): Promise<StudentTimeline> {
 const response = await apiClient.post<ApiResponse<StudentTimeline>>(
 DEEP_ANALYSIS_ENDPOINTS.STUDENT_TIMELINE(studentId),
 { startDate, endDate },
 {
 showSuccessToast: true,
 successMessage: 'Öğrenci zaman çizelgesi oluşturuldu',
 errorMessage: 'Öğrenci zaman çizelgesi oluşturulamadı',
 }
 );
 return response.data;
}

export async function generateClassComparison(classId: string): Promise<ComparativeAnalysisReport> {
 const response = await apiClient.post<ApiResponse<ComparativeAnalysisReport>>(
 DEEP_ANALYSIS_ENDPOINTS.COMPARATIVE_CLASS(classId),
 undefined,
 {
 showSuccessToast: true,
 successMessage: 'Sınıf analizi oluşturuldu',
 errorMessage: 'Sınıf analizi oluşturulamadı',
 }
 );
 return response.data;
}

export async function generateMultiStudentComparison(
 studentIds: string[]
): Promise<ComparativeAnalysisReport> {
 const response = await apiClient.post<ApiResponse<ComparativeAnalysisReport>>(
 DEEP_ANALYSIS_ENDPOINTS.COMPARATIVE_STUDENTS,
 { studentIds },
 {
 showSuccessToast: true,
 successMessage: 'Çoklu öğrenci analizi oluşturuldu',
 errorMessage: 'Çoklu öğrenci analizi oluşturulamadı',
 }
 );
 return response.data;
}

export async function generateComprehensiveAnalysis(
 studentId: string
): Promise<ComprehensiveAnalysisResponse> {
 const response = await apiClient.post<ApiResponse<ComprehensiveAnalysisResponse>>(
 DEEP_ANALYSIS_ENDPOINTS.COMPREHENSIVE(studentId),
 undefined,
 {
 showSuccessToast: true,
 successMessage: 'Kapsamlı analiz oluşturuldu',
 errorMessage: 'Kapsamlı analiz oluşturulamadı',
 }
 );
 return response.data;
}
