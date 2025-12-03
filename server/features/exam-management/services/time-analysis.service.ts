import getDatabase from '../../../lib/database/index.js';
import type { TimeAnalysisInsights } from '../../../../shared/types/exam-management.types.js';

export function calculateTimeAnalysis(studentId: string, examTypeId: string): TimeAnalysisInsights {
  const db = getDatabase();
  
  // Get student name
  const student = db.prepare("SELECT COALESCE(CAST((name || ' ' || surname) AS TEXT), name) as fullName FROM students WHERE id = ?").get(studentId) as any;
  
  // Get all exam sessions for this student and exam type
  const sessions = db.prepare(`
    SELECT 
      s.id,
      s.name,
      s.exam_date,
      AVG(r.net_score) as avg_net
    FROM exam_sessions s
    INNER JOIN exam_session_results r ON s.id = r.session_id
    WHERE r.student_id = ? AND s.exam_type_id = ?
    GROUP BY s.id
    ORDER BY s.exam_date ASC
  `).all(studentId, examTypeId);
  
  if ((sessions as any[]).length < 2) {
    return {
      student_id: studentId,
      student_name: student?.fullName || '',
      exam_type_id: examTypeId,
      consistency_score: 0,
      optimal_study_pattern: 'Need more data',
      recommended_next_exam_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      performance_trends: []
    };
  }
  
  // Calculate days between exams
  const intervals: number[] = [];
  for (let i = 1; i < (sessions as any[]).length; i++) {
    const prev = new Date((sessions as any[])[i - 1].exam_date);
    const curr = new Date((sessions as any[])[i].exam_date);
    const days = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    intervals.push(days);
  }
  
  const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
  
  // Calculate consistency score (lower variance = higher consistency)
  const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
  const consistencyScore = Math.max(0, 100 - variance);
  
  // Determine study frequency
  let studyFrequency: 'high' | 'medium' | 'low';
  if (avgInterval < 7) studyFrequency = 'high';
  else if (avgInterval < 14) studyFrequency = 'medium';
  else studyFrequency = 'low';
  
  // Calculate performance trends
  const trends: Array<{ period: string; avg_net: number; exam_count: number; trend: string }> = [];
  const chunkSize = Math.max(3, Math.floor((sessions as any[]).length / 3));
  
  for (let i = 0; i < (sessions as any[]).length; i += chunkSize) {
    const chunk = (sessions as any[]).slice(i, i + chunkSize);
    const avgNet = chunk.reduce((sum: number, s: any) => sum + s.avg_net, 0) / chunk.length;
    
    trends.push({
      period: `${chunk[0].exam_date} to ${chunk[chunk.length - 1].exam_date}`,
      avg_net: avgNet,
      exam_count: chunk.length,
      trend: i > 0 && avgNet > trends[trends.length - 1].avg_net ? 'improving' : 'stable'
    });
  }
  
  // Recommend next exam date
  const lastExamDate = new Date((sessions as any[])[(sessions as any[]).length - 1].exam_date);
  const recommendedDate = new Date(lastExamDate.getTime() + avgInterval * 24 * 60 * 60 * 1000);
  
  // Save to database
  db.prepare(`
    INSERT OR REPLACE INTO exam_time_analysis (
      id, student_id, exam_type_id, total_exams, avg_days_between_exams,
      study_frequency, optimal_interval_days, last_exam_date,
      performance_time_correlation, improvement_velocity
    ) VALUES (
      COALESCE((SELECT id FROM exam_time_analysis WHERE student_id = ? AND exam_type_id = ?), ?),
      ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `).run(
    studentId, examTypeId,
    `${studentId}-${examTypeId}`,
    studentId,
    examTypeId,
    (sessions as any[]).length,
    avgInterval,
    studyFrequency,
    Math.round(avgInterval),
    (sessions as any[])[(sessions as any[]).length - 1].exam_date,
    0.5,
    0
  );
  
  return {
    student_id: studentId,
    student_name: student?.fullName || '',
    exam_type_id: examTypeId,
    consistency_score: Math.round(consistencyScore),
    optimal_study_pattern: `${Math.round(avgInterval)} days between exams`,
    recommended_next_exam_date: recommendedDate.toISOString().split('T')[0],
    performance_trends: trends as any
  };
}
