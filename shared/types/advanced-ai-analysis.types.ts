/**
 * Advanced AI Analysis Types
 * Gelişmiş AI Analiz Tipleri
 */

export interface MotivationalProfile {
  intrinsicMotivation: {
    level: 'YÜKSEK' | 'ORTA' | 'DÜŞÜK';
    indicators: string[];
    developmentAreas: string[];
  };
  extrinsicMotivation: {
    level: 'YÜKSEK' | 'ORTA' | 'DÜŞÜK';
    primaryDrivers: string[];
    effectiveRewards: string[];
  };
  learningOrientation: 'ÖĞRENME_ODAKLI' | 'PERFORMANS_ODAKLI' | 'KAÇINMA_ODAKLI' | 'KARMA';
  goalSetting: {
    quality: 'ETKİLİ' | 'GELİŞTİRİLEBİLİR' | 'ZAYIF';
    autonomy: number;
    recommendations: string[];
  };
  resilienceFactors: {
    strengths: string[];
    vulnerabilities: string[];
    copingStrategies: string[];
  };
}

export interface FamilyDynamicsAnalysis {
  parentalInvolvement: {
    level: 'YÜKSEK' | 'ORTA' | 'DÜŞÜK' | 'İNCELENEMEDİ';
    quality: 'DESTEKLEYICI' | 'KARMA' | 'SORUNLU' | 'BELİRSİZ';
    communicationPatterns: string[];
    improvementAreas: string[];
  };
  familyStructure: {
    type: string;
    stabilityLevel: 'STABLE' | 'TRANSITIONING' | 'UNSTABLE' | 'UNKNOWN';
    impactOnStudent: string[];
  };
  socioeconomicFactors: {
    indicators: string[];
    resourceAvailability: 'YETERLİ' | 'KISITLI' | 'YETERSİZ' | 'BELİRSİZ';
    supportNeeds: string[];
  };
  culturalContext: {
    factors: string[];
    considerationsForIntervention: string[];
  };
  familySupport: {
    emotionalSupport: number;
    academicSupport: number;
    practicalSupport: number;
    recommendations: string[];
  };
}

export interface PeerRelationshipAnalysis {
  socialIntegration: {
    level: 'İYİ_ENTEGRE' | 'ORTA_ENTEGRE' | 'İZOLE' | 'KRİTİK_İZOLASYON';
    friendshipQuality: 'SAĞLIKLI' | 'GELIŞEN' | 'SORUNLU' | 'YOK';
    peerAcceptance: number;
    indicators: string[];
  };
  socialSkills: {
    strengths: string[];
    challenges: string[];
    developmentPriorities: string[];
  };
  peerInfluence: {
    positiveInfluences: string[];
    negativeInfluences: string[];
    riskFactors: string[];
    protectiveActions: string[];
  };
  bullying: {
    victimIndicators: string[];
    perpetratorIndicators: string[];
    bystanderBehavior: string[];
    interventionNeeds: string[];
  };
  socialEmotionalCompetencies: {
    selfAwareness: number;
    selfManagement: number;
    socialAwareness: number;
    relationshipSkills: number;
    responsibleDecisionMaking: number;
    focusAreas: string[];
  };
}

export interface DevelopmentalFactorsAnalysis {
  ageAppropriatenesss: {
    academicDevelopment: 'İLERİDE' | 'UYGUN' | 'GECİKMİŞ';
    socialDevelopment: 'İLERİDE' | 'UYGUN' | 'GECİKMİŞ';
    emotionalDevelopment: 'İLERİDE' | 'UYGUN' | 'GECİKMİŞ';
    considerations: string[];
  };
  criticalDevelopmentalNeeds: string[];
  transitions: {
    currentTransitions: string[];
    supportNeeded: string[];
    expectedChallenges: string[];
  };
}

export interface PsychologicalDepthAnalysis {
  studentId: string;
  studentName: string;
  analysisDate: string;
  motivationalProfile: MotivationalProfile;
  familyDynamics: FamilyDynamicsAnalysis;
  peerRelationships: PeerRelationshipAnalysis;
  developmentalFactors: DevelopmentalFactorsAnalysis;
  synthesisAndRecommendations: {
    keyPsychologicalThemes: string[];
    primaryConcerns: string[];
    strengthsToLeverage: string[];
    criticalInterventions: Array<{
      area: string;
      priority: 'ACİL' | 'YÜKSEK' | 'ORTA';
      intervention: string;
      rationale: string;
      expectedOutcome: string;
      timeline: string;
    }>;
    counselingApproach: {
      recommendedModality: string;
      therapeuticTechniques: string[];
      sessionFrequency: string;
      involvementNeeded: string[];
    };
    holisticWellbeingPlan: string;
  };
}

export interface TimeBasedRiskPrediction {
  timeframe: '24_HOURS' | '48_HOURS' | '72_HOURS' | '1_WEEK';
  riskLevel: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  probability: number;
  keyIndicators: string[];
  triggerEvents: string[];
  preventiveActions: string[];
}

export interface BehaviorPattern {
  patternType: 'AKADEMİK' | 'DAVRANIŞSAL' | 'SOSYAL' | 'DUYGUSAL' | 'DEVAMSIZLIK';
  patternName: string;
  frequency: 'GÜNLÜK' | 'HAFTALIK' | 'AYLIK' | 'MEVSİMSEL';
  confidence: number;
  description: string;
  triggers: string[];
  peakTimes: string[];
  interventionWindows: string[];
}

export interface PredictiveAlert {
  alertId: string;
  studentId: string;
  predictionDate: string;
  alertType: 'ERKEN_UYARI' | 'ACİL_MÜDAHALE' | 'İZLEME_GEREKLİ' | 'ÖNLEYICI_DESTEK';
  severity: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  title: string;
  description: string;
  predictedOutcome: string;
  preventionStrategy: string;
  actionDeadline: string;
  responsibleParties: string[];
}

export interface CausalAnalysis {
  observedEvent: string;
  eventDate: string;
  likelyRootCauses: Array<{
    cause: string;
    likelihood: number;
    evidence: string[];
    contributingFactors: string[];
  }>;
  contributingFactors: {
    academic: string[];
    social: string[];
    emotional: string[];
    environmental: string[];
    family: string[];
  };
  cascadeEffects: Array<{
    effect: string;
    probability: number;
    timeframe: string;
    preventionStrategies: string[];
  }>;
}

export interface PredictiveRiskTimeline {
  studentId: string;
  studentName: string;
  generatedAt: string;
  currentRiskStatus: {
    overallRisk: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
    activeAlerts: number;
    recentChanges: string[];
    urgentActions: string[];
  };
  timeBasedPredictions: {
    next24Hours: TimeBasedRiskPrediction;
    next48Hours: TimeBasedRiskPrediction;
    next72Hours: TimeBasedRiskPrediction;
    nextWeek: TimeBasedRiskPrediction;
  };
  identifiedPatterns: BehaviorPattern[];
  predictiveAlerts: PredictiveAlert[];
  causalAnalyses: CausalAnalysis[];
  earlyInterventionOpportunities: Array<{
    window: string;
    opportunity: string;
    expectedImpact: 'YÜKSEK' | 'ORTA' | 'DÜŞÜK';
    actionSteps: string[];
    resources: string[];
    deadline: string;
  }>;
  monitoringPlan: {
    checkpoints: Array<{
      time: string;
      whatToMonitor: string[];
      redFlags: string[];
      contactPerson: string;
    }>;
    escalationTriggers: string[];
    successIndicators: string[];
  };
}

export interface HourlyAction {
  time: string;
  timeSlot: string;
  actionType: 'GÖRÜŞME' | 'İZLEME' | 'MÜDAHALE' | 'DÖKÜMENTASYON' | 'AİLE_İLETİŞİMİ' | 'TOPLANTI' | 'ACİL';
  priority: 'ACİL' | 'YÜKSEK' | 'ORTA' | 'DÜŞÜK';
  studentId?: string;
  studentName?: string;
  action: string;
  duration: number;
  expectedOutcome: string;
  preparationNeeded: string[];
  resources: string[];
  followUp?: string;
}

export interface DailyPriorities {
  criticalActions: HourlyAction[];
  highPriorityActions: HourlyAction[];
  routineActions: HourlyAction[];
  opportunisticActions: HourlyAction[];
}

export interface CounselorDailyPlan {
  date: string;
  counselorName: string;
  generatedAt: string;
  dailySummary: {
    totalActions: number;
    criticalCount: number;
    highPriorityCount: number;
    estimatedWorkload: string;
    keyFocusAreas: string[];
  };
  morningBriefing: {
    urgentMatters: string[];
    keyStudentsToMonitor: Array<{
      studentId: string;
      name: string;
      reason: string;
      suggestedTime: string;
    }>;
    preparationTasks: string[];
  };
  hourlySchedule: HourlyAction[];
  priorities: DailyPriorities;
  flexibilityRecommendations: {
    bufferTimes: string[];
    contingencyPlans: Array<{
      scenario: string;
      action: string;
    }>;
    adjustmentStrategies: string[];
  };
  endOfDayChecklist: string[];
  tomorrowPrep: string[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  time?: string;
  eventType: 'AKADEMİK' | 'DAVRANIŞSAL' | 'SOSYAL' | 'SAĞLIK' | 'AİLE' | 'MÜDAHALE' | 'BAŞARI';
  category: string;
  title: string;
  description: string;
  severity?: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  impact: 'POZİTİF' | 'NÖTR' | 'NEGATİF';
  relatedEvents?: string[];
  metadata?: Record<string, unknown>;
}

export interface PatternCluster {
  clusterId: string;
  patternName: string;
  events: TimelineEvent[];
  startDate: string;
  endDate: string;
  frequency: string;
  triggers: string[];
  outcomes: string[];
  interventionPoints: string[];
}

export interface CausalRelationship {
  causeEvent: TimelineEvent;
  effectEvent: TimelineEvent;
  relationshipType: 'DİREKT' | 'DOLAYLI' | 'OLASI' | 'KORELASYON';
  confidence: number;
  explanation: string;
  timeGap: string;
  mediatingFactors?: string[];
}

export interface TurningPoint {
  date: string;
  event: TimelineEvent;
  significance: 'KRİTİK' | 'ÖNEMLI' | 'DÖNÜM_NOKTASI';
  beforeState: string;
  afterState: string;
  catalysts: string[];
  longTermEffects: string[];
}

export interface StudentTimeline {
  studentId: string;
  studentName: string;
  generatedAt: string;
  timelineStart: string;
  timelineEnd: string;
  chronologicalEvents: TimelineEvent[];
  patternClusters: PatternCluster[];
  causalRelationships: CausalRelationship[];
  turningPoints: TurningPoint[];
  trendAnalysis: {
    academicTrend: 'YÜKSELIŞ' | 'DÜŞÜŞ' | 'STABIL' | 'DALGALI';
    behavioralTrend: 'İYİLEŞME' | 'KÖTÜLEŞME' | 'STABIL' | 'DALGALI';
    socialTrend: 'GELIŞEN' | 'ZAYIFLAYAN' | 'STABIL';
    overallTrajectory: string;
    keyInfluencers: string[];
  };
  criticalPeriods: Array<{
    period: string;
    description: string;
    events: TimelineEvent[];
    interventionsNeeded: string[];
  }>;
  successMoments: Array<{
    date: string;
    achievement: string;
    contributingFactors: string[];
    lessonsLearned: string[];
    replicationStrategy: string;
  }>;
  insights: {
    keyPatterns: string[];
    rootCauses: string[];
    protectiveFactors: string[];
    vulnerabilities: string[];
    recommendedInterventions: string[];
  };
}

export interface StudentComparison {
  studentId: string;
  studentName: string;
  academicScore: number;
  behaviorScore: number;
  riskLevel: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  keyStrengths: string[];
  keyChallenges: string[];
  interventionPriority: number;
}

export interface ClassPattern {
  patternId: string;
  patternName: string;
  affectedStudents: string[];
  frequency: 'YAYGIN' | 'ORTA' | 'NADİR';
  severity: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  description: string;
  possibleCauses: string[];
  classLevelInterventions: string[];
}

export interface RiskCorrelation {
  factor1: string;
  factor2: string;
  correlationType: 'POZİTİF' | 'NEGATİF' | 'NÖTR';
  strength: number;
  affectedCount: number;
  explanation: string;
  preventionStrategy: string;
}

export interface GroupDynamics {
  positiveGroups: Array<{
    members: string[];
    characteristics: string[];
    leverageOpportunities: string[];
  }>;
  riskGroups: Array<{
    members: string[];
    riskFactors: string[];
    interventionNeeds: string[];
  }>;
  isolatedStudents: Array<{
    studentId: string;
    name: string;
    isolationReasons: string[];
    integrationStrategies: string[];
  }>;
  leadershipOpportunities: Array<{
    studentId: string;
    name: string;
    leadershipType: string;
    developmentPlan: string[];
  }>;
}

export interface ComparativeAnalysisReport {
  analysisDate: string;
  classId?: string;
  class?: string;
  studentCount: number;
  studentComparisons: StudentComparison[];
  classPatterns: ClassPattern[];
  riskCorrelations: RiskCorrelation[];
  groupDynamics: GroupDynamics;
  classLevelMetrics: {
    averageAcademicScore: number;
    averageBehaviorScore: number;
    averageRiskLevel: string;
    highRiskCount: number;
    lowPerformersCount: number;
    highPerformersCount: number;
  };
  comparativeInsights: {
    strengthAreas: string[];
    challengeAreas: string[];
    inequities: string[];
    successFactors: string[];
    systemicIssues: string[];
  };
  prioritizedRecommendations: Array<{
    priority: 'ACİL' | 'YÜKSEK' | 'ORTA';
    targetGroup: 'TÜM_SINIF' | 'GRUP' | 'BİREYSEL';
    recommendation: string;
    expectedImpact: string;
    resources: string[];
    timeline: string;
  }>;
  successStories: Array<{
    studentId: string;
    achievement: string;
    approach: string;
    replicability: string;
  }>;
}
