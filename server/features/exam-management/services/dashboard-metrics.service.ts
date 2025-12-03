import getDatabase from '../../../lib/database/index.js';
import type { RealTimeDashboardMetrics } from '../../../../shared/types/exam-management.types.js';

export function getRealTimeDashboardMetrics(): RealTimeDashboardMetrics {
  const db = getDatabase();
  
  // Today's metrics
  const today = new Date().toISOString().split('T')[0];
  const todayExams = db.prepare(`
    SELECT COUNT(*) as count FROM exam_sessions 
    WHERE exam_date = ?
  `).get(today) as { count: number };
  
  const todayResults = db.prepare(`
    SELECT COUNT(*) as count FROM exam_session_results 
    WHERE DATE(created_at) = ?
  `).get(today) as { count: number };
  
  const todayAlerts = db.prepare(`
    SELECT COUNT(*) as count FROM exam_alerts 
    WHERE DATE(created_at) = ?
  `).get(today) as { count: number };
  
  const activeStudents = db.prepare(`
    SELECT COUNT(DISTINCT student_id) as count FROM exam_session_results 
    WHERE DATE(created_at) >= datetime('now', '-7 days')
  `).get() as { count: number };
  
  // This week's metrics
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];
  
  const weekExams = db.prepare(`
    SELECT COUNT(*) as count FROM exam_sessions 
    WHERE exam_date >= ?
  `).get(weekStartStr) as { count: number };
  
  const weekPerformance = db.prepare(`
    SELECT AVG(net_score) as avg FROM exam_session_results r
    INNER JOIN exam_sessions s ON r.session_id = s.id
    WHERE s.exam_date >= ?
  `).get(weekStartStr) as { avg: number | null };
  
  const weekParticipation = db.prepare(`
    SELECT 
      COUNT(DISTINCT r.student_id) * 100.0 / NULLIF(COUNT(DISTINCT s.id), 0) as rate
    FROM exam_sessions s
    LEFT JOIN exam_session_results r ON s.id = r.session_id
    WHERE s.exam_date >= ?
  `).get(weekStartStr) as { rate: number | null };
  
  // This month's metrics
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().split('T')[0];
  
  const monthExams = db.prepare(`
    SELECT COUNT(*) as count FROM exam_sessions 
    WHERE exam_date >= ?
  `).get(monthStartStr) as { count: number };
  
  const monthParticipants = db.prepare(`
    SELECT COUNT(DISTINCT r.student_id) as count 
    FROM exam_session_results r
    INNER JOIN exam_sessions s ON r.session_id = s.id
    WHERE s.exam_date >= ?
  `).get(monthStartStr) as { count: number };
  
  const monthSuccess = db.prepare(`
    SELECT AVG(net_score) as avg FROM exam_session_results r
    INNER JOIN exam_sessions s ON r.session_id = s.id
    WHERE s.exam_date >= ?
  `).get(monthStartStr) as { avg: number | null };
  
  // Quick stats
  const atRiskCount = db.prepare(`
    SELECT COUNT(DISTINCT student_id) as count FROM exam_alerts 
    WHERE alert_type = 'at_risk' AND is_read = FALSE
  `).get() as { count: number };
  
  const goalsAchieved = db.prepare(`
    SELECT COUNT(*) as count FROM student_exam_goals 
    WHERE status = 'achieved' AND DATE(updated_at) >= ?
  `).get(monthStartStr) as { count: number };
  
  return {
    today: {
      exams_today: todayExams.count,
      results_entered_today: todayResults.count,
      alerts_today: todayAlerts.count,
      active_students: activeStudents.count
    },
    this_week: {
      exams_this_week: weekExams.count,
      avg_performance: weekPerformance.avg || 0,
      improvement_rate: 0,
      participation_rate: weekParticipation.rate || 0
    },
    this_month: {
      total_exams: monthExams.count,
      total_participants: monthParticipants.count,
      avg_success_rate: monthSuccess.avg || 0,
      trend_direction: 'stable'
    },
    quick_stats: {
      at_risk_count: atRiskCount.count,
      high_performers: 0,
      goals_achieved_this_month: goalsAchieved.count,
      pending_results: 0
    }
  };
}
