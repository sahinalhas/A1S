import type { ClassHour } from "../types";
import { SESSION_DURATION, TIME_CONVERSION, SESSION_COLORS } from "@/lib/constants/session.constants";
import { ANALYTICS_MESSAGES } from "@/lib/constants/messages.constants";

export function getCurrentClassHour(classHours: ClassHour[]): ClassHour | undefined {
 if (!classHours || !Array.isArray(classHours)) {
 return undefined;
 }
 
 const now = new Date();
 const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
 
 return classHours.find(hour => 
 currentTime >= hour.startTime && currentTime <= hour.endTime
 );
}

export function getElapsedTime(entryTime: string, sessionDate: string): number {
 const entry = new Date(`${sessionDate}T${entryTime}`);
 const now = new Date();
 const diff = Math.floor((now.getTime() - entry.getTime()) / TIME_CONVERSION.MS_TO_MINUTES);
 return diff;
}

export function getTimerColor(minutes: number, extensionGranted: boolean): string {
 const limit = extensionGranted ? SESSION_DURATION.EXTENDED : SESSION_DURATION.STANDARD;
 if (minutes >= limit - SESSION_DURATION.WARNING_THRESHOLD) return SESSION_COLORS.CRITICAL;
 if (minutes >= limit - SESSION_DURATION.CAUTION_THRESHOLD) return SESSION_COLORS.WARNING;
 if (minutes >= limit - SESSION_DURATION.ALERT_THRESHOLD) return SESSION_COLORS.CAUTION;
 return SESSION_COLORS.NORMAL;
}

export function calculateSessionDuration(entryTime: string, exitTime: string): number | null {
 if (!exitTime || !entryTime) return null;
 
 const duration = Math.floor(
 (new Date(`${TIME_CONVERSION.REFERENCE_DATE}T${exitTime}`).getTime() - 
 new Date(`${TIME_CONVERSION.REFERENCE_DATE}T${entryTime}`).getTime()) / TIME_CONVERSION.MS_TO_MINUTES
 );
 
 return duration;
}

export function getSessionName(session: { sessionType: 'individual' | 'group'; student?: { name: string; surname?: string }; groupName?: string }): string {
 return session.sessionType === 'individual' 
 ? `${session.student?.name || ''} ${session.student?.surname || ''}`.trim() || ANALYTICS_MESSAGES.UNKNOWN_STUDENT 
 : session.groupName || ANALYTICS_MESSAGES.GROUP_SESSION;
}
