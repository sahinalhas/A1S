import * as repository from '../repository/analytics.repository.js';
import { sanitizeString } from '../../../middleware/validation.js';
import type {
  OverallStats,
  TimeSeriesData,
  TopicAnalysis,
  ParticipantAnalysis,
  ClassAnalysis,
  SessionModeAnalysis,
  StudentSessionStats
} from '../types/counseling-sessions.types.js';

export function getOverallStats(): OverallStats {
  return repository.getOverallStats();
}

export function getSessionsByTimePeriod(
  period: 'daily' | 'weekly' | 'monthly',
  startDate: string,
  endDate: string
): TimeSeriesData[] {
  const sanitizedStartDate = sanitizeString(startDate);
  const sanitizedEndDate = sanitizeString(endDate);
  
  return repository.getTimeSeriesData(period, sanitizedStartDate, sanitizedEndDate);
}

export function getTopicAnalysis(): TopicAnalysis[] {
  return repository.getTopicAnalysis();
}

export function getParticipantTypeAnalysis(): ParticipantAnalysis[] {
  return repository.getParticipantTypeAnalysis();
}

export function getClassAnalysis(): ClassAnalysis[] {
  return repository.getClassAnalysis();
}

export function getSessionModeAnalysis(): SessionModeAnalysis[] {
  return repository.getSessionModeAnalysis();
}

export function getStudentSessionStats(studentId: string): StudentSessionStats {
  const sanitizedStudentId = sanitizeString(studentId);
  return repository.getStudentSessionStats(sanitizedStudentId);
}
