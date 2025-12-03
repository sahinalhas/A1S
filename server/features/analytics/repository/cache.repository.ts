import { getDatabase } from '../../../lib/database/connection.js';
import { randomUUID } from 'crypto';

export interface CacheEntry {
  id: string;
  cache_key: string;
  cache_type: 'reports_overview' | 'student_analytics' | 'class_comparison' | 'risk_profiles' | 'early_warnings';
  data: string;
  created_at: string;
  expires_at: string;
  metadata?: string;
}

export interface CacheOptions {
  ttlMinutes?: number;
  metadata?: Record<string, unknown>;
}

const DEFAULT_TTL_MINUTES = 30;

export function getCachedData(cacheKey: string): CacheEntry | null {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const entry = db.prepare(`
    SELECT * FROM analytics_cache 
    WHERE cache_key = ? AND expires_at > ?
  `).get(cacheKey, now) as CacheEntry | undefined;

  return entry || null;
}

export function setCachedData(
  cacheKey: string,
  cacheType: CacheEntry['cache_type'],
  data: unknown,
  options: CacheOptions = {}
): CacheEntry {
  const db = getDatabase();
  const { ttlMinutes = DEFAULT_TTL_MINUTES, metadata } = options;
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);
  
  const id = randomUUID();
  const dataString = JSON.stringify(data);
  const metadataString = metadata ? JSON.stringify(metadata) : null;

  db.prepare(`
    INSERT OR REPLACE INTO analytics_cache 
    (id, cache_key, cache_type, data, created_at, expires_at, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, cacheKey, cacheType, dataString, now.toISOString(), expiresAt.toISOString(), metadataString);

  return {
    id,
    cache_key: cacheKey,
    cache_type: cacheType,
    data: dataString,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    metadata: metadataString || undefined
  };
}

export function invalidateCache(cacheKey?: string, cacheType?: CacheEntry['cache_type'], schoolId?: string): number {
  const db = getDatabase();
  if (cacheKey) {
    const query = schoolId 
      ? 'DELETE FROM analytics_cache WHERE cache_key = ? AND metadata LIKE ?' 
      : 'DELETE FROM analytics_cache WHERE cache_key = ?';
    const result = schoolId
      ? db.prepare(query).run(cacheKey, `%"schoolId":"${schoolId}"%`)
      : db.prepare(query).run(cacheKey);
    return result.changes;
  }
  
  if (cacheType) {
    const query = schoolId
      ? 'DELETE FROM analytics_cache WHERE cache_type = ? AND metadata LIKE ?'
      : 'DELETE FROM analytics_cache WHERE cache_type = ?';
    const result = schoolId
      ? db.prepare(query).run(cacheType, `%"schoolId":"${schoolId}"%`)
      : db.prepare(query).run(cacheType);
    return result.changes;
  }
  
  const query = schoolId
    ? 'DELETE FROM analytics_cache WHERE metadata LIKE ?'
    : 'DELETE FROM analytics_cache';
  const result = schoolId
    ? db.prepare(query).run(`%"schoolId":"${schoolId}"%`)
    : db.prepare(query).run();
  return result.changes;
}

export function cleanupExpiredCache(schoolId?: string): number {
  const db = getDatabase();
  const now = new Date().toISOString();
  const query = schoolId
    ? 'DELETE FROM analytics_cache WHERE expires_at <= ? AND metadata LIKE ?'
    : 'DELETE FROM analytics_cache WHERE expires_at <= ?';
  const result = schoolId
    ? db.prepare(query).run(now, `%"schoolId":"${schoolId}"%`)
    : db.prepare(query).run(now);
  return result.changes;
}

export function getCacheStats(schoolId?: string) {
  const db = getDatabase();
  const metadataFilter = schoolId ? ' AND metadata LIKE ?' : '';
  const total = db.prepare(`SELECT COUNT(*) as count FROM analytics_cache${metadataFilter}`).get(schoolId ? `%"schoolId":"${schoolId}"%` : undefined) as { count: number };
  const expired = db.prepare(`SELECT COUNT(*) as count FROM analytics_cache WHERE expires_at <= ?${metadataFilter}`)
    .get(new Date().toISOString(), schoolId ? `%"schoolId":"${schoolId}"%` : undefined) as { count: number };
  
  const byType = db.prepare(`
    SELECT cache_type, COUNT(*) as count 
    FROM analytics_cache 
    GROUP BY cache_type
  `).all() as Array<{ cache_type: string; count: number }>;

  return {
    total: total.count,
    expired: expired.count,
    active: total.count - expired.count,
    byType
  };
}
