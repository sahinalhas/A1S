import { 
  refreshAnalyticsSnapshot, 
  getSnapshotData, 
  snapshotToStudentAnalytics,
  type SnapshotData
} from '../repository/analytics-snapshot.repository.js';
import { getCachedData, setCachedData, cleanupExpiredCache, invalidateCache } from '../repository/cache.repository.js';

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

export interface ClassComparison {
  className: string;
  studentCount: number;
  averageGPA: number;
  attendanceRate: number;
  riskDistribution: { düşük: number; orta: number; yüksek: number };
}

/**
 * Get reports overview for a specific school
 * @param studentIds - Required array of student IDs for school isolation
 */
export async function getReportsOverview(studentIds: string[]): Promise<ReportsOverview> {
  if (!studentIds || studentIds.length === 0) {
    return {
      totalStudents: 0,
      riskDistribution: { düşük: 0, orta: 0, yüksek: 0, kritik: 0 },
      classComparisons: [],
      topWarnings: [],
      studentAnalytics: []
    };
  }
  
  cleanupExpiredCache();

  const cacheKey = `reports_overview_v2_${studentIds.slice(0, 5).join('_')}`;
  const cached = getCachedData(cacheKey);

  if (cached) {
    try {
      const parsed = JSON.parse(cached.data);
      if (parsed && typeof parsed === 'object') {
        return parsed as ReportsOverview;
      }
    } catch (error) {
      console.error('Failed to parse cached analytics data:', error);
      invalidateCache();
    }
  }

  const snapshots = getSnapshotData(undefined, studentIds);

  if (snapshots.length === 0) {
    refreshAnalyticsSnapshot();
    const newSnapshots = getSnapshotData(undefined, studentIds);
    return buildReportsFromSnapshots(newSnapshots, cacheKey);
  }

  const oldestSnapshot = snapshots.reduce((oldest, current) => {
    return new Date(current.last_updated) < new Date(oldest.last_updated) ? current : oldest;
  }, snapshots[0]);

  const age = Date.now() - new Date(oldestSnapshot.last_updated).getTime();
  const maxAge = 10 * 60 * 1000;

  if (age > maxAge) {
    refreshAnalyticsSnapshot();
    const freshSnapshots = getSnapshotData(undefined, studentIds);
    return buildReportsFromSnapshots(freshSnapshots, cacheKey);
  }

  return buildReportsFromSnapshots(snapshots, cacheKey);
}

export async function getReportsOverviewBySchool(schoolId: string): Promise<ReportsOverview> {
  const studentRepo = require('../../students/repository/students.repository.js');
  const students = studentRepo.loadStudentsBySchool(schoolId);
  const studentIds = students.map((s: any) => s.id);
  
  return getReportsOverview(studentIds);
}

export async function getStudentAnalytics(studentId: string): Promise<StudentAnalytics | null> {
  const cacheKey = `student_analytics_v2_${studentId}`;
  const cached = getCachedData(cacheKey);

  if (cached) {
    try {
      const parsed = JSON.parse(cached.data);
      // Basic validation for student analytics structure
      if (parsed && typeof parsed === 'object' && parsed.studentId === studentId) {
        return parsed as StudentAnalytics;
      }
    } catch (error) {
      console.error(`Failed to parse cached student analytics for ${studentId}:`, error);
      // Invalidate corrupt cache
      invalidateCache(); // Consider invalidating cache for this specific studentId if possible
    }
  }

  const snapshots = getSnapshotData(studentId);

  if (snapshots.length === 0) {
    refreshAnalyticsSnapshot();
    const freshSnapshots = getSnapshotData(studentId);
    if (freshSnapshots.length === 0) return null;

    const analytics = snapshotToStudentAnalytics(freshSnapshots[0]);
    setCachedData(cacheKey, 'student_analytics', analytics, { ttlMinutes: 15 });
    return analytics;
  }

  const analytics = snapshotToStudentAnalytics(snapshots[0]);
  setCachedData(cacheKey, 'student_analytics', analytics, { ttlMinutes: 15 });
  return analytics;
}

function buildReportsFromSnapshots(snapshots: SnapshotData[], cacheKey: string): ReportsOverview {
  const studentAnalytics: StudentAnalytics[] = snapshots.map(snapshotToStudentAnalytics);

  const riskDistribution = {
    düşük: snapshots.filter(s => s.risk_level === 'Düşük').length,
    orta: snapshots.filter(s => s.risk_level === 'Orta').length,
    yüksek: snapshots.filter(s => s.risk_level === 'Yüksek').length,
    kritik: snapshots.filter(s => s.risk_level === 'Kritik').length
  };

  const classMap = new Map<string, { students: SnapshotData[]; totalGPA: number; totalAttendance: number }>();

  for (const snapshot of snapshots) {
    const className = snapshot.class_name || 'Belirtilmemiş';
    if (!classMap.has(className)) {
      classMap.set(className, { students: [], totalGPA: 0, totalAttendance: 0 });
    }
    const classData = classMap.get(className)!;
    classData.students.push(snapshot);
    classData.totalGPA += snapshot.avg_exam_score || 0;
    classData.totalAttendance += snapshot.attendance_rate;
  }

  const classComparisons: ClassComparison[] = Array.from(classMap.entries()).map(([className, data]) => ({
    className,
    studentCount: data.students.length,
    averageGPA: Math.round((data.totalGPA / data.students.length) * 100) / 100,
    attendanceRate: Math.round(data.totalAttendance / data.students.length),
    riskDistribution: {
      düşük: data.students.filter(s => s.risk_level === 'Düşük').length,
      orta: data.students.filter(s => s.risk_level === 'Orta').length,
      yüksek: data.students.filter(s => s.risk_level === 'Yüksek' || s.risk_level === 'Kritik').length
    }
  }));

  const allWarnings: EarlyWarning[] = [];
  for (const snapshot of snapshots) {
    if (snapshot.early_warnings) {
      try {
        const warnings = JSON.parse(snapshot.early_warnings);
        allWarnings.push(...warnings);
      } catch (e) {
        console.error('Error parsing warnings:', e);
      }
    }
  }

  const topWarnings = allWarnings
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 10);

  const result: ReportsOverview = {
    totalStudents: snapshots.length,
    riskDistribution,
    classComparisons,
    topWarnings,
    studentAnalytics
  };

  setCachedData(cacheKey, 'reports_overview', result, { ttlMinutes: 5 });

  return result;
}

export function forceRefreshAnalytics(): number {
  return refreshAnalyticsSnapshot();
}

export function invalidateAnalyticsCache(): void {
  invalidateCache();
}