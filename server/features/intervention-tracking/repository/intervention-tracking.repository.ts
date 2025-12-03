import getDatabase from '../../../lib/database.js';
import { randomUUID } from 'crypto';
import type { InterventionEffectiveness, ParentFeedback, EscalationLog } from '../../../../shared/types/notification.types';

const db = getDatabase();

// ==================== INTERVENTION EFFECTIVENESS ====================

export function createInterventionEffectiveness(data: Omit<InterventionEffectiveness, 'id' | 'created_at' | 'updated_at'>): string {
  const id = randomUUID();
  
  const stmt = db.prepare(`
    INSERT INTO intervention_effectiveness (
      id, interventionId, studentId, interventionType, interventionTitle,
      startDate, endDate, duration, preInterventionMetrics, postInterventionMetrics,
      academicImpact, behavioralImpact, attendanceImpact, socialEmotionalImpact,
      overallEffectiveness, effectivenessLevel, successFactors, challenges,
      lessonsLearned, recommendations, aiAnalysis, patternMatches, similarInterventions,
      evaluatedBy, evaluatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    data.interventionId,
    data.studentId,
    data.interventionType,
    data.interventionTitle,
    data.startDate,
    data.endDate || null,
    data.duration || null,
    data.preInterventionMetrics,
    data.postInterventionMetrics || null,
    data.academicImpact || null,
    data.behavioralImpact || null,
    data.attendanceImpact || null,
    data.socialEmotionalImpact || null,
    data.overallEffectiveness || null,
    data.effectivenessLevel || 'PENDING',
    data.successFactors || null,
    data.challenges || null,
    data.lessonsLearned || null,
    data.recommendations || null,
    data.aiAnalysis || null,
    data.patternMatches || null,
    data.similarInterventions || null,
    data.evaluatedBy || null,
    data.evaluatedAt || null
  );
  
  return id;
}

export function updateInterventionEffectiveness(id: string, updates: Partial<InterventionEffectiveness>): void {
  const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at');
  const values = fields.map(k => (updates as any)[k]);
  
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const stmt = db.prepare(`UPDATE intervention_effectiveness SET ${setClause} WHERE id = ?`);
  
  stmt.run(...values, id);
}

export function getEffectivenessByIntervention(interventionId: string): InterventionEffectiveness | null {
  const stmt = db.prepare('SELECT * FROM intervention_effectiveness WHERE interventionId = ?');
  return stmt.get(interventionId) as InterventionEffectiveness | null;
}

export function getEffectivenessByStudent(studentId: string): InterventionEffectiveness[] {
  const stmt = db.prepare(`
    SELECT * FROM intervention_effectiveness 
    WHERE studentId = ? 
    ORDER BY startDate DESC
  `);
  return stmt.all(studentId) as InterventionEffectiveness[];
}

export function getSuccessfulInterventions(minEffectiveness: number = 70): InterventionEffectiveness[] {
  const stmt = db.prepare(`
    SELECT * FROM intervention_effectiveness 
    WHERE overallEffectiveness >= ? 
    ORDER BY overallEffectiveness DESC
  `);
  return stmt.all(minEffectiveness) as InterventionEffectiveness[];
}

export function getInterventionsByType(interventionType: string): InterventionEffectiveness[] {
  const stmt = db.prepare(`
    SELECT * FROM intervention_effectiveness 
    WHERE interventionType = ? 
    ORDER BY overallEffectiveness DESC
  `);
  return stmt.all(interventionType) as InterventionEffectiveness[];
}

export function getAllEffectiveness(): InterventionEffectiveness[] {
  const stmt = db.prepare(`
    SELECT * FROM intervention_effectiveness 
    ORDER BY startDate DESC
  `);
  return stmt.all() as InterventionEffectiveness[];
}

// ==================== PARENT FEEDBACK ====================

export function createParentFeedback(feedback: Omit<ParentFeedback, 'id' | 'created_at' | 'updated_at'>): string {
  const id = randomUUID();
  
  const stmt = db.prepare(`
    INSERT INTO parent_feedback (
      id, studentId, parentName, parentContact, feedbackType, relatedId,
      rating, feedbackText, concerns, suggestions, appreciations,
      followUpRequired, followUpNotes, respondedBy, respondedAt, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    feedback.studentId,
    feedback.parentName,
    feedback.parentContact || null,
    feedback.feedbackType,
    feedback.relatedId || null,
    feedback.rating || null,
    feedback.feedbackText || null,
    feedback.concerns || null,
    feedback.suggestions || null,
    feedback.appreciations || null,
    feedback.followUpRequired,
    feedback.followUpNotes || null,
    feedback.respondedBy || null,
    feedback.respondedAt || null,
    feedback.status
  );
  
  return id;
}

export function updateFeedbackStatus(id: string, status: ParentFeedback['status'], respondedBy?: string): void {
  const stmt = db.prepare(`
    UPDATE parent_feedback 
    SET status = ?, respondedBy = ?, respondedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(status, respondedBy || null, id);
}

export function getFeedbackByStudent(studentId: string): ParentFeedback[] {
  const stmt = db.prepare(`
    SELECT * FROM parent_feedback 
    WHERE studentId = ? 
    ORDER BY created_at DESC
  `);
  return stmt.all(studentId) as ParentFeedback[];
}

export function getPendingFeedback(): ParentFeedback[] {
  const stmt = db.prepare(`
    SELECT * FROM parent_feedback 
    WHERE status = 'NEW' OR (status = 'REVIEWED' AND followUpRequired = 1)
    ORDER BY created_at ASC
  `);
  return stmt.all() as ParentFeedback[];
}

// ==================== ESCALATION LOGS ====================

export function createEscalationLog(log: Omit<EscalationLog, 'id' | 'created_at' | 'updated_at'>): string {
  const id = randomUUID();
  
  const stmt = db.prepare(`
    INSERT INTO escalation_logs (
      id, studentId, alertId, interventionId, escalationType, currentLevel,
      escalatedTo, triggerReason, riskLevel, escalatedBy, escalatedAt,
      responseTime, respondedBy, respondedAt, actionTaken, resolution,
      status, notificationsSent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    log.studentId,
    log.alertId || null,
    log.interventionId || null,
    log.escalationType,
    log.currentLevel,
    log.escalatedTo,
    log.triggerReason,
    log.riskLevel || null,
    log.escalatedBy || null,
    log.escalatedAt,
    log.responseTime || null,
    log.respondedBy || null,
    log.respondedAt || null,
    log.actionTaken || null,
    log.resolution || null,
    log.status,
    log.notificationsSent || null
  );
  
  return id;
}

export function updateEscalationResponse(
  id: string, 
  respondedBy: string, 
  actionTaken: string,
  status: EscalationLog['status']
): void {
  const respondedAt = new Date().toISOString();
  
  const escalation = db.prepare('SELECT escalatedAt FROM escalation_logs WHERE id = ?').get(id) as any;
  const responseTime = escalation ? 
    Math.floor((new Date(respondedAt).getTime() - new Date(escalation.escalatedAt).getTime()) / 60000) : 
    null;
  
  const stmt = db.prepare(`
    UPDATE escalation_logs 
    SET respondedBy = ?, respondedAt = ?, responseTime = ?, actionTaken = ?, status = ?
    WHERE id = ?
  `);
  
  stmt.run(respondedBy, respondedAt, responseTime, actionTaken, status, id);
}

export function getEscalationsByStudent(studentId: string): EscalationLog[] {
  const stmt = db.prepare(`
    SELECT * FROM escalation_logs 
    WHERE studentId = ? 
    ORDER BY escalatedAt DESC
  `);
  return stmt.all(studentId) as EscalationLog[];
}

export function getActiveEscalations(): EscalationLog[] {
  const stmt = db.prepare(`
    SELECT * FROM escalation_logs 
    WHERE status IN ('OPEN', 'IN_PROGRESS')
    ORDER BY escalatedAt ASC
  `);
  return stmt.all() as EscalationLog[];
}

export function getEscalationStats(): any {
  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as total,
      AVG(responseTime) as avgResponseTime,
      SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved,
      SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as open,
      SUM(CASE WHEN riskLevel = 'KRİTİK' THEN 1 ELSE 0 END) as critical
    FROM escalation_logs
    WHERE escalatedAt > datetime('now', '-30 days')
  `);
  
  return stmt.get();
}
