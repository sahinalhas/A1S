/**
 * Auto Profile Initializer Service
 * Otomatik Profil Başlatma Servisi
 * 
 * Yeni öğrenci oluşturulduğunda tüm standart profilleri otomatik olarak başlatır
 */

import { randomUUID } from 'crypto';
import getDatabase from '../lib/database.js';
import type { 
  AcademicProfile,
  SocialEmotionalProfile,
  MotivationProfile,
  RiskProtectiveProfile
} from '../../shared/types/standardized-profile.types.js';

export class AutoProfileInitializer {
  private db: ReturnType<typeof getDatabase>;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Initialize all profiles for a new student
   * Yeni bir öğrenci için tüm profilleri başlat
   */
  async initializeAllProfiles(studentId: string, assessedBy: string = 'SYSTEM'): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    try {
      // Akademik Profil
      await this.initializeAcademicProfile(studentId, today, assessedBy);
      
      // Sosyal-Duygusal Profil
      await this.initializeSocialEmotionalProfile(studentId, today, assessedBy);
      
      // Motivasyon Profili
      await this.initializeMotivationProfile(studentId, today, assessedBy);
      
      // Risk ve Koruyucu Faktörler Profili
      await this.initializeRiskProtectiveProfile(studentId, today, assessedBy);

      console.log(`✓ Tüm profiller başarıyla oluşturuldu: ${studentId}`);
    } catch (error) {
      console.error(`✗ Profil oluşturma hatası: ${studentId}`, error);
      throw error;
    }
  }

  private async initializeAcademicProfile(
    studentId: string, 
    date: string, 
    assessedBy: string
  ): Promise<void> {
    const profile: AcademicProfile = {
      id: randomUUID(),
      studentId,
      assessmentDate: date,
      strongSubjects: [],
      weakSubjects: [],
      strongSkills: [],
      weakSkills: [],
      primaryLearningStyle: 'GÖRSEL',
      secondaryLearningStyle: 'İŞİTSEL',
      overallMotivation: 5,
      studyHoursPerWeek: 0,
      homeworkCompletionRate: 50,
      additionalNotes: 'İlk profil oluşturuldu. Değerlendirme bekleniyor.',
      assessedBy
    };

    const stmt = this.db.prepare(`
      INSERT INTO academic_profiles (
        id, studentId, assessmentDate, strongSubjects, weakSubjects,
        strongSkills, weakSkills, primaryLearningStyle, secondaryLearningStyle,
        overallMotivation, studyHoursPerWeek, homeworkCompletionRate,
        additionalNotes, assessedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      profile.id,
      profile.studentId,
      profile.assessmentDate,
      JSON.stringify(profile.strongSubjects),
      JSON.stringify(profile.weakSubjects),
      JSON.stringify(profile.strongSkills),
      JSON.stringify(profile.weakSkills),
      profile.primaryLearningStyle,
      profile.secondaryLearningStyle,
      profile.overallMotivation,
      profile.studyHoursPerWeek,
      profile.homeworkCompletionRate,
      profile.additionalNotes,
      profile.assessedBy
    );
  }

  private async initializeSocialEmotionalProfile(
    studentId: string, 
    date: string, 
    assessedBy: string
  ): Promise<void> {
    const profile: SocialEmotionalProfile = {
      id: randomUUID(),
      studentId,
      assessmentDate: date,
      strongSocialSkills: [],
      developingSocialSkills: [],
      empathyLevel: 5,
      selfAwarenessLevel: 5,
      emotionRegulationLevel: 5,
      conflictResolutionLevel: 5,
      leadershipLevel: 5,
      teamworkLevel: 5,
      communicationLevel: 5,
      friendCircleSize: 'ORTA',
      friendCircleQuality: 'ORTA',
      socialRole: 'TAKİPÇİ',
      bullyingStatus: 'YOK',
      additionalNotes: 'İlk profil oluşturuldu. Gözlem bekleniyor.',
      assessedBy
    };

    const stmt = this.db.prepare(`
      INSERT INTO social_emotional_profiles (
        id, studentId, assessmentDate, strongSocialSkills, developingSocialSkills,
        empathyLevel, selfAwarenessLevel, emotionRegulationLevel, conflictResolutionLevel,
        leadershipLevel, teamworkLevel, communicationLevel,
        friendCircleSize, friendCircleQuality, socialRole, bullyingStatus,
        additionalNotes, assessedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      profile.id,
      profile.studentId,
      profile.assessmentDate,
      JSON.stringify(profile.strongSocialSkills),
      JSON.stringify(profile.developingSocialSkills),
      profile.empathyLevel,
      profile.selfAwarenessLevel,
      profile.emotionRegulationLevel,
      profile.conflictResolutionLevel,
      profile.leadershipLevel,
      profile.teamworkLevel,
      profile.communicationLevel,
      profile.friendCircleSize,
      profile.friendCircleQuality,
      profile.socialRole,
      profile.bullyingStatus,
      profile.additionalNotes,
      profile.assessedBy
    );
  }

  private async initializeMotivationProfile(
    studentId: string, 
    date: string, 
    assessedBy: string
  ): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO motivation_profiles (
        id, studentId, assessmentDate, goalClarityLevel, intrinsicMotivation,
        extrinsicMotivation, hasShortTermGoals, hasLongTermGoals,
        primaryMotivationSources, careerAspirations, assessedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      randomUUID(),
      studentId,
      date,
      5, // goalClarityLevel
      5, // intrinsicMotivation
      5, // extrinsicMotivation
      0, // hasShortTermGoals
      0, // hasLongTermGoals
      JSON.stringify([]),
      JSON.stringify([]),
      assessedBy
    );
  }

  private async initializeRiskProtectiveProfile(
    studentId: string, 
    date: string, 
    assessedBy: string
  ): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO risk_protective_profiles (
        id, studentId, assessmentDate, overallRiskScore, academicRiskLevel,
        behavioralRiskLevel, protectiveFactors, interventionsNeeded, 
        status, notes, assessedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      randomUUID(),
      studentId,
      date,
      50, // overallRiskScore
      'DÜŞÜK', // academicRiskLevel
      'DÜŞÜK', // behavioralRiskLevel
      JSON.stringify([]),
      JSON.stringify([]),
      'INITIAL', // status
      'İlk profil oluşturuldu. Risk değerlendirmesi bekleniyor.',
      assessedBy
    );
  }

  /**
   * Check if profiles exist for a student
   * Öğrenci için profillerin var olup olmadığını kontrol et
   */
  async checkProfilesExist(studentId: string): Promise<{
    academic: boolean;
    socialEmotional: boolean;
    motivation: boolean;
    riskProtective: boolean;
  }> {
    const checkProfile = (table: string): boolean => {
      const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${table} WHERE studentId = ?`);
      const result = stmt.get(studentId) as { count: number };
      return result.count > 0;
    };

    return {
      academic: checkProfile('academic_profiles'),
      socialEmotional: checkProfile('social_emotional_profiles'),
      motivation: checkProfile('motivation_profiles'),
      riskProtective: checkProfile('risk_protective_profiles')
    };
  }

  /**
   * Initialize missing profiles only
   * Sadece eksik profilleri oluştur
   */
  async initializeMissingProfiles(studentId: string, assessedBy: string = 'SYSTEM'): Promise<void> {
    const existing = await this.checkProfilesExist(studentId);
    const today = new Date().toISOString().split('T')[0];

    if (!existing.academic) {
      await this.initializeAcademicProfile(studentId, today, assessedBy);
      console.log(`✓ Akademik profil oluşturuldu: ${studentId}`);
    }

    if (!existing.socialEmotional) {
      await this.initializeSocialEmotionalProfile(studentId, today, assessedBy);
      console.log(`✓ Sosyal-duygusal profil oluşturuldu: ${studentId}`);
    }

    if (!existing.motivation) {
      await this.initializeMotivationProfile(studentId, today, assessedBy);
      console.log(`✓ Motivasyon profili oluşturuldu: ${studentId}`);
    }

    if (!existing.riskProtective) {
      await this.initializeRiskProtectiveProfile(studentId, today, assessedBy);
      console.log(`✓ Risk ve koruyucu faktörler profili oluşturuldu: ${studentId}`);
    }
  }
}

export default AutoProfileInitializer;
