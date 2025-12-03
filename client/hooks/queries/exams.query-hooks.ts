import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
 ExamType,
 ExamSubject,
 ExamSession,
 ExamResult,
 ExamResultWithDetails,
 SchoolExamResult,
 CreateExamSessionInput,
 UpdateExamSessionInput,
 CreateExamResultInput,
 UpdateExamResultInput,
 CreateSchoolExamResultInput,
 UpdateSchoolExamResultInput,
 ExamManagementApiResponse,
 ExamStatistics,
 StudentExamStatistics,
 DashboardOverview,
 SessionComparison,
 TrendAnalysis,
} from '@shared/types/exam-management.types';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { createSchoolScopedQueryKey, getSelectedSchoolId } from '@/lib/school-context';

const API_BASE = '/api/exam-management';

const schoolId = () => getSelectedSchoolId();

export const EXAM_QUERY_KEYS = {
 types: () => createSchoolScopedQueryKey([API_BASE, 'types'], schoolId()),
 subjects: (examTypeId: string | undefined) => createSchoolScopedQueryKey([API_BASE, 'types', examTypeId, 'subjects'], schoolId()),
 sessions: (examTypeId?: string) => examTypeId 
   ? createSchoolScopedQueryKey([API_BASE, 'sessions', examTypeId], schoolId())
   : createSchoolScopedQueryKey([API_BASE, 'sessions'], schoolId()),
 session: (sessionId: string | undefined) => sessionId 
   ? createSchoolScopedQueryKey([API_BASE, 'sessions', 'detail', sessionId], schoolId())
   : createSchoolScopedQueryKey([API_BASE, 'sessions', 'detail'], schoolId()),
 results: () => createSchoolScopedQueryKey([API_BASE, 'results'], schoolId()),
 resultsBySession: (sessionId: string | undefined) => sessionId
   ? createSchoolScopedQueryKey([API_BASE, 'results', 'session', sessionId], schoolId())
   : createSchoolScopedQueryKey([API_BASE, 'results', 'session'], schoolId()),
 resultsByStudent: (studentId: string | undefined) => studentId
   ? createSchoolScopedQueryKey([API_BASE, 'results', 'student', studentId], schoolId())
   : createSchoolScopedQueryKey([API_BASE, 'results', 'student'], schoolId()),
 resultsBySessionAndStudent: (sessionId: string | undefined, studentId: string | undefined) => 
   createSchoolScopedQueryKey([API_BASE, 'results', 'session', sessionId, 'student', studentId], schoolId()),
 statistics: () => createSchoolScopedQueryKey([API_BASE, 'statistics'], schoolId()),
 sessionStatistics: (sessionId: string | undefined) => sessionId
   ? createSchoolScopedQueryKey([API_BASE, 'statistics', 'session', sessionId], schoolId())
   : createSchoolScopedQueryKey([API_BASE, 'statistics', 'session'], schoolId()),
 studentStatistics: (studentId: string | undefined, examTypeId?: string) => {
   const base = [API_BASE, 'statistics', 'student', studentId];
   return examTypeId
     ? createSchoolScopedQueryKey([...base, examTypeId], schoolId())
     : createSchoolScopedQueryKey(base, schoolId());
 },
 schoolExams: () => createSchoolScopedQueryKey([API_BASE, 'school-exams'], schoolId()),
 schoolExamsByStudent: (studentId: string | undefined) => studentId
   ? createSchoolScopedQueryKey([API_BASE, 'school-exams', 'student', studentId], schoolId())
   : createSchoolScopedQueryKey([API_BASE, 'school-exams', 'student'], schoolId()),
 dashboard: () => createSchoolScopedQueryKey([API_BASE, 'dashboard', 'overview'], schoolId()),
 trend: (examTypeId: string | undefined, period: string) => examTypeId
   ? createSchoolScopedQueryKey([API_BASE, 'trend', examTypeId, period], schoolId())
   : createSchoolScopedQueryKey([API_BASE, 'trend'], schoolId()),
 aiRisk: (studentId: string | undefined) => studentId
   ? createSchoolScopedQueryKey([API_BASE, 'ai', 'risk', studentId], schoolId())
   : createSchoolScopedQueryKey([API_BASE, 'ai', 'risk'], schoolId()),
 aiWeakSubjects: (studentId: string | undefined) => studentId
   ? createSchoolScopedQueryKey([API_BASE, 'ai', 'weak-subjects', studentId], schoolId())
   : createSchoolScopedQueryKey([API_BASE, 'ai', 'weak-subjects'], schoolId()),
 aiRecommendations: (sessionId: string | undefined) => sessionId
   ? createSchoolScopedQueryKey([API_BASE, 'ai', 'recommendations', sessionId], schoolId())
   : createSchoolScopedQueryKey([API_BASE, 'ai', 'recommendations'], schoolId()),
};

export function useExamTypes() {
 return useQuery<ExamType[]>({
 queryKey: EXAM_QUERY_KEYS.types(),
 queryFn: async () => {
 const response = await fetchWithSchool(`${API_BASE}/types`);
 if (!response.ok) throw new Error('Sınav türleri yüklenemedi');
 const data: ExamManagementApiResponse<ExamType[]> = await response.json();
 return data.data || [];
 },
 });
}

export function useExamSubjects(examTypeId: string | undefined) {
 return useQuery<ExamSubject[]>({
 queryKey: EXAM_QUERY_KEYS.subjects(examTypeId),
 queryFn: async () => {
 if (!examTypeId) return [];
 const response = await fetchWithSchool(`${API_BASE}/types/${examTypeId}/subjects`);
 if (!response.ok) throw new Error('Dersler yüklenemedi');
 const data: ExamManagementApiResponse<ExamSubject[]> = await response.json();
 return data.data || [];
 },
 enabled: !!examTypeId,
 });
}

export function useExamSessions(examTypeId?: string) {
 return useQuery<ExamSession[]>({
 queryKey: EXAM_QUERY_KEYS.sessions(examTypeId),
 queryFn: async () => {
 const url = examTypeId 
 ? `${API_BASE}/sessions?typeId=${examTypeId}`
 : `${API_BASE}/sessions`;
 const response = await fetchWithSchool(url);
 if (!response.ok) throw new Error('Deneme sınavları yüklenemedi');
 const data: ExamManagementApiResponse<ExamSession[]> = await response.json();
 return data.data || [];
 },
 });
}

export function useExamSession(sessionId: string | undefined) {
 return useQuery<ExamSession>({
 queryKey: EXAM_QUERY_KEYS.session(sessionId),
 queryFn: async () => {
 if (!sessionId) throw new Error('Session ID gerekli');
 const response = await fetchWithSchool(`${API_BASE}/sessions/${sessionId}`);
 if (!response.ok) throw new Error('Deneme sınavı yüklenemedi');
 const data: ExamManagementApiResponse<ExamSession> = await response.json();
 if (!data.data) throw new Error('Deneme sınavı bulunamadı');
 return data.data;
 },
 enabled: !!sessionId,
 });
}

export function useCreateExamSession() {
 const queryClient = useQueryClient();
 
 return useMutation({
 mutationFn: async (input: CreateExamSessionInput) => {
 const response = await fetchWithSchool(`${API_BASE}/sessions`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(input),
 });
 if (!response.ok) throw new Error('Deneme sınavı oluşturulamadı');
 const data: ExamManagementApiResponse<ExamSession> = await response.json();
 return data.data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.sessions(), exact: false });
 },
 });
}

export function useUpdateExamSession() {
 const queryClient = useQueryClient();
 
 return useMutation({
 mutationFn: async ({ id, input }: { id: string; input: UpdateExamSessionInput }) => {
 const response = await fetchWithSchool(`${API_BASE}/sessions/${id}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(input),
 });
 if (!response.ok) throw new Error('Deneme sınavı güncellenemedi');
 const data: ExamManagementApiResponse<ExamSession> = await response.json();
 return data.data;
 },
 onSuccess: (_, variables) => {
 queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.sessions(), exact: false });
 queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.session(variables.id), exact: false });
 },
 });
}

export function useDeleteExamSession() {
 const queryClient = useQueryClient();
 
 return useMutation({
 mutationFn: async (sessionId: string) => {
 const response = await fetchWithSchool(`${API_BASE}/sessions/${sessionId}`, {
 method: 'DELETE',
 });
 if (!response.ok) throw new Error('Deneme sınavı silinemedi');
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.sessions(), exact: false });
 },
 });
}

export function useExamResultsBySession(sessionId: string | undefined) {
 return useQuery<ExamResultWithDetails[]>({
 queryKey: EXAM_QUERY_KEYS.resultsBySession(sessionId),
 queryFn: async () => {
 if (!sessionId) return [];
 const response = await fetchWithSchool(`${API_BASE}/results/session/${sessionId}`);
 if (!response.ok) throw new Error('Sınav sonuçları yüklenemedi');
 const data: ExamManagementApiResponse<ExamResultWithDetails[]> = await response.json();
 return data.data || [];
 },
 enabled: !!sessionId,
 });
}

export function useExamResultsByStudent(studentId: string | undefined) {
 return useQuery<ExamResultWithDetails[]>({
 queryKey: EXAM_QUERY_KEYS.resultsByStudent(studentId),
 queryFn: async () => {
 if (!studentId) return [];
 const response = await fetchWithSchool(`${API_BASE}/results/student/${studentId}`);
 if (!response.ok) throw new Error('Öğrenci sınav sonuçları yüklenemedi');
 const data: ExamManagementApiResponse<ExamResultWithDetails[]> = await response.json();
 return data.data || [];
 },
 enabled: !!studentId,
 });
}

export function useExamResultsBySessionAndStudent(sessionId: string | undefined, studentId: string | undefined) {
 return useQuery<ExamResult[]>({
 queryKey: EXAM_QUERY_KEYS.resultsBySessionAndStudent(sessionId, studentId),
 queryFn: async () => {
 if (!sessionId || !studentId) return [];
 const response = await fetchWithSchool(`${API_BASE}/results/session/${sessionId}/student/${studentId}`);
 if (!response.ok) throw new Error('Öğrenci sınav sonuçları yüklenemedi');
 const data: ExamManagementApiResponse<ExamResult[]> = await response.json();
 return data.data || [];
 },
 enabled: !!sessionId && !!studentId,
 });
}

export function useUpsertExamResult() {
 const queryClient = useQueryClient();
 
 return useMutation({
 mutationFn: async (input: CreateExamResultInput) => {
 const response = await fetchWithSchool(`${API_BASE}/results/upsert`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(input),
 });
 if (!response.ok) throw new Error('Sonuç kaydedilemedi');
 const data: ExamManagementApiResponse<ExamResult> = await response.json();
 return data.data;
 },
 onSuccess: (_, variables) => {
 queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.resultsBySession(variables.session_id), exact: false });
 queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.resultsByStudent(variables.student_id), exact: false });
 queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.statistics(), exact: false });
 },
 });
}

export function useBatchUpsertResults() {
 const queryClient = useQueryClient();
 
 return useMutation({
 mutationFn: async (results: CreateExamResultInput[]) => {
 const response = await fetchWithSchool(`${API_BASE}/results/batch`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ results }),
 });
 if (!response.ok) throw new Error('Sonuçlar kaydedilemedi');
 const data: ExamManagementApiResponse<ExamResult[]> = await response.json();
 return data.data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.results(), exact: false });
 queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.statistics(), exact: false });
 },
 });
}

export function useDeleteExamResult() {
 const queryClient = useQueryClient();
 
 return useMutation({
 mutationFn: async (resultId: string) => {
 const response = await fetchWithSchool(`${API_BASE}/results/${resultId}`, {
 method: 'DELETE',
 });
 if (!response.ok) throw new Error('Sonuç silinemedi');
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.results(), exact: false });
 queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.statistics(), exact: false });
 },
 });
}

export function useSessionStatistics(sessionId: string | undefined) {
 return useQuery<ExamStatistics>({
 queryKey: EXAM_QUERY_KEYS.sessionStatistics(sessionId),
 queryFn: async () => {
 if (!sessionId) throw new Error('Session ID gerekli');
 const response = await fetchWithSchool(`${API_BASE}/statistics/session/${sessionId}`);
 if (!response.ok) throw new Error('İstatistik hesaplanamadı');
 const data: ExamManagementApiResponse<ExamStatistics> = await response.json();
 if (!data.data) throw new Error('İstatistik bulunamadı');
 return data.data;
 },
 enabled: !!sessionId,
 });
}

export function useStudentStatistics(studentId: string | undefined, examTypeId?: string) {
 return useQuery<StudentExamStatistics>({
 queryKey: EXAM_QUERY_KEYS.studentStatistics(studentId, examTypeId),
 queryFn: async () => {
 if (!studentId) throw new Error('Student ID gerekli');
 const url = examTypeId
 ? `${API_BASE}/statistics/student/${studentId}?examTypeId=${examTypeId}`
 : `${API_BASE}/statistics/student/${studentId}`;
 const response = await fetchWithSchool(url);
 if (!response.ok) throw new Error('İstatistik hesaplanamadı');
 const data: ExamManagementApiResponse<StudentExamStatistics> = await response.json();
 if (!data.data) throw new Error('İstatistik bulunamadı');
 return data.data;
 },
 enabled: !!studentId,
 });
}

export function useSchoolExamsByStudent(studentId: string | undefined) {
 return useQuery<SchoolExamResult[]>({
 queryKey: EXAM_QUERY_KEYS.schoolExamsByStudent(studentId),
 queryFn: async () => {
 if (!studentId) return [];
 const response = await fetchWithSchool(`${API_BASE}/school-exams/student/${studentId}`);
 if (!response.ok) throw new Error('Okul sınav sonuçları yüklenemedi');
 const data: ExamManagementApiResponse<SchoolExamResult[]> = await response.json();
 return data.data || [];
 },
 enabled: !!studentId,
 });
}

export function useCreateSchoolExam() {
 const queryClient = useQueryClient();
 
 return useMutation({
 mutationFn: async (input: CreateSchoolExamResultInput) => {
 const response = await fetchWithSchool(`${API_BASE}/school-exams`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(input),
 });
 if (!response.ok) throw new Error('Okul sınav sonucu kaydedilemedi');
 const data: ExamManagementApiResponse<SchoolExamResult> = await response.json();
 return data.data;
 },
 onSuccess: (_, variables) => {
 queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.schoolExamsByStudent(variables.student_id) });
 },
 });
}

export function useUpdateSchoolExam() {
 const queryClient = useQueryClient();
 
 return useMutation({
 mutationFn: async ({ id, input }: { id: string; input: UpdateSchoolExamResultInput }) => {
 const response = await fetchWithSchool(`${API_BASE}/school-exams/${id}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(input),
 });
 if (!response.ok) throw new Error('Okul sınav sonucu güncellenemedi');
 const data: ExamManagementApiResponse<SchoolExamResult> = await response.json();
 return data.data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.schoolExams() });
 },
 });
}

export function useDeleteSchoolExam() {
 const queryClient = useQueryClient();
 
 return useMutation({
 mutationFn: async (examId: string) => {
 const response = await fetchWithSchool(`${API_BASE}/school-exams/${examId}`, {
 method: 'DELETE',
 });
 if (!response.ok) throw new Error('Okul sınav sonucu silinemedi');
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.schoolExams() });
 },
 });
}

export function useImportExcelResults() {
 const queryClient = useQueryClient();
 
 return useMutation({
 mutationFn: async ({ sessionId, file }: { sessionId: string; file: File }) => {
 const formData = new FormData();
 formData.append('sessionId', sessionId);
 formData.append('file', file);
 
 const response = await fetchWithSchool(`${API_BASE}/excel/import`, {
 method: 'POST',
 body: formData,
 });
 if (!response.ok) throw new Error('Excel dosyası işlenemedi');
 return await response.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.results() });
 queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.statistics() });
 },
 });
}

export function downloadExcelTemplate(examTypeId: string, includeStudents: boolean = false) {
 const url = `${API_BASE}/excel/template/${examTypeId}?includeStudents=${includeStudents}`;
 window.open(url, '_blank');
}

export function downloadExcelResults(sessionId: string) {
 const url = `${API_BASE}/excel/export/${sessionId}`;
 window.open(url, '_blank');
}

export function useDashboardOverview() {
 return useQuery<DashboardOverview>({
 queryKey: EXAM_QUERY_KEYS.dashboard(),
 queryFn: async () => {
 const response = await fetchWithSchool(`${API_BASE}/dashboard/overview`);
 if (!response.ok) throw new Error('Dashboard verileri yüklenemedi');
 const data: ExamManagementApiResponse<DashboardOverview> = await response.json();
 if (!data.data) throw new Error('Dashboard verileri bulunamadı');
 return data.data;
 },
 staleTime: 5 * 60 * 1000,
 refetchOnWindowFocus: false,
 });
}

export function useSessionComparison() {
 return useMutation({
 mutationFn: async (params: { 
 sessionIds: string[]; 
 comparisonType?: 'overall' | 'subject' | 'student';
 }) => {
 const response = await fetchWithSchool(`${API_BASE}/comparison/sessions`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 sessionIds: params.sessionIds,
 comparisonType: params.comparisonType || 'overall'
 }),
 });
 if (!response.ok) throw new Error('Karşılaştırma yapılamadı');
 const data: ExamManagementApiResponse<SessionComparison> = await response.json();
 if (!data.data) throw new Error('Karşılaştırma verileri bulunamadı');
 return data.data;
 },
 });
}

export function useTrendAnalysis(examTypeId: string | undefined, period: 'last_6' | 'last_12' | 'all' = 'last_6') {
 return useQuery<TrendAnalysis>({
 queryKey: EXAM_QUERY_KEYS.trend(examTypeId, period),
 queryFn: async () => {
 if (!examTypeId) throw new Error('Sınav türü gerekli');
 const response = await fetchWithSchool(`${API_BASE}/trend/${examTypeId}?period=${period}`);
 if (!response.ok) throw new Error('Trend analizi yapılamadı');
 const data: ExamManagementApiResponse<TrendAnalysis> = await response.json();
 if (!data.data) throw new Error('Trend analizi bulunamadı');
 return data.data;
 },
 enabled: !!examTypeId,
 staleTime: 10 * 60 * 1000,
 });
}

export function useStudentRiskAnalysis(studentId: string | undefined) {
 return useQuery({
 queryKey: EXAM_QUERY_KEYS.aiRisk(studentId),
 queryFn: async () => {
 if (!studentId) throw new Error('Öğrenci ID gerekli');
 const response = await fetchWithSchool(`${API_BASE}/ai/risk/${studentId}`);
 if (!response.ok) throw new Error('Risk analizi yapılamadı');
 const data = await response.json();
 return data.data;
 },
 enabled: !!studentId,
 staleTime: 10 * 60 * 1000,
 });
}

export function useWeakSubjectsAnalysis(studentId: string | undefined) {
 return useQuery({
 queryKey: EXAM_QUERY_KEYS.aiWeakSubjects(studentId),
 queryFn: async () => {
 if (!studentId) throw new Error('Öğrenci ID gerekli');
 const response = await fetchWithSchool(`${API_BASE}/ai/weak-subjects/${studentId}`);
 if (!response.ok) throw new Error('Zayıf konu analizi yapılamadı');
 const data = await response.json();
 return data.data;
 },
 enabled: !!studentId,
 staleTime: 10 * 60 * 1000,
 });
}

export function useSessionRecommendations(sessionId: string | undefined) {
 return useQuery({
 queryKey: EXAM_QUERY_KEYS.aiRecommendations(sessionId),
 queryFn: async () => {
 if (!sessionId) throw new Error('Deneme ID gerekli');
 const response = await fetchWithSchool(`${API_BASE}/ai/recommendations/${sessionId}`);
 if (!response.ok) throw new Error('Öneri oluşturulamadı');
 const data = await response.json();
 return data.data;
 },
 enabled: !!sessionId,
 staleTime: 10 * 60 * 1000,
 });
}
