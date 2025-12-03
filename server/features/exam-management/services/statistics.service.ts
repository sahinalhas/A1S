import * as examResultsRepo from '../repository/exam-results.repository.js';
import * as examTypesRepo from '../repository/exam-types.repository.js';
import * as examSessionsRepo from '../repository/exam-sessions.repository.js';
import type {
  ExamStatistics,
  SubjectStatistics,
  StudentExamStatistics,
  SubjectPerformance,
  RecentExamSummary
} from '../../../../shared/types/exam-management.types.js';

export function calculateExamSessionStatistics(sessionId: string): ExamStatistics | null {
  try {
    const session = examSessionsRepo.getExamSessionById(sessionId);
    if (!session) {
      return null;
    }

    const results = examResultsRepo.getExamResultsBySession(sessionId);
    if (results.length === 0) {
      return null;
    }

    const subjects = examTypesRepo.getSubjectsByExamType(session.exam_type_id);
    const studentIds = new Set(results.map(r => r.student_id));
    const totalStudents = studentIds.size;

    const subjectStats: SubjectStatistics[] = subjects.map(subject => {
      const subjectResults = results.filter(r => r.subject_id === subject.id);
      
      if (subjectResults.length === 0) {
        return {
          subject_id: subject.id,
          subject_name: subject.subject_name,
          question_count: subject.question_count,
          avg_correct: 0,
          avg_wrong: 0,
          avg_empty: 0,
          avg_net: 0,
          highest_net: 0,
          lowest_net: 0,
          std_deviation: 0
        };
      }

      const corrects = subjectResults.map(r => r.correct_count);
      const wrongs = subjectResults.map(r => r.wrong_count);
      const empties = subjectResults.map(r => r.empty_count);
      const nets = subjectResults.map(r => r.net_score);

      const avgCorrect = corrects.reduce((a, b) => a + b, 0) / subjectResults.length;
      const avgWrong = wrongs.reduce((a, b) => a + b, 0) / subjectResults.length;
      const avgEmpty = empties.reduce((a, b) => a + b, 0) / subjectResults.length;
      const avgNet = nets.reduce((a, b) => a + b, 0) / subjectResults.length;
      const highestNet = Math.max(...nets);
      const lowestNet = Math.min(...nets);

      const variance = nets.reduce((sum, net) => sum + Math.pow(net - avgNet, 2), 0) / nets.length;
      const stdDeviation = Math.sqrt(variance);

      return {
        subject_id: subject.id,
        subject_name: subject.subject_name,
        question_count: subject.question_count,
        avg_correct: Math.round(avgCorrect * 100) / 100,
        avg_wrong: Math.round(avgWrong * 100) / 100,
        avg_empty: Math.round(avgEmpty * 100) / 100,
        avg_net: Math.round(avgNet * 100) / 100,
        highest_net: Math.round(highestNet * 100) / 100,
        lowest_net: Math.round(lowestNet * 100) / 100,
        std_deviation: Math.round(stdDeviation * 100) / 100
      };
    });

    const studentTotalNets = Array.from(studentIds).map(studentId => {
      const studentResults = results.filter(r => r.student_id === studentId);
      return studentResults.reduce((sum, r) => sum + r.net_score, 0);
    });

    const avgTotalNet = studentTotalNets.reduce((a, b) => a + b, 0) / studentTotalNets.length;
    const highestTotalNet = Math.max(...studentTotalNets);
    const lowestTotalNet = Math.min(...studentTotalNets);

    return {
      session_id: sessionId,
      session_name: session.name,
      exam_type_id: session.exam_type_id,
      exam_date: session.exam_date,
      total_students: totalStudents,
      subject_stats: subjectStats,
      overall_stats: {
        avg_total_net: Math.round(avgTotalNet * 100) / 100,
        highest_total_net: Math.round(highestTotalNet * 100) / 100,
        lowest_total_net: Math.round(lowestTotalNet * 100) / 100
      }
    };
  } catch (error) {
    console.error('Error in calculateExamSessionStatistics:', error);
    return null;
  }
}

export function calculateStudentExamStatistics(studentId: string, examTypeId?: string): StudentExamStatistics | null {
  try {
    const allResults = examResultsRepo.getExamResultsByStudent(studentId);
    if (allResults.length === 0) {
      return null;
    }

    const filteredResults = examTypeId
      ? allResults.filter(r => r.exam_type_id === examTypeId)
      : allResults;

    if (filteredResults.length === 0) {
      return null;
    }

    const sessionIds = new Set(filteredResults.map(r => r.session_id));
    const totalExams = sessionIds.size;

    const sessionNets = Array.from(sessionIds).map(sessionId => {
      const sessionResults = filteredResults.filter(r => r.session_id === sessionId);
      const totalNet = sessionResults.reduce((sum, r) => sum + r.net_score, 0);
      const session = sessionResults[0];
      return {
        session_id: sessionId,
        session_name: session.session_name || '',
        exam_date: session.exam_date || '',
        total_net: totalNet
      };
    }).sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime());

    const netScores = sessionNets.map(s => s.total_net);
    const avgNetScore = netScores.reduce((a, b) => a + b, 0) / netScores.length;
    const bestNetScore = Math.max(...netScores);
    const worstNetScore = Math.min(...netScores);

    let improvementRate = 0;
    if (sessionNets.length >= 2) {
      const recent = sessionNets.slice(0, Math.min(3, sessionNets.length));
      const older = sessionNets.slice(-Math.min(3, sessionNets.length));
      const recentAvg = recent.reduce((a, b) => a + b.total_net, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b.total_net, 0) / older.length;
      improvementRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
    }

    const subjectIds = new Set(filteredResults.map(r => r.subject_id));
    const subjectPerformance: SubjectPerformance[] = Array.from(subjectIds).map(subjectId => {
      const subjectResults = filteredResults.filter(r => r.subject_id === subjectId);
      const nets = subjectResults.map(r => r.net_score);
      const avgNet = nets.reduce((a, b) => a + b, 0) / nets.length;

      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (nets.length >= 3) {
        const recent = nets.slice(0, Math.min(2, nets.length));
        const older = nets.slice(-Math.min(2, nets.length));
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        const change = recentAvg - olderAvg;
        if (change > 1) trend = 'improving';
        else if (change < -1) trend = 'declining';
      }

      const subject = subjectResults[0];
      const strengthLevel = avgNet > 70 ? 'strong' : avgNet > 40 ? 'moderate' : 'weak';

      return {
        subject_id: subjectId,
        subject_name: subject.subject_name || '',
        avg_net: Math.round(avgNet * 100) / 100,
        trend,
        strength_level: strengthLevel
      };
    });

    return {
      student_id: studentId,
      student_name: filteredResults[0].student_name || '',
      exam_type_id: examTypeId || filteredResults[0].exam_type_id || '',
      total_exams: totalExams,
      avg_net_score: Math.round(avgNetScore * 100) / 100,
      best_net_score: Math.round(bestNetScore * 100) / 100,
      worst_net_score: Math.round(worstNetScore * 100) / 100,
      improvement_rate: Math.round(improvementRate * 100) / 100,
      subject_performance: subjectPerformance,
      recent_exams: sessionNets.slice(0, 5).map(s => ({
        ...s,
        total_net: Math.round(s.total_net * 100) / 100
      }))
    };
  } catch (error) {
    console.error('Error in calculateStudentExamStatistics:', error);
    return null;
  }
}
