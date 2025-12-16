export interface Student {
  // Basic Information - Required
  id: string;
  name: string;
  surname: string;

  // Education Information
  grade?: string;       // Sınıf (1-12, Anasınıfı, Hazırlık)
  section?: string;     // Şube (A, B, C, D, E, F)
  isSpecialEducation?: boolean; // Özel Eğitim Sınıfı
  class?: string;       // Computed: grade + section - backward compatible
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
  livingWith?: string;
  homeRentalStatus?: string;
  homeHeatingType?: string;
  transportationToSchool?: string;
  studentWorkStatus?: string;

  // System Information
  enrollmentDate: string;
  status?: 'active' | 'inactive' | 'graduated';
  avatar?: string;
  parentContact?: string; // Legacy field
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

  // Additional Profile Information
  languageSkills?: string[];
  hobbiesDetailed?: string[];
  extracurricularActivities?: string[];
  studentExpectations?: string[];
  familyExpectations?: string[];

  // Health Information
  chronicDiseases?: string[];
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string;
  specialNeeds?: string;
  physicalLimitations?: string;

  // Emergency Contacts
  emergencyContact1Name?: string;
  emergencyContact1Phone?: string;
  emergencyContact1Relation?: string;
  emergencyContact2Name?: string;
  emergencyContact2Phone?: string;
  emergencyContact2Relation?: string;
  healthAdditionalNotes?: string;

  // Talents & Interests
  creativeTalents?: string[];
  physicalTalents?: string[];
  primaryInterests?: string[];
  exploratoryInterests?: string[];
  clubMemberships?: string[];
  competitionsParticipated?: string[];
  talentsAdditionalNotes?: string;

  // Legacy fields for compatibility
  primaryLearningStyle?: string;
  englishScore?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExamSummary {
  examId?: string;
  examName?: string;
  score?: number;
  date?: string;
}

export interface AcademicRecord {
  id?: number;
  studentId: string;
  semester: string;
  gpa?: number;
  year: number;
  exams?: ExamSummary[];
  notes?: string;
}

export interface Progress {
  id: string;
  studentId: string;
  topicId: string;
  completed: number;
  remaining: number;
  lastStudied?: string;
  notes?: string;
}
