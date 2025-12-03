/**
 * Behavior Repository
 * Davranış Takibi Veri Erişim Katmanı
 * 
 * [SECURITY] Tüm sorgular schoolId ile filtrelenerek okul veri izolasyonu sağlanır
 */

import getDatabase from '../../../lib/database/index.js';
import type { BehaviorIncident, BehaviorStats } from '../types/behavior.types.js';

// ================= SCHOOL-SCOPED FUNCTIONS (RECOMMENDED) =================

/**
 * Checks if a student belongs to a specific school
 * @param studentId - Student ID
 * @param schoolId - School ID
 */
export function studentBelongsToSchool(studentId: string, schoolId: string): boolean {
  if (!studentId || !schoolId) return false;
  const db = getDatabase();
  const stmt = db.prepare('SELECT 1 FROM students WHERE id = ? AND schoolId = ?');
  return !!stmt.get(studentId, schoolId);
}

/**
 * Get behavior incidents by student with school isolation
 * @param studentId - Student ID
 * @param schoolId - School ID for isolation (REQUIRED)
 */
export function getBehaviorIncidentsByStudentAndSchool(studentId: string, schoolId: string): BehaviorIncident[] {
  if (!schoolId) {
    throw new Error('[SECURITY] getBehaviorIncidentsByStudentAndSchool requires schoolId for school isolation');
  }
  
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT bi.* FROM behavior_incidents bi
    INNER JOIN students s ON bi.studentId = s.id
    WHERE bi.studentId = ? AND s.schoolId = ?
    ORDER BY bi.incidentDate DESC, bi.incidentTime DESC
  `);
  return stmt.all(studentId, schoolId) as BehaviorIncident[];
}

/**
 * Get behavior incidents by date range with school isolation
 * @param studentId - Student ID
 * @param schoolId - School ID for isolation (REQUIRED)
 * @param startDate - Optional start date
 * @param endDate - Optional end date
 */
export function getBehaviorIncidentsByDateRangeAndSchool(
  studentId: string,
  schoolId: string,
  startDate?: string,
  endDate?: string
): BehaviorIncident[] {
  if (!schoolId) {
    throw new Error('[SECURITY] getBehaviorIncidentsByDateRangeAndSchool requires schoolId for school isolation');
  }
  
  const db = getDatabase();
  let query = `
    SELECT bi.* FROM behavior_incidents bi
    INNER JOIN students s ON bi.studentId = s.id
    WHERE bi.studentId = ? AND s.schoolId = ?
  `;
  const params: (string | undefined)[] = [studentId, schoolId];

  if (startDate) {
    query += ' AND bi.incidentDate >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND bi.incidentDate <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY bi.incidentDate DESC, bi.incidentTime DESC';

  const stmt = db.prepare(query);
  return stmt.all(...params) as BehaviorIncident[];
}

/**
 * Get behavior stats by student with school isolation
 * @param studentId - Student ID
 * @param schoolId - School ID for isolation (REQUIRED)
 */
export function getBehaviorStatsByStudentAndSchool(studentId: string, schoolId: string): BehaviorStats {
  if (!schoolId) {
    throw new Error('[SECURITY] getBehaviorStatsByStudentAndSchool requires schoolId for school isolation');
  }
  
  const db = getDatabase();
  
  const overallStmt = db.prepare(`
    SELECT 
      COUNT(*) as totalIncidents,
      SUM(CASE WHEN bi.intensity IN ('Ciddi', 'Çok Ciddi') THEN 1 ELSE 0 END) as seriousCount,
      SUM(CASE WHEN bi.behaviorCategory = 'Olumlu' THEN 1 ELSE 0 END) as positiveCount
    FROM behavior_incidents bi
    INNER JOIN students s ON bi.studentId = s.id
    WHERE bi.studentId = ? AND s.schoolId = ?
  `);
  
  const categoryStmt = db.prepare(`
    SELECT bi.behaviorCategory, COUNT(*) as count
    FROM behavior_incidents bi
    INNER JOIN students s ON bi.studentId = s.id
    WHERE bi.studentId = ? AND s.schoolId = ?
    GROUP BY bi.behaviorCategory
  `);
  
  const overallStats = overallStmt.get(studentId, schoolId) as { totalIncidents: number; seriousCount: number; positiveCount: number } | undefined;
  const categoryData = categoryStmt.all(studentId, schoolId) as Array<{ behaviorCategory: string; count: number }>;
  
  const categoryBreakdown: Record<string, number> = {};
  categoryData.forEach((row) => {
    categoryBreakdown[row.behaviorCategory] = row.count;
  });
  
  return {
    overallStats: {
      totalIncidents: overallStats?.totalIncidents || 0,
      seriousCount: overallStats?.seriousCount || 0,
      positiveCount: overallStats?.positiveCount || 0,
    },
    categoryBreakdown,
  };
}

/**
 * Insert behavior incident with school isolation check
 * @param incident - Behavior incident data
 * @param schoolId - School ID for isolation check (REQUIRED)
 */
export function insertBehaviorIncidentWithSchoolCheck(incident: BehaviorIncident, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] insertBehaviorIncidentWithSchoolCheck requires schoolId for school isolation');
  }
  
  if (!studentBelongsToSchool(incident.studentId, schoolId)) {
    console.warn(`[SECURITY] Attempted to insert behavior incident for student ${incident.studentId} not belonging to school ${schoolId}`);
    return false;
  }
  
  insertBehaviorIncidentInternal(incident);
  return true;
}

/**
 * Update behavior incident with school isolation
 * @param id - Incident ID
 * @param updates - Fields to update
 * @param schoolId - School ID for isolation (REQUIRED)
 */
export function updateBehaviorIncidentBySchool(id: string, updates: Partial<BehaviorIncident>, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] updateBehaviorIncidentBySchool requires schoolId for school isolation');
  }
  
  const db = getDatabase();
  
  const checkStmt = db.prepare(`
    SELECT 1 FROM behavior_incidents bi
    INNER JOIN students s ON bi.studentId = s.id
    WHERE bi.id = ? AND s.schoolId = ?
  `);
  
  if (!checkStmt.get(id, schoolId)) {
    console.warn(`[SECURITY] Attempted to update behavior incident ${id} not belonging to school ${schoolId}`);
    return false;
  }
  
  updateBehaviorIncidentInternal(id, updates);
  return true;
}

/**
 * Delete behavior incident with school isolation
 * @param id - Incident ID
 * @param schoolId - School ID for isolation (REQUIRED)
 */
export function deleteBehaviorIncidentBySchool(id: string, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] deleteBehaviorIncidentBySchool requires schoolId for school isolation');
  }
  
  const db = getDatabase();
  const stmt = db.prepare(`
    DELETE FROM behavior_incidents 
    WHERE id = ? AND studentId IN (
      SELECT id FROM students WHERE schoolId = ?
    )
  `);
  const result = stmt.run(id, schoolId);
  return result.changes > 0;
}

/**
 * Get all behavior incidents for a school
 * @param schoolId - School ID for isolation (REQUIRED)
 * @param limit - Optional limit
 */
export function getAllBehaviorIncidentsBySchool(schoolId: string, limit?: number): BehaviorIncident[] {
  if (!schoolId) {
    throw new Error('[SECURITY] getAllBehaviorIncidentsBySchool requires schoolId for school isolation');
  }
  
  const db = getDatabase();
  let query = `
    SELECT bi.* FROM behavior_incidents bi
    INNER JOIN students s ON bi.studentId = s.id
    WHERE s.schoolId = ?
    ORDER BY bi.incidentDate DESC, bi.incidentTime DESC
  `;
  
  if (limit) {
    query += ` LIMIT ${limit}`;
  }
  
  const stmt = db.prepare(query);
  return stmt.all(schoolId) as BehaviorIncident[];
}

// ================= LEGACY EXPORTS (for backward compatibility) =================

/**
 * @deprecated Use insertBehaviorIncidentWithSchoolCheck instead
 */
export function insertBehaviorIncident(incident: BehaviorIncident): void {
  console.warn('[DEPRECATED] insertBehaviorIncident() called without schoolId check. Use insertBehaviorIncidentWithSchoolCheck() instead.');
  insertBehaviorIncidentInternal(incident);
}

/**
 * @deprecated Use updateBehaviorIncidentBySchool instead
 */
export function updateBehaviorIncident(id: string, updates: Partial<BehaviorIncident>): void {
  console.warn('[DEPRECATED] updateBehaviorIncident() called without schoolId. Use updateBehaviorIncidentBySchool() instead.');
  updateBehaviorIncidentInternal(id, updates);
}

// ================= INTERNAL FUNCTIONS =================

function insertBehaviorIncidentInternal(incident: BehaviorIncident): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO behavior_incidents (
      id, studentId, incidentDate, incidentTime, location, 
      behaviorType, behaviorCategory, description, antecedent,
      consequence, duration, intensity, frequency, witnessedBy,
      othersInvolved, interventionUsed, interventionEffectiveness,
      parentNotified, parentNotificationMethod, parentResponse,
      followUpRequired, followUpDate, followUpNotes, adminNotified,
      consequenceGiven, supportProvided, triggerAnalysis, patternNotes,
      positiveAlternative, status, recordedBy, notes
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  stmt.run(
    incident.id,
    incident.studentId,
    incident.incidentDate,
    incident.incidentTime,
    incident.location,
    incident.behaviorType,
    incident.behaviorCategory,
    incident.description,
    incident.antecedent || null,
    incident.consequence || null,
    incident.duration || null,
    incident.intensity || null,
    incident.frequency || null,
    incident.witnessedBy || null,
    incident.othersInvolved || null,
    incident.interventionUsed || null,
    incident.interventionEffectiveness || null,
    incident.parentNotified ? 1 : 0,
    incident.parentNotificationMethod || null,
    incident.parentResponse || null,
    incident.followUpRequired ? 1 : 0,
    incident.followUpDate || null,
    incident.followUpNotes || null,
    incident.adminNotified ? 1 : 0,
    incident.consequenceGiven || null,
    incident.supportProvided || null,
    incident.triggerAnalysis || null,
    incident.patternNotes || null,
    incident.positiveAlternative || null,
    incident.status,
    incident.recordedBy,
    incident.notes || null
  );
}

function updateBehaviorIncidentInternal(id: string, updates: Partial<BehaviorIncident>): void {
  const db = getDatabase();
  const fields = Object.keys(updates)
    .filter(key => key !== 'id')
    .map(key => `${key} = ?`)
    .join(', ');
  
  const values = Object.entries(updates)
    .filter(([key]) => key !== 'id')
    .map(([_, value]) => value);
  
  const stmt = db.prepare(`UPDATE behavior_incidents SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
  stmt.run(...values, id);
}

// ================= DEPRECATED FUNCTIONS =================
// These functions do not check school isolation and should be avoided

/**
 * @deprecated Use getBehaviorIncidentsByStudentAndSchool instead for proper school isolation
 */
export function getBehaviorIncidentsByStudent(studentId: string): BehaviorIncident[] {
  console.warn('[DEPRECATED] getBehaviorIncidentsByStudent() called without schoolId. Use getBehaviorIncidentsByStudentAndSchool() instead.');
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM behavior_incidents 
    WHERE studentId = ? 
    ORDER BY incidentDate DESC, incidentTime DESC
  `);
  return stmt.all(studentId) as BehaviorIncident[];
}

/**
 * @deprecated Use getBehaviorIncidentsByDateRangeAndSchool instead for proper school isolation
 */
export function getBehaviorIncidentsByDateRange(
  studentId: string,
  startDate?: string,
  endDate?: string
): BehaviorIncident[] {
  console.warn('[DEPRECATED] getBehaviorIncidentsByDateRange() called without schoolId. Use getBehaviorIncidentsByDateRangeAndSchool() instead.');
  const db = getDatabase();
  let query = 'SELECT * FROM behavior_incidents WHERE studentId = ?';
  const params: (string | undefined)[] = [studentId];

  if (startDate) {
    query += ' AND incidentDate >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND incidentDate <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY incidentDate DESC, incidentTime DESC';

  const stmt = db.prepare(query);
  return stmt.all(...params) as BehaviorIncident[];
}

/**
 * @deprecated Use getBehaviorStatsByStudentAndSchool instead for proper school isolation
 */
export function getBehaviorStatsByStudent(studentId: string): BehaviorStats {
  console.warn('[DEPRECATED] getBehaviorStatsByStudent() called without schoolId. Use getBehaviorStatsByStudentAndSchool() instead.');
  const db = getDatabase();
  
  const overallStmt = db.prepare(`
    SELECT 
      COUNT(*) as totalIncidents,
      SUM(CASE WHEN intensity IN ('Ciddi', 'Çok Ciddi') THEN 1 ELSE 0 END) as seriousCount,
      SUM(CASE WHEN behaviorCategory = 'Olumlu' THEN 1 ELSE 0 END) as positiveCount
    FROM behavior_incidents 
    WHERE studentId = ?
  `);
  
  const categoryStmt = db.prepare(`
    SELECT behaviorCategory, COUNT(*) as count
    FROM behavior_incidents
    WHERE studentId = ?
    GROUP BY behaviorCategory
  `);
  
  const overallStats = overallStmt.get(studentId) as { totalIncidents: number; seriousCount: number; positiveCount: number } | undefined;
  const categoryData = categoryStmt.all(studentId) as Array<{ behaviorCategory: string; count: number }>;
  
  const categoryBreakdown: Record<string, number> = {};
  categoryData.forEach((row) => {
    categoryBreakdown[row.behaviorCategory] = row.count;
  });
  
  return {
    overallStats: {
      totalIncidents: overallStats?.totalIncidents || 0,
      seriousCount: overallStats?.seriousCount || 0,
      positiveCount: overallStats?.positiveCount || 0,
    },
    categoryBreakdown,
  };
}

/**
 * @deprecated Use deleteBehaviorIncidentBySchool instead for proper school isolation
 */
export function deleteBehaviorIncident(id: string, schoolId?: string): void {
  if (schoolId) {
    const success = deleteBehaviorIncidentBySchool(id, schoolId);
    if (!success) {
      throw new Error('Behavior incident not found or not accessible');
    }
    return;
  }
  
  console.warn('[DEPRECATED] deleteBehaviorIncident() called without schoolId. Use deleteBehaviorIncidentBySchool() instead.');
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM behavior_incidents WHERE id = ?');
  stmt.run(id);
}
