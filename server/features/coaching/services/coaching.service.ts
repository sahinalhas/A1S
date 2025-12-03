import * as repository from '../repository/coaching.repository.js';
import { sanitizeString } from '../../../middleware/validation.js';
import type {
  AcademicGoal,
  MultipleIntelligence,
  LearningStyle,
  SmartGoal,
  CoachingRecommendation,
  Evaluation360,
  Achievement,
  SelfAssessment,
  ParentMeeting,
  HomeVisit,
  FamilyParticipation
} from '../types/coaching.types.js';

export function getAllAcademicGoals(): AcademicGoal[] {
  return repository.getAllAcademicGoals();
}

export function getStudentAcademicGoals(studentId: string): AcademicGoal[] {
  const sanitizedId = sanitizeString(studentId);
  return repository.getAcademicGoalsByStudent(sanitizedId);
}

export function createAcademicGoal(data: Omit<AcademicGoal, 'description' | 'examType'> & { description?: string; examType?: string }): { success: boolean; id: string } {
  const goal: AcademicGoal = {
    id: data.id,
    studentId: sanitizeString(data.studentId),
    title: sanitizeString(data.title),
    description: data.description ? sanitizeString(data.description) : undefined,
    targetScore: data.targetScore,
    currentScore: data.currentScore,
    examType: data.examType ? sanitizeString(data.examType) : undefined,
    deadline: data.deadline,
    status: data.status
  };
  
  repository.insertAcademicGoal(goal);
  return { success: true, id: goal.id };
}

export function updateAcademicGoal(id: string, updates: Partial<AcademicGoal>): { success: boolean } {
  const sanitizedUpdates: Partial<AcademicGoal> = {};
  
  if (updates.title) sanitizedUpdates.title = sanitizeString(updates.title);
  if (updates.description) sanitizedUpdates.description = sanitizeString(updates.description);
  if (updates.examType) sanitizedUpdates.examType = sanitizeString(updates.examType);
  if (updates.targetScore !== undefined) sanitizedUpdates.targetScore = updates.targetScore;
  if (updates.currentScore !== undefined) sanitizedUpdates.currentScore = updates.currentScore;
  if (updates.deadline) sanitizedUpdates.deadline = updates.deadline;
  if (updates.status) sanitizedUpdates.status = updates.status;
  
  repository.updateAcademicGoal(id, sanitizedUpdates);
  return { success: true };
}

export function deleteAcademicGoal(id: string): { success: boolean } {
  repository.deleteAcademicGoal(id);
  return { success: true };
}

export function getStudentMultipleIntelligence(studentId: string): MultipleIntelligence[] {
  const sanitizedId = sanitizeString(studentId);
  return repository.getMultipleIntelligenceByStudent(sanitizedId);
}

export function createMultipleIntelligence(data: Omit<MultipleIntelligence, 'notes'> & { notes?: string }): { success: boolean; id: string } {
  const record: MultipleIntelligence = {
    id: data.id,
    studentId: sanitizeString(data.studentId),
    assessmentDate: data.assessmentDate,
    linguisticVerbal: data.linguisticVerbal,
    logicalMathematical: data.logicalMathematical,
    visualSpatial: data.visualSpatial,
    bodilyKinesthetic: data.bodilyKinesthetic,
    musicalRhythmic: data.musicalRhythmic,
    interpersonal: data.interpersonal,
    intrapersonal: data.intrapersonal,
    naturalistic: data.naturalistic,
    notes: data.notes ? sanitizeString(data.notes) : undefined
  };
  
  repository.insertMultipleIntelligence(record);
  return { success: true, id: record.id };
}

export function getStudentLearningStyles(studentId: string): LearningStyle[] {
  const sanitizedId = sanitizeString(studentId);
  return repository.getLearningStylesByStudent(sanitizedId);
}

export function createLearningStyle(data: Omit<LearningStyle, 'notes'> & { notes?: string }): { success: boolean; id: string } {
  const record: LearningStyle = {
    id: data.id,
    studentId: sanitizeString(data.studentId),
    assessmentDate: data.assessmentDate,
    visual: data.visual,
    auditory: data.auditory,
    kinesthetic: data.kinesthetic,
    reading: data.reading,
    notes: data.notes ? sanitizeString(data.notes) : undefined
  };
  
  repository.insertLearningStyle(record);
  return { success: true, id: record.id };
}

export function getStudentSmartGoals(studentId: string): SmartGoal[] {
  const sanitizedId = sanitizeString(studentId);
  return repository.getSmartGoalsByStudent(sanitizedId);
}

export function createSmartGoal(data: Omit<SmartGoal, 'specific' | 'measurable' | 'achievable' | 'relevant' | 'timeBound' | 'category' | 'deadline' | 'progress' | 'notes'> & { title: string; specific?: string; measurable?: string; achievable?: string; relevant?: string; timeBound?: string; category?: string; deadline?: string; progress?: number; notes?: string }): { success: boolean; id: string } {
  const goal: SmartGoal = {
    id: data.id,
    studentId: sanitizeString(data.studentId),
    title: sanitizeString(data.title),
    specific: data.specific ? sanitizeString(data.specific) : undefined,
    measurable: data.measurable ? sanitizeString(data.measurable) : undefined,
    achievable: data.achievable ? sanitizeString(data.achievable) : undefined,
    relevant: data.relevant ? sanitizeString(data.relevant) : undefined,
    timeBound: data.timeBound ? sanitizeString(data.timeBound) : undefined,
    category: data.category ? sanitizeString(data.category) : undefined,
    status: data.status || 'active',
    progress: data.progress || 0,
    startDate: data.startDate,
    targetDate: data.targetDate,
    notes: data.notes ? sanitizeString(data.notes) : undefined
  };
  
  repository.insertSmartGoal(goal);
  return { success: true, id: goal.id };
}

export function updateSmartGoal(id: string, updates: Partial<SmartGoal>): { success: boolean } {
  const sanitizedUpdates: Partial<SmartGoal> = {};
  
  if (updates.title) sanitizedUpdates.title = sanitizeString(updates.title);
  if (updates.specific) sanitizedUpdates.specific = sanitizeString(updates.specific);
  if (updates.measurable) sanitizedUpdates.measurable = sanitizeString(updates.measurable);
  if (updates.achievable) sanitizedUpdates.achievable = sanitizeString(updates.achievable);
  if (updates.relevant) sanitizedUpdates.relevant = sanitizeString(updates.relevant);
  if (updates.timeBound) sanitizedUpdates.timeBound = sanitizeString(updates.timeBound);
  if (updates.category) sanitizedUpdates.category = sanitizeString(updates.category);
  if (updates.notes) sanitizedUpdates.notes = sanitizeString(updates.notes);
  if (updates.status) sanitizedUpdates.status = updates.status;
  if (updates.progress !== undefined) sanitizedUpdates.progress = updates.progress;
  if (updates.startDate) sanitizedUpdates.startDate = updates.startDate;
  if (updates.targetDate) sanitizedUpdates.targetDate = updates.targetDate;
  
  repository.updateSmartGoal(id, sanitizedUpdates);
  return { success: true };
}

export function getStudentCoachingRecommendations(studentId: string): CoachingRecommendation[] {
  const sanitizedId = sanitizeString(studentId);
  return repository.getCoachingRecommendationsByStudent(sanitizedId);
}

export function createCoachingRecommendation(data: Omit<CoachingRecommendation, 'createdAt'> & { createdAt?: string }): { success: boolean; id: string } {
  const rec: CoachingRecommendation = {
    id: data.id,
    studentId: sanitizeString(data.studentId),
    type: sanitizeString(data.type),
    title: sanitizeString(data.title),
    description: data.description ? sanitizeString(data.description) : undefined,
    priority: data.priority ? sanitizeString(data.priority) : undefined,
    status: data.status || 'Öneri',
    automated: data.automated || false,
    implementationSteps: data.implementationSteps || [],
    createdAt: data.createdAt
  };
  
  repository.insertCoachingRecommendation(rec);
  return { success: true, id: rec.id };
}

export function updateCoachingRecommendation(id: string, updates: Partial<CoachingRecommendation>): { success: boolean } {
  const sanitizedUpdates: Partial<CoachingRecommendation> = {};
  
  if (updates.type) sanitizedUpdates.type = sanitizeString(updates.type);
  if (updates.title) sanitizedUpdates.title = sanitizeString(updates.title);
  if (updates.description) sanitizedUpdates.description = sanitizeString(updates.description);
  if (updates.priority) sanitizedUpdates.priority = sanitizeString(updates.priority);
  if (updates.status) sanitizedUpdates.status = updates.status;
  if (updates.implementationSteps) sanitizedUpdates.implementationSteps = updates.implementationSteps;
  
  repository.updateCoachingRecommendation(id, sanitizedUpdates);
  return { success: true };
}

export function getStudent360Evaluations(studentId: string): Evaluation360[] {
  const sanitizedId = sanitizeString(studentId);
  return repository.getEvaluations360ByStudent(sanitizedId);
}

export function create360Evaluation(data: Omit<Evaluation360, 'notes'> & { notes?: string }): { success: boolean; id: string } {
  const evaluation: Evaluation360 = {
    id: data.id,
    studentId: sanitizeString(data.studentId),
    evaluationDate: data.evaluationDate,
    selfEvaluation: data.selfEvaluation,
    teacherEvaluation: data.teacherEvaluation,
    peerEvaluation: data.peerEvaluation,
    parentEvaluation: data.parentEvaluation,
    strengths: data.strengths,
    areasForImprovement: data.areasForImprovement,
    actionPlan: data.actionPlan,
    notes: data.notes ? sanitizeString(data.notes) : undefined
  };
  
  repository.insertEvaluation360(evaluation);
  return { success: true, id: evaluation.id };
}

export function getStudentAchievements(studentId: string): Achievement[] {
  const sanitizedId = sanitizeString(studentId);
  return repository.getAchievementsByStudent(sanitizedId);
}

export function createAchievement(data: Omit<Achievement, 'description' | 'category' | 'points'> & { description?: string; category?: string; points?: number }): { success: boolean; id: string } {
  const achievement: Achievement = {
    id: data.id,
    studentId: sanitizeString(data.studentId),
    title: sanitizeString(data.title),
    description: data.description ? sanitizeString(data.description) : undefined,
    category: data.category ? sanitizeString(data.category) : undefined,
    earnedAt: data.earnedAt,
    points: data.points || 0
  };
  
  repository.insertAchievement(achievement);
  return { success: true, id: achievement.id };
}

export function getStudentSelfAssessments(studentId: string): SelfAssessment[] {
  const sanitizedId = sanitizeString(studentId);
  return repository.getSelfAssessmentsByStudent(sanitizedId);
}

export function createSelfAssessment(data: Omit<SelfAssessment, 'todayHighlight' | 'todayChallenge' | 'tomorrowGoal' | 'notes'> & { todayHighlight?: string; todayChallenge?: string; tomorrowGoal?: string; notes?: string }): { success: boolean; id: string } {
  const assessment: SelfAssessment = {
    id: data.id,
    studentId: sanitizeString(data.studentId),
    moodRating: data.moodRating,
    motivationLevel: data.motivationLevel,
    stressLevel: data.stressLevel,
    confidenceLevel: data.confidenceLevel,
    studyDifficulty: data.studyDifficulty,
    socialInteraction: data.socialInteraction,
    sleepQuality: data.sleepQuality,
    physicalActivity: data.physicalActivity,
    dailyGoalsAchieved: data.dailyGoalsAchieved,
    todayHighlight: data.todayHighlight ? sanitizeString(data.todayHighlight) : undefined,
    todayChallenge: data.todayChallenge ? sanitizeString(data.todayChallenge) : undefined,
    tomorrowGoal: data.tomorrowGoal ? sanitizeString(data.tomorrowGoal) : undefined,
    notes: data.notes ? sanitizeString(data.notes) : undefined,
    assessmentDate: data.assessmentDate
  };
  
  repository.insertSelfAssessment(assessment);
  return { success: true, id: assessment.id };
}

export function getStudentParentMeetings(studentId: string): ParentMeeting[] {
  const sanitizedId = sanitizeString(studentId);
  return repository.getParentMeetingsByStudent(sanitizedId);
}

export function createParentMeeting(data: Omit<ParentMeeting, 'time' | 'type' | 'participants' | 'mainTopics' | 'concerns' | 'decisions' | 'actionPlan' | 'nextMeetingDate' | 'parentSatisfaction' | 'followUpRequired' | 'notes' | 'createdBy' | 'createdAt'> & { time?: string; type?: string; participants?: unknown[]; mainTopics?: unknown[]; concerns?: string; decisions?: string; actionPlan?: string; nextMeetingDate?: string; parentSatisfaction?: number; followUpRequired?: boolean; notes?: string; createdBy?: string; createdAt?: string; date?: string }): { success: boolean; id: string } {
  const meetingDate = data.meetingDate || (data as { date?: string }).date || '';
  const meeting: ParentMeeting = {
    id: data.id,
    studentId: sanitizeString(data.studentId),
    meetingDate,
    time: data.time,
    type: data.type ? sanitizeString(data.type) : undefined,
    participants: data.participants,
    mainTopics: data.mainTopics,
    concerns: data.concerns ? sanitizeString(data.concerns) : undefined,
    decisions: data.decisions ? sanitizeString(data.decisions) : undefined,
    actionPlan: data.actionPlan ? sanitizeString(data.actionPlan) : undefined,
    nextMeetingDate: data.nextMeetingDate,
    parentSatisfaction: data.parentSatisfaction,
    followUpRequired: data.followUpRequired,
    notes: data.notes ? sanitizeString(data.notes) : undefined,
    createdBy: data.createdBy ? sanitizeString(data.createdBy) : undefined,
    createdAt: data.createdAt
  };
  
  repository.insertParentMeeting(meeting);
  return { success: true, id: meeting.id };
}

export function updateParentMeeting(id: string, updates: Partial<ParentMeeting> & { date?: string }): { success: boolean } {
  const sanitizedUpdates: Partial<ParentMeeting> = {};
  
  if (updates.meetingDate || updates.date) sanitizedUpdates.meetingDate = updates.meetingDate || updates.date;
  if (updates.time) sanitizedUpdates.time = updates.time;
  if (updates.type) sanitizedUpdates.type = sanitizeString(updates.type);
  if (updates.participants) sanitizedUpdates.participants = updates.participants;
  if (updates.mainTopics) sanitizedUpdates.mainTopics = updates.mainTopics;
  if (updates.concerns) sanitizedUpdates.concerns = sanitizeString(updates.concerns);
  if (updates.decisions) sanitizedUpdates.decisions = sanitizeString(updates.decisions);
  if (updates.actionPlan) sanitizedUpdates.actionPlan = sanitizeString(updates.actionPlan);
  if (updates.nextMeetingDate) sanitizedUpdates.nextMeetingDate = updates.nextMeetingDate;
  if (updates.parentSatisfaction !== undefined) sanitizedUpdates.parentSatisfaction = updates.parentSatisfaction;
  if (updates.followUpRequired !== undefined) sanitizedUpdates.followUpRequired = updates.followUpRequired;
  if (updates.notes) sanitizedUpdates.notes = sanitizeString(updates.notes);
  
  repository.updateParentMeeting(id, sanitizedUpdates);
  return { success: true };
}

export function getStudentHomeVisits(studentId: string): HomeVisit[] {
  const sanitizedId = sanitizeString(studentId);
  return repository.getHomeVisitsByStudent(sanitizedId);
}

export function createHomeVisit(data: Omit<HomeVisit, 'time' | 'visitDuration' | 'visitors' | 'familyPresent' | 'homeEnvironment' | 'familyInteraction' | 'observations' | 'recommendations' | 'concerns' | 'resources' | 'followUpActions' | 'nextVisitPlanned' | 'notes' | 'createdBy' | 'createdAt'> & { time?: string; visitDuration?: number; visitors?: unknown[]; familyPresent?: unknown[]; homeEnvironment?: string; familyInteraction?: string; observations?: string; recommendations?: string; concerns?: string; resources?: string; followUpActions?: string; nextVisitPlanned?: string; notes?: string; createdBy?: string; createdAt?: string }): { success: boolean; id: string } {
  const visit: HomeVisit = {
    id: data.id,
    studentId: sanitizeString(data.studentId),
    date: data.date,
    time: data.time,
    visitDuration: data.visitDuration,
    visitors: data.visitors,
    familyPresent: data.familyPresent,
    homeEnvironment: data.homeEnvironment ? sanitizeString(data.homeEnvironment) : undefined,
    familyInteraction: data.familyInteraction ? sanitizeString(data.familyInteraction) : undefined,
    observations: data.observations ? sanitizeString(data.observations) : undefined,
    recommendations: data.recommendations ? sanitizeString(data.recommendations) : undefined,
    concerns: data.concerns ? sanitizeString(data.concerns) : undefined,
    resources: data.resources ? sanitizeString(data.resources) : undefined,
    followUpActions: data.followUpActions ? sanitizeString(data.followUpActions) : undefined,
    nextVisitPlanned: data.nextVisitPlanned,
    notes: data.notes ? sanitizeString(data.notes) : undefined,
    createdBy: data.createdBy ? sanitizeString(data.createdBy) : undefined,
    createdAt: data.createdAt
  };
  
  repository.insertHomeVisit(visit);
  return { success: true, id: visit.id };
}

export function updateHomeVisit(id: string, updates: Partial<HomeVisit>): { success: boolean } {
  const sanitizedUpdates: Partial<HomeVisit> = {};
  
  if (updates.date) sanitizedUpdates.date = updates.date;
  if (updates.time) sanitizedUpdates.time = updates.time;
  if (updates.visitDuration !== undefined) sanitizedUpdates.visitDuration = updates.visitDuration;
  if (updates.visitors) sanitizedUpdates.visitors = updates.visitors;
  if (updates.familyPresent) sanitizedUpdates.familyPresent = updates.familyPresent;
  if (updates.homeEnvironment) sanitizedUpdates.homeEnvironment = sanitizeString(updates.homeEnvironment);
  if (updates.familyInteraction) sanitizedUpdates.familyInteraction = sanitizeString(updates.familyInteraction);
  if (updates.observations) sanitizedUpdates.observations = sanitizeString(updates.observations);
  if (updates.recommendations) sanitizedUpdates.recommendations = sanitizeString(updates.recommendations);
  if (updates.concerns) sanitizedUpdates.concerns = sanitizeString(updates.concerns);
  if (updates.resources) sanitizedUpdates.resources = sanitizeString(updates.resources);
  if (updates.followUpActions) sanitizedUpdates.followUpActions = sanitizeString(updates.followUpActions);
  if (updates.nextVisitPlanned) sanitizedUpdates.nextVisitPlanned = updates.nextVisitPlanned;
  if (updates.notes) sanitizedUpdates.notes = sanitizeString(updates.notes);
  
  repository.updateHomeVisit(id, sanitizedUpdates);
  return { success: true };
}

export function getStudentFamilyParticipation(studentId: string): FamilyParticipation[] {
  const sanitizedId = sanitizeString(studentId);
  return repository.getFamilyParticipationByStudent(sanitizedId);
}

export function createFamilyParticipation(data: Omit<FamilyParticipation, 'eventType' | 'eventName' | 'participationStatus' | 'participants' | 'engagementLevel' | 'communicationFrequency' | 'preferredContactMethod' | 'parentAvailability' | 'notes' | 'recordedBy' | 'recordedAt'> & { eventType?: string; eventName?: string; participationStatus?: string; participants?: unknown[]; engagementLevel?: number; communicationFrequency?: string; preferredContactMethod?: string; parentAvailability?: string; notes?: string; recordedBy?: string; recordedAt?: string }): { success: boolean; id: string } {
  const record: FamilyParticipation = {
    id: data.id,
    studentId: sanitizeString(data.studentId),
    eventType: data.eventType ? sanitizeString(data.eventType) : undefined,
    eventName: data.eventName ? sanitizeString(data.eventName) : undefined,
    eventDate: data.eventDate,
    participationStatus: data.participationStatus ? sanitizeString(data.participationStatus) : undefined,
    participants: data.participants,
    engagementLevel: data.engagementLevel,
    communicationFrequency: data.communicationFrequency ? sanitizeString(data.communicationFrequency) : undefined,
    preferredContactMethod: data.preferredContactMethod ? sanitizeString(data.preferredContactMethod) : undefined,
    parentAvailability: data.parentAvailability ? sanitizeString(data.parentAvailability) : undefined,
    notes: data.notes ? sanitizeString(data.notes) : undefined,
    recordedBy: data.recordedBy ? sanitizeString(data.recordedBy) : undefined,
    recordedAt: data.recordedAt
  };
  
  repository.insertFamilyParticipation(record);
  return { success: true, id: record.id };
}

export function updateFamilyParticipation(id: string, updates: Partial<FamilyParticipation>): { success: boolean } {
  const sanitizedUpdates: Partial<FamilyParticipation> = {};
  
  if (updates.eventType) sanitizedUpdates.eventType = sanitizeString(updates.eventType);
  if (updates.eventName) sanitizedUpdates.eventName = sanitizeString(updates.eventName);
  if (updates.eventDate) sanitizedUpdates.eventDate = updates.eventDate;
  if (updates.participationStatus) sanitizedUpdates.participationStatus = sanitizeString(updates.participationStatus);
  if (updates.participants) sanitizedUpdates.participants = updates.participants;
  if (updates.engagementLevel !== undefined) sanitizedUpdates.engagementLevel = updates.engagementLevel;
  if (updates.communicationFrequency) sanitizedUpdates.communicationFrequency = sanitizeString(updates.communicationFrequency);
  if (updates.preferredContactMethod) sanitizedUpdates.preferredContactMethod = sanitizeString(updates.preferredContactMethod);
  if (updates.parentAvailability) sanitizedUpdates.parentAvailability = sanitizeString(updates.parentAvailability);
  if (updates.notes) sanitizedUpdates.notes = sanitizeString(updates.notes);
  
  repository.updateFamilyParticipation(id, sanitizedUpdates);
  return { success: true };
}
