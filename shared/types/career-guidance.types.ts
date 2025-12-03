/**
 * Career Guidance and Optimization System Types
 * Kariyer Rehberliği ve Optimizasyon Sistemi Tipleri
 */

// Yetkinlik Kategorileri
export type CompetencyCategory = 
  | 'ACADEMIC'           // Akademik yetkinlikler
  | 'SOCIAL_EMOTIONAL'   // Sosyal-duygusal yetkinlikler
  | 'TECHNICAL'          // Teknik beceriler
  | 'CREATIVE'           // Yaratıcı yetkinlikler
  | 'PHYSICAL'           // Fiziksel yetkinlikler
  | 'LEADERSHIP'         // Liderlik becerileri
  | 'COMMUNICATION';     // İletişim becerileri

// Meslek Kategorileri
export type CareerCategory = 
  | 'STEM'              // Fen, Teknoloji, Mühendislik, Matematik
  | 'HEALTH'            // Sağlık
  | 'EDUCATION'         // Eğitim
  | 'BUSINESS'          // İş ve Yönetim
  | 'ARTS'              // Sanat ve Tasarım
  | 'SOCIAL_SERVICES'   // Sosyal Hizmetler
  | 'LAW'               // Hukuk
  | 'SPORTS'            // Spor
  | 'MEDIA'             // Medya ve İletişim
  | 'TRADES';           // El Sanatları ve Teknik İşler

// Yetkinlik Seviyesi
export type CompetencyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Yetkinlik Tanımı
export interface Competency {
  id: string;
  name: string;
  category: CompetencyCategory;
  description: string;
}

// Meslek Profili
export interface CareerProfile {
  id: string;
  name: string;
  category: CareerCategory;
  description: string;
  requiredEducationLevel: string;
  averageSalary?: string;
  jobOutlook?: string; // İş bulma kolaylığı
  workEnvironment?: string;
  requiredCompetencies: CompetencyRequirement[];
  createdAt?: string;
  updatedAt?: string;
}

// Meslek için Gerekli Yetkinlik
export interface CompetencyRequirement {
  competencyId: string;
  competencyName: string;
  category: CompetencyCategory;
  minimumLevel: CompetencyLevel;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; // Meslek için önemi
  weight: number; // 0-1 arası ağırlık (matching'de kullanılır)
}

// Öğrenci Yetkinlik Profili
export interface StudentCompetencyProfile {
  studentId: string;
  competencyId: string;
  competencyName: string;
  category: CompetencyCategory;
  currentLevel: CompetencyLevel;
  assessmentDate: string;
  source: 'ACADEMIC' | 'SOCIAL_EMOTIONAL' | 'TALENTS' | 'SELF_ASSESSMENT' | 'TEACHER_ASSESSMENT';
}

// Kariyer Eşleşme Sonucu
export interface CareerMatchResult {
  careerId: string;
  careerName: string;
  careerCategory: CareerCategory;
  matchScore: number; // 0-100 arası
  compatibilityLevel: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'LOW';
  strengths: string[]; // Öğrencinin güçlü olduğu alanlar
  gaps: CompetencyGap[]; // Eksik yetkinlikler
  developmentPriority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Yetkinlik Açığı (Gap)
export interface CompetencyGap {
  competencyId: string;
  competencyName: string;
  category: CompetencyCategory;
  requiredLevel: CompetencyLevel;
  currentLevel: CompetencyLevel;
  gap: number; // requiredLevel - currentLevel
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedDevelopmentTime: string; // Örn: "3-6 ay", "1 yıl"
}

// Kariyer Analiz Sonucu
export interface CareerAnalysisResult {
  studentId: string;
  studentName: string;
  analysisDate: string;
  targetCareer?: CareerProfile; // Öğrencinin hedeflediği meslek
  topMatches: CareerMatchResult[]; // En uyumlu meslekler (max 10)
  targetCareerMatch?: CareerMatchResult; // Hedef meslek ile eşleşme
  overallCompatibility: number; // Genel kariyer uyumu skoru
  primaryStrengths: string[];
  criticalGaps: CompetencyGap[];
}

// Gelişim Adımı
export interface DevelopmentStep {
  id: string;
  competencyId: string;
  competencyName: string;
  currentLevel: CompetencyLevel;
  targetLevel: CompetencyLevel;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timeline: string; // Örn: "Önümüzdeki 3 ay"
  strategies: string[]; // Geliştirme stratejileri
  resources: DevelopmentResource[];
  milestones: Milestone[];
}

// Gelişim Kaynağı
export interface DevelopmentResource {
  type: 'COURSE' | 'BOOK' | 'ACTIVITY' | 'MENTORSHIP' | 'PRACTICE' | 'WORKSHOP';
  title: string;
  description: string;
  url?: string;
  duration?: string;
}

// Milestone (Ara Hedef)
export interface Milestone {
  description: string;
  targetDate: string;
  successCriteria: string[];
}

// Kişiselleştirilmiş Kariyer Yol Haritası
export interface CareerRoadmap {
  id: string;
  studentId: string;
  targetCareerId: string;
  targetCareerName: string;
  createdAt: string;
  updatedAt: string;
  currentMatchScore: number;
  projectedMatchScore: number; // Planı tamamladığında ulaşacağı skor
  estimatedCompletionTime: string;
  developmentSteps: DevelopmentStep[];
  aiRecommendations: string[]; // AI'ın önerileri
  motivationalInsights: string[]; // Motivasyonel içgörüler
}

// Simülasyon Senaryosu
export interface CareerSimulation {
  studentId: string;
  careerId: string;
  scenarios: SimulationScenario[];
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  competencyChanges: {
    competencyId: string;
    newLevel: CompetencyLevel;
  }[];
  projectedMatchScore: number;
  projectedGaps: CompetencyGap[];
  feasibility: 'HIGH' | 'MEDIUM' | 'LOW';
  timeEstimate: string;
}

// Database Entity Types
export interface CareerProfileEntity {
  id: string;
  name: string;
  category: CareerCategory;
  description: string;
  requiredEducationLevel: string;
  averageSalary?: string;
  jobOutlook?: string;
  workEnvironment?: string;
  requiredCompetencies: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

export interface StudentCareerTargetEntity {
  id: string;
  studentId: string;
  careerId: string;
  setDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareerAnalysisHistoryEntity {
  id: string;
  studentId: string;
  analysisDate: string;
  analysisResult: string; // JSON string of CareerAnalysisResult
  createdAt: string;
}

export interface CareerRoadmapEntity {
  id: string;
  studentId: string;
  targetCareerId: string;
  targetCareerName: string;
  currentMatchScore: number;
  projectedMatchScore: number;
  estimatedCompletionTime: string;
  developmentSteps: string; // JSON string
  aiRecommendations: string; // JSON string
  motivationalInsights: string; // JSON string
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

// API Request/Response Types
export interface CareerAnalysisRequest {
  studentId: string;
  targetCareerId?: string;
}

export interface CareerAnalysisResponse {
  success: boolean;
  data?: CareerAnalysisResult;
  error?: string;
}

export interface CareerRoadmapRequest {
  studentId: string;
  targetCareerId: string;
  customGoals?: string[];
}

export interface CareerRoadmapResponse {
  success: boolean;
  data?: CareerRoadmap;
  error?: string;
}

export interface CareerSimulationRequest {
  studentId: string;
  careerId: string;
  scenarioType: 'OPTIMISTIC' | 'REALISTIC' | 'PESSIMISTIC' | 'CUSTOM';
  customChanges?: {
    competencyId: string;
    targetLevel: CompetencyLevel;
  }[];
}

export interface CareerSimulationResponse {
  success: boolean;
  data?: CareerSimulation;
  error?: string;
}
