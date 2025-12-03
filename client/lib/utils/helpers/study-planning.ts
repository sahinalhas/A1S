import type { StudyTopic, TopicProgress, WeeklySlot, PlannedEntry } from "../../types/study.types";
import { 
 loadTopics, 
 getProgressByStudent, 
 ensureProgressForStudent,
 getWeeklySlotsByStudent,
 loadWeeklySlotsAsync,
 getTopicsDueForReview,
 getUpcomingReviews,
 savePlannedTopics
} from "../../api/endpoints/study.api";


function minutesBetween(start: string, end: string) {
 const [sh, sm] = start.split(":").map(Number);
 const [eh, em] = end.split(":").map(Number);
 return eh * 60 + em - (sh * 60 + sm);
}

export async function getNextTopicForSubject(
 studentId: string,
 subjectId: string,
): Promise<{ topicId: string; remaining: number } | null> {
 await ensureProgressForStudent(studentId);
 const topics = loadTopics()
 .filter((t) => t.subjectId === subjectId)
 .sort(
 (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name),
 );
 const progress = getProgressByStudent(studentId);
 for (const t of topics) {
 const p = progress.find((pp) => pp.topicId === t.id);
 if (p && !p.completedFlag && p.remaining > 0) {
 return { topicId: t.id, remaining: p.remaining };
 }
 }
 return null;
}

function dateFromWeekStart(
 weekStartISO: string,
 day: 1 | 2 | 3 | 4 | 5 | 6 | 7,
) {
 const d = new Date(weekStartISO +"T00:00:00");
 const result = new Date(d.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
 return result.toISOString().slice(0, 10);
}

export async function planWeek(
 studentId: string,
 weekStartISO: string,
): Promise<PlannedEntry[]> {
 await ensureProgressForStudent(studentId);
 await loadWeeklySlotsAsync();
 const slots = getWeeklySlotsByStudent(studentId)
 .slice()
 .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));
 const out: PlannedEntry[] = [];
 const topicsAll = loadTopics();
 const progress = getProgressByStudent(studentId);
 const progMap = new Map<string, { remaining: number; done: boolean }>();
 for (const t of topicsAll) {
 const p = progress.find((pp) => pp.topicId === t.id);
 if (p)
 progMap.set(t.id, { remaining: p.remaining, done: !!p.completedFlag });
 }
 const topicsBySubject = new Map<string, typeof topicsAll>();
 for (const t of topicsAll) {
 const arr = topicsBySubject.get(t.subjectId) || ([] as any);
 arr.push(t);
 topicsBySubject.set(t.subjectId, arr);
 }
 topicsBySubject.forEach((arr, sidKey) => {
 arr.sort(
 (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name),
 );
 });
 const pickNext = (
 subjectId: string,
 ): { topicId: string; remaining: number } | null => {
 const arr = topicsBySubject.get(subjectId) || [];
 for (const t of arr) {
 const st = progMap.get(t.id);
 if (st && !st.done && st.remaining > 0)
 return { topicId: t.id, remaining: st.remaining };
 }
 return null;
 };

 // Track daily minutes to respect weekly plan limits
 const dailyMinutes = new Map<number, number>();

 for (const s of slots) {
 let remain = minutesBetween(s.start, s.end);
 if (remain <= 0) continue;
 let guard = 0;
 let currentStartMin = minutesBetween("00:00", s.start);
 const slotStartTime = minutesBetween("00:00", s.start);
 const slotEndTime = minutesBetween("00:00", s.end);
 const maxAllowedPerSlot = slotEndTime - slotStartTime;
 let usedInSlot = 0;
 
 // Get current day's total minutes (slot is already part of this day)
 const currentDayTotal = dailyMinutes.get(s.day) || 0;
 
 while (remain > 0 && guard++ < 200 && usedInSlot < maxAllowedPerSlot) {
 const nxt = pickNext(s.subjectId);
 if (!nxt) break;
 const alloc = Math.min(remain, nxt.remaining, maxAllowedPerSlot - usedInSlot);
 if (alloc <= 0) break;
 
 const date = dateFromWeekStart(weekStartISO, s.day);
 const startH = String(Math.floor(currentStartMin / 60)).padStart(2,"0");
 const startM = String(currentStartMin % 60).padStart(2,"0");
 const start = `${startH}:${startM}`;
 const endMin = currentStartMin + alloc;
 const endH = String(Math.floor(endMin / 60)).padStart(2,"0");
 const endM = String(endMin % 60).padStart(2,"0");
 const end = `${endH}:${endM}`;
 const st = progMap.get(nxt.topicId)!;
 const remainingAfter = Math.max(0, st.remaining - alloc);
 out.push({
 date,
 start,
 end,
 subjectId: s.subjectId,
 topicId: nxt.topicId,
 allocated: alloc,
 remainingAfter,
 });
 st.remaining = remainingAfter;
 if (st.remaining === 0) st.done = true;
 remain -= alloc;
 usedInSlot += alloc;
 currentStartMin = endMin;
 dailyMinutes.set(s.day, (dailyMinutes.get(s.day) || 0) + alloc);
 }
 }
 
 try {
 await savePlannedTopics(studentId, weekStartISO, out);
 } catch (error) {
 console.error('Failed to save planned topics:', error);
 throw error;
 }
 
 return out;
}

function smartSortTopics(
  topics: StudyTopic[], 
  progress: TopicProgress[],
  dueForReview: TopicProgress[],
  upcomingReviews: TopicProgress[]
) {
 const today = new Date();
 
 return topics
 .map(topic => {
 const prog = progress.find(p => p.topicId === topic.id);
 
 let score = 0;
 
 // PRIORITY 1: Spaced Repetition - topics due for review get highest priority
 const isDueForReview = dueForReview.find(r => r.topicId === topic.id);
 if (isDueForReview) {
   score += 2000;
   const daysSinceLastStudy = prog?.lastStudied 
     ? Math.floor((Date.now() - new Date(prog.lastStudied).getTime()) / (1000 * 60 * 60 * 24))
     : 999;
   score += Math.min(daysSinceLastStudy * 50, 500);
 }

 // PRIORITY 2: Upcoming reviews in next 7 days
 const isUpcomingReview = upcomingReviews.find(r => r.topicId === topic.id);
 if (isUpcomingReview && !isDueForReview) {
   score += 800;
 }
 
 // PRIORITY 3: Deadline urgency
 if (topic.deadline) {
   const daysUntil = Math.floor(
     (new Date(topic.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
   );
   if (daysUntil < 0) score += 1000;
   else if (daysUntil <= 3) score += 500;
   else if (daysUntil <= 7) score += 300;
   else if (daysUntil <= 14) score += 150;
   else if (daysUntil <= 30) score += 50;
 }
 
 // PRIORITY 4: Topic priority
 score += (topic.priority || 5) * 10;
 
 // PRIORITY 5: Difficulty and progress
 score += (topic.difficultyScore || 5) * 5;
 if (prog && prog.remaining > 120) score += 20;
 if (prog && prog.completed === 0) score += 15;
 
 return { ...topic, calculatedScore: score };
 })
 .sort((a, b) => (b.calculatedScore || 0) - (a.calculatedScore || 0));
}

function categorizeSlotsByEnergy(slots: WeeklySlot[]): WeeklySlot[] {
 return slots.map(slot => {
 const hour = parseInt(slot.start.split(':')[0]);
 
 let energyType: 'high' | 'medium' | 'low';
 
 if (hour >= 8 && hour <= 11) {
 energyType = 'high';
 } else if (hour >= 14 && hour <= 17) {
 energyType = 'medium';
 } else {
 energyType = 'low';
 }
 
 return { ...slot, energyType };
 });
}

function matchTopicToSlot(topic: StudyTopic, slot: WeeklySlot): number {
 const topicEnergy = topic.energyLevel || 'medium';
 const slotEnergy = slot.energyType || 'medium';
 
 const energyMatch: Record<string, number> = {
 'high-high': 10,
 'high-medium': 5,
 'high-low': 0,
 'medium-high': 7,
 'medium-medium': 10,
 'medium-low': 7,
 'low-high': 3,
 'low-medium': 7,
 'low-low': 10
 };
 
 return energyMatch[`${topicEnergy}-${slotEnergy}`] || 5;
}

export async function planWeekSmart(
 studentId: string,
 weekStartISO: string
): Promise<PlannedEntry[]> {
 await ensureProgressForStudent(studentId);
 await loadWeeklySlotsAsync();
 
 const slots = categorizeSlotsByEnergy(
 getWeeklySlotsByStudent(studentId)
 .slice()
 .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start))
 );
 
 const topicsAll = loadTopics();
 const progress = getProgressByStudent(studentId);
 
 // Get topics due for review (spaced repetition)
 const dueForReview = getTopicsDueForReview(studentId);
 const upcomingReviews = getUpcomingReviews(studentId);
 
 const topicsBySubject = new Map<string, StudyTopic[]>();
 
 for (const topic of topicsAll) {
 const arr = topicsBySubject.get(topic.subjectId) || [];
 arr.push(topic);
 topicsBySubject.set(topic.subjectId, arr);
 }
 
 topicsBySubject.forEach((topicList, subjectId) => {
 const sorted = smartSortTopics(topicList, progress, dueForReview, upcomingReviews);
 topicsBySubject.set(subjectId, sorted as StudyTopic[]);
 });
 
 const out: PlannedEntry[] = [];
 
 const progMap = new Map<string, { remaining: number; done: boolean; isReview: boolean }>();
 for (const t of topicsAll) {
 const p = progress.find((pp) => pp.topicId === t.id);
 const isDueForReview = dueForReview.some(r => r.topicId === t.id);
 const isUpcomingReview = upcomingReviews.some(r => r.topicId === t.id);
 if (p)
 progMap.set(t.id, { 
   remaining: p.remaining, 
   done: !!p.completedFlag,
   isReview: isDueForReview || isUpcomingReview
 });
 }
 
 // Track daily minutes to respect weekly plan limits
 const dailyMinutes = new Map<number, number>();
 
 // Track which review topics have been assigned this week (prevent duplicates)
 const assignedReviewTopics = new Set<string>();

 for (const slot of slots) {
 const subjectTopics = topicsBySubject.get(slot.subjectId) || [];
 let remainingTime = minutesBetween(slot.start, slot.end);
 let currentMin = minutesBetween("00:00", slot.start);
 let guard = 0;
 const slotStartTime = minutesBetween("00:00", slot.start);
 const slotEndTime = minutesBetween("00:00", slot.end);
 const maxAllowedPerSlot = slotEndTime - slotStartTime;
 let usedInSlot = 0;
 
 while (remainingTime > 0 && guard++ < 200 && usedInSlot < maxAllowedPerSlot) {
 const candidateTopics = subjectTopics
 .filter(t => {
 const prog = progMap.get(t.id);
 
 // Review topics: only if not already assigned this week
 if (prog?.isReview) {
   return !assignedReviewTopics.has(t.id);
 }
 
 if (!prog || prog.done || prog.remaining <= 0) return false;
 
 if (t.prerequisites && t.prerequisites.length > 0) {
 for (const prereqId of t.prerequisites) {
 const prereqProg = progMap.get(prereqId);
 if (!prereqProg || !prereqProg.done) {
 return false;
 }
 }
 }
 
 return true;
 })
 .map(t => ({
 topic: t,
 matchScore: matchTopicToSlot(t, slot)
 }))
 .sort((a, b) => {
 if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
 const aCalc = (a.topic as any).calculatedScore || 0;
 const bCalc = (b.topic as any).calculatedScore || 0;
 return bCalc - aCalc;
 });
 
 if (candidateTopics.length === 0) break;
 
 const bestTopic = candidateTopics[0].topic;
 const prog = progMap.get(bestTopic.id)!;
 
 // For review topics, always allocate exactly 60 minutes
 const effectiveRemaining = prog.isReview 
   ? 60
   : prog.remaining;
 
 const allocated = Math.min(remainingTime, effectiveRemaining, maxAllowedPerSlot - usedInSlot);
 
 if (allocated <= 0) break;
 
 const date = dateFromWeekStart(weekStartISO, slot.day);
 const startH = String(Math.floor(currentMin / 60)).padStart(2,"0");
 const startM = String(currentMin % 60).padStart(2,"0");
 const start = `${startH}:${startM}`;
 const endMin = currentMin + allocated;
 const endH = String(Math.floor(endMin / 60)).padStart(2,"0");
 const endM = String(endMin % 60).padStart(2,"0");
 const end = `${endH}:${endM}`;
 
 // Calculate remaining after - always show remainder, even for reviews
 const calcRemaining = prog.isReview ? 0 : Math.max(0, prog.remaining - allocated);
 
 out.push({
 date,
 start,
 end,
 subjectId: slot.subjectId,
 topicId: bestTopic.id,
 allocated,
 remainingAfter: calcRemaining
 });
 
 // Mark review topics as assigned for this week
 if (prog.isReview) {
   assignedReviewTopics.add(bestTopic.id);
 } else {
   prog.remaining -= allocated;
   if (prog.remaining <= 0) prog.done = true;
 }
 
 remainingTime -= allocated;
 usedInSlot += allocated;
 currentMin = endMin;
 dailyMinutes.set(slot.day, (dailyMinutes.get(slot.day) || 0) + allocated);
 }
 }
 
 try {
 await savePlannedTopics(studentId, weekStartISO, out);
 } catch (error) {
 console.error('Failed to save planned topics:', error);
 throw error;
 }
 
 return out;
}
