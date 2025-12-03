import { apiClient } from '../core/client';

export interface LearningStyleProfile {
 studentId: string;
 studentName: string;
 primaryLearningStyle: string;
 secondaryLearningStyle: string;
 learningPreferences: {
 visual: number;
 auditory: number;
 kinesthetic: number;
 reading: number;
 };
 strengths: string[];
 challenges: string[];
 recommendations: string[];
}

export interface AcademicStrengthAnalysis {
 studentId: string;
 strongSubjects: Array<{
 subject: string;
 score: number;
 skills: string[];
 }>;
 weakSubjects: Array<{
 subject: string;
 score: number;
 gaps: string[];
 }>;
 overallPattern: string;
 improvementAreas: string[];
}

export interface PersonalizedStudyPlan {
 studentId: string;
 studentName: string;
 generatedAt: string;
 learningStyle: string;
 motivationType: string;
 weeklyGoals: Array<{
 subject: string;
 goal: string;
 estimatedHours: number;
 priority: 'HIGH' | 'MEDIUM' | 'LOW';
 strategies: string[];
 }>;
 dailySchedule: Array<{
 day: string;
 sessions: Array<{
 time: string;
 subject: string;
 activity: string;
 duration: number;
 method: string;
 }>;
 }>;
 motivationStrategies: Array<{
 strategy: string;
 frequency: string;
 expectedOutcome: string;
 }>;
 resources: Array<{
 subject: string;
 resourceType: string;
 description: string;
 link?: string;
 }>;
 progressTracking: {
 checkpoints: string[];
 successMetrics: string[];
 };
}

export interface PersonalizedRecommendations {
 learningProfile: {
 primaryStyle: string;
 secondaryStyle?: string;
 motivationType: string;
 learningPace: string;
 preferredStudyTime: string;
 };
 strengths: Array<{
 subject: string;
 score: number;
 description: string;
 skills: string[];
 }>;
 weaknesses: Array<{
 subject: string;
 score: number;
 description: string;
 targetSkills: string[];
 }>;
 recommendedStrategies: Array<{
 strategy: string;
 category: string;
 description: string;
 steps: string[];
 expectedDuration: string;
 successProbability: number;
 }>;
 studyPlan?: {
 dailySchedule: Array<{
 time: string;
 subject: string;
 duration: number;
 }>;
 totalDuration: number;
 };
}

export const personalizedLearningAPI = {
 async getLearningStyleProfile(studentId: string): Promise<LearningStyleProfile> {
 const response = await apiClient.get<{ data: LearningStyleProfile }>(
 `/api/personalized-learning/learning-style/${studentId}`
 );
 return response.data;
 },

 async getAcademicStrengths(studentId: string): Promise<AcademicStrengthAnalysis> {
 const response = await apiClient.get<{ data: AcademicStrengthAnalysis }>(
 `/api/personalized-learning/academic-strengths/${studentId}`
 );
 return response.data;
 },

 async getStudyPlan(studentId: string): Promise<PersonalizedStudyPlan> {
 const response = await apiClient.get<{ data: PersonalizedStudyPlan }>(
 `/api/personalized-learning/study-plan/${studentId}`
 );
 return response.data;
 },

 async getPersonalizedRecommendations(studentId: string): Promise<PersonalizedRecommendations> {
 try {
 const [learningStyle, strengths, studyPlan] = await Promise.all([
 this.getLearningStyleProfile(studentId).catch(() => null),
 this.getAcademicStrengths(studentId).catch(() => null),
 this.getStudyPlan(studentId).catch(() => null),
 ]);

 return {
 learningProfile: {
 primaryStyle: learningStyle?.primaryLearningStyle || 'BELİRLENMEDİ',
 secondaryStyle: learningStyle?.secondaryLearningStyle,
 motivationType: 'KARMA',
 learningPace: 'ORTA',
 preferredStudyTime: 'Akşam Saatleri',
 },
 strengths: strengths?.strongSubjects.map(s => ({
 subject: s.subject,
 score: s.score,
 description: `${s.subject} dersinde güçlü performans`,
 skills: s.skills,
 })) || [],
 weaknesses: strengths?.weakSubjects.map(s => ({
 subject: s.subject,
 score: s.score,
 description: `${s.subject} dersinde gelişim alanı`,
 targetSkills: s.gaps,
 })) || [],
 recommendedStrategies: learningStyle?.recommendations.map((rec, idx) => ({
 strategy: rec,
 category: idx === 0 ? 'ÖĞRENİM STİLİ' : 'GENEL',
 description: rec,
 steps: ['Stratejiyi günlük rutine ekle', 'İlerlemeyi haftalık takip et'],
 expectedDuration: '2-4 hafta',
 successProbability: 75,
 })) || [],
 studyPlan: studyPlan ? {
 dailySchedule: studyPlan.dailySchedule.flatMap(day => 
 day.sessions.map(session => ({
 time: `${day.day} ${session.time}`,
 subject: session.subject,
 duration: session.duration,
 }))
 ).slice(0, 5),
 totalDuration: studyPlan.weeklyGoals.reduce((sum, goal) => sum + (goal.estimatedHours * 60), 0),
 } : undefined,
 };
 } catch (error) {
 console.error('Error fetching personalized recommendations:', error);
 throw error;
 }
 }
};
