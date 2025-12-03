/**
 * Daily Insights Types
 * Günlük rehberlik özeti ve proaktif uyarı tipleri
 */

export interface DailyInsight {
  id: string;
  insightDate: string;
  reportType: 'GÜNLÜK' | 'HAFTALIK' | 'AYLIK';
  summary: string;
  
  // İstatistikler
  totalStudents: number;
  highRiskCount: number;
  mediumRiskCount: number;
  criticalAlertsCount: number;
  newAlertsCount: number;
  
  // Öne çıkan bulgular
  keyFindings?: string;
  
  // Öneriler
  priorityActions?: string;
  suggestedMeetings?: string;
  
  // AI Analizi
  aiInsights?: string;
  trendAnalysis?: string;
  
  // Meta
  generatedBy: string;
  generatedAt: string;
}

export interface StudentDailyStatus {
  id: string;
  studentId: string;
  statusDate: string;
  
  // Durum özeti
  overallStatus: 'İYİ' | 'DİKKAT' | 'ACİL';
  statusNotes?: string;
  
  // Değişimler
  academicChange?: number;
  behaviorChange?: number;
  attendanceChange?: number;
  
  // Flagler
  needsAttention: number;
  hasNewAlert: number;
  hasCriticalAlert: number;
  
  // Pattern tespitleri
  detectedPatterns?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ProactiveAlert {
  id: string;
  studentId?: string;
  alertCategory: 
    | 'AKADEMİK_DÜŞÜŞ' 
    | 'DAVRANIŞSAL_PATTERN' 
    | 'DEVAMSIZLIK_ARTIŞI'
    | 'SOSYAL_İZOLASYON'
    | 'RİSK_ARTIŞI'
    | 'POZİTİF_GELİŞİM';
  severity: 'BİLGİ' | 'DİKKAT' | 'YÜKSEK' | 'KRİTİK';
  title: string;
  description: string;
  evidence?: string;
  recommendation?: string;
  
  status: 'YENİ' | 'GÖRÜLDÜ' | 'AKSIYONA_ALINDI' | 'ÇÖZÜLDÜ' | 'GÖRMEZDEN_GELİNDİ';
  
  assignedTo?: string;
  actionTaken?: string;
  
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface DailyInsightsSummary {
  date: string;
  insight: DailyInsight;
  priorityStudents: StudentDailyStatus[];
  criticalAlerts: ProactiveAlert[];
  positiveUpdates: ProactiveAlert[];
  recommendedActions: string[];
}

export interface StudentInsightDetail {
  student: {
    id: string;
    name: string;
    class: string;
    riskLevel: string;
  };
  dailyStatus: StudentDailyStatus;
  recentAlerts: ProactiveAlert[];
  changes: {
    academic?: number;
    behavior?: number;
    attendance?: number;
  };
  aiRecommendation?: string;
}
