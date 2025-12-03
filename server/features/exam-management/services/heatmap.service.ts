import getDatabase from '../../../lib/database/index.js';
import * as heatmapRepo from '../repository/heatmap.repository.js';
import type { HeatmapData } from '../../../../shared/types/exam-management.types.js';

export function calculateHeatmap(studentId: string, examTypeId: string): HeatmapData {
  const db = getDatabase();
  
  // Get student info
  const student = db.prepare("SELECT COALESCE(CAST((name || ' ' || surname) AS TEXT), name) as fullName FROM students WHERE id = ?").get(studentId) as any;
  
  // Get all subjects for this exam type
  const subjects = db.prepare(`
    SELECT id, subject_name FROM exam_subjects WHERE exam_type_id = ?
  `).all(examTypeId);
  
  const heatmapSubjects: unknown[] = [];
  
  for (const subject of subjects as any[]) {
    // Get all results for this student and subject
    const results = db.prepare(`
      SELECT r.net_score, s.exam_date
      FROM exam_session_results r
      INNER JOIN exam_sessions s ON r.session_id = s.id
      WHERE r.student_id = ? AND r.subject_id = ? AND s.exam_type_id = ?
      ORDER BY s.exam_date DESC
      LIMIT 12
    `).all(studentId, subject.id, examTypeId);
    
    if (results.length === 0) {
      heatmapSubjects.push({
        subject_id: subject.id,
        subject_name: subject.subject_name,
        performance_score: 0,
        strength_level: 'weak',
        trend: 'stable',
        color_intensity: 0
      });
      continue;
    }
    
    const scores = (results as any[]).map(r => r.net_score);
    const last6 = scores.slice(0, 6);
    const last12 = scores;
    
    const last6Avg = last6.reduce((sum, s) => sum + s, 0) / last6.length;
    const last12Avg = last12.reduce((sum, s) => sum + s, 0) / last12.length;
    
    // Calculate trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (last6Avg > last12Avg * 1.1) trend = 'improving';
    else if (last6Avg < last12Avg * 0.9) trend = 'declining';
    
    // Determine strength level
    let strengthLevel: 'weak' | 'moderate' | 'strong' = 'moderate';
    if (last6Avg < 5) strengthLevel = 'weak';
    else if (last6Avg > 15) strengthLevel = 'strong';
    
    // Update database
    heatmapRepo.updateHeatmap({
      student_id: studentId,
      subject_id: subject.id,
      exam_type_id: examTypeId,
      performance_score: last6Avg,
      trend,
      last_6_avg: last6Avg,
      last_12_avg: last12Avg,
      total_sessions: results.length,
      strength_level: strengthLevel
    });
    
    heatmapSubjects.push({
      subject_id: subject.id,
      subject_name: subject.subject_name,
      performance_score: last6Avg,
      strength_level: strengthLevel,
      trend,
      color_intensity: last6Avg / 20
    });
  }
  
  return {
    student_id: studentId,
    student_name: student.fullName,
    exam_type_id: examTypeId,
    subjects: heatmapSubjects as any
  };
}

export function getHeatmapData(studentId: string, examTypeId: string): HeatmapData {
  // First try to get from cache
  const cached = heatmapRepo.getHeatmapByStudent(studentId, examTypeId);
  
  if (cached.length > 0) {
    return {
      student_id: studentId,
      student_name: '',
      exam_type_id: examTypeId,
      subjects: cached.map((c: any) => ({
        subject_id: c.subject_id,
        subject_name: c.subject_name,
        performance_score: c.performance_score,
        strength_level: c.strength_level,
        trend: c.trend,
        color_intensity: c.performance_score / 20
      }))
    };
  }
  
  // If not cached, calculate fresh
  return calculateHeatmap(studentId, examTypeId);
}
