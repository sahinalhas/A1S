import { useMemo } from 'react';
import type { CounselingSession } from '@/components/features/counseling/types';
import { calculateSessionDuration } from '@/components/features/counseling/utils/sessionHelpers';

export interface SessionStats {
 total: number;
 active: number;
 completed: number;
 completedToday: number;
 completedThisWeek: number;
 completedThisMonth: number;
 individual: number;
 group: number;
 averageDuration: number;
 totalDuration: number;
 sessionsByType: Record<string, number>;
 sessionsByMode: Record<string, number>;
 mostActiveDay: string;
}

export function useSessionStats(sessions: CounselingSession[]): SessionStats {
 return useMemo(() => {
 const now = new Date();
 const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
 const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
 const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

 const stats: SessionStats = {
 total: sessions.length,
 active: 0,
 completed: 0,
 completedToday: 0,
 completedThisWeek: 0,
 completedThisMonth: 0,
 individual: 0,
 group: 0,
 averageDuration: 0,
 totalDuration: 0,
 sessionsByType: {},
 sessionsByMode: {},
 mostActiveDay: '-',
 };

 const durations: number[] = [];
 const dayCounts: Record<string, number> = {};

 sessions.forEach((session) => {
 if (session.completed) {
 stats.completed++;
 
 const sessionDate = new Date(session.sessionDate);
 if (sessionDate >= today) stats.completedToday++;
 if (sessionDate >= weekAgo) stats.completedThisWeek++;
 if (sessionDate >= monthAgo) stats.completedThisMonth++;

 const dayName = sessionDate.toLocaleDateString('tr-TR', { weekday: 'long' });
 dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;

 if (session.exitTime) {
 const duration = calculateSessionDuration(session.entryTime, session.exitTime);
 if (duration) {
 durations.push(duration);
 stats.totalDuration += duration;
 }
 }
 } else {
 stats.active++;
 }

 if (session.sessionType === 'individual') stats.individual++;
 else stats.group++;

 stats.sessionsByType[session.sessionType] = 
 (stats.sessionsByType[session.sessionType] || 0) + 1;
 
 stats.sessionsByMode[session.sessionMode] = 
 (stats.sessionsByMode[session.sessionMode] || 0) + 1;
 });

 if (durations.length > 0) {
 stats.averageDuration = Math.round(
 durations.reduce((sum, d) => sum + d, 0) / durations.length
 );
 }

 if (Object.keys(dayCounts).length > 0) {
 stats.mostActiveDay = Object.entries(dayCounts).reduce((a, b) => 
 b[1] > a[1] ? b : a
 )[0];
 }

 return stats;
 }, [sessions]);
}
