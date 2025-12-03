export interface RiskScoreHistory {
  id: string;
  studentId: string;
  assessmentDate: string;
  academicScore?: number;
  behavioralScore?: number;
  attendanceScore?: number;
  socialEmotionalScore?: number;
  overallRiskScore: number;
  riskLevel: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  dataPoints?: string;
  calculationMethod?: string;
  created_at?: string;
}

export interface EarlyWarningAlert {
  id: string;
  studentId: string;
  alertType: string;
  alertLevel: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  title: string;
  description: string;
  triggerCondition?: string;
  triggerValue?: string;
  threshold?: string;
  dataSource?: string;
  status?: 'AÇIK' | 'İNCELENİYOR' | 'MÜDAHALE_EDİLDİ' | 'ÇÖZÜLDÜ' | 'KAPALI';
  assignedTo?: string;
  notifiedAt?: string;
  reviewedAt?: string;
  resolvedAt?: string;
  resolution?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InterventionRecommendation {
  id: string;
  studentId: string;
  alertId?: string;
  recommendationType: string;
  priority: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'ACİL';
  title: string;
  description: string;
  suggestedActions: string;
  targetArea: string;
  expectedOutcome?: string;
  resources?: string;
  estimatedDuration?: string;
  status?: 'ÖNERİLDİ' | 'PLANLANDI' | 'UYGULANMAKTA' | 'TAMAMLANDI' | 'REDDEDİLDİ';
  implementedBy?: string;
  implementedAt?: string;
  effectiveness?: 'ÇOK_ETKİLİ' | 'ETKİLİ' | 'KISMEN_ETKİLİ' | 'ETKİSİZ' | 'DEĞERLENDİRİLMEDİ';
  followUpDate?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RiskAnalysisResult {
  studentId: string;
  overallRiskScore: number;
  riskLevel: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  academicScore: number;
  behavioralScore: number;
  attendanceScore: number;
  socialEmotionalScore: number;
  alerts: EarlyWarningAlert[];
  recommendations: InterventionRecommendation[];
}

export interface RiskFactorData {
  academicPerformance?: {
    gpa?: number;
    recentExamScores?: number[];
    failingSubjects?: number;
    gradeDecline?: boolean;
  };
  behaviorData?: {
    totalIncidents?: number;
    seriousIncidents?: number;
    recentIncidentCount?: number;
    positiveCount?: number;
  };
  attendanceData?: {
    totalDays?: number;
    absentDays?: number;
    tardyDays?: number;
    excusedAbsences?: number;
    attendanceRate?: number;
  };
  socialEmotionalData?: {
    counselingSessionCount?: number;
    recentConcerns?: string[];
    supportLevel?: string;
  };
}
