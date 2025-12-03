// Student Strengths & Resources
export interface StudentStrength {
  id: string;
  studentId: string;
  assessmentDate: string;
  personalStrengths?: string;
  academicStrengths?: string;
  socialStrengths?: string;
  creativeStrengths?: string;
  physicalStrengths?: string;
  successStories?: string;
  resilienceFactors?: string;
  supportSystems?: string;
  copingStrategies?: string;
  achievements?: string;
  skills?: string;
  talents?: string;
  positiveFeedback?: string;
  growthMindsetIndicators?: string;
  notes?: string;
  assessedBy?: string;
  created_at?: string;
  updated_at?: string;
}

// Social Relations & Peer Interaction
export type FriendCircleSize = 'YOK' | 'AZ' | 'ORTA' | 'GENİŞ';
export type FriendCircleQuality = 'ZAYIF' | 'ORTA' | 'İYİ' | 'ÇOK_İYİ';
export type SocialRole = 'LİDER' | 'AKTİF_ÜYE' | 'TAKİPÇİ' | 'GÖZLEMCİ' | 'İZOLE';
export type RelationshipQuality = 'SORUNLU' | 'ZAYIF' | 'ORTA' | 'İYİ' | 'ÇOK_İYİ';
export type SkillLevel = 'ZAYIF' | 'GELİŞMEKTE' | 'YETERLİ' | 'İYİ' | 'İLERİ';
export type BullyingStatus = 'YOK' | 'MAĞDUR' | 'FAİL' | 'HER_İKİSİ' | 'GÖZLEMCİ';
export type PeerInfluence = 'OLUMSUZ' | 'NÖTR' | 'OLUMLU' | 'ÇOK_OLUMLU';
export type InclusionStatus = 'DIŞLANMIŞ' | 'KISITLI' | 'KABUL_EDİLMİŞ' | 'POPÜLER';
export type SocialAnxietyLevel = 'YOK' | 'DÜŞÜK' | 'ORTA' | 'YÜKSEK';

export interface StudentSocialRelation {
  id: string;
  studentId: string;
  assessmentDate: string;
  friendCircleSize?: FriendCircleSize;
  friendCircleQuality?: FriendCircleQuality;
  socialRole?: SocialRole;
  peerRelationshipQuality?: RelationshipQuality;
  socialSkillsLevel?: SkillLevel;
  conflictResolutionSkills?: SkillLevel;
  leadershipQualities?: string;
  teamworkAbility?: RelationshipQuality;
  bullyingStatus?: BullyingStatus;
  bullyingDetails?: string;
  socialGroupDynamics?: string;
  peerInfluence?: PeerInfluence;
  inclusionStatus?: InclusionStatus;
  communicationStyle?: string;
  socialAnxietyLevel?: SocialAnxietyLevel;
  extracurricularSocialActivities?: string;
  notes?: string;
  assessedBy?: string;
  created_at?: string;
  updated_at?: string;
}

// Interests & Talents
export interface StudentInterest {
  id: string;
  studentId: string;
  assessmentDate: string;
  hobbies?: string;
  passions?: string;
  favoriteSubjects?: string;
  leastFavoriteSubjects?: string;
  specialTalents?: string;
  creativeExpressionForms?: string;
  sportsActivities?: string;
  artisticActivities?: string;
  musicInterests?: string;
  technologicalInterests?: string;
  readingHabits?: string;
  favoriteBooks?: string;
  favoriteMoviesShows?: string;
  curiosityAreas?: string;
  explorativeTopics?: string;
  careerInterests?: string;
  clubMemberships?: string;
  volunteerWork?: string;
  partTimeJobs?: string;
  projectsUndertaken?: string;
  skillsDevelopment?: string;
  learningPreferences?: string;
  motivationalTopics?: string;
  notes?: string;
  assessedBy?: string;
  created_at?: string;
  updated_at?: string;
}

// Future Vision & Motivation
export type MotivationLevel = 'ÇOK_DÜŞÜK' | 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'ÇOK_YÜKSEK';
export type SelfEfficacyLevel = 'ÇOK_DÜŞÜK' | 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'ÇOK_YÜKSEK';
export type GrowthMindset = 'SABİT' | 'KARIŞIK' | 'GELİŞİM_ODAKLI';
export type FutureOrientation = 'YOK' | 'BELIRSIZ' | 'NET' | 'ÇOK_NET';
export type RiskTakingTendency = 'ÇOK_DÜŞÜK' | 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'ÇOK_YÜKSEK';

export interface StudentFutureVision {
  id: string;
  studentId: string;
  assessmentDate: string;
  shortTermGoals?: string;
  longTermGoals?: string;
  careerAspirations?: string;
  dreamJob?: string;
  educationalGoals?: string;
  universityPreferences?: string;
  majorPreferences?: string;
  lifeGoals?: string;
  personalDreams?: string;
  fearsAndConcerns?: string;
  perceivedBarriers?: string;
  motivationSources?: string;
  motivationLevel?: MotivationLevel;
  selfEfficacyLevel?: SelfEfficacyLevel;
  growthMindset?: GrowthMindset;
  futureOrientation?: FutureOrientation;
  roleModels?: string;
  inspirationSources?: string;
  valuesAndPriorities?: string;
  planningAbility?: SkillLevel;
  timeManagementSkills?: SkillLevel;
  decisionMakingStyle?: string;
  riskTakingTendency?: RiskTakingTendency;
  actionSteps?: string;
  progressTracking?: string;
  notes?: string;
  assessedBy?: string;
  created_at?: string;
  updated_at?: string;
}

// SEL Competencies
export type SELLevel = 'ÇOK_DÜŞÜK' | 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'ÇOK_YÜKSEK';
export type MindfulnessEngagement = 'YOK' | 'NADİREN' | 'BAZEN' | 'SIKLIKLA' | 'DÜZENLI';

export interface StudentSELCompetency {
  id: string;
  studentId: string;
  assessmentDate: string;
  selfAwarenessLevel?: SELLevel;
  emotionRecognition?: SkillLevel;
  emotionExpression?: SkillLevel;
  emotionRegulation?: SkillLevel;
  empathyLevel?: SELLevel;
  socialAwareness?: SkillLevel;
  perspectiveTaking?: SkillLevel;
  relationshipSkills?: SkillLevel;
  cooperationSkills?: SkillLevel;
  communicationSkills?: SkillLevel;
  conflictManagement?: SkillLevel;
  problemSolvingApproach?: string;
  problemSolvingSkills?: SkillLevel;
  decisionMakingSkills?: SkillLevel;
  responsibleDecisionMaking?: SkillLevel;
  selfManagement?: SkillLevel;
  impulseControl?: SkillLevel;
  stressCoping?: SkillLevel;
  stressManagementStrategies?: string;
  resilienceLevel?: SELLevel;
  adaptability?: SkillLevel;
  goalSetting?: SkillLevel;
  selfMotivation?: SELLevel;
  optimismLevel?: SELLevel;
  mindfulnessEngagement?: MindfulnessEngagement;
  notes?: string;
  assessedBy?: string;
  created_at?: string;
  updated_at?: string;
}

// Socioeconomic Factors
export type IncomeLevel = 'ÇOK_DÜŞÜK' | 'DÜŞÜK' | 'ORTA' | 'İYİ' | 'YÜKSEK';
export type EducationLevel = 'İLKOKUL' | 'ORTAOKUL' | 'LİSE' | 'ÖNLİSANS' | 'LİSANS' | 'YÜKSEK_LİSANS' | 'DOKTORA' | 'BELİRTİLMEMİŞ';
export type HousingType = 'KİRA' | 'MÜLK' | 'LOJMAN' | 'DİĞER';
export type HousingCondition = 'KÖTÜ' | 'ORTA' | 'İYİ' | 'ÇOK_İYİ';
export type StudySpaceAvailability = 'YOK' | 'PAYLAŞIMLI' | 'KENDİ_ODASI' | 'ÖZEL_ÇALIŞMA_ALANI';
export type InternetAccess = 'YOK' | 'SINIRLI' | 'YETERLİ' | 'İYİ';
export type NutritionStatus = 'YETERSİZ' | 'ORTA' | 'YETERLİ' | 'İYİ';
export type TransportationType = 'YÜRÜME' | 'TOPLU_TAŞIMA' | 'OKUL_SERVİSİ' | 'AİLE_ARACI' | 'DİĞER';
export type Accessibility = 'YOK' | 'SINIRLI' | 'ORTA' | 'GENİŞ';
export type FinancialStability = 'SORUNLU' | 'İSTİKRARSIZ' | 'KARIŞIK' | 'İSTİKRARLI' | 'GÜVENLİ';
export type ConfidentialityLevel = 'GENEL' | 'SINIRLI' | 'GİZLİ' | 'ÇOK_GİZLİ';

export interface StudentSocioeconomic {
  id: string;
  studentId: string;
  assessmentDate: string;
  familyIncomeLevel?: IncomeLevel;
  parentEmploymentStatus?: string;
  motherEducationLevel?: EducationLevel;
  fatherEducationLevel?: EducationLevel;
  householdSize?: number;
  numberOfSiblings?: number;
  birthOrder?: string;
  housingType?: HousingType;
  housingCondition?: HousingCondition;
  studySpaceAvailability?: StudySpaceAvailability;
  internetAccess?: InternetAccess;
  deviceAccess?: string;
  schoolResourcesUsage?: string;
  financialBarriers?: string;
  resourcesAndSupports?: string;
  scholarshipsOrAid?: string;
  materialNeeds?: string;
  nutritionStatus?: NutritionStatus;
  transportationToSchool?: TransportationType;
  extracurricularAccessibility?: Accessibility;
  culturalCapital?: string;
  socialCapital?: string;
  communitySupport?: string;
  economicStressors?: string;
  familyFinancialStability?: FinancialStability;
  workResponsibilities?: string;
  caregivingResponsibilities?: string;
  notes?: string;
  confidentialityLevel?: ConfidentialityLevel;
  assessedBy?: string;
  created_at?: string;
  updated_at?: string;
}
