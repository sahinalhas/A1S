import type { ParentMeeting, HomeVisit, FamilyParticipation } from "../../types/family.types";
import { apiClient, createApiHandler } from '../core/client';
import { API_ERROR_MESSAGES } from "../../constants/messages.constants";

export async function getParentMeetingsByStudent(studentId: string): Promise<ParentMeeting[]> {
 return createApiHandler(
 () => apiClient.get<ParentMeeting[]>(`/api/coaching/parent-meetings/student/${studentId}`, { showErrorToast: false }),
 [],
 API_ERROR_MESSAGES.FAMILY.PARENT_MEETINGS_LOAD_ERROR
 )();
}

export async function addParentMeeting(meeting: ParentMeeting): Promise<void> {
 return apiClient.post('/api/coaching/parent-meetings', meeting, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.FAMILY.PARENT_MEETINGS_ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.FAMILY.PARENT_MEETINGS_ADD_ERROR,
 });
}

export async function updateParentMeeting(id: string, updates: Partial<ParentMeeting>): Promise<void> {
 return apiClient.put(`/api/coaching/parent-meetings/${id}`, updates, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.FAMILY.PARENT_MEETINGS_UPDATE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.FAMILY.PARENT_MEETINGS_UPDATE_ERROR,
 });
}

export async function getHomeVisitsByStudent(studentId: string): Promise<HomeVisit[]> {
 return createApiHandler(
 () => apiClient.get<HomeVisit[]>(`/api/coaching/home-visits/student/${studentId}`, { showErrorToast: false }),
 [],
 API_ERROR_MESSAGES.FAMILY.HOME_VISITS_LOAD_ERROR
 )();
}

export async function addHomeVisit(visit: HomeVisit): Promise<void> {
 return apiClient.post('/api/coaching/home-visits', visit, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.FAMILY.HOME_VISITS_ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.FAMILY.HOME_VISITS_ADD_ERROR,
 });
}

export async function updateHomeVisit(id: string, updates: Partial<HomeVisit>): Promise<void> {
 return apiClient.put(`/api/coaching/home-visits/${id}`, updates, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.FAMILY.HOME_VISITS_UPDATE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.FAMILY.HOME_VISITS_UPDATE_ERROR,
 });
}

export async function getFamilyParticipationsByStudent(studentId: string): Promise<FamilyParticipation[]> {
 return createApiHandler(
 () => apiClient.get<FamilyParticipation[]>(`/api/coaching/family-participations/student/${studentId}`, { showErrorToast: false }),
 [],
 API_ERROR_MESSAGES.FAMILY.PARTICIPATION_LOAD_ERROR
 )();
}

export async function addFamilyParticipation(participation: FamilyParticipation): Promise<void> {
 return apiClient.post('/api/coaching/family-participations', participation, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.FAMILY.PARTICIPATION_ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.FAMILY.PARTICIPATION_ADD_ERROR,
 });
}

export async function updateFamilyParticipation(id: string, updates: Partial<FamilyParticipation>): Promise<void> {
 return apiClient.put(`/api/coaching/family-participations/${id}`, updates, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.FAMILY.PARTICIPATION_UPDATE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.FAMILY.PARTICIPATION_UPDATE_ERROR,
 });
}

export { getFamilyParticipationsByStudent as getFamilyParticipationByStudent };
