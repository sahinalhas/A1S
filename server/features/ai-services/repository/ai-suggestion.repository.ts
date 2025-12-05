/**
 * AI Suggestion Repository
 * AI önerileri için veritabanı işlemleri
 */

import getDatabase from '../../../lib/database.js';
import { v4 as uuidv4 } from 'uuid';
import type { 
  AISuggestion, 
  CreateSuggestionRequest, 
  SuggestionFilters,
  SuggestionStats 
} from '../../../../shared/types/ai-suggestion.types.js';

const db = getDatabase();

/**
 * Yeni öneri oluştur
 */
export function createSuggestion(request: CreateSuggestionRequest): string {
  const id = uuidv4();
  const expiresAt = request.expiresInHours 
    ? new Date(Date.now() + request.expiresInHours * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(); // Default 72 saat

  const stmt = db.prepare(`
    INSERT INTO ai_suggestion_queue (
      id, studentId, suggestionType, source, sourceId, priority,
      title, description, reasoning, confidence,
      proposedChanges, currentValues,
      aiModel, aiVersion, analysisData,
      expiresAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    request.studentId,
    request.suggestionType,
    request.source,
    request.sourceId || null,
    request.priority || 'MEDIUM',
    request.title,
    request.description,
    request.reasoning || null,
    request.confidence || null,
    request.proposedChanges ? JSON.stringify(request.proposedChanges) : null,
    request.currentValues ? JSON.stringify(request.currentValues) : null,
    request.aiModel || null,
    request.aiVersion || null,
    request.analysisData ? JSON.stringify(request.analysisData) : null,
    expiresAt
  );

  return id;
}

/**
 * Öneriyi ID ile getir
 */
export function getSuggestionById(id: string): AISuggestion | null {
  const stmt = db.prepare(`
    SELECT * FROM ai_suggestion_queue WHERE id = ?
  `);

  const row = stmt.get(id) as any;
  if (!row) return null;

  return mapRowToSuggestion(row);
}

/**
 * Öğrenci için bekleyen önerileri getir
 */
export function getPendingSuggestionsForStudent(studentId: string): AISuggestion[] {
  const stmt = db.prepare(`
    SELECT * FROM ai_suggestion_queue 
    WHERE studentId = ? AND status = 'PENDING'
    ORDER BY 
      CASE priority 
        WHEN 'CRITICAL' THEN 1 
        WHEN 'HIGH' THEN 2 
        WHEN 'MEDIUM' THEN 3 
        ELSE 4 
      END,
      createdAt DESC
  `);

  const rows = stmt.all(studentId) as any[];
  return rows.map(mapRowToSuggestion);
}

/**
 * Tüm bekleyen önerileri getir
 */
export function getAllPendingSuggestions(limit: number = 100, schoolId?: string): AISuggestion[] {
  let query = `
    SELECT * FROM ai_suggestion_queue 
    WHERE status = 'PENDING'`;
  
  if (schoolId) {
    query += ` AND studentId IN (SELECT id FROM students WHERE schoolId = ?)`;
  }
  
  query += ` ORDER BY 
      CASE priority 
        WHEN 'CRITICAL' THEN 1 
        WHEN 'HIGH' THEN 2 
        WHEN 'MEDIUM' THEN 3 
        ELSE 4 
      END,
      createdAt DESC
    LIMIT ?`;

  const stmt = db.prepare(query);
  const rows = schoolId ? stmt.all(schoolId, limit) as any[] : stmt.all(limit) as any[];
  return rows.map(mapRowToSuggestion);
}

/**
 * Filtrelerle öneri ara
 */
export function searchSuggestions(filters: SuggestionFilters): AISuggestion[] {
  let query = 'SELECT * FROM ai_suggestion_queue WHERE 1=1';
  const params: unknown[] = [];

  if (filters.studentId) {
    query += ' AND studentId = ?';
    params.push(filters.studentId);
  }

  if (filters.status && filters.status.length > 0) {
    query += ` AND status IN (${filters.status.map(() => '?').join(',')})`;
    params.push(...filters.status);
  }

  if (filters.priority && filters.priority.length > 0) {
    query += ` AND priority IN (${filters.priority.map(() => '?').join(',')})`;
    params.push(...filters.priority);
  }

  if (filters.type && filters.type.length > 0) {
    query += ` AND suggestionType IN (${filters.type.map(() => '?').join(',')})`;
    params.push(...filters.type);
  }

  if (filters.fromDate) {
    query += ' AND createdAt >= ?';
    params.push(filters.fromDate);
  }

  if (filters.toDate) {
    query += ' AND createdAt <= ?';
    params.push(filters.toDate);
  }

  query += ' ORDER BY createdAt DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }

  if (filters.offset) {
    query += ' OFFSET ?';
    params.push(filters.offset);
  }

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as any[];
  return rows.map(mapRowToSuggestion);
}

/**
 * Öneri durumunu güncelle (onaylama/reddetme)
 */
export function updateSuggestionStatus(
  id: string,
  status: 'APPROVED' | 'REJECTED' | 'MODIFIED',
  reviewedBy: string,
  reviewNotes?: string,
  modifiedChanges?: any,
  feedbackRating?: number,
  feedbackNotes?: string
): void {
  const appliedAt = status === 'APPROVED' || status === 'MODIFIED' 
    ? new Date().toISOString() 
    : null;

  const stmt = db.prepare(`
    UPDATE ai_suggestion_queue 
    SET 
      status = ?,
      reviewedBy = ?,
      reviewedAt = datetime('now'),
      reviewNotes = ?,
      proposedChanges = ?,
      appliedAt = ?,
      feedbackRating = ?,
      feedbackNotes = ?
    WHERE id = ?
  `);

  stmt.run(
    status,
    reviewedBy,
    reviewNotes || null,
    modifiedChanges ? JSON.stringify(modifiedChanges) : null,
    appliedAt,
    feedbackRating || null,
    feedbackNotes || null,
    id
  );
}

/**
 * Süresi dolmuş önerileri temizle
 */
export function cleanupExpiredSuggestions(schoolId?: string): number {
  let query = `
    DELETE FROM ai_suggestion_queue 
    WHERE status = 'PENDING' AND expiresAt < datetime('now')`;
  
  if (schoolId) {
    query += ` AND studentId IN (SELECT id FROM students WHERE schoolId = ?)`;
  }

  const stmt = db.prepare(query);
  const result = schoolId ? stmt.run(schoolId) : stmt.run();
  return result.changes;
}

/**
 * İstatistikler getir
 */
export function getSuggestionStats(schoolId?: string): SuggestionStats {
  const schoolFilter = schoolId ? ` AND studentId IN (SELECT id FROM students WHERE schoolId = ?)` : '';
  
  const totalPending = db.prepare(
    `SELECT COUNT(*) as count FROM ai_suggestion_queue WHERE status = 'PENDING'${schoolFilter}`
  ).get(schoolId) as any;

  const totalApproved = db.prepare(
    `SELECT COUNT(*) as count FROM ai_suggestion_queue WHERE status = 'APPROVED'${schoolFilter}`
  ).get(schoolId) as any;

  const totalRejected = db.prepare(
    `SELECT COUNT(*) as count FROM ai_suggestion_queue WHERE status = 'REJECTED'${schoolFilter}`
  ).get(schoolId) as any;

  const totalModified = db.prepare(
    `SELECT COUNT(*) as count FROM ai_suggestion_queue WHERE status = 'MODIFIED'${schoolFilter}`
  ).get(schoolId) as any;

  const byType = db.prepare(`
    SELECT suggestionType, COUNT(*) as count 
    FROM ai_suggestion_queue 
    WHERE status = 'PENDING'
    GROUP BY suggestionType
  `).all() as any[];

  const byPriority = db.prepare(`
    SELECT priority, COUNT(*) as count 
    FROM ai_suggestion_queue 
    WHERE status = 'PENDING'
    GROUP BY priority
  `).all() as any[];

  const avgConfidence = db.prepare(`
    SELECT AVG(confidence) as avg 
    FROM ai_suggestion_queue 
    WHERE confidence IS NOT NULL
  `).get() as any;

  const avgRating = db.prepare(`
    SELECT AVG(feedbackRating) as avg 
    FROM ai_suggestion_queue 
    WHERE feedbackRating IS NOT NULL
  `).get() as any;

  const recent = getAllPendingSuggestions(10);

  return {
    totalPending: totalPending.count,
    totalApproved: totalApproved.count,
    totalRejected: totalRejected.count,
    totalModified: totalModified.count,
    byType: Object.fromEntries(byType.map(r => [r.suggestionType, r.count])) as any,
    byPriority: Object.fromEntries(byPriority.map(r => [r.priority, r.count])) as any,
    avgConfidence: avgConfidence.avg || 0,
    avgFeedbackRating: avgRating.avg || 0,
    recentSuggestions: recent
  };
}

/**
 * Veritabanı satırını AISuggestion nesnesine dönüştür
 */
function mapRowToSuggestion(row: any): AISuggestion {
  return {
    id: row.id,
    studentId: row.studentId,
    suggestionType: row.suggestionType,
    source: row.source,
    sourceId: row.sourceId,
    priority: row.priority,
    status: row.status,
    title: row.title,
    description: row.description,
    reasoning: row.reasoning,
    confidence: row.confidence,
    proposedChanges: row.proposedChanges ? JSON.parse(row.proposedChanges) : undefined,
    currentValues: row.currentValues ? JSON.parse(row.currentValues) : undefined,
    aiModel: row.aiModel,
    aiVersion: row.aiVersion,
    analysisData: row.analysisData ? JSON.parse(row.analysisData) : undefined,
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt,
    reviewNotes: row.reviewNotes,
    feedbackRating: row.feedbackRating,
    feedbackNotes: row.feedbackNotes,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
    appliedAt: row.appliedAt
  };
}

/**
 * Toplu öneri oluştur
 */
export function createBulkSuggestions(requests: CreateSuggestionRequest[]): string[] {
  const ids: string[] = [];
  
  db.transaction(() => {
    for (const request of requests) {
      const id = createSuggestion(request);
      ids.push(id);
    }
  })();

  return ids;
}
