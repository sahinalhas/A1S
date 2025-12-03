/**
 * Class Analytics Routes
 * Sınıf düzeyinde toplu profil analizi
 */

import { Request, Response } from 'express';
import getDatabase from '../../../lib/database.js';

export function getClassProfileSummary(req: Request, res: Response) {
  try {
    const { classId } = req.params;
    
    if (!classId) {
      return res.status(400).json({ 
        success: false, 
        error: 'classId gerekli' 
      });
    }

    const db = getDatabase();
    
    // Sınıftaki tüm öğrencilerin kimliklerini al
    const studentsStmt = db.prepare(`
      SELECT id FROM students WHERE class = ?
    `);
    const students = studentsStmt.all(classId) as any[];
    
    if (students.length === 0) {
      return res.json({
        classId,
        totalStudents: 0,
        riskDistribution: {},
        averageScores: {},
        trends: []
      });
    }

    const studentIds = students.map(s => s.id);
    
    // Unified identity verilerini al
    const placeholders = studentIds.map(() => '?').join(',');
    const identitiesStmt = db.prepare(`
      SELECT * FROM unified_student_identity
      WHERE studentId IN (${placeholders})
    `);
    const identities = identitiesStmt.all(...studentIds) as any[];

    // Risk dağılımı
    const riskDistribution: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    // Ortalama skorlar
    let totalAcademic = 0;
    let totalSocial = 0;
    let totalBehavioral = 0;
    let totalMotivation = 0;

    for (const identity of identities) {
      const priority = identity.interventionPriority || 'low';
      riskDistribution[priority] = (riskDistribution[priority] || 0) + 1;
      
      totalAcademic += identity.academicScore || 0;
      totalSocial += identity.socialEmotionalScore || 0;
      totalBehavioral += identity.behavioralScore || 0;
      totalMotivation += identity.motivationScore || 0;
    }

    const count = identities.length || 1;

    // Son profil değişikliklerini al
    const recentChangesStmt = db.prepare(`
      SELECT studentId, domain, action, timestamp
      FROM profile_sync_logs
      WHERE studentId IN (${placeholders})
      ORDER BY timestamp DESC
      LIMIT 20
    `);
    const recentChanges = recentChangesStmt.all(...studentIds) as any[];

    res.json({
      classId,
      totalStudents: students.length,
      identifiedStudents: identities.length,
      riskDistribution,
      averageScores: {
        academic: Math.round(totalAcademic / count),
        socialEmotional: Math.round(totalSocial / count),
        behavioral: Math.round(totalBehavioral / count),
        motivation: Math.round(totalMotivation / count)
      },
      recentChanges: recentChanges.map(change => ({
        studentId: change.studentId,
        domain: change.domain,
        action: change.action,
        timestamp: change.timestamp
      })),
      highRiskStudents: identities
        .filter(i => i.interventionPriority === 'high' || i.interventionPriority === 'critical')
        .map(i => ({
          studentId: i.studentId,
          riskLevel: i.riskLevel,
          priority: i.interventionPriority,
          challenges: JSON.parse(i.challenges || '[]')
        }))
    });
  } catch (error) {
    console.error('Error in class profile summary:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Sınıf özeti yüklenemedi' 
    });
  }
}

export function getClassTrends(req: Request, res: Response) {
  try {
    const { classId } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    
    const db = getDatabase();
    
    // Sınıf öğrencilerini al
    const studentsStmt = db.prepare(`
      SELECT id FROM students WHERE class = ?
    `);
    const students = studentsStmt.all(classId) as any[];
    const studentIds = students.map(s => s.id);
    
    if (studentIds.length === 0) {
      return res.json({ trends: [] });
    }

    const placeholders = studentIds.map(() => '?').join(',');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Belirli dönemdeki profil değişikliklerini al
    const logsStmt = db.prepare(`
      SELECT 
        DATE(timestamp) as date,
        domain,
        COUNT(*) as count
      FROM profile_sync_logs
      WHERE studentId IN (${placeholders})
        AND timestamp >= ?
      GROUP BY DATE(timestamp), domain
      ORDER BY date DESC
    `);
    
    const logs = logsStmt.all(...studentIds, cutoffDate.toISOString()) as any[];

    // Günlük trend verileri oluştur
    const trendsMap = new Map<string, any>();
    
    for (const log of logs) {
      if (!trendsMap.has(log.date)) {
        trendsMap.set(log.date, {
          date: log.date,
          academic: 0,
          social_emotional: 0,
          behavioral: 0,
          health: 0,
          total: 0
        });
      }
      
      const trend = trendsMap.get(log.date);
      trend[log.domain] = (trend[log.domain] || 0) + log.count;
      trend.total += log.count;
    }

    const trends = Array.from(trendsMap.values());

    res.json({ 
      classId,
      period: `${days} gün`,
      trends 
    });
  } catch (error) {
    console.error('Error in class trends:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Sınıf trendleri yüklenemedi' 
    });
  }
}

export function compareClasses(req: Request, res: Response) {
  try {
    const { classIds } = req.query;
    
    if (!classIds || typeof classIds !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'classIds parametresi gerekli (virgülle ayrılmış)' 
      });
    }

    const classes = classIds.split(',');
    const db = getDatabase();
    const comparison: unknown[] = [];

    for (const classId of classes) {
      const studentsStmt = db.prepare(`
        SELECT id FROM students WHERE class = ?
      `);
      const students = studentsStmt.all(classId) as any[];
      const studentIds = students.map(s => s.id);
      
      if (studentIds.length === 0) continue;

      const placeholders = studentIds.map(() => '?').join(',');
      const identitiesStmt = db.prepare(`
        SELECT AVG(academicScore) as avgAcademic,
               AVG(socialEmotionalScore) as avgSocial,
               AVG(behavioralScore) as avgBehavioral,
               AVG(riskLevel) as avgRisk
        FROM unified_student_identity
        WHERE studentId IN (${placeholders})
      `);
      
      const stats = identitiesStmt.get(...studentIds) as any;

      comparison.push({
        classId,
        studentCount: students.length,
        averageScores: {
          academic: Math.round(stats?.avgAcademic || 0),
          socialEmotional: Math.round(stats?.avgSocial || 0),
          behavioral: Math.round(stats?.avgBehavioral || 0)
        },
        averageRiskLevel: Math.round(stats?.avgRisk || 0)
      });
    }

    res.json({ comparison });
  } catch (error) {
    console.error('Error comparing classes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Sınıf karşılaştırması yapılamadı' 
    });
  }
}
