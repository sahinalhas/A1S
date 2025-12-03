import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/organisms/Sheet';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Separator } from '@/components/atoms/Separator';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import { 
 Calendar, 
 Clock, 
 User, 
 Users, 
 MessageSquare, 
 CheckCircle2, 
 Edit,
 FileText,
 Target,
 Activity,
 Timer,
 MapPin,
 UserCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import type { CounselingSession } from '../types';
import { calculateSessionDuration } from '../utils/sessionHelpers';
import { SESSION_MODE_LABELS, SESSION_LOCATION_LABELS } from '@shared/constants/common.constants';

interface SessionDrawerProps {
 session: CounselingSession | null;
 open: boolean;
 onOpenChange: (open: boolean) => void;
 onEdit?: (session: CounselingSession) => void;
 onComplete?: (session: CounselingSession) => void;
}

function parseSessionTags(tags: string[] | string | undefined): string[] {
 if (!tags) return [];
 if (Array.isArray(tags)) return tags;
 try {
 return JSON.parse(tags);
 } catch {
 return [];
 }
}

function getParticipantInfo(session: CounselingSession): string {
 if (session.participantType ==="veli" && session.parentName) {
 return `${session.parentName} (${session.parentRelationship || 'Veli'})`;
 }
 if (session.participantType ==="öğretmen" && session.teacherName) {
 return `${session.teacherName}${session.teacherBranch ? ` - ${session.teacherBranch}` : ''}`;
 }
 if (session.participantType ==="diğer" && session.otherParticipantDescription) {
 return session.otherParticipantDescription;
 }
 return '';
}

export default function SessionDrawer({ 
 session, 
 open, 
 onOpenChange,
 onEdit,
 onComplete 
}: SessionDrawerProps) {
 if (!session) return null;

 const duration = session.exitTime 
 ? calculateSessionDuration(session.entryTime, session.exitTime)
 : null;

 const studentName = session.sessionType === 'individual'
 ? `${session.student?.name || ''} ${session.student?.surname || ''}`.trim() || 'Öğrenci'
 : session.groupName || 'Grup Görüşmesi';

 const isActive = !session.completed;
 const tags = parseSessionTags(session.sessionTags);
 const participantInfo = getParticipantInfo(session);
 const sessionModeLabel = SESSION_MODE_LABELS[session.sessionMode as keyof typeof SESSION_MODE_LABELS] || session.sessionMode;

 return (
 <Sheet open={open} onOpenChange={onOpenChange}>
 <SheetContent className="w-full sm:max-w-xl">
 <SheetHeader>
 <div className="flex items-center gap-2 mb-2">
 {session.sessionType === 'individual' ? (
 <User className="h-5 w-5 text-blue-600" />
 ) : (
 <Users className="h-5 w-5 text-purple-600" />
 )}
 <SheetTitle className="text-lg">{studentName}</SheetTitle>
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
 <SheetDescription className="text-base font-medium text-foreground">
 {session.topic}
 </SheetDescription>
 </SheetHeader>

 <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
 <div className="space-y-6">
 <div className="space-y-3">
 <h3 className="text-sm font-semibold flex items-center gap-2">
 <Calendar className="h-4 w-4" />
 Tarih ve Saat
 </h3>
 <div className="space-y-2 pl-6 text-sm">
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Tarih:</span>
 <span className="font-medium">
 {format(new Date(session.sessionDate), 'dd MMMM yyyy, EEEE', { locale: tr })}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Başlangıç:</span>
 <span className="font-medium">{session.entryTime}</span>
 </div>
 {session.exitTime && (
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Bitiş:</span>
 <span className="font-medium">{session.exitTime}</span>
 </div>
 )}
 {duration && (
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Süre:</span>
 <span className="font-medium">{duration} dakika</span>
 </div>
 )}
 {isActive && (
 <div className="flex items-center gap-2 text-amber-600 font-medium">
 <Timer className="h-4 w-4" />
 <span>Görüşme devam ediyor</span>
 </div>
 )}
 </div>
 </div>

 <Separator />

 <div className="space-y-3">
 <h3 className="text-sm font-semibold flex items-center gap-2">
 <Activity className="h-4 w-4" />
 Görüşme Detayları
 </h3>
 <div className="space-y-2 pl-6 text-sm">
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Tip:</span>
 <Badge variant="secondary">
 {session.sessionType === 'individual' ? 'Bireysel' : 'Grup'}
 </Badge>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Mod:</span>
 <Badge variant="outline">{sessionModeLabel}</Badge>
 </div>
 {session.sessionLocation && (
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground flex items-center gap-1">
 <MapPin className="h-3.5 w-3.5" />
 Konum:
 </span>
 <span className="font-medium">{SESSION_LOCATION_LABELS[session.sessionLocation] || session.sessionLocation}</span>
 </div>
 )}
 {participantInfo && (
 <div className="flex items-start justify-between gap-2">
 <span className="text-muted-foreground flex items-center gap-1">
 <UserCircle className="h-3.5 w-3.5" />
 Katılımcı:
 </span>
 <span className="font-medium text-right">{participantInfo}</span>
 </div>
 )}
 </div>
 </div>

 {tags.length > 0 && (
 <>
 <Separator />
 <div className="space-y-3">
 <h3 className="text-sm font-semibold">Etiketler</h3>
 <div className="flex flex-wrap gap-2 pl-6">
 {tags.map((tag, index) => (
 <Badge key={index} variant="secondary" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 </>
 )}

 {(session.detailedNotes || session.sessionDetails) && (
 <>
 <Separator />
 <div className="space-y-3">
 <h3 className="text-sm font-semibold flex items-center gap-2">
 <FileText className="h-4 w-4" />
 Notlar
 </h3>
 <div className="pl-6">
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
 {session.detailedNotes || session.sessionDetails}
 </p>
 </div>
 </div>
 </>
 )}

 {session.achievedOutcomes && (
 <>
 <Separator />
 <div className="space-y-3">
 <h3 className="text-sm font-semibold flex items-center gap-2">
 <Target className="h-4 w-4" />
 Ulaşılan Sonuçlar
 </h3>
 <div className="pl-6">
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
 {session.achievedOutcomes}
 </p>
 </div>
 </div>
 </>
 )}

 {session.actionItems && (
 <>
 <Separator />
 <div className="space-y-3">
 <h3 className="text-sm font-semibold flex items-center gap-2">
 <CheckCircle2 className="h-4 w-4" />
 Aksiyon Maddeleri
 </h3>
 <div className="pl-6">
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
 {session.actionItems}
 </p>
 </div>
 </div>
 </>
 )}

 {session.followUpPlan && (
 <>
 <Separator />
 <div className="space-y-3">
 <h3 className="text-sm font-semibold flex items-center gap-2">
 <MessageSquare className="h-4 w-4" />
 Takip Planı
 </h3>
 <div className="pl-6">
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
 {session.followUpPlan}
 </p>
 </div>
 </div>
 </>
 )}

 {session.sessionType === 'group' && session.students && session.students.length > 0 && (
 <>
 <Separator />
 <div className="space-y-3">
 <h3 className="text-sm font-semibold flex items-center gap-2">
 <Users className="h-4 w-4" />
 Katılan Öğrenciler ({session.students.length})
 </h3>
 <div className="pl-6 space-y-1">
 {session.students.map((student, index) => (
 <div key={student.id} className="text-sm flex items-center gap-2">
 <span className="text-muted-foreground">{index + 1}.</span>
 <span className="font-medium">{student.name} {student.surname}</span>
 <span className="text-xs text-muted-foreground">({student.class})</span>
 </div>
 ))}
 </div>
 </div>
 </>
 )}
 </div>
 </ScrollArea>

 <div className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t flex gap-2">
 {onEdit && (
 <Button
 variant="outline"
 className="flex-1"
 onClick={() => onEdit(session)}
 >
 <Edit className="h-4 w-4 mr-2" />
 Düzenle
 </Button>
 )}
 {isActive && onComplete && (
 <Button
 className="flex-1"
 onClick={() => onComplete(session)}
 >
 <CheckCircle2 className="h-4 w-4 mr-2" />
 Tamamla
 </Button>
 )}
 </div>
 </SheetContent>
 </Sheet>
 );
}
