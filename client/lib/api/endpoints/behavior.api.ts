import type { BehaviorIncident } from "../../types/academic.types";
import { apiClient, createApiHandler } from '../core/client';
import { API_ERROR_MESSAGES } from "../../constants/messages.constants";

export async function getBehaviorIncidentsByStudent(studentId: string): Promise<BehaviorIncident[]> {
 return createApiHandler(
 () => apiClient.get<BehaviorIncident[]>(`/api/behavior/${studentId}`, { showErrorToast: false }),
 [],
 API_ERROR_MESSAGES.BEHAVIOR.LOAD_ERROR
 )();
}

export async function addBehaviorIncident(incident: BehaviorIncident): Promise<void> {
 return apiClient.post('/api/behavior', incident, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.BEHAVIOR.ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.BEHAVIOR.ADD_ERROR,
 });
}

export async function updateBehaviorIncident(id: string, updates: Partial<BehaviorIncident>): Promise<void> {
 return apiClient.put(`/api/behavior/${id}`, updates, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.BEHAVIOR.UPDATE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.BEHAVIOR.UPDATE_ERROR,
 });
}
