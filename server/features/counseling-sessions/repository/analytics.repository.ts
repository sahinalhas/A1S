import getDatabase from '../../../lib/database.js';
import type {
  OverallStats,
  TimeSeriesData,
  TopicAnalysis,
  ParticipantAnalysis,
  ClassAnalysis,
  SessionModeAnalysis,
  StudentSessionStats,
  SessionHistory
} from '../types/counseling-sessions.types.js';

interface AnalyticsStatements {
  getOverallStats: any;
  getTimeSeriesDaily: any;
  getTimeSeriesWeekly: any;
  getTimeSeriesMonthly: any;
  getTopicAnalysis: any;
  getParticipantTypeAnalysis: any;
  getClassAnalysis: any;
  getSessionModeAnalysis: any;
  getStudentSessionCount: any;
  getStudentLastSession: any;
  getStudentTopics: any;
  getStudentHistory: any;
}

let statements: AnalyticsStatements | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getOverallStats: db.prepare(`
      SELECT
        COUNT(*) as totalSessions,
        SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as activeSessions,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completedSessions,
        SUM(CASE WHEN strftime('%Y-%m', sessionDate) = strftime('%Y-%m', 'now') THEN 1 ELSE 0 END) as monthSessions,
        SUM(CASE WHEN date(sessionDate) >= date('now', '-7 days') THEN 1 ELSE 0 END) as weekSessions,
        SUM(CASE WHEN sessionDate = date('now') THEN 1 ELSE 0 END) as todaySessions,
        ROUND(AVG(
          CASE 
            WHEN exitTime IS NOT NULL AND completed = 1 
            THEN CAST((julianday(sessionDate || ' ' || exitTime) - julianday(sessionDate || ' ' || entryTime)) * 24 * 60 AS INTEGER)
            ELSE NULL
          END
        ), 2) as avgDuration,
        MAX(
          CASE 
            WHEN exitTime IS NOT NULL AND completed = 1 
            THEN CAST((julianday(sessionDate || ' ' || exitTime) - julianday(sessionDate || ' ' || entryTime)) * 24 * 60 AS INTEGER)
            ELSE NULL
          END
        ) as maxDuration,
        MIN(
          CASE 
            WHEN exitTime IS NOT NULL AND completed = 1 AND
                 CAST((julianday(sessionDate || ' ' || exitTime) - julianday(sessionDate || ' ' || entryTime)) * 24 * 60 AS INTEGER) > 0
            THEN CAST((julianday(sessionDate || ' ' || exitTime) - julianday(sessionDate || ' ' || entryTime)) * 24 * 60 AS INTEGER)
            ELSE NULL
          END
        ) as minDuration,
        ROUND(
          CAST(SUM(CASE WHEN sessionType = 'individual' THEN 1 ELSE 0 END) AS REAL) * 100.0 / NULLIF(COUNT(*), 0),
          2
        ) as individualPercentage,
        ROUND(
          CAST(SUM(CASE WHEN sessionType = 'group' THEN 1 ELSE 0 END) AS REAL) * 100.0 / NULLIF(COUNT(*), 0),
          2
        ) as groupPercentage
      FROM counseling_sessions
    `),
    
    getTimeSeriesDaily: db.prepare(`
      WITH RECURSIVE dates(date) AS (
        SELECT date(?)
        UNION ALL
        SELECT date(date, '+1 day')
        FROM dates
        WHERE date < date(?)
      )
      SELECT 
        dates.date,
        COALESCE(COUNT(cs.id), 0) as count,
        COALESCE(SUM(CASE WHEN cs.completed = 1 THEN 1 ELSE 0 END), 0) as completed,
        COALESCE(SUM(CASE WHEN cs.completed = 0 THEN 1 ELSE 0 END), 0) as active
      FROM dates
      LEFT JOIN counseling_sessions cs ON date(cs.sessionDate) = dates.date
      GROUP BY dates.date
      ORDER BY dates.date
    `),
    
    getTimeSeriesWeekly: db.prepare(`
      SELECT 
        strftime('%Y-W%W', sessionDate) as date,
        COUNT(*) as count,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as active
      FROM counseling_sessions
      WHERE date(sessionDate) BETWEEN date(?) AND date(?)
      GROUP BY strftime('%Y-W%W', sessionDate)
      ORDER BY date
    `),
    
    getTimeSeriesMonthly: db.prepare(`
      SELECT 
        strftime('%Y-%m', sessionDate) as date,
        COUNT(*) as count,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as active
      FROM counseling_sessions
      WHERE date(sessionDate) BETWEEN date(?) AND date(?)
      GROUP BY strftime('%Y-%m', sessionDate)
      ORDER BY date
    `),
    
    getTopicAnalysis: db.prepare(`
      SELECT 
        topic,
        COUNT(*) as count,
        ROUND(AVG(
          CASE 
            WHEN exitTime IS NOT NULL AND completed = 1 
            THEN CAST((julianday(sessionDate || ' ' || exitTime) - julianday(sessionDate || ' ' || entryTime)) * 24 * 60 AS INTEGER)
            ELSE NULL
          END
        ), 2) as avgDuration
      FROM counseling_sessions
      GROUP BY topic
      ORDER BY count DESC
      LIMIT 10
    `),
    
    getParticipantTypeAnalysis: db.prepare(`
      SELECT 
        participantType as type,
        COUNT(*) as count,
        ROUND(CAST(COUNT(*) AS REAL) * 100.0 / (SELECT COUNT(*) FROM counseling_sessions), 2) as percentage
      FROM counseling_sessions
      GROUP BY participantType
      ORDER BY count DESC
    `),
    
    getClassAnalysis: db.prepare(`
      SELECT 
        COALESCE(s.class, 'Sınıf Belirtilmemiş') as className,
        COUNT(DISTINCT cs.id) as count
      FROM counseling_sessions cs
      LEFT JOIN counseling_session_students css ON cs.id = css.sessionId
      LEFT JOIN students s ON css.studentId = s.id
      GROUP BY s.class
      ORDER BY count DESC
    `),
    
    getSessionModeAnalysis: db.prepare(`
      SELECT 
        sessionMode as mode,
        COUNT(*) as count,
        ROUND(CAST(COUNT(*) AS REAL) * 100.0 / (SELECT COUNT(*) FROM counseling_sessions), 2) as percentage
      FROM counseling_sessions
      GROUP BY sessionMode
      ORDER BY count DESC
    `),
    
    getStudentSessionCount: db.prepare(`
      SELECT COUNT(DISTINCT cs.id) as totalSessions
      FROM counseling_sessions cs
      INNER JOIN counseling_session_students css ON cs.id = css.sessionId
      WHERE css.studentId = ?
    `),
    
    getStudentLastSession: db.prepare(`
      SELECT MAX(cs.sessionDate) as lastSessionDate
      FROM counseling_sessions cs
      INNER JOIN counseling_session_students css ON cs.id = css.sessionId
      WHERE css.studentId = ?
    `),
    
    getStudentTopics: db.prepare(`
      SELECT DISTINCT cs.topic
      FROM counseling_sessions cs
      INNER JOIN counseling_session_students css ON cs.id = css.sessionId
      WHERE css.studentId = ?
      ORDER BY cs.sessionDate DESC
    `),
    
    getStudentHistory: db.prepare(`
      SELECT 
        cs.id as sessionId,
        cs.sessionDate,
        cs.topic,
        cs.sessionMode,
        CASE 
          WHEN cs.exitTime IS NOT NULL AND cs.completed = 1 
          THEN CAST((julianday(cs.sessionDate || ' ' || cs.exitTime) - julianday(cs.sessionDate || ' ' || cs.entryTime)) * 24 * 60 AS INTEGER)
          ELSE 0
        END as duration
      FROM counseling_sessions cs
      INNER JOIN counseling_session_students css ON cs.id = css.sessionId
      WHERE css.studentId = ?
      ORDER BY cs.sessionDate DESC, cs.entryTime DESC
    `)
  };
  
  isInitialized = true;
}

export function getOverallStats(): OverallStats {
  ensureInitialized();
  const result = statements!.getOverallStats.get();
  
  return {
    totalSessions: result.totalSessions || 0,
    activeSessions: result.activeSessions || 0,
    completedSessions: result.completedSessions || 0,
    monthSessions: result.monthSessions || 0,
    weekSessions: result.weekSessions || 0,
    todaySessions: result.todaySessions || 0,
    avgDuration: result.avgDuration || 0,
    maxDuration: result.maxDuration || 0,
    minDuration: result.minDuration || 0,
    individualPercentage: result.individualPercentage || 0,
    groupPercentage: result.groupPercentage || 0
  };
}

export function getTimeSeriesData(
  period: 'daily' | 'weekly' | 'monthly',
  startDate: string,
  endDate: string
): TimeSeriesData[] {
  ensureInitialized();
  
  let statement;
  switch (period) {
    case 'daily':
      statement = statements!.getTimeSeriesDaily;
      break;
    case 'weekly':
      statement = statements!.getTimeSeriesWeekly;
      break;
    case 'monthly':
      statement = statements!.getTimeSeriesMonthly;
      break;
    default:
      statement = statements!.getTimeSeriesDaily;
  }
  
  const results = statement.all(startDate, endDate);
  return results.map((row: Record<string, any>) => ({
    date: row.date,
    count: row.count || 0,
    completed: row.completed || 0,
    active: row.active || 0
  }));
}

export function getTopicAnalysis(): TopicAnalysis[] {
  ensureInitialized();
  const results = statements!.getTopicAnalysis.all();
  
  return results.map((row: Record<string, any>) => ({
    topic: row.topic,
    count: row.count || 0,
    avgDuration: row.avgDuration || 0
  }));
}

export function getParticipantTypeAnalysis(): ParticipantAnalysis[] {
  ensureInitialized();
  const results = statements!.getParticipantTypeAnalysis.all();
  
  return results.map((row: Record<string, any>) => ({
    type: row.type,
    count: row.count || 0,
    percentage: row.percentage || 0
  }));
}

export function getClassAnalysis(): ClassAnalysis[] {
  ensureInitialized();
  const results = statements!.getClassAnalysis.all();
  
  return results.map((row: Record<string, any>) => ({
    className: row.className,
    count: row.count || 0
  }));
}

export function getSessionModeAnalysis(): SessionModeAnalysis[] {
  ensureInitialized();
  const results = statements!.getSessionModeAnalysis.all();
  
  return results.map((row: Record<string, any>) => ({
    mode: row.mode,
    count: row.count || 0,
    percentage: row.percentage || 0
  }));
}

export function getStudentSessionStats(studentId: string): StudentSessionStats {
  ensureInitialized();
  
  const countResult = statements!.getStudentSessionCount.get(studentId);
  const lastSessionResult = statements!.getStudentLastSession.get(studentId);
  const topicsResults = statements!.getStudentTopics.all(studentId);
  const historyResults = statements!.getStudentHistory.all(studentId);
  
  return {
    totalSessions: countResult?.totalSessions || 0,
    lastSessionDate: lastSessionResult?.lastSessionDate || null,
    topics: topicsResults.map((row: Record<string, any>) => row.topic),
    history: historyResults.map((row: Record<string, any>) => ({
      sessionId: row.sessionId,
      sessionDate: row.sessionDate,
      topic: row.topic,
      duration: row.duration || 0,
      sessionMode: row.sessionMode
    }))
  };
}
