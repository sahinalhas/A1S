import * as examSessionsRepo from '../repository/exam-sessions.repository.js';
import * as examResultsRepo from '../repository/exam-results.repository.js';
import * as examTypesRepo from '../repository/exam-types.repository.js';
import type {
  SessionComparison,
  SessionComparisonItem,
  SubjectComparisonData,
  TrendAnalysis,
  TrendDataPoint
} from '../../../../shared/types/exam-management.types.js';

export function compareExamSessions(
  sessionIds: string[],
  comparisonType: 'overall' | 'subject' | 'student' = 'overall'
): SessionComparison | null {
  try {
    if (sessionIds.length < 2) {
      return null;
    }

    const sessions: SessionComparisonItem[] = sessionIds.map(sessionId => {
      const session = examSessionsRepo.getExamSessionById(sessionId);
      if (!session) {
        return null;
      }

      const results = examResultsRepo.getExamResultsBySession(sessionId);
      const participants = new Set(results.map(r => r.student_id)).size;
      
      const studentNets = Array.from(new Set(results.map(r => r.student_id))).map(studentId => {
        const studentResults = results.filter(r => r.student_id === studentId);
        return studentResults.reduce((sum, r) => sum + r.net_score, 0);
      });

      const avg_net = studentNets.length > 0
        ? studentNets.reduce((a, b) => a + b, 0) / studentNets.length
        : 0;
      
      const highest_net = studentNets.length > 0 ? Math.max(...studentNets) : 0;
      const lowest_net = studentNets.length > 0 ? Math.min(...studentNets) : 0;

      return {
        session_id: sessionId,
        session_name: session.name,
        exam_date: session.exam_date,
        avg_net: Math.round(avg_net * 100) / 100,
        highest_net: Math.round(highest_net * 100) / 100,
        lowest_net: Math.round(lowest_net * 100) / 100,
        participants
      };
    }).filter(s => s !== null) as SessionComparisonItem[];

    let subject_comparisons: SubjectComparisonData[] | undefined;

    if (comparisonType === 'subject') {
      const firstSession = examSessionsRepo.getExamSessionById(sessionIds[0]);
      if (firstSession) {
        const subjects = examTypesRepo.getSubjectsByExamType(firstSession.exam_type_id);
        
        subject_comparisons = subjects.map(subject => {
          const sessionData = sessionIds.map(sessionId => {
            const session = examSessionsRepo.getExamSessionById(sessionId);
            const results = examResultsRepo.getExamResultsBySession(sessionId)
              .filter(r => r.subject_id === subject.id);
            
            const avg_net = results.length > 0
              ? results.reduce((sum, r) => sum + r.net_score, 0) / results.length
              : 0;

            return {
              session_id: sessionId,
              session_name: session?.name || sessionId,
              avg_net: Math.round(avg_net * 100) / 100
            };
          });

          return {
            subject_name: subject.subject_name,
            sessions: sessionData
          };
        });
      }
    }

    return {
      sessions,
      comparison_type: comparisonType,
      subject_comparisons
    };
  } catch (error) {
    console.error('Error in compareExamSessions:', error);
    return null;
  }
}

export function getTrendAnalysis(
  examTypeId: string,
  period: 'last_6' | 'last_12' | 'all' = 'last_6'
): TrendAnalysis | null {
  try {
    const examType = examTypesRepo.getAllExamTypes().find(t => t.id === examTypeId);
    if (!examType) {
      return null;
    }

    const allSessions = examSessionsRepo.getExamSessionsByType(examTypeId)
      .sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime());

    let limitedSessions = allSessions;
    if (period === 'last_6') {
      limitedSessions = allSessions.slice(0, 6);
    } else if (period === 'last_12') {
      limitedSessions = allSessions.slice(0, 12);
    }

    const data_points: TrendDataPoint[] = limitedSessions
      .reverse()
      .map(session => {
        const results = examResultsRepo.getExamResultsBySession(session.id);
        const participants = new Set(results.map(r => r.student_id)).size;
        
        const studentNets = Array.from(new Set(results.map(r => r.student_id))).map(studentId => {
          const studentResults = results.filter(r => r.student_id === studentId);
          return studentResults.reduce((sum, r) => sum + r.net_score, 0);
        });

        const avg_net = studentNets.length > 0
          ? studentNets.reduce((a, b) => a + b, 0) / studentNets.length
          : 0;

        return {
          session_id: session.id,
          session_name: session.name,
          exam_date: session.exam_date,
          avg_net: Math.round(avg_net * 100) / 100,
          participants
        };
      });

    let overall_trend: 'improving' | 'declining' | 'stable' = 'stable';
    let trend_percentage = 0;

    if (data_points.length >= 3) {
      const firstHalf = data_points.slice(0, Math.floor(data_points.length / 2));
      const secondHalf = data_points.slice(Math.floor(data_points.length / 2));

      const firstAvg = firstHalf.reduce((sum, d) => sum + d.avg_net, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, d) => sum + d.avg_net, 0) / secondHalf.length;

      trend_percentage = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

      if (trend_percentage > 5) {
        overall_trend = 'improving';
      } else if (trend_percentage < -5) {
        overall_trend = 'declining';
      }
    }

    return {
      exam_type_id: examTypeId,
      exam_type_name: examType.name,
      period,
      data_points,
      overall_trend,
      trend_percentage: Math.round(trend_percentage * 100) / 100
    };
  } catch (error) {
    console.error('Error in getTrendAnalysis:', error);
    return null;
  }
}
