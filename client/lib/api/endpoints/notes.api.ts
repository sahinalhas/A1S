import type { MeetingNote } from "@shared/types/meeting-notes.types";
import { apiClient, createApiHandler } from '../core/client';
import { API_ERROR_MESSAGES } from "../../constants/messages.constants";

export async function getNotesByStudent(studentId: string): Promise<MeetingNote[]> {
 return createApiHandler(
 async () => {
 const notes = await apiClient.get<MeetingNote[]>(`/api/meeting-notes/${studentId}`, { showErrorToast: false });
 return Array.isArray(notes) ? notes : [];
 },
 [],
 API_ERROR_MESSAGES.NOTES.LOAD_ERROR
 )();
}

export async function addNote(note: MeetingNote): Promise<void> {
 return apiClient.post('/api/meeting-notes', note, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.NOTES.ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.NOTES.ADD_ERROR,
 });
}

export async function updateNote(id: string, note: Partial<MeetingNote>): Promise<void> {
 return apiClient.put(`/api/meeting-notes/${id}`, note, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.NOTES.UPDATE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.NOTES.UPDATE_ERROR,
 });
}

export async function deleteNote(id: string): Promise<void> {
 return apiClient.delete(`/api/meeting-notes/${id}`, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.NOTES.DELETE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.NOTES.DELETE_ERROR,
 });
}
