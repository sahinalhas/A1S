/**
 * Career Matching Service
 * Kariyer Eşleştirme Servisi
 * 
 * Matematiksel modelleme ve optimizasyon algoritmaları ile
 * öğrenci-meslek uyumunu hesaplar
 */

import type {
  CareerProfile,
  StudentCompetencyProfile,
  CareerMatchResult,
  CompetencyGap,
  CompetencyRequirement
} from '../../../../shared/types/career-guidance.types';

export class CareerMatchingService {
  
  /**
   * Weighted Similarity Scoring
   * Ağırlıklı Benzerlik Skorlaması
   * 
   * Formül: Σ(min(student_level, required_level) / required_level * weight)
   */
  calculateMatchScore(
    studentCompetencies: StudentCompetencyProfile[],
    careerRequirements: CompetencyRequirement[]
  ): number {
    if (careerRequirements.length === 0) return 0;

    const competencyMap = new Map<string, number>();
    studentCompetencies.forEach(sc => {
      competencyMap.set(sc.competencyId, sc.currentLevel);
    });

    let totalScore = 0;
    let totalWeight = 0;

    for (const req of careerRequirements) {
      const studentLevel = competencyMap.get(req.competencyId) || 0;
      const requiredLevel = req.minimumLevel;
      const weight = req.weight;

      const normalizedScore = Math.min(studentLevel / requiredLevel, 1);
      totalScore += normalizedScore * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
  }

  /**
   * Gap Analysis
   * Yetkinlik Açığı Analizi
   * 
   * Öğrencinin eksik olduğu yetkinlikleri ve gelişim ihtiyacını belirler
   */
  analyzeGaps(
    studentCompetencies: StudentCompetencyProfile[],
    careerRequirements: CompetencyRequirement[]
  ): CompetencyGap[] {
    const competencyMap = new Map<string, number>();
    studentCompetencies.forEach(sc => {
      competencyMap.set(sc.competencyId, sc.currentLevel);
    });

    const gaps: CompetencyGap[] = [];

    for (const req of careerRequirements) {
      const studentLevel = competencyMap.get(req.competencyId) || 0;
      const gap = req.minimumLevel - studentLevel;

      if (gap > 0) {
        gaps.push({
          competencyId: req.competencyId,
          competencyName: req.competencyName,
          category: req.category,
          requiredLevel: req.minimumLevel,
          currentLevel: Math.max(0, Math.min(10, Math.round(studentLevel))) as any,
          gap: gap,
          importance: req.importance,
          estimatedDevelopmentTime: this.estimateDevelopmentTime(gap, req.importance)
        });
      }
    }

    return gaps.sort((a, b) => {
      const importanceOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      const importanceCompare = importanceOrder[a.importance] - importanceOrder[b.importance];
      if (importanceCompare !== 0) return importanceCompare;
      return b.gap - a.gap;
    });
  }

  /**
   * Identify Strengths
   * Güçlü Alanları Belirle
   */
  identifyStrengths(
    studentCompetencies: StudentCompetencyProfile[],
    careerRequirements: CompetencyRequirement[]
  ): string[] {
    const competencyMap = new Map<string, number>();
    studentCompetencies.forEach(sc => {
      competencyMap.set(sc.competencyId, sc.currentLevel);
    });

    const strengths: string[] = [];

    for (const req of careerRequirements) {
      const studentLevel = competencyMap.get(req.competencyId) || 0;
      
      if (studentLevel >= req.minimumLevel) {
        const overachievement = studentLevel - req.minimumLevel;
        if (overachievement >= 2 || studentLevel >= 8) {
          strengths.push(req.competencyName);
        }
      }
    }

    return strengths;
  }

  /**
   * Calculate Compatibility Level
   * Uyumluluk Seviyesini Belirle
   */
  getCompatibilityLevel(matchScore: number): 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'LOW' {
    if (matchScore >= 85) return 'EXCELLENT';
    if (matchScore >= 70) return 'GOOD';
    if (matchScore >= 50) return 'MODERATE';
    return 'LOW';
  }

  /**
   * Calculate Development Priority
   * Gelişim Önceliğini Belirle
   */
  getDevelopmentPriority(
    matchScore: number, 
    criticalGaps: number
  ): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (matchScore < 50 || criticalGaps > 2) return 'HIGH';
    if (matchScore < 70 || criticalGaps > 0) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Match Career to Student
   * Mesleği Öğrenciye Eşleştir
   */
  matchCareer(
    career: CareerProfile,
    studentCompetencies: StudentCompetencyProfile[]
  ): CareerMatchResult {
    const matchScore = this.calculateMatchScore(
      studentCompetencies, 
      career.requiredCompetencies
    );

    const gaps = this.analyzeGaps(
      studentCompetencies, 
      career.requiredCompetencies
    );

    const strengths = this.identifyStrengths(
      studentCompetencies, 
      career.requiredCompetencies
    );

    const criticalGaps = gaps.filter(g => g.importance === 'CRITICAL').length;

    return {
      careerId: career.id,
      careerName: career.name,
      careerCategory: career.category,
      matchScore: Math.round(matchScore * 10) / 10,
      compatibilityLevel: this.getCompatibilityLevel(matchScore),
      strengths,
      gaps,
      developmentPriority: this.getDevelopmentPriority(matchScore, criticalGaps)
    };
  }

  /**
   * Rank Careers
   * Meslekleri Sırala
   */
  rankCareers(
    careers: CareerProfile[],
    studentCompetencies: StudentCompetencyProfile[],
    limit: number = 10
  ): CareerMatchResult[] {
    const matches = careers.map(career => 
      this.matchCareer(career, studentCompetencies)
    );

    matches.sort((a, b) => {
      if (a.matchScore !== b.matchScore) {
        return b.matchScore - a.matchScore;
      }
      
      const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2 };
      return priorityOrder[a.developmentPriority] - priorityOrder[b.developmentPriority];
    });

    return matches.slice(0, limit);
  }

  /**
   * Calculate Overall Compatibility
   * Genel Kariyer Uyumunu Hesapla
   */
  calculateOverallCompatibility(matches: CareerMatchResult[]): number {
    if (matches.length === 0) return 0;
    
    const topMatches = matches.slice(0, 5);
    const avgScore = topMatches.reduce((sum, m) => sum + m.matchScore, 0) / topMatches.length;
    
    return Math.round(avgScore * 10) / 10;
  }

  /**
   * Estimate Development Time
   * Gelişim Süresini Tahmin Et
   */
  private estimateDevelopmentTime(gap: number, importance: string): string {
    const baseMonths = gap * 2;
    
    if (importance === 'CRITICAL') {
      if (baseMonths <= 3) return '2-3 ay (Yoğun çalışma)';
      if (baseMonths <= 6) return '4-6 ay (Düzenli çalışma)';
      return '6-12 ay (Uzun vadeli gelişim)';
    }
    
    if (importance === 'HIGH') {
      if (baseMonths <= 4) return '3-4 ay';
      if (baseMonths <= 8) return '5-8 ay';
      return '9-12 ay';
    }
    
    if (importance === 'MEDIUM') {
      if (baseMonths <= 6) return '3-6 ay';
      return '6-12 ay';
    }
    
    return '6-12 ay (Düşük öncelik)';
  }

  /**
   * Cosine Similarity (Alternative Algorithm)
   * Kosinüs Benzerliği - Alternatif Eşleşme Algoritması
   */
  calculateCosineSimilarity(
    studentCompetencies: StudentCompetencyProfile[],
    careerRequirements: CompetencyRequirement[]
  ): number {
    const competencyIds = new Set<string>();
    careerRequirements.forEach(req => competencyIds.add(req.competencyId));
    studentCompetencies.forEach(sc => competencyIds.add(sc.competencyId));

    const studentVector: number[] = [];
    const careerVector: number[] = [];

    const studentMap = new Map<string, number>();
    studentCompetencies.forEach(sc => studentMap.set(sc.competencyId, sc.currentLevel));

    const careerMap = new Map<string, number>();
    careerRequirements.forEach(req => careerMap.set(req.competencyId, req.minimumLevel));

    for (const id of competencyIds) {
      studentVector.push(studentMap.get(id) || 0);
      careerVector.push(careerMap.get(id) || 0);
    }

    const dotProduct = studentVector.reduce((sum, val, i) => sum + val * careerVector[i], 0);
    const studentMagnitude = Math.sqrt(studentVector.reduce((sum, val) => sum + val * val, 0));
    const careerMagnitude = Math.sqrt(careerVector.reduce((sum, val) => sum + val * val, 0));

    if (studentMagnitude === 0 || careerMagnitude === 0) return 0;

    return (dotProduct / (studentMagnitude * careerMagnitude)) * 100;
  }

  /**
   * Euclidean Distance (Alternative Algorithm)
   * Öklid Uzaklığı - Alternatif Eşleşme Algoritması
   */
  calculateEuclideanDistance(
    studentCompetencies: StudentCompetencyProfile[],
    careerRequirements: CompetencyRequirement[]
  ): number {
    const competencyMap = new Map<string, number>();
    studentCompetencies.forEach(sc => competencyMap.set(sc.competencyId, sc.currentLevel));

    let sumSquaredDiff = 0;
    let count = 0;

    for (const req of careerRequirements) {
      const studentLevel = competencyMap.get(req.competencyId) || 0;
      const diff = req.minimumLevel - studentLevel;
      sumSquaredDiff += diff * diff;
      count++;
    }

    const distance = Math.sqrt(sumSquaredDiff / count);
    const maxDistance = 10;
    const normalizedScore = Math.max(0, (1 - distance / maxDistance) * 100);

    return normalizedScore;
  }
}
