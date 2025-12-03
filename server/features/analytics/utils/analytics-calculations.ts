import type { EarlyWarning } from '../services/analytics.service.js';

export function calculateAttendanceRate(attendanceTotal: number, presentCount: number): number {
  if (attendanceTotal === 0) return 100;
  return Math.round((presentCount / attendanceTotal) * 100);
}

export function calculateAcademicTrend(examDataJson: string | null | any[]): number {
  let exams: unknown[];
  
  if (!examDataJson) return 0;
  
  if (typeof examDataJson === 'string') {
    try {
      exams = JSON.parse(examDataJson);
    } catch {
      return 0;
    }
  } else if (Array.isArray(examDataJson)) {
    exams = examDataJson;
  } else {
    return 0;
  }
  
  if (!Array.isArray(exams) || exams.length < 2) return 0;
  
  const scores = exams
    .filter((e: any) => e && (e.score != null || e?.score !== undefined))
    .map((e: any) => e.score || 0)
    .slice(0, 5);
  
  if (scores.length < 2) return 0;
  
  let trend = 0;
  for (let i = 1; i < scores.length; i++) {
    trend += scores[i] - scores[i - 1];
  }
  
  return Math.round(trend / (scores.length - 1));
}

export function calculateRiskScore(
  attendanceRate: number,
  academicTrend: number,
  sessionCount: number
): number {
  let risk = 0;
  
  if (attendanceRate < 70) risk += 40;
  else if (attendanceRate < 85) risk += 20;
  else if (attendanceRate < 95) risk += 5;
  
  if (academicTrend < -10) risk += 30;
  else if (academicTrend < -5) risk += 15;
  else if (academicTrend < 0) risk += 5;
  
  if (sessionCount > 5) risk += 20;
  else if (sessionCount > 3) risk += 10;
  
  return Math.min(100, risk);
}

export function getRiskLevel(riskScore: number): 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik' {
  if (riskScore >= 70) return 'Kritik';
  if (riskScore >= 50) return 'Yüksek';
  if (riskScore >= 30) return 'Orta';
  return 'Düşük';
}

export function generateEarlyWarnings(
  studentName: string,
  attendanceRate: number,
  academicTrend: number,
  sessionCount: number
): EarlyWarning[] {
  const warnings: EarlyWarning[] = [];
  
  if (attendanceRate < 70) {
    warnings.push({
      studentName,
      warningType: 'attendance',
      severity: 'kritik',
      message: 'Devamsızlık oranı kritik seviyede',
      priority: 10
    });
  } else if (attendanceRate < 85) {
    warnings.push({
      studentName,
      warningType: 'attendance',
      severity: 'yüksek',
      message: 'Devamsızlık oranı yüksek',
      priority: 7
    });
  }
  
  if (academicTrend < -10) {
    warnings.push({
      studentName,
      warningType: 'academic',
      severity: 'kritik',
      message: 'Akademik performansta ciddi düşüş',
      priority: 9
    });
  } else if (academicTrend < -5) {
    warnings.push({
      studentName,
      warningType: 'academic',
      severity: 'yüksek',
      message: 'Akademik performansta düşüş',
      priority: 6
    });
  }
  
  if (sessionCount > 5) {
    warnings.push({
      studentName,
      warningType: 'behavioral',
      severity: 'yüksek',
      message: 'Sık görüşme ihtiyacı',
      priority: 5
    });
  }
  
  return warnings;
}

export function calculateStudyConsistency(sessionCount: number): number {
  return sessionCount > 0 ? 70 : 50;
}
