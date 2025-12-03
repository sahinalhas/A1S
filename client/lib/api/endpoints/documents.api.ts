import type { StudentDoc } from "../../types/common.types";
import { apiClient, createApiHandler } from '../core/client';
import { API_ERROR_MESSAGES } from "../../constants/messages.constants";

export async function getDocsByStudent(studentId: string): Promise<StudentDoc[]> {
 return createApiHandler(
 async () => {
 const docs = await apiClient.get<StudentDoc[]>(`/api/documents/${studentId}`, { showErrorToast: false });
 return Array.isArray(docs) ? docs : [];
 },
 [],
 API_ERROR_MESSAGES.DOCUMENTS.LOAD_ERROR
 )();
}

export async function addDoc(doc: StudentDoc): Promise<void> {
 return apiClient.post('/api/documents', doc, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.DOCUMENTS.ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.DOCUMENTS.ADD_ERROR,
 });
}

export async function removeDoc(id: string): Promise<void> {
 return apiClient.delete(`/api/documents/${id}`, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.DOCUMENTS.DELETE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.DOCUMENTS.DELETE_ERROR,
 });
}
