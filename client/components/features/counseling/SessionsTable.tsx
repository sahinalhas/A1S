import { Download, Eye, Filter, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import {
 Tooltip,
 TooltipContent,
 TooltipProvider,
 TooltipTrigger,
} from "@/components/organisms/Tooltip";

import type { CounselingSession } from "./types";
import { calculateSessionDuration } from "./utils/sessionHelpers";

interface SessionsTableProps {
 sessions: CounselingSession[];
 onExport: () => void;
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

function parseSessionTags(tags: string[] | string | undefined): string[] {
 if (!tags) return [];
 if (Array.isArray(tags)) return tags;
 try {
 return JSON.parse(tags);
 } catch {
 return [];
 }
}

function TagsCell({ tags }: { tags: string[] }) {
 if (!tags || tags.length === 0) return <span className="text-xs text-muted-foreground">-</span>;

 const visibleTags = tags.slice(0, 3);
 const remainingCount = tags.length - 3;

 return (
 <div className="flex items-center gap-1 flex-wrap">
 {visibleTags.map((tag, index) => (
 <Badge key={index} variant="secondary" className="text-xs">
 {tag}
 </Badge>
 ))}
 {remainingCount > 0 && (
 <TooltipProvider>
 <Tooltip>
 <TooltipTrigger asChild>
 <Badge variant="outline" className="text-xs cursor-help">
 +{remainingCount}
 </Badge>
 </TooltipTrigger>
 <TooltipContent>
 <div className="flex flex-wrap gap-1 max-w-xs">
 {tags.slice(3).map((tag, index) => (
 <Badge key={index} variant="secondary" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 </TooltipContent>
 </Tooltip>
 </TooltipProvider>
 )}
 </div>
 );
}

export default function SessionsTable({ sessions, onExport }: SessionsTableProps) {
 return (
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle>Görüşme Kayıtları</CardTitle>
 <CardDescription>Tüm rehberlik görüşmeleri</CardDescription>
 </div>
 <div className="flex gap-2">
 <Button variant="outline" size="sm" className="gap-2">
 <Filter className="h-4 w-4" />
 Filtrele
 </Button>
 <Button variant="outline" size="sm" className="gap-2" onClick={onExport}>
 <Download className="h-4 w-4" />
 Excel İndir
 </Button>
 </div>
 </div>
 </CardHeader>
 <CardContent>
 {sessions.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-12">
 <Eye className="h-12 w-12 text-muted-foreground mb-4" />
 <p className="text-lg font-medium text-muted-foreground">Henüz kayıt bulunmuyor</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b text-sm font-medium text-muted-foreground">
 <th className="text-left px-4 py-3">Tarih</th>
 <th className="text-left px-4 py-3">Başlangıç</th>
 <th className="text-left px-4 py-3">Bitiş</th>
 <th className="text-left px-4 py-3">Öğrenci(ler)</th>
 <th className="text-left px-4 py-3">Tip</th>
 <th className="text-left px-4 py-3">Katılımcı</th>
 <th className="text-left px-4 py-3">Konu</th>
 <th className="text-left px-4 py-3">Etiketler</th>
 <th className="text-left px-4 py-3">Süre</th>
 <th className="text-left px-4 py-3">Durum</th>
 <th className="text-left px-4 py-3">Notlar</th>
 </tr>
 </thead>
 <tbody>
 {sessions.map((session) => {
 const duration = calculateSessionDuration(session.entryTime, session.exitTime || '');
 const studentNames = session.sessionType === 'individual'
 ? session.student?.name
 : session.students?.map(s => s.name).join(', ') || session.groupName;
 const participantInfo = getParticipantInfo(session);
 const tags = parseSessionTags(session.sessionTags);

 return (
 <tr key={session.id} className="border-b">
 <td className="px-4 py-3 text-sm">
 {new Date(session.sessionDate).toLocaleDateString('tr-TR')}
 </td>
 <td className="px-4 py-3 text-sm">{session.entryTime}</td>
 <td className="px-4 py-3 text-sm">{session.exitTime || '-'}</td>
 <td className="px-4 py-3 text-sm font-medium">{studentNames}</td>
 <td className="px-4 py-3">
 <Badge variant={session.sessionType === 'individual' ? 'default' : 'secondary'} className="text-xs">
 {session.sessionType === 'individual' ? 'Bireysel' : 'Grup'}
 </Badge>
 </td>
 <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
 {participantInfo || '-'}
 </td>
 <td className="px-4 py-3 text-sm max-w-md">
 <div className="flex flex-col gap-2">
 {session.topic?.split('>').map((level: string, idx: number) => (
 <div key={idx} className="flex flex-col gap-0.5">
 <span className="text-xs text-muted-foreground font-medium">
 {idx + 1}. Aşama
 </span>
 <span className="text-xs font-medium">{level.trim()}</span>
 </div>
 ))}
 </div>
 </td>
 <td className="px-4 py-3 max-w-xs">
 <TagsCell tags={tags} />
 </td>
 <td className="px-4 py-3 text-sm">{duration ? `${duration} dk` : '-'}</td>
 <td className="px-4 py-3">
 {session.completed ? (
 <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
 <CheckCircle2 className="h-3 w-3 mr-1" />
 Tamamlandı
 </Badge>
 ) : (
 <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
 <Clock className="h-3 w-3 mr-1" />
 Devam Ediyor
 </Badge>
 )}
 </td>
 <td className="px-4 py-3 max-w-md">
 <p className="text-xs text-muted-foreground truncate">
 {session.detailedNotes || session.sessionDetails || '-'}
 </p>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 )}
 </CardContent>
 </Card>
 );
}
