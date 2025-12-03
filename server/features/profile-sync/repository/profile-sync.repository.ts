/**
 * Profile Sync Repository
 * Canlı profil senkronizasyon veritabanı işlemleri
 */

import getDatabase from '../../../lib/database.js';
import type { 
  UnifiedStudentIdentity, 
  ProfileSyncLog, 
  ConflictResolution 
} from '../types/profile-sync.types.js';

const db = getDatabase();

// ==================== UNIFIED STUDENT IDENTITY ====================

export function getUnifiedIdentity(studentId: string): UnifiedStudentIdentity | null {
  const stmt = db.prepare(`
    SELECT * FROM unified_student_identity WHERE studentId = ?
  `);
  
  const row = stmt.get(studentId) as any;
  
  if (!row) return null;
  
  return {
    studentId: row.studentId,
    lastUpdated: row.lastUpdated,
    summary: row.summary,
    keyCharacteristics: JSON.parse(row.keyCharacteristics || '[]'),
    currentState: row.currentState,
    academicScore: row.academicScore,
    socialEmotionalScore: row.socialEmotionalScore,
    behavioralScore: row.behavioralScore,
    motivationScore: row.motivationScore,
    riskLevel: row.riskLevel,
    strengths: JSON.parse(row.strengths || '[]'),
    challenges: JSON.parse(row.challenges || '[]'),
    recentChanges: JSON.parse(row.recentChanges || '[]'),
    personalityProfile: row.personalityProfile,
    learningStyle: row.learningStyle,
    interventionPriority: row.interventionPriority,
    recommendedActions: JSON.parse(row.recommendedActions || '[]')
  };
}

export function saveUnifiedIdentity(identity: UnifiedStudentIdentity): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO unified_student_identity (
      studentId, lastUpdated, summary, keyCharacteristics, currentState,
      academicScore, socialEmotionalScore, behavioralScore, motivationScore, riskLevel,
      strengths, challenges, recentChanges,
      personalityProfile, learningStyle, interventionPriority, recommendedActions,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  
  stmt.run(
    identity.studentId,
    identity.lastUpdated,
    identity.summary,
    JSON.stringify(identity.keyCharacteristics),
    identity.currentState,
    identity.academicScore,
    identity.socialEmotionalScore,
    identity.behavioralScore,
    identity.motivationScore,
    identity.riskLevel,
    JSON.stringify(identity.strengths),
    JSON.stringify(identity.challenges),
    JSON.stringify(identity.recentChanges),
    identity.personalityProfile,
    identity.learningStyle,
    identity.interventionPriority,
    JSON.stringify(identity.recommendedActions)
  );
}

export function getAllUnifiedIdentities(): UnifiedStudentIdentity[] {
  const stmt = db.prepare(`
    SELECT * FROM unified_student_identity ORDER BY lastUpdated DESC
  `);
  
  const rows = stmt.all() as any[];
  
  return rows.map(row => ({
    studentId: row.studentId,
    lastUpdated: row.lastUpdated,
    summary: row.summary,
    keyCharacteristics: JSON.parse(row.keyCharacteristics || '[]'),
    currentState: row.currentState,
    academicScore: row.academicScore,
    socialEmotionalScore: row.socialEmotionalScore,
    behavioralScore: row.behavioralScore,
    motivationScore: row.motivationScore,
    riskLevel: row.riskLevel,
    strengths: JSON.parse(row.strengths || '[]'),
    challenges: JSON.parse(row.challenges || '[]'),
    recentChanges: JSON.parse(row.recentChanges || '[]'),
    personalityProfile: row.personalityProfile,
    learningStyle: row.learningStyle,
    interventionPriority: row.interventionPriority,
    recommendedActions: JSON.parse(row.recommendedActions || '[]')
  }));
}

// ==================== PROFILE SYNC LOGS ====================

export function saveSyncLog(log: Omit<ProfileSyncLog, 'created_at'>): void {
  const stmt = db.prepare(`
    INSERT INTO profile_sync_logs (
      id, studentId, source, sourceId, domain, action, 
      validationScore, aiReasoning, extractedInsights, timestamp, processedBy
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    log.id,
    log.studentId,
    log.source,
    log.sourceId,
    log.domain,
    log.action,
    log.validationScore,
    log.aiReasoning,
    JSON.stringify(log.extractedInsights || {}),
    log.timestamp,
    log.processedBy
  );
}

export function getSyncLogsByStudent(studentId: string, limit: number = 50): ProfileSyncLog[] {
  const stmt = db.prepare(`
    SELECT * FROM profile_sync_logs 
    WHERE studentId = ? 
    ORDER BY timestamp DESC 
    LIMIT ?
  `);
  
  const rows = stmt.all(studentId, limit) as any[];
  
  return rows.map(row => ({
    id: row.id,
    studentId: row.studentId,
    source: row.source,
    sourceId: row.sourceId,
    domain: row.domain,
    action: row.action,
    validationScore: row.validationScore,
    aiReasoning: row.aiReasoning,
    extractedInsights: JSON.parse(row.extractedInsights || '{}'),
    timestamp: row.timestamp,
    processedBy: row.processedBy
  }));
}

export function getSyncLogsBySource(source: string, limit: number = 50): ProfileSyncLog[] {
  const stmt = db.prepare(`
    SELECT * FROM profile_sync_logs 
    WHERE source = ? 
    ORDER BY timestamp DESC 
    LIMIT ?
  `);
  
  const rows = stmt.all(source, limit) as any[];
  
  return rows.map(row => ({
    id: row.id,
    studentId: row.studentId,
    source: row.source,
    sourceId: row.sourceId,
    domain: row.domain,
    action: row.action,
    validationScore: row.validationScore,
    aiReasoning: row.aiReasoning,
    extractedInsights: JSON.parse(row.extractedInsights || '{}'),
    timestamp: row.timestamp,
    processedBy: row.processedBy
  }));
}

// ==================== CONFLICT RESOLUTIONS ====================

export function saveConflictResolution(conflict: Omit<ConflictResolution, 'created_at'>): void {
  const stmt = db.prepare(`
    INSERT INTO conflict_resolutions (
      id, studentId, conflictType, domain, oldValue, newValue, 
      resolvedValue, resolutionMethod, severity, reasoning, timestamp, resolvedBy
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    conflict.id,
    conflict.studentId,
    conflict.conflictType,
    conflict.domain || '',
    JSON.stringify(conflict.oldValue),
    JSON.stringify(conflict.newValue),
    JSON.stringify(conflict.resolvedValue),
    conflict.resolutionMethod,
    conflict.severity || 'medium',
    conflict.reasoning,
    conflict.timestamp,
    conflict.resolvedBy || 'ai'
  );
}

export function getConflictById(conflictId: string): ConflictResolution | null {
  const stmt = db.prepare(`
    SELECT * FROM conflict_resolutions WHERE id = ?
  `);
  
  const row = stmt.get(conflictId) as any;
  
  if (!row) return null;
  
  return {
    id: row.id,
    studentId: row.studentId,
    conflictType: row.conflictType,
    domain: row.domain,
    oldValue: JSON.parse(row.oldValue),
    newValue: JSON.parse(row.newValue),
    resolvedValue: JSON.parse(row.resolvedValue),
    resolutionMethod: row.resolutionMethod,
    severity: row.severity,
    reasoning: row.reasoning,
    timestamp: row.timestamp,
    resolvedBy: row.resolvedBy
  };
}

export function getConflictsByStudent(studentId: string): ConflictResolution[] {
  const stmt = db.prepare(`
    SELECT * FROM conflict_resolutions 
    WHERE studentId = ? 
    ORDER BY timestamp DESC
  `);
  
  const rows = stmt.all(studentId) as any[];
  
  return rows.map(row => ({
    id: row.id,
    studentId: row.studentId,
    conflictType: row.conflictType,
    domain: row.domain,
    oldValue: JSON.parse(row.oldValue || '{}'),
    newValue: JSON.parse(row.newValue || '{}'),
    resolvedValue: JSON.parse(row.resolvedValue || '{}'),
    resolutionMethod: row.resolutionMethod,
    severity: row.severity,
    reasoning: row.reasoning,
    timestamp: row.timestamp,
    resolvedBy: row.resolvedBy
  }));
}

export function getHighSeverityConflicts(limit: number = 20): ConflictResolution[] {
  const stmt = db.prepare(`
    SELECT * FROM conflict_resolutions 
    WHERE severity = 'high' 
    ORDER BY timestamp DESC 
    LIMIT ?
  `);
  
  const rows = stmt.all(limit) as any[];
  
  return rows.map(row => ({
    id: row.id,
    studentId: row.studentId,
    conflictType: row.conflictType,
    domain: row.domain,
    oldValue: JSON.parse(row.oldValue || '{}'),
    newValue: JSON.parse(row.newValue || '{}'),
    resolvedValue: JSON.parse(row.resolvedValue || '{}'),
    resolutionMethod: row.resolutionMethod,
    severity: row.severity,
    reasoning: row.reasoning,
    timestamp: row.timestamp,
    resolvedBy: row.resolvedBy
  }));
}

// ==================== STATISTICS ====================

export function getSyncStatistics(studentId?: string) {
  let query = `
    SELECT 
      COUNT(*) as totalUpdates,
      AVG(validationScore) as avgValidationScore,
      COUNT(DISTINCT source) as uniqueSources,
      COUNT(DISTINCT domain) as affectedDomains
    FROM profile_sync_logs
  `;
  
  if (studentId) {
    query += ` WHERE studentId = ?`;
  }
  
  const stmt = db.prepare(query);
  const result = studentId ? stmt.get(studentId) : stmt.get();
  
  return result;
}
