/**
 * Student Profile Validation Schemas
 * Öğrenci Profil Validasyon Şemaları
 * 
 * Tüm profil formlarında kullanılacak standart validasyon kuralları
 */

import { z } from "zod";

// Temel validasyon kuralları
export const basicInfoValidation = {
  name: z.string().min(1, "Ad zorunludur").max(50, "Ad maksimum 50 karakter olabilir"),
  surname: z.string().min(1, "Soyad zorunludur").max(50, "Soyad maksimum 50 karakter olabilir"),
  class: z.string().optional(),
  gender: z.enum(["K", "E"]).optional(),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta giriniz").optional().or(z.literal("")),
  province: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  counselor: z.string().optional(),
  risk: z.enum(["Düşük", "Orta", "Yüksek"]).optional(),
  tags: z.string().optional(),
  parentName: z.string().optional(),
  parentContact: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
};

// Akademik profil validasyonu
export const academicProfileValidation = {
  studentId: z.string().min(1, "Öğrenci ID gereklidir"),
  
  // Akademik performans
  performanceLevel: z.enum(["ÇOK_DÜŞÜK", "DÜŞÜK", "ORTA", "İYİ", "ÇOK_İYİ"]).optional(),
  gradePointAverage: z.number().min(0).max(100).optional(),
  
  // Dersler ve başarı
  strongSubjects: z.array(z.string()).optional(),
  weakSubjects: z.array(z.string()).optional(),
  learningStyle: z.enum(["GÖRSEL", "İŞİTSEL", "KİNESTETİK", "OKUMA_YAZMA"]).optional(),
  
  // Çalışma becerileri
  studySkills: z.number().min(1).max(10).optional(),
  homeworkCompletion: z.number().min(1).max(10).optional(),
  classParticipation: z.number().min(1).max(10).optional(),
  
  // Motivasyon
  academicMotivation: z.number().min(1).max(10).optional(),
  
  // Notlar
  notes: z.string().optional(),
  assessedBy: z.string().min(1, "Değerlendirme yapan kişi bilgisi zorunludur"),
  assessedAt: z.string().min(1, "Değerlendirme tarihi zorunludur"),
};

// Sosyal-Duygusal profil validasyonu
export const socialEmotionalValidation = {
  studentId: z.string().min(1, "Öğrenci ID gereklidir"),
  
  // SEL Yetkinlikler (1-10 skala)
  selfAwareness: z.number().min(1).max(10).optional(),
  selfManagement: z.number().min(1).max(10).optional(),
  socialAwareness: z.number().min(1).max(10).optional(),
  relationshipSkills: z.number().min(1).max(10).optional(),
  responsibleDecisionMaking: z.number().min(1).max(10).optional(),
  
  // Sosyal beceriler
  peerRelations: z.enum(["ÇOK_ZAYIF", "ZAYIF", "ORTA", "İYİ", "ÇOK_İYİ"]).optional(),
  communicationSkills: z.number().min(1).max(10).optional(),
  empathy: z.number().min(1).max(10).optional(),
  
  // Duygusal durum
  emotionalRegulation: z.number().min(1).max(10).optional(),
  stressManagement: z.number().min(1).max(10).optional(),
  
  // Sosyal çevre
  friendCount: z.number().min(0).optional(),
  belongingSense: z.number().min(1).max(10).optional(),
  bullyingStatus: z.enum(["YOK", "MAĞDUR", "FAİL", "HER_İKİSİ"]).optional(),
  
  // Notlar
  notes: z.string().optional(),
  assessedBy: z.string().min(1, "Değerlendirme yapan kişi bilgisi zorunludur"),
  assessedAt: z.string().min(1, "Değerlendirme tarihi zorunludur"),
};

// Yetenek ve İlgi profil validasyonu
export const talentsInterestsValidation = {
  studentId: z.string().min(1, "Öğrenci ID gereklidir"),
  
  // Yaratıcı yetenekler
  creativeTalents: z.array(z.string()).optional(),
  
  // Fiziksel yetenekler
  physicalTalents: z.array(z.string()).optional(),
  
  // İlgi alanları
  interests: z.array(z.string()).optional(),
  hobbies: z.array(z.string()).optional(),
  
  // Gelecek vizyonu
  careerGoals: z.array(z.string()).optional(),
  educationGoals: z.string().optional(),
  
  // Başarılar
  achievements: z.array(z.string()).optional(),
  awards: z.array(z.string()).optional(),
  
  // Notlar
  notes: z.string().optional(),
  assessedBy: z.string().min(1, "Değerlendirme yapan kişi bilgisi zorunludur"),
  assessedAt: z.string().min(1, "Değerlendirme tarihi zorunludur"),
};

// Sağlık profil validasyonu
export const healthProfileValidation = {
  studentId: z.string().min(1, "Öğrenci ID gereklidir"),
  
  // Temel sağlık bilgileri
  bloodType: z.enum(["A_RH_POSITIVE", "A_RH_NEGATIVE", "B_RH_POSITIVE", "B_RH_NEGATIVE", 
                     "AB_RH_POSITIVE", "AB_RH_NEGATIVE", "O_RH_POSITIVE", "O_RH_NEGATIVE", "BİLİNMİYOR"]).optional(),
  chronicDiseases: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  
  // Özel gereksinimler
  specialNeeds: z.string().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  
  // Acil durum bilgileri
  emergencyContact1Name: z.string().optional(),
  emergencyContact1Phone: z.string().optional(),
  emergencyContact1Relation: z.string().optional(),
  emergencyContact2Name: z.string().optional(),
  emergencyContact2Phone: z.string().optional(),
  emergencyContact2Relation: z.string().optional(),
  
  // Doktor bilgileri
  physicianName: z.string().optional(),
  physicianPhone: z.string().optional(),
  lastHealthCheckup: z.string().optional(),
  
  // Notlar
  notes: z.string().optional(),
  assessedBy: z.string().min(1, "Değerlendirme yapan kişi bilgisi zorunludur"),
  assessedAt: z.string().min(1, "Değerlendirme tarihi zorunludur"),
};

// Davranışsal takip validasyonu
export const behaviorIncidentValidation = {
  studentId: z.string().min(1, "Öğrenci ID gereklidir"),
  incidentDate: z.string().min(1, "Olay tarihi gereklidir"),
  incidentTime: z.string().optional(),
  location: z.string().optional(),
  behaviorType: z.enum(["SÖZLÜ", "FİZİKSEL", "KURALLARA_UYMAMA", "DERSE_KATILMAMA", "DİĞER"]),
  description: z.string().min(1, "Davranış açıklaması gereklidir"),
  antecedent: z.string().optional(),
  consequence: z.string().optional(),
  intensity: z.enum(["DÜŞÜK", "ORTA", "YÜKSEK"]).optional(),
  interventionUsed: z.string().optional(),
  interventionEffectiveness: z.enum(["ÇOK_ETKİLİ", "ETKİLİ", "KISMEN_ETKİLİ", "ETKİSİZ"]).optional(),
  parentNotified: z.boolean().default(false),
  recordedBy: z.string().optional(),
  notes: z.string().optional(),
};

// Risk değerlendirme validasyonu
export const riskAssessmentValidation = {
  studentId: z.string().min(1, "Öğrenci ID gereklidir"),
  assessmentDate: z.string().min(1, "Değerlendirme tarihi gereklidir"),
  academicRiskLevel: z.enum(["DÜŞÜK", "ORTA", "YÜKSEK", "ÇOK_YÜKSEK"]),
  behavioralRiskLevel: z.enum(["DÜŞÜK", "ORTA", "YÜKSEK", "ÇOK_YÜKSEK"]),
  attendanceRiskLevel: z.enum(["DÜŞÜK", "ORTA", "YÜKSEK", "ÇOK_YÜKSEK"]),
  socialEmotionalRiskLevel: z.enum(["DÜŞÜK", "ORTA", "YÜKSEK", "ÇOK_YÜKSEK"]),
  academicFactors: z.string().optional(),
  behavioralFactors: z.string().optional(),
  protectiveFactors: z.string().optional(),
  interventionsNeeded: z.string().optional(),
  parentNotified: z.boolean().default(false),
  assignedCounselor: z.string().optional(),
  nextAssessmentDate: z.string().optional(),
};

// Motivasyon profil validasyonu
export const motivationProfileValidation = {
  studentId: z.string().min(1, "Öğrenci ID gereklidir"),
  
  // Motivasyon kaynakları
  intrinsicMotivation: z.number().min(1).max(10).optional(),
  extrinsicMotivation: z.number().min(1).max(10).optional(),
  
  // Hedef belirleme
  goalSettingSkill: z.number().min(1).max(10).optional(),
  persistence: z.number().min(1).max(10).optional(),
  
  // Öz-yeterlik
  selfEfficacy: z.number().min(1).max(10).optional(),
  confidenceLevel: z.number().min(1).max(10).optional(),
  
  // Tutum
  attitudeTowardSchool: z.enum(["ÇOK_NEGATİF", "NEGATİF", "NÖTR", "POZİTİF", "ÇOK_POZİTİF"]).optional(),
  attitudeTowardLearning: z.enum(["ÇOK_NEGATİF", "NEGATİF", "NÖTR", "POZİTİF", "ÇOK_POZİTİF"]).optional(),
  
  // Engeller
  motivationBarriers: z.array(z.string()).optional(),
  
  // Notlar
  notes: z.string().optional(),
  assessedBy: z.string().min(1, "Değerlendirme yapan kişi bilgisi zorunludur"),
  assessedAt: z.string().min(1, "Değerlendirme tarihi zorunludur"),
};

// Birleşik şemalar - formlar için kullanılabilir
export const basicInfoSchema = z.object(basicInfoValidation);
export const academicProfileSchema = z.object(academicProfileValidation);
export const socialEmotionalSchema = z.object(socialEmotionalValidation);
export const talentsInterestsSchema = z.object(talentsInterestsValidation);
export const healthProfileSchema = z.object(healthProfileValidation);
export const behaviorIncidentSchema = z.object(behaviorIncidentValidation);
export const riskAssessmentSchema = z.object(riskAssessmentValidation);
export const motivationProfileSchema = z.object(motivationProfileValidation);

// TypeScript tipleri
export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;
export type AcademicProfileFormValues = z.infer<typeof academicProfileSchema>;
export type SocialEmotionalFormValues = z.infer<typeof socialEmotionalSchema>;
export type TalentsInterestsFormValues = z.infer<typeof talentsInterestsSchema>;
export type HealthProfileFormValues = z.infer<typeof healthProfileSchema>;
export type BehaviorIncidentFormValues = z.infer<typeof behaviorIncidentSchema>;
export type RiskAssessmentFormValues = z.infer<typeof riskAssessmentSchema>;
export type MotivationProfileFormValues = z.infer<typeof motivationProfileSchema>;

// Validasyon yardımcıları
export const validateProfileCompleteness = (data: any, requiredFields: string[]): boolean => {
  return requiredFields.every(field => {
    const value = data[field];
    if (value === undefined || value === null || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });
};

export const calculateFormCompleteness = (data: any, totalFields: string[]): number => {
  const filledFields = totalFields.filter(field => {
    const value = data[field];
    if (value === undefined || value === null || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });
  
  return Math.round((filledFields.length / totalFields.length) * 100);
};
