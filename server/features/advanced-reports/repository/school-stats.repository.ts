/**
 * School Statistics Repository
 * Okul Geneli İstatistikler Veri Erişim Katmanı
 * 
 * [SECURITY] Tüm sorgular schoolId ile filtrelenerek okul veri izolasyonu sağlanır
 */

import { getDatabase } from '../../../lib/database/connection.js';
import type { SchoolStatistics, ClassDistribution } from '../types/advanced-reports.types.js';

export function getSchoolStatistics(schoolId: string): SchoolStatistics {
  if (!schoolId) {
    throw new Error('[SECURITY] getSchoolStatistics requires schoolId for school isolation');
  }

  const db = getDatabase();
  
  // Total students - students tablosu schoolId kullanıyor
  const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students WHERE schoolId = ?').get(schoolId) as { count: number };
  
  // Total classes
  const totalClasses = db.prepare(`
    SELECT COUNT(DISTINCT class) as count 
    FROM students 
    WHERE class IS NOT NULL AND schoolId = ?
  `).get(schoolId) as { count: number };
  
  // Total counselors - user_schools üzerinden JOIN
  const totalCounselors = db.prepare(`
    SELECT COUNT(DISTINCT u.id) as count 
    FROM users u
    INNER JOIN user_schools us ON u.id = us.userId
    WHERE u.role = 'counselor' AND u.isActive = 1 AND us.schoolId = ?
  `).get(schoolId) as { count: number };
  
  // Total sessions - counseling_sessions tablosu schoolId kullanıyor
  const totalSessions = db.prepare('SELECT COUNT(*) as count FROM counseling_sessions WHERE schoolId = ?').get(schoolId) as { count: number };
  
  // Risk distribution - schoolId filtresi ile
  const riskData = db.prepare(`
    SELECT 
      SUM(CASE WHEN sas.risk_level = 'Düşük' OR sas.risk_level IS NULL THEN 1 ELSE 0 END) as low,
      SUM(CASE WHEN sas.risk_level = 'Orta' THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN sas.risk_level = 'Yüksek' THEN 1 ELSE 0 END) as high,
      SUM(CASE WHEN sas.risk_level = 'Kritik' THEN 1 ELSE 0 END) as critical
    FROM student_analytics_snapshot sas
    INNER JOIN students s ON sas.student_id = s.id
    WHERE s.schoolId = ?
  `).get(schoolId) as any;
  
  // Class distribution - schoolId filtresi ile
  const classDistData = db.prepare(`
    SELECT 
      class as className,
      COUNT(*) as studentCount,
      SUM(CASE WHEN gender = 'E' THEN 1 ELSE 0 END) as maleCount,
      SUM(CASE WHEN gender = 'K' THEN 1 ELSE 0 END) as femaleCount,
      AVG(CAST(JULIANDAY('now') - JULIANDAY(birthDate) AS REAL) / 365.25) as averageAge
    FROM students
    WHERE class IS NOT NULL AND schoolId = ?
    GROUP BY class
    ORDER BY class
  `).all(schoolId) as ClassDistribution[];
  
  // Gender distribution - schoolId filtresi ile
  const genderData = db.prepare(`
    SELECT 
      SUM(CASE WHEN gender = 'E' THEN 1 ELSE 0 END) as male,
      SUM(CASE WHEN gender = 'K' THEN 1 ELSE 0 END) as female,
      SUM(CASE WHEN gender NOT IN ('E', 'K') OR gender IS NULL THEN 1 ELSE 0 END) as other
    FROM students
    WHERE schoolId = ?
  `).get(schoolId) as any;
  
  // Attendance overview - schoolId filtresi ile
  const attendanceData = db.prepare(`
    WITH student_attendance AS (
      SELECT 
        a.studentId,
        COUNT(*) as total,
        SUM(CASE WHEN a.status = 'Var' THEN 1 ELSE 0 END) as present
      FROM attendance a
      INNER JOIN students s ON a.studentId = s.id
      WHERE s.schoolId = ?
      GROUP BY a.studentId
    )
    SELECT 
      AVG(CAST(present AS REAL) / NULLIF(total, 0)) as average,
      SUM(CASE WHEN CAST(present AS REAL) / NULLIF(total, 0) >= 0.95 THEN 1 ELSE 0 END) as excellent,
      SUM(CASE WHEN CAST(present AS REAL) / NULLIF(total, 0) >= 0.85 AND CAST(present AS REAL) / NULLIF(total, 0) < 0.95 THEN 1 ELSE 0 END) as good,
      SUM(CASE WHEN CAST(present AS REAL) / NULLIF(total, 0) < 0.85 THEN 1 ELSE 0 END) as poor
    FROM student_attendance
  `).get(schoolId) as any;
  
  // Academic overview - schoolId filtresi ile
  const academicData = db.prepare(`
    SELECT 
      AVG(sas.avg_exam_score) as averageGPA,
      SUM(CASE WHEN sas.avg_exam_score >= 85 THEN 1 ELSE 0 END) as topPerformers,
      SUM(CASE WHEN sas.avg_exam_score < 60 THEN 1 ELSE 0 END) as needsSupport
    FROM student_analytics_snapshot sas
    INNER JOIN students s ON sas.student_id = s.id
    WHERE s.schoolId = ?
  `).get(schoolId) as any;
  
  return {
    totalStudents: totalStudents.count,
    totalClasses: totalClasses.count,
    totalCounselors: totalCounselors.count,
    totalSessions: totalSessions.count,
    riskDistribution: {
      low: riskData?.low || 0,
      medium: riskData?.medium || 0,
      high: riskData?.high || 0,
      critical: riskData?.critical || 0,
    },
    classDistribution: classDistData,
    genderDistribution: {
      male: genderData?.male || 0,
      female: genderData?.female || 0,
      other: genderData?.other || 0,
    },
    attendanceOverview: {
      average: attendanceData?.average || 0,
      excellent: attendanceData?.excellent || 0,
      good: attendanceData?.good || 0,
      poor: attendanceData?.poor || 0,
    },
    academicOverview: {
      averageGPA: academicData?.averageGPA || 0,
      topPerformers: academicData?.topPerformers || 0,
      needsSupport: academicData?.needsSupport || 0,
    },
    lastUpdated: new Date().toISOString(),
  };
}

export function getClassList(schoolId: string): string[] {
  if (!schoolId) {
    throw new Error('[SECURITY] getClassList requires schoolId for school isolation');
  }

  const db = getDatabase();
  const classes = db.prepare(`
    SELECT DISTINCT class 
    FROM students 
    WHERE class IS NOT NULL AND schoolId = ?
    ORDER BY class
  `).all(schoolId) as { class: string }[];
  
  return classes.map(c => c.class);
}
