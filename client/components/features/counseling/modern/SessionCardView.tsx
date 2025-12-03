import { motion } from 'framer-motion';
import { Calendar, Clock, User, Users, MessageSquare, CheckCircle2, Timer } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import type { CounselingSession } from '../types';
import { calculateSessionDuration } from '../utils/sessionHelpers';
import { SESSION_MODE_LABELS } from '@shared/constants/common.constants';

interface SessionCardViewProps {
 sessions: CounselingSession[];
 onSelectSession: (session: CounselingSession) => void;
 onCompleteSession?: (session: CounselingSession) => void;
}

export default function SessionCardView({ 
 sessions, 
 onSelectSession,
 onCompleteSession 
}: SessionCardViewProps) {
 if (sessions.length === 0) {
 return (
 <div className="flex flex-col items-center justify-center py-12 px-4">
 <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
 <p className="text-lg font-medium text-muted-foreground">Görüşme bulunamadı</p>
 <p className="text-sm text-muted-foreground text-center mt-2">
 Yeni görüşme başlatmak için yukarıdaki butonu kullanın
 </p>
 </div>
 );
 }

 return (
 <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
 {sessions.map((session, index) => {
 const duration = session.exitTime 
 ? calculateSessionDuration(session.entryTime, session.exitTime)
 : null;
 
 const studentName = session.sessionType === 'individual'
 ? session.student?.name
 : session.groupName || 'Grup Görüşmesi';

 const isActive = !session.completed;

 return (
 <motion.div
 key={session.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 >
 <Card 
 className=" cursor-pointer h-full flex flex-col"
 onClick={() => onSelectSession(session)}
 >
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between gap-2">
 <div className="flex items-center gap-2 flex-1 min-w-0">
 {session.sessionType === 'individual' ? (
 <User className="h-5 w-5 text-blue-600 flex-shrink-0" />
 ) : (
 <Users className="h-5 w-5 text-purple-600 flex-shrink-0" />
 )}
 <h3 className="font-semibold text-base truncate">{studentName}</h3>
 </div>
 <Badge 
 variant={isActive ? 'default' : 'outline'}
 className={isActive 
 ? 'bg-blue-50 text-blue-700 border-blue-200' 
 : 'bg-green-50 text-green-700 border-green-200'
 }
 >
 {isActive ? 'Aktif' : 'Tamamlandı'}
 </Badge>
 </div>
 </CardHeader>

 <CardContent className="flex-1 space-y-3 pb-3">
 <div className="space-y-2">
 <p className="text-sm font-medium text-foreground line-clamp-2">
 {session.topic}
 </p>
 {session.detailedNotes && (
 <p className="text-xs text-muted-foreground line-clamp-2">
 {session.detailedNotes}
 </p>
 )}
 </div>

 <div className="flex flex-wrap gap-2">
 <Badge variant="secondary" className="text-xs">
 {session.sessionType === 'individual' ? 'Bireysel' : 'Grup'}
 </Badge>
 {session.sessionMode && (
 <Badge variant="outline" className="text-xs">
 {SESSION_MODE_LABELS[session.sessionMode as keyof typeof SESSION_MODE_LABELS] || session.sessionMode}
 </Badge>
 )}
 </div>

 <div className="space-y-1.5 text-xs text-muted-foreground">
 <div className="flex items-center gap-2">
 <Calendar className="h-3.5 w-3.5" />
 <span>
 {format(new Date(session.sessionDate), 'dd MMMM yyyy, EEEE', { locale: tr })}
 </span>
 </div>
 <div className="flex items-center gap-2">
 <Clock className="h-3.5 w-3.5" />
 <span>
 {session.entryTime}
 {session.exitTime && ` - ${session.exitTime}`}
 {duration && (
 <span className="ml-1 text-foreground font-medium">
 ({duration} dk)
 </span>
 )}
 </span>
 </div>
 {isActive && (
 <div className="flex items-center gap-2 text-amber-600 font-medium">
 <Timer className="h-3.5 w-3.5" />
 <span>Görüşme devam ediyor</span>
 </div>
 )}
 </div>
 </CardContent>

 {isActive && onCompleteSession && (
 <CardFooter className="pt-3">
 <Button
 size="sm"
 variant="outline"
 className="w-full"
 onClick={(e) => {
 e.stopPropagation();
 onCompleteSession(session);
 }}
 >
 <CheckCircle2 className="h-4 w-4 mr-2" />
 Görüşmeyi Tamamla
 </Button>
 </CardFooter>
 )}
 </Card>
 </motion.div>
 );
 })}
 </div>
 );
}
