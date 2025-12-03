export interface BehaviorIncident {
  id: string;
  studentId: string;
  incidentDate: string;
  incidentTime: string;
  location: string;
  behaviorType: string;
  behaviorCategory: string;
  description: string;
  antecedent?: string;
  consequence?: string;
  duration?: number;
  intensity?: string;
  frequency?: string;
  witnessedBy?: string;
  othersInvolved?: string;
  interventionUsed?: string;
  interventionEffectiveness?: string;
  parentNotified: boolean;
  parentNotificationMethod?: string;
  parentResponse?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  adminNotified: boolean;
  consequenceGiven?: string;
  supportProvided?: string;
  triggerAnalysis?: string;
  patternNotes?: string;
  positiveAlternative?: string;
  status: string;
  recordedBy: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BehaviorStats {
  overallStats?: {
    totalIncidents: number;
    seriousCount: number;
    positiveCount: number;
  };
  categoryBreakdown?: Record<string, number>;
  monthlyTrend?: Array<{ month: string; count: number }>;
}
