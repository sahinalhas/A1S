import type { RiskFactorData, RiskAnalysisResult } from '../../../../shared/types/early-warning.types';

export function calculateAcademicRiskScore(data: RiskFactorData['academicPerformance']): number {
  if (!data) return 0;
  
  let score = 0;
  
  if (data.gpa !== undefined) {
    if (data.gpa < 2.0) score += 40;
    else if (data.gpa < 2.5) score += 30;
    else if (data.gpa < 3.0) score += 20;
    else if (data.gpa < 3.5) score += 10;
  }
  
  if (data.recentExamScores && data.recentExamScores.length > 0) {
    const avgScore = data.recentExamScores.reduce((a, b) => a + b, 0) / data.recentExamScores.length;
    if (avgScore < 40) score += 30;
    else if (avgScore < 60) score += 20;
    else if (avgScore < 75) score += 10;
  }
  
  if (data.failingSubjects) {
    score += Math.min(data.failingSubjects * 15, 30);
  }
  
  if (data.gradeDecline) {
    score += 20;
  }
  
  return Math.min(score, 100);
}

export function calculateBehavioralRiskScore(data: RiskFactorData['behaviorData']): number {
  if (!data) return 0;
  
  let score = 0;
  
  if (data.seriousIncidents) {
    score += Math.min(data.seriousIncidents * 25, 60);
  }
  
  if (data.recentIncidentCount) {
    if (data.recentIncidentCount >= 5) score += 30;
    else if (data.recentIncidentCount >= 3) score += 20;
    else if (data.recentIncidentCount >= 1) score += 10;
  }
  
  if (data.totalIncidents && data.positiveCount !== undefined) {
    const negativeRatio = (data.totalIncidents - data.positiveCount) / data.totalIncidents;
    if (negativeRatio > 0.8) score += 20;
    else if (negativeRatio > 0.6) score += 15;
    else if (negativeRatio > 0.4) score += 10;
  }
  
  return Math.min(score, 100);
}

export function calculateAttendanceRiskScore(data: RiskFactorData['attendanceData']): number {
  if (!data) return 0;
  
  let score = 0;
  
  if (data.attendanceRate !== undefined) {
    if (data.attendanceRate < 50) score += 50;
    else if (data.attendanceRate < 70) score += 40;
    else if (data.attendanceRate < 85) score += 25;
    else if (data.attendanceRate < 90) score += 15;
  }
  
  if (data.absentDays && data.excusedAbsences !== undefined) {
    const unexcusedAbsences = data.absentDays - data.excusedAbsences;
    if (unexcusedAbsences > 10) score += 30;
    else if (unexcusedAbsences > 5) score += 20;
    else if (unexcusedAbsences > 2) score += 10;
  }
  
  if (data.tardyDays) {
    if (data.tardyDays > 15) score += 20;
    else if (data.tardyDays > 10) score += 15;
    else if (data.tardyDays > 5) score += 10;
  }
  
  return Math.min(score, 100);
}

export function calculateSocialEmotionalRiskScore(data: RiskFactorData['socialEmotionalData']): number {
  if (!data) return 0;
  
  let score = 0;
  
  if (data.counselingSessionCount) {
    if (data.counselingSessionCount > 10) score += 30;
    else if (data.counselingSessionCount > 5) score += 20;
    else if (data.counselingSessionCount > 2) score += 10;
  }
  
  if (data.recentConcerns && data.recentConcerns.length > 0) {
    score += Math.min(data.recentConcerns.length * 10, 40);
  }
  
  if (data.supportLevel === 'YÜK SEK' || data.supportLevel === 'KRİTİK') {
    score += 30;
  } else if (data.supportLevel === 'ORTA') {
    score += 15;
  }
  
  return Math.min(score, 100);
}

export function calculateOverallRiskScore(
  academicScore: number,
  behavioralScore: number,
  attendanceScore: number,
  socialEmotionalScore: number
): number {
  const weights = {
    academic: 0.35,
    behavioral: 0.30,
    attendance: 0.20,
    socialEmotional: 0.15
  };
  
  const overallScore = 
    (academicScore * weights.academic) +
    (behavioralScore * weights.behavioral) +
    (attendanceScore * weights.attendance) +
    (socialEmotionalScore * weights.socialEmotional);
  
  return Math.round(overallScore * 10) / 10;
}

export function getRiskLevel(score: number): 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK' {
  if (score >= 75) return 'KRİTİK';
  if (score >= 50) return 'YÜKSEK';
  if (score >= 25) return 'ORTA';
  return 'DÜŞÜK';
}

export function analyzeRiskFactors(data: RiskFactorData): RiskAnalysisResult {
  const academicScore = calculateAcademicRiskScore(data.academicPerformance);
  const behavioralScore = calculateBehavioralRiskScore(data.behaviorData);
  const attendanceScore = calculateAttendanceRiskScore(data.attendanceData);
  const socialEmotionalScore = calculateSocialEmotionalRiskScore(data.socialEmotionalData);
  
  const overallRiskScore = calculateOverallRiskScore(
    academicScore,
    behavioralScore,
    attendanceScore,
    socialEmotionalScore
  );
  
  const riskLevel = getRiskLevel(overallRiskScore);
  
  return {
    studentId: '',
    overallRiskScore,
    riskLevel,
    academicScore,
    behavioralScore,
    attendanceScore,
    socialEmotionalScore,
    alerts: [],
    recommendations: []
  };
}
