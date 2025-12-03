import type { AttendanceRecord } from "../../types/attendance.types";
import { apiClient, createApiHandler } from '../core/client';
import { API_ERROR_MESSAGES } from "../../constants/messages.constants";

export async function loadAttendance(): Promise<AttendanceRecord[]> {
 return createApiHandler(
 async () => {
 const records = await apiClient.get<AttendanceRecord[]>('/api/attendance', { showErrorToast: false });
 return Array.isArray(records) ? records : [];
 },
 [],
 API_ERROR_MESSAGES.ATTENDANCE.LOAD_ERROR
 )();
}

export async function getAttendanceByStudent(studentId: string): Promise<AttendanceRecord[]> {
 return createApiHandler(
 async () => {
 const records = await apiClient.get<AttendanceRecord[]>(`/api/attendance/${studentId}`, { showErrorToast: false });
 return Array.isArray(records) ? records : [];
 },
 [],
 API_ERROR_MESSAGES.ATTENDANCE.STUDENT_LOAD_ERROR
 )();
}

export async function addAttendance(a: AttendanceRecord): Promise<void> {
 return apiClient.post('/api/attendance', a, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.ATTENDANCE.ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.ATTENDANCE.ADD_ERROR,
 });
}
