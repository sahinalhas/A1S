import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/core/client';
import type { Student } from '@/lib/storage';
import { QUERY_KEYS, getSelectedSchoolId } from '@/lib/school-context';

async function fetchStudents(): Promise<Student[]> {
 try {
 const response = await apiClient.get<Student[]>('/api/students', { 
 showErrorToast: false 
 });
 return response;
 } catch (error) {
 console.error('Error fetching students:', error);
 return [];
 }
}

export function useStudents() {
 const queryClient = useQueryClient();
 const schoolId = getSelectedSchoolId();
 
 const { data: students = [], isLoading, error, refetch } = useQuery({
 queryKey: QUERY_KEYS.students(schoolId),
 queryFn: fetchStudents,
 staleTime: 5 * 60 * 1000,
 gcTime: 10 * 60 * 1000,
 enabled: !!schoolId,
 });

 const invalidate = () => {
 queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students(schoolId) });
 };

 return {
 students,
 isLoading,
 error,
 refetch,
 invalidate,
 schoolId,
 };
}
