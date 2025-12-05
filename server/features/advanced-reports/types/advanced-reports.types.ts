/**
 * Advanced Reports Types
 * Gelişmiş Raporlama ve Görselleştirme Türleri
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
  class: string;
  studentCount: number;
  maleCount: number;
  femaleCount: number;
  averageAge: number;
}

export interface ClassComparison {
  class: string;
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

export interface ExportOptions {
  format: 'pdf' | 'excel';
  includeCharts: boolean;
  includeAIAnalysis: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  classes?: string[];
  riskLevels?: string[];
  anonymize?: boolean;
}
