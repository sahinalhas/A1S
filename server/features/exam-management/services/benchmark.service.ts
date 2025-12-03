import getDatabase from '../../../lib/database/index.js';
import * as benchmarkRepo from '../repository/benchmarks.repository.js';
import type { BenchmarkComparison } from '../../../../shared/types/exam-management.types.js';

export function calculateBenchmarks(sessionId: string): any {
  const db = getDatabase();
  
  // Get all student results for this session
  const results = db.prepare(`
    SELECT 
      r.student_id,
      s.fullName as student_name,
      SUM(r.net_score) as total_net
    FROM exam_session_results r
    INNER JOIN students s ON r.student_id = s.id
    WHERE r.session_id = ?
    GROUP BY r.student_id
    ORDER BY total_net DESC
  `).all(sessionId);
  
  if ((results as any[]).length === 0) {
    return { success: false, message: 'No results found' };
  }
  
  const scores = (results as any[]).map(r => r.total_net);
  const classAvg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const schoolAvg = classAvg;
  const totalParticipants = scores.length;
  
  // Calculate percentiles and ranks for each student
  for (let i = 0; i < (results as any[]).length; i++) {
    const result = (results as any[])[i];
    const rank = i + 1;
    const percentile = ((totalParticipants - rank) / totalParticipants) * 100;
    
    let performanceCategory: string;
    if (percentile >= 90) performanceCategory = 'excellent';
    else if (percentile >= 70) performanceCategory = 'good';
    else if (percentile >= 40) performanceCategory = 'average';
    else performanceCategory = 'needs_improvement';
    
    // Save to database
    benchmarkRepo.createOrUpdateBenchmark({
      session_id: sessionId,
      student_id: result.student_id,
      total_net: result.total_net,
      class_avg: classAvg,
      school_avg: schoolAvg,
      percentile,
      rank,
      total_participants: totalParticipants,
      performance_category: performanceCategory
    });
  }
  
  return { success: true, processed: (results as any[]).length };
}

export function getBenchmarkComparison(sessionId: string, studentId: string): BenchmarkComparison | null {
  const db = getDatabase();
  
  const data = db.prepare(`
    SELECT 
      b.*,
      s.fullName as student_name,
      es.name as session_name
    FROM exam_benchmarks b
    INNER JOIN students s ON b.student_id = s.id
    INNER JOIN exam_sessions es ON b.session_id = es.id
    WHERE b.session_id = ? AND b.student_id = ?
  `).get(sessionId, studentId) as any;
  
  if (!data) return null;
  
  return {
    student_id: data.student_id,
    student_name: data.student_name,
    session_id: data.session_id,
    session_name: data.session_name,
    student_score: data.total_net,
    class_average: data.class_avg,
    school_average: data.school_avg,
    percentile: data.percentile,
    rank: data.rank,
    total_participants: data.total_participants,
    performance_vs_class: data.total_net >= data.class_avg ? 'above' : 'below',
    performance_vs_school: data.total_net >= data.school_avg ? 'above' : 'below'
  };
}
