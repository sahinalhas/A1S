export interface NotificationLog {
  id: string;
  recipientType: 'PARENT' | 'TEACHER' | 'COUNSELOR' | 'ADMIN';
  recipientId?: string;
  recipientName?: string;
  recipientContact?: string;
  notificationType: 'RISK_ALERT' | 'INTERVENTION_REMINDER' | 'PROGRESS_UPDATE' | 'MEETING_SCHEDULED' | 'WEEKLY_DIGEST' | 'MONTHLY_REPORT' | 'CUSTOM';
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  subject?: string;
  message: string;

  studentId?: string;
  alertId?: string;
  interventionId?: string;

  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failureReason?: string;

  metadata?: string;
  templateId?: string;
  schoolId?: string;

  created_at: string;
  updated_at: string;
}

export interface InterventionEffectiveness {
  id: string;
  interventionId: string;
  studentId: string;

  interventionType: string;
  interventionTitle: string;
  startDate: string;
  endDate?: string;
  duration?: number;

  preInterventionMetrics: string;
  postInterventionMetrics?: string;

  academicImpact?: number;
  behavioralImpact?: number;
  attendanceImpact?: number;
  socialEmotionalImpact?: number;
  overallEffectiveness?: number;

  effectivenessLevel?: 'VERY_EFFECTIVE' | 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'NOT_EFFECTIVE' | 'PENDING';

  successFactors?: string;
  challenges?: string;
  lessonsLearned?: string;
  recommendations?: string;

  aiAnalysis?: string;
  patternMatches?: string;
  similarInterventions?: string;

  evaluatedBy?: string;
  evaluatedAt?: string;

  created_at: string;
  updated_at: string;
}

export interface ParentFeedback {
  id: string;
  studentId: string;
  parentName: string;
  parentContact?: string;

  feedbackType: 'INTERVENTION' | 'REPORT' | 'COMMUNICATION' | 'GENERAL' | 'CONCERN' | 'APPRECIATION';
  relatedId?: string;

  rating?: number;
  feedbackText?: string;

  concerns?: string;
  suggestions?: string;
  appreciations?: string;

  followUpRequired: number;
  followUpNotes?: string;
  respondedBy?: string;
  respondedAt?: string;

  status: 'NEW' | 'REVIEWED' | 'RESPONDED' | 'CLOSED';

  created_at: string;
  updated_at: string;
}

export interface EscalationLog {
  id: string;
  studentId: string;
  alertId?: string;
  interventionId?: string;

  escalationType: 'RISK_INCREASE' | 'INTERVENTION_FAILURE' | 'URGENT_SITUATION' | 'NO_RESPONSE' | 'PARENT_REQUEST';
  currentLevel: string;
  escalatedTo: string;

  triggerReason: string;
  riskLevel?: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';

  escalatedBy?: string;
  escalatedAt: string;

  responseTime?: number;
  respondedBy?: string;
  respondedAt?: string;

  actionTaken?: string;
  resolution?: string;

  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

  notificationsSent?: string;

  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id: string;
  userId?: string;
  parentId?: string;
  studentId?: string;

  userType: 'COUNSELOR' | 'TEACHER' | 'ADMIN' | 'PARENT';

  emailEnabled: number;
  smsEnabled: number;
  pushEnabled: number;
  inAppEnabled: number;

  emailAddress?: string;
  phoneNumber?: string;

  alertTypes?: string;
  riskLevels?: string;

  quietHoursStart?: string;
  quietHoursEnd?: string;

  weeklyDigest: number;
  monthlyReport: number;

  language: string;
  schoolId?: string;

  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  templateName: string;
  category: 'RISK_ALERT' | 'INTERVENTION' | 'PROGRESS' | 'MEETING' | 'GENERAL';

  language: string;

  subjectTemplate?: string;
  messageTemplate: string;

  variables?: string;

  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' | 'ALL';

  isActive: number;

  created_at: string;
  updated_at: string;
}

export interface ParentAccessToken {
  id: string;
  studentId: string;
  parentName: string;
  parentContact: string;

  accessToken: string;
  accessLevel: 'VIEW_ONLY' | 'VIEW_AND_COMMENT' | 'FULL';

  expiresAt?: string;
  isActive: number;

  lastAccessedAt?: string;
  accessCount: number;

  createdBy?: string;
  schoolId?: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduledTask {
  id: string;
  taskType: 'WEEKLY_DIGEST' | 'MONTHLY_REPORT' | 'INTERVENTION_REMINDER' | 'FOLLOW_UP' | 'ESCALATION_CHECK';

  targetType: 'STUDENT' | 'PARENT' | 'COUNSELOR' | 'ALL';
  targetId?: string;

  scheduleType: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  scheduledTime: string;

  lastRun?: string;
  nextRun: string;

  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';

  taskData?: string;
  schoolId?: string;

  created_at: string;
  updated_at: string;
}

export interface NotificationRequest {
  recipientType: 'PARENT' | 'TEACHER' | 'COUNSELOR' | 'ADMIN';
  recipientContact: string;
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  templateId?: string;
  subject?: string;
  message: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  studentId?: string;
  alertId?: string;
  interventionId?: string;
  metadata?: Record<string, any>;
}

export interface InterventionMetrics {
  academicScore: number;
  behaviorScore: number;
  attendanceRate: number;
  socialEmotionalScore: number;
  riskLevel: string;
}

export interface EffectivenessAnalysis {
  overallScore: number;
  level: 'VERY_EFFECTIVE' | 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'NOT_EFFECTIVE';
  impacts: {
    academic: number;
    behavioral: number;
    attendance: number;
    socialEmotional: number;
  };
  insights: string[];
  recommendations: string[];
  similarSuccesses: Array<{
    interventionId: string;
    title: string;
    effectiveness: number;
  }>;
}
