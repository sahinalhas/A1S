import type { 
 StudySubject, 
 StudyTopic, 
 StudyAssignment, 
 StudySession, 
 WeeklySlot, 
 TopicProgress,
 ScheduleTemplate,
 PlannedEntry
} from "../../types/study.types";
import { apiClient, createApiHandler } from '../core/client';
import { API_ERROR_MESSAGES } from "../../constants/messages.constants";

let subjectsCache: StudySubject[] | null = null;
let topicsCache: StudyTopic[] | null = null;
let weeklySlotsCache: WeeklySlot[] | null = null;
let progressCache: TopicProgress[] | null = null;

export function loadSubjects(): StudySubject[] {
 if (subjectsCache !== null) {
 return structuredClone(subjectsCache);
 }
 
 loadSubjectsAsync();
 
 subjectsCache = [];
 return [];
}

export async function loadSubjectsAsync(): Promise<StudySubject[]> {
 return createApiHandler(
 async () => {
 const json = await apiClient.get<any>('/api/subjects', { showErrorToast: false });
 const subjects = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
 subjectsCache = subjects;
 window.dispatchEvent(new CustomEvent('subjectsUpdated'));
 return subjects;
 },
 () => {
 if (!subjectsCache || subjectsCache.length === 0) {
 subjectsCache = [];
 window.dispatchEvent(new CustomEvent('subjectsUpdated'));
 }
 return subjectsCache || [];
 },
 API_ERROR_MESSAGES.STUDY.SUBJECTS_LOAD_ERROR
 )();
}

export async function saveSubjects(v: StudySubject[]): Promise<void> {
 const previousCache = subjectsCache ? structuredClone(subjectsCache) : null;
 
 try {
 await apiClient.post('/api/subjects', v, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.STUDY.SUBJECTS_SAVE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.STUDY.SUBJECTS_SAVE_ERROR,
 });
 
 subjectsCache = structuredClone(v);
 window.dispatchEvent(new CustomEvent('subjectsUpdated'));
 } catch (error) {
 subjectsCache = previousCache;
 throw error;
 }
}

export async function addSubject(s: StudySubject): Promise<void> {
 const list = loadSubjects();
 list.unshift(s);
 await saveSubjects(list);
 await loadSubjectsAsync();
}

export async function updateSubject(id: string, patch: Partial<StudySubject>): Promise<void> {
 const list = loadSubjects();
 const i = list.findIndex((x) => x.id === id);
 if (i >= 0) {
 list[i] = { ...list[i], ...patch, id: list[i].id };
 await saveSubjects(list);
 await loadSubjectsAsync();
 }
}

export async function removeSubject(id: string): Promise<void> {
 const list = loadSubjects();
 const filtered = list.filter((s) => s.id !== id);
 await saveSubjects(filtered);
 await loadSubjectsAsync();
}

export function loadTopics(): StudyTopic[] {
 if (topicsCache !== null) {
 return structuredClone(topicsCache);
 }
 
 loadTopicsAsync();
 
 topicsCache = [];
 return [];
}

export async function loadTopicsAsync(): Promise<StudyTopic[]> {
 return createApiHandler(
 async () => {
 const json = await apiClient.get<any>('/api/subjects/topics', { showErrorToast: false });
 const topics = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
 topicsCache = topics;
 window.dispatchEvent(new CustomEvent('topicsUpdated'));
 return topics;
 },
 () => {
 if (!topicsCache || topicsCache.length === 0) {
 topicsCache = [];
 window.dispatchEvent(new CustomEvent('topicsUpdated'));
 }
 return topicsCache || [];
 },
 API_ERROR_MESSAGES.STUDY.TOPICS_LOAD_ERROR
 )();
}

export async function saveTopics(v: StudyTopic[]): Promise<void> {
 const previousCache = topicsCache ? structuredClone(topicsCache) : null;
 
 try {
 await apiClient.post('/api/subjects/topics', v, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.STUDY.TOPICS_SAVE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.STUDY.TOPICS_SAVE_ERROR,
 });
 
 topicsCache = structuredClone(v);
 window.dispatchEvent(new CustomEvent('topicsUpdated'));
 } catch (error) {
 topicsCache = previousCache;
 throw error;
 }
}

export async function addTopic(t: StudyTopic): Promise<void> {
 const list = loadTopics();
 list.unshift(t);
 await saveTopics(list);
 await loadTopicsAsync();
}

export async function updateTopic(id: string, patch: Partial<StudyTopic>): Promise<void> {
 const list = loadTopics();
 const i = list.findIndex((x) => x.id === id);
 if (i >= 0) {
 list[i] = {
 ...list[i],
 ...patch,
 id: list[i].id,
 subjectId: list[i].subjectId,
 };
 await saveTopics(list);
 await loadTopicsAsync();
 }
}

export async function removeTopic(id: string): Promise<void> {
 const list = loadTopics();
 const filtered = list.filter((t) => t.id !== id);
 await saveTopics(filtered);
 await loadTopicsAsync();
}

export function getTopicsBySubject(subjectId: string): StudyTopic[] {
 const topics = loadTopics();
 return topics.filter((t) => t.subjectId === subjectId);
}

export async function removeTopicsBySubject(subjectId: string): Promise<void> {
 const list = loadTopics();
 const filtered = list.filter((t) => t.subjectId !== subjectId);
 await saveTopics(filtered);
 await loadTopicsAsync();
}

export function loadWeeklySlots(): WeeklySlot[] {
 if (weeklySlotsCache !== null) {
 return structuredClone(weeklySlotsCache);
 }
 
 loadWeeklySlotsAsync();
 
 weeklySlotsCache = [];
 return [];
}

export async function loadWeeklySlotsAsync(): Promise<void> {
 return createApiHandler(
 async () => {
 const json = await apiClient.get<any>('/api/study/weekly-slots', { showErrorToast: false });
 const slots = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
 weeklySlotsCache = slots;
 window.dispatchEvent(new CustomEvent('weeklySlotsUpdated'));
 },
 undefined,
 API_ERROR_MESSAGES.STUDY.WEEKLY_SLOTS_LOAD_ERROR
 )();
}

export async function saveWeeklySlots(v: WeeklySlot[]): Promise<void> {
 const previousCache = weeklySlotsCache ? structuredClone(weeklySlotsCache) : null;
 
 try {
 await apiClient.post('/api/study/weekly-slots', v, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.STUDY.WEEKLY_SLOTS_SAVE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.STUDY.WEEKLY_SLOTS_SAVE_ERROR,
 });
 
 weeklySlotsCache = structuredClone(v);
 window.dispatchEvent(new CustomEvent('weeklySlotsUpdated'));
 } catch (error) {
 weeklySlotsCache = previousCache;
 throw error;
 }
}

export function getWeeklySlotsByStudent(studentId: string) {
 return loadWeeklySlots().filter((w) => w.studentId === studentId);
}

export async function addWeeklySlot(w: WeeklySlot): Promise<void> {
 const previousCache = weeklySlotsCache ? structuredClone(weeklySlotsCache) : null;
 
 try {
 await apiClient.post('/api/study/weekly-slots', w, {
 showSuccessToast: false,
 errorMessage: API_ERROR_MESSAGES.STUDY.WEEKLY_SLOTS_ADD_ERROR,
 });
 
 const list = weeklySlotsCache ? [...weeklySlotsCache] : [];
 list.push(w);
 weeklySlotsCache = structuredClone(list);
 window.dispatchEvent(new CustomEvent('weeklySlotsUpdated'));
 } catch (error) {
 weeklySlotsCache = previousCache;
 throw error;
 }
}

export async function removeWeeklySlot(id: string): Promise<void> {
 const previousCache = weeklySlotsCache ? structuredClone(weeklySlotsCache) : null;
 
 try {
 await apiClient.delete(`/api/study/weekly-slots/${id}`, {
 showSuccessToast: false,
 errorMessage: API_ERROR_MESSAGES.STUDY.WEEKLY_SLOTS_DELETE_ERROR,
 });
 
 const list = weeklySlotsCache ? weeklySlotsCache.filter((w) => w.id !== id) : [];
 weeklySlotsCache = structuredClone(list);
 window.dispatchEvent(new CustomEvent('weeklySlotsUpdated'));
 } catch (error) {
 weeklySlotsCache = previousCache;
 throw error;
 }
}

export async function updateWeeklySlot(id: string, patch: Partial<WeeklySlot>): Promise<void> {
 const previousCache = weeklySlotsCache ? structuredClone(weeklySlotsCache) : null;
 
 try {
 await apiClient.put(`/api/study/weekly-slots/${id}`, patch, {
 showSuccessToast: false,
 errorMessage: API_ERROR_MESSAGES.STUDY.WEEKLY_SLOTS_UPDATE_ERROR,
 });
 
 const list = weeklySlotsCache ? weeklySlotsCache.map(w => ({...w})) : [];
 const i = list.findIndex((w) => w.id === id);
 if (i >= 0) {
 list[i] = {
 ...list[i],
 ...patch,
 id: list[i].id,
 studentId: list[i].studentId,
 subjectId: list[i].subjectId,
 };
 weeklySlotsCache = structuredClone(list);
 window.dispatchEvent(new CustomEvent('weeklySlotsUpdated'));
 }
 } catch (error) {
 weeklySlotsCache = previousCache;
 throw error;
 }
}

export function loadProgress(): TopicProgress[] {
 if (progressCache !== null) {
 return structuredClone(progressCache);
 }
 
 loadProgressAsync();
 
 progressCache = [];
 return [];
}

export async function loadProgressAsync(): Promise<void> {
 try {
 const json = await apiClient.get<any>('/api/progress', { showErrorToast: false });
 const progress = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
 progressCache = progress;
 window.dispatchEvent(new CustomEvent('progressUpdated'));
 } catch (error) {
 console.error(API_ERROR_MESSAGES.STUDY.PROGRESS_LOAD_ERROR, error);
 if (!progressCache || progressCache.length === 0) {
 progressCache = [];
 window.dispatchEvent(new CustomEvent('progressUpdated'));
 }
 }
}

export async function saveProgress(v: TopicProgress[]): Promise<void> {
 const previousCache = progressCache ? structuredClone(progressCache) : null;
 
 try {
 await apiClient.post('/api/progress', v, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.STUDY.PROGRESS_SAVE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.STUDY.PROGRESS_SAVE_ERROR,
 });
 
 progressCache = structuredClone(v);
 window.dispatchEvent(new CustomEvent('progressUpdated'));
 } catch (error) {
 progressCache = previousCache;
 throw error;
 }
}

export function getProgressByStudent(studentId: string) {
 return loadProgress().filter((p) => p.studentId === studentId);
}

export async function ensureProgressForStudent(studentId: string) {
 const topics = loadTopics();
 const list = loadProgress();
 let changed = false;
 for (const t of topics) {
 const exists = list.find(
 (p) => p.studentId === studentId && p.topicId === t.id,
 );
 if (!exists) {
 list.push({
 id: crypto.randomUUID(),
 studentId,
 topicId: t.id,
 completed: 0,
 remaining: t.avgMinutes,
 completedFlag: false,
 });
 changed = true;
 }
 }
 if (changed) await saveProgress(list);
}

export async function resetTopicProgress(studentId: string, topicId: string) {
 const list = loadProgress();
 const pIndex = list.findIndex(
 (x) => x.studentId === studentId && x.topicId === topicId,
 );
 const topics = loadTopics();
 const t = topics.find((tt) => tt.id === topicId);
 if (pIndex >= 0 && t) {
 list[pIndex] = {
 ...list[pIndex],
 completed: 0,
 remaining: t.avgMinutes,
 completedFlag: false,
 lastStudied: undefined,
 reviewCount: 0,
 nextReviewDate: undefined,
 };
 await saveProgress(list);
 }
}

export function getTopicsDueForReview(studentId: string): TopicProgress[] {
 const today = new Date().toISOString().split('T')[0];
 const progress = getProgressByStudent(studentId);
 
 return progress.filter(p => {
 if (!p.nextReviewDate || !p.completedFlag) return false;
 return p.nextReviewDate <= today;
 });
}

export function getUpcomingReviews(studentId: string, days: number = 7): TopicProgress[] {
 const today = new Date();
 const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
 const futureDateStr = futureDate.toISOString().split('T')[0];
 const todayStr = today.toISOString().split('T')[0];
 const progress = getProgressByStudent(studentId);
 
 return progress.filter(p => {
 if (!p.nextReviewDate || !p.completedFlag) return false;
 return p.nextReviewDate > todayStr && p.nextReviewDate <= futureDateStr;
 }).sort((a, b) => (a.nextReviewDate || '').localeCompare(b.nextReviewDate || ''));
}

function calculateNextReviewDate(reviewCount: number): string {
 const now = new Date();
 let daysToAdd = 0;
 
 switch (reviewCount) {
 case 0:
 daysToAdd = 30;
 break;
 case 1:
 daysToAdd = 90;
 break;
 default:
 daysToAdd = 9999;
 break;
 }
 
 const nextDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
 return nextDate.toISOString().split('T')[0];
}

export async function updateProgress(
 studentId: string,
 topicId: string,
 minutes: number,
) {
 const list = loadProgress();
 const pIndex = list.findIndex(
 (x) => x.studentId === studentId && x.topicId === topicId,
 );
 const topics = loadTopics();
 const t = topics.find((tt) => tt.id === topicId);
 if (pIndex < 0 || !t) return;
 
 const p = list[pIndex];
 const wasCompleted = p.completedFlag;
 const newCompleted = p.completed + minutes;
 const newRemaining = Math.max(0, t.avgMinutes - newCompleted);
 const newCompletedFlag = newRemaining === 0;
 
 const today = new Date().toISOString().split('T')[0];
 
 // Only start spaced repetition on FIRST completion
 // If already completed, keep existing review data intact
 const shouldStartReview = !wasCompleted && newCompletedFlag;
 
 list[pIndex] = {
 ...p,
 completed: newCompleted,
 remaining: newRemaining,
 completedFlag: newCompletedFlag,
 lastStudied: today,
 reviewCount: shouldStartReview ? 1 : p.reviewCount,
 nextReviewDate: shouldStartReview ? calculateNextReviewDate(1) : p.nextReviewDate,
 };
 
 await saveProgress(list);
}

export async function setCompletedFlag(
 studentId: string,
 topicId: string,
 done: boolean,
) {
 const list = loadProgress();
 const pIndex = list.findIndex(
 (x) => x.studentId === studentId && x.topicId === topicId,
 );
 const topics = loadTopics();
 const t = topics.find((tt) => tt.id === topicId);
 if (pIndex < 0 || !t) return;
 
 const p = list[pIndex];
 const today = new Date().toISOString().split('T')[0];
 
 // If marking as complete for the first time, start spaced repetition
 const wasNotCompleted = !p.completedFlag;
 const shouldStartReview = wasNotCompleted && done;
 
 list[pIndex] = {
 ...p,
 completedFlag: done,
 completed: done ? t.avgMinutes : p.completed,
 remaining: done ? 0 : p.remaining,
 lastStudied: done ? today : p.lastStudied,
 // Initialize review system on first completion, preserve on uncomplete
 reviewCount: shouldStartReview ? 1 : (done ? p.reviewCount : p.reviewCount),
 nextReviewDate: shouldStartReview ? calculateNextReviewDate(1) : (done ? p.nextReviewDate : undefined),
 };
 
 await saveProgress(list);
}

export async function reviewTopic(
 studentId: string,
 topicId: string,
) {
 // Reload fresh progress data to avoid stale cache
 const list = loadProgress();
 const pIndex = list.findIndex(
 (x) => x.studentId === studentId && x.topicId === topicId,
 );
 if (pIndex < 0) return;
 
 const p = list[pIndex];
 
 // Only review topics that are completed
 if (!p.completedFlag) {
 console.warn('Cannot review topic that is not completed');
 return;
 }
 
 const today = new Date().toISOString().split('T')[0];
 // Ensure reviewCount starts from 1 if not initialized
 const currentReviewCount = p.reviewCount || 1;
 const newReviewCount = currentReviewCount + 1;
 
 list[pIndex] = {
 ...p,
 lastStudied: today,
 reviewCount: newReviewCount,
 nextReviewDate: calculateNextReviewDate(newReviewCount),
 };
 
 // Persist changes to storage
 await saveProgress(list);
}

export async function loadSessions(): Promise<StudySession[]> {
 try {
 const sessions = await apiClient.get<StudySession[]>('/api/study-sessions/all');
 return sessions;
 } catch (error) {
 console.error('Error loading study sessions:', error);
 return [];
 }
}

export async function getSessionsByStudent(studentId: string): Promise<StudySession[]> {
 try {
 const sessions = await apiClient.get<StudySession[]>(`/api/study-sessions/${studentId}`);
 return sessions;
 } catch (error) {
 console.error('Error getting study sessions:', error);
 return [];
 }
}

export async function addSession(s: StudySession): Promise<void> {
 return apiClient.post('/api/study-sessions', s, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.STUDY.SESSION_SAVE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.STUDY.SESSION_SAVE_ERROR,
 });
}

export function weeklyTotalMinutes(studentId: string) {
 const minutesBetween = (start: string, end: string) => {
 const [sh, sm] = start.split(":").map(Number);
 const [eh, em] = end.split(":").map(Number);
 return eh * 60 + em - (sh * 60 + sm);
 };
 
 return getWeeklySlotsByStudent(studentId).reduce(
 (sum, s) => sum + minutesBetween(s.start, s.end),
 0,
 );
}

export async function getStudyAssignmentsByStudent(studentId: string): Promise<StudyAssignment[]> {
 return createApiHandler(
 () => apiClient.get<StudyAssignment[]>(`/api/study/study-assignments/${studentId}`, { showErrorToast: false }),
 [],
 'Ödevler yüklenemedi'
 )();
}

export async function saveStudyAssignment(assignment: StudyAssignment): Promise<void> {
 return apiClient.post('/api/study/study-assignments', assignment, {
 showSuccessToast: true,
 successMessage: 'Ödev kaydedildi',
 errorMessage: 'Ödev kaydedilemedi',
 });
}

export async function updateStudyAssignment(id: string, updates: Partial<StudyAssignment>): Promise<void> {
 return apiClient.put(`/api/study/study-assignments/${id}`, updates, {
 showSuccessToast: true,
 successMessage: 'Ödev güncellendi',
 errorMessage: 'Ödev güncellenemedi',
 });
}

export async function deleteStudyAssignment(id: string): Promise<void> {
 return apiClient.delete(`/api/study/study-assignments/${id}`, {
 showSuccessToast: true,
 successMessage: 'Ödev silindi',
 errorMessage: 'Ödev silinemedi',
 });
}

export async function savePlannedTopics(
 studentId: string,
 weekStartDate: string,
 plannedTopics: PlannedEntry[]
): Promise<void> {
 try {
 await apiClient.post(
 `/api/study/planned-topics/${studentId}/${weekStartDate}`,
 plannedTopics,
 {
 showSuccessToast: false,
 errorMessage: 'Konu bazlı plan kaydedilemedi',
 }
 );
 
 // Verify data was saved by refetching immediately
 if (plannedTopics.length > 0) {
 const saved = await getPlannedTopics(studentId, weekStartDate);
 if (saved.length === 0) {
 throw new Error('Konu bazlı plan kaydedildi ancak doğrulanmadı');
 }
 }
 } catch (error) {
 console.error('Error saving planned topics:', error);
 throw error;
 }
}

export async function getPlannedTopics(
 studentId: string,
 weekStartDate: string
): Promise<PlannedEntry[]> {
 try {
 return await apiClient.get<PlannedEntry[]>(
 `/api/study/planned-topics/${studentId}/${weekStartDate}`,
 { showErrorToast: false }
 );
 } catch (error) {
 console.error('Error loading planned topics:', error);
 return [];
 }
}
