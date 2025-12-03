import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../../../lib/database/connection.js';
import type { GuidanceTip, GuidanceTipUserView, GeneratedTipContent, GuidanceTipCategory, UserCategoryPreferences, GUIDANCE_TIP_CATEGORIES } from '../types/guidance-tips.types.js';

class GuidanceTipsRepository {
  constructor() {
    this.ensurePreferencesTable();
  }

  private ensurePreferencesTable(): void {
    try {
      const db = getDatabase();
      db.exec(`
        CREATE TABLE IF NOT EXISTS guidance_tips_preferences (
          id TEXT PRIMARY KEY,
          userId TEXT UNIQUE NOT NULL,
          enabledCategories TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
    } catch (error) {
      console.error('Failed to create preferences table:', error);
    }
  }

  getUserPreferences(userId: string): UserCategoryPreferences | null {
    const db = getDatabase();
    const row = db.prepare(`
      SELECT * FROM guidance_tips_preferences WHERE userId = ?
    `).get(userId) as Record<string, unknown> | undefined;

    if (!row) return null;

    return {
      userId: row.userId as string,
      enabledCategories: JSON.parse(row.enabledCategories as string),
      updatedAt: row.updated_at as string
    };
  }

  saveUserPreferences(userId: string, categories: GuidanceTipCategory[]): UserCategoryPreferences {
    const db = getDatabase();
    const now = new Date().toISOString();
    const categoriesJson = JSON.stringify(categories);

    const existing = db.prepare(`SELECT id FROM guidance_tips_preferences WHERE userId = ?`).get(userId);

    if (existing) {
      db.prepare(`
        UPDATE guidance_tips_preferences 
        SET enabledCategories = ?, updated_at = ?
        WHERE userId = ?
      `).run(categoriesJson, now, userId);
    } else {
      const id = uuidv4();
      db.prepare(`
        INSERT INTO guidance_tips_preferences (id, userId, enabledCategories, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, userId, categoriesJson, now, now);
    }

    return {
      userId,
      enabledCategories: categories,
      updatedAt: now
    };
  }

  getRandomUnseenTipWithPreferences(userId: string, enabledCategories?: GuidanceTipCategory[]): GuidanceTip | null {
    const db = getDatabase();
    
    let query = `
      SELECT gt.* FROM guidance_tips gt
      WHERE gt.isActive = 1
      AND gt.id NOT IN (
        SELECT tipId FROM guidance_tips_user_views WHERE userId = ?
      )
    `;
    
    const params: (string | number)[] = [userId];
    
    if (enabledCategories && enabledCategories.length > 0) {
      const placeholders = enabledCategories.map(() => '?').join(',');
      query += ` AND gt.category IN (${placeholders})`;
      params.push(...enabledCategories);
    }
    
    query += ` ORDER BY RANDOM() LIMIT 1`;

    const row = db.prepare(query).get(...params) as Record<string, unknown> | undefined;

    if (!row) return null;

    return this.mapRowToTip(row);
  }

  getUnseenTipsForUser(userId: string, limit: number = 15, enabledCategories?: GuidanceTipCategory[]): GuidanceTip[] {
    const db = getDatabase();
    
    let query = `
      SELECT gt.* FROM guidance_tips gt
      WHERE gt.isActive = 1
      AND gt.id NOT IN (
        SELECT tipId FROM guidance_tips_user_views WHERE userId = ?
      )
    `;
    
    const params: (string | number)[] = [userId];
    
    if (enabledCategories && enabledCategories.length > 0) {
      const placeholders = enabledCategories.map(() => '?').join(',');
      query += ` AND gt.category IN (${placeholders})`;
      params.push(...enabledCategories);
    }
    
    query += ` ORDER BY generatedAt DESC LIMIT ?`;
    params.push(limit);

    const rows = db.prepare(query).all(...params) as Record<string, unknown>[];

    return rows.map(row => this.mapRowToTip(row));
  }

  createTip(tip: GeneratedTipContent): GuidanceTip {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO guidance_tips (id, category, title, content, source, importance, generatedAt, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'AI', ?, ?, ?, ?)
    `);

    stmt.run(id, tip.category, tip.title, tip.content, tip.importance, now, now, now);

    return this.getTipById(id)!;
  }

  getTipById(id: string): GuidanceTip | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM guidance_tips WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    
    if (!row) return null;
    
    return this.mapRowToTip(row);
  }

  getRandomUnseenTip(userId: string): GuidanceTip | null {
    const db = getDatabase();
    
    const row = db.prepare(`
      SELECT gt.* FROM guidance_tips gt
      WHERE gt.isActive = 1
      AND gt.id NOT IN (
        SELECT tipId FROM guidance_tips_user_views WHERE userId = ?
      )
      ORDER BY RANDOM()
      LIMIT 1
    `).get(userId) as Record<string, unknown> | undefined;

    if (!row) return null;

    return this.mapRowToTip(row);
  }

  getLatestTip(): GuidanceTip | null {
    const db = getDatabase();
    
    const row = db.prepare(`
      SELECT * FROM guidance_tips
      WHERE isActive = 1
      ORDER BY generatedAt DESC
      LIMIT 1
    `).get() as Record<string, unknown> | undefined;

    if (!row) return null;

    return this.mapRowToTip(row);
  }

  getAllActiveTips(limit: number = 50): GuidanceTip[] {
    const db = getDatabase();
    
    const rows = db.prepare(`
      SELECT * FROM guidance_tips
      WHERE isActive = 1
      ORDER BY generatedAt DESC
      LIMIT ?
    `).all(limit) as Record<string, unknown>[];

    return rows.map(row => this.mapRowToTip(row));
  }

  getTipsByCategory(category: string, limit: number = 20): GuidanceTip[] {
    const db = getDatabase();
    
    const rows = db.prepare(`
      SELECT * FROM guidance_tips
      WHERE isActive = 1 AND category = ?
      ORDER BY generatedAt DESC
      LIMIT ?
    `).all(category, limit) as Record<string, unknown>[];

    return rows.map(row => this.mapRowToTip(row));
  }

  markTipAsViewed(tipId: string, userId: string): void {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT OR IGNORE INTO guidance_tips_user_views (id, tipId, userId, viewedAt)
      VALUES (?, ?, ?, ?)
    `).run(id, tipId, userId, now);

    db.prepare(`
      UPDATE guidance_tips 
      SET viewCount = viewCount + 1, lastShownAt = ?, updated_at = ?
      WHERE id = ?
    `).run(now, now, tipId);
  }

  dismissTip(tipId: string, userId: string): void {
    const db = getDatabase();
    const now = new Date().toISOString();

    const existing = db.prepare(`
      SELECT id FROM guidance_tips_user_views WHERE tipId = ? AND userId = ?
    `).get(tipId, userId) as { id: string } | undefined;

    if (existing) {
      db.prepare(`
        UPDATE guidance_tips_user_views SET dismissed = 1 WHERE id = ?
      `).run(existing.id);
    } else {
      const id = uuidv4();
      db.prepare(`
        INSERT INTO guidance_tips_user_views (id, tipId, userId, viewedAt, dismissed)
        VALUES (?, ?, ?, ?, 1)
      `).run(id, tipId, userId, now);
    }
  }

  rateTip(tipId: string, userId: string, rating: number): void {
    const db = getDatabase();
    const now = new Date().toISOString();

    const existing = db.prepare(`
      SELECT id FROM guidance_tips_user_views WHERE tipId = ? AND userId = ?
    `).get(tipId, userId) as { id: string } | undefined;

    if (existing) {
      db.prepare(`
        UPDATE guidance_tips_user_views SET rating = ? WHERE id = ?
      `).run(rating, existing.id);
    } else {
      const id = uuidv4();
      db.prepare(`
        INSERT INTO guidance_tips_user_views (id, tipId, userId, viewedAt, rating)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, tipId, userId, now, rating);
    }
  }

  getTipCount(): number {
    const db = getDatabase();
    const result = db.prepare('SELECT COUNT(*) as count FROM guidance_tips WHERE isActive = 1').get() as { count: number };
    return result.count;
  }

  deleteOldTips(daysOld: number): number {
    const db = getDatabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = db.prepare(`
      DELETE FROM guidance_tips 
      WHERE generatedAt < ? AND isActive = 1
    `).run(cutoffDate.toISOString());

    return result.changes;
  }

  resetUserViews(userId: string): void {
    const db = getDatabase();
    db.prepare(`DELETE FROM guidance_tips_user_views WHERE userId = ?`).run(userId);
  }

  private mapRowToTip(row: Record<string, unknown>): GuidanceTip {
    return {
      id: row.id as string,
      category: row.category as GuidanceTip['category'],
      title: row.title as string,
      content: row.content as string,
      source: row.source as string,
      importance: row.importance as GuidanceTip['importance'],
      isRead: Boolean(row.isRead),
      isActive: Boolean(row.isActive),
      viewCount: row.viewCount as number,
      lastShownAt: row.lastShownAt as string | null,
      generatedAt: row.generatedAt as string,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
  }
}

export const guidanceTipsRepository = new GuidanceTipsRepository();
