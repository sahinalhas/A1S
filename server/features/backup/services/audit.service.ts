/**
 * Audit Log Service (KVKK Compliance)
 * Denetim Kaydı Servisi (KVKK Uyumluluk)
 */

import getDatabase from '../../../lib/database';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

export interface AuditQuery {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export class AuditService {
  async logAccess(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const db = getDatabase();
    const auditLog: AuditLog = {
      ...log,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    
    try {
      db.prepare(`
        INSERT INTO audit_logs (
          id, user_id, user_name, action, resource, resource_id,
          ip_address, user_agent, details, timestamp, success, error_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        auditLog.id,
        auditLog.userId,
        auditLog.userName,
        auditLog.action,
        auditLog.resource,
        auditLog.resourceId || null,
        auditLog.ipAddress || null,
        auditLog.userAgent || null,
        auditLog.details ? JSON.stringify(auditLog.details) : null,
        auditLog.timestamp,
        auditLog.success ? 1 : 0,
        auditLog.errorMessage || null
      );
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  }
  
  async queryLogs(query: AuditQuery): Promise<AuditLog[]> {
    const db = getDatabase();
    const { userId, action, resource, startDate, endDate, limit = 100 } = query;
    
    let sql = `SELECT * FROM audit_logs WHERE 1=1`;
    const params: unknown[] = [];
    
    if (userId) {
      sql += ` AND user_id = ?`;
      params.push(userId);
    }
    
    if (action) {
      sql += ` AND action = ?`;
      params.push(action);
    }
    
    if (resource) {
      sql += ` AND resource = ?`;
      params.push(resource);
    }
    
    if (startDate) {
      sql += ` AND timestamp >= ?`;
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ` AND timestamp <= ?`;
      params.push(endDate);
    }
    
    sql += ` ORDER BY timestamp DESC LIMIT ?`;
    params.push(limit);
    
    const rows = db.prepare(sql).all(...params) as any[];
    
    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      action: row.action,
      resource: row.resource,
      resourceId: row.resource_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      details: row.details ? JSON.parse(row.details) : undefined,
      timestamp: row.timestamp,
      success: row.success === 1,
      errorMessage: row.error_message,
    }));
  }
  
  async getAccessReport(userId: string, days: number = 30): Promise<{
    totalAccesses: number;
    successfulAccesses: number;
    failedAccesses: number;
    resourceBreakdown: Record<string, number>;
    actionBreakdown: Record<string, number>;
    recentAccesses: AuditLog[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logs = await this.queryLogs({
      userId,
      startDate: startDate.toISOString(),
      limit: 1000,
    });
    
    const resourceBreakdown: Record<string, number> = {};
    const actionBreakdown: Record<string, number> = {};
    
    logs.forEach(log => {
      resourceBreakdown[log.resource] = (resourceBreakdown[log.resource] || 0) + 1;
      actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1;
    });
    
    return {
      totalAccesses: logs.length,
      successfulAccesses: logs.filter(l => l.success).length,
      failedAccesses: logs.filter(l => !l.success).length,
      resourceBreakdown,
      actionBreakdown,
      recentAccesses: logs.slice(0, 10),
    };
  }
  
  async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    const db = getDatabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const result = db.prepare(`
      DELETE FROM audit_logs WHERE timestamp < ?
    `).run(cutoffDate.toISOString());
    
    return result.changes;
  }
  
  ensureAuditTable(): void {
    const db = getDatabase();
    db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        resource_id TEXT,
        ip_address TEXT,
        user_agent TEXT,
        details TEXT,
        timestamp TEXT NOT NULL,
        success INTEGER NOT NULL DEFAULT 1,
        error_message TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource);
      CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
    `);
  }
}

export const auditService = new AuditService();
