export type SessionFlow = 'çok_olumlu' | 'olumlu' | 'nötr' | 'sorunlu' | 'kriz';
export type ParticipationLevel = 'çok_aktif' | 'aktif' | 'pasif' | 'dirençli' | 'kapalı';
export type EmotionalState = 'sakin' | 'kaygılı' | 'üzgün' | 'sinirli' | 'mutlu' | 'karışık' | 'diğer';
export type PhysicalState = 'normal' | 'yorgun' | 'huzursuz' | 'ajite';
export type CommunicationQuality = 'açık' | 'ketum' | 'seçici' | 'kapalı';

export interface SessionTag {
  id: string;
  label: string;
  category: 'topic' | 'status' | 'action' | 'emotion' | 'custom';
  color?: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

export interface AIAnalysisData {
  sentiment?: 'positive' | 'neutral' | 'negative';
  keyThemes?: string[];
  riskLevel?: 'low' | 'medium' | 'high';
  recommendedActions?: string[];
  confidenceScore?: number;
  processedAt?: string;
}

export interface CounselingSession {
  id: string;
  sessionType: 'individual' | 'group';
  groupName?: string;
  counselorId: string;
  schoolId?: string;
  sessionDate: string;
  entryTime: string;
  entryClassHourId?: number;
  exitTime?: string;
  exitClassHourId?: number;
  topic?: string;
  drpHizmetAlaniId?: number;
  drpBirId?: number;
  drpIkiId?: number;
  drpUcId?: number;
  participantType: string;
  relationshipType?: string;
  otherParticipants?: string;
  parentName?: string;
  parentRelationship?: string;
  teacherName?: string;
  teacherBranch?: string;
  otherParticipantDescription?: string;
  sessionMode: string;
  sessionLocation: string;
  disciplineStatus?: string;
  institutionalCooperation?: string;
  sessionDetails?: string;
  detailedNotes?: string;

  sessionFlow?: SessionFlow;
  studentParticipationLevel?: ParticipationLevel;
  cooperationLevel?: number;
  emotionalState?: EmotionalState;
  physicalState?: PhysicalState;
  communicationQuality?: CommunicationQuality;
  sessionTags?: string;
  achievedOutcomes?: string;
  followUpNeeded?: number;
  followUpPlan?: string;
  actionItems?: string;
  aiAnalysisData?: string;

  completed: number;
  autoCompleted?: number;
  extensionGranted?: number;
  mebbis_transferred?: number;
  mebbis_transfer_date?: string;
  mebbis_transfer_error?: string;
  mebbis_retry_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CounselingSessionWithStudents extends Omit<CounselingSession, 'sessionTags'> {
  sessionTags?: string[];
  students?: Array<{ id: string; name: string; surname: string; class: string; studentNumber?: string; gender?: string }>;
  student?: { id: string; name: string; surname: string; class: string; studentNumber?: string; gender?: string } | null;
}

export interface SessionFilters {
  startDate?: string;
  endDate?: string;
  topic?: string;
  className?: string;
  status?: 'completed' | 'active' | 'all';
  participantType?: string;
  sessionType?: 'individual' | 'group' | 'all';
  sessionMode?: string;
  studentId?: string;
}

export interface ClassHour {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

export interface CounselingTopic {
  id: string;
  title: string;
  category: string;
  fullPath: string;
}

export interface CounselingReminder {
  id: string;
  sessionId?: string;
  reminderType: 'planned_session' | 'follow_up' | 'parent_meeting';
  reminderDate: string;
  reminderTime: string;
  title: string;
  description?: string;
  studentIds?: string;
  status: 'pending' | 'completed' | 'cancelled';
  notificationSent: number;
  created_at?: string;
  updated_at?: string;
}

export interface CounselingFollowUp {
  id: string;
  sessionId?: string;
  followUpDate: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  actionItems: string;
  notes?: string;
  completedDate?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OverallStats {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  monthSessions: number;
  weekSessions: number;
  todaySessions: number;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
  individualPercentage: number;
  groupPercentage: number;
}

export interface TimeSeriesData {
  date: string;
  count: number;
  completed: number;
  active: number;
}

export interface TopicAnalysis {
  topic: string;
  count: number;
  avgDuration: number;
}

export interface ParticipantAnalysis {
  type: string;
  count: number;
  percentage: number;
}

export interface ClassAnalysis {
  className: string;
  count: number;
}

export interface SessionModeAnalysis {
  mode: string;
  count: number;
  percentage: number;
}

export interface SessionHistory {
  sessionId: string;
  sessionDate: string;
  topic: string;
  duration: number;
  sessionMode: string;
}

export interface StudentSessionStats {
  totalSessions: number;
  lastSessionDate: string | null;
  topics: string[];
  history: SessionHistory[];
}

export interface CounselingOutcome {
  id: string;
  sessionId: string;
  effectivenessRating?: number;
  progressNotes?: string;
  goalsAchieved?: string;
  nextSteps?: string;
  recommendations?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  created_at: string;
  updated_at: string;
}
