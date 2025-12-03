import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { Clock, Calendar, MessageSquare, FileText, Loader2, AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { ScrollArea } from "@/components/organisms/ScrollArea";
import { Separator } from "@/components/atoms/Separator";
import { Skeleton } from "@/components/atoms/Skeleton";

import { getStudentSessionHistory } from "@/lib/api/endpoints/counseling.api";
import { getNotesByStudent } from "@/lib/api/endpoints/notes.api";
import type { MeetingNote } from "@shared/types/meeting-notes.types";
import { SESSION_MODE_LABELS, type SessionMode } from "@shared/constants/common.constants";

interface PastMeetingHistoryProps {
 studentId: string;
 studentName: string;
}

export default function PastMeetingHistory({ studentId, studentName }: PastMeetingHistoryProps) {
 const { data: sessionStats, isLoading: sessionLoading } = useQuery({
 queryKey: ['student-sessions', studentId],
 queryFn: () => getStudentSessionHistory(studentId),
 enabled: !!studentId,
 });

 const { data: meetingNotes = [], isLoading: notesLoading } = useQuery({
 queryKey: ['meeting-notes', studentId],
 queryFn: () => getNotesByStudent(studentId),
 enabled: !!studentId,
 });

 const isLoading = sessionLoading || notesLoading;

 const getSessionModeLabel = (mode: string) => {
 return SESSION_MODE_LABELS[mode as SessionMode] || mode;
 };

 const formatDuration = (minutes: number) => {
 if (minutes === 0) return 'Devam ediyor';
 if (minutes < 60) return `${minutes} dk`;
 const hours = Math.floor(minutes / 60);
 const mins = minutes % 60;
 return mins > 0 ? `${hours}s ${mins}dk` : `${hours} saat`;
 };

 if (isLoading) {
 return (
 <Card className="border-2">
 <CardHeader>
 <CardTitle className="text-base flex items-center gap-2">
 <FileText className="h-5 w-5 text-muted-foreground" />
 Geçmiş Görüşmeler
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <Skeleton className="h-4 w-full" />
 <Skeleton className="h-4 w-3/4" />
 <Skeleton className="h-20 w-full" />
 </CardContent>
 </Card>
 );
 }

 const hasHistory = (sessionStats?.sessionCount ?? 0) > 0 || meetingNotes.length > 0;

 if (!hasHistory) {
 return (
 <Card className="border-2 border-dashed">
 <CardContent className="pt-6">
 <div className="flex flex-col items-center justify-center text-center py-8 space-y-3">
 <div className="p-3 rounded-full bg-muted">
 <AlertCircle className="h-8 w-8 text-muted-foreground" />
 </div>
 <div>
 <p className="font-medium text-muted-foreground">İlk Görüşme</p>
 <p className="text-sm text-muted-foreground">
 {studentName} ile daha önce görüşme kaydı yok
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 );
 }

 return (
 <Card className="border-2 fade-in-50 slide-in-from-top-2">
 <CardHeader className="pb-3">
 <CardTitle className="text-base flex items-center gap-2">
 <FileText className="h-5 w-5 text-primary" />
 Geçmiş Görüşmeler
 </CardTitle>
 <p className="text-sm text-muted-foreground">
 {studentName} için kayıtlı {sessionStats?.sessionCount ?? 0} görüşme
 </p>
 </CardHeader>
 <CardContent className="space-y-4">
 {/* Stats Summary */}
 {sessionStats && sessionStats.sessionCount > 0 && (
 <div className="flex flex-wrap gap-2">
 <Badge variant="outline" className="text-xs">
 <Calendar className="h-3 w-3 mr-1" />
 {sessionStats.sessionCount} Görüşme
 </Badge>
 {sessionStats.lastSessionDate && (
 <Badge variant="outline" className="text-xs">
 <Clock className="h-3 w-3 mr-1" />
 Son: {format(new Date(sessionStats.lastSessionDate), 'd MMM', { locale: tr })}
 </Badge>
 )}
 </div>
 )}

 <Separator />

 {/* Recent Topics */}
 {sessionStats && sessionStats.topics.length > 0 && (
 <div className="space-y-2">
 <p className="text-sm font-medium flex items-center gap-2">
 <MessageSquare className="h-4 w-4 text-muted-foreground" />
 Görüşülen Konular
 </p>
 <div className="flex flex-wrap gap-1.5">
 {sessionStats.topics.slice(0, 5).map((topic, idx) => (
 <Badge key={idx} variant="secondary" className="text-xs">
 {topic}
 </Badge>
 ))}
 {sessionStats.topics.length > 5 && (
 <Badge variant="secondary" className="text-xs">
 +{sessionStats.topics.length - 5} daha
 </Badge>
 )}
 </div>
 </div>
 )}

 <Separator />

 {/* Recent Sessions */}
 {sessionStats && sessionStats.history.length > 0 && (
 <div className="space-y-2">
 <p className="text-sm font-medium">Son Görüşmeler</p>
 <ScrollArea className="h-[180px] pr-3">
 <div className="space-y-3">
 {sessionStats.history.slice(0, 5).map((session) => (
 <div
 key={session.sessionId}
 className="p-3 rounded-lg bg-muted/50 space-y-1.5"
 >
 <div className="flex items-start justify-between gap-2">
 <p className="text-sm font-medium line-clamp-1">{session.topic}</p>
 <Badge variant="outline" className="text-xs shrink-0">
 {getSessionModeLabel(session.sessionMode)}
 </Badge>
 </div>
 <div className="flex items-center gap-3 text-xs text-muted-foreground">
 <span className="flex items-center gap-1">
 <Calendar className="h-3 w-3" />
 {format(new Date(session.sessionDate), 'd MMMM yyyy', { locale: tr })}
 </span>
 <span className="flex items-center gap-1">
 <Clock className="h-3 w-3" />
 {formatDuration(session.duration)}
 </span>
 </div>
 </div>
 ))}
 </div>
 </ScrollArea>
 </div>
 )}

 {/* Meeting Notes */}
 {meetingNotes.length > 0 && (
 <>
 <Separator />
 <div className="space-y-2">
 <p className="text-sm font-medium">Görüşme Notları</p>
 <ScrollArea className="h-[160px] pr-3">
 <div className="space-y-3">
 {meetingNotes.slice(0, 3).map((note: MeetingNote) => (
 <div
 key={note.id}
 className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 space-y-1.5 border border-blue-200 dark:border-blue-900"
 >
 <div className="flex items-center justify-between gap-2">
 <Badge variant="outline" className="text-xs">
 {note.type}
 </Badge>
 <span className="text-xs text-muted-foreground">
 {format(new Date(note.date), 'd MMM yyyy', { locale: tr })}
 </span>
 </div>
 <p className="text-xs text-muted-foreground line-clamp-2">{note.note}</p>
 {note.plan && (
 <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
 Plan: {note.plan}
 </p>
 )}
 </div>
 ))}
 </div>
 </ScrollArea>
 </div>
 </>
 )}
 </CardContent>
 </Card>
 );
}
