import { getDatabase } from '../lib/database/connection';
import { EnhancedRiskPredictionService } from './enhanced-risk-prediction.service';
import { PersonalizedLearningService } from './personalized-learning.service';
import { AIProviderService } from './ai-provider.service';

export interface DashboardOverview {
  studentId: string;
  studentName: string;
  generatedAt: string;
  summary: {
    overallStatus: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';
    riskLevel: string;
    academicPerformance: string;
    socialEmotionalState: string;
    attendanceStatus: string;
  };
  keyMetrics: {
    riskScore: number;
    academicAverage: number;
    attendanceRate: number;
    behaviorScore: number;
    engagementLevel: number;
  };
  insights: Array<{
    category: string;
    type: 'positive' | 'neutral' | 'warning' | 'critical';
    title: string;
    description: string;
    actionRequired: boolean;
    suggestedAction?: string;
  }>;
  trends: {
    academic: 'IMPROVING' | 'STABLE' | 'DECLINING';
    behavior: 'IMPROVING' | 'STABLE' | 'DECLINING';
    attendance: 'IMPROVING' | 'STABLE' | 'DECLINING';
  };
  upcomingActions: Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    action: string;
    deadline: string;
    category: string;
  }>;
}

export interface AIGeneratedReport {
  studentId: string;
  reportType: string;
  generatedAt: string;
  title: string;
  executiveSummary: string;
  sections: Array<{
    heading: string;
    content: string;
    dataPoints?: unknown[];
  }>;
  recommendations: string[];
  nextSteps: string[];
}

export class AdvancedAnalyticsDashboardService {
  private db: ReturnType<typeof getDatabase>;
  private riskService: EnhancedRiskPredictionService;
  private learningService: PersonalizedLearningService;
  private aiProvider: AIProviderService;

  constructor() {
    this.db = getDatabase();
    this.riskService = new EnhancedRiskPredictionService();
    this.learningService = new PersonalizedLearningService();
    this.aiProvider = AIProviderService.getInstance();
  }

  async generateDashboardOverview(studentId: string): Promise<DashboardOverview> {
    const student = this.db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as { id: string; name: string } | undefined;
    if (!student) {
      throw new Error('Öğrenci bulunamadı');
    }

    const [riskScore, academicData, attendanceData, behaviorData] = await Promise.all([
      this.riskService.calculateEnhancedRiskScore(studentId),
      this.getAcademicData(studentId),
      this.getAttendanceData(studentId),
      this.getBehaviorData(studentId)
    ]);

    const summary = this.generateSummary(riskScore, academicData, attendanceData, behaviorData);
    const keyMetrics = this.calculateKeyMetrics(riskScore, academicData, attendanceData, behaviorData);
    const insights = await this.generateInsights(studentId, riskScore, academicData, attendanceData, behaviorData);
    const trends = this.analyzeTrends(academicData, behaviorData, attendanceData);
    const upcomingActions = this.identifyUpcomingActions(riskScore, insights);

    return {
      studentId,
      studentName: student.name,
      generatedAt: new Date().toISOString(),
      summary,
      keyMetrics,
      insights,
      trends,
      upcomingActions
    };
  }

  async generateAIReport(
    studentId: string, 
    reportType: 'comprehensive' | 'progress' | 'intervention' | 'parent'
  ): Promise<AIGeneratedReport> {
    const isAIAvailable = await this.aiProvider.isAvailable();
    
    if (!isAIAvailable) {
      throw new Error('AI servisi kullanılabilir değil');
    }

    const student = this.db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as { id: string; name: string; className?: string } | undefined;
    const dashboardData = await this.generateDashboardOverview(studentId);
    const riskScore = await this.riskService.calculateEnhancedRiskScore(studentId);
    const learningProfile = await this.learningService.analyzeLearningStyle(studentId);

    const prompt = this.buildReportPrompt(reportType, student, dashboardData, riskScore, learningProfile);

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen profesyonel bir eğitim danışmanısın. Öğrenci verilerini analiz ederek kapsamlı raporlar hazırlıyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        format: 'json'
      });

      const reportData = JSON.parse(response);

      return {
        studentId,
        reportType,
        generatedAt: new Date().toISOString(),
        ...reportData
      };
    } catch (error) {
      console.error('AI report generation error:', error);
      return this.generateTemplateReport(studentId, reportType, dashboardData);
    }
  }

  private async getAcademicData(studentId: string) {
    const exams = this.db.prepare(`
      SELECT totalScore, examDate 
      FROM exam_results 
      WHERE studentId = ? AND examDate >= date('now', '-6 months')
      ORDER BY examDate DESC
      LIMIT 10
    `).all(studentId) as Array<{ totalScore: string | number; examDate: string }>;

    const scores = exams.map(e => parseFloat(String(e.totalScore))).filter(s => !isNaN(s));
    const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      exams,
      average,
      trend: this.calculateTrend(scores)
    };
  }

  private async getAttendanceData(studentId: string) {
    const totalDays = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM attendance_records 
      WHERE studentId = ? AND date >= date('now', '-3 months')
    `).get(studentId) as { count: number } | undefined;

    const absentDays = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM attendance_records 
      WHERE studentId = ? AND status = 'Devamsız' AND date >= date('now', '-3 months')
    `).get(studentId) as { count: number } | undefined;

    const rate = (totalDays?.count || 0) > 0 
      ? (((totalDays?.count || 0) - (absentDays?.count || 0)) / (totalDays?.count || 1)) * 100 
      : 100;

    return {
      totalDays: totalDays?.count || 0,
      absentDays: absentDays?.count || 0,
      rate,
      trend: 'STABLE' as const
    };
  }

  private async getBehaviorData(studentId: string) {
    try {
      const incidents = this.db.prepare(`
        SELECT COUNT(*) as count, behaviorType
        FROM standardized_behavior_incidents
        WHERE studentId = ? AND incidentDate >= date('now', '-3 months')
        GROUP BY behaviorType
      `).all(studentId) as Array<{ count: number; behaviorType: string }>;

      const negativeCount = incidents
        .filter(i => i.behaviorType !== 'OLUMLU')
        .reduce((sum, i) => sum + i.count, 0);

      return {
        incidents,
        negativeCount,
        score: Math.max(0, 100 - (negativeCount * 10))
      };
    } catch (error) {
      return {
        incidents: [],
        negativeCount: 0,
        score: 100
      };
    }
  }

  private generateSummary(riskScore: Record<string, any>, academicData: any, attendanceData: any, behaviorData: any) {
    let overallStatus: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL' = 'GOOD';
    
    if (riskScore.riskLevel === 'KRİTİK' || academicData.average < 50) {
      overallStatus = 'CRITICAL';
    } else if (riskScore.riskLevel === 'YÜKSEK' || academicData.average < 60) {
      overallStatus = 'NEEDS_ATTENTION';
    } else if (riskScore.riskLevel === 'DÜŞÜK' && academicData.average >= 80) {
      overallStatus = 'EXCELLENT';
    }

    return {
      overallStatus,
      riskLevel: riskScore.riskLevel,
      academicPerformance: academicData.average >= 70 ? 'İyi' : academicData.average >= 50 ? 'Orta' : 'Düşük',
      socialEmotionalState: riskScore.factorScores.socialEmotional < 0.5 ? 'İyi' : 'Desteklenmeli',
      attendanceStatus: attendanceData.rate >= 90 ? 'Düzenli' : attendanceData.rate >= 80 ? 'Kabul Edilebilir' : 'Sorunlu'
    };
  }

  private calculateKeyMetrics(riskScore: Record<string, any>, academicData: any, attendanceData: any, behaviorData: any) {
    return {
      riskScore: riskScore.overallRiskScore * 100,
      academicAverage: academicData.average,
      attendanceRate: attendanceData.rate,
      behaviorScore: behaviorData.score,
      engagementLevel: this.calculateEngagementLevel(academicData, attendanceData, behaviorData)
    };
  }

  private calculateEngagementLevel(academicData: Record<string, any>, attendanceData: any, behaviorData: any): number {
    const academicWeight = 0.4;
    const attendanceWeight = 0.4;
    const behaviorWeight = 0.2;

    const academicScore = (academicData.average / 100) * 100;
    const attendanceScore = attendanceData.rate;
    const behaviorScore = behaviorData.score;

    return (academicScore * academicWeight) + 
           (attendanceScore * attendanceWeight) + 
           (behaviorScore * behaviorWeight);
  }

  private async generateInsights(studentId: string, riskScore: any, academicData: any, attendanceData: any, behaviorData: any) {
    const insights: Array<{ category: string; type: 'positive' | 'neutral' | 'warning' | 'critical'; title: string; description: string; actionRequired: boolean; suggestedAction?: string }> = [];

    if (riskScore.keyRiskFactors.length > 0) {
      riskScore.keyRiskFactors.slice(0, 3).forEach((factor: Record<string, any>) => {
        insights.push({
          category: 'Risk Faktörü',
          type: factor.severity === 'CRITICAL' ? 'critical' : factor.severity === 'HIGH' ? 'warning' : 'neutral',
          title: factor.factor,
          description: factor.description,
          actionRequired: factor.severity === 'CRITICAL' || factor.severity === 'HIGH',
          suggestedAction: factor.recommendation
        });
      });
    }

    if (academicData.trend === 'IMPROVING') {
      insights.push({
        category: 'Akademik',
        type: 'positive',
        title: 'Akademik Performans Yükselişte',
        description: `Son dönemde akademik başarı artış gösteriyor (Ort: ${academicData.average.toFixed(1)})`,
        actionRequired: false
      });
    }

    if (attendanceData.rate < 85) {
      insights.push({
        category: 'Devam',
        type: 'warning',
        title: 'Düşük Devam Oranı',
        description: `Devam oranı %${attendanceData.rate.toFixed(0)} - Hedef %90`,
        actionRequired: true,
        suggestedAction: 'Aile ile görüşme yapın ve devamsızlık nedenlerini araştırın'
      });
    }

    if (riskScore.protectiveFactors.length > 0) {
      insights.push({
        category: 'Koruyucu Faktör',
        type: 'positive',
        title: 'Güçlü Yönler Tespit Edildi',
        description: riskScore.protectiveFactors.map((f: Record<string, any>) => f.factor).join(', '),
        actionRequired: false
      });
    }

    return insights;
  }

  private analyzeTrends(academicData: Record<string, any>, behaviorData: any, attendanceData: any) {
    return {
      academic: academicData.trend,
      behavior: (behaviorData.negativeCount > 5 ? 'DECLINING' : 'STABLE') as 'IMPROVING' | 'STABLE' | 'DECLINING',
      attendance: attendanceData.trend
    };
  }

  private identifyUpcomingActions(riskScore: Record<string, any>, insights: unknown[]) {
    const actions: Array<{ priority: 'HIGH' | 'MEDIUM' | 'LOW'; action: string; deadline: string; category: string }> = [];

    const criticalInsights = insights.filter(i => i.type === 'critical' && i.actionRequired);
    criticalInsights.forEach(insight => {
      actions.push({
        priority: 'HIGH' as const,
        action: insight.suggestedAction || `${insight.title} ile ilgili acil müdahale gerekli`,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: insight.category
      });
    });

    const warningInsights = insights.filter(i => i.type === 'warning' && i.actionRequired);
    warningInsights.forEach(insight => {
      actions.push({
        priority: 'MEDIUM' as const,
        action: insight.suggestedAction || `${insight.title} için planlama yapın`,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: insight.category
      });
    });

    actions.push({
      priority: 'LOW' as const,
      action: 'Aylık ilerleme değerlendirmesi yapın',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Genel'
    });

    return actions.slice(0, 5);
  }

  private calculateTrend(scores: number[]): 'IMPROVING' | 'STABLE' | 'DECLINING' {
    if (scores.length < 3) return 'STABLE';

    const recent = scores.slice(0, Math.ceil(scores.length / 2));
    const earlier = scores.slice(Math.ceil(scores.length / 2));

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

    if (recentAvg > earlierAvg + 5) return 'IMPROVING';
    if (recentAvg < earlierAvg - 5) return 'DECLINING';
    return 'STABLE';
  }

  private buildReportPrompt(reportType: string, student: any, dashboardData: any, riskScore: any, learningProfile: any): string {
    return `Öğrenci için ${reportType.toUpperCase()} RAPOR hazırla:

ÖĞRENCİ BİLGİSİ:
${JSON.stringify(student, null, 2)}

DASHBOARD VERİLERİ:
${JSON.stringify(dashboardData, null, 2)}

RİSK ANALİZİ:
${JSON.stringify(riskScore, null, 2)}

ÖĞRENME PROFİLİ:
${JSON.stringify(learningProfile, null, 2)}

Lütfen şu formatta bir rapor oluştur (JSON):
{
  "title": "Rapor başlığı",
  "executiveSummary": "Yönetici özeti (2-3 paragraf)",
  "sections": [
    {
      "heading": "Bölüm başlığı",
      "content": "Bölüm içeriği (detaylı)",
      "dataPoints": []
    }
  ],
  "recommendations": ["Öneri 1", "Öneri 2"],
  "nextSteps": ["Sonraki adım 1", "Sonraki adım 2"]
}`;
  }

  private generateTemplateReport(studentId: string, reportType: string, dashboardData: any): AIGeneratedReport {
    return {
      studentId,
      reportType,
      generatedAt: new Date().toISOString(),
      title: `${reportType} Raporu - ${dashboardData.studentName}`,
      executiveSummary: `Bu rapor ${dashboardData.studentName} için hazırlanmıştır. Genel durum: ${dashboardData.summary.overallStatus}`,
      sections: [
        {
          heading: 'Genel Durum',
          content: `Risk seviyesi: ${dashboardData.summary.riskLevel}\nAkademik performans: ${dashboardData.summary.academicPerformance}\nDevam durumu: ${dashboardData.summary.attendanceStatus}`,
          dataPoints: []
        }
      ],
      recommendations: ['Düzenli takip yapın', 'İlerlemeyi izleyin'],
      nextSteps: ['Bir sonraki değerlendirme tarihi belirleyin']
    };
  }
}
