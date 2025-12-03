import * as examSessionsRepo from '../repository/exam-sessions.repository.js';
import * as examResultsRepo from '../repository/exam-results.repository.js';
import * as examTypesRepo from '../repository/exam-types.repository.js';
import { getDatabase } from '../../../lib/database/connection.js';
import type {
  DashboardOverview,
  DashboardSummary,
  RecentSessionSummary,
  StudentPerformanceOverview,
  AtRiskStudent,
  QuickAction,
  PerformanceDistribution
} from '../../../../shared/types/exam-management.types.js';

export function getDashboardOverview(): DashboardOverview {
  console.warn('[DEPRECATED] getDashboardOverview() called without schoolId. Use getDashboardOverviewBySchool(schoolId) instead.');
  try {
    const summary = calculateDashboardSummary();
    const recent_sessions = getRecentSessions(5);
    const student_performance = calculateStudentPerformanceOverview();
    const at_risk_students = identifyAtRiskStudents();
    const quick_actions = getQuickActions();

    return {
      summary,
      recent_sessions,
      student_performance,
      at_risk_students,
      quick_actions
    };
  } catch (error) {
    console.error('Error in getDashboardOverview:', error);
    throw error;
  }
}

export function getDashboardOverviewBySchool(schoolId: string): DashboardOverview {
  if (!schoolId) {
    throw new Error('schoolId is required for getDashboardOverviewBySchool');
  }
  
  try {
    const summary = calculateDashboardSummaryBySchool(schoolId);
    const recent_sessions = getRecentSessionsBySchool(schoolId, 5);
    const student_performance = calculateStudentPerformanceOverviewBySchool(schoolId);
    const at_risk_students = identifyAtRiskStudentsBySchool(schoolId);
    const quick_actions = getQuickActions();

    return {
      summary,
      recent_sessions,
      student_performance,
      at_risk_students,
      quick_actions
    };
  } catch (error) {
    console.error('Error in getDashboardOverviewBySchool:', error);
    throw error;
  }
}

function calculateDashboardSummary(): DashboardSummary {
  const db = getDatabase();
  
  const allSessions = examSessionsRepo.getAllExamSessions();
  const total_sessions = allSessions.length;

  const studentsQuery = db.prepare('SELECT COUNT(DISTINCT id) as count FROM students').get() as { count: number };
  const total_students = studentsQuery.count;

  const resultsQuery = db.prepare('SELECT COUNT(*) as count FROM exam_session_results').get() as { count: number };
  const total_results_count = resultsQuery.count;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  const sessionsThisMonth = allSessions.filter(s => s.exam_date >= thisMonthStart).length;
  const sessionsLastMonth = allSessions.filter(s => s.exam_date >= lastMonthStart && s.exam_date <= lastMonthEnd).length;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (sessionsThisMonth > sessionsLastMonth) {
    trend = 'up';
  } else if (sessionsThisMonth < sessionsLastMonth) {
    trend = 'down';
  }

  const participationQuery = db.prepare(`
    SELECT 
      session_id,
      COUNT(DISTINCT student_id) as participants
    FROM exam_session_results
    GROUP BY session_id
  `).all() as Array<{ session_id: string; participants: number }>;

  const avg_participation_rate = participationQuery.length > 0
    ? participationQuery.reduce((sum, p) => sum + p.participants, 0) / participationQuery.length
    : 0;

  const avgNetQuery = db.prepare(`
    SELECT AVG(net_score) as avg_net FROM exam_session_results
  `).get() as { avg_net: number | null };

  const avg_overall_success = avgNetQuery.avg_net || 0;

  return {
    total_sessions,
    total_students,
    total_results_count,
    avg_participation_rate: Math.round(avg_participation_rate * 100) / 100,
    avg_overall_success: Math.round(avg_overall_success * 100) / 100,
    sessions_this_month: sessionsThisMonth,
    sessions_last_month: sessionsLastMonth,
    trend
  };
}

function getRecentSessions(limit: number = 5): RecentSessionSummary[] {
  const db = getDatabase();
  const sessions = examSessionsRepo.getAllExamSessions()
    .sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime())
    .slice(0, limit);

  return sessions.map(session => {
    const examType = examTypesRepo.getAllExamTypes().find(t => t.id === session.exam_type_id);
    
    const results = examResultsRepo.getExamResultsBySession(session.id);
    const participants = new Set(results.map(r => r.student_id)).size;
    
    const avg_net = results.length > 0
      ? results.reduce((sum, r) => sum + r.net_score, 0) / results.length
      : 0;

    const subjects = examTypesRepo.getSubjectsByExamType(session.exam_type_id);
    const expectedResults = participants * subjects.length;
    const completion_rate = expectedResults > 0 ? (results.length / expectedResults) * 100 : 0;

    const examDate = new Date(session.exam_date);
    const now = new Date();
    const days_ago = Math.floor((now.getTime() - examDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      session_id: session.id,
      session_name: session.name,
      exam_type_id: session.exam_type_id,
      exam_type_name: examType?.name || session.exam_type_id,
      exam_date: session.exam_date,
      participants,
      avg_net: Math.round(avg_net * 100) / 100,
      completion_rate: Math.round(completion_rate * 100) / 100,
      days_ago
    };
  });
}

function calculateStudentPerformanceOverview(): StudentPerformanceOverview {
  const db = getDatabase();
  
  const studentNetsQuery = db.prepare(`
    SELECT 
      student_id,
      AVG(net_score) as avg_net
    FROM exam_session_results
    GROUP BY student_id
    HAVING COUNT(DISTINCT session_id) >= 2
  `).all() as Array<{ student_id: string; avg_net: number }>;

  if (studentNetsQuery.length === 0) {
    return {
      high_performers: 0,
      average_performers: 0,
      needs_attention: 0,
      performance_distribution: []
    };
  }

  const avgNets = studentNetsQuery.map(s => s.avg_net);
  const overallAvg = avgNets.reduce((a, b) => a + b, 0) / avgNets.length;
  const stdDev = Math.sqrt(
    avgNets.reduce((sum, net) => sum + Math.pow(net - overallAvg, 2), 0) / avgNets.length
  );

  const highThreshold = overallAvg + stdDev * 0.5;
  const lowThreshold = overallAvg - stdDev * 0.5;

  const high_performers = avgNets.filter(n => n >= highThreshold).length;
  const needs_attention = avgNets.filter(n => n <= lowThreshold).length;
  const average_performers = avgNets.length - high_performers - needs_attention;

  const distribution: PerformanceDistribution[] = [
    {
      range: '0-25%',
      count: avgNets.filter(n => n < overallAvg * 0.25).length,
      percentage: 0
    },
    {
      range: '25-50%',
      count: avgNets.filter(n => n >= overallAvg * 0.25 && n < overallAvg * 0.5).length,
      percentage: 0
    },
    {
      range: '50-75%',
      count: avgNets.filter(n => n >= overallAvg * 0.5 && n < overallAvg * 0.75).length,
      percentage: 0
    },
    {
      range: '75-100%',
      count: avgNets.filter(n => n >= overallAvg * 0.75).length,
      percentage: 0
    }
  ];

  distribution.forEach(d => {
    d.percentage = avgNets.length > 0 ? Math.round((d.count / avgNets.length) * 100) : 0;
  });

  return {
    high_performers,
    average_performers,
    needs_attention,
    performance_distribution: distribution
  };
}

function identifyAtRiskStudents(): AtRiskStudent[] {
  const db = getDatabase();
  
  const studentsQuery = db.prepare(`
    SELECT 
      s.id,
      s.name,
      AVG(esr.net_score) as avg_net,
      MAX(es.exam_date) as last_exam_date,
      COUNT(DISTINCT esr.session_id) as exam_count
    FROM students s
    INNER JOIN exam_session_results esr ON s.id = esr.student_id
    INNER JOIN exam_sessions es ON esr.session_id = es.id
    GROUP BY s.id, s.name
    HAVING exam_count >= 2
    ORDER BY avg_net ASC
    LIMIT 10
  `).all() as Array<{
    id: string;
    name: string;
    avg_net: number;
    last_exam_date: string;
    exam_count: number;
  }>;

  return studentsQuery.map(student => {
    const recentResults = db.prepare(`
      SELECT 
        esr.net_score,
        es.exam_date,
        esub.subject_name
      FROM exam_session_results esr
      INNER JOIN exam_sessions es ON esr.session_id = es.id
      INNER JOIN exam_subjects esub ON esr.subject_id = esub.id
      WHERE esr.student_id = ?
      ORDER BY es.exam_date DESC
      LIMIT 10
    `).all(student.id) as Array<{
      net_score: number;
      exam_date: string;
      subject_name: string;
    }>;

    let trend: 'declining' | 'stable' | 'improving' = 'stable';
    if (recentResults.length >= 3) {
      const recent = recentResults.slice(0, 3).reduce((sum, r) => sum + r.net_score, 0) / 3;
      const older = recentResults.slice(3, 6).reduce((sum, r) => sum + r.net_score, 0) / Math.min(3, recentResults.length - 3);
      
      if (recent < older * 0.9) {
        trend = 'declining';
      } else if (recent > older * 1.1) {
        trend = 'improving';
      }
    }

    const subjectPerformance = db.prepare(`
      SELECT 
        esub.subject_name,
        AVG(esr.net_score) as avg_net
      FROM exam_session_results esr
      INNER JOIN exam_subjects esub ON esr.subject_id = esub.id
      WHERE esr.student_id = ?
      GROUP BY esub.subject_name
      ORDER BY avg_net ASC
      LIMIT 3
    `).all(student.id) as Array<{ subject_name: string; avg_net: number }>;

    const weak_subjects = subjectPerformance.map(s => s.subject_name);

    let risk_level: 'high' | 'medium' | 'low' = 'low';
    if (student.avg_net < 20 || trend === 'declining') {
      risk_level = 'high';
    } else if (student.avg_net < 40) {
      risk_level = 'medium';
    }

    return {
      student_id: student.id,
      student_name: student.name,
      risk_level,
      recent_avg_net: Math.round(student.avg_net * 100) / 100,
      trend,
      weak_subjects,
      last_exam_date: student.last_exam_date
    };
  });
}

function getQuickActions(): QuickAction[] {
  return [
    {
      id: 'create_session',
      type: 'create_session',
      title: 'Yeni Deneme Oluştur',
      description: 'Hızlıca yeni bir deneme sınavı oluşturun',
      icon: 'FileText'
    },
    {
      id: 'enter_results',
      type: 'enter_results',
      title: 'Sonuç Gir',
      description: 'Deneme sınavı sonuçlarını girin',
      icon: 'Edit'
    },
    {
      id: 'view_statistics',
      type: 'view_statistics',
      title: 'İstatistikleri Gör',
      description: 'Detaylı istatistik ve analizleri inceleyin',
      icon: 'BarChart3'
    },
    {
      id: 'export_report',
      type: 'export_report',
      title: 'Rapor Oluştur',
      description: 'Özelleştirilmiş raporlar oluşturun ve indirin',
      icon: 'Download'
    }
  ];
}

function calculateDashboardSummaryBySchool(schoolId: string): DashboardSummary {
  const db = getDatabase();
  
  const allSessions = examSessionsRepo.getExamSessionsBySchool(schoolId);
  const total_sessions = allSessions.length;

  const studentsQuery = db.prepare('SELECT COUNT(DISTINCT id) as count FROM students WHERE schoolId = ?').get(schoolId) as { count: number };
  const total_students = studentsQuery.count;

  const resultsQuery = db.prepare(`
    SELECT COUNT(*) as count FROM exam_session_results esr
    INNER JOIN exam_sessions es ON esr.session_id = es.id
    WHERE es.school_id = ?
  `).get(schoolId) as { count: number };
  const total_results_count = resultsQuery.count;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  const sessionsThisMonth = allSessions.filter(s => s.exam_date >= thisMonthStart).length;
  const sessionsLastMonth = allSessions.filter(s => s.exam_date >= lastMonthStart && s.exam_date <= lastMonthEnd).length;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (sessionsThisMonth > sessionsLastMonth) {
    trend = 'up';
  } else if (sessionsThisMonth < sessionsLastMonth) {
    trend = 'down';
  }

  const participationQuery = db.prepare(`
    SELECT 
      esr.session_id,
      COUNT(DISTINCT esr.student_id) as participants
    FROM exam_session_results esr
    INNER JOIN exam_sessions es ON esr.session_id = es.id
    WHERE es.school_id = ?
    GROUP BY esr.session_id
  `).all(schoolId) as Array<{ session_id: string; participants: number }>;

  const avg_participation_rate = participationQuery.length > 0
    ? participationQuery.reduce((sum, p) => sum + p.participants, 0) / participationQuery.length
    : 0;

  const avgNetQuery = db.prepare(`
    SELECT AVG(esr.net_score) as avg_net FROM exam_session_results esr
    INNER JOIN exam_sessions es ON esr.session_id = es.id
    WHERE es.school_id = ?
  `).get(schoolId) as { avg_net: number | null };

  const avg_overall_success = avgNetQuery.avg_net || 0;

  return {
    total_sessions,
    total_students,
    total_results_count,
    avg_participation_rate: Math.round(avg_participation_rate * 100) / 100,
    avg_overall_success: Math.round(avg_overall_success * 100) / 100,
    sessions_this_month: sessionsThisMonth,
    sessions_last_month: sessionsLastMonth,
    trend
  };
}

function getRecentSessionsBySchool(schoolId: string, limit: number = 5): RecentSessionSummary[] {
  const sessions = examSessionsRepo.getExamSessionsBySchool(schoolId)
    .sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime())
    .slice(0, limit);

  return sessions.map(session => {
    const examType = examTypesRepo.getAllExamTypes().find(t => t.id === session.exam_type_id);
    
    const results = examResultsRepo.getExamResultsBySessionAndSchool(session.id, schoolId);
    const participants = new Set(results.map(r => r.student_id)).size;
    
    const avg_net = results.length > 0
      ? results.reduce((sum, r) => sum + r.net_score, 0) / results.length
      : 0;

    const subjects = examTypesRepo.getSubjectsByExamType(session.exam_type_id);
    const expectedResults = participants * subjects.length;
    const completion_rate = expectedResults > 0 ? (results.length / expectedResults) * 100 : 0;

    const examDate = new Date(session.exam_date);
    const now = new Date();
    const days_ago = Math.floor((now.getTime() - examDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      session_id: session.id,
      session_name: session.name,
      exam_type_id: session.exam_type_id,
      exam_type_name: examType?.name || session.exam_type_id,
      exam_date: session.exam_date,
      participants,
      avg_net: Math.round(avg_net * 100) / 100,
      completion_rate: Math.round(completion_rate * 100) / 100,
      days_ago
    };
  });
}

function calculateStudentPerformanceOverviewBySchool(schoolId: string): StudentPerformanceOverview {
  const db = getDatabase();
  
  const studentNetsQuery = db.prepare(`
    SELECT 
      esr.student_id,
      AVG(esr.net_score) as avg_net
    FROM exam_session_results esr
    INNER JOIN exam_sessions es ON esr.session_id = es.id
    INNER JOIN students s ON esr.student_id = s.id
    WHERE es.school_id = ? AND s.schoolId = ?
    GROUP BY esr.student_id
    HAVING COUNT(DISTINCT esr.session_id) >= 2
  `).all(schoolId, schoolId) as Array<{ student_id: string; avg_net: number }>;

  if (studentNetsQuery.length === 0) {
    return {
      high_performers: 0,
      average_performers: 0,
      needs_attention: 0,
      performance_distribution: []
    };
  }

  const avgNets = studentNetsQuery.map(s => s.avg_net);
  const overallAvg = avgNets.reduce((a, b) => a + b, 0) / avgNets.length;
  const stdDev = Math.sqrt(
    avgNets.reduce((sum, net) => sum + Math.pow(net - overallAvg, 2), 0) / avgNets.length
  );

  const highThreshold = overallAvg + stdDev * 0.5;
  const lowThreshold = overallAvg - stdDev * 0.5;

  const high_performers = avgNets.filter(n => n >= highThreshold).length;
  const needs_attention = avgNets.filter(n => n <= lowThreshold).length;
  const average_performers = avgNets.length - high_performers - needs_attention;

  const distribution: PerformanceDistribution[] = [
    {
      range: '0-25%',
      count: avgNets.filter(n => n < overallAvg * 0.25).length,
      percentage: 0
    },
    {
      range: '25-50%',
      count: avgNets.filter(n => n >= overallAvg * 0.25 && n < overallAvg * 0.5).length,
      percentage: 0
    },
    {
      range: '50-75%',
      count: avgNets.filter(n => n >= overallAvg * 0.5 && n < overallAvg * 0.75).length,
      percentage: 0
    },
    {
      range: '75-100%',
      count: avgNets.filter(n => n >= overallAvg * 0.75).length,
      percentage: 0
    }
  ];

  distribution.forEach(d => {
    d.percentage = avgNets.length > 0 ? Math.round((d.count / avgNets.length) * 100) : 0;
  });

  return {
    high_performers,
    average_performers,
    needs_attention,
    performance_distribution: distribution
  };
}

function identifyAtRiskStudentsBySchool(schoolId: string): AtRiskStudent[] {
  const db = getDatabase();
  
  const studentsQuery = db.prepare(`
    SELECT 
      s.id,
      s.name,
      AVG(esr.net_score) as avg_net,
      MAX(es.exam_date) as last_exam_date,
      COUNT(DISTINCT esr.session_id) as exam_count
    FROM students s
    INNER JOIN exam_session_results esr ON s.id = esr.student_id
    INNER JOIN exam_sessions es ON esr.session_id = es.id
    WHERE s.schoolId = ? AND es.school_id = ?
    GROUP BY s.id, s.name
    HAVING exam_count >= 2
    ORDER BY avg_net ASC
    LIMIT 10
  `).all(schoolId, schoolId) as Array<{
    id: string;
    name: string;
    avg_net: number;
    last_exam_date: string;
    exam_count: number;
  }>;

  return studentsQuery.map(student => {
    const recentResults = db.prepare(`
      SELECT 
        esr.net_score,
        es.exam_date,
        esub.subject_name
      FROM exam_session_results esr
      INNER JOIN exam_sessions es ON esr.session_id = es.id
      INNER JOIN exam_subjects esub ON esr.subject_id = esub.id
      WHERE esr.student_id = ? AND es.school_id = ?
      ORDER BY es.exam_date DESC
      LIMIT 10
    `).all(student.id, schoolId) as Array<{
      net_score: number;
      exam_date: string;
      subject_name: string;
    }>;

    let trend: 'declining' | 'stable' | 'improving' = 'stable';
    if (recentResults.length >= 3) {
      const recent = recentResults.slice(0, 3).reduce((sum, r) => sum + r.net_score, 0) / 3;
      const older = recentResults.slice(3, 6).reduce((sum, r) => sum + r.net_score, 0) / Math.min(3, recentResults.length - 3);
      
      if (recent < older * 0.9) {
        trend = 'declining';
      } else if (recent > older * 1.1) {
        trend = 'improving';
      }
    }

    const subjectPerformance = db.prepare(`
      SELECT 
        esub.subject_name,
        AVG(esr.net_score) as avg_net
      FROM exam_session_results esr
      INNER JOIN exam_subjects esub ON esr.subject_id = esub.id
      INNER JOIN exam_sessions es ON esr.session_id = es.id
      WHERE esr.student_id = ? AND es.school_id = ?
      GROUP BY esub.subject_name
      ORDER BY avg_net ASC
      LIMIT 3
    `).all(student.id, schoolId) as Array<{ subject_name: string; avg_net: number }>;

    const weak_subjects = subjectPerformance.map(s => s.subject_name);

    let risk_level: 'high' | 'medium' | 'low' = 'low';
    if (student.avg_net < 20 || trend === 'declining') {
      risk_level = 'high';
    } else if (student.avg_net < 40) {
      risk_level = 'medium';
    }

    return {
      student_id: student.id,
      student_name: student.name,
      risk_level,
      recent_avg_net: Math.round(student.avg_net * 100) / 100,
      trend,
      weak_subjects,
      last_exam_date: student.last_exam_date
    };
  });
}
