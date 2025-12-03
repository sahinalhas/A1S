import {
 Student,
 AcademicRecord,
 AttendanceRecord,
 TopicProgress,
 StudySession,
 SurveyResult,
 Achievement,
 SmartGoal,
 SelfAssessment,
 loadStudents,
 getAcademicsByStudent,
 getAttendanceByStudent,
 getProgressByStudent,
 getSessionsByStudent,
 getSurveyResultsByStudent,
 getAchievementsByStudent,
 getSmartGoalsByStudent,
 getSelfAssessmentsByStudent,
} from "./storage";

import {
 analyticsCache,
 memoize,
 performanceMonitor,
} from "./analytics-cache";
import { ANALYTICS_THRESHOLDS, ANALYTICS_WEIGHTS, ANALYTICS_DEFAULTS, RISK_LEVEL_MAP, WARNING_PRIORITY } from "./constants/analytics.constants";
import { ANALYTICS_MESSAGES } from "./constants/messages.constants";

// =================== TYP TANIMLARI ===================

export interface StudentAnalytics {
 studentId: string;
 academicTrend: number;
 attendanceRate: number;
 studyConsistency: number;
 riskScore: number;
 predictedSuccess: number;
 strengths: string[];
 weaknesses: string[];
 recommendations: string[];
}

export interface ClassComparison {
 class: string;
 studentCount: number;
 averageGPA: number;
 attendanceRate: number;
 riskDistribution: { düşük: number; orta: number; yüksek: number };
 topPerformers: string[];
 atRiskStudents: string[];
}

export interface ProgressTrend {
 date: string;
 value: number;
 type: 'academic' | 'attendance' | 'study' | 'wellbeing';
}

export interface EarlyWarning {
 studentId: string;
 studentName: string;
 warningType: 'attendance' | 'academic' | 'behavioral' | 'wellbeing';
 severity: 'düşük' | 'orta' | 'yüksek' | 'kritik';
 message: string;
 recommendations: string[];
 since: string;
 priority: number;
}

// =================== İSTATİSTİKSEL HESAPLAMALAR ===================

export function calculateMean(values: number[]): number {
 if (values.length === 0) return 0;
 return values.reduce((sum, val) => sum + val, 0) / values.length;
}

export function calculateStandardDeviation(values: number[]): number {
 if (values.length === 0) return 0;
 const mean = calculateMean(values);
 const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
 return Math.sqrt(calculateMean(squaredDiffs));
}

export function calculateTrend(values: number[]): number {
 if (values.length < 2) return 0;
 
 const n = values.length;
 const x = Array.from({length: n}, (_, i) => i + 1);
 const y = values;
 
 const sumX = x.reduce((sum, val) => sum + val, 0);
 const sumY = y.reduce((sum, val) => sum + val, 0);
 const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
 const sumXX = x.reduce((sum, val) => sum + val * val, 0);
 
 const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
 
 return Math.max(-1, Math.min(1, slope / Math.max(...values)));
}

export function calculatePercentile(values: number[], percentile: number): number {
 if (values.length === 0) return 0;
 const sorted = [...values].sort((a, b) => a - b);
 const index = (percentile / 100) * (sorted.length - 1);
 const lower = Math.floor(index);
 const upper = Math.ceil(index);
 
 if (lower === upper) return sorted[lower];
 
 const weight = index - lower;
 return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

// =================== VERİ İŞLEME FONKSİYONLARI ===================

export async function getStudentPerformanceData(studentId: string) {
 const [academics, attendance, studySessions, surveys, achievements, goals, assessments] = await Promise.all([
 getAcademicsByStudent(studentId),
 getAttendanceByStudent(studentId),
 getSessionsByStudent(studentId),
 getSurveyResultsByStudent(studentId),
 getAchievementsByStudent(studentId),
 getSmartGoalsByStudent(studentId),
 getSelfAssessmentsByStudent(studentId),
 ]);

 const topicProgress = getProgressByStudent(studentId);

 return {
 academics,
 attendance,
 topicProgress,
 studySessions,
 surveys,
 achievements,
 goals,
 assessments,
 };
}

export function calculateAttendanceRate(attendance: AttendanceRecord[]): number {
 if (attendance.length === 0) return 1;
 const presentCount = attendance.filter(a => a.status ==="Var").length;
 return presentCount / attendance.length;
}

export function calculateAcademicTrend(academics: AcademicRecord[]): number {
 if (academics.length < 2) return 0;
 
 const gpaValues = academics
 .filter(a => a.gpa !== undefined)
 .sort((a, b) => a.term.localeCompare(b.term))
 .map(a => a.gpa!);
 
 return calculateTrend(gpaValues);
}

export function calculateStudyConsistency(sessions: StudySession[]): number {
 if (sessions.length === 0) return 0;

 const thirtyDaysAgo = new Date();
 thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - ANALYTICS_DEFAULTS.STUDY_PERIOD_DAYS);
 
 const recentSessions = sessions.filter(s => 
 new Date(s.date) >= thirtyDaysAgo
 );

 if (recentSessions.length === 0) return 0;

 const dailyStudyTime = new Map<string, number>();
 
 recentSessions.forEach(session => {
 const date = session.date.split('T')[0];
 const current = dailyStudyTime.get(date) || 0;
 dailyStudyTime.set(date, current + (session.minutes || 0));
 });

 const studyDays = dailyStudyTime.size;
 const totalDays = ANALYTICS_DEFAULTS.STUDY_PERIOD_DAYS;
 
 return Math.min(1, studyDays / totalDays);
}

// =================== RİSK DEĞERLENDİRMESİ ===================

async function _calculateRiskScore(studentId: string): Promise<number> {
 const data = await getStudentPerformanceData(studentId);
 const student = loadStudents().find(s => s.id === studentId);
 
 if (!student) return 0;

 let riskScore = 0;
 let factors = 0;

 const attendanceRate = calculateAttendanceRate(data.attendance);
 if (attendanceRate < ANALYTICS_THRESHOLDS.ATTENDANCE.GOOD) {
 riskScore += (ANALYTICS_THRESHOLDS.ATTENDANCE.GOOD - attendanceRate) * ANALYTICS_WEIGHTS.RISK_FACTORS.ATTENDANCE;
 factors++;
 }

 const academicTrend = calculateAcademicTrend(data.academics);
 if (academicTrend < ANALYTICS_THRESHOLDS.ACADEMIC_TREND.NEGATIVE) {
 riskScore += Math.abs(academicTrend) * ANALYTICS_WEIGHTS.RISK_FACTORS.ACADEMIC;
 factors++;
 }

 const studyConsistency = calculateStudyConsistency(data.studySessions);
 if (studyConsistency < ANALYTICS_THRESHOLDS.STUDY_CONSISTENCY.GOOD) {
 riskScore += (ANALYTICS_THRESHOLDS.STUDY_CONSISTENCY.GOOD - studyConsistency) * ANALYTICS_WEIGHTS.RISK_FACTORS.STUDY;
 factors++;
 }

 if (student.risk) {
 riskScore += RISK_LEVEL_MAP[student.risk] || 0;
 factors++;
 }

 const recentSurveys = data.surveys.slice(-ANALYTICS_DEFAULTS.RECENT_SURVEY_COUNT);
 const lowScores = recentSurveys.filter(s => s.score && s.score < ANALYTICS_THRESHOLDS.SURVEY_SCORE.LOW);
 if (lowScores.length > 0) {
 riskScore += (lowScores.length / recentSurveys.length) * 0.5;
 factors++;
 }

 return factors > 0 ? Math.min(1, riskScore / factors) : 0;
}

export const calculateRiskScore = memoize(
 _calculateRiskScore,
 (studentId: string) => `riskScore:${studentId}`
);

// =================== PREDİKTİF ANALİZ ===================

async function _predictStudentSuccess(studentId: string): Promise<number> {
 const data = await getStudentPerformanceData(studentId);
 const student = loadStudents().find(s => s.id === studentId);
 
 if (!student) return 0.5;

 let successScore = 0.5;
 let weightedFactors = 0;

 const academicTrend = calculateAcademicTrend(data.academics);
 successScore += academicTrend * ANALYTICS_WEIGHTS.SUCCESS_PREDICTION.ACADEMIC_TREND;
 weightedFactors += ANALYTICS_WEIGHTS.SUCCESS_PREDICTION.ACADEMIC_TREND;

 const attendanceRate = calculateAttendanceRate(data.attendance);
 successScore += attendanceRate * ANALYTICS_WEIGHTS.SUCCESS_PREDICTION.ATTENDANCE;
 weightedFactors += ANALYTICS_WEIGHTS.SUCCESS_PREDICTION.ATTENDANCE;

 const studyConsistency = calculateStudyConsistency(data.studySessions);
 successScore += studyConsistency * ANALYTICS_WEIGHTS.SUCCESS_PREDICTION.STUDY_CONSISTENCY;
 weightedFactors += ANALYTICS_WEIGHTS.SUCCESS_PREDICTION.STUDY_CONSISTENCY;

 const completedTopics = data.topicProgress.filter(tp => tp.completed).length;
 const totalTopics = data.topicProgress.length;
 const completionRate = totalTopics > 0 ? completedTopics / totalTopics : 0.5;
 successScore += completionRate * ANALYTICS_WEIGHTS.SUCCESS_PREDICTION.COMPLETION_RATE;
 weightedFactors += ANALYTICS_WEIGHTS.SUCCESS_PREDICTION.COMPLETION_RATE;

 const activeGoals = data.goals.filter(g => 
 g.status ==="Başladı" || g.status ==="Devam"
 ).length;
 const goalFactor = Math.min(1, activeGoals / ANALYTICS_DEFAULTS.ACTIVE_GOALS_TARGET);
 successScore += goalFactor * ANALYTICS_WEIGHTS.SUCCESS_PREDICTION.GOALS;
 weightedFactors += ANALYTICS_WEIGHTS.SUCCESS_PREDICTION.GOALS;

 return Math.max(0, Math.min(1, successScore));
}

export const predictStudentSuccess = memoize(
 _predictStudentSuccess,
 (studentId: string) => `predictSuccess:${studentId}`
);

// =================== ERKEN UYARI SİSTEMİ ===================

async function _generateEarlyWarnings(): Promise<EarlyWarning[]> {
 const students = loadStudents();
 const warnings: EarlyWarning[] = [];

 for (const student of students) {
 const data = await getStudentPerformanceData(student.id);
 const fullName = `${student.name} ${student.surname}`;

 const attendanceRate = calculateAttendanceRate(data.attendance);
 if (attendanceRate < ANALYTICS_THRESHOLDS.ATTENDANCE.RISK) {
 warnings.push({
 studentId: student.id,
 studentName: fullName,
 warningType: 'attendance',
 severity: attendanceRate < ANALYTICS_THRESHOLDS.ATTENDANCE.CRITICAL ? 'kritik' : 'yüksek',
 message: `${ANALYTICS_MESSAGES.WARNINGS.ATTENDANCE_ISSUE} %${Math.round((1-attendanceRate) * 100)}`,
 recommendations: [
 ANALYTICS_MESSAGES.RECOMMENDATIONS.PARENT_MEETING,
 ANALYTICS_MESSAGES.RECOMMENDATIONS.INVESTIGATE_CAUSES,
 ANALYTICS_MESSAGES.RECOMMENDATIONS.ADAPTATION_PROGRAM
 ],
 since: new Date().toISOString(),
 priority: attendanceRate < ANALYTICS_THRESHOLDS.ATTENDANCE.CRITICAL ? WARNING_PRIORITY.CRITICAL : WARNING_PRIORITY.HIGH
 });
 }

 const academicTrend = calculateAcademicTrend(data.academics);
 if (academicTrend < ANALYTICS_THRESHOLDS.ACADEMIC_TREND.CRITICAL) {
 warnings.push({
 studentId: student.id,
 studentName: fullName,
 warningType: 'academic',
 severity: academicTrend < ANALYTICS_THRESHOLDS.ACADEMIC_TREND.SEVERE ? 'kritik' : 'yüksek',
 message: ANALYTICS_MESSAGES.WARNINGS.ACADEMIC_DECLINE,
 recommendations: [
 ANALYTICS_MESSAGES.RECOMMENDATIONS.INDIVIDUAL_SUPPORT,
 ANALYTICS_MESSAGES.RECOMMENDATIONS.LEARNING_ASSESSMENT,
 ANALYTICS_MESSAGES.RECOMMENDATIONS.CURRICULUM_REVIEW
 ],
 since: new Date().toISOString(),
 priority: academicTrend < ANALYTICS_THRESHOLDS.ACADEMIC_TREND.SEVERE ? WARNING_PRIORITY.CRITICAL : WARNING_PRIORITY.HIGH
 });
 }

 const studyConsistency = calculateStudyConsistency(data.studySessions);
 if (studyConsistency < ANALYTICS_THRESHOLDS.STUDY_CONSISTENCY.RISK) {
 warnings.push({
 studentId: student.id,
 studentName: fullName,
 warningType: 'behavioral',
 severity: studyConsistency < ANALYTICS_THRESHOLDS.STUDY_CONSISTENCY.CRITICAL ? 'yüksek' : 'orta',
 message: ANALYTICS_MESSAGES.WARNINGS.INCONSISTENT_ROUTINE,
 recommendations: [
 ANALYTICS_MESSAGES.RECOMMENDATIONS.CREATE_STUDY_PLAN,
 ANALYTICS_MESSAGES.RECOMMENDATIONS.MOTIVATION_ACTIVITIES,
 ANALYTICS_MESSAGES.RECOMMENDATIONS.TIME_MANAGEMENT
 ],
 since: new Date().toISOString(),
 priority: studyConsistency < ANALYTICS_THRESHOLDS.STUDY_CONSISTENCY.CRITICAL ? WARNING_PRIORITY.HIGH : WARNING_PRIORITY.MEDIUM
 });
 }

 const riskScore = await calculateRiskScore(student.id);
 if (riskScore > ANALYTICS_THRESHOLDS.RISK_SCORE.HIGH) {
 warnings.push({
 studentId: student.id,
 studentName: fullName,
 warningType: 'wellbeing',
 severity: 'kritik',
 message: ANALYTICS_MESSAGES.WARNINGS.MULTIPLE_RISKS,
 recommendations: [
 ANALYTICS_MESSAGES.RECOMMENDATIONS.COMPREHENSIVE_EVALUATION,
 ANALYTICS_MESSAGES.RECOMMENDATIONS.MULTIDISCIPLINARY_MEETING,
 ANALYTICS_MESSAGES.RECOMMENDATIONS.EMERGENCY_PLAN
 ],
 since: new Date().toISOString(),
 priority: WARNING_PRIORITY.CRITICAL
 });
 }
 }

 return warnings.sort((a, b) => a.priority - b.priority);
}

export const generateEarlyWarnings = memoize(
 _generateEarlyWarnings,
 () => 'earlyWarnings:all'
);

// =================== STUDENT ANALYTICS ===================

async function _analyzeStudent(studentId: string): Promise<StudentAnalytics> {
 const data = await getStudentPerformanceData(studentId);
 const student = loadStudents().find(s => s.id === studentId);
 
 if (!student) {
 throw new Error(`Student not found: ${studentId}`);
 }

 const academicTrend = calculateAcademicTrend(data.academics);
 const attendanceRate = calculateAttendanceRate(data.attendance);
 const studyConsistency = calculateStudyConsistency(data.studySessions);
 const riskScore = await calculateRiskScore(studentId);
 const predictedSuccess = await predictStudentSuccess(studentId);

 const strengths: string[] = [];
 const weaknesses: string[] = [];
 const recommendations: string[] = [];

 if (attendanceRate > ANALYTICS_THRESHOLDS.ATTENDANCE.EXCELLENT) strengths.push(ANALYTICS_MESSAGES.STRENGTHS.EXCELLENT_ATTENDANCE);
 else if (attendanceRate < ANALYTICS_THRESHOLDS.ATTENDANCE.RISK) weaknesses.push(ANALYTICS_MESSAGES.WEAKNESSES.LOW_ATTENDANCE);

 if (academicTrend > ANALYTICS_THRESHOLDS.ACADEMIC_TREND.POSITIVE) strengths.push(ANALYTICS_MESSAGES.STRENGTHS.POSITIVE_TREND);
 else if (academicTrend < ANALYTICS_THRESHOLDS.ACADEMIC_TREND.NEGATIVE) weaknesses.push(ANALYTICS_MESSAGES.WEAKNESSES.NEGATIVE_TREND);

 if (studyConsistency > ANALYTICS_THRESHOLDS.STUDY_CONSISTENCY.EXCELLENT) strengths.push(ANALYTICS_MESSAGES.STRENGTHS.CONSISTENT_STUDY);
 else if (studyConsistency < ANALYTICS_THRESHOLDS.STUDY_CONSISTENCY.RISK) weaknesses.push(ANALYTICS_MESSAGES.WEAKNESSES.INCONSISTENT_STUDY);

 if (riskScore > ANALYTICS_THRESHOLDS.RISK_SCORE.HIGH) recommendations.push(ANALYTICS_MESSAGES.RECOMMENDATIONS.URGENT_INTERVENTION);
 else if (riskScore > ANALYTICS_THRESHOLDS.RISK_SCORE.MEDIUM) recommendations.push(ANALYTICS_MESSAGES.RECOMMENDATIONS.PREVENTIVE_MEASURES);

 if (attendanceRate < ANALYTICS_THRESHOLDS.ATTENDANCE.GOOD) recommendations.push(ANALYTICS_MESSAGES.RECOMMENDATIONS.INVESTIGATE_ABSENCE);
 if (academicTrend < ANALYTICS_THRESHOLDS.ACADEMIC_TREND.NEGATIVE) recommendations.push(ANALYTICS_MESSAGES.RECOMMENDATIONS.ACADEMIC_SUPPORT);
 if (studyConsistency < ANALYTICS_THRESHOLDS.STUDY_CONSISTENCY.GOOD) recommendations.push(ANALYTICS_MESSAGES.RECOMMENDATIONS.STUDY_PLAN);

 return {
 studentId,
 academicTrend,
 attendanceRate,
 studyConsistency,
 riskScore,
 predictedSuccess,
 strengths,
 weaknesses,
 recommendations,
 };
}

export const analyzeStudent = memoize(
 _analyzeStudent,
 (studentId: string) => `studentAnalytics:${studentId}`
);

// =================== CLASS COMPARISON ===================

export async function generateClassComparisons(options: {
 includePersonalData?: boolean;
} = {}): Promise<ClassComparison[]> {
 const students = loadStudents();
 const classMap = new Map<string, Student[]>();

 students.forEach(student => {
 const className = student.class || ANALYTICS_MESSAGES.DEFAULT_CLASS_NAME;
 if (!classMap.has(className)) {
 classMap.set(className, []);
 }
 classMap.get(className)!.push(student);
 });

 const comparisons: ClassComparison[] = [];

 for (const [className, classStudents] of classMap.entries()) {
 const academicDataPromises = classStudents.map(s => getAcademicsByStudent(s.id));
 const attendanceDataPromises = classStudents.map(s => getAttendanceByStudent(s.id));
 
 const [academicData, attendanceData] = await Promise.all([
 Promise.all(academicDataPromises),
 Promise.all(attendanceDataPromises)
 ]);

 const allGPAs = academicData
 .flat()
 .filter(a => a.gpa !== undefined)
 .map(a => a.gpa!);
 const averageGPA = allGPAs.length > 0 ? calculateMean(allGPAs) : 0;

 const allAttendance = attendanceData.flat();
 const attendanceRate = calculateAttendanceRate(allAttendance);

 const riskDistribution = {
 düşük: classStudents.filter(s => s.risk ==="Düşük").length,
 orta: classStudents.filter(s => s.risk ==="Orta").length,
 yüksek: classStudents.filter(s => s.risk ==="Yüksek").length,
 };

 const topPerformers: string[] = [];
 const atRiskStudents: string[] = [];

 for (const student of classStudents) {
 const analytics = await analyzeStudent(student.id);
 if (analytics.predictedSuccess > ANALYTICS_THRESHOLDS.PREDICTED_SUCCESS.HIGH) {
 topPerformers.push(options.includePersonalData ? 
 `${student.name} ${student.surname}` : 
 `Öğrenci ${student.id.slice(-4)}`
 );
 }
 if (analytics.riskScore > ANALYTICS_THRESHOLDS.RISK_SCORE.HIGH) {
 atRiskStudents.push(options.includePersonalData ? 
 `${student.name} ${student.surname}` : 
 `Öğrenci ${student.id.slice(-4)}`
 );
 }
 }

 comparisons.push({
 class: className,
 studentCount: classStudents.length,
 averageGPA,
 attendanceRate,
 riskDistribution,
 topPerformers: topPerformers.slice(0, ANALYTICS_DEFAULTS.TOP_PERFORMERS_LIMIT),
 atRiskStudents: atRiskStudents.slice(0, ANALYTICS_DEFAULTS.AT_RISK_LIMIT),
 });
 }

 return comparisons.sort((a, b) => b.averageGPA - a.averageGPA);
}

// =================== PROGRESS TIMELINE ===================

export function generateProgressTimeline(studentId: string): ProgressTrend[] {
 const progress = getProgressByStudent(studentId);
 const sessions = [];
 
 const dateMap = new Map<string, { total: number; count: number }>();
 
 progress.forEach(p => {
 if (p.completed) {
 const date = new Date().toISOString().split('T')[0];
 if (!dateMap.has(date)) {
 dateMap.set(date, { total: 0, count: 0 });
 }
 const entry = dateMap.get(date)!;
 entry.count += 1;
 }
 });
 
 const timeline: ProgressTrend[] = [];
 const sortedDates = Array.from(dateMap.keys()).sort();
 
 let cumulative = 0;
 sortedDates.forEach(date => {
 const entry = dateMap.get(date)!;
 cumulative += entry.count;
 timeline.push({
 date,
 value: cumulative,
 type: 'academic'
 });
 });
 
 return timeline;
}

// =================== EXPORT DATA ===================

export async function exportAnalyticsData(options: {
 includePersonalData?: boolean;
} = {}): Promise<any[]> {
 const students = loadStudents();
 const exportData: unknown[] = [];

 for (const student of students) {
 const [analytics, attendance, academics] = await Promise.all([
 analyzeStudent(student.id),
 getAttendanceByStudent(student.id),
 getAcademicsByStudent(student.id)
 ]);

 exportData.push({
 name: options.includePersonalData ? `${student.name} ${student.surname}` : `Öğrenci ${student.id.slice(-4)}`,
 class: student.class,
 risk: student.risk,
 attendanceRate: calculateAttendanceRate(attendance),
 academicTrend: calculateAcademicTrend(academics),
 studyConsistency: analytics.studyConsistency,
 riskScore: analytics.riskScore,
 predictedSuccess: analytics.predictedSuccess,
 });
 }

 return exportData;
}
