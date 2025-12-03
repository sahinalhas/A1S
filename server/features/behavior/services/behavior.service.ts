import * as repository from '../repository/behavior.repository.js';
import type { BehaviorIncident, BehaviorStats } from '../types/behavior.types.js';

export function getBehaviorIncidentsByStudent(studentId: string): BehaviorIncident[] {
  return repository.getBehaviorIncidentsByStudent(studentId);
}

export function getBehaviorIncidentsByStudentAndSchool(studentId: string, schoolId: string): BehaviorIncident[] {
  return repository.getBehaviorIncidentsByStudentAndSchool(studentId, schoolId);
}

export function getBehaviorIncidentsByDateRange(
  studentId: string,
  startDate?: string,
  endDate?: string
): BehaviorIncident[] {
  return repository.getBehaviorIncidentsByDateRange(studentId, startDate, endDate);
}

export function getBehaviorStatsByStudent(studentId: string): BehaviorStats {
  return repository.getBehaviorStatsByStudent(studentId);
}

export function getBehaviorStatsByStudentAndSchool(studentId: string, schoolId: string): BehaviorStats {
  return repository.getBehaviorStatsByStudentAndSchool(studentId, schoolId);
}

export function addBehaviorIncident(incident: BehaviorIncident): { success: boolean } {
  repository.insertBehaviorIncident(incident);
  return { success: true };
}

export function addBehaviorIncidentWithSchoolCheck(incident: BehaviorIncident, schoolId: string): { success: boolean } {
  const result = repository.insertBehaviorIncidentWithSchoolCheck(incident, schoolId);
  return { success: result };
}

export function updateBehaviorIncident(id: string, updates: Partial<BehaviorIncident>): { success: boolean } {
  repository.updateBehaviorIncident(id, updates);
  return { success: true };
}

export function updateBehaviorIncidentBySchool(id: string, updates: Partial<BehaviorIncident>, schoolId: string): { success: boolean } {
  const result = repository.updateBehaviorIncidentBySchool(id, updates, schoolId);
  return { success: result };
}

export function deleteBehaviorIncident(id: string): { success: boolean } {
  repository.deleteBehaviorIncident(id);
  return { success: true };
}

export function deleteBehaviorIncidentBySchool(id: string, schoolId: string): { success: boolean } {
  const result = repository.deleteBehaviorIncidentBySchool(id, schoolId);
  return { success: result };
}

export function studentBelongsToSchool(studentId: string, schoolId: string): boolean {
  return repository.studentBelongsToSchool(studentId, schoolId);
}
