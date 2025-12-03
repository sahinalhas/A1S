import { getDatabase } from '../lib/database/connection';
import type { Database } from 'better-sqlite3';
import { PatternAnalysisService } from './pattern-analysis.service';
import { StudentContextService } from './student-context.service';

export interface EnhancedRiskScore {
  studentId: string;
  studentName: string;
  overallRiskScore: number;
  riskLevel: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  confidence: number;
  factorScores: {
    academic: number;
    behavioral: number;
    attendance: number;
    socialEmotional: number;
    familySupport: number;
    peerRelations: number;
    motivation: number;
    health: number;
  };
  predictiveIndicators: {
    shortTerm: {
      nextWeek: string;
      probability: number;
      suggestedActions: string[];
    };
    mediumTerm: {
      nextMonth: string;
      probability: number;
      suggestedActions: string[];
    };
    longTerm: {
      nextSemester: string;
      probability: number;
      suggestedActions: string[];
    };
  };
  keyRiskFactors: Array<{
    factor: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    recommendation: string;
  }>;
  protectiveFactors: Array<{
    factor: string;
    strength: number;
    description: string;
  }>;
  calculatedAt: string;
}

export interface RiskTrendAnalysis {
  studentId: string;
  historicalScores: Array<{
    date: string;
    score: number;
    level: string;
  }>;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'VOLATILE';
  trendPercentage: number;
  volatilityIndex: number;
  predictions: {
    next7Days: number;
    next30Days: number;
    next90Days: number;
  };
}

const RISK_WEIGHTS = {
  academic: 0.25,
  behavioral: 0.20,
  attendance: 0.20,
  socialEmotional: 0.15,
  familySupport: 0.08,
  peerRelations: 0.07,
  motivation: 0.03,
  health: 0.02
};

const RISK_THRESHOLDS = {
  DÜŞÜK: 0.25,
  ORTA: 0.50,
  YÜKSEK: 0.75,
  KRİTİK: 1.0
};

export class EnhancedRiskPredictionService {
  private db: ReturnType<typeof getDatabase>;
  private patternService: PatternAnalysisService;
  private contextService: StudentContextService;

  constructor() {
    this.db = getDatabase();
    this.patternService = new PatternAnalysisService();
    this.contextService = new StudentContextService();
  }

  async calculateEnhancedRiskScore(studentId: string): Promise<EnhancedRiskScore> {
    const student = this.db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as any;
    if (!student) {
      throw new Error('Öğrenci bulunamadı');
    }

    const factorScores = await this.calculateFactorScores(studentId);
    const overallRiskScore = this.calculateWeightedScore(factorScores);
    const riskLevel = this.determineRiskLevel(overallRiskScore);
    const confidence = await this.calculateConfidence(studentId);
    const keyRiskFactors = await this.identifyKeyRiskFactors(studentId, factorScores);
    const protectiveFactors = await this.identifyProtectiveFactors(studentId);
    const predictiveIndicators = await this.generatePredictiveIndicators(studentId, overallRiskScore, factorScores);

    return {
      studentId,
      studentName: student.name,
      overallRiskScore,
      riskLevel,
      confidence,
      factorScores,
      predictiveIndicators,
      keyRiskFactors,
      protectiveFactors,
      calculatedAt: new Date().toISOString()
    };
  }

  private async calculateFactorScores(studentId: string) {
    const [academic, behavioral, attendance, socialEmotional, familySupport, peerRelations, motivation, health] = 
      await Promise.all([
        this.calculateAcademicScore(studentId),
        this.calculateBehavioralScore(studentId),
        this.calculateAttendanceScore(studentId),
        this.calculateSocialEmotionalScore(studentId),
        this.calculateFamilySupportScore(studentId),
        this.calculatePeerRelationsScore(studentId),
        this.calculateMotivationScore(studentId),
        this.calculateHealthScore(studentId)
      ]);

    return {
      academic,
      behavioral,
      attendance,
      socialEmotional,
      familySupport,
      peerRelations,
      motivation,
      health
    };
  }

  private async calculateAcademicScore(studentId: string): Promise<number> {
    const exams = this.db.prepare(`
      SELECT totalScore, examDate 
      FROM exam_results 
      WHERE studentId = ? AND examDate >= date('now', '-6 months') AND totalScore IS NOT NULL
      ORDER BY examDate DESC
      LIMIT 10
    `).all(studentId) as any[];

    if (exams.length === 0) return 0;

    const scores = exams.map(e => parseFloat(e.totalScore));
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    let trend = 0;
    if (exams.length >= 3) {
      const recent = scores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const earlier = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
      trend = (earlier - recent) / 100;
    }

    const baseRisk = (100 - avgScore) / 100;
    const trendRisk = Math.max(0, trend);
    
    return Math.min(1, baseRisk * 0.7 + trendRisk * 0.3);
  }

  private async calculateBehavioralScore(studentId: string): Promise<number> {
    try {
      const incidents = this.db.prepare(`
        SELECT behaviorType, incidentDate, severity
        FROM standardized_behavior_incidents
        WHERE studentId = ? AND incidentDate >= date('now', '-3 months')
        ORDER BY incidentDate DESC
      `).all(studentId) as any[];

      if (incidents.length === 0) return 0;

      const negativeIncidents = incidents.filter(i => i.behaviorType !== 'OLUMLU');
      const severityMap = { 'HAFIF': 0.3, 'ORTA': 0.6, 'AĞIR': 1.0 };
      
      let totalSeverity = 0;
      negativeIncidents.forEach(i => {
        totalSeverity += severityMap[i.severity as keyof typeof severityMap] || 0.5;
      });

      const frequencyScore = Math.min(1, negativeIncidents.length / 10);
      const severityScore = Math.min(1, totalSeverity / negativeIncidents.length);
      
      return frequencyScore * 0.6 + severityScore * 0.4;
    } catch (error) {
      return 0;
    }
  }

  private async calculateAttendanceScore(studentId: string): Promise<number> {
    try {
      const absences = this.db.prepare(`
        SELECT COUNT(*) as count
        FROM attendance_records
        WHERE studentId = ? AND status = 'Devamsız' AND date >= date('now', '-3 months')
      `).get(studentId) as any;

      const tardies = this.db.prepare(`
        SELECT COUNT(*) as count
        FROM attendance_records
        WHERE studentId = ? AND status = 'Geç' AND date >= date('now', '-3 months')
      `).get(studentId) as any;

      const absenceScore = Math.min(1, (absences?.count || 0) / 15);
      const tardyScore = Math.min(1, (tardies?.count || 0) / 20);
      
      return absenceScore * 0.7 + tardyScore * 0.3;
    } catch (error) {
      return 0;
    }
  }

  private async calculateSocialEmotionalScore(studentId: string): Promise<number> {
    const profile = this.db.prepare(`
      SELECT empathyLevel, emotionRegulationLevel, conflictResolutionLevel, 
             friendCircleSize, friendCircleQuality, bullyingStatus
      FROM social_emotional_profiles
      WHERE studentId = ?
      ORDER BY assessmentDate DESC LIMIT 1
    `).get(studentId) as any;

    if (!profile) return 0.5;

    const avgSkillLevel = (
      (profile.empathyLevel || 3) + 
      (profile.emotionRegulationLevel || 3) + 
      (profile.conflictResolutionLevel || 3)
    ) / 3;
    
    const skillRisk = (5 - avgSkillLevel) / 5;

    const circleSizeRisk = profile.friendCircleSize === 'YOK' ? 1 : 
                          profile.friendCircleSize === 'AZ' ? 0.7 : 
                          profile.friendCircleSize === 'ORTA' ? 0.3 : 0;

    const bullyingRisk = profile.bullyingStatus === 'MAĞDUR' ? 0.8 :
                        profile.bullyingStatus === 'FAİL' ? 0.9 :
                        profile.bullyingStatus === 'HER_İKİSİ' ? 1.0 : 0;

    return skillRisk * 0.5 + circleSizeRisk * 0.3 + bullyingRisk * 0.2;
  }

  private async calculateFamilySupportScore(studentId: string): Promise<number> {
    const profile = this.db.prepare(`
      SELECT parentalInvolvementLevel, familyStabilityLevel, communicationQuality
      FROM family_context_profiles
      WHERE studentId = ?
      ORDER BY assessmentDate DESC LIMIT 1
    `).get(studentId) as any;

    if (!profile) return 0.5;

    const involvementRisk = profile.parentalInvolvementLevel === 'DÜŞÜK' ? 0.9 :
                           profile.parentalInvolvementLevel === 'ORTA' ? 0.5 :
                           profile.parentalInvolvementLevel === 'YÜKSEK' ? 0.1 : 0.5;

    const stabilityRisk = profile.familyStabilityLevel === 'UNSTABLE' ? 1.0 :
                         profile.familyStabilityLevel === 'TRANSITIONING' ? 0.6 : 0.2;

    const commRisk = profile.communicationQuality === 'SORUNLU' ? 0.8 :
                    profile.communicationQuality === 'KARMA' ? 0.5 : 0.2;

    return involvementRisk * 0.4 + stabilityRisk * 0.4 + commRisk * 0.2;
  }

  private async calculatePeerRelationsScore(studentId: string): Promise<number> {
    const profile = this.db.prepare(`
      SELECT socialIntegrationLevel, friendshipQuality, peerAcceptance
      FROM social_emotional_profiles
      WHERE studentId = ?
      ORDER BY assessmentDate DESC LIMIT 1
    `).get(studentId) as any;

    if (!profile) return 0.5;

    const integrationRisk = profile.socialIntegrationLevel === 'KRİTİK_İZOLASYON' ? 1.0 :
                           profile.socialIntegrationLevel === 'İZOLE' ? 0.8 :
                           profile.socialIntegrationLevel === 'ORTA_ENTEGRE' ? 0.4 : 0.1;

    const friendshipRisk = profile.friendshipQuality === 'YOK' ? 1.0 :
                          profile.friendshipQuality === 'SORUNLU' ? 0.7 :
                          profile.friendshipQuality === 'GELIŞEN' ? 0.4 : 0.1;

    const acceptanceRisk = 1 - ((profile.peerAcceptance || 5) / 10);

    return integrationRisk * 0.4 + friendshipRisk * 0.4 + acceptanceRisk * 0.2;
  }

  private async calculateMotivationScore(studentId: string): Promise<number> {
    const profile = this.db.prepare(`
      SELECT intrinsicMotivation, extrinsicMotivation, goalOrientation, resilienceLevel
      FROM motivation_profiles
      WHERE studentId = ?
      ORDER BY assessmentDate DESC LIMIT 1
    `).get(studentId) as any;

    if (!profile) return 0.5;

    const intrinsicRisk = (5 - (profile.intrinsicMotivation || 3)) / 5;
    const resilienceRisk = (5 - (profile.resilienceLevel || 3)) / 5;

    return intrinsicRisk * 0.6 + resilienceRisk * 0.4;
  }

  private async calculateHealthScore(studentId: string): Promise<number> {
    const profile = this.db.prepare(`
      SELECT chronicConditions, medicationCompliance, healthConcerns
      FROM standardized_health_profiles
      WHERE studentId = ?
      ORDER BY assessmentDate DESC LIMIT 1
    `).get(studentId) as any;

    if (!profile) return 0;

    const hasChronicConditions = profile.chronicConditions && 
                                 JSON.parse(profile.chronicConditions).length > 0;
    const hasConcerns = profile.healthConcerns && profile.healthConcerns.length > 10;

    return hasChronicConditions ? 0.5 : hasConcerns ? 0.3 : 0;
  }

  private calculateWeightedScore(factorScores: any): number {
    let totalScore = 0;
    Object.keys(RISK_WEIGHTS).forEach(key => {
      totalScore += factorScores[key] * RISK_WEIGHTS[key as keyof typeof RISK_WEIGHTS];
    });
    return Math.min(1, totalScore);
  }

  private determineRiskLevel(score: number): 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK' {
    if (score < RISK_THRESHOLDS.DÜŞÜK) return 'DÜŞÜK';
    if (score < RISK_THRESHOLDS.ORTA) return 'ORTA';
    if (score < RISK_THRESHOLDS.YÜKSEK) return 'YÜKSEK';
    return 'KRİTİK';
  }

  private async calculateConfidence(studentId: string): Promise<number> {
    const dataPoints = await this.countAvailableDataPoints(studentId);
    const maxPoints = 8;
    return Math.min(100, (dataPoints / maxPoints) * 100);
  }

  private async countAvailableDataPoints(studentId: string): Promise<number> {
    let count = 0;
    
    const tables = [
      'exam_results',
      'standardized_behavior_incidents',
      'attendance_records',
      'social_emotional_profiles',
      'family_context_profiles',
      'motivation_profiles',
      'standardized_health_profiles',
      'academic_profiles'
    ];

    for (const table of tables) {
      try {
        const result = this.db.prepare(`
          SELECT COUNT(*) as count FROM ${table} WHERE studentId = ?
        `).get(studentId) as any;
        if (result?.count > 0) count++;
      } catch (error) {
        continue;
      }
    }

    return count;
  }

  private async identifyKeyRiskFactors(studentId: string, factorScores: any) {
    const factors: Array<{
      factor: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      description: string;
      trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
      recommendation: string;
    }> = [];

    Object.entries(factorScores).forEach(([key, score]) => {
      if ((score as number) > 0.5) {
        const severity = (score as number) > 0.8 ? 'CRITICAL' : 
                        (score as number) > 0.65 ? 'HIGH' : 'MEDIUM';
        
        factors.push({
          factor: this.getFactorName(key),
          severity,
          description: this.getFactorDescription(key, score as number),
          trend: 'STABLE',
          recommendation: this.getFactorRecommendation(key)
        });
      }
    });

    return factors.sort((a, b) => {
      const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return severityOrder[b.severity as keyof typeof severityOrder] - 
             severityOrder[a.severity as keyof typeof severityOrder];
    });
  }

  private async identifyProtectiveFactors(studentId: string) {
    const factors: Array<{
      factor: string;
      strength: number;
      description: string;
    }> = [];

    const talents = this.db.prepare(`
      SELECT creativeTalents, physicalTalents, primaryInterests
      FROM talents_interests_profiles
      WHERE studentId = ?
      ORDER BY assessmentDate DESC LIMIT 1
    `).get(studentId) as any;

    if (talents) {
      const creativeTalentsList = JSON.parse(talents.creativeTalents || '[]');
      const physicalTalentsList = JSON.parse(talents.physicalTalents || '[]');
      
      if (creativeTalentsList.length > 0) {
        factors.push({
          factor: 'Yaratıcı Yetenekler',
          strength: 8,
          description: `${creativeTalentsList.join(', ')} alanlarında yetenekli`
        });
      }
      
      if (physicalTalentsList.length > 0) {
        factors.push({
          factor: 'Fiziksel Yetenekler',
          strength: 7,
          description: `${physicalTalentsList.join(', ')} alanlarında aktif`
        });
      }
    }

    const socialEmotional = this.db.prepare(`
      SELECT leadershipLevel, teamworkLevel, empathyLevel
      FROM social_emotional_profiles
      WHERE studentId = ?
      ORDER BY assessmentDate DESC LIMIT 1
    `).get(studentId) as any;

    if (socialEmotional) {
      if (socialEmotional.leadershipLevel >= 4) {
        factors.push({
          factor: 'Liderlik Özellikleri',
          strength: socialEmotional.leadershipLevel * 2,
          description: 'Güçlü liderlik becerileri gösteriyor'
        });
      }
      
      if (socialEmotional.empathyLevel >= 4) {
        factors.push({
          factor: 'Empati Kapasitesi',
          strength: socialEmotional.empathyLevel * 2,
          description: 'Yüksek düzeyde empati kurabiliyor'
        });
      }
    }

    return factors;
  }

  private async generatePredictiveIndicators(studentId: string, currentScore: number, factorScores: any) {
    const patterns = await this.patternService.analyzeStudentPatterns(studentId);
    const trendAnalysis = await this.calculateTrendAnalysis(studentId);

    const shortTerm = this.predictShortTerm(currentScore, trendAnalysis, patterns);
    const mediumTerm = this.predictMediumTerm(currentScore, trendAnalysis, factorScores);
    const longTerm = this.predictLongTerm(currentScore, trendAnalysis, factorScores);

    return {
      shortTerm,
      mediumTerm,
      longTerm
    };
  }

  private predictShortTerm(currentScore: number, trendAnalysis: any, patterns: any) {
    const trendMultiplier = trendAnalysis.trend === 'DECLINING' ? 1.1 : 
                           trendAnalysis.trend === 'IMPROVING' ? 0.9 : 1.0;
    
    const predictedScore = Math.min(1, currentScore * trendMultiplier);
    const level = this.determineRiskLevel(predictedScore);

    const criticalPatterns = patterns.filter((p: any) => p.severity === 'CRITICAL' || p.severity === 'WARNING');

    return {
      nextWeek: `Risk seviyesi: ${level}`,
      probability: Math.round(predictedScore * 100),
      suggestedActions: criticalPatterns.slice(0, 3).map((p: any) => p.recommendation)
    };
  }

  private predictMediumTerm(currentScore: number, trendAnalysis: any, factorScores: any) {
    let predictedScore = currentScore;
    
    if (factorScores.behavioral > 0.7) predictedScore += 0.1;
    if (factorScores.attendance > 0.6) predictedScore += 0.08;
    if (factorScores.academic > 0.7) predictedScore += 0.12;

    predictedScore = Math.min(1, predictedScore);
    const level = this.determineRiskLevel(predictedScore);

    const actions = [];
    if (factorScores.behavioral > 0.6) actions.push('Davranış desteği programı başlatın');
    if (factorScores.attendance > 0.5) actions.push('Devam takibi ve aile görüşmesi planlayın');
    if (factorScores.academic > 0.6) actions.push('Akademik destek ve bireysel çalışma planı hazırlayın');

    return {
      nextMonth: `Müdahale olmadan risk seviyesi: ${level}`,
      probability: Math.round(predictedScore * 100),
      suggestedActions: actions
    };
  }

  private predictLongTerm(currentScore: number, trendAnalysis: any, factorScores: any) {
    const volatilityPenalty = trendAnalysis.volatilityIndex * 0.15;
    let predictedScore = currentScore + volatilityPenalty;

    if (factorScores.familySupport > 0.7) predictedScore += 0.15;
    if (factorScores.socialEmotional > 0.6) predictedScore += 0.1;

    predictedScore = Math.min(1, predictedScore);
    const level = this.determineRiskLevel(predictedScore);

    return {
      nextSemester: `Uzun vadeli risk tahmini: ${level}`,
      probability: Math.round(predictedScore * 100),
      suggestedActions: [
        'Kapsamlı destek planı oluşturun',
        'Aile danışmanlığı düşünün',
        'Sosyal-duygusal öğrenme programına dahil edin',
        'Düzenli ilerleme takibi yapın'
      ]
    };
  }

  async calculateTrendAnalysis(studentId: string): Promise<RiskTrendAnalysis> {
    const historicalScores = this.db.prepare(`
      SELECT assessmentDate as date, overallRiskScore as score, riskLevel as level
      FROM risk_score_history
      WHERE studentId = ?
      ORDER BY assessmentDate DESC
      LIMIT 20
    `).all(studentId) as any[];

    if (historicalScores.length < 2) {
      return {
        studentId,
        historicalScores: [],
        trend: 'STABLE',
        trendPercentage: 0,
        volatilityIndex: 0,
        predictions: {
          next7Days: 0,
          next30Days: 0,
          next90Days: 0
        }
      };
    }

    const scores = historicalScores.map(h => h.score);
    const recentAvg = scores.slice(0, 5).reduce((a, b) => a + b, 0) / Math.min(5, scores.length);
    const olderAvg = scores.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, scores.slice(-5).length);
    
    const trendPercentage = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    let trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'VOLATILE' = 'STABLE';
    if (trendPercentage > 10) trend = 'DECLINING';
    else if (trendPercentage < -10) trend = 'IMPROVING';

    const variance = this.calculateVariance(scores);
    const volatilityIndex = variance > 0.15 ? variance : 0;

    if (volatilityIndex > 0.2) trend = 'VOLATILE';

    const predictions = {
      next7Days: Math.min(1, recentAvg * (1 + trendPercentage / 100 * 0.1)),
      next30Days: Math.min(1, recentAvg * (1 + trendPercentage / 100 * 0.3)),
      next90Days: Math.min(1, recentAvg * (1 + trendPercentage / 100 * 0.5))
    };

    return {
      studentId,
      historicalScores,
      trend,
      trendPercentage,
      volatilityIndex,
      predictions
    };
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private getFactorName(key: string): string {
    const names: Record<string, string> = {
      academic: 'Akademik Performans',
      behavioral: 'Davranışsal Sorunlar',
      attendance: 'Devam Durumu',
      socialEmotional: 'Sosyal-Duygusal Gelişim',
      familySupport: 'Aile Desteği',
      peerRelations: 'Akran İlişkileri',
      motivation: 'Motivasyon',
      health: 'Sağlık Durumu'
    };
    return names[key] || key;
  }

  private getFactorDescription(key: string, score: number): string {
    const percentage = Math.round(score * 100);
    const descriptions: Record<string, string> = {
      academic: `Akademik başarı %${percentage} risk gösteriyor`,
      behavioral: `Davranışsal problemler %${percentage} seviyesinde`,
      attendance: `Devamsızlık oranı %${percentage} risk taşıyor`,
      socialEmotional: `Sosyal-duygusal gelişimde %${percentage} risk var`,
      familySupport: `Aile desteği %${percentage} yetersiz`,
      peerRelations: `Akran ilişkilerinde %${percentage} sorun tespit edildi`,
      motivation: `Motivasyon düşüklüğü %${percentage} seviyesinde`,
      health: `Sağlık endişeleri %${percentage} risk oluşturuyor`
    };
    return descriptions[key] || `Risk seviyesi: %${percentage}`;
  }

  private getFactorRecommendation(key: string): string {
    const recommendations: Record<string, string> = {
      academic: 'Bireysel akademik destek planı oluşturun, öğrenme güçlüklerini analiz edin',
      behavioral: 'Davranış analizi yapın, olumlu davranış desteği (PBS) stratejileri uygulayın',
      attendance: 'Aile ile görüşme yapın, devamsızlık nedenlerini araştırın',
      socialEmotional: 'SEL (Sosyal-Duygusal Öğrenme) programına dahil edin',
      familySupport: 'Aile danışmanlığı ve veli eğitimi düzenleyin',
      peerRelations: 'Sosyal beceri eğitimi verin, akran desteği programına alın',
      motivation: 'Motivasyon kaynaklarını belirleyin, başarı hedefleri oluşturun',
      health: 'Sağlık durumunu izleyin, gerekirse sağlık profesyoneline yönlendirin'
    };
    return recommendations[key] || 'Detaylı değerlendirme yapın';
  }

  async saveRiskScoreToHistory(riskScore: EnhancedRiskScore): Promise<void> {
    try {
      this.db.prepare(`
        INSERT INTO risk_score_history (
          id, studentId, assessmentDate, 
          academicScore, behavioralScore, attendanceScore, socialEmotionalScore,
          overallRiskScore, riskLevel, dataPoints, calculationMethod
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `risk_${Date.now()}_${riskScore.studentId}`,
        riskScore.studentId,
        new Date().toISOString(),
        riskScore.factorScores.academic,
        riskScore.factorScores.behavioral,
        riskScore.factorScores.attendance,
        riskScore.factorScores.socialEmotional,
        riskScore.overallRiskScore,
        riskScore.riskLevel,
        JSON.stringify(riskScore.factorScores),
        'ENHANCED_ML_WEIGHTED'
      );
    } catch (error) {
      console.error('Error saving risk score to history:', error);
    }
  }
}
