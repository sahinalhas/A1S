import * as repository from '../repository/exams.repository.js';
import { sanitizeString } from '../../../middleware/validation.js';
import type { ExamResult, ExamProgressData } from '../types/exams.types.js';
import { getStudentByIdAndSchool } from '../../students/repository/students.repository.js';

function validateStudentBelongsToSchool(studentId: string, schoolId: string): boolean {
  const student = getStudentByIdAndSchool(studentId, schoolId);
  return student !== null;
}

export function getStudentExamResults(studentId: string, schoolId: string): unknown[] {
  const sanitizedId = sanitizeString(studentId);
  
  return repository.getExamResultsByStudentAndSchool(sanitizedId, schoolId);
}

export function getStudentExamResultsByType(studentId: string, examType: string, schoolId: string): unknown[] {
  const sanitizedId = sanitizeString(studentId);
  const sanitizedType = sanitizeString(examType);
  
  return repository.getExamResultsByTypeAndSchool(sanitizedId, sanitizedType, schoolId);
}

export function getStudentLatestExamResult(studentId: string, schoolId: string, examType?: string): any | null {
  const sanitizedId = sanitizeString(studentId);
  const sanitizedType = examType ? sanitizeString(examType) : undefined;
  
  return repository.getLatestExamResultBySchool(sanitizedId, schoolId, sanitizedType);
}

export function getStudentExamProgress(studentId: string, examType: string, schoolId: string): ExamProgressData[] {
  const sanitizedId = sanitizeString(studentId);
  const sanitizedType = sanitizeString(examType);
  
  return repository.getExamProgressAnalysisBySchool(sanitizedId, sanitizedType, schoolId);
}

export function createExamResult(data: any, schoolId: string): { success: boolean; id: string } {
  const sanitizedStudentId = sanitizeString(data.studentId);
  
  if (!validateStudentBelongsToSchool(sanitizedStudentId, schoolId)) {
    throw new Error('Student not found or does not belong to this school');
  }
  
  const result: ExamResult = {
    id: data.id,
    studentId: sanitizedStudentId,
    examType: sanitizeString(data.examType),
    examName: sanitizeString(data.examName),
    examDate: data.examDate,
    examProvider: data.examProvider ? sanitizeString(data.examProvider) : undefined,
    totalScore: data.totalScore,
    percentileRank: data.percentileRank,
    turkishScore: data.turkishScore,
    mathScore: data.mathScore,
    scienceScore: data.scienceScore,
    socialScore: data.socialScore,
    foreignLanguageScore: data.foreignLanguageScore,
    turkishNet: data.turkishNet,
    mathNet: data.mathNet,
    scienceNet: data.scienceNet,
    socialNet: data.socialNet,
    foreignLanguageNet: data.foreignLanguageNet,
    totalNet: data.totalNet,
    correctAnswers: data.correctAnswers,
    wrongAnswers: data.wrongAnswers,
    emptyAnswers: data.emptyAnswers,
    totalQuestions: data.totalQuestions,
    subjectBreakdown: data.subjectBreakdown,
    topicAnalysis: data.topicAnalysis,
    strengthAreas: data.strengthAreas,
    weaknessAreas: data.weaknessAreas,
    improvementSuggestions: data.improvementSuggestions ? sanitizeString(data.improvementSuggestions) : undefined,
    comparedToGoal: data.comparedToGoal,
    comparedToPrevious: data.comparedToPrevious,
    comparedToClassAverage: data.comparedToClassAverage,
    schoolRank: data.schoolRank,
    classRank: data.classRank,
    isOfficial: data.isOfficial,
    certificateUrl: data.certificateUrl ? sanitizeString(data.certificateUrl) : undefined,
    answerKeyUrl: data.answerKeyUrl ? sanitizeString(data.answerKeyUrl) : undefined,
    detailedReportUrl: data.detailedReportUrl ? sanitizeString(data.detailedReportUrl) : undefined,
    goalsMet: data.goalsMet,
    parentNotified: data.parentNotified,
    counselorNotes: data.counselorNotes ? sanitizeString(data.counselorNotes) : undefined,
    actionPlan: data.actionPlan ? sanitizeString(data.actionPlan) : undefined,
    notes: data.notes ? sanitizeString(data.notes) : undefined
  };
  
  repository.insertExamResult(result);
  return { success: true, id: result.id };
}

export function updateExamResult(id: string, updates: any, schoolId: string): { success: boolean } {
  if (updates.studentId) {
    const sanitizedStudentId = sanitizeString(updates.studentId);
    if (!validateStudentBelongsToSchool(sanitizedStudentId, schoolId)) {
      throw new Error('Student not found or does not belong to this school');
    }
  }
  
  const sanitizedUpdates: any = {};
  
  if (updates.examType) sanitizedUpdates.examType = sanitizeString(updates.examType);
  if (updates.examName) sanitizedUpdates.examName = sanitizeString(updates.examName);
  if (updates.examDate) sanitizedUpdates.examDate = updates.examDate;
  if (updates.examProvider) sanitizedUpdates.examProvider = sanitizeString(updates.examProvider);
  if (updates.improvementSuggestions) sanitizedUpdates.improvementSuggestions = sanitizeString(updates.improvementSuggestions);
  if (updates.certificateUrl) sanitizedUpdates.certificateUrl = sanitizeString(updates.certificateUrl);
  if (updates.answerKeyUrl) sanitizedUpdates.answerKeyUrl = sanitizeString(updates.answerKeyUrl);
  if (updates.detailedReportUrl) sanitizedUpdates.detailedReportUrl = sanitizeString(updates.detailedReportUrl);
  if (updates.counselorNotes) sanitizedUpdates.counselorNotes = sanitizeString(updates.counselorNotes);
  if (updates.actionPlan) sanitizedUpdates.actionPlan = sanitizeString(updates.actionPlan);
  if (updates.notes) sanitizedUpdates.notes = sanitizeString(updates.notes);
  
  if (updates.totalScore !== undefined) sanitizedUpdates.totalScore = updates.totalScore;
  if (updates.percentileRank !== undefined) sanitizedUpdates.percentileRank = updates.percentileRank;
  if (updates.turkishScore !== undefined) sanitizedUpdates.turkishScore = updates.turkishScore;
  if (updates.mathScore !== undefined) sanitizedUpdates.mathScore = updates.mathScore;
  if (updates.scienceScore !== undefined) sanitizedUpdates.scienceScore = updates.scienceScore;
  if (updates.socialScore !== undefined) sanitizedUpdates.socialScore = updates.socialScore;
  if (updates.foreignLanguageScore !== undefined) sanitizedUpdates.foreignLanguageScore = updates.foreignLanguageScore;
  if (updates.turkishNet !== undefined) sanitizedUpdates.turkishNet = updates.turkishNet;
  if (updates.mathNet !== undefined) sanitizedUpdates.mathNet = updates.mathNet;
  if (updates.scienceNet !== undefined) sanitizedUpdates.scienceNet = updates.scienceNet;
  if (updates.socialNet !== undefined) sanitizedUpdates.socialNet = updates.socialNet;
  if (updates.foreignLanguageNet !== undefined) sanitizedUpdates.foreignLanguageNet = updates.foreignLanguageNet;
  if (updates.totalNet !== undefined) sanitizedUpdates.totalNet = updates.totalNet;
  if (updates.correctAnswers !== undefined) sanitizedUpdates.correctAnswers = updates.correctAnswers;
  if (updates.wrongAnswers !== undefined) sanitizedUpdates.wrongAnswers = updates.wrongAnswers;
  if (updates.emptyAnswers !== undefined) sanitizedUpdates.emptyAnswers = updates.emptyAnswers;
  if (updates.totalQuestions !== undefined) sanitizedUpdates.totalQuestions = updates.totalQuestions;
  if (updates.subjectBreakdown) sanitizedUpdates.subjectBreakdown = updates.subjectBreakdown;
  if (updates.topicAnalysis) sanitizedUpdates.topicAnalysis = updates.topicAnalysis;
  if (updates.strengthAreas) sanitizedUpdates.strengthAreas = updates.strengthAreas;
  if (updates.weaknessAreas) sanitizedUpdates.weaknessAreas = updates.weaknessAreas;
  if (updates.comparedToGoal !== undefined) sanitizedUpdates.comparedToGoal = updates.comparedToGoal;
  if (updates.comparedToPrevious !== undefined) sanitizedUpdates.comparedToPrevious = updates.comparedToPrevious;
  if (updates.comparedToClassAverage !== undefined) sanitizedUpdates.comparedToClassAverage = updates.comparedToClassAverage;
  if (updates.schoolRank !== undefined) sanitizedUpdates.schoolRank = updates.schoolRank;
  if (updates.classRank !== undefined) sanitizedUpdates.classRank = updates.classRank;
  if (updates.isOfficial !== undefined) sanitizedUpdates.isOfficial = updates.isOfficial;
  if (updates.goalsMet !== undefined) sanitizedUpdates.goalsMet = updates.goalsMet;
  if (updates.parentNotified !== undefined) sanitizedUpdates.parentNotified = updates.parentNotified;
  
  repository.updateExamResultBySchool(id, sanitizedUpdates, schoolId);
  return { success: true };
}

export function deleteExamResult(id: string, schoolId: string): { success: boolean } {
  repository.deleteExamResultBySchool(id, schoolId);
  return { success: true };
}
