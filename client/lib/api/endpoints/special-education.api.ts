import type { SpecialEducation } from "@shared/types";
import { apiClient, createApiHandler } from '../core/client';
import { API_ERROR_MESSAGES } from "../../constants/messages.constants";

export async function getSpecialEducationByStudent(studentId: string): Promise<SpecialEducation[]> {
 return createApiHandler(
 () => apiClient.get<SpecialEducation[]>(`/api/special-education/${studentId}`, { showErrorToast: false }),
 [],
 API_ERROR_MESSAGES.SPECIAL_EDUCATION.LOAD_ERROR
 )();
}

export async function addSpecialEducation(record: SpecialEducation): Promise<void> {
 return apiClient.post('/api/special-education', record, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.SPECIAL_EDUCATION.ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.SPECIAL_EDUCATION.ADD_ERROR,
 });
}

export async function updateSpecialEducation(id: string, updates: Partial<SpecialEducation>): Promise<void> {
 return apiClient.put(`/api/special-education/${id}`, updates, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.SPECIAL_EDUCATION.UPDATE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.SPECIAL_EDUCATION.UPDATE_ERROR,
 });
}
