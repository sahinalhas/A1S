/**
 * Unified Scoring Engine
 * Birleşik Skorlama Motoru
 * 
 * Tüm öğrenci skorlarını (akademik, sosyal, davranışsal, risk) tek merkezden hesaplar
 */

import type { UnifiedStudentScores, ProfileCompleteness } from '../../shared/types/student.types.js';
import { AggregateScoreCalculator } from '../features/student-profile/services/aggregate-score-calculator.service.js';
import type { StandardizedProfileRepository } from '../features/student-profile/repository/standardized-profile.repository.js';
import getDatabase from '../lib/database.js';

export class UnifiedScoringEngine {
  private scoreCalculator: AggregateScoreCalculator;
  private profileRepo: StandardizedProfileRepository | null = null;

  constructor() {
    this.scoreCalculator = new AggregateScoreCalculator();
  }

  private async initializeRepo() {
    if (!this.profileRepo) {
      const db = getDatabase();
      const { StandardizedProfileRepository: Repo } = await import('../features/student-profile/repository/standardized-profile.repository.js');
      this.profileRepo = new Repo(db);
    }
    return this.profileRepo;
  }

  /**
   * Calculate all scores for a student
   * Öğrenci için tüm skorları hesapla
   */
  async calculateUnifiedScores(studentId: string): Promise<UnifiedStudentScores> {
    // Initialize repository
    const repo = await this.initializeRepo();

    // Tüm profil verilerini al
    const academic = repo.getAcademicProfile(studentId);
    const socialEmotional = repo.getSocialEmotionalProfile(studentId);
    const behaviorIncidents = repo.getStandardizedBehaviorIncidents(studentId);
    const motivation = repo.getMotivationProfile(studentId);
    const riskProtective = repo.getRiskProtectiveProfile(studentId);

    // Aggregate skorları hesapla
    const aggregateScores = this.scoreCalculator.calculateAggregateScores({
      academic: academic as any,
      socialEmotional: socialEmotional as any,
      behaviorIncidents: behaviorIncidents as any,
      motivation: motivation as any,
      riskProtective: riskProtective ? {
        ...riskProtective,
        academicRiskLevel: this.mapRiskLevel(riskProtective.academicRiskLevel),
        behavioralRiskLevel: this.mapRiskLevel(riskProtective.behavioralRiskLevel),
        socialEmotionalRiskLevel: this.mapRiskLevel(riskProtective.socialEmotionalRiskLevel),
        attendanceRiskLevel: this.mapRiskLevel(riskProtective.attendanceRiskLevel),
        overallRiskLevel: this.mapRiskLevel(riskProtective.overallRiskLevel as any)
      } as any : null
    });

    // Birleşik skor formatına dönüştür
    return {
      studentId,
      lastUpdated: new Date().toISOString(),

      // Ana Skorlar
      akademikSkor: aggregateScores.academicScore,
      sosyalDuygusalSkor: aggregateScores.socialEmotionalScore,
      davranissalSkor: aggregateScores.behaviorScore,
      motivasyonSkor: aggregateScores.motivationScore,
      riskSkoru: aggregateScores.riskScore,

      // Detaylı Skorlar
      akademikDetay: {
        notOrtalamasi: aggregateScores.scoreBreakdown.academic.motivationLevel,
        devamDurumu: aggregateScores.scoreBreakdown.academic.homeworkCompletionRate,
        odeklikSeviyesi: aggregateScores.scoreBreakdown.academic.strongSkillsCount
      },

      sosyalDuygusalDetay: {
        empati: socialEmotional?.empathyLevel || 0,
        ozFarkinalik: socialEmotional?.selfAwarenessLevel || 0,
        duyguDuzenlemesi: socialEmotional?.emotionRegulationLevel || 0,
        iliski: aggregateScores.scoreBreakdown.socialEmotional.avgSELCompetency
      },

      davranissalDetay: {
        olumluDavranis: Math.max(0, 100 - (aggregateScores.scoreBreakdown.behavior.incidentCount * 10)),
        olumsuzDavranis: aggregateScores.scoreBreakdown.behavior.incidentCount,
        mudahaleEtkinligi: aggregateScores.scoreBreakdown.behavior.interventionEffectiveness
      }
    };
  }

  /**
   * Calculate profile completeness for all sections
   * Tüm bölümler için profil tamlık oranını hesapla
   */
  async calculateProfileCompleteness(studentId: string): Promise<ProfileCompleteness> {
    const repo = await this.initializeRepo();

    const academic = repo.getAcademicProfile(studentId);
    const socialEmotional = repo.getSocialEmotionalProfile(studentId);
    const behaviorIncidents = repo.getStandardizedBehaviorIncidents(studentId);

    const scores = {
      akademikProfil: this.calculateAcademicProfileCompleteness(academic),
      sosyalDuygusalProfil: this.calculateSocialEmotionalProfileCompleteness(socialEmotional),
      davranisalProfil: this.calculateBehaviorProfileCompleteness(behaviorIncidents)
    };

    const overall = Math.round(
      (scores.akademikProfil +
        scores.sosyalDuygusalProfil +
        scores.davranisalProfil) / 3
    );

    const eksikAlanlar: { kategori: string; alanlar: string[] }[] = [];

    if (scores.akademikProfil < 100) {
      const eksik = this.getAcademicMissingFields(academic);
      if (eksik.length > 0) {
        eksikAlanlar.push({ kategori: 'Akademik Profil', alanlar: eksik });
      }
    }

    if (scores.sosyalDuygusalProfil < 100) {
      const eksik = this.getSocialEmotionalMissingFields(socialEmotional);
      if (eksik.length > 0) {
        eksikAlanlar.push({ kategori: 'Sosyal-Duygusal Profil', alanlar: eksik });
      }
    }

    return {
      overall,
      temelBilgiler: 0,
      iletisimBilgileri: 0,
      veliBilgileri: 0,
      ...scores,
      eksikAlanlar
    };
  }

  private calculateAcademicProfileCompleteness(profile: any): number {
    if (!profile) return 0;

    let score = 0;
    let total = 9;

    if (profile.strongSubjects) score++;
    if (profile.weakSubjects) score++;
    if (profile.strongSkills) score++;
    if (profile.weakSkills) score++;
    if (profile.primaryLearningStyle) score++;
    if (profile.secondaryLearningStyle) score++;
    if (profile.overallMotivation) score++;
    if (profile.studyHoursPerWeek) score++;
    if (profile.homeworkCompletionRate) score++;

    return Math.round((score / total) * 100);
  }

  private calculateSocialEmotionalProfileCompleteness(profile: any): number {
    if (!profile) return 0;

    let score = 0;
    let total = 13;

    if (profile.strongSocialSkills) score++;
    if (profile.developingSocialSkills) score++;
    if (profile.empathyLevel) score++;
    if (profile.selfAwarenessLevel) score++;
    if (profile.emotionRegulationLevel) score++;
    if (profile.conflictResolutionLevel) score++;
    if (profile.leadershipLevel) score++;
    if (profile.teamworkLevel) score++;
    if (profile.communicationLevel) score++;
    if (profile.friendCircleSize) score++;
    if (profile.friendCircleQuality) score++;
    if (profile.socialRole) score++;
    if (profile.bullyingStatus) score++;

    return Math.round((score / total) * 100);
  }

  private calculateBehaviorProfileCompleteness(incidents: any[]): number {
    if (!incidents || incidents.length === 0) return 100; // Davranış kaydı yoksa tam kabul ediyoruz

    let totalFields = 0;
    let filledFields = 0;

    incidents.forEach((incident: any) => {
      totalFields += 7; // Her olay için kontrol edeceğimiz alan sayısı

      if (incident.behaviorCategory) filledFields++;
      if (incident.severity) filledFields++;
      if (incident.frequency) filledFields++;
      if (incident.antecedent) filledFields++;
      if (incident.behavior) filledFields++;
      if (incident.consequence) filledFields++;
      if (incident.interventionApplied) filledFields++;
    });

    if (totalFields === 0) return 100;
    return Math.round((filledFields / totalFields) * 100);
  }

  private getAcademicMissingFields(profile: any): string[] {
    const missing: string[] = [];

    if (!profile) {
      return ['Akademik profil oluşturulmamış'];
    }

    if (!profile.strongSubjects) missing.push('Güçlü dersler');
    if (!profile.weakSubjects) missing.push('Zayıf dersler');
    if (!profile.strongSkills) missing.push('Güçlü beceriler');
    if (!profile.primaryLearningStyle) missing.push('Birincil öğrenme stili');
    if (!profile.overallMotivation) missing.push('Genel motivasyon');
    if (!profile.homeworkCompletionRate) missing.push('Ödev tamamlama oranı');

    return missing;
  }

  private getSocialEmotionalMissingFields(profile: any): string[] {
    const missing: string[] = [];

    if (!profile) {
      return ['Sosyal-duygusal profil oluşturulmamış'];
    }

    if (!profile.empathyLevel) missing.push('Empati seviyesi');
    if (!profile.selfAwarenessLevel) missing.push('Öz farkındalık');
    if (!profile.emotionRegulationLevel) missing.push('Duygu düzenlemesi');
    if (!profile.friendCircleSize) missing.push('Arkadaş çevresi');
    if (!profile.socialRole) missing.push('Sosyal rol');

    return missing;
  }

  /**
   * Save aggregate scores to database
   * Hesaplanan skorları veritabanına kaydet
   */
  async saveAggregateScores(studentId: string, scores: UnifiedStudentScores): Promise<void> {
    const db = getDatabase();

    const stmt = db.prepare(`
      INSERT INTO student_aggregate_scores (
        studentId, academicScore, socialEmotionalScore, behaviorScore,
        motivationScore, riskScore, lastUpdated
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(studentId) DO UPDATE SET
        academicScore = excluded.academicScore,
        socialEmotionalScore = excluded.socialEmotionalScore,
        behaviorScore = excluded.behaviorScore,
        motivationScore = excluded.motivationScore,
        riskScore = excluded.riskScore,
        lastUpdated = excluded.lastUpdated
    `);

    stmt.run(
      studentId,
      scores.akademikSkor,
      scores.sosyalDuygusalSkor,
      scores.davranissalSkor,
      scores.motivasyonSkor,
      scores.riskSkoru,
      scores.lastUpdated
    );
  }

  /**
   * Get saved aggregate scores from database
   * Kaydedilmiş skorları veritabanından al
   */
  async getSavedAggregateScores(studentId: string): Promise<UnifiedStudentScores | null> {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT * FROM student_aggregate_scores WHERE studentId = ?
    `);

    const result = stmt.get(studentId) as any;

    if (!result) return null;

    return {
      studentId: result.studentId,
      lastUpdated: result.lastUpdated,
      akademikSkor: result.academicScore,
      sosyalDuygusalSkor: result.socialEmotionalScore,
      davranissalSkor: result.behaviorScore,
      motivasyonSkor: result.motivationScore,
      riskSkoru: result.riskScore,
      akademikDetay: {},
      sosyalDuygusalDetay: {},
      davranissalDetay: {}
    };
  }
  private mapRiskLevel(level: string | undefined | number): number {
    if (typeof level === 'number') return level;
    if (!level) return 0;

    const map: Record<string, number> = {
      'DÜŞÜK': 2,
      'ORTA': 5,
      'YÜKSEK': 8,
      'KRİTİK': 10,
      'ÇOK_YÜKSEK': 10
    };

    return map[level as string] || 5;
  }
}

export default UnifiedScoringEngine;
