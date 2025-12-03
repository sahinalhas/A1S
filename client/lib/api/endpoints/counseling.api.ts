import { apiClient, createApiHandler } from '../core/client';

export interface StudentSessionHistory {
 sessionId: string;
 sessionDate: string;
 topic: string;
 sessionMode: string;
 duration: number;
}

export interface StudentSessionStats {
 sessionCount: number;
 lastSessionDate: string | null;
 topics: string[];
 history: StudentSessionHistory[];
}

export async function getStudentSessionHistory(studentId: string): Promise<StudentSessionStats> {
 return createApiHandler(
 async () => {
 const stats = await apiClient.get<StudentSessionStats>(
 `/api/counseling-sessions/analytics/student/${studentId}`,
 { showErrorToast: false }
 );
 return stats;
 },
 { sessionCount: 0, lastSessionDate: null, topics: [], history: [] },
 ''
 )();
}
