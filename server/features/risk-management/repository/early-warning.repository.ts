import getDatabase from '../../../lib/database.js';
import type { RiskScoreHistory, EarlyWarningAlert, InterventionRecommendation } from '../../../../shared/types/early-warning.types';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    insertRiskScoreHistory: db.prepare(`
      INSERT INTO risk_score_history (id, studentId, assessmentDate, academicScore, behavioralScore,
                                     attendanceScore, socialEmotionalScore, overallRiskScore, riskLevel,
                                     dataPoints, calculationMethod)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    getRiskScoreHistory: db.prepare('SELECT * FROM risk_score_history WHERE studentId = ? ORDER BY assessmentDate DESC'),
    getLatestRiskScore: db.prepare('SELECT * FROM risk_score_history WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 1'),
    
    insertAlert: db.prepare(`
      INSERT INTO early_warning_alerts (id, studentId, alertType, alertLevel, title, description,
                                        triggerCondition, triggerValue, threshold, dataSource, status,
                                        assignedTo, notifiedAt, reviewedAt, resolvedAt, resolution, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    getAllAlerts: db.prepare('SELECT * FROM early_warning_alerts ORDER BY created_at DESC'),
    getAlertsByStudent: db.prepare('SELECT * FROM early_warning_alerts WHERE studentId = ? ORDER BY created_at DESC'),
    getActiveAlerts: db.prepare(`SELECT * FROM early_warning_alerts WHERE status IN ('AÇIK', 'İNCELENİYOR') ORDER BY alertLevel DESC, created_at DESC`),
    getAlertById: db.prepare('SELECT * FROM early_warning_alerts WHERE id = ?'),
    updateAlertStatus: db.prepare('UPDATE early_warning_alerts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
    updateAlert: db.prepare(`
      UPDATE early_warning_alerts 
      SET assignedTo = ?, reviewedAt = ?, resolvedAt = ?, resolution = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    deleteAlert: db.prepare('DELETE FROM early_warning_alerts WHERE id = ?'),
    deleteAlertBySchool: db.prepare(`
      DELETE FROM early_warning_alerts 
      WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)
    `),
    
    insertRecommendation: db.prepare(`
      INSERT INTO intervention_recommendations (id, studentId, alertId, recommendationType, priority,
                                               title, description, suggestedActions, targetArea, expectedOutcome,
                                               resources, estimatedDuration, status, implementedBy, implementedAt,
                                               effectiveness, followUpDate, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    getRecommendationsByStudent: db.prepare('SELECT * FROM intervention_recommendations WHERE studentId = ? ORDER BY priority ASC, created_at DESC'),
    getRecommendationsByAlert: db.prepare('SELECT * FROM intervention_recommendations WHERE alertId = ? ORDER BY priority ASC'),
    getActiveRecommendations: db.prepare(`SELECT * FROM intervention_recommendations WHERE status IN ('ÖNERİLDİ', 'PLANLANDI', 'UYGULANMAKTA') ORDER BY priority ASC, created_at DESC`),
    updateRecommendationStatus: db.prepare('UPDATE intervention_recommendations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
    updateRecommendation: db.prepare(`
      UPDATE intervention_recommendations 
      SET implementedBy = ?, implementedAt = ?, effectiveness = ?, followUpDate = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    deleteRecommendation: db.prepare('DELETE FROM intervention_recommendations WHERE id = ?'),
    deleteRecommendationBySchool: db.prepare(`
      DELETE FROM intervention_recommendations 
      WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)
    `),
    
    getHighRiskStudents: db.prepare(`
      SELECT rsh.studentId, (s.name || ' ' || s.surname) as name, s.class as className, rsh.overallRiskScore, rsh.riskLevel, rsh.assessmentDate
      FROM risk_score_history rsh
      JOIN students s ON rsh.studentId = s.id
      WHERE rsh.id IN (
        SELECT id FROM risk_score_history r1
        WHERE r1.studentId = rsh.studentId
        ORDER BY r1.assessmentDate DESC
        LIMIT 1
      )
      AND rsh.riskLevel IN ('YÜKSEK', 'KRİTİK')
      ORDER BY rsh.overallRiskScore DESC
    `),
    
    getAlertStatistics: db.prepare(`
      SELECT 
        alertLevel,
        COUNT(*) as count
      FROM early_warning_alerts
      WHERE status IN ('AÇIK', 'İNCELENİYOR')
      GROUP BY alertLevel
    `)
  };
  
  isInitialized = true;
}

export function insertRiskScoreHistory(data: RiskScoreHistory): void {
  try {
    ensureInitialized();
    statements.insertRiskScoreHistory.run(
      data.id,
      data.studentId,
      data.assessmentDate,
      data.academicScore,
      data.behavioralScore,
      data.attendanceScore,
      data.socialEmotionalScore,
      data.overallRiskScore,
      data.riskLevel,
      data.dataPoints,
      data.calculationMethod
    );
  } catch (error) {
    console.error('Database error in insertRiskScoreHistory:', error);
    throw error;
  }
}

export function getRiskScoreHistory(studentId: string): RiskScoreHistory[] {
  try {
    ensureInitialized();
    return statements.getRiskScoreHistory.all(studentId) as RiskScoreHistory[];
  } catch (error) {
    console.error('Database error in getRiskScoreHistory:', error);
    throw error;
  }
}

export function getLatestRiskScore(studentId: string): RiskScoreHistory | null {
  try {
    ensureInitialized();
    return statements.getLatestRiskScore.get(studentId) as RiskScoreHistory | null;
  } catch (error) {
    console.error('Database error in getLatestRiskScore:', error);
    throw error;
  }
}

export function insertAlert(alert: EarlyWarningAlert): void {
  try {
    ensureInitialized();
    statements.insertAlert.run(
      alert.id,
      alert.studentId,
      alert.alertType,
      alert.alertLevel,
      alert.title,
      alert.description,
      alert.triggerCondition,
      alert.triggerValue,
      alert.threshold,
      alert.dataSource,
      alert.status || 'AÇIK',
      alert.assignedTo,
      alert.notifiedAt,
      alert.reviewedAt,
      alert.resolvedAt,
      alert.resolution,
      alert.notes
    );
  } catch (error) {
    console.error('Database error in insertAlert:', error);
    throw error;
  }
}

export function getAllAlerts(): EarlyWarningAlert[] {
  try {
    ensureInitialized();
    return statements.getAllAlerts.all() as EarlyWarningAlert[];
  } catch (error) {
    console.error('Database error in getAllAlerts:', error);
    throw error;
  }
}

export function getAlertsByStudent(studentId: string): EarlyWarningAlert[] {
  try {
    ensureInitialized();
    return statements.getAlertsByStudent.all(studentId) as EarlyWarningAlert[];
  } catch (error) {
    console.error('Database error in getAlertsByStudent:', error);
    throw error;
  }
}

export function getActiveAlerts(): EarlyWarningAlert[] {
  try {
    ensureInitialized();
    return statements.getActiveAlerts.all() as EarlyWarningAlert[];
  } catch (error) {
    console.error('Database error in getActiveAlerts:', error);
    // Return empty array on error to avoid dashboard crashes
    return [];
  }
}

export function getActiveAlertsBySchool(schoolId: string): EarlyWarningAlert[] {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT ewa.* FROM early_warning_alerts ewa
      JOIN students s ON ewa.studentId = s.id
      WHERE s.schoolId = ? AND ewa.status IN ('AÇIK', 'İNCELENİYOR')
      ORDER BY ewa.alertLevel DESC, ewa.created_at DESC
    `);
    return stmt.all(schoolId) as EarlyWarningAlert[];
  } catch (error) {
    console.error('Database error in getActiveAlertsBySchool:', error);
    return [];
  }
}

export function getAlertById(id: string): EarlyWarningAlert | null {
  try {
    ensureInitialized();
    return statements.getAlertById.get(id) as EarlyWarningAlert | null;
  } catch (error) {
    console.error('Database error in getAlertById:', error);
    throw error;
  }
}

export function updateAlertStatus(id: string, status: string): void {
  try {
    ensureInitialized();
    statements.updateAlertStatus.run(status, id);
  } catch (error) {
    console.error('Database error in updateAlertStatus:', error);
    throw error;
  }
}

export function updateAlert(id: string, updates: Partial<EarlyWarningAlert>): void {
  try {
    ensureInitialized();
    statements.updateAlert.run(
      updates.assignedTo,
      updates.reviewedAt,
      updates.resolvedAt,
      updates.resolution,
      updates.notes,
      updates.status,
      id
    );
  } catch (error) {
    console.error('Database error in updateAlert:', error);
    throw error;
  }
}

export function deleteAlert(id: string): void {
  try {
    ensureInitialized();
    statements.deleteAlert.run(id);
  } catch (error) {
    console.error('Database error in deleteAlert:', error);
    throw error;
  }
}

export function insertRecommendation(recommendation: InterventionRecommendation): void {
  try {
    ensureInitialized();
    statements.insertRecommendation.run(
      recommendation.id,
      recommendation.studentId,
      recommendation.alertId,
      recommendation.recommendationType,
      recommendation.priority,
      recommendation.title,
      recommendation.description,
      recommendation.suggestedActions,
      recommendation.targetArea,
      recommendation.expectedOutcome,
      recommendation.resources,
      recommendation.estimatedDuration,
      recommendation.status || 'ÖNERİLDİ',
      recommendation.implementedBy,
      recommendation.implementedAt,
      recommendation.effectiveness,
      recommendation.followUpDate,
      recommendation.notes
    );
  } catch (error) {
    console.error('Database error in insertRecommendation:', error);
    throw error;
  }
}

export function getRecommendationsByStudent(studentId: string): InterventionRecommendation[] {
  try {
    ensureInitialized();
    return statements.getRecommendationsByStudent.all(studentId) as InterventionRecommendation[];
  } catch (error) {
    console.error('Database error in getRecommendationsByStudent:', error);
    throw error;
  }
}

export function getRecommendationsByAlert(alertId: string): InterventionRecommendation[] {
  try {
    ensureInitialized();
    return statements.getRecommendationsByAlert.all(alertId) as InterventionRecommendation[];
  } catch (error) {
    console.error('Database error in getRecommendationsByAlert:', error);
    throw error;
  }
}

export function getActiveRecommendations(): InterventionRecommendation[] {
  try {
    ensureInitialized();
    return statements.getActiveRecommendations.all() as InterventionRecommendation[];
  } catch (error) {
    console.error('Database error in getActiveRecommendations:', error);
    throw error;
  }
}

export function updateRecommendationStatus(id: string, status: string): void {
  try {
    ensureInitialized();
    statements.updateRecommendationStatus.run(status, id);
  } catch (error) {
    console.error('Database error in updateRecommendationStatus:', error);
    throw error;
  }
}

export function updateRecommendation(id: string, updates: Partial<InterventionRecommendation>): void {
  try {
    ensureInitialized();
    statements.updateRecommendation.run(
      updates.implementedBy,
      updates.implementedAt,
      updates.effectiveness,
      updates.followUpDate,
      updates.notes,
      updates.status,
      id
    );
  } catch (error) {
    console.error('Database error in updateRecommendation:', error);
    throw error;
  }
}

export function deleteRecommendation(id: string): void {
  try {
    ensureInitialized();
    statements.deleteRecommendation.run(id);
  } catch (error) {
    console.error('Database error in deleteRecommendation:', error);
    throw error;
  }
}

export function getHighRiskStudents(): unknown[] {
  try {
    ensureInitialized();
    return statements.getHighRiskStudents.all();
  } catch (error) {
    console.error('Database error in getHighRiskStudents:', error);
    throw error;
  }
}

export function getAlertStatistics(): unknown[] {
  try {
    ensureInitialized();
    return statements.getAlertStatistics.all();
  } catch (error) {
    console.error('Database error in getAlertStatistics:', error);
    throw error;
  }
}

// ================= SCHOOL-SCOPED FUNCTIONS =================

export function getAllAlertsBySchool(schoolId: string): EarlyWarningAlert[] {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT ewa.* FROM early_warning_alerts ewa
      JOIN students s ON ewa.studentId = s.id
      WHERE s.schoolId = ?
      ORDER BY ewa.created_at DESC
    `);
    return stmt.all(schoolId) as EarlyWarningAlert[];
  } catch (error) {
    console.error('Database error in getAllAlertsBySchool:', error);
    return [];
  }
}

export function getAlertsByStudentAndSchool(studentId: string, schoolId: string): EarlyWarningAlert[] {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT ewa.* FROM early_warning_alerts ewa
      JOIN students s ON ewa.studentId = s.id
      WHERE ewa.studentId = ? AND s.schoolId = ?
      ORDER BY ewa.created_at DESC
    `);
    return stmt.all(studentId, schoolId) as EarlyWarningAlert[];
  } catch (error) {
    console.error('Database error in getAlertsByStudentAndSchool:', error);
    return [];
  }
}

export function getAlertByIdAndSchool(id: string, schoolId: string): EarlyWarningAlert | null {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT ewa.* FROM early_warning_alerts ewa
      JOIN students s ON ewa.studentId = s.id
      WHERE ewa.id = ? AND s.schoolId = ?
    `);
    return stmt.get(id, schoolId) as EarlyWarningAlert | null;
  } catch (error) {
    console.error('Database error in getAlertByIdAndSchool:', error);
    return null;
  }
}

export function updateAlertStatusBySchool(id: string, status: string, schoolId: string): boolean {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE early_warning_alerts 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)
    `);
    const result = stmt.run(status, id, schoolId);
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in updateAlertStatusBySchool:', error);
    return false;
  }
}

export function updateAlertBySchool(id: string, updates: Partial<EarlyWarningAlert>, schoolId: string): boolean {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE early_warning_alerts 
      SET assignedTo = ?, reviewedAt = ?, resolvedAt = ?, resolution = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)
    `);
    const result = stmt.run(
      updates.assignedTo,
      updates.reviewedAt,
      updates.resolvedAt,
      updates.resolution,
      updates.notes,
      updates.status,
      id,
      schoolId
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in updateAlertBySchool:', error);
    return false;
  }
}

export function deleteAlertBySchool(id: string, schoolId: string): boolean {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      DELETE FROM early_warning_alerts 
      WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)
    `);
    const result = stmt.run(id, schoolId);
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in deleteAlertBySchool:', error);
    return false;
  }
}

export function getRecommendationsByStudentAndSchool(studentId: string, schoolId: string): InterventionRecommendation[] {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT ir.* FROM intervention_recommendations ir
      JOIN students s ON ir.studentId = s.id
      WHERE ir.studentId = ? AND s.schoolId = ?
      ORDER BY ir.priority ASC, ir.created_at DESC
    `);
    return stmt.all(studentId, schoolId) as InterventionRecommendation[];
  } catch (error) {
    console.error('Database error in getRecommendationsByStudentAndSchool:', error);
    return [];
  }
}

export function getRecommendationsByAlertAndSchool(alertId: string, schoolId: string): InterventionRecommendation[] {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT ir.* FROM intervention_recommendations ir
      JOIN early_warning_alerts ewa ON ir.alertId = ewa.id
      JOIN students s ON ewa.studentId = s.id
      WHERE ir.alertId = ? AND s.schoolId = ?
      ORDER BY ir.priority ASC
    `);
    return stmt.all(alertId, schoolId) as InterventionRecommendation[];
  } catch (error) {
    console.error('Database error in getRecommendationsByAlertAndSchool:', error);
    return [];
  }
}

export function getActiveRecommendationsBySchool(schoolId: string): InterventionRecommendation[] {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT ir.* FROM intervention_recommendations ir
      JOIN students s ON ir.studentId = s.id
      WHERE s.schoolId = ? AND ir.status IN ('ÖNERİLDİ', 'PLANLANDI', 'UYGULANMAKTA')
      ORDER BY ir.priority ASC, ir.created_at DESC
    `);
    return stmt.all(schoolId) as InterventionRecommendation[];
  } catch (error) {
    console.error('Database error in getActiveRecommendationsBySchool:', error);
    return [];
  }
}

export function updateRecommendationStatusBySchool(id: string, status: string, schoolId: string): boolean {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE intervention_recommendations 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)
    `);
    const result = stmt.run(status, id, schoolId);
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in updateRecommendationStatusBySchool:', error);
    return false;
  }
}

export function updateRecommendationBySchool(id: string, updates: Partial<InterventionRecommendation>, schoolId: string): boolean {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE intervention_recommendations 
      SET implementedBy = ?, implementedAt = ?, effectiveness = ?, followUpDate = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)
    `);
    const result = stmt.run(
      updates.implementedBy,
      updates.implementedAt,
      updates.effectiveness,
      updates.followUpDate,
      updates.notes,
      updates.status,
      id,
      schoolId
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in updateRecommendationBySchool:', error);
    return false;
  }
}

export function deleteRecommendationBySchool(id: string, schoolId: string): boolean {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      DELETE FROM intervention_recommendations 
      WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)
    `);
    const result = stmt.run(id, schoolId);
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in deleteRecommendationBySchool:', error);
    return false;
  }
}

export function getHighRiskStudentsBySchool(schoolId: string): unknown[] {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT rsh.studentId, (s.name || ' ' || s.surname) as name, s.class as className, rsh.overallRiskScore, rsh.riskLevel, rsh.assessmentDate
      FROM risk_score_history rsh
      JOIN students s ON rsh.studentId = s.id
      WHERE s.schoolId = ? AND rsh.id IN (
        SELECT id FROM risk_score_history r1
        WHERE r1.studentId = rsh.studentId
        ORDER BY r1.assessmentDate DESC
        LIMIT 1
      )
      AND rsh.riskLevel IN ('YÜKSEK', 'KRİTİK')
      ORDER BY rsh.overallRiskScore DESC
    `);
    return stmt.all(schoolId);
  } catch (error) {
    console.error('Database error in getHighRiskStudentsBySchool:', error);
    return [];
  }
}

export function getAlertStatisticsBySchool(schoolId: string): unknown[] {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT 
        ewa.alertLevel,
        COUNT(*) as count
      FROM early_warning_alerts ewa
      JOIN students s ON ewa.studentId = s.id
      WHERE s.schoolId = ? AND ewa.status IN ('AÇIK', 'İNCELENİYOR')
      GROUP BY ewa.alertLevel
    `);
    return stmt.all(schoolId);
  } catch (error) {
    console.error('Database error in getAlertStatisticsBySchool:', error);
    return [];
  }
}

export function getDashboardSummaryBySchool(schoolId: string): {
  totalAlerts: number;
  criticalAlerts: number;
  highRiskStudents: number;
  pendingRecommendations: number;
} {
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const totalAlertsStmt = db.prepare(`
      SELECT COUNT(*) as count FROM early_warning_alerts ewa
      JOIN students s ON ewa.studentId = s.id
      WHERE s.schoolId = ? AND ewa.status IN ('AÇIK', 'İNCELENİYOR')
    `);
    
    const criticalAlertsStmt = db.prepare(`
      SELECT COUNT(*) as count FROM early_warning_alerts ewa
      JOIN students s ON ewa.studentId = s.id
      WHERE s.schoolId = ? AND ewa.alertLevel = 'KRİTİK' AND ewa.status IN ('AÇIK', 'İNCELENİYOR')
    `);
    
    const highRiskStudentsStmt = db.prepare(`
      SELECT COUNT(DISTINCT rsh.studentId) as count 
      FROM risk_score_history rsh
      JOIN students s ON rsh.studentId = s.id
      WHERE s.schoolId = ? AND rsh.riskLevel IN ('YÜKSEK', 'KRİTİK')
    `);
    
    const pendingRecommendationsStmt = db.prepare(`
      SELECT COUNT(*) as count FROM intervention_recommendations ir
      JOIN students s ON ir.studentId = s.id
      WHERE s.schoolId = ? AND ir.status IN ('ÖNERİLDİ', 'PLANLANDI')
    `);
    
    const totalAlerts = (totalAlertsStmt.get(schoolId) as { count: number })?.count || 0;
    const criticalAlerts = (criticalAlertsStmt.get(schoolId) as { count: number })?.count || 0;
    const highRiskStudents = (highRiskStudentsStmt.get(schoolId) as { count: number })?.count || 0;
    const pendingRecommendations = (pendingRecommendationsStmt.get(schoolId) as { count: number })?.count || 0;
    
    return { totalAlerts, criticalAlerts, highRiskStudents, pendingRecommendations };
  } catch (error) {
    console.error('Database error in getDashboardSummaryBySchool:', error);
    return { totalAlerts: 0, criticalAlerts: 0, highRiskStudents: 0, pendingRecommendations: 0 };
  }
}

export function getRiskScoreHistoryBySchool(studentId: string, schoolId: string): RiskScoreHistory[] {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT rsh.* FROM risk_score_history rsh
      JOIN students s ON rsh.studentId = s.id
      WHERE rsh.studentId = ? AND s.schoolId = ?
      ORDER BY rsh.assessmentDate DESC
    `);
    return stmt.all(studentId, schoolId) as RiskScoreHistory[];
  } catch (error) {
    console.error('Database error in getRiskScoreHistoryBySchool:', error);
    return [];
  }
}

export function getLatestRiskScoreBySchool(studentId: string, schoolId: string): RiskScoreHistory | null {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT rsh.* FROM risk_score_history rsh
      JOIN students s ON rsh.studentId = s.id
      WHERE rsh.studentId = ? AND s.schoolId = ?
      ORDER BY rsh.assessmentDate DESC
      LIMIT 1
    `);
    return stmt.get(studentId, schoolId) as RiskScoreHistory | null;
  } catch (error) {
    console.error('Database error in getLatestRiskScoreBySchool:', error);
    return null;
  }
}

export function studentBelongsToSchool(studentId: string, schoolId: string): boolean {
  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare('SELECT 1 FROM students WHERE id = ? AND schoolId = ?');
    return !!stmt.get(studentId, schoolId);
  } catch (error) {
    console.error('Database error in studentBelongsToSchool:', error);
    return false;
  }
}
