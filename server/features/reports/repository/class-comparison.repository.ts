/**
 * Class Comparison Repository
 * Sınıf Karşılaştırma Veri Erişim Katmanı
 * 
 * [SECURITY] Tüm sorgular schoolId ile filtrelenerek okul veri izolasyonu sağlanır
 */

import { getDatabase } from '../../../lib/database/connection.js';
import type { ClassComparison, StudentBrief } from '../types/advanced-reports.types.js';

export function getClassComparisons(schoolId: string, classNames?: string[]): ClassComparison[] {
  if (!schoolId) {
    throw new Error('[SECURITY] getClassComparisons requires schoolId for school isolation');
  }

  const db = getDatabase();
  
  let classFilter = 'WHERE s.schoolId = ?';
  if (classNames && classNames.length > 0) {
    const placeholders = classNames.map(() => '?').join(',');
    classFilter += ` AND s.class IN (${placeholders})`;
  }
  
  const query = `
    WITH class_stats AS (
      SELECT 
        s.class,
        COUNT(s.id) as studentCount,
        AVG(sas.avg_exam_score) as averageGPA,
        AVG(sas.attendance_rate) as attendanceRate,
        COUNT(DISTINCT bi.id) as behaviorIncidents,
        COUNT(DISTINCT css.sessionId) as counselingSessions,
        SUM(CASE WHEN sas.risk_level = 'Düşük' OR sas.risk_level IS NULL THEN 1 ELSE 0 END) as lowRisk,
        SUM(CASE WHEN sas.risk_level = 'Orta' THEN 1 ELSE 0 END) as mediumRisk,
        SUM(CASE WHEN sas.risk_level = 'Yüksek' THEN 1 ELSE 0 END) as highRisk,
        SUM(CASE WHEN sas.risk_level = 'Kritik' THEN 1 ELSE 0 END) as criticalRisk
      FROM students s
      LEFT JOIN student_analytics_snapshot sas ON s.id = sas.student_id
      LEFT JOIN behavior_incidents bi ON s.id = bi.studentId
      LEFT JOIN counseling_session_students css ON s.id = css.studentId
      ${classFilter}
      GROUP BY s.class
    )
    SELECT * FROM class_stats ORDER BY class
  `;
  
  const params = classNames && classNames.length > 0 ? [schoolId, ...classNames] : [schoolId];
  const classStats = db.prepare(query).all(...params) as any[];
  
  return classStats.map(stat => {
    const className = stat.class;
    
    const topPerformers = getTopPerformersBySchool(schoolId, className, 5);
    const atRiskStudents = getAtRiskStudentsBySchool(schoolId, className, 5);
    const { strengths, challenges } = analyzeClassPerformance(stat);
    
    return {
      class: className,
      studentCount: stat.studentCount,
      averageGPA: stat.averageGPA || 0,
      attendanceRate: stat.attendanceRate || 0,
      behaviorIncidents: stat.behaviorIncidents || 0,
      counselingSessions: stat.counselingSessions || 0,
      riskDistribution: {
        low: stat.lowRisk || 0,
        medium: stat.mediumRisk || 0,
        high: stat.highRisk || 0,
        critical: stat.criticalRisk || 0,
      },
      topPerformers,
      atRiskStudents,
      strengths,
      challenges,
    };
  });
}

function getTopPerformersBySchool(schoolId: string, className: string, limit: number): StudentBrief[] {
  const db = getDatabase();
  
  const performers = db.prepare(`
    SELECT 
      s.id,
      (s.name || ' ' || s.surname) as name,
      sas.avg_exam_score as gpa
    FROM students s
    JOIN student_analytics_snapshot sas ON s.id = sas.student_id
    WHERE s.class = ? AND s.schoolId = ? AND sas.avg_exam_score IS NOT NULL
    ORDER BY sas.avg_exam_score DESC
    LIMIT ?
  `).all(className, schoolId, limit) as any[];
  
  return performers.map(p => ({
    id: p.id,
    name: p.name,
    gpa: p.gpa,
    reason: `GPA: ${p.gpa.toFixed(2)}`,
  }));
}

function getAtRiskStudentsBySchool(schoolId: string, className: string, limit: number): StudentBrief[] {
  const db = getDatabase();
  
  const atRisk = db.prepare(`
    SELECT 
      s.id,
      (s.name || ' ' || s.surname) as name,
      sas.risk_level as riskLevel,
      sas.risk_score
    FROM students s
    JOIN student_analytics_snapshot sas ON s.id = sas.student_id
    WHERE s.class = ? AND s.schoolId = ?
      AND sas.risk_level IN ('Yüksek', 'Kritik')
    ORDER BY sas.risk_score DESC
    LIMIT ?
  `).all(className, schoolId, limit) as any[];
  
  return atRisk.map(r => ({
    id: r.id,
    name: r.name,
    riskLevel: r.riskLevel,
    reason: `Risk: ${r.riskLevel}`,
  }));
}

function analyzeClassPerformance(stat: any): { strengths: string[]; challenges: string[] } {
  const strengths: string[] = [];
  const challenges: string[] = [];
  
  if (stat.averageGPA >= 80) {
    strengths.push('Yüksek akademik başarı ortalaması');
  } else if (stat.averageGPA < 60) {
    challenges.push('Düşük akademik başarı ortalaması');
  }
  
  if (stat.attendanceRate >= 0.95) {
    strengths.push('Mükemmel devam oranı');
  } else if (stat.attendanceRate < 0.85) {
    challenges.push('Düşük devam oranı');
  }
  
  if (stat.behaviorIncidents === 0) {
    strengths.push('Davranış sorunu kaydı yok');
  } else if (stat.behaviorIncidents > 10) {
    challenges.push('Yüksek davranış olayı sayısı');
  }
  
  const totalRisk = stat.highRisk + stat.criticalRisk;
  if (totalRisk === 0) {
    strengths.push('Risk altında öğrenci yok');
  } else if (totalRisk > stat.studentCount * 0.2) {
    challenges.push('Yüksek oranda risk altında öğrenci');
  }
  
  if (stat.counselingSessions > stat.studentCount * 2) {
    strengths.push('Aktif rehberlik desteği');
  }
  
  return { strengths, challenges };
}

export function compareClasses(schoolId: string, className1: string, className2: string): {
  class1: ClassComparison;
  class2: ClassComparison;
  insights: string[];
} {
  if (!schoolId) {
    throw new Error('[SECURITY] compareClasses requires schoolId for school isolation');
  }

  const comparisons = getClassComparisons(schoolId, [className1, className2]);
  
  if (comparisons.length < 2) {
    throw new Error('İki sınıf da bulunamadı');
  }
  
  const class1 = comparisons[0];
  const class2 = comparisons[1];
  const insights: string[] = [];
  
  if (class1.averageGPA > class2.averageGPA + 5) {
    insights.push(`${class1.class} akademik olarak ${class2.class}'dan daha başarılı`);
  } else if (class2.averageGPA > class1.averageGPA + 5) {
    insights.push(`${class2.class} akademik olarak ${class1.class}'dan daha başarılı`);
  }
  
  if (class1.attendanceRate > class2.attendanceRate + 0.05) {
    insights.push(`${class1.class} devam konusunda daha iyi`);
  } else if (class2.attendanceRate > class1.attendanceRate + 0.05) {
    insights.push(`${class2.class} devam konusunda daha iyi`);
  }
  
  const class1RiskRate = (class1.riskDistribution.high + class1.riskDistribution.critical) / class1.studentCount;
  const class2RiskRate = (class2.riskDistribution.high + class2.riskDistribution.critical) / class2.studentCount;
  
  if (class1RiskRate > class2RiskRate + 0.1) {
    insights.push(`${class1.class}'da daha fazla risk altında öğrenci var`);
  } else if (class2RiskRate > class1RiskRate + 0.1) {
    insights.push(`${class2.class}'da daha fazla risk altında öğrenci var`);
  }
  
  return {
    class1,
    class2,
    insights,
  };
}
