import { apiClient } from '../core/client';

export interface StudentAnalytics {
 studentId: string;
 studentName: string;
 className: string;
 riskScore: number;
 riskLevel: 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik';
 successProbability: number;
 attendanceRate: number;
 academicTrend: number;
 studyConsistency: number;
 earlyWarnings: EarlyWarning[];
}

export interface EarlyWarning {
 studentName: string;
 warningType: 'attendance' | 'academic' | 'behavioral';
 severity: 'düşük' | 'orta' | 'yüksek' | 'kritik';
 message: string;
 priority: number;
}

export interface ClassComparison {
 className: string;
 studentCount: number;
 averageGPA: number;
 attendanceRate: number;
 riskDistribution: { düşük: number; orta: number; yüksek: number };
}

export interface ReportsOverview {
 totalStudents: number;
 riskDistribution: {
 düşük: number;
 orta: number;
 yüksek: number;
 kritik: number;
 };
 classComparisons: ClassComparison[];
 topWarnings: EarlyWarning[];
 studentAnalytics: StudentAnalytics[];
}

export interface CacheStats {
 total: number;
 expired: number;
 number;
 byType: Array<{ cache_type: string; count: number }>;
}

export async function getReportsOverview(): Promise<ReportsOverview> {
 return apiClient.get<ReportsOverview>('/api/analytics/reports-overview');
}

export async function getStudentAnalytics(studentId: string): Promise<StudentAnalytics> {
 return apiClient.get<StudentAnalytics>(`/api/analytics/student/${studentId}`);
}

export async function invalidateAnalyticsCache(): Promise<{ message: string }> {
 return apiClient.post<{ message: string }>('/api/analytics/invalidate-cache');
}

export async function getCacheStats(): Promise<CacheStats> {
 return apiClient.get<CacheStats>('/api/analytics/cache-stats');
}
