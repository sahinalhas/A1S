/**
 * Profile Aggregation Service
 * Tüm veri kaynaklarını birleştirerek canlı öğrenci profilini oluşturur
 */

import { randomUUID } from 'crypto';
import { DataValidationService } from './data-validation.service.js';
import { FieldMapperService } from './field-mapper.service.js';
import { AIProviderService } from '../../../services/ai-provider.service.js';
import { StandardizedProfileRepository } from '../../student-profile/repository/standardized-profile.repository.js';
import * as profileSyncRepo from '../repository/profile-sync.repository.js';
import getDatabase from '../../../lib/database/index.js';
import type { 
  ProfileUpdateRequest, 
  ProfileUpdateResult, 
  UnifiedStudentIdentity,
  DataConflict,
  ProfileDomain,
  ProfileSyncLog
} from '../types/profile-sync.types.js';
import type {
  StandardizedHealthProfile,
  AcademicProfile,
  SocialEmotionalProfile,
  TalentsInterestsProfile
} from '../../../../shared/types/standardized-profile.types.js';

export class ProfileAggregationService {
  private validationService: DataValidationService;
  private fieldMapper: FieldMapperService;
  private aiProvider: AIProviderService;
  private profileRepo: StandardizedProfileRepository;
  private db: ReturnType<typeof getDatabase>;

  constructor() {
    this.validationService = new DataValidationService();
    this.fieldMapper = new FieldMapperService();
    this.aiProvider = AIProviderService.getInstance();
    this.db = getDatabase();
    this.profileRepo = new StandardizedProfileRepository(this.db);
  }

  /**
   * Yeni veri geldiğinde profili otomatik günceller
   */
  async processDataUpdate(request: ProfileUpdateRequest): Promise<ProfileUpdateResult> {
    try {
      console.log(`📊 Processing data update for student ${request.studentId} from ${request.source}`);

      // 1. Veriyi AI ile doğrula
      const validationResult = await this.validationService.validateData(
        request.source,
        request.rawData
      );

      if (!validationResult.isValid) {
        return {
          success: false,
          updatedDomains: [],
          validationResult,
          conflicts: [],
          autoResolved: false,
          message: `Veri doğrulama başarısız: ${validationResult.reasoning}`
        };
      }

      // 2. Çelişkileri kontrol et
      const conflicts = validationResult.conflicts || [];

      // 3. Profil alanlarını güncelle
      const updatedDomains = await this.updateProfileDomains(
        request.studentId,
        validationResult.suggestedDomain,
        validationResult.extractedInsights,
        request.source
      );

      // 4. Unified Identity'yi güncelle
      await this.refreshUnifiedIdentity(request.studentId);

      // 5. Log kaydı
      await this.logProfileUpdate(request, validationResult, updatedDomains);

      return {
        success: true,
        updatedDomains,
        validationResult,
        conflicts,
        autoResolved: conflicts.length === 0,
        message: `Profil başarıyla güncellendi. ${updatedDomains.length} alan etkilendi.`
      };
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  /**
   * Profil alanlarını günceller
   */
  private async updateProfileDomains(
    studentId: string,
    domains: ProfileDomain[],
    insights: Record<string, any>,
    source: string
  ): Promise<ProfileDomain[]> {
    const updated: ProfileDomain[] = [];

    for (const domain of domains) {
      try {
        await this.updateSpecificDomain(studentId, domain, insights, source);
        updated.push(domain);
      } catch (error) {
        console.error(`Failed to update domain ${domain}:`, error);
      }
    }

    return updated;
  }

  /**
   * Belirli bir profil alanını günceller - AI'NIN BULDUĞU BİLGİLERİ GERÇEK ALANLARA YAZAR
   */
  private async updateSpecificDomain(
    studentId: string,
    domain: ProfileDomain,
    insights: Record<string, any>,
    source: string
  ): Promise<void> {
    console.log(`🔄 Updating ${domain} for student ${studentId}...`);
    
    // Field mapper ile AI insights'ı database field'larına map et
    const mappedFields = this.fieldMapper.mapInsightsToFields(domain, insights);
    
    if (Object.keys(mappedFields).length === 0) {
      console.log(`⚠️ No fields to update for domain: ${domain}`);
      return;
    }

    try {
      switch (domain) {
        case 'health':
          await this.updateHealthProfile(studentId, mappedFields);
          break;
        
        case 'academic':
          await this.updateAcademicProfile(studentId, mappedFields);
          break;
        
        case 'social_emotional':
          await this.updateSocialEmotionalProfile(studentId, mappedFields);
          break;
        
        case 'talents_interests':
          await this.updateTalentsInterestsProfile(studentId, mappedFields);
          break;
        
        case 'behavioral':
        case 'motivation':
        case 'risk_factors':
        case 'family':
          // Bu alanlar için gelecekte ek tablolar eklenebilir
          console.log(`📝 Domain ${domain} için mapped fields:`, mappedFields);
          break;
        
        default:
          console.log(`⚠️ Unknown domain: ${domain}`);
      }
      
      console.log(`✅ Successfully updated ${domain} for student ${studentId}`);
    } catch (error) {
      console.error(`❌ Failed to update ${domain}:`, error);
      throw error;
    }
  }

  /**
   * Sağlık profilini günceller - DOKTOR KONTROLÜ GİBİ BİLGİLER BURAYA YAZILIR
   */
  private async updateHealthProfile(studentId: string, fields: Record<string, any>): Promise<void> {
    console.log(`🏥 Updating health profile for ${studentId}:`, fields);
    
    // Mevcut profili al
    const existing = this.profileRepo.getStandardizedHealthProfile(studentId);
    
    // Tarih alanlarını normalize et
    if (fields.lastHealthCheckup) {
      fields.lastHealthCheckup = this.fieldMapper.normalizeDate(fields.lastHealthCheckup);
    }
    
    // Profil oluştur veya güncelle
    const profile: StandardizedHealthProfile = {
      id: existing?.id || randomUUID(),
      studentId,
      bloodType: fields.bloodType || existing?.bloodType || null,
      chronicDiseases: this.ensureJsonArray(fields.chronicDiseases || existing?.chronicDiseases || []),
      allergies: this.ensureJsonArray(fields.allergies || existing?.allergies || []),
      currentMedications: this.ensureJsonArray(fields.currentMedications || existing?.currentMedications || []),
      medicalHistory: fields.medicalHistory || existing?.medicalHistory || null,
      specialNeeds: fields.specialNeeds || existing?.specialNeeds || null,
      physicalLimitations: fields.physicalLimitations || existing?.physicalLimitations || null,
      emergencyContact1Name: fields.emergencyContact1Name || existing?.emergencyContact1Name || null,
      emergencyContact1Phone: fields.emergencyContact1Phone || existing?.emergencyContact1Phone || null,
      emergencyContact1Relation: fields.emergencyContact1Relation || existing?.emergencyContact1Relation || null,
      emergencyContact2Name: fields.emergencyContact2Name || existing?.emergencyContact2Name || null,
      emergencyContact2Phone: fields.emergencyContact2Phone || existing?.emergencyContact2Phone || null,
      emergencyContact2Relation: fields.emergencyContact2Relation || existing?.emergencyContact2Relation || null,
      physicianName: fields.physicianName || existing?.physicianName || null,
      physicianPhone: fields.physicianPhone || existing?.physicianPhone || null,
      lastHealthCheckup: fields.lastHealthCheckup || existing?.lastHealthCheckup || null,
      additionalNotes: fields.additionalNotes || existing?.additionalNotes || null
    };
    
    this.profileRepo.upsertStandardizedHealthProfile(profile);
    console.log(`✅ Health profile updated! Last checkup: ${profile.lastHealthCheckup}`);
  }

  /**
   * Akademik profili günceller
   */
  private async updateAcademicProfile(studentId: string, fields: Record<string, any>): Promise<void> {
    console.log(`📚 Updating academic profile for ${studentId}:`, fields);
    
    const existing = this.profileRepo.getAcademicProfile(studentId);
    
    const profile: AcademicProfile = {
      id: existing?.id || randomUUID(),
      studentId,
      assessmentDate: new Date().toISOString(),
      strongSubjects: this.ensureJsonArray(fields.strongSubjects || existing?.strongSubjects || []),
      weakSubjects: this.ensureJsonArray(fields.weakSubjects || existing?.weakSubjects || []),
      strongSkills: this.ensureJsonArray(fields.strongSkills || existing?.strongSkills || []),
      weakSkills: this.ensureJsonArray(fields.weakSkills || existing?.weakSkills || []),
      primaryLearningStyle: fields.primaryLearningStyle || existing?.primaryLearningStyle || null,
      secondaryLearningStyle: fields.secondaryLearningStyle || existing?.secondaryLearningStyle || null,
      overallMotivation: fields.overallMotivation || existing?.overallMotivation || null,
      studyHoursPerWeek: fields.studyHoursPerWeek || existing?.studyHoursPerWeek || null,
      homeworkCompletionRate: fields.homeworkCompletionRate || existing?.homeworkCompletionRate || null,
      additionalNotes: fields.additionalNotes || existing?.additionalNotes || null,
      assessedBy: 'AI Auto-Sync'
    };
    
    this.profileRepo.upsertAcademicProfile(profile);
    console.log(`✅ Academic profile updated!`);
  }

  /**
   * Sosyal-duygusal profili günceller
   */
  private async updateSocialEmotionalProfile(studentId: string, fields: Record<string, any>): Promise<void> {
    console.log(`❤️ Updating social-emotional profile for ${studentId}:`, fields);
    
    const existing = this.profileRepo.getSocialEmotionalProfile(studentId);
    
    const profile: SocialEmotionalProfile = {
      id: existing?.id || randomUUID(),
      studentId,
      assessmentDate: new Date().toISOString(),
      strongSocialSkills: this.ensureJsonArray(fields.strongSocialSkills || existing?.strongSocialSkills || []),
      developingSocialSkills: this.ensureJsonArray(fields.developingSocialSkills || existing?.developingSocialSkills || []),
      empathyLevel: fields.empathyLevel || existing?.empathyLevel || null,
      selfAwarenessLevel: fields.selfAwarenessLevel || existing?.selfAwarenessLevel || null,
      emotionRegulationLevel: fields.emotionRegulationLevel || existing?.emotionRegulationLevel || null,
      conflictResolutionLevel: fields.conflictResolutionLevel || existing?.conflictResolutionLevel || null,
      leadershipLevel: fields.leadershipLevel || existing?.leadershipLevel || null,
      teamworkLevel: fields.teamworkLevel || existing?.teamworkLevel || null,
      communicationLevel: fields.communicationLevel || existing?.communicationLevel || null,
      friendCircleSize: fields.friendCircleSize || existing?.friendCircleSize || null,
      friendCircleQuality: fields.friendCircleQuality || existing?.friendCircleQuality || null,
      socialRole: fields.socialRole || existing?.socialRole || null,
      bullyingStatus: fields.bullyingStatus || existing?.bullyingStatus || null,
      additionalNotes: fields.additionalNotes || existing?.additionalNotes || null,
      assessedBy: 'AI Auto-Sync'
    };
    
    this.profileRepo.upsertSocialEmotionalProfile(profile);
    console.log(`✅ Social-emotional profile updated!`);
  }

  /**
   * Yetenek ve ilgi alanları profilini günceller
   */
  private async updateTalentsInterestsProfile(studentId: string, fields: Record<string, any>): Promise<void> {
    console.log(`🎨 Updating talents/interests profile for ${studentId}:`, fields);
    
    const existing = this.profileRepo.getTalentsInterestsProfile(studentId);
    
    const profile: TalentsInterestsProfile = {
      id: existing?.id || randomUUID(),
      studentId,
      assessmentDate: new Date().toISOString(),
      creativeTalents: this.ensureJsonArray(fields.creativeTalents || existing?.creativeTalents || []),
      physicalTalents: this.ensureJsonArray(fields.physicalTalents || existing?.physicalTalents || []),
      primaryInterests: this.ensureJsonArray(fields.primaryInterests || existing?.primaryInterests || []),
      exploratoryInterests: this.ensureJsonArray(fields.exploratoryInterests || existing?.exploratoryInterests || []),
      talentProficiency: existing?.talentProficiency || undefined,
      weeklyEngagementHours: fields.weeklyEngagementHours || existing?.weeklyEngagementHours || null,
      clubMemberships: this.ensureJsonArray(fields.clubMemberships || existing?.clubMemberships || []),
      competitionsParticipated: this.ensureJsonArray(fields.competitionsParticipated || existing?.competitionsParticipated || []),
      additionalNotes: fields.additionalNotes || existing?.additionalNotes || null,
      assessedBy: 'AI Auto-Sync'
    };
    
    this.profileRepo.upsertTalentsInterestsProfile(profile);
    console.log(`✅ Talents/interests profile updated!`);
  }

  /**
   * JSON array formatını garanti eder
   */
  private ensureJsonArray(value: any): string[] {
    if (Array.isArray(value)) return value.map((v: any) => String(v));
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map((v: any) => String(v)) : [value];
      } catch {
        return [value];
      }
    }
    return [];
  }

  /**
   * Unified Student Identity'yi yeniler - "Öğrenci Kimdir?" sorusunun cevabı
   */
  async refreshUnifiedIdentity(studentId: string): Promise<UnifiedStudentIdentity> {
    try {
      // Tüm profil verilerini topla
      const allData = await this.gatherAllProfileData(studentId);

      // AI ile öğrenci kimliğini oluştur
      const identity = await this.generateStudentIdentity(studentId, allData);

      // Database'e kaydet
      profileSyncRepo.saveUnifiedIdentity(identity);
      console.log(`✅ Unified identity saved for student ${studentId}`);

      return identity;
    } catch (error) {
      console.error('Unified identity refresh error:', error);
      throw error;
    }
  }

  /**
   * Tüm profil verilerini toplar
   */
  private async gatherAllProfileData(studentId: string): Promise<any> {
    const studentStmt = this.db.prepare('SELECT * FROM students WHERE id = ?');
    const student = studentStmt.get(studentId);

    const academicStmt = this.db.prepare(`
      SELECT er.*, e.name as examName, e.type as examType 
      FROM exam_results er 
      LEFT JOIN exams e ON er.examId = e.id 
      WHERE er.studentId = ? 
      ORDER BY er.examDate DESC LIMIT 10
    `);
    const academicRecords = academicStmt.all(studentId);

    const behaviorStmt = this.db.prepare(`
      SELECT * FROM behavior_incidents 
      WHERE studentId = ? 
      ORDER BY date DESC LIMIT 10
    `);
    const behaviorRecords = behaviorStmt.all(studentId);

    const counselingStmt = this.db.prepare(`
      SELECT * FROM counseling_sessions 
      WHERE studentId = ? 
      ORDER BY sessionDate DESC LIMIT 10
    `);
    const counselingRecords = counselingStmt.all(studentId);

    const achievementsStmt = this.db.prepare(`
      SELECT * FROM achievements 
      WHERE studentId = ? 
      ORDER BY date DESC LIMIT 10
    `);
    const achievements = achievementsStmt.all(studentId);

    const attendanceStmt = this.db.prepare(`
      SELECT * FROM attendance_records 
      WHERE studentId = ? 
      ORDER BY date DESC LIMIT 30
    `);
    const attendance = attendanceStmt.all(studentId);

    return {
      studentId,
      student,
      academic: academicRecords,
      behavior: behaviorRecords,
      counseling: counselingRecords,
      achievements,
      attendance
    };
  }

  /**
   * AI ile öğrenci kimliğini oluşturur
   */
  private async generateStudentIdentity(
    studentId: string,
    allData: any
  ): Promise<UnifiedStudentIdentity> {
    const prompt = `Sen bir eğitim uzmanı AI'sısın. Bir öğrenci hakkındaki TÜM verileri analiz edip, o öğrencinin KİM olduğunu anlamalısın.

ÖĞRENCİ ID: ${studentId}

TÜM VERİLER:
${JSON.stringify(allData, null, 2)}

GÖREV: Bu öğrencinin kimliğini oluştur. Şu soruları yanıtla:

1. Bu öğrenci KİM? (Kişilik özeti)
2. Güçlü yönleri neler?
3. Zorlukları neler?
4. Şu an nasıl bir durumda?
5. Öğrenme stili nedir?
6. Risk seviyesi nedir?
7. Hangi müdahaleler önerilir?

ZORUNLU JSON FORMATI:
{
  "summary": "Bu öğrenci kimdir - 2-3 cümle özet",
  "keyCharacteristics": ["özellik1", "özellik2", "özellik3"],
  "currentState": "Şu anki genel durumu",
  "academicScore": 0-100,
  "socialEmotionalScore": 0-100,
  "behavioralScore": 0-100,
  "motivationScore": 0-100,
  "riskLevel": 0-100,
  "strengths": ["güçlü yön 1", "güçlü yön 2"],
  "challenges": ["zorluk 1", "zorluk 2"],
  "recentChanges": ["yakın zamandaki değişiklik 1", "değişiklik 2"],
  "personalityProfile": "Kişilik profili açıklaması",
  "learningStyle": "Öğrenme stili",
  "interventionPriority": "low/medium/high/critical",
  "recommendedActions": ["öneri 1", "öneri 2", "öneri 3"]
}

SADECE JSON döndür.`;

    try {
      const response = await this.aiProvider.chat({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        format: 'json'
      });

      const parsed = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

      return {
        studentId,
        lastUpdated: new Date().toISOString(),
        summary: parsed.summary || 'Profil oluşturuluyor...',
        keyCharacteristics: parsed.keyCharacteristics || [],
        currentState: parsed.currentState || 'Veri toplanıyor',
        academicScore: parsed.academicScore || 50,
        socialEmotionalScore: parsed.socialEmotionalScore || 50,
        behavioralScore: parsed.behavioralScore || 50,
        motivationScore: parsed.motivationScore || 50,
        riskLevel: parsed.riskLevel || 50,
        strengths: parsed.strengths || [],
        challenges: parsed.challenges || [],
        recentChanges: parsed.recentChanges || [],
        personalityProfile: parsed.personalityProfile || '',
        learningStyle: parsed.learningStyle || '',
        interventionPriority: parsed.interventionPriority || 'medium',
        recommendedActions: parsed.recommendedActions || []
      };
    } catch (error) {
      console.error('Identity generation error:', error);
      
      // Fallback identity
      return {
        studentId,
        lastUpdated: new Date().toISOString(),
        summary: 'Profil analizi devam ediyor...',
        keyCharacteristics: [],
        currentState: 'Veri toplanıyor',
        academicScore: 50,
        socialEmotionalScore: 50,
        behavioralScore: 50,
        motivationScore: 50,
        riskLevel: 50,
        strengths: [],
        challenges: [],
        recentChanges: [],
        personalityProfile: '',
        learningStyle: '',
        interventionPriority: 'medium',
        recommendedActions: []
      };
    }
  }

  /**
   * Profil güncelleme logunu kaydeder
   */
  private async logProfileUpdate(
    request: ProfileUpdateRequest,
    validation: any,
    updatedDomains: ProfileDomain[]
  ): Promise<void> {
    console.log(`📝 Profile update log:`, {
      studentId: request.studentId,
      source: request.source,
      domains: updatedDomains,
      confidence: validation.confidence
    });
    
    // Her domain için ayrı log kaydı
    for (const domain of updatedDomains) {
      const log: Omit<ProfileSyncLog, 'created_at'> = {
        id: randomUUID(),
        studentId: request.studentId,
        source: request.source,
        sourceId: request.sourceId,
        domain,
        action: 'updated',
        validationScore: validation.confidence || 0,
        aiReasoning: validation.reasoning || '',
        extractedInsights: validation.extractedInsights || {},
        timestamp: request.timestamp || new Date().toISOString(),
        processedBy: 'ai'
      };
      
      profileSyncRepo.saveSyncLog(log);
    }
    
    console.log(`✅ Saved ${updatedDomains.length} sync logs`);
  }

  /**
   * Çelişkileri otomatik çözümler
   */
  async resolveConflicts(
    studentId: string,
    conflicts: DataConflict[]
  ): Promise<DataConflict[]> {
    const resolved: DataConflict[] = [];

    for (const conflict of conflicts) {
      // Yüksek severity'li çelişkiler manuel onay gerektirir
      if (conflict.severity === 'high') {
        console.warn(`⚠️ High severity conflict detected for student ${studentId}:`, conflict);
        continue;
      }

      // Düşük severity'li çelişkiler otomatik çözülür
      // Strateji: Yeni veri daha güncel kabul edilir
      resolved.push({
        ...conflict,
        severity: 'low'
      });
    }

    return resolved;
  }
}
