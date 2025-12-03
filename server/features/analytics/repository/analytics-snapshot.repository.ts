import { getDatabase } from '../../../lib/database/connection.js';
import type { StudentAnalytics } from '../services/analytics.service.js';
import {
  calculateAcademicTrend,
  calculateRiskScore,
  getRiskLevel,
  generateEarlyWarnings,
  calculateStudyConsistency
} from '../utils/analytics-calculations.js';

export interface SnapshotData {
  student_id: string;
  student_name: string;
  class_name: string | null;
  risk_score: number;
  risk_level: string;
  success_probability: number;
  attendance_rate: number;
  academic_trend: number;
  study_consistency: number;
  avg_exam_score: number;
  total_sessions: number;
  early_warnings: string | null;
  last_updated: string;
}

export function refreshAnalyticsSnapshot(): number {
  const db = getDatabase();
  
  const query = `
    WITH student_exams AS (
      SELECT 
        s.id as student_id,
        AVG(CAST(json_extract(exam.value, '$.score') AS REAL)) as avg_score,
        COUNT(*) as exam_count,
        json_group_array(
          json_object(
            'score', CAST(json_extract(exam.value, '$.score') AS REAL),
            'date', json_extract(exam.value, '$.date')
          )
        ) as exam_data
      FROM students s
      LEFT JOIN academic_records ar ON s.id = ar.studentId
      LEFT JOIN json_each(ar.exams) exam ON exam.value IS NOT NULL
      GROUP BY s.id
    ),
    student_attendance AS (
      SELECT 
        studentId as student_id,
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'Var' THEN 1 ELSE 0 END) as present_count
      FROM attendance
      GROUP BY studentId
    ),
    student_sessions AS (
      SELECT 
        css.studentId as student_id,
        COUNT(DISTINCT cs.id) as session_count
      FROM counseling_session_students css
      JOIN counseling_sessions cs ON css.sessionId = cs.id
      GROUP BY css.studentId
    )
    SELECT 
      s.id as student_id,
      (s.name || ' ' || s.surname) as student_name,
      s.class as class_name,
      COALESCE(se.avg_score, 0) as avg_exam_score,
      COALESCE(se.exam_count, 0) as exam_count,
      se.exam_data,
      COALESCE(sa.total_records, 0) as attendance_total,
      COALESCE(sa.present_count, 0) as attendance_present,
      COALESCE(ss.session_count, 0) as total_sessions
    FROM students s
    LEFT JOIN student_exams se ON s.id = se.student_id
    LEFT JOIN student_attendance sa ON s.id = sa.student_id
    LEFT JOIN student_sessions ss ON s.id = ss.student_id
  `;
  
  const rows = db.prepare(query).all() as any[];
  
  const upsertStmt = db.prepare(`
    INSERT OR REPLACE INTO student_analytics_snapshot (
      student_id, student_name, class_name, risk_score, risk_level,
      success_probability, attendance_rate, academic_trend, study_consistency,
      avg_exam_score, total_sessions, early_warnings, last_updated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  
  let updatedCount = 0;
  
  for (const row of rows) {
    const attendanceRate = row.attendance_total > 0 
      ? Math.round((row.attendance_present / row.attendance_total) * 100) 
      : 100;
    
    const academicTrend = calculateAcademicTrend(row.exam_data);
    const riskScore = calculateRiskScore(attendanceRate, academicTrend, row.total_sessions);
    const riskLevel = getRiskLevel(riskScore);
    const earlyWarnings = generateEarlyWarnings(row.student_name, attendanceRate, academicTrend, row.total_sessions);
    const studyConsistency = calculateStudyConsistency(row.total_sessions);
    
    upsertStmt.run(
      row.student_id,
      row.student_name,
      row.class_name,
      riskScore,
      riskLevel,
      Math.max(0, 100 - riskScore),
      attendanceRate,
      academicTrend,
      studyConsistency,
      row.avg_exam_score || 0,
      row.total_sessions,
      JSON.stringify(earlyWarnings)
    );
    
    updatedCount++;
  }
  
  return updatedCount;
}

/**
 * Get analytics snapshot data
 * @param studentId - Optional specific student ID
 * @param studentIds - Optional array of student IDs for school-based filtering
 */
export function getSnapshotData(studentId?: string, studentIds?: string[]): SnapshotData[] {
  const db = getDatabase();
  
  if (studentId) {
    const row = db.prepare(`
      SELECT * FROM student_analytics_snapshot WHERE student_id = ?
    `).get(studentId) as SnapshotData | undefined;
    
    return row ? [row] : [];
  }
  
  if (studentIds && studentIds.length > 0) {
    const placeholders = studentIds.map(() => '?').join(',');
    return db.prepare(`
      SELECT * FROM student_analytics_snapshot 
      WHERE student_id IN (${placeholders}) 
      ORDER BY risk_score DESC
    `).all(...studentIds) as SnapshotData[];
  }
  
  if (studentIds && studentIds.length === 0) {
    return [];
  }
  
  throw new Error('[SECURITY] getSnapshotData requires studentIds for school isolation. Use getSnapshotData(undefined, studentIds) or getSnapshotData(studentId)');
}

export function snapshotToStudentAnalytics(snapshot: SnapshotData): StudentAnalytics {
  return {
    studentId: snapshot.student_id,
    studentName: snapshot.student_name,
    className: snapshot.class_name || 'Belirtilmemiş',
    riskScore: snapshot.risk_score,
    riskLevel: snapshot.risk_level as any,
    successProbability: snapshot.success_probability,
    attendanceRate: snapshot.attendance_rate,
    academicTrend: snapshot.academic_trend,
    studyConsistency: snapshot.study_consistency,
    earlyWarnings: snapshot.early_warnings ? JSON.parse(snapshot.early_warnings) : []
  };
}
