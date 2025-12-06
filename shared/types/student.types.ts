/**
 * Student Data Model
 * Standard student model used across the entire application
 * UI labels remain in Turkish, but data properties use English for consistency
 */

export interface Student {
  // Basic Information - Required
  id: string;
  name: string;
  surname: string;
  
  // Education Information
  class?: string;
  studentNumber?: string;
  gender?: 'K' | 'E';
  birthDate?: string;
  birthPlace?: string;
  tcIdentityNo?: string;
  
  // Contact Information
  phone?: string;
  email?: string;
  address?: string;
  province?: string;
  district?: string;
  
  // Mother Information (Anne Bilgileri)
  motherName?: string;
  motherEducation?: string;
  motherOccupation?: string;
  motherEmail?: string;
  motherPhone?: string;
  motherVitalStatus?: 'Sağ' | 'Vefat Etmiş';
  motherLivingStatus?: 'Birlikte' | 'Ayrı';
  
  // Father Information (Baba Bilgileri)
  fatherName?: string;
  fatherEducation?: string;
  fatherOccupation?: string;
  fatherEmail?: string;
  fatherPhone?: string;
  fatherVitalStatus?: 'Sağ' | 'Vefat Etmiş';
  fatherLivingStatus?: 'Birlikte' | 'Ayrı';
  
  // Guardian Information (Vasi/Acil İletişim)
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  
  // Family Structure (Aile Yapısı)
  numberOfSiblings?: number;
  
  // Living Situation (Yaşam Durumu)
  livingWith?: string; // Kiminle oturuyor
  homeRentalStatus?: string; // Ev durumu (Kendi Evi, Kiracı, Lojman)
  homeHeatingType?: string; // Isınma türü
  transportationToSchool?: string; // Okula ulaşım
  studentWorkStatus?: string; // Çalışma durumu
  
  // System Information
  enrollmentDate: string;
  status?: 'active' | 'inactive' | 'graduated';
  avatar?: string;
  notes?: string;
  schoolId?: string;
  
  // Assessment Information
  risk?: 'Düşük' | 'Orta' | 'Yüksek';
  counselor?: string;
  tags?: string[];
  
  // General Information
  interests?: string[];
  healthNote?: string;
  bloodType?: string;
  
  // Additional Profile Information (2025 SIS Standards)
  languageSkills?: string;
  hobbiesDetailed?: string;
  extracurricularActivities?: string;
  studentExpectations?: string;
  familyExpectations?: string;
}

/**
 * TRANSITIONAL: Temporary alias for gradual migration
 * This will be removed once all components are updated
 * @deprecated Use Student instead
 */
export type UnifiedStudent = Student;

/**
 * TRANSITIONAL: Temporary alias for gradual migration
 * @deprecated Use Student instead
 */
export type BackendStudent = Student;

/**
 * Student Profile Completeness Metrics
 */
export interface ProfileCompleteness {
  overall: number; // 0-100
  temelBilgiler: number;
  iletisimBilgileri: number;
  veliBilgileri: number;
  akademikProfil: number;
  sosyalDuygusalProfil: number;
  davranisalProfil: number;
  
  eksikAlanlar: {
    kategori: string;
    alanlar: string[];
  }[];
}

/**
 * Unified Student Scores
 */
export interface UnifiedStudentScores {
  studentId: string;
  lastUpdated: string;
  
  // Main Scores (0-100)
  akademikSkor: number;
  sosyalDuygusalSkor: number;
  davranissalSkor: number;
  motivasyonSkor: number;
  riskSkoru: number;
  
  // Detailed Scores
  akademikDetay: {
    notOrtalamasi?: number;
    devamDurumu?: number;
    odeklikSeviyesi?: number;
  };
  
  sosyalDuygusalDetay: {
    empati?: number;
    ozFarkinalik?: number;
    duyguDuzenlemesi?: number;
    iliski?: number;
  };
  
  davranissalDetay: {
    olumluDavranis?: number;
    olumsuzDavranis?: number;
    mudahaleEtkinligi?: number;
  };
}

/**
 * Validation Rules
 */
export const STUDENT_VALIDATION_RULES = {
  required: ['id', 'name', 'surname'],
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9]{10,11}$/,
  minAge: 5,
  maxAge: 25,
  tcIdentityNo: /^[1-9][0-9]{10}$/
} as const;

/**
 * Profile Quality Thresholds
 */
export const PROFILE_QUALITY_THRESHOLDS = {
  excellent: 90,
  good: 70,
  fair: 50,
  poor: 30
} as const;
