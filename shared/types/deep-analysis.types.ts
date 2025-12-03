/**
 * Deep Analysis Types
 * Derin öğrenci analiz motor tipleri
 */

export interface StudentTrajectory {
  studentId: string;
  currentStatus: {
    academicLevel: 'DÜŞÜK' | 'ORTA' | 'İYİ' | 'MÜKEMMEL';
    socialEmotionalLevel: 'RİSKLİ' | 'GELİŞTİRİLEBİLİR' | 'İYİ' | 'GÜÇLÜ';
    behaviorLevel: 'SORUNLU' | 'DİKKAT' | 'NORMAL' | 'ÖRNEKTEYİCİ';
    overallRisk: 'KRİTİK' | 'YÜKSEK' | 'ORTA' | 'DÜŞÜK';
  };
  
  trajectory: {
    period: 'SON_3_AY' | 'SON_6_AY' | 'SON_YIL';
    trend: 'YÜKSELİŞ' | 'DÜŞÜŞ' | 'DALGALI' | 'STABIL';
    trendPercentage: number;
    keyTurningPoints: Array<{
      date: string;
      event: string;
      impact: 'POZİTİF' | 'NEGATİF';
    }>;
  };
  
  prediction: {
    nextMonthOutlook: 'İYİLEŞME' | 'STABIL' | 'RİSK_ARTIŞI';
    confidence: number; // 0-100
    factors: string[];
  };
  
  interventionPriority: 'ACİL' | 'YÜKSEK' | 'ORTA' | 'DÜŞÜK';
  recommendedActions: string[];
}

export interface PersonalizedInterventionPlan {
  studentId: string;
  generatedAt: string;
  
  // Öncelik sıralı müdahaleler
  interventions: Array<{
    priority: 'ACİL' | 'YÜKSEK' | 'ORTA' | 'DÜŞÜK';
    targetArea: string;
    specificGoal: string;
    
    // Stratejiler
    strategies: Array<{
      name: string;
      description: string;
      evidenceBase: string; // Hangi araştırmaya dayalı
      expectedDuration: string;
    }>;
    
    // Kaynaklar
    resources: {
      materials: string[];
      personnel: string[];
      externalSupport?: string[];
    };
    
    // Başarı kriterleri
    successCriteria: string[];
    monitoringPlan: {
      frequency: string;
      metrics: string[];
      checkpoints: string[];
    };
  }>;
  
  // Timeline
  timeline: {
    phase1: string; // 1-4 hafta
    phase2: string; // 1-3 ay
    phase3: string; // 6-12 ay
  };
}

export interface SuccessFactorAnalysis {
  studentId: string;
  
  // Güçlü yönler
  strengths: Array<{
    category: 'AKADEMİK' | 'SOSYAL' | 'DUYGUSAL' | 'FİZİKSEL' | 'SANATSAL';
    factor: string;
    evidence: string[];
    leverageOpportunities: string[];
  }>;
  
  // Risk faktörleri
  riskFactors: Array<{
    category: string;
    factor: string;
    severity: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
    mitigationStrategies: string[];
  }>;
  
  // Koruyucu faktörler
  protectiveFactors: Array<{
    factor: string;
    strength: 'GÜÇLÜ' | 'ORTA' | 'ZAYIF';
    enhancementSuggestions: string[];
  }>;
  
  // Başarı için kilit unsurlar
  keySuccessFactors: {
    internal: string[]; // Öğrencinin kontrolünde
    external: string[]; // Dış destek gerektiren
    combined: string[]; // İşbirliği gerektiren
  };
}

export interface ComparativeAnalysis {
  studentId: string;
  studentName: string;
  
  // Sınıf içi karşılaştırma
  classComparison: {
    class: string;
    studentRank: number;
    totalStudents: number;
    percentile: number;
    
    metrics: {
      academicPerformance: {
        studentScore: number;
        classAverage: number;
        deviation: number;
      };
      attendance: {
        studentRate: number;
        classAverage: number;
        deviation: number;
      };
      behavior: {
        studentScore: number;
        classAverage: number;
        deviation: number;
      };
    };
  };
  
  // Benzer profilli öğrencilerle karşılaştırma
  similarStudentsComparison: {
    similarityBasis: string;
    comparisonGroup: number;
    
    whatWorked: Array<{
      strategy: string;
      successRate: number;
      applicableToStudent: boolean;
    }>;
    
    commonChallenges: string[];
    differentiatingFactors: string[];
  };
  
  // Geçmiş yıl öğrencileriyle karşılaştırma
  historicalComparison?: {
    similarPattern: string;
    outcome: string;
    lessonLearned: string;
  };
}

export interface DeepAnalysisReport {
  studentId: string;
  studentName: string;
  generatedAt: string;
  
  // Tüm analizler
  trajectory: StudentTrajectory;
  interventionPlan: PersonalizedInterventionPlan;
  successFactors: SuccessFactorAnalysis;
  comparative: ComparativeAnalysis;
  
  // AI Özeti
  executiveSummary: string;
  keyInsights: string[];
  criticalActions: string[];
  
  // Confidence skoru
  analysisConfidence: number; // 0-100
  dataCompleteness: number; // 0-100
}

export interface BatchAnalysisRequest {
  studentIds: string[];
  analysisDepth: 'HıZLı' | 'STANDART' | 'DERİN';
  includeComparative: boolean;
}

export interface BatchAnalysisResult {
  totalStudents: number;
  completed: number;
  failed: number;
  reports: DeepAnalysisReport[];
  errors: Array<{
    studentId: string;
    error: string;
  }>;
}
