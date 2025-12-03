import type { AcademicRecord } from "../../types/academic.types";
import type { Intervention } from "../../types/common.types";
import { apiClient, createApiHandler } from '../core/client';
import { API_ERROR_MESSAGES } from "../../constants/messages.constants";

export async function loadAcademics(studentId: string): Promise<AcademicRecord[]> {
 return createApiHandler(
 async () => {
 const records = await apiClient.get<any[]>(`/api/students/${studentId}/academics`, { showErrorToast: false });
 return records.map((record: any): AcademicRecord => ({
 id: record.id?.toString() || crypto.randomUUID(),
 studentId: record.studentId,
 term: `${record.year}/${record.semester}`,
 gpa: record.gpa,
 notes: record.notes
 }));
 },
 [],
 API_ERROR_MESSAGES.ACADEMIC.LOAD_ERROR
 )();
}

export async function getAcademicsByStudent(studentId: string): Promise<AcademicRecord[]> {
 return loadAcademics(studentId);
}

export async function addAcademic(a: AcademicRecord): Promise<void> {
 const termParts = a.term.split('/');
 const yearPart = termParts[0];
 const semester = termParts[1] || yearPart.split('-')[1] || '1';
 const year = parseInt(yearPart.split('-')[0]);
 
 const backendRecord = {
 studentId: a.studentId,
 semester: semester,
 year: year,
 gpa: a.gpa,
 exams: [],
 notes: a.notes
 };
 
 return apiClient.post('/api/students/academics', backendRecord, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.ACADEMIC.ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.ACADEMIC.ADD_ERROR,
 });
}

export async function getInterventionsByStudent(studentId: string): Promise<Intervention[]> {
 return createApiHandler(
 async () => {
 const interventions = await apiClient.get<Intervention[]>(`/api/intervention-tracking/student/${studentId}`, { showErrorToast: false });
 return Array.isArray(interventions) ? interventions : [];
 },
 [],
 API_ERROR_MESSAGES.INTERVENTION.LOAD_ERROR
 )();
}

export async function addIntervention(i: Intervention): Promise<void> {
 return apiClient.post('/api/intervention-tracking/start', i, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.INTERVENTION.ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.INTERVENTION.ADD_ERROR,
 });
}
