/**
 * Field Mapper Service
 * AI'nın çıkardığı insights'ı gerçek database alanlarına map eder
 */

import type { ProfileDomain } from '../types/profile-sync.types.js';

interface FieldMapping {
  aiKey: string;
  dbField: string;
  transform?: (value: any) => any;
}

export class FieldMapperService {
  
  /**
   * Her domain için field mapping'leri tanımlar
   */
  private domainMappings: Record<ProfileDomain, FieldMapping[]> = {
    health: [
      { aiKey: 'last_doctor_visit', dbField: 'lastHealthCheckup' },
      { aiKey: 'doktor_kontrolu', dbField: 'lastHealthCheckup' },
      { aiKey: 'doctor_visit', dbField: 'lastHealthCheckup' },
      { aiKey: 'doktor_ziyareti', dbField: 'lastHealthCheckup' },
      { aiKey: 'chronic_disease', dbField: 'chronicDiseases', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'kronik_hastalik', dbField: 'chronicDiseases', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'medication', dbField: 'currentMedications', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'ilac', dbField: 'currentMedications', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'allergy', dbField: 'allergies', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'alerji', dbField: 'allergies', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'medical_history', dbField: 'medicalHistory' },
      { aiKey: 'tibbi_gecmis', dbField: 'medicalHistory' },
      { aiKey: 'special_needs', dbField: 'specialNeeds' },
      { aiKey: 'ozel_ihtiyaclar', dbField: 'specialNeeds' },
      { aiKey: 'physical_limitations', dbField: 'physicalLimitations' },
      { aiKey: 'fiziksel_kisitlamalar', dbField: 'physicalLimitations' }
    ],
    
    academic: [
      { aiKey: 'favorite_subject', dbField: 'strongSubjects', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'sevdigi_ders', dbField: 'strongSubjects', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'strong_subject', dbField: 'strongSubjects', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'güçlü_ders', dbField: 'strongSubjects', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'difficult_subject', dbField: 'weakSubjects', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'zorluk_cekilen_ders', dbField: 'weakSubjects', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'weak_subject', dbField: 'weakSubjects', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'zayıf_ders', dbField: 'weakSubjects', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'study_hours_per_week', dbField: 'studyHoursPerWeek' },
      { aiKey: 'haftalik_calisma_saati', dbField: 'studyHoursPerWeek' },
      { aiKey: 'homework_completion', dbField: 'homeworkCompletionRate' },
      { aiKey: 'odev_tamamlama', dbField: 'homeworkCompletionRate' },
      { aiKey: 'overall_motivation', dbField: 'overallMotivation' },
      { aiKey: 'genel_motivasyon', dbField: 'overallMotivation' },
      { aiKey: 'primary_learning_style', dbField: 'primaryLearningStyle' },
      { aiKey: 'birincil_ogrenme_stili', dbField: 'primaryLearningStyle' },
      { aiKey: 'learning_style', dbField: 'primaryLearningStyle' },
      { aiKey: 'ogrenme_stili', dbField: 'primaryLearningStyle' },
      { aiKey: 'strong_skill', dbField: 'strongSkills', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'güçlü_beceri', dbField: 'strongSkills', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'weak_skill', dbField: 'weakSkills', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'zayıf_beceri', dbField: 'weakSkills', transform: (v) => JSON.stringify([v]) }
    ],
    
    social_emotional: [
      { aiKey: 'strong_social_skill', dbField: 'strongSocialSkills', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'güçlü_sosyal_beceri', dbField: 'strongSocialSkills', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'developing_social_skill', dbField: 'developingSocialSkills', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'gelişen_sosyal_beceri', dbField: 'developingSocialSkills', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'empathy_level', dbField: 'empathyLevel' },
      { aiKey: 'empati_seviyesi', dbField: 'empathyLevel' },
      { aiKey: 'self_awareness_level', dbField: 'selfAwarenessLevel' },
      { aiKey: 'oz_farkindalik', dbField: 'selfAwarenessLevel' },
      { aiKey: 'emotion_regulation_level', dbField: 'emotionRegulationLevel' },
      { aiKey: 'duygu_duzenlemesi', dbField: 'emotionRegulationLevel' },
      { aiKey: 'conflict_resolution_level', dbField: 'conflictResolutionLevel' },
      { aiKey: 'çatışma_çözme', dbField: 'conflictResolutionLevel' },
      { aiKey: 'leadership_level', dbField: 'leadershipLevel' },
      { aiKey: 'liderlik_seviyesi', dbField: 'leadershipLevel' },
      { aiKey: 'teamwork_level', dbField: 'teamworkLevel' },
      { aiKey: 'takim_çalışması', dbField: 'teamworkLevel' },
      { aiKey: 'communication_level', dbField: 'communicationLevel' },
      { aiKey: 'iletisim_seviyesi', dbField: 'communicationLevel' },
      { aiKey: 'friend_circle_size', dbField: 'friendCircleSize' },
      { aiKey: 'arkadas_cevresi_buyuklugu', dbField: 'friendCircleSize' },
      { aiKey: 'friend_circle_quality', dbField: 'friendCircleQuality' },
      { aiKey: 'arkadas_cevresi_kalitesi', dbField: 'friendCircleQuality' },
      { aiKey: 'social_role', dbField: 'socialRole' },
      { aiKey: 'sosyal_rol', dbField: 'socialRole' },
      { aiKey: 'bullying_status', dbField: 'bullyingStatus' },
      { aiKey: 'zorbalik_durumu', dbField: 'bullyingStatus' }
    ],
    
    behavioral: [
      { aiKey: 'attention_span', dbField: 'attentionSpan' },
      { aiKey: 'dikkat_suresi', dbField: 'attentionSpan' },
      { aiKey: 'impulsivity', dbField: 'impulsivityLevel' },
      { aiKey: 'dusunmeden_hareket', dbField: 'impulsivityLevel' },
      { aiKey: 'aggression', dbField: 'aggressionLevel' },
      { aiKey: 'saldirganlik', dbField: 'aggressionLevel' },
      { aiKey: 'rule_following', dbField: 'ruleCompliance' },
      { aiKey: 'kural_uyumu', dbField: 'ruleCompliance' },
      { aiKey: 'discipline_issues', dbField: 'disciplineIssues' },
      { aiKey: 'disiplin_sorunlari', dbField: 'disciplineIssues' }
    ],
    
    motivation: [
      { aiKey: 'motivation_level', dbField: 'motivationLevel' },
      { aiKey: 'motivasyon_seviyesi', dbField: 'motivationLevel' },
      { aiKey: 'academic_goals', dbField: 'academicGoals' },
      { aiKey: 'akademik_hedefler', dbField: 'academicGoals' },
      { aiKey: 'career_aspirations', dbField: 'careerAspirations' },
      { aiKey: 'kariyer_hedefleri', dbField: 'careerAspirations' },
      { aiKey: 'engagement_level', dbField: 'engagementLevel' },
      { aiKey: 'ilgi_seviyesi', dbField: 'engagementLevel' },
      { aiKey: 'persistence', dbField: 'persistenceLevel' },
      { aiKey: 'sebat', dbField: 'persistenceLevel' }
    ],
    
    risk_factors: [
      { aiKey: 'risk_level', dbField: 'overallRiskLevel' },
      { aiKey: 'risk_seviyesi', dbField: 'overallRiskLevel' },
      { aiKey: 'substance_use', dbField: 'substanceUseRisk' },
      { aiKey: 'madde_kullanimi', dbField: 'substanceUseRisk' },
      { aiKey: 'self_harm', dbField: 'selfHarmRisk' },
      { aiKey: 'kendine_zarar', dbField: 'selfHarmRisk' },
      { aiKey: 'suicidal_ideation', dbField: 'suicidalIdeation' },
      { aiKey: 'intihar_dusuncesi', dbField: 'suicidalIdeation' },
      { aiKey: 'violence_risk', dbField: 'violenceRisk' },
      { aiKey: 'siddet_riski', dbField: 'violenceRisk' },
      { aiKey: 'truancy', dbField: 'truancyRisk' },
      { aiKey: 'devamsizlik_riski', dbField: 'truancyRisk' }
    ],
    
    talents_interests: [
      { aiKey: 'creative_talent', dbField: 'creativeTalents', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'yaratici_yetenek', dbField: 'creativeTalents', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'physical_talent', dbField: 'physicalTalents', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'fiziksel_yetenek', dbField: 'physicalTalents', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'primary_interest', dbField: 'primaryInterests', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'birincil_ilgi', dbField: 'primaryInterests', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'exploratory_interest', dbField: 'exploratoryInterests', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'keşif_ilgisi', dbField: 'exploratoryInterests', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'weekly_engagement_hours', dbField: 'weeklyEngagementHours' },
      { aiKey: 'haftalik_katilim_saati', dbField: 'weeklyEngagementHours' },
      { aiKey: 'club_membership', dbField: 'clubMemberships', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'kulup_uyeligi', dbField: 'clubMemberships', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'competition_participated', dbField: 'competitionsParticipated', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'katildigi_yarismalar', dbField: 'competitionsParticipated', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'interest', dbField: 'primaryInterests', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'ilgi', dbField: 'primaryInterests', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'hobby', dbField: 'primaryInterests', transform: (v) => JSON.stringify([v]) },
      { aiKey: 'hobi', dbField: 'primaryInterests', transform: (v) => JSON.stringify([v]) }
    ],
    
    family: [
      { aiKey: 'family_structure', dbField: 'familyStructure' },
      { aiKey: 'aile_yapisi', dbField: 'familyStructure' },
      { aiKey: 'parents_education', dbField: 'parentsEducationLevel' },
      { aiKey: 'ebeveyn_egitim', dbField: 'parentsEducationLevel' },
      { aiKey: 'family_income', dbField: 'familyIncomeLevel' },
      { aiKey: 'aile_geliri', dbField: 'familyIncomeLevel' },
      { aiKey: 'parental_involvement', dbField: 'parentalInvolvement' },
      { aiKey: 'ebeveyn_ilgisi', dbField: 'parentalInvolvement' },
      { aiKey: 'home_environment', dbField: 'homeEnvironment' },
      { aiKey: 'ev_ortami', dbField: 'homeEnvironment' },
      { aiKey: 'siblings', dbField: 'numberOfSiblings' },
      { aiKey: 'kardes_sayisi', dbField: 'numberOfSiblings' }
    ]
  };

  /**
   * AI insights'ları database field'larına map eder
   */
  mapInsightsToFields(
    domain: ProfileDomain,
    insights: Record<string, any>
  ): Record<string, any> {
    const mappings = this.domainMappings[domain] || [];
    const result: Record<string, any> = {};

    // Her insight için mapping bul
    for (const [key, value] of Object.entries(insights)) {
      const mapping = mappings.find(m => 
        m.aiKey.toLowerCase() === key.toLowerCase() ||
        this.isSimilarKey(m.aiKey, key)
      );

      if (mapping) {
        const transformedValue = mapping.transform 
          ? mapping.transform(value)
          : value;
        
        result[mapping.dbField] = transformedValue;
        
        console.log(`📍 Mapped: ${key} -> ${mapping.dbField} = ${transformedValue}`);
      } else {
        // Mapping bulunamadıysa raw olarak sakla
        result[key] = value;
        console.log(`⚠️ No mapping for: ${key}, storing as raw`);
      }
    }

    return result;
  }

  /**
   * İki key'in benzer olup olmadığını kontrol eder
   */
  private isSimilarKey(mappingKey: string, insightKey: string): boolean {
    const normalize = (str: string) => str.toLowerCase()
      .replace(/_/g, '')
      .replace(/\s/g, '');
    
    return normalize(mappingKey) === normalize(insightKey);
  }

  /**
   * Tarih formatını normalize eder
   */
  normalizeDate(value: any): string | null {
    if (!value) return null;
    
    try {
      // "bugün", "dün", "geçen hafta" gibi ifadeleri parse et
      const today = new Date();
      const lowerValue = String(value).toLowerCase();
      
      if (lowerValue.includes('bugün') || lowerValue.includes('today')) {
        return today.toISOString().split('T')[0];
      }
      
      if (lowerValue.includes('dün') || lowerValue.includes('yesterday')) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
      }
      
      if (lowerValue.includes('geçen hafta') || lowerValue.includes('last week')) {
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        return lastWeek.toISOString().split('T')[0];
      }
      
      // ISO tarih formatına çevir
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Sayısal değerleri normalize eder (0-100 arası)
   */
  normalizeScore(value: any): number | null {
    if (value === null || value === undefined) return null;
    
    const num = Number(value);
    if (isNaN(num)) return null;
    
    // 0-100 arasına sıkıştır
    return Math.max(0, Math.min(100, num));
  }
}
