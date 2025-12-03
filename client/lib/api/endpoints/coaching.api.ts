import type {
 AcademicGoal,
 MultipleIntelligence,
 LearningStyle,
 SmartGoal,
 CoachingRecommendation,
 Evaluation360,
 Achievement,
 SelfAssessment
} from "../../types/coaching.types";
import { apiClient, createApiHandler } from '../core/client';
import { API_ERROR_MESSAGES } from "../../constants/messages.constants";
import { loadStudents } from "./students.api";
import { getAttendanceByStudent } from "./attendance.api";

export async function loadAcademicGoals(): Promise<AcademicGoal[]> {
 return createApiHandler(
 () => apiClient.get<AcademicGoal[]>('/api/coaching/academic-goals', { showErrorToast: false }),
 [],
 API_ERROR_MESSAGES.COACHING.ACADEMIC_GOALS_LOAD_ERROR
 )();
}

export async function getAcademicGoalsByStudent(studentId: string): Promise<AcademicGoal[]> {
 return createApiHandler(
 () => apiClient.get<AcademicGoal[]>(`/api/coaching/academic-goals/student/${studentId}`, { showErrorToast: false }),
 [],
 API_ERROR_MESSAGES.COACHING.ACADEMIC_GOALS_STUDENT_LOAD_ERROR
 )();
}

export async function addAcademicGoal(goal: AcademicGoal): Promise<void> {
 return apiClient.post('/api/coaching/academic-goals', goal, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.COACHING.ACADEMIC_GOALS_ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.COACHING.ACADEMIC_GOALS_ADD_ERROR,
 });
}

export async function updateAcademicGoal(id: string, updates: Partial<AcademicGoal>): Promise<void> {
 return apiClient.put(`/api/coaching/academic-goals/${id}`, updates, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.COACHING.ACADEMIC_GOALS_UPDATE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.COACHING.ACADEMIC_GOALS_UPDATE_ERROR,
 });
}

export async function getMultipleIntelligenceByStudent(studentId: string): Promise<MultipleIntelligence | undefined> {
 return createApiHandler(
 async () => {
 const records = await apiClient.get<MultipleIntelligence[]>(`/api/coaching/multiple-intelligence/student/${studentId}`, { showErrorToast: false });
 return records[0];
 },
 undefined,
 API_ERROR_MESSAGES.COACHING.MI_LOAD_ERROR
 )();
}

export async function addMultipleIntelligence(mi: MultipleIntelligence): Promise<void> {
 return apiClient.post('/api/coaching/multiple-intelligence', mi, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.COACHING.MI_ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.COACHING.MI_ADD_ERROR,
 });
}

export async function getLearningStyleByStudent(studentId: string): Promise<LearningStyle | undefined> {
 return createApiHandler(
 async () => {
 const records = await apiClient.get<LearningStyle[]>(`/api/coaching/learning-styles/student/${studentId}`, { showErrorToast: false });
 return records[0];
 },
 undefined,
 API_ERROR_MESSAGES.COACHING.LS_LOAD_ERROR
 )();
}

export async function addLearningStyle(ls: LearningStyle): Promise<void> {
 return apiClient.post('/api/coaching/learning-styles', ls, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.COACHING.LS_ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.COACHING.LS_ADD_ERROR,
 });
}

export async function getSmartGoalsByStudent(studentId: string): Promise<SmartGoal[]> {
 return createApiHandler(
 () => apiClient.get<SmartGoal[]>(`/api/coaching/smart-goals/student/${studentId}`, { showErrorToast: false }),
 [],
 API_ERROR_MESSAGES.COACHING.SMART_GOALS_LOAD_ERROR
 )();
}

export async function addSmartGoal(goal: SmartGoal): Promise<void> {
 return apiClient.post('/api/coaching/smart-goals', goal, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.COACHING.SMART_GOALS_ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.COACHING.SMART_GOALS_ADD_ERROR,
 });
}

export async function updateSmartGoal(id: string, updates: Partial<SmartGoal>): Promise<void> {
 return apiClient.put(`/api/coaching/smart-goals/${id}`, updates, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.COACHING.SMART_GOALS_UPDATE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.COACHING.SMART_GOALS_UPDATE_ERROR,
 });
}

export async function getCoachingRecommendationsByStudent(studentId: string): Promise<CoachingRecommendation[]> {
 return createApiHandler(
 () => apiClient.get<CoachingRecommendation[]>(`/api/coaching/coaching-recommendations/student/${studentId}`, { showErrorToast: false }),
 [],
 API_ERROR_MESSAGES.COACHING.RECOMMENDATIONS_LOAD_ERROR
 )();
}

export async function addCoachingRecommendation(rec: CoachingRecommendation): Promise<void> {
 return apiClient.post('/api/coaching/coaching-recommendations', rec, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.COACHING.RECOMMENDATIONS_ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.COACHING.RECOMMENDATIONS_ADD_ERROR,
 });
}

export async function updateCoachingRecommendation(id: string, updates: Partial<CoachingRecommendation>): Promise<void> {
 return apiClient.put(`/api/coaching/coaching-recommendations/${id}`, updates, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.COACHING.RECOMMENDATIONS_UPDATE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.COACHING.RECOMMENDATIONS_UPDATE_ERROR,
 });
}

export async function getEvaluations360ByStudent(studentId: string): Promise<Evaluation360[]> {
 return createApiHandler(
 () => apiClient.get<Evaluation360[]>(`/api/coaching/evaluations-360/student/${studentId}`, { showErrorToast: false }),
 [],
 API_ERROR_MESSAGES.COACHING.EVAL360_LOAD_ERROR
 )();
}

export async function addEvaluation360(evaluation: Evaluation360): Promise<void> {
 return apiClient.post('/api/coaching/evaluations-360', evaluation, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.COACHING.EVAL360_ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.COACHING.EVAL360_ADD_ERROR,
 });
}

export async function getAchievementsByStudent(studentId: string): Promise<Achievement[]> {
 return createApiHandler(
 () => apiClient.get<Achievement[]>(`/api/coaching/achievements/student/${studentId}`, { showErrorToast: false }),
 [],
 API_ERROR_MESSAGES.COACHING.ACHIEVEMENTS_LOAD_ERROR
 )();
}

export async function addAchievement(achievement: Achievement): Promise<void> {
 return apiClient.post('/api/coaching/achievements', achievement, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.COACHING.ACHIEVEMENTS_ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.COACHING.ACHIEVEMENTS_ADD_ERROR,
 });
}

export async function getSelfAssessmentsByStudent(studentId: string): Promise<SelfAssessment[]> {
 return createApiHandler(
 () => apiClient.get<SelfAssessment[]>(`/api/coaching/self-assessments/student/${studentId}`, { showErrorToast: false }),
 [],
 API_ERROR_MESSAGES.COACHING.SELF_ASSESSMENTS_LOAD_ERROR
 )();
}

export async function addSelfAssessment(assessment: SelfAssessment): Promise<void> {
 return apiClient.post('/api/coaching/self-assessments', assessment, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.COACHING.SELF_ASSESSMENTS_ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.COACHING.SELF_ASSESSMENTS_ADD_ERROR,
 });
}

export async function getTodaysSelfAssessment(studentId: string): Promise<SelfAssessment | undefined> {
 try {
 const today = new Date().toISOString().slice(0, 10);
 const assessments = await getSelfAssessmentsByStudent(studentId);
 return assessments.find(sa => sa.assessmentDate === today);
 } catch (error) {
 console.error('Error getting today\'s self assessment:', error);
 return undefined;
 }
}

export async function generateAutoRecommendations(studentId: string): Promise<CoachingRecommendation[]> {
 const recommendations: CoachingRecommendation[] = [];
 const now = new Date().toISOString();
 
 const students = loadStudents();
 const student = students.find(s => s.id === studentId);
 if (!student) return recommendations;

 if (student.risk ==="Yüksek") {
 recommendations.push({
 id: crypto.randomUUID(),
 studentId,
 type:"MOTIVASYON",
 title:"Acil Motivasyon Desteği",
 description:"Yüksek risk seviyesinde olan öğrenci için özel motivasyon stratejileri uygulanmalı.",
 priority:"Yüksek",
 automated: true,
 implementationSteps: [
"Bireysel görüşme planla",
"Öğrencinin ilgi alanlarını tespit et",
"Kısa vadeli başarılabilir hedefler belirle",
"Düzenli takip planı oluştur"
 ],
 status:"Öneri",
 createdAt: now
 });
 }

 const attendance = await getAttendanceByStudent(studentId);
 const recentAbsences = attendance.filter(a => 
 a.status ==="Devamsız" && 
 Date.now() - new Date(a.date).getTime() <= 7 * 24 * 60 * 60 * 1000
 ).length;

 if (recentAbsences >= 2) {
 recommendations.push({
 id: crypto.randomUUID(),
 studentId,
 type:"SOSYAL",
 title:"Devamsızlık Takip Programı",
 description:"Son hafta içinde 2 veya daha fazla devamsızlık tespit edildi.",
 priority:"Yüksek",
 automated: true,
 implementationSteps: [
"Devamsızlık sebeplerini araştır",
"Veli ile iletişime geç",
"Okula uyum programı planla"
 ],
 status:"Öneri",
 createdAt: now
 });
 }

 return recommendations;
}
