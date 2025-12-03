/**
 * Trend Analysis Repository
 * Trend Analizi Veri Erişim Katmanı
 * 
 * [SECURITY] Tüm sorgular schoolId ile filtrelenerek okul veri izolasyonu sağlanır
 */

import { getDatabase } from '../../../lib/database/connection.js';
import type { TrendData, TimeSeriesAnalysis } from '../types/advanced-reports.types.js';

export function getTrendData(
  schoolId: string,
  period: 'daily' | 'weekly' | 'monthly',
  startDate?: string,
  endDate?: string
): TrendData[] {
  if (!schoolId) {
    throw new Error('[SECURITY] getTrendData requires schoolId for school isolation');
  }

  const db = getDatabase();
  
  const start = startDate || getDefaultStartDate(period);
  const end = endDate || new Date().toISOString().split('T')[0];
  
  let groupBy = '';
  let dateFormat = '';
  
  switch (period) {
    case 'daily':
      groupBy = "DATE(created_at)";
      dateFormat = "DATE(created_at)";
      break;
    case 'weekly':
      groupBy = "strftime('%Y-W%W', created_at)";
      dateFormat = "strftime('%Y-W%W', created_at)";
      break;
    case 'monthly':
      groupBy = "strftime('%Y-%m', created_at)";
      dateFormat = "strftime('%Y-%m', created_at)";
      break;
  }
  
  const query = `
    WITH period_data AS (
      SELECT 
        ${dateFormat} as period,
        AVG(sas.avg_exam_score) as academicAverage,
        AVG(sas.attendance_rate) as attendanceRate,
        COUNT(DISTINCT sas.student_id) as totalStudents,
        SUM(CASE WHEN sas.risk_level IN ('Yüksek', 'Kritik') THEN 1 ELSE 0 END) as riskStudents
      FROM student_analytics_snapshot sas
      INNER JOIN students s ON sas.student_id = s.id
      WHERE DATE(sas.last_updated) BETWEEN ? AND ? AND s.schoolId = ?
      GROUP BY ${groupBy}
    ),
    session_data AS (
      SELECT 
        ${dateFormat.replace('created_at', 'sessionDate')} as period,
        COUNT(*) as sessionCount
      FROM counseling_sessions
      WHERE DATE(sessionDate) BETWEEN ? AND ? AND schoolId = ?
      GROUP BY ${groupBy.replace('created_at', 'sessionDate')}
    ),
    behavior_data AS (
      SELECT 
        ${dateFormat.replace('created_at', 'incidentDate')} as period,
        COUNT(*) as behaviorIncidents
      FROM behavior_incidents bi
      INNER JOIN students s ON bi.studentId = s.id
      WHERE DATE(bi.incidentDate) BETWEEN ? AND ? AND s.schoolId = ?
      GROUP BY ${groupBy.replace('created_at', 'incidentDate')}
    )
    SELECT 
      pd.period,
      pd.period as date,
      COALESCE(pd.academicAverage, 0) as academicAverage,
      COALESCE(pd.attendanceRate, 0) as attendanceRate,
      COALESCE(sd.sessionCount, 0) as sessionCount,
      COALESCE(pd.riskStudents, 0) as riskStudents,
      COALESCE(bd.behaviorIncidents, 0) as behaviorIncidents
    FROM period_data pd
    LEFT JOIN session_data sd ON pd.period = sd.period
    LEFT JOIN behavior_data bd ON pd.period = bd.period
    ORDER BY pd.period
  `;
  
  return db.prepare(query).all(start, end, schoolId, start, end, schoolId, start, end, schoolId) as TrendData[];
}

export function analyzeTimeSeries(
  schoolId: string,
  period: 'daily' | 'weekly' | 'monthly',
  startDate?: string,
  endDate?: string
): TimeSeriesAnalysis {
  if (!schoolId) {
    throw new Error('[SECURITY] analyzeTimeSeries requires schoolId for school isolation');
  }

  const trends = getTrendData(schoolId, period, startDate, endDate);
  
  if (trends.length === 0) {
    return createEmptyAnalysis(period, startDate, endDate);
  }
  
  const insights = analyzeTrends(trends);
  const predictions = makePredictions(trends);
  
  return {
    period,
    startDate: startDate || getDefaultStartDate(period),
    endDate: endDate || new Date().toISOString().split('T')[0],
    trends,
    insights,
    predictions,
  };
}

function analyzeTrends(trends: TrendData[]): {
  improving: string[];
  declining: string[];
  stable: string[];
} {
  const improving: string[] = [];
  const declining: string[] = [];
  const stable: string[] = [];
  
  if (trends.length < 2) {
    return { improving, declining, stable };
  }
  
  const academicTrend = calculateTrendDirection(trends.map(t => t.academicAverage));
  if (academicTrend > 0.05) {
    improving.push('Akademik başarı artışta');
  } else if (academicTrend < -0.05) {
    declining.push('Akademik başarı düşüşte');
  } else {
    stable.push('Akademik başarı stabil');
  }
  
  const attendanceTrend = calculateTrendDirection(trends.map(t => t.attendanceRate));
  if (attendanceTrend > 0.02) {
    improving.push('Devam oranı iyileşiyor');
  } else if (attendanceTrend < -0.02) {
    declining.push('Devam oranı kötüleşiyor');
  } else {
    stable.push('Devam oranı stabil');
  }
  
  const riskTrend = calculateTrendDirection(trends.map(t => t.riskStudents));
  if (riskTrend < -0.5) {
    improving.push('Risk altındaki öğrenci sayısı azalıyor');
  } else if (riskTrend > 0.5) {
    declining.push('Risk altındaki öğrenci sayısı artıyor');
  } else {
    stable.push('Risk durumu stabil');
  }
  
  const behaviorTrend = calculateTrendDirection(trends.map(t => t.behaviorIncidents));
  if (behaviorTrend < -0.5) {
    improving.push('Davranış olayları azalıyor');
  } else if (behaviorTrend > 0.5) {
    declining.push('Davranış olayları artıyor');
  } else {
    stable.push('Davranış durumu stabil');
  }
  
  return { improving, declining, stable };
}

function calculateTrendDirection(values: number[]): number {
  if (values.length < 2) return 0;
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  return secondAvg - firstAvg;
}

function makePredictions(trends: TrendData[]): {
  nextPeriod: string;
  academicTrend: 'up' | 'down' | 'stable';
  riskTrend: 'up' | 'down' | 'stable';
  confidence: number;
} {
  if (trends.length < 3) {
    return {
      nextPeriod: 'Yetersiz veri',
      academicTrend: 'stable',
      riskTrend: 'stable',
      confidence: 0,
    };
  }
  
  const academicDir = calculateTrendDirection(trends.map(t => t.academicAverage));
  const riskDir = calculateTrendDirection(trends.map(t => t.riskStudents));
  
  const academicTrend = academicDir > 1 ? 'up' : academicDir < -1 ? 'down' : 'stable';
  const riskTrend = riskDir > 0.5 ? 'up' : riskDir < -0.5 ? 'down' : 'stable';
  
  const confidence = Math.min(0.85, 0.5 + (trends.length * 0.05));
  
  return {
    nextPeriod: getNextPeriod(trends[trends.length - 1].period),
    academicTrend,
    riskTrend,
    confidence,
  };
}

function getDefaultStartDate(period: 'daily' | 'weekly' | 'monthly'): string {
  const now = new Date();
  
  switch (period) {
    case 'daily':
      now.setDate(now.getDate() - 30);
      break;
    case 'weekly':
      now.setDate(now.getDate() - 90);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() - 12);
      break;
  }
  
  return now.toISOString().split('T')[0];
}

function getNextPeriod(currentPeriod: string): string {
  const date = new Date(currentPeriod);
  
  if (currentPeriod.includes('-W')) {
    date.setDate(date.getDate() + 7);
    return `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
  } else if (currentPeriod.length === 7) {
    date.setMonth(date.getMonth() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  } else {
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }
}

function createEmptyAnalysis(
  period: 'daily' | 'weekly' | 'monthly',
  startDate?: string,
  endDate?: string
): TimeSeriesAnalysis {
  return {
    period,
    startDate: startDate || getDefaultStartDate(period),
    endDate: endDate || new Date().toISOString().split('T')[0],
    trends: [],
    insights: {
      improving: [],
      declining: [],
      stable: ['Veri bulunmuyor'],
    },
    predictions: {
      nextPeriod: 'Bilinmiyor',
      academicTrend: 'stable',
      riskTrend: 'stable',
      confidence: 0,
    },
  };
}
