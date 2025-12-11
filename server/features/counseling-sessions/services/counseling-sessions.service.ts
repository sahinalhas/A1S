import * as repository from '../repository/counseling-sessions.repository.js';
import { sanitizeString } from '../../../middleware/validation.js';
import type { CounselingSession, CounselingSessionWithStudents, ClassHour, CounselingTopic, SessionFilters } from '../types/counseling-sessions.types.js';
import { getIndividualTopicsFlat } from '../../guidance-standards/services/guidance-standards.service.js';

function safeParseJSON<T = unknown>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return fallback;
  }
}

/**
 * Normalizes session data for client by converting snake_case DB fields to camelCase.
 */
function normalizeSession(session: CounselingSession): CounselingSession & {
  mebbisTransferred?: boolean;
  mebbisTransferDate?: string;
  mebbisTransferError?: string;
  mebbisRetryCount?: number;
} {
  return {
    ...session,
    mebbisTransferred: session.mebbis_transferred === 1,
    mebbisTransferDate: session.mebbis_transfer_date || undefined,
    mebbisTransferError: session.mebbis_transfer_error || undefined,
    mebbisRetryCount: session.mebbis_retry_count || 0,
  };
}

/**
 * @deprecated Bu fonksiyon schoolId filtresi kullanmıyor ve veri sızıntısına yol açabilir.
 * Bunun yerine getSessionsBySchoolWithStudents(schoolId) kullanın.
 * Bu fonksiyon KALDIRILACAKTIR - lütfen kullanmayın!
 */
export function getAllSessionsWithStudents(): CounselingSessionWithStudents[] {
  console.warn('[SECURITY WARNING] getAllSessionsWithStudents() is deprecated and insecure. Use getSessionsBySchoolWithStudents(schoolId) instead.');
  throw new Error('getAllSessionsWithStudents() is deprecated for security reasons. Use getSessionsBySchoolWithStudents(schoolId) instead.');
}

export function getSessionsBySchoolWithStudents(schoolId: string): CounselingSessionWithStudents[] {
  const sessions = repository.getSessionsBySchool(schoolId);

  return sessions.map((session) => {
    const parsedTags = safeParseJSON<string[]>(session.sessionTags, []);
    const normalized = normalizeSession(session);
    if (session.sessionType === 'group') {
      const students = repository.getStudentsBySessionId(session.id);
      return { ...normalized, sessionTags: parsedTags, students };
    } else {
      const student = repository.getStudentBySessionId(session.id);
      return { ...normalized, sessionTags: parsedTags, student };
    }
  });
}

/**
 * @deprecated Bu fonksiyon schoolId filtresi kullanmıyor ve veri sızıntısına yol açabilir.
 * Bunun yerine getActiveSessionsBySchoolWithStudents(schoolId) kullanın.
 */
export function getActiveSessionsWithStudents(): CounselingSessionWithStudents[] {
  console.warn('[SECURITY WARNING] getActiveSessionsWithStudents() is deprecated. Use getActiveSessionsBySchoolWithStudents(schoolId) instead.');
  throw new Error('getActiveSessionsWithStudents() is deprecated for security reasons. Use getActiveSessionsBySchoolWithStudents(schoolId) instead.');
}

export function getActiveSessionsBySchoolWithStudents(schoolId: string): CounselingSessionWithStudents[] {
  const sessions = repository.getActiveSessionsBySchool(schoolId);

  return sessions.map((session) => {
    const parsedTags = safeParseJSON<string[]>(session.sessionTags, []);
    const normalized = normalizeSession(session);
    if (session.sessionType === 'group') {
      const students = repository.getStudentsBySessionId(session.id);
      return { ...normalized, sessionTags: parsedTags, students };
    } else {
      const student = repository.getStudentBySessionId(session.id);
      return { ...normalized, sessionTags: parsedTags, student };
    }
  });
}

export function getSessionByIdWithStudents(id: string): CounselingSessionWithStudents | null {
  const sanitizedId = sanitizeString(id);
  const session = repository.getSessionById(sanitizedId);

  if (!session) return null;

  const parsedTags = safeParseJSON(session.sessionTags, []);
  if (session.sessionType === 'group') {
    const students = repository.getStudentsBySessionId(sanitizedId);
    return { ...session, sessionTags: parsedTags, students };
  } else {
    const student = repository.getStudentBySessionId(sanitizedId);
    return { ...session, sessionTags: parsedTags, student };
  }
}

export function getSessionByIdAndSchoolWithStudents(id: string, schoolId: string): CounselingSessionWithStudents | null {
  const sanitizedId = sanitizeString(id);
  const session = repository.getSessionByIdAndSchool(sanitizedId, schoolId);

  if (!session) return null;

  const parsedTags = safeParseJSON(session.sessionTags, []);
  const normalized = normalizeSession(session);
  if (session.sessionType === 'group') {
    const students = repository.getStudentsBySessionId(sanitizedId);
    return { ...normalized, sessionTags: parsedTags, students };
  } else {
    const student = repository.getStudentBySessionId(sanitizedId);
    return { ...normalized, sessionTags: parsedTags, student };
  }
}

export function createCounselingSession(data: Omit<CounselingSession, 'groupName' | 'relationshipType' | 'otherParticipants' | 'parentName' | 'parentRelationship' | 'teacherName' | 'teacherBranch' | 'otherParticipantDescription' | 'disciplineStatus' | 'institutionalCooperation' | 'sessionDetails' | 'topic' | 'completed'> & { groupName?: string; relationshipType?: string; otherParticipants?: string; parentName?: string; parentRelationship?: string; teacherName?: string; teacherBranch?: string; otherParticipantDescription?: string; disciplineStatus?: string; institutionalCooperation?: string; sessionDetails?: string; studentIds: string[]; schoolId?: string }): { success: boolean; id: string } {
  if (!data.schoolId) {
    throw new Error('schoolId is required for createCounselingSession');
  }

  const session: CounselingSession = {
    id: data.id,
    sessionType: data.sessionType,
    groupName: data.groupName ? sanitizeString(data.groupName) : undefined,
    counselorId: sanitizeString(data.counselorId),
    schoolId: data.schoolId,
    sessionDate: data.sessionDate,
    entryTime: data.entryTime,
    entryClassHourId: data.entryClassHourId,
    participantType: data.participantType || 'öğrenci',
    relationshipType: data.relationshipType ? sanitizeString(data.relationshipType) : undefined,
    otherParticipants: data.otherParticipants ? sanitizeString(data.otherParticipants) : undefined,
    parentName: data.parentName ? sanitizeString(data.parentName) : undefined,
    parentRelationship: data.parentRelationship ? sanitizeString(data.parentRelationship) : undefined,
    teacherName: data.teacherName ? sanitizeString(data.teacherName) : undefined,
    teacherBranch: data.teacherBranch ? sanitizeString(data.teacherBranch) : undefined,
    otherParticipantDescription: data.otherParticipantDescription ? sanitizeString(data.otherParticipantDescription) : undefined,
    sessionMode: data.sessionMode,
    sessionLocation: data.sessionLocation,
    disciplineStatus: data.disciplineStatus ? sanitizeString(data.disciplineStatus) : undefined,
    institutionalCooperation: data.institutionalCooperation ? sanitizeString(data.institutionalCooperation) : undefined,
    sessionDetails: data.sessionDetails ? sanitizeString(data.sessionDetails) : undefined,
    drpHizmetAlaniId: data.drpHizmetAlaniId,
    drpBirId: data.drpBirId,
    drpIkiId: data.drpIkiId,
    drpUcId: data.drpUcId,
    completed: 0
  };

  const sanitizedStudentIds = data.studentIds.map((id: string) => sanitizeString(id));

  repository.createSession(session, sanitizedStudentIds);
  return { success: true, id: session.id };
}

export function completeCounselingSession(
  id: string,
  completionData: {
    topic: string;
    exitTime: string;
    exitClassHourId: number | null;
    detailedNotes: string | null;
    sessionFlow?: string;
    studentParticipationLevel?: string;
    cooperationLevel?: number;
    emotionalState?: string;
    physicalState?: string;
    communicationQuality?: string;
    sessionTags?: string[];
    achievedOutcomes?: string;
    followUpNeeded?: boolean;
    followUpPlan?: string;
    actionItems?: unknown[];
    autoCompleted?: boolean;
    drpHizmetAlaniId?: number | null;
    drpBirId?: number | null;
    drpIkiId?: number | null;
    drpUcId?: number | null;
  }
): { success: boolean; notFound?: boolean } {
  console.warn('[DEPRECATED] completeCounselingSession() called without schoolId. Use completeCounselingSessionBySchool() instead.');
  const sanitizedId = sanitizeString(id);
  const sanitizedTopic = sanitizeString(completionData.topic);
  const sanitizedNotes = completionData.detailedNotes ? sanitizeString(completionData.detailedNotes) : null;
  const sanitizedOutcomes = completionData.achievedOutcomes ? sanitizeString(completionData.achievedOutcomes) : null;
  const sanitizedFollowUpPlan = completionData.followUpPlan ? sanitizeString(completionData.followUpPlan) : null;

  const sessionTags = completionData.sessionTags ? JSON.stringify(completionData.sessionTags) : null;
  const actionItems = completionData.actionItems ? JSON.stringify(completionData.actionItems) : null;

  const result = repository.completeSession(
    sanitizedId,
    sanitizedTopic,
    completionData.exitTime,
    completionData.exitClassHourId,
    sanitizedNotes,
    completionData.autoCompleted || false,
    completionData.sessionFlow,
    completionData.studentParticipationLevel,
    completionData.cooperationLevel,
    completionData.emotionalState,
    completionData.physicalState,
    completionData.communicationQuality,
    sessionTags,
    sanitizedOutcomes,
    completionData.followUpNeeded ? 1 : 0,
    sanitizedFollowUpPlan,
    actionItems,
    completionData.drpHizmetAlaniId || null,
    completionData.drpBirId || null,
    completionData.drpIkiId || null,
    completionData.drpUcId || null
  );

  if (result.changes === 0) {
    return { success: false, notFound: true };
  }

  return { success: true };
}

export function completeCounselingSessionBySchool(
  id: string,
  schoolId: string,
  completionData: {
    topic: string;
    exitTime: string;
    exitClassHourId: number | null;
    detailedNotes: string | null;
    sessionFlow?: string;
    studentParticipationLevel?: string;
    cooperationLevel?: number;
    emotionalState?: string;
    physicalState?: string;
    communicationQuality?: string;
    sessionTags?: string[];
    achievedOutcomes?: string;
    followUpNeeded?: boolean;
    followUpPlan?: string;
    actionItems?: unknown[];
    autoCompleted?: boolean;
    drpHizmetAlaniId?: number | null;
    drpBirId?: number | null;
    drpIkiId?: number | null;
    drpUcId?: number | null;
  }
): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  const sanitizedTopic = sanitizeString(completionData.topic);
  const sanitizedNotes = completionData.detailedNotes ? sanitizeString(completionData.detailedNotes) : null;
  const sanitizedOutcomes = completionData.achievedOutcomes ? sanitizeString(completionData.achievedOutcomes) : null;
  const sanitizedFollowUpPlan = completionData.followUpPlan ? sanitizeString(completionData.followUpPlan) : null;

  const sessionTags = completionData.sessionTags ? JSON.stringify(completionData.sessionTags) : null;
  const actionItems = completionData.actionItems ? JSON.stringify(completionData.actionItems) : null;

  const result = repository.completeSessionBySchool(
    sanitizedId,
    schoolId,
    sanitizedTopic,
    completionData.exitTime,
    completionData.exitClassHourId,
    sanitizedNotes,
    completionData.autoCompleted || false,
    completionData.sessionFlow,
    completionData.studentParticipationLevel,
    completionData.cooperationLevel,
    completionData.emotionalState,
    completionData.physicalState,
    completionData.communicationQuality,
    sessionTags,
    sanitizedOutcomes,
    completionData.followUpNeeded ? 1 : 0,
    sanitizedFollowUpPlan,
    actionItems,
    completionData.drpHizmetAlaniId || null,
    completionData.drpBirId || null,
    completionData.drpIkiId || null,
    completionData.drpUcId || null
  );

  if (result.changes === 0) {
    return { success: false, notFound: true };
  }

  return { success: true };
}

export function extendCounselingSession(id: string): { success: boolean; notFound?: boolean } {
  console.warn('[DEPRECATED] extendCounselingSession() called without schoolId. Use extendCounselingSessionBySchool() instead.');
  const sanitizedId = sanitizeString(id);
  const result = repository.extendSession(sanitizedId);

  if (result.changes === 0) {
    return { success: false, notFound: true };
  }

  return { success: true };
}

export function extendCounselingSessionBySchool(id: string, schoolId: string): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  const result = repository.extendSessionBySchool(sanitizedId, schoolId);

  if (result.changes === 0) {
    return { success: false, notFound: true };
  }

  return { success: true };
}

export function autoCompleteSessions(): { success: boolean; completedCount: number } {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);

  const sessionsToComplete = repository.getSessionsToAutoComplete();
  const completedCount = sessionsToComplete.length;

  if (completedCount > 0) {
    console.log(`⏰ Auto-completing ${completedCount} session(s) that exceeded time limit...`);
    for (const session of sessionsToComplete) {
      try {
        repository.autoCompleteSession(session.id, currentTime);
        console.log(`✅ Auto-completed session: ${session.id}`);
      } catch (error) {
        console.error(`❌ Failed to auto-complete session ${session.id}:`, error);
      }
    }
  }

  return { success: true, completedCount };
}

export function autoCompleteSessionsBySchool(schoolId: string): { success: boolean; completedCount: number } {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);

  const sessionsToComplete = repository.getSessionsToAutoCompleteBySchool(schoolId);
  const completedCount = sessionsToComplete.length;

  if (completedCount > 0) {
    console.log(`⏰ Auto-completing ${completedCount} session(s) for school ${schoolId} that exceeded time limit...`);
    for (const session of sessionsToComplete) {
      try {
        repository.autoCompleteSession(session.id, currentTime);
        console.log(`✅ Auto-completed session: ${session.id}`);
      } catch (error) {
        console.error(`❌ Failed to auto-complete session ${session.id}:`, error);
      }
    }
  }

  return { success: true, completedCount };
}

export function deleteCounselingSession(id: string): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  const result = repository.deleteSession(sanitizedId);

  if (result.changes === 0) {
    return { success: false, notFound: true };
  }

  return { success: true };
}

export function deleteCounselingSessionBySchool(id: string, schoolId: string): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  const result = repository.deleteSessionBySchool(sanitizedId, schoolId);

  if (result.changes === 0) {
    return { success: false, notFound: true };
  }

  return { success: true };
}

export function getClassHours(): ClassHour[] {
  const settingsRow = repository.getAppSettings();

  if (!settingsRow || !settingsRow.settings) {
    return [];
  }

  const settings = JSON.parse(settingsRow.settings);
  const periods = settings?.school?.periods || [];

  return periods.map((period: { start: string; end: string }, index: number) => ({
    id: index + 1,
    name: `${index + 1}. Ders`,
    startTime: period.start,
    endTime: period.end
  }));
}

export function getCounselingTopics(): CounselingTopic[] {
  return getIndividualTopicsFlat();
}

export function getStudentSessionStats(studentId: string): unknown {
  const sanitizedStudentId = sanitizeString(studentId);
  const rawHistory = repository.getStudentSessionHistory(sanitizedStudentId);

  const allTopics = getIndividualTopicsFlat();
  const topicMap = new Map(allTopics.map(t => [t.id, t.title]));

  return {
    sessionCount: rawHistory.sessionCount,
    lastSessionDate: rawHistory.lastSessionDate,
    topics: rawHistory.topics.map(topicId => topicMap.get(topicId) || topicId),
    history: rawHistory.history.map(session => ({
      ...session,
      topic: topicMap.get(session.topic) || session.topic
    }))
  };
}

export function getFilteredSessionsWithStudents(filters: Partial<SessionFilters>): CounselingSessionWithStudents[] {
  const sanitizedFilters: SessionFilters = {};

  if (filters.startDate && typeof filters.startDate === 'string' && filters.startDate.trim() !== '') {
    sanitizedFilters.startDate = sanitizeString(filters.startDate);
  }

  if (filters.endDate && typeof filters.endDate === 'string' && filters.endDate.trim() !== '') {
    sanitizedFilters.endDate = sanitizeString(filters.endDate);
  }

  if (filters.topic && typeof filters.topic === 'string' && filters.topic.trim() !== '') {
    sanitizedFilters.topic = sanitizeString(filters.topic);
  }

  if (filters.className && typeof filters.className === 'string' && filters.className.trim() !== '') {
    sanitizedFilters.className = sanitizeString(filters.className);
  }

  if (filters.status && (filters.status === 'completed' || filters.status === 'active' || filters.status === 'all')) {
    sanitizedFilters.status = filters.status;
  }

  if (filters.participantType && typeof filters.participantType === 'string' && filters.participantType.trim() !== '') {
    sanitizedFilters.participantType = sanitizeString(filters.participantType);
  }

  if (filters.sessionType && (filters.sessionType === 'individual' || filters.sessionType === 'group' || filters.sessionType === 'all')) {
    sanitizedFilters.sessionType = filters.sessionType;
  }

  if (filters.sessionMode && typeof filters.sessionMode === 'string' && filters.sessionMode.trim() !== '') {
    sanitizedFilters.sessionMode = sanitizeString(filters.sessionMode);
  }

  if (filters.studentId && typeof filters.studentId === 'string' && filters.studentId.trim() !== '') {
    sanitizedFilters.studentId = sanitizeString(filters.studentId);
  }

  const sessions = repository.getFilteredSessions(sanitizedFilters);

  return sessions.map((session) => {
    const parsedTags = safeParseJSON<string[]>(session.sessionTags, []);
    if (session.sessionType === 'group') {
      const students = repository.getStudentsBySessionId(session.id);
      return { ...session, sessionTags: parsedTags, students };
    } else {
      const student = repository.getStudentBySessionId(session.id);
      return { ...session, sessionTags: parsedTags, student };
    }
  });
}

export function getFilteredSessionsBySchoolWithStudents(schoolId: string, filters: Partial<SessionFilters>): CounselingSessionWithStudents[] {
  const sanitizedFilters: SessionFilters = {};

  if (filters.startDate && typeof filters.startDate === 'string' && filters.startDate.trim() !== '') {
    sanitizedFilters.startDate = sanitizeString(filters.startDate);
  }

  if (filters.endDate && typeof filters.endDate === 'string' && filters.endDate.trim() !== '') {
    sanitizedFilters.endDate = sanitizeString(filters.endDate);
  }

  if (filters.topic && typeof filters.topic === 'string' && filters.topic.trim() !== '') {
    sanitizedFilters.topic = sanitizeString(filters.topic);
  }

  if (filters.className && typeof filters.className === 'string' && filters.className.trim() !== '') {
    sanitizedFilters.className = sanitizeString(filters.className);
  }

  if (filters.status && (filters.status === 'completed' || filters.status === 'active' || filters.status === 'all')) {
    sanitizedFilters.status = filters.status;
  }

  if (filters.participantType && typeof filters.participantType === 'string' && filters.participantType.trim() !== '') {
    sanitizedFilters.participantType = sanitizeString(filters.participantType);
  }

  if (filters.sessionType && (filters.sessionType === 'individual' || filters.sessionType === 'group' || filters.sessionType === 'all')) {
    sanitizedFilters.sessionType = filters.sessionType;
  }

  if (filters.sessionMode && typeof filters.sessionMode === 'string' && filters.sessionMode.trim() !== '') {
    sanitizedFilters.sessionMode = sanitizeString(filters.sessionMode);
  }

  if (filters.studentId && typeof filters.studentId === 'string' && filters.studentId.trim() !== '') {
    sanitizedFilters.studentId = sanitizeString(filters.studentId);
  }

  const sessions = repository.getFilteredSessionsBySchool(schoolId, sanitizedFilters);

  return sessions.map((session) => {
    const parsedTags = safeParseJSON<string[]>(session.sessionTags, []);
    if (session.sessionType === 'group') {
      const students = repository.getStudentsBySessionId(session.id);
      return { ...session, sessionTags: parsedTags, students };
    } else {
      const student = repository.getStudentBySessionId(session.id);
      return { ...session, sessionTags: parsedTags, student };
    }
  });
}
