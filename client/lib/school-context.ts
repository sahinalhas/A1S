import { safeLocalStorageGet } from './utils/helpers/safe-json';

const SELECTED_SCHOOL_KEY = 'rehber360_selected_school';

export interface SelectedSchool {
  id: string;
  name: string;
  code?: string;
}

export function getSelectedSchoolId(): string | null {
  const school = safeLocalStorageGet<SelectedSchool | null>(SELECTED_SCHOOL_KEY, null);
  return school?.id ?? null;
}

export function getSelectedSchool(): SelectedSchool | null {
  return safeLocalStorageGet<SelectedSchool | null>(SELECTED_SCHOOL_KEY, null);
}

export function createSchoolScopedQueryKey(baseKey: string | readonly unknown[], schoolId?: string | null): readonly unknown[] {
  const effectiveSchoolId = schoolId ?? getSelectedSchoolId();
  
  if (!effectiveSchoolId) {
    console.warn('[QueryKey] No schoolId available for query key:', baseKey);
  }
  
  const normalizedBaseKey = typeof baseKey === 'string' ? [baseKey] : [...baseKey];
  
  return ['school', effectiveSchoolId ?? 'none', ...normalizedBaseKey] as const;
}

export const QUERY_KEYS = {
  students: (schoolId?: string | null) => createSchoolScopedQueryKey(['students'], schoolId),
  student: (studentId: string, schoolId?: string | null) => createSchoolScopedQueryKey(['student', studentId], schoolId),
  counselingSessions: (schoolId?: string | null) => createSchoolScopedQueryKey(['counseling-sessions'], schoolId),
  counselingSession: (sessionId: string, schoolId?: string | null) => createSchoolScopedQueryKey(['counseling-session', sessionId], schoolId),
  reminders: (schoolId?: string | null) => createSchoolScopedQueryKey(['reminders'], schoolId),
  followUps: (schoolId?: string | null) => createSchoolScopedQueryKey(['follow-ups'], schoolId),
  outcomes: (schoolId?: string | null) => createSchoolScopedQueryKey(['outcomes'], schoolId),
  surveys: (schoolId?: string | null) => createSchoolScopedQueryKey(['surveys'], schoolId),
  surveyTemplates: (schoolId?: string | null) => createSchoolScopedQueryKey(['survey-templates'], schoolId),
  surveyDistributions: (schoolId?: string | null) => createSchoolScopedQueryKey(['survey-distributions'], schoolId),
  surveyResponses: (surveyId: string, schoolId?: string | null) => createSchoolScopedQueryKey(['survey-responses', surveyId], schoolId),
  analytics: (schoolId?: string | null) => createSchoolScopedQueryKey(['analytics'], schoolId),
  reports: (schoolId?: string | null) => createSchoolScopedQueryKey(['reports'], schoolId),
  exams: (schoolId?: string | null) => createSchoolScopedQueryKey(['exams'], schoolId),
  examSessions: (schoolId?: string | null) => createSchoolScopedQueryKey(['exam-sessions'], schoolId),
  settings: (schoolId?: string | null) => createSchoolScopedQueryKey(['settings'], schoolId),
  notifications: (schoolId?: string | null) => createSchoolScopedQueryKey(['notifications'], schoolId),
  dailyInsights: (schoolId?: string | null) => createSchoolScopedQueryKey(['daily-insights'], schoolId),
  interventions: (schoolId?: string | null) => createSchoolScopedQueryKey(['interventions'], schoolId),
  aiSuggestions: (schoolId?: string | null) => createSchoolScopedQueryKey(['ai-suggestions'], schoolId),
  earlyWarning: (schoolId?: string | null) => createSchoolScopedQueryKey(['early-warning'], schoolId),
  riskAssessment: (schoolId?: string | null) => createSchoolScopedQueryKey(['risk-assessment'], schoolId),
  careerGuidance: (studentId: string, schoolId?: string | null) => createSchoolScopedQueryKey(['career-guidance', studentId], schoolId),
  holisticProfile: (studentId: string, schoolId?: string | null) => createSchoolScopedQueryKey(['holistic-profile', studentId], schoolId),
  standardizedProfile: (studentId: string, schoolId?: string | null) => createSchoolScopedQueryKey(['standardized-profile', studentId], schoolId),
  attendance: (schoolId?: string | null) => createSchoolScopedQueryKey(['attendance'], schoolId),
  behavior: (schoolId?: string | null) => createSchoolScopedQueryKey(['behavior'], schoolId),
  documents: (schoolId?: string | null) => createSchoolScopedQueryKey(['documents'], schoolId),
  classHours: (schoolId?: string | null) => createSchoolScopedQueryKey(['class-hours'], schoolId),
  guidanceStandards: (schoolId?: string | null) => createSchoolScopedQueryKey(['guidance-standards'], schoolId),
  subjects: (schoolId?: string | null) => createSchoolScopedQueryKey(['subjects'], schoolId),
  topics: (schoolId?: string | null) => createSchoolScopedQueryKey(['topics'], schoolId),
} as const;

export function invalidateSchoolQueries(queryClient: any, schoolId?: string | null): void {
  const effectiveSchoolId = schoolId ?? getSelectedSchoolId();
  
  if (effectiveSchoolId) {
    queryClient.invalidateQueries({
      predicate: (query: any) => {
        const key = query.queryKey;
        return Array.isArray(key) && key[0] === 'school' && key[1] === effectiveSchoolId;
      }
    });
  }
}

export function invalidateAllSchoolQueries(queryClient: any): void {
  queryClient.cancelQueries();
  
  queryClient.invalidateQueries({
    predicate: (query: any) => {
      const key = query.queryKey;
      return Array.isArray(key) && key[0] === 'school';
    }
  });
}

export function clearAllSchoolCaches(queryClient: any): void {
  queryClient.clear();
}
