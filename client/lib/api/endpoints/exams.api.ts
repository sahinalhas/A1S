import type { ExamResult } from "../../types/academic.types";
import { apiClient, createApiHandler } from '../core/client';
import { API_ERROR_MESSAGES } from "../../constants/messages.constants";

export async function getExamResultsByStudent(studentId: string): Promise<ExamResult[]> {
 return createApiHandler(
 () => apiClient.get<ExamResult[]>(`/api/exams/${studentId}`, { showErrorToast: false }),
 [],
 API_ERROR_MESSAGES.EXAM.LOAD_ERROR
 )();
}

export async function getExamResultsByType(studentId: string, examType: string): Promise<ExamResult[]> {
 return createApiHandler(
 () => apiClient.get<ExamResult[]>(`/api/exams/${studentId}/type/${examType}`, { showErrorToast: false }),
 []
 )();
}

export async function addExamResult(result: ExamResult): Promise<void> {
 return apiClient.post('/api/exams', result, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.EXAM.ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.EXAM.ADD_ERROR,
 });
}

export async function updateExamResult(id: string, updates: Partial<ExamResult>): Promise<void> {
 return apiClient.put(`/api/exams/${id}`, updates, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.EXAM.UPDATE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.EXAM.UPDATE_ERROR,
 });
}
