import { motion } from "framer-motion";
import { Calendar, Clock, User, Users, Timer, Bell, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";

import type { CounselingSession } from "./types";
import { getElapsedTime, getTimerColor } from "./utils/sessionHelpers";

interface SessionCardProps {
 session: CounselingSession;
 onComplete: () => void;
 onExtend: () => void;
 extendPending: boolean;
}

function getParticipantInfo(session: CounselingSession): string {
 if (session.participantType ==="veli" && session.parentName) {
 return `Veli: ${session.parentName} (${session.parentRelationship || 'Veli'})`;
 }
 if (session.participantType ==="öğretmen" && session.teacherName) {
 return `Öğretmen: ${session.teacherName}${session.teacherBranch ? ` - ${session.teacherBranch}` : ''}`;
 }
 if (session.participantType ==="diğer" && session.otherParticipantDescription) {
 return `Katılımcı: ${session.otherParticipantDescription}`;
 }
 return '';
}

export default function SessionCard({ session, onComplete, onExtend, extendPending }: SessionCardProps) {
 const elapsed = getElapsedTime(session.entryTime, session.sessionDate);
 const timerColor = getTimerColor(elapsed, session.extensionGranted);
 const participantInfo = getParticipantInfo(session);
 
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 >
 <Card className="">
 <CardHeader>
 <div className="flex items-start justify-between">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 {session.sessionType === 'individual' ? (
 <User className="h-5 w-5 text-primary" />
 ) : (
 <Users className="h-5 w-5 text-secondary" />
 )}
 <CardTitle>
 {session.sessionType === 'individual' 
 ? `${session.student?.name || ''} ${session.student?.surname || ''}`.trim()
 : session.groupName || 'Grup Görüşmesi'}
 </CardTitle>
 <Badge variant={session.sessionType === 'individual' ? 'default' : 'secondary'}>
 {session.sessionType === 'individual' ? 'Bireysel' : 'Grup'}
 </Badge>
 </div>
 {session.sessionType === 'group' && session.students && (
 <p className="text-sm text-muted-foreground">
 {session.students.map(s => s.name).join(', ')}
 </p>
 )}
 {participantInfo && (
 <p className="text-sm text-muted-foreground italic">
 {participantInfo}
 </p>
 )}
 </div>
 <div className="text-right space-y-1">
 <div className={cn("text-2xl font-bold tabular-nums", timerColor)}>
 <Timer className="h-4 w-4 inline mr-1" />
 {elapsed} dk
 </div>
 {elapsed >= 30 && (
 <Badge variant="outline" className="text-xs">
 <Bell className="h-3 w-3 mr-1" />
 {elapsed >= (session.extensionGranted ? 75 : 60) 
 ? `${session.extensionGranted ? '75' : '60'}+ dakika` 
 : `${(session.extensionGranted ? 75 : 60) - elapsed} dk kaldı`}
 </Badge>
 )}
 </div>
 </div>
 <CardDescription className="flex items-center gap-4 mt-2">
 <span className="flex items-center gap-1">
 <Calendar className="h-4 w-4" />
 {new Date(session.sessionDate).toLocaleDateString('tr-TR')}
 </span>
 <span className="flex items-center gap-1">
 <Clock className="h-4 w-4" />
 {session.entryTime}
 </span>
 <span>•</span>
 <span>{session.topic}</span>
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="flex justify-end gap-2">
 {elapsed >= 55 && !session.extensionGranted && (
 <Button
 variant="secondary"
 onClick={onExtend}
 disabled={extendPending}
 className="gap-2"
 >
 {extendPending ? (
 <Loader2 className="h-4 w-4" />
 ) : (
 <Plus className="h-4 w-4" />
 )}
 15 Dakika Uzat
 </Button>
 )}
 <Button
 onClick={onComplete}
 className="gap-2"
 >
 <CheckCircle2 className="h-4 w-4" />
 Görüşmeyi Tamamla
 </Button>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 );
}
