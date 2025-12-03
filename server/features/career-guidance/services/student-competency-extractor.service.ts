/**
 * Student Competency Extractor Service
 * Öğrenci Yetkinlik Çıkarıcı Servisi
 * 
 * Öğrencinin mevcut profillerinden (akademik, sosyal-duygusal, yetenekler vb.)
 * yetkinlik profilini çıkarır ve normalize eder
 */

import type { Database } from 'better-sqlite3';
import type { StudentCompetencyProfile, CompetencyLevel } from '../../../../shared/types/career-guidance.types';
import { COMPETENCIES } from '../../../../shared/constants/career-profiles';

export class StudentCompetencyExtractorService {
  constructor(private db: Database) {}

  /**
   * Extract All Competencies
   * Tüm Yetkinlikleri Çıkar
   */
  async extractAllCompetencies(studentId: string): Promise<StudentCompetencyProfile[]> {
    const competencies: StudentCompetencyProfile[] = [];

    const academicComps = await this.extractAcademicCompetencies(studentId);
    const socialComps = await this.extractSocialEmotionalCompetencies(studentId);
    const technicalComps = await this.extractTechnicalCompetencies(studentId);
    const creativeComps = await this.extractCreativeCompetencies(studentId);
    const leadershipComps = await this.extractLeadershipCompetencies(studentId);
    const communicationComps = await this.extractCommunicationCompetencies(studentId);
    const physicalComps = await this.extractPhysicalCompetencies(studentId);

    competencies.push(
      ...academicComps,
      ...socialComps,
      ...technicalComps,
      ...creativeComps,
      ...leadershipComps,
      ...communicationComps,
      ...physicalComps
    );

    return competencies;
  }

  /**
   * Extract Academic Competencies
   * Akademik Yetkinlikleri Çıkar
   */
  private async extractAcademicCompetencies(studentId: string): Promise<StudentCompetencyProfile[]> {
    const competencies: StudentCompetencyProfile[] = [];

    const academicProfile = this.db.prepare(`
      SELECT * FROM academic_profiles 
      WHERE studentId = ? 
      ORDER BY assessmentDate DESC 
      LIMIT 1
    `).get(studentId) as any;

    if (!academicProfile) return competencies;

    const strongSubjects = academicProfile.strongSubjects ? JSON.parse(academicProfile.strongSubjects) : [];
    const strongSkills = academicProfile.strongSkills ? JSON.parse(academicProfile.strongSkills) : [];

    if (strongSubjects.includes('Matematik') || strongSkills.includes('problem_cozme')) {
      competencies.push({
        studentId,
        competencyId: 'MATH_SKILLS',
        competencyName: 'Matematik Becerileri',
        category: 'ACADEMIC',
        currentLevel: this.normalizeToLevel(academicProfile.overallMotivation || 5, 10),
        assessmentDate: academicProfile.assessmentDate,
        source: 'ACADEMIC'
      });
    }

    if (strongSubjects.includes('Fen Bilimleri') || strongSubjects.includes('Fizik') || 
        strongSubjects.includes('Kimya') || strongSubjects.includes('Biyoloji')) {
      competencies.push({
        studentId,
        competencyId: 'SCIENCE_SKILLS',
        competencyName: 'Fen Bilimleri Becerileri',
        category: 'ACADEMIC',
        currentLevel: this.normalizeToLevel(academicProfile.overallMotivation || 5, 10),
        assessmentDate: academicProfile.assessmentDate,
        source: 'ACADEMIC'
      });
    }

    if (strongSubjects.includes('Türkçe') || strongSubjects.includes('Edebiyat') || 
        strongSubjects.includes('İngilizce')) {
      competencies.push({
        studentId,
        competencyId: 'LANGUAGE_SKILLS',
        competencyName: 'Dil Becerileri',
        category: 'ACADEMIC',
        currentLevel: this.normalizeToLevel(academicProfile.overallMotivation || 5, 10),
        assessmentDate: academicProfile.assessmentDate,
        source: 'ACADEMIC'
      });
    }

    if (strongSkills.includes('arastirma') || strongSkills.includes('bilgi_toplama')) {
      competencies.push({
        studentId,
        competencyId: 'RESEARCH_SKILLS',
        competencyName: 'Araştırma Becerileri',
        category: 'ACADEMIC',
        currentLevel: 7,
        assessmentDate: academicProfile.assessmentDate,
        source: 'ACADEMIC'
      });
    }

    if (strongSkills.includes('elestiresel_dusunme') || strongSkills.includes('analitik_dusunme')) {
      competencies.push({
        studentId,
        competencyId: 'CRITICAL_THINKING',
        competencyName: 'Eleştirel Düşünme',
        category: 'ACADEMIC',
        currentLevel: 7,
        assessmentDate: academicProfile.assessmentDate,
        source: 'ACADEMIC'
      });
    }

    return competencies;
  }

  /**
   * Extract Social-Emotional Competencies
   * Sosyal-Duygusal Yetkinlikleri Çıkar
   */
  private async extractSocialEmotionalCompetencies(studentId: string): Promise<StudentCompetencyProfile[]> {
    const competencies: StudentCompetencyProfile[] = [];

    const selProfile = this.db.prepare(`
      SELECT * FROM social_emotional_profiles 
      WHERE studentId = ? 
      ORDER BY assessmentDate DESC 
      LIMIT 1
    `).get(studentId) as any;

    if (!selProfile) return competencies;

    if (selProfile.empathyLevel) {
      competencies.push({
        studentId,
        competencyId: 'EMPATHY',
        competencyName: 'Empati',
        category: 'SOCIAL_EMOTIONAL',
        currentLevel: selProfile.empathyLevel as CompetencyLevel,
        assessmentDate: selProfile.assessmentDate,
        source: 'SOCIAL_EMOTIONAL'
      });
    }

    if (selProfile.teamworkLevel) {
      competencies.push({
        studentId,
        competencyId: 'TEAMWORK',
        competencyName: 'Takım Çalışması',
        category: 'SOCIAL_EMOTIONAL',
        currentLevel: selProfile.teamworkLevel as CompetencyLevel,
        assessmentDate: selProfile.assessmentDate,
        source: 'SOCIAL_EMOTIONAL'
      });
    }

    if (selProfile.emotionRegulationLevel) {
      competencies.push({
        studentId,
        competencyId: 'EMOTIONAL_REGULATION',
        competencyName: 'Duygu Düzenleme',
        category: 'SOCIAL_EMOTIONAL',
        currentLevel: selProfile.emotionRegulationLevel as CompetencyLevel,
        assessmentDate: selProfile.assessmentDate,
        source: 'SOCIAL_EMOTIONAL'
      });
    }

    if (selProfile.conflictResolutionLevel) {
      competencies.push({
        studentId,
        competencyId: 'CONFLICT_RESOLUTION',
        competencyName: 'Çatışma Yönetimi',
        category: 'SOCIAL_EMOTIONAL',
        currentLevel: selProfile.conflictResolutionLevel as CompetencyLevel,
        assessmentDate: selProfile.assessmentDate,
        source: 'SOCIAL_EMOTIONAL'
      });
    }

    return competencies;
  }

  /**
   * Extract Technical Competencies
   * Teknik Yetkinlikleri Çıkar
   */
  private async extractTechnicalCompetencies(studentId: string): Promise<StudentCompetencyProfile[]> {
    const competencies: StudentCompetencyProfile[] = [];

    const talentsProfile = this.db.prepare(`
      SELECT * FROM talents_interests_profiles 
      WHERE studentId = ? 
      ORDER BY assessmentDate DESC 
      LIMIT 1
    `).get(studentId) as any;

    if (!talentsProfile) return competencies;

    const creativeTalents = talentsProfile.creativeTalents ? JSON.parse(talentsProfile.creativeTalents) : [];
    const primaryInterests = talentsProfile.primaryInterests ? JSON.parse(talentsProfile.primaryInterests) : [];

    if (primaryInterests.includes('yazilim') || primaryInterests.includes('programlama') || 
        primaryInterests.includes('kodlama')) {
      competencies.push({
        studentId,
        competencyId: 'PROGRAMMING',
        competencyName: 'Programlama',
        category: 'TECHNICAL',
        currentLevel: 7,
        assessmentDate: talentsProfile.assessmentDate,
        source: 'TALENTS'
      });
    }

    if (primaryInterests.includes('veri_analizi') || primaryInterests.includes('istatistik')) {
      competencies.push({
        studentId,
        competencyId: 'DATA_ANALYSIS',
        competencyName: 'Veri Analizi',
        category: 'TECHNICAL',
        currentLevel: 6,
        assessmentDate: talentsProfile.assessmentDate,
        source: 'TALENTS'
      });
    }

    if (creativeTalents.includes('teknik_cizim') || primaryInterests.includes('muhendislik')) {
      competencies.push({
        studentId,
        competencyId: 'TECHNICAL_DRAWING',
        competencyName: 'Teknik Çizim',
        category: 'TECHNICAL',
        currentLevel: 6,
        assessmentDate: talentsProfile.assessmentDate,
        source: 'TALENTS'
      });
    }

    if (primaryInterests.includes('laboratuvar') || primaryInterests.includes('deney')) {
      competencies.push({
        studentId,
        competencyId: 'LABORATORY_SKILLS',
        competencyName: 'Laboratuvar Becerileri',
        category: 'TECHNICAL',
        currentLevel: 6,
        assessmentDate: talentsProfile.assessmentDate,
        source: 'TALENTS'
      });
    }

    return competencies;
  }

  /**
   * Extract Creative Competencies
   * Yaratıcı Yetkinlikleri Çıkar
   */
  private async extractCreativeCompetencies(studentId: string): Promise<StudentCompetencyProfile[]> {
    const competencies: StudentCompetencyProfile[] = [];

    const talentsProfile = this.db.prepare(`
      SELECT * FROM talents_interests_profiles 
      WHERE studentId = ? 
      ORDER BY assessmentDate DESC 
      LIMIT 1
    `).get(studentId) as any;

    if (!talentsProfile) return competencies;

    const creativeTalents = talentsProfile.creativeTalents ? JSON.parse(talentsProfile.creativeTalents) : [];

    if (creativeTalents.length > 0) {
      competencies.push({
        studentId,
        competencyId: 'CREATIVITY',
        competencyName: 'Yaratıcılık',
        category: 'CREATIVE',
        currentLevel: Math.min(creativeTalents.length + 5, 10) as CompetencyLevel,
        assessmentDate: talentsProfile.assessmentDate,
        source: 'TALENTS'
      });
    }

    if (creativeTalents.includes('resim') || creativeTalents.includes('grafik_tasarim') || 
        creativeTalents.includes('muzik')) {
      competencies.push({
        studentId,
        competencyId: 'ARTISTIC_ABILITY',
        competencyName: 'Sanatsal Yetenek',
        category: 'CREATIVE',
        currentLevel: 7,
        assessmentDate: talentsProfile.assessmentDate,
        source: 'TALENTS'
      });
    }

    if (creativeTalents.includes('tasarim') || creativeTalents.includes('mimari')) {
      competencies.push({
        studentId,
        competencyId: 'DESIGN_THINKING',
        competencyName: 'Tasarım Düşüncesi',
        category: 'CREATIVE',
        currentLevel: 7,
        assessmentDate: talentsProfile.assessmentDate,
        source: 'TALENTS'
      });
    }

    if (creativeTalents.includes('yenilikci_projeler') || creativeTalents.includes('mucitlik')) {
      competencies.push({
        studentId,
        competencyId: 'INNOVATION',
        competencyName: 'Yenilikçilik',
        category: 'CREATIVE',
        currentLevel: 8,
        assessmentDate: talentsProfile.assessmentDate,
        source: 'TALENTS'
      });
    }

    return competencies;
  }

  /**
   * Extract Leadership Competencies
   * Liderlik Yetkinliklerini Çıkar
   */
  private async extractLeadershipCompetencies(studentId: string): Promise<StudentCompetencyProfile[]> {
    const competencies: StudentCompetencyProfile[] = [];

    const selProfile = this.db.prepare(`
      SELECT * FROM social_emotional_profiles 
      WHERE studentId = ? 
      ORDER BY assessmentDate DESC 
      LIMIT 1
    `).get(studentId) as any;

    if (!selProfile) return competencies;

    if (selProfile.leadershipLevel) {
      competencies.push({
        studentId,
        competencyId: 'LEADERSHIP',
        competencyName: 'Liderlik',
        category: 'LEADERSHIP',
        currentLevel: selProfile.leadershipLevel as CompetencyLevel,
        assessmentDate: selProfile.assessmentDate,
        source: 'SOCIAL_EMOTIONAL'
      });
    }

    if (selProfile.leadershipLevel && selProfile.leadershipLevel >= 7) {
      competencies.push({
        studentId,
        competencyId: 'DECISION_MAKING',
        competencyName: 'Karar Verme',
        category: 'LEADERSHIP',
        currentLevel: Math.min(selProfile.leadershipLevel + 1, 10) as CompetencyLevel,
        assessmentDate: selProfile.assessmentDate,
        source: 'SOCIAL_EMOTIONAL'
      });
    }

    const motivationProfile = this.db.prepare(`
      SELECT * FROM motivation_profiles 
      WHERE studentId = ? 
      ORDER BY assessmentDate DESC 
      LIMIT 1
    `).get(studentId) as any;

    if (motivationProfile && motivationProfile.futureOrientationLevel >= 7) {
      competencies.push({
        studentId,
        competencyId: 'STRATEGIC_THINKING',
        competencyName: 'Stratejik Düşünme',
        category: 'LEADERSHIP',
        currentLevel: motivationProfile.futureOrientationLevel as CompetencyLevel,
        assessmentDate: motivationProfile.assessmentDate,
        source: 'SOCIAL_EMOTIONAL'
      });
    }

    return competencies;
  }

  /**
   * Extract Communication Competencies
   * İletişim Yetkinliklerini Çıkar
   */
  private async extractCommunicationCompetencies(studentId: string): Promise<StudentCompetencyProfile[]> {
    const competencies: StudentCompetencyProfile[] = [];

    const selProfile = this.db.prepare(`
      SELECT * FROM social_emotional_profiles 
      WHERE studentId = ? 
      ORDER BY assessmentDate DESC 
      LIMIT 1
    `).get(studentId) as any;

    if (!selProfile) return competencies;

    if (selProfile.communicationLevel) {
      competencies.push({
        studentId,
        competencyId: 'VERBAL_COMMUNICATION',
        competencyName: 'Sözlü İletişim',
        category: 'COMMUNICATION',
        currentLevel: selProfile.communicationLevel as CompetencyLevel,
        assessmentDate: selProfile.assessmentDate,
        source: 'SOCIAL_EMOTIONAL'
      });
    }

    const academicProfile = this.db.prepare(`
      SELECT * FROM academic_profiles 
      WHERE studentId = ? 
      ORDER BY assessmentDate DESC 
      LIMIT 1
    `).get(studentId) as any;

    if (academicProfile) {
      const strongSkills = academicProfile.strongSkills ? JSON.parse(academicProfile.strongSkills) : [];
      
      if (strongSkills.includes('yazma') || strongSkills.includes('kompozisyon')) {
        competencies.push({
          studentId,
          competencyId: 'WRITTEN_COMMUNICATION',
          competencyName: 'Yazılı İletişim',
          category: 'COMMUNICATION',
          currentLevel: 7,
          assessmentDate: academicProfile.assessmentDate,
          source: 'ACADEMIC'
        });
      }
    }

    if (selProfile.empathyLevel && selProfile.empathyLevel >= 7) {
      competencies.push({
        studentId,
        competencyId: 'ACTIVE_LISTENING',
        competencyName: 'Aktif Dinleme',
        category: 'COMMUNICATION',
        currentLevel: selProfile.empathyLevel as CompetencyLevel,
        assessmentDate: selProfile.assessmentDate,
        source: 'SOCIAL_EMOTIONAL'
      });
    }

    if (selProfile.leadershipLevel && selProfile.leadershipLevel >= 7) {
      competencies.push({
        studentId,
        competencyId: 'PERSUASION',
        competencyName: 'İkna Kabiliyeti',
        category: 'COMMUNICATION',
        currentLevel: Math.min(selProfile.leadershipLevel, 10) as CompetencyLevel,
        assessmentDate: selProfile.assessmentDate,
        source: 'SOCIAL_EMOTIONAL'
      });
    }

    return competencies;
  }

  /**
   * Extract Physical Competencies
   * Fiziksel Yetkinlikleri Çıkar
   */
  private async extractPhysicalCompetencies(studentId: string): Promise<StudentCompetencyProfile[]> {
    const competencies: StudentCompetencyProfile[] = [];

    const talentsProfile = this.db.prepare(`
      SELECT * FROM talents_interests_profiles 
      WHERE studentId = ? 
      ORDER BY assessmentDate DESC 
      LIMIT 1
    `).get(studentId) as any;

    if (!talentsProfile) return competencies;

    const physicalTalents = talentsProfile.physicalTalents ? JSON.parse(talentsProfile.physicalTalents) : [];

    if (physicalTalents.includes('el_becerileri') || physicalTalents.includes('hassas_isler')) {
      competencies.push({
        studentId,
        competencyId: 'MANUAL_DEXTERITY',
        competencyName: 'El Becerisi',
        category: 'PHYSICAL',
        currentLevel: 7,
        assessmentDate: talentsProfile.assessmentDate,
        source: 'TALENTS'
      });

      competencies.push({
        studentId,
        competencyId: 'PHYSICAL_COORDINATION',
        competencyName: 'Fiziksel Koordinasyon',
        category: 'PHYSICAL',
        currentLevel: 7,
        assessmentDate: talentsProfile.assessmentDate,
        source: 'TALENTS'
      });
    }

    if (physicalTalents.includes('spor') || physicalTalents.includes('atletizm') || 
        physicalTalents.includes('dayaniklilik')) {
      competencies.push({
        studentId,
        competencyId: 'STAMINA',
        competencyName: 'Dayanıklılık',
        category: 'PHYSICAL',
        currentLevel: 8,
        assessmentDate: talentsProfile.assessmentDate,
        source: 'TALENTS'
      });
    }

    return competencies;
  }

  /**
   * Normalize to Level (1-10)
   * Seviyeyi Normalize Et
   */
  private normalizeToLevel(value: number, max: number): CompetencyLevel {
    const normalized = Math.round((value / max) * 10);
    return Math.max(1, Math.min(10, normalized)) as CompetencyLevel;
  }
}
