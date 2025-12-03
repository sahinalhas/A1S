/**
 * Live Profile Hook
 * Canlı öğrenci profili için React hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
 getStudentIdentity, 
 refreshStudentIdentity,
 getStudentSyncLogs,
 getSyncStatistics,
 type UnifiedStudentIdentity 
} from '@/lib/api/endpoints/profile-sync.api';

export function useLiveProfile(studentId: string) {
 const queryClient = useQueryClient();

 // Get student identity
 const { 
 data: identity, 
 isLoading, 
 error 
 } = useQuery<UnifiedStudentIdentity | null>({
 queryKey: ['live-profile', studentId],
 queryFn: () => getStudentIdentity(studentId),
 enabled: !!studentId,
 refetchInterval: 30000, // Auto-refresh every 30 seconds
 });

 // Refresh identity mutation
 const refreshMutation = useMutation({
 mutationFn: () => refreshStudentIdentity(studentId),
 onSuccess: () => {
 // Invalidate and refetch
 queryClient.invalidateQueries({ queryKey: ['live-profile', studentId] });
 },
 });

 // Get sync logs
 const { data: syncLogs = [] } = useQuery({
 queryKey: ['sync-logs', studentId],
 queryFn: () => getStudentSyncLogs(studentId, 50),
 enabled: !!studentId,
 });

 // Get statistics
 const { data: statistics } = useQuery({
 queryKey: ['sync-statistics', studentId],
 queryFn: () => getSyncStatistics(studentId),
 enabled: !!studentId,
 });

 return {
 identity,
 isLoading,
 error,
 syncLogs,
 statistics,
 refresh: refreshMutation.mutate,
 isRefreshing: refreshMutation.isPending,
 };
}
