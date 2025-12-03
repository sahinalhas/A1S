import type { SurveyResult } from "../../types/common.types";
import { apiClient, createApiHandler } from '../core/client';
import { API_ERROR_MESSAGES } from "../../constants/messages.constants";

function extractScoreFromResponse(responseData: any): number | undefined {
 if (!responseData) return undefined;
 
 const values = Object.values(responseData).filter(v => 
 typeof v === 'string' && !isNaN(Number(v))
 ).map(v => Number(v));
 
 if (values.length > 0) {
 return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
 }
 
 return undefined;
}

export async function loadSurveyResults(): Promise<SurveyResult[]> {
 return createApiHandler(
 async () => {
 const responses = await apiClient.get<any>('/api/survey-responses', { showErrorToast: false });
 
 const responseArray = Array.isArray(responses) ? responses : [];
 
 return responseArray.map((resp: any): SurveyResult => ({
 id: resp.id || 'legacy-' + Date.now(),
 studentId: resp.studentId || resp.studentInfo?.name || 'unknown',
 title: `Anket Sonucu - ${resp.distributionId}`,
 score: extractScoreFromResponse(resp.responseData),
 date: resp.created_at || new Date().toISOString(),
 details: JSON.stringify(resp.responseData)
 }));
 },
 [],
 API_ERROR_MESSAGES.SURVEY.LOAD_ERROR
 )();
}

export async function getSurveyResultsByStudent(studentId: string): Promise<SurveyResult[]> {
 return createApiHandler(
 async () => {
 const responses = await apiClient.get<any>(`/api/survey-responses?studentId=${encodeURIComponent(studentId)}`, { showErrorToast: false });
 
 const responseArray = Array.isArray(responses) ? responses : [];
 
 return responseArray.map((resp: any): SurveyResult => ({
 id: resp.id || 'legacy-' + Date.now(),
 studentId: resp.studentId || resp.studentInfo?.name || studentId,
 title: `Anket Sonucu - ${resp.distributionId}`,
 score: extractScoreFromResponse(resp.responseData),
 date: resp.created_at || new Date().toISOString(),
 details: JSON.stringify(resp.responseData)
 }));
 },
 [],
 API_ERROR_MESSAGES.SURVEY.STUDENT_LOAD_ERROR
 )();
}

export async function addSurveyResult(r: SurveyResult): Promise<void> {
 const surveyResponse = {
 distributionId: 'legacy-distribution',
 studentId: r.studentId,
 studentInfo: {
 name: r.studentId,
 class: 'N/A',
 number: '0'
 },
 responseData: r.details ? JSON.parse(r.details) : { score: r.score, title: r.title },
 submissionType: 'MANUAL_ENTRY',
 isComplete: true,
 submittedAt: r.date
 };
 
 return apiClient.post('/api/survey-responses', surveyResponse, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.SURVEY.ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.SURVEY.ADD_ERROR,
 });
}
