import { randomUUID } from 'node:crypto';
import getDatabase from '../../../lib/database.js';
import type { DailyInsight, StudentDailyStatus, ProactiveAlert } from '../../../../shared/types/daily-insights.types.js';

const db = getDatabase();

// ==================== DAILY INSIGHTS ====================

/**
 * Create or update daily insight for a specific school
 * @param insight - Insight data including REQUIRED schoolId
 */
export function createDailyInsight(insight: Omit<DailyInsight, 'id' | 'generatedAt'> & { schoolId: string }): string {
  if (!insight.schoolId) {
    throw new Error('[SECURITY] createDailyInsight requires schoolId for school isolation');
  }
  
  const id = randomUUID();
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO daily_insights (
      id, schoolId, insightDate, reportType, summary,
      totalStudents, highRiskCount, mediumRiskCount, criticalAlertsCount, newAlertsCount,
      keyFindings, priorityActions, suggestedMeetings,
      aiInsights, trendAnalysis, generatedBy
    ) VALUES (
      COALESCE((SELECT id FROM daily_insights WHERE insightDate = ? AND reportType = ? AND schoolId = ?), ?),
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);
  
  stmt.run(
    insight.insightDate,
    insight.reportType,
    insight.schoolId,
    id,
    insight.schoolId,
    insight.insightDate,
    insight.reportType,
    insight.summary,
    insight.totalStudents,
    insight.highRiskCount,
    insight.mediumRiskCount,
    insight.criticalAlertsCount,
    insight.newAlertsCount,
    insight.keyFindings || null,
    insight.priorityActions || null,
    insight.suggestedMeetings || null,
    insight.aiInsights || null,
    insight.trendAnalysis || null,
    insight.generatedBy
  );
  
  return id;
}

/**
 * Get daily insight by date and school
 * @param date - The date to query
 * @param reportType - Report type (default: GÜNLÜK)
 * @param schoolId - School ID for filtering (REQUIRED)
 */
export function getDailyInsightByDate(date: string, reportType: 'GÜNLÜK' | 'HAFTALIK' | 'AYLIK' = 'GÜNLÜK', schoolId?: string): DailyInsight | null {
  if (!schoolId) {
    throw new Error('[SECURITY] getDailyInsightByDate requires schoolId for school isolation');
  }
  
  const stmt = db.prepare(`
    SELECT * FROM daily_insights
    WHERE insightDate = ? AND reportType = ? AND schoolId = ?
    ORDER BY generatedAt DESC
    LIMIT 1
  `);
  return stmt.get(date, reportType, schoolId) as DailyInsight | null;
}

/**
 * Get latest daily insights for a specific school
 * @param limit - Number of insights to return
 * @param schoolId - School ID for filtering (REQUIRED)
 */
export function getLatestDailyInsights(limit: number = 7, schoolId?: string): DailyInsight[] {
  if (!schoolId) {
    throw new Error('[SECURITY] getLatestDailyInsights requires schoolId for school isolation');
  }
  
  const stmt = db.prepare(`
    SELECT * FROM daily_insights
    WHERE reportType = 'GÜNLÜK' AND schoolId = ?
    ORDER BY insightDate DESC
    LIMIT ?
  `);
  return stmt.all(schoolId, limit) as DailyInsight[];
}

// ==================== STUDENT DAILY STATUS ====================

export function createStudentDailyStatus(status: Omit<StudentDailyStatus, 'id' | 'created_at'>): string {
  const id = randomUUID();
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO student_daily_status (
      id, studentId, statusDate, overallStatus, statusNotes,
      academicChange, behaviorChange, attendanceChange,
      needsAttention, hasNewAlert, hasCriticalAlert, detectedPatterns
    ) VALUES (
      COALESCE((SELECT id FROM student_daily_status WHERE studentId = ? AND statusDate = ?), ?),
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);
  
  stmt.run(
    status.studentId,
    status.statusDate,
    id,
    status.studentId,
    status.statusDate,
    status.overallStatus,
    status.statusNotes || null,
    status.academicChange || null,
    status.behaviorChange || null,
    status.attendanceChange || null,
    status.needsAttention,
    status.hasNewAlert,
    status.hasCriticalAlert,
    status.detectedPatterns || null
  );
  
  return id;
}

export function getStudentDailyStatus(studentId: string, date: string): StudentDailyStatus | null {
  const stmt = db.prepare(`
    SELECT * FROM student_daily_status
    WHERE studentId = ? AND statusDate = ?
  `);
  
  return stmt.get(studentId, date) as StudentDailyStatus | null;
}

/**
 * Get students needing attention for a specific date
 * @param date - The date to filter by
 * @param studentIds - REQUIRED array of student IDs to filter by (for school isolation)
 */
export function getStudentsNeedingAttention(date: string, studentIds?: string[]): StudentDailyStatus[] {
  if (!studentIds) {
    throw new Error('[SECURITY] getStudentsNeedingAttention requires studentIds for school isolation');
  }
  
  if (studentIds.length === 0) {
    return [];
  }
  
  const placeholders = studentIds.map(() => '?').join(',');
  const stmt = db.prepare(`
    SELECT * FROM student_daily_status
    WHERE statusDate = ? AND needsAttention = 1 AND studentId IN (${placeholders})
    ORDER BY hasCriticalAlert DESC, overallStatus DESC
  `);
  return stmt.all(date, ...studentIds) as StudentDailyStatus[];
}

export function getStudentStatusHistory(studentId: string, days: number = 30): StudentDailyStatus[] {
  const stmt = db.prepare(`
    SELECT * FROM student_daily_status
    WHERE studentId = ? AND statusDate >= date('now', '-' || ? || ' days')
    ORDER BY statusDate DESC
  `);
  
  return stmt.all(studentId, days) as StudentDailyStatus[];
}

// ==================== PROACTIVE ALERTS ====================

export function createProactiveAlert(alert: Omit<ProactiveAlert, 'id' | 'detectedAt'>): string {
  const id = randomUUID();
  
  const stmt = db.prepare(`
    INSERT INTO proactive_alerts (
      id, studentId, alertCategory, severity, title, description,
      evidence, recommendation, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    alert.studentId || null,
    alert.alertCategory,
    alert.severity,
    alert.title,
    alert.description,
    alert.evidence || null,
    alert.recommendation || null,
    alert.status || 'YENİ'
  );
  
  return id;
}

/**
 * Get proactive alerts with filters
 * @param filters - Filter options including REQUIRED studentIds for school isolation
 */
export function getProactiveAlerts(filters: {
  status?: string;
  severity?: string;
  studentId?: string;
  studentIds: string[];
  limit?: number;
}): ProactiveAlert[] {
  if (!filters.studentIds) {
    throw new Error('[SECURITY] getProactiveAlerts requires studentIds for school isolation');
  }
  
  if (filters.studentIds.length === 0) {
    return [];
  }
  
  let query = 'SELECT * FROM proactive_alerts WHERE 1=1';
  const params: (string | number)[] = [];
  
  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  
  if (filters.severity) {
    query += ' AND severity = ?';
    params.push(filters.severity);
  }
  
  if (filters.studentId) {
    if (!filters.studentIds.includes(filters.studentId)) {
      return [];
    }
    query += ' AND studentId = ?';
    params.push(filters.studentId);
  }
  
  const placeholders = filters.studentIds.map(() => '?').join(',');
  query += ` AND studentId IN (${placeholders})`;
  params.push(...filters.studentIds);
  
  query += ' ORDER BY detectedAt DESC';
  
  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }
  
  const stmt = db.prepare(query);
  return stmt.all(...params) as ProactiveAlert[];
}

export function updateProactiveAlertStatus(
  id: string, 
  status: ProactiveAlert['status'],
  actionTaken?: string
): void {
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    UPDATE proactive_alerts
    SET status = ?,
        actionTaken = ?,
        acknowledgedAt = CASE WHEN status = 'GÖRÜLDÜ' THEN ? ELSE acknowledgedAt END,
        resolvedAt = CASE WHEN status IN ('ÇÖZÜLDÜ', 'GÖRMEZDEN_GELİNDİ') THEN ? ELSE resolvedAt END
    WHERE id = ?
  `);
  
  stmt.run(status, actionTaken || null, now, now, id);
}

export function assignProactiveAlert(id: string, assignedTo: string): void {
  const stmt = db.prepare(`
    UPDATE proactive_alerts
    SET assignedTo = ?,
        status = CASE WHEN status = 'YENİ' THEN 'AKSIYONA_ALINDI' ELSE status END
    WHERE id = ?
  `);
  
  stmt.run(assignedTo, id);
}

// ==================== ANALYTICS ====================

/**
 * Get daily insights statistics for a specific school
 * @param date - The date to query
 * @param studentIds - Optional array of student IDs for school isolation
 */
export function getDailyInsightsStats(date: string, studentIds?: string[]): {
  totalAlerts: number;
  criticalAlerts: number;
  studentsNeedingAttention: number;
  positiveUpdates: number;
} {
  if (studentIds && studentIds.length === 0) {
    return { totalAlerts: 0, criticalAlerts: 0, studentsNeedingAttention: 0, positiveUpdates: 0 };
  }
  
  let alertsQuery = `
    SELECT 
      COUNT(*) as totalAlerts,
      SUM(CASE WHEN severity = 'KRİTİK' THEN 1 ELSE 0 END) as criticalAlerts,
      SUM(CASE WHEN alertCategory = 'POZİTİF_GELİŞİM' THEN 1 ELSE 0 END) as positiveUpdates
    FROM proactive_alerts
    WHERE date(detectedAt) = ?
  `;
  
  let studentsQuery = `
    SELECT COUNT(*) as count
    FROM student_daily_status
    WHERE statusDate = ? AND needsAttention = 1
  `;
  
  const params: any[] = [date];
  
  if (studentIds && studentIds.length > 0) {
    const placeholders = studentIds.map(() => '?').join(',');
    alertsQuery += ` AND studentId IN (${placeholders})`;
    studentsQuery += ` AND studentId IN (${placeholders})`;
    params.push(...studentIds);
  } else if (!studentIds) {
    throw new Error('[SECURITY] getDailyInsightsStats requires studentIds for school isolation');
  }
  
  const alerts = db.prepare(alertsQuery).get(...params) as { totalAlerts: number; criticalAlerts: number; positiveUpdates: number } | undefined;
  const students = db.prepare(studentsQuery).get(...params) as { count: number } | undefined;
  
  return {
    totalAlerts: alerts?.totalAlerts || 0,
    criticalAlerts: alerts?.criticalAlerts || 0,
    studentsNeedingAttention: students?.count || 0,
    positiveUpdates: alerts?.positiveUpdates || 0
  };
}

/**
 * Check if an alert belongs to a specific set of students (for ownership validation)
 * @param alertId - The alert ID to check
 * @param studentIds - Array of allowed student IDs
 */
export function isAlertOwnedByStudents(alertId: string, studentIds: string[]): boolean {
  if (!studentIds || studentIds.length === 0) return false;
  
  const placeholders = studentIds.map(() => '?').join(',');
  const stmt = db.prepare(`
    SELECT 1 FROM proactive_alerts 
    WHERE id = ? AND studentId IN (${placeholders})
    LIMIT 1
  `);
  
  return !!stmt.get(alertId, ...studentIds);
}
