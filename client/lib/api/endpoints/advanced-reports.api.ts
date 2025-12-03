/**
 * Advanced Reports API Client
 * Gelişmiş Raporlama API İstemcisi
 */

export interface SchoolStatistics {
 totalStudents: number;
 totalClasses: number;
 totalCounselors: number;
 totalSessions: number;
 riskDistribution: {
 low: number;
 medium: number;
 high: number;
 critical: number;
 };
 classDistribution: ClassDistribution[];
 genderDistribution: {
 male: number;
 female: number;
 other: number;
 };
 attendanceOverview: {
 average: number;
 excellent: number;
 good: number;
 poor: number;
 };
 academicOverview: {
 averageGPA: number;
 topPerformers: number;
 needsSupport: number;
 };
 lastUpdated: string;
}

export interface ClassDistribution {
 className: string;
 studentCount: number;
 maleCount: number;
 femaleCount: number;
 averageAge: number;
}

export interface ClassComparison {
 className: string;
 studentCount: number;
 averageGPA: number;
 attendanceRate: number;
 behaviorIncidents: number;
 counselingSessions: number;
 riskDistribution: {
 low: number;
 medium: number;
 high: number;
 critical: number;
 };
 topPerformers: StudentBrief[];
 atRiskStudents: StudentBrief[];
 strengths: string[];
 challenges: string[];
}

export interface StudentBrief {
 id: string;
 name: string;
 gpa?: number;
 riskLevel?: string;
 reason?: string;
}

export interface TrendData {
 period: string;
 date: string;
 academicAverage: number;
 attendanceRate: number;
 sessionCount: number;
 riskStudents: number;
 behaviorIncidents: number;
}

export interface TimeSeriesAnalysis {
 period: 'daily' | 'weekly' | 'monthly' | 'yearly';
 startDate: string;
 endDate: string;
 trends: TrendData[];
 insights: {
 improving: string[];
 declining: string[];
 stable: string[];
 };
 predictions: {
 nextPeriod: string;
 academicTrend: 'up' | 'down' | 'stable';
 riskTrend: 'up' | 'down' | 'stable';
 confidence: number;
 };
}

export interface ComprehensiveReport {
 reportId: string;
 generatedAt: string;
 generatedBy: string;
 reportType: 'school' | 'class' | 'student' | 'custom';
 schoolStats: SchoolStatistics;
 classComparisons: ClassComparison[];
 timeSeriesAnalysis: TimeSeriesAnalysis;
 aiInsights?: {
 summary: string;
 keyFindings: string[];
 recommendations: string[];
 actionItems: string[];
 };
}

export async function getSchoolStatistics(): Promise<SchoolStatistics> {
 const response = await fetch('/api/advanced-reports/school-stats');
 if (!response.ok) {
 throw new Error('Failed to fetch school statistics');
 }
 return response.json();
}

export async function getClassComparisons(classNames?: string[]): Promise<ClassComparison[]> {
 const params = classNames ? `?classes=${classNames.join(',')}` : '';
 const response = await fetch(`/api/advanced-reports/class-comparisons${params}`);
 if (!response.ok) {
 throw new Error('Failed to fetch class comparisons');
 }
 return response.json();
}

export async function compareClasses(class1: string, class2: string) {
 const response = await fetch(`/api/advanced-reports/compare/${encodeURIComponent(class1)}/${encodeURIComponent(class2)}`);
 if (!response.ok) {
 throw new Error('Failed to compare classes');
 }
 return response.json();
}

export async function getTrendAnalysis(
 period: 'daily' | 'weekly' | 'monthly' = 'monthly',
 startDate?: string,
 endDate?: string
): Promise<TimeSeriesAnalysis> {
 const params = new URLSearchParams({ period });
 if (startDate) params.append('startDate', startDate);
 if (endDate) params.append('endDate', endDate);
 
 const response = await fetch(`/api/advanced-reports/trends?${params}`);
 if (!response.ok) {
 throw new Error('Failed to fetch trend analysis');
 }
 return response.json();
}

export async function generateComprehensiveReport(
 generatedBy: string,
 options?: {
 includeAIAnalysis?: boolean;
 classNames?: string[];
 period?: 'daily' | 'weekly' | 'monthly';
 startDate?: string;
 endDate?: string;
 }
): Promise<ComprehensiveReport> {
 const response = await fetch('/api/advanced-reports/comprehensive', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ generatedBy, ...options }),
 });
 
 if (!response.ok) {
 throw new Error('Failed to generate comprehensive report');
 }
 return response.json();
}

export async function exportToExcel(
 generatedBy: string,
 options?: {
 includeAIAnalysis?: boolean;
 classNames?: string[];
 period?: 'daily' | 'weekly' | 'monthly';
 startDate?: string;
 endDate?: string;
 anonymize?: boolean;
 }
): Promise<{ success: boolean; reportId: string; filename: string; data: string }> {
 const response = await fetch('/api/advanced-reports/export/excel', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ generatedBy, ...options }),
 });
 
 if (!response.ok) {
 throw new Error('Failed to export to Excel');
 }
 return response.json();
}

export async function getAvailableClasses(): Promise<string[]> {
 const response = await fetch('/api/advanced-reports/available-classes');
 if (!response.ok) {
 throw new Error('Failed to fetch available classes');
 }
 return response.json();
}

export function downloadExcel(filename: string, base64Data: string) {
 const blob = base64ToBlob(base64Data, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = filename;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
}

function base64ToBlob(base64: string, contentType: string): Blob {
 const byteCharacters = atob(base64);
 const byteNumbers = new Array(byteCharacters.length);
 
 for (let i = 0; i < byteCharacters.length; i++) {
 byteNumbers[i] = byteCharacters.charCodeAt(i);
 }
 
 const byteArray = new Uint8Array(byteNumbers);
 return new Blob([byteArray], { type: contentType });
}
