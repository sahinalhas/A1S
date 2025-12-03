import { randomUUID } from 'crypto';
import * as strengthsRepo from '../repository/strengths.repository.js';
import * as interestsRepo from '../repository/interests.repository.js';
import * as futureVisionRepo from '../repository/future-vision.repository.js';
import * as selCompetenciesRepo from '../repository/sel-competencies.repository.js';
import * as socioeconomicRepo from '../repository/socioeconomic.repository.js';
import type {
  StudentStrength,
  StudentInterest,
  StudentFutureVision,
  StudentSELCompetency,
  StudentSocioeconomic
} from '../../../../shared/types.js';

// Strengths Services
export function getStudentStrengths(studentId: string) {
  return strengthsRepo.getStrengthsByStudent(studentId);
}

export function getLatestStudentStrength(studentId: string) {
  return strengthsRepo.getLatestStrengthByStudent(studentId);
}

export function createStrength(data: Omit<StudentStrength, 'id' | 'created_at' | 'updated_at'>) {
  const strength: StudentStrength = {
    id: randomUUID(),
    ...data,
    assessmentDate: data.assessmentDate || new Date().toISOString()
  };
  strengthsRepo.insertStrength(strength);
  return strength;
}

export function updateStrength(id: string, updates: Partial<StudentStrength>) {
  strengthsRepo.updateStrength(id, updates);
  return strengthsRepo.getStrengthById(id);
}

export function deleteStrength(id: string) {
  strengthsRepo.deleteStrength(id);
}

// Interests Services
export function getStudentInterests(studentId: string) {
  return interestsRepo.getInterestsByStudent(studentId);
}

export function getLatestStudentInterest(studentId: string) {
  return interestsRepo.getLatestInterestByStudent(studentId);
}

export function createInterest(data: Omit<StudentInterest, 'id' | 'created_at' | 'updated_at'>) {
  const interest: StudentInterest = {
    id: randomUUID(),
    ...data,
    assessmentDate: data.assessmentDate || new Date().toISOString()
  };
  interestsRepo.insertInterest(interest);
  return interest;
}

export function updateInterest(id: string, updates: Partial<StudentInterest>) {
  interestsRepo.updateInterest(id, updates);
  return interestsRepo.getInterestById(id);
}

export function deleteInterest(id: string) {
  interestsRepo.deleteInterest(id);
}

// Future Vision Services
export function getStudentFutureVision(studentId: string) {
  return futureVisionRepo.getFutureVisionByStudent(studentId);
}

export function getLatestStudentFutureVision(studentId: string) {
  return futureVisionRepo.getLatestFutureVisionByStudent(studentId);
}

export function createFutureVision(data: Omit<StudentFutureVision, 'id' | 'created_at' | 'updated_at'>) {
  const vision: StudentFutureVision = {
    id: randomUUID(),
    ...data,
    assessmentDate: data.assessmentDate || new Date().toISOString()
  };
  futureVisionRepo.insertFutureVision(vision);
  return vision;
}

export function updateFutureVision(id: string, updates: Partial<StudentFutureVision>) {
  futureVisionRepo.updateFutureVision(id, updates);
  return futureVisionRepo.getFutureVisionById(id);
}

export function deleteFutureVision(id: string) {
  futureVisionRepo.deleteFutureVision(id);
}

// SEL Competencies Services
export function getStudentSELCompetencies(studentId: string) {
  return selCompetenciesRepo.getSELCompetenciesByStudent(studentId);
}

export function getLatestStudentSELCompetency(studentId: string) {
  return selCompetenciesRepo.getLatestSELCompetencyByStudent(studentId);
}

export function createSELCompetency(data: Omit<StudentSELCompetency, 'id' | 'created_at' | 'updated_at'>) {
  const competency: StudentSELCompetency = {
    id: randomUUID(),
    ...data,
    assessmentDate: data.assessmentDate || new Date().toISOString()
  };
  selCompetenciesRepo.insertSELCompetency(competency);
  return competency;
}

export function updateSELCompetency(id: string, updates: Partial<StudentSELCompetency>) {
  selCompetenciesRepo.updateSELCompetency(id, updates);
  return selCompetenciesRepo.getSELCompetencyById(id);
}

export function deleteSELCompetency(id: string) {
  selCompetenciesRepo.deleteSELCompetency(id);
}

// Socioeconomic Services
export function getStudentSocioeconomic(studentId: string) {
  return socioeconomicRepo.getSocioeconomicByStudent(studentId);
}

export function getLatestStudentSocioeconomic(studentId: string) {
  return socioeconomicRepo.getLatestSocioeconomicByStudent(studentId);
}

export function createSocioeconomic(data: Omit<StudentSocioeconomic, 'id' | 'created_at' | 'updated_at'>) {
  const socioeconomic: StudentSocioeconomic = {
    id: randomUUID(),
    ...data,
    assessmentDate: data.assessmentDate || new Date().toISOString(),
    confidentialityLevel: data.confidentialityLevel || 'GİZLİ'
  };
  socioeconomicRepo.insertSocioeconomic(socioeconomic);
  return socioeconomic;
}

export function updateSocioeconomic(id: string, updates: Partial<StudentSocioeconomic>) {
  socioeconomicRepo.updateSocioeconomic(id, updates);
  return socioeconomicRepo.getSocioeconomicById(id);
}

export function deleteSocioeconomic(id: string) {
  socioeconomicRepo.deleteSocioeconomic(id);
}

// Combined service to get all holistic profile data for a student
export function getStudentHolisticProfile(studentId: string) {
  return {
    strengths: getLatestStudentStrength(studentId),
    interests: getLatestStudentInterest(studentId),
    futureVision: getLatestStudentFutureVision(studentId),
    selCompetencies: getLatestStudentSELCompetency(studentId),
    socioeconomic: getLatestStudentSocioeconomic(studentId)
  };
}
