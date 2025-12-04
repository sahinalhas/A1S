/**
 * Standardized Student Profile Types for AI Analysis
 * These types use predefined taxonomies for consistent, measurable data
 */

// ==================== ACADEMIC PROFILE ====================

export interface AcademicProfile {
  id: string;
  studentId: string;
  assessmentDate: string;
  
  // Strengths (multi-select from ACADEMIC_SUBJECTS & ACADEMIC_SKILLS)
  strongSubjects: string[];
  weakSubjects: string[];
  strongSkills: string[];
  weakSkills: string[];
  
  // Learning style (from LEARNING_STYLES)
  primaryLearningStyle?: string;
  secondaryLearningStyle?: string;
  
  // Quantitative metrics
  overallMotivation?: number; // 1-10 scale
  studyHoursPerWeek?: number;
  homeworkCompletionRate?: number; // 0-100%
  
  // Notes for qualitative data
  additionalNotes?: string;
  assessedBy?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== SOCIAL & EMOTIONAL PROFILE ====================

export interface SocialEmotionalProfile {
  id: string;
  studentId: string;
  assessmentDate: string;
  
  // Social strengths/weaknesses (from SOCIAL_SKILLS)
  strongSocialSkills: string[];
  developingSocialSkills: string[];
  
  // Quantitative SEL metrics (1-10 scale)
  empathyLevel?: number;
  selfAwarenessLevel?: number;
  emotionRegulationLevel?: number;
  conflictResolutionLevel?: number;
  leadershipLevel?: number;
  teamworkLevel?: number;
  communicationLevel?: number;
  
  // Social context
  friendCircleSize?: 'YOK' | 'AZ' | 'ORTA' | 'GENİŞ';
  friendCircleQuality?: 'ZAYIF' | 'ORTA' | 'İYİ' | 'ÇOK_İYİ';
  socialRole?: 'LİDER' | 'AKTİF_ÜYE' | 'TAKİPÇİ' | 'GÖZLEMCİ' | 'İZOLE';
  bullyingStatus?: 'YOK' | 'MAĞDUR' | 'FAİL' | 'HER_İKİSİ' | 'GÖZLEMCİ';
  
  // Risk and Protective Factors
  identifiedRiskFactors?: string[];
  protectiveFactors?: string[];
  recommendedInterventions?: string[];
  
  additionalNotes?: string;
  assessedBy?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== TALENTS & INTERESTS ====================

export interface TalentsInterestsProfile {
  id: string;
  studentId: string;
  assessmentDate: string;
  
  // Talents (from CREATIVE_TALENTS & PHYSICAL_TALENTS)
  creativeTalents: string[];
  physicalTalents: string[];
  
  // Interest areas (from INTEREST_AREAS)
  primaryInterests: string[];
  exploratoryInterests: string[];
  
  // Proficiency levels (1-10 scale for each talent)
  talentProficiency?: Record<string, number>;
  
  // Engagement frequency
  weeklyEngagementHours?: number;
  clubMemberships: string[];
  competitionsParticipated: string[];
  
  additionalNotes?: string;
  assessedBy?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== HEALTH PROFILE (STANDARDIZED) ====================

export interface StandardizedHealthProfile {
  id: string;
  studentId: string;
  
  // Standardized medical info
  bloodType?: string; // from BLOOD_TYPES
  chronicDiseases: string[]; // from CHRONIC_DISEASES
  allergies: string[]; // from ALLERGIES
  currentMedications: string[]; // from MEDICATION_TYPES
  
  // Medical history (still text but categorized)
  medicalHistory?: string;
  specialNeeds?: string;
  physicalLimitations?: string;
  
  // Emergency contacts
  emergencyContact1Name?: string;
  emergencyContact1Phone?: string;
  emergencyContact1Relation?: string;
  emergencyContact2Name?: string;
  emergencyContact2Phone?: string;
  emergencyContact2Relation?: string;
  
  // Healthcare providers
  physicianName?: string;
  physicianPhone?: string;
  lastHealthCheckup?: string;
  
  additionalNotes?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== INTERVENTION TRACKING ====================

export interface StandardizedIntervention {
  id: string;
  studentId: string;
  
  // Standardized intervention type (from INTERVENTION_TYPES)
  interventionType: string;
  interventionCategory: 'akademik' | 'davranışsal' | 'sosyal' | 'aile' | 'psikolojik' | 'kariyer';
  
  // Target areas
  targetIssues: string[]; // What issues are being addressed
  targetSkills: string[]; // What skills are being developed
  
  // Timeline
  startDate: string;
  endDate?: string;
  sessionFrequency?: 'GÜNLÜK' | 'HAFTALIK' | 'İKİ_HAFTADA' | 'AYLIK';
  totalSessions?: number;
  completedSessions?: number;
  
  // Effectiveness measurement
  initialAssessment?: number; // 1-10 scale
  currentAssessment?: number; // 1-10 scale
  effectiveness?: 'ÇOK_ETKİLİ' | 'ETKİLİ' | 'KISMEN_ETKİLİ' | 'ETKİSİZ' | 'DEĞERLENDİRİLMEDİ';
  
  // Status
  status: 'PLANLANDI' | 'DEVAM_EDIYOR' | 'TAMAMLANDI' | 'İPTAL' | 'BEKLEMEDE';
  
  // Personnel
  assignedCounselor?: string;
  otherStaff?: string[];
  
  // Notes
  description?: string;
  progressNotes?: string;
  outcomeNotes?: string;
  
  created_at?: string;
  updated_at?: string;
}

// ==================== BEHAVIOR TRACKING (STANDARDIZED) ====================

export interface StandardizedBehaviorIncident {
  id: string;
  studentId: string;
  
  // Incident details
  incidentDate: string;
  incidentTime?: string;
  location: string;
  
  // Standardized behavior (from BEHAVIOR_CATEGORIES)
  behaviorCategory: string;
  behaviorType: 'OLUMLU' | 'KÜÇÜK_İHLAL' | 'ORTA_DÜZEY' | 'CİDDİ' | 'ÇOK_CİDDİ';
  
  // Context (ABC Model)
  antecedent?: string; // What happened before
  description: string; // Behavior description
  consequence?: string; // What happened after
  
  // Response
  interventionsUsed: string[]; // from INTERVENTION_TYPES
  interventionEffectiveness?: 'ÇOK_ETKİLİ' | 'ETKİLİ' | 'KISMEN_ETKİLİ' | 'ETKİSİZ';
  
  // Follow-up
  parentNotified?: boolean;
  adminNotified?: boolean;
  followUpNeeded?: boolean;
  status: 'AÇIK' | 'DEVAM_EDIYOR' | 'ÇÖZÜLDÜ' | 'İZLENIYOR';
  
  // Personnel
  reportedBy: string;
  witnessedBy?: string[];
  
  additionalNotes?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== MOTIVATION & GOALS ====================

export interface MotivationProfile {
  id: string;
  studentId: string;
  assessmentDate: string;
  
  // Motivation sources (from MOTIVATION_SOURCES)
  primaryMotivationSources: string[];
  
  // Motivation levels (1-10 scale)
  academicMotivation?: number;
  socialMotivation?: number;
  achievementMotivation?: number;
  intrinsicMotivation?: number;
  extrinsicMotivation?: number;
  
  // Goal orientation
  hasShortTermGoals?: boolean;
  hasLongTermGoals?: boolean;
  goalClarityLevel?: number; // 1-10
  goalCommitmentLevel?: number; // 1-10
  goalOrientation?: string;
  resilienceLevel?: number; // 1-10
  
  // Future vision
  careerAspirations: string[];
  universityPreferences: string[];
  academicGoals?: string[]; // Academic goals array
  
  // Persistence and future orientation (1-10 scale)
  persistenceLevel?: number;
  futureOrientationLevel?: number;
  
  // Goal details (text fields)
  shortTermGoals?: string;
  longTermGoals?: string;
  obstacles?: string;
  supportNeeds?: string;
  
  // Expectations (from UI forms)
  studentExpectations?: string;
  familyExpectations?: string;
  
  additionalNotes?: string;
  assessedBy?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== RISK & PROTECTIVE FACTORS ====================

export interface RiskProtectiveProfile {
  id: string;
  studentId: string;
  assessmentDate: string;
  
  // Risk levels (TEXT enum for backward compatibility)
  academicRiskLevel?: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  behavioralRiskLevel?: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  socialEmotionalRiskLevel?: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  attendanceRiskLevel?: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  dropoutRisk?: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  
  // Numeric risk levels (1-10 scale for UI sliders)
  overallRiskLevel?: number;
  academicRiskLevelInt?: number;
  behavioralRiskLevelInt?: number;
  emotionalRiskLevel?: number;
  socialRiskLevel?: number;
  
  // Protective factor levels (1-10 scale)
  familySupport?: number;
  peerSupport?: number;
  schoolEngagement?: number;
  resilienceLevel?: number;
  copingSkills?: number;
  
  // Protective factors (from PROTECTIVE_FACTORS)
  activeProtectiveFactors: string[];
  identifiedRiskFactors?: string[];
  
  // Risk factors (text but categorized)
  academicRiskFactors?: string;
  behavioralRiskFactors?: string;
  socialRiskFactors?: string;
  familyRiskFactors?: string;
  
  // Overall assessment
  overallRiskScore?: number; // 0-100 calculated score
  
  // Assessment and planning
  riskAssessmentNotes?: string;
  interventionPlan?: string;
  monitoringFrequency?: 'GÜN' | 'HAFTA' | 'AY' | 'ÜÇAY' | 'YARI_YIL';
  
  // Action items
  recommendedInterventions: string[]; // from INTERVENTION_TYPES
  assignedCounselor?: string;
  parentNotified?: boolean;
  nextAssessmentDate?: string;
  
  additionalNotes?: string;
  assessedBy?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== AGGREGATE PROFILE (AI-Ready) ====================

export interface AIReadyStudentProfile {
  studentId: string;
  lastUpdated: string;
  
  // All standardized components
  academic?: AcademicProfile;
  socialEmotional?: SocialEmotionalProfile;
  talentsInterests?: TalentsInterestsProfile;
  health?: StandardizedHealthProfile;
  motivation?: MotivationProfile;
  riskProtective?: RiskProtectiveProfile;
  
  // Recent interventions and behaviors
  activeInterventions: StandardizedIntervention[];
  recentBehaviors: StandardizedBehaviorIncident[];
  
  // Aggregate scores for quick analysis
  aggregateScores?: {
    academicPerformance: number; // 0-100
    socialCompetence: number; // 0-100
    emotionalWellbeing: number; // 0-100
    behavioralHealth: number; // 0-100
    motivationLevel: number; // 0-100
    overallRisk: number; // 0-100
    protectiveFactorsScore: number; // 0-100
  };
  
  // AI-generated insights (if available)
  aiInsights?: {
    strengthsSummary: string[];
    concernsSummary: string[];
    recommendedActions: string[];
    predictedOutcomes?: string[];
    confidenceScore?: number; // 0-1
  };
}
