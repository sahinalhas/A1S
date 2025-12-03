import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Student } from '../../../types/student.types';
import { apiClient } from '../../core/client';
import { API_ERROR_MESSAGES } from '../../../constants/messages.constants';
import { toast } from 'sonner';

const STUDENTS_QUERY_KEY = ['students'] as const;

async function fetchStudentsFromAPI(): Promise<Student[]> {
 const response = await apiClient.get<Student[]>('/api/students', { showErrorToast: false });
 return Array.isArray(response) ? response : [];
}

async function saveStudentToAPI(student: Student): Promise<void> {
 return apiClient.post('/api/students', student, { showErrorToast: false });
}

async function updateStudentOnAPI(student: Student): Promise<void> {
 return apiClient.post('/api/students', student, { showErrorToast: false });
}

async function deleteStudentFromAPI(id: string): Promise<void> {
 return apiClient.delete(`/api/students/${id}`, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.STUDENT.DELETE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.STUDENT.DELETE_ERROR,
 });
}

export function useStudents() {
 const query = useQuery({
 queryKey: STUDENTS_QUERY_KEY,
 queryFn: async () => {
 try {
 const students = await fetchStudentsFromAPI();
 return students;
 } catch (error) {
 console.error('Failed to load students:', error);
 toast.error(API_ERROR_MESSAGES.STUDENT.LOAD_ERROR, {
 description: API_ERROR_MESSAGES.STUDENT.LOAD_ERROR_DESCRIPTION,
 duration: 5000
 });
 throw error;
 }
 },
 staleTime: 5 * 60 * 1000,
 gcTime: 10 * 60 * 1000,
 retry: 2
 });

 return query;
}

export function useStudent(studentId: string) {
 const { data: students } = useStudents();
 return (students as Student[] | undefined)?.find(s => s.id === studentId);
}

export function useUpsertStudent() {
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: async (student: Student) => {
 const existingStudents = queryClient.getQueryData<Student[]>(STUDENTS_QUERY_KEY) || [];
 const exists = existingStudents.some(s => s.id === student.id);

 if (exists) {
 await updateStudentOnAPI(student);
 } else {
 await saveStudentToAPI(student);
 }
 },
 onMutate: async (newStudent) => {
 await queryClient.cancelQueries({ queryKey: STUDENTS_QUERY_KEY });

 const previousStudents = queryClient.getQueryData<Student[]>(STUDENTS_QUERY_KEY);

 queryClient.setQueryData<Student[]>(STUDENTS_QUERY_KEY, (old = []) => {
 const index = old.findIndex(s => s.id === newStudent.id);
 if (index >= 0) {
 const updated = [...old];
 updated[index] = { ...updated[index], ...newStudent };
 return updated;
 }
 return [newStudent, ...old];
 });

 return { previousStudents };
 },
 onError: (error, _student, context) => {
 console.error('Error upserting student:', error);
 
 if (context?.previousStudents) {
 queryClient.setQueryData(STUDENTS_QUERY_KEY, context.previousStudents);
 }

 toast.error(API_ERROR_MESSAGES.STUDENT.SAVE_ERROR, {
 description: API_ERROR_MESSAGES.STUDENT.SAVE_ERROR_DESCRIPTION,
 duration: 5000
 });
 },
 onSettled: () => {
 queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
 }
 });
}

export function useDeleteStudent() {
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: deleteStudentFromAPI,
 onMutate: async (studentId) => {
 await queryClient.cancelQueries({ queryKey: STUDENTS_QUERY_KEY });

 const previousStudents = queryClient.getQueryData<Student[]>(STUDENTS_QUERY_KEY);

 queryClient.setQueryData<Student[]>(STUDENTS_QUERY_KEY, (old = []) => {
 return old.filter(s => s.id !== studentId);
 });

 return { previousStudents };
 },
 onError: (error, _studentId, context) => {
 console.error('Error deleting student:', error);
 
 if (context?.previousStudents) {
 queryClient.setQueryData(STUDENTS_QUERY_KEY, context.previousStudents);
 }
 },
 onSettled: () => {
 queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
 }
 });
}

export function useRefreshStudents() {
 const queryClient = useQueryClient();

 return () => {
 queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
 toast.success('Öğrenciler yenilendi');
 };
}
