import * as repository from '../repository/intervention-tracking.repository.js';
import { AIProviderService } from '../../../services/ai-provider.service.js';
import getDatabase from '../../../lib/database.js';
import type { InterventionMetrics, EffectivenessAnalysis } from '../../../../shared/types/notification.types';

export class InterventionEffectivenessService {
  private aiProvider: AIProviderService;
  private db;

  constructor() {
    this.aiProvider = AIProviderService.getInstance();
    this.db = getDatabase();
  }

  async trackInterventionStart(
    interventionId: string,
    studentId: string,
    interventionType: string,
    interventionTitle: string,
    startDate: string
  ): Promise<string> {
    const preMetrics = await this.getStudentMetrics(studentId);

    return repository.createInterventionEffectiveness({
      interventionId,
      studentId,
      interventionType,
      interventionTitle,
      startDate,
      preInterventionMetrics: JSON.stringify(preMetrics),
      effectivenessLevel: 'PENDING'
    });
  }

  async evaluateInterventionEnd(
    interventionId: string,
    endDate: string,
    evaluatedBy: string
  ): Promise<EffectivenessAnalysis> {
    const effectiveness = repository.getEffectivenessByIntervention(interventionId);
    
    if (!effectiveness) {
      throw new Error('Intervention effectiveness record not found');
    }

    const postMetrics = await this.getStudentMetrics(effectiveness.studentId);
    const preMetrics: InterventionMetrics = JSON.parse(effectiveness.preInterventionMetrics);

    const impacts = this.calculateImpacts(preMetrics, postMetrics);
    const overallScore = this.calculateOverallEffectiveness(impacts);
    const level = this.determineEffectivenessLevel(overallScore);

    const duration = Math.floor(
      (new Date(endDate).getTime() - new Date(effectiveness.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    const aiAnalysis = await this.generateAIAnalysis(effectiveness, preMetrics, postMetrics, impacts);

    repository.updateInterventionEffectiveness(effectiveness.id, {
      endDate,
      duration,
      postInterventionMetrics: JSON.stringify(postMetrics),
      academicImpact: impacts.academic,
      behavioralImpact: impacts.behavioral,
      attendanceImpact: impacts.attendance,
      socialEmotionalImpact: impacts.socialEmotional,
      overallEffectiveness: overallScore,
      effectivenessLevel: level,
      aiAnalysis: JSON.stringify(aiAnalysis),
      evaluatedBy,
      evaluatedAt: new Date().toISOString()
    });

    return {
      overallScore,
      level,
      impacts,
      insights: aiAnalysis.insights,
      recommendations: aiAnalysis.recommendations,
      similarSuccesses: aiAnalysis.similarSuccesses
    };
  }

  async findSimilarSuccessfulInterventions(
    interventionType: string,
    studentProfile: any,
    limit: number = 5
  ): Promise<any[]> {
    const successful = repository.getInterventionsByType(interventionType)
      .filter(i => i.overallEffectiveness && i.overallEffectiveness >= 70)
      .slice(0, limit);

    return successful.map(i => ({
      interventionId: i.interventionId,
      title: i.interventionTitle,
      effectiveness: i.overallEffectiveness,
      successFactors: i.successFactors ? JSON.parse(i.successFactors) : [],
      duration: i.duration,
      impacts: {
        academic: i.academicImpact,
        behavioral: i.behavioralImpact,
        attendance: i.attendanceImpact,
        socialEmotional: i.socialEmotionalImpact
      }
    }));
  }

  async getInterventionLessonsLearned(interventionType: string): Promise<any> {
    const interventions = repository.getInterventionsByType(interventionType);
    
    const successful = interventions.filter(i => i.effectivenessLevel === 'VERY_EFFECTIVE' || i.effectivenessLevel === 'EFFECTIVE');
    const unsuccessful = interventions.filter(i => i.effectivenessLevel === 'NOT_EFFECTIVE');

    const lessons = {
      successPatterns: successful.map(i => ({
        title: i.interventionTitle,
        successFactors: i.successFactors,
        effectiveness: i.overallEffectiveness
      })),
      failurePatterns: unsuccessful.map(i => ({
        title: i.interventionTitle,
        challenges: i.challenges,
        lessonsLearned: i.lessonsLearned
      })),
      avgEffectiveness: successful.length > 0 
        ? successful.reduce((sum, i) => sum + (i.overallEffectiveness || 0), 0) / successful.length 
        : 0,
      successRate: interventions.length > 0 
        ? (successful.length / interventions.length) * 100 
        : 0
    };

    return lessons;
  }

  private async getStudentMetrics(studentId: string): Promise<InterventionMetrics> {
    const academicStmt = this.db.prepare(`
      SELECT AVG(gpa) as avgGpa 
      FROM academic_records 
      WHERE studentId = ? 
      ORDER BY year DESC, semester DESC 
      LIMIT 3
    `);
    const academic = academicStmt.get(studentId) as any;

    const behaviorStmt = this.db.prepare(`
      SELECT COUNT(*) as incidentCount
      FROM behavior_incidents
      WHERE studentId = ?
      AND date > date('now', '-30 days')
    `);
    const behavior = behaviorStmt.get(studentId) as any;

    const attendanceStmt = this.db.prepare(`
      SELECT 
        COUNT(*) as totalDays,
        SUM(CASE WHEN status = 'Devamsız' THEN 1 ELSE 0 END) as absentDays
      FROM attendance
      WHERE studentId = ?
      AND date > date('now', '-30 days')
    `);
    const attendance = attendanceStmt.get(studentId) as any;

    const attendanceRate = attendance.totalDays > 0 
      ? ((attendance.totalDays - attendance.absentDays) / attendance.totalDays) * 100 
      : 100;

    const riskStmt = this.db.prepare(`
      SELECT riskLevel, overallRiskScore
      FROM risk_score_history
      WHERE studentId = ?
      ORDER BY assessmentDate DESC
      LIMIT 1
    `);
    const risk = riskStmt.get(studentId) as any;

    return {
      academicScore: academic?.avgGpa ? academic.avgGpa * 25 : 50,
      behaviorScore: Math.max(0, 100 - (behavior?.incidentCount || 0) * 10),
      attendanceRate: attendanceRate,
      socialEmotionalScore: risk?.overallRiskScore ? 100 - risk.overallRiskScore : 50,
      riskLevel: risk?.riskLevel || 'ORTA'
    };
  }

  private calculateImpacts(pre: InterventionMetrics, post: InterventionMetrics): {
    academic: number;
    behavioral: number;
    attendance: number;
    socialEmotional: number;
  } {
    return {
      academic: ((post.academicScore - pre.academicScore) / pre.academicScore) * 100,
      behavioral: ((post.behaviorScore - pre.behaviorScore) / pre.behaviorScore) * 100,
      attendance: ((post.attendanceRate - pre.attendanceRate) / pre.attendanceRate) * 100,
      socialEmotional: ((post.socialEmotionalScore - pre.socialEmotionalScore) / pre.socialEmotionalScore) * 100
    };
  }

  private calculateOverallEffectiveness(impacts: any): number {
    const weights = {
      academic: 0.3,
      behavioral: 0.25,
      attendance: 0.25,
      socialEmotional: 0.2
    };

    const weightedSum = 
      impacts.academic * weights.academic +
      impacts.behavioral * weights.behavioral +
      impacts.attendance * weights.attendance +
      impacts.socialEmotional * weights.socialEmotional;

    return Math.max(0, Math.min(100, 50 + weightedSum / 2));
  }

  private determineEffectivenessLevel(score: number): 'VERY_EFFECTIVE' | 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'NOT_EFFECTIVE' {
    if (score >= 85) return 'VERY_EFFECTIVE';
    if (score >= 70) return 'EFFECTIVE';
    if (score >= 50) return 'PARTIALLY_EFFECTIVE';
    return 'NOT_EFFECTIVE';
  }

  private async generateAIAnalysis(
    effectiveness: any,
    preMetrics: InterventionMetrics,
    postMetrics: InterventionMetrics,
    impacts: any
  ): Promise<any> {
    try {
      const isAvailable = await this.aiProvider.isAvailable();
      if (!isAvailable) {
        return this.getFallbackAnalysis(impacts);
      }

      const prompt = `
Müdahale Etkinlik Analizi:

Müdahale: ${effectiveness.interventionTitle}
Tip: ${effectiveness.interventionType}
Süre: ${effectiveness.duration || 'Devam ediyor'} gün

Önce Metrikleri:
- Akademik Skor: ${preMetrics.academicScore.toFixed(1)}
- Davranış Skoru: ${preMetrics.behaviorScore.toFixed(1)}
- Devam Oranı: ${preMetrics.attendanceRate.toFixed(1)}%
- Sosyal-Duygusal: ${preMetrics.socialEmotionalScore.toFixed(1)}

Sonra Metrikleri:
- Akademik Skor: ${postMetrics.academicScore.toFixed(1)}
- Davranış Skoru: ${postMetrics.behaviorScore.toFixed(1)}
- Devam Oranı: ${postMetrics.attendanceRate.toFixed(1)}%
- Sosyal-Duygusal: ${postMetrics.socialEmotionalScore.toFixed(1)}

Etkiler:
- Akademik: ${impacts.academic.toFixed(1)}%
- Davranışsal: ${impacts.behavioral.toFixed(1)}%
- Devam: ${impacts.attendance.toFixed(1)}%
- Sosyal-Duygusal: ${impacts.socialEmotional.toFixed(1)}%

JSON formatında döndür:
{
  "insights": ["içgörü 1", "içgörü 2", ...],
  "recommendations": ["öneri 1", "öneri 2", ...],
  "successFactors": ["faktör 1", "faktör 2", ...],
  "challenges": ["zorluk 1", "zorluk 2", ...]
}`;

      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen bir eğitim uzmanısın. Müdahale etkinliklerini analiz edip içgörüler sunuyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        format: 'json'
      });

      const analysis = JSON.parse(response);
      
      const similar = await this.findSimilarSuccessfulInterventions(effectiveness.interventionType, preMetrics);
      
      return {
        ...analysis,
        similarSuccesses: similar
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getFallbackAnalysis(impacts);
    }
  }

  private getFallbackAnalysis(impacts: any): any {
    const insights = [];
    const recommendations = [];

    if (impacts.academic > 10) insights.push('Akademik performansta anlamlı iyileşme gözlendi');
    if (impacts.behavioral > 10) insights.push('Davranışsal gelişim kaydedildi');
    if (impacts.attendance > 5) insights.push('Devam oranında artış var');
    
    if (impacts.academic < 0) recommendations.push('Akademik destek stratejilerini gözden geçirin');
    if (impacts.behavioral < 0) recommendations.push('Davranış yönetimi yaklaşımını değerlendirin');

    return {
      insights,
      recommendations,
      successFactors: [],
      challenges: [],
      similarSuccesses: []
    };
  }
}
