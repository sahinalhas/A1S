/**
 * Profile Update Timeline Component
 * Profil güncellemelerinin zaman çizelgesi
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { ScrollArea } from "@/components/organisms/ScrollArea";
import { Skeleton } from "@/components/atoms/Skeleton";
import { 
 Clock, 
 CheckCircle2, 
 AlertCircle, 
 FileText,
 MessageSquare,
 ClipboardList,
 GraduationCap,
 Users
} from "lucide-react";
import { useLiveProfile } from "@/hooks/features/live-profile/live-profile.hooks";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";

interface ProfileUpdateTimelineProps {
 studentId: string;
 maxItems?: number;
}

export default function ProfileUpdateTimeline({ studentId, maxItems = 10 }: ProfileUpdateTimelineProps) {
 const { syncLogs, isLoading } = useLiveProfile(studentId);

 const sourceIcons: Record<string, any> = {
 counseling_session: MessageSquare,
 survey_response: ClipboardList,
 exam_result: GraduationCap,
 behavior_incident: AlertCircle,
 meeting_note: FileText,
 parent_meeting: Users,
 self_assessment: CheckCircle2,
 };

 const sourceLabels: Record<string, string> = {
 counseling_session: 'Görüşme',
 survey_response: 'Anket',
 exam_result: 'Sınav',
 behavior_incident: 'Davranış Kaydı',
 meeting_note: 'Görüşme Notu',
 parent_meeting: 'Veli Görüşmesi',
 self_assessment: 'Öz Değerlendirme',
 attendance: 'Devamsızlık',
 };

 const domainLabels: Record<string, string> = {
 academic: 'Akademik',
 social_emotional: 'Sosyal-Duygusal',
 behavioral: 'Davranışsal',
 motivation: 'Motivasyon',
 risk_factors: 'Risk Faktörleri',
 talents_interests: 'Yetenek ve İlgiler',
 health: 'Sağlık',
 family: 'Aile',
 };

 const actionColors: Record<string, string> = {
 created: 'bg-green-100 text-green-700',
 updated: 'bg-blue-100 text-blue-700',
 validated: 'bg-purple-100 text-purple-700',
 rejected: 'bg-red-100 text-red-700',
 };

 if (isLoading) {
 return (
 <Card>
 <CardHeader>
 <Skeleton className="h-6 w-1/3" />
 <Skeleton className="h-4 w-1/2 mt-2" />
 </CardHeader>
 <CardContent>
 <Skeleton className="h-40 w-full" />
 </CardContent>
 </Card>
 );
 }

 const displayLogs = syncLogs.slice(0, maxItems);

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Clock className="h-5 w-5" />
 Profil Güncelleme Geçmişi
 </CardTitle>
 <CardDescription>
 Öğrenci profili güncellemelerinin zaman çizelgesi
 </CardDescription>
 </CardHeader>
 <CardContent>
 {displayLogs.length === 0 ? (
 <div className="text-center py-8 text-gray-500">
 Henüz profil güncellemesi yapılmamış
 </div>
 ) : (
 <ScrollArea className="h-[400px] pr-4">
 <div className="space-y-4">
 {displayLogs.map((log, index) => {
 const Icon = sourceIcons[log.source] || FileText;
 const isLast = index === displayLogs.length - 1;

 return (
 <div key={log.id} className="relative">
 {/* Timeline line */}
 {!isLast && (
 <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200" />
 )}

 <div className="flex gap-4">
 {/* Icon */}
 <div className="relative z-10 flex-shrink-0">
 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
 <Icon className="h-4 w-4 text-blue-600" />
 </div>
 </div>

 {/* Content */}
 <div className="flex-1 pb-6">
 <div className="flex items-start justify-between gap-2 mb-2">
 <div className="flex-1">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="font-medium text-sm">
 {sourceLabels[log.source] || log.source}
 </span>
 <Badge variant="outline" className="text-xs">
 {domainLabels[log.domain] || log.domain}
 </Badge>
 <Badge className={`text-xs ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
 {log.action}
 </Badge>
 </div>
 <p className="text-xs text-gray-500 mt-1">
 {format(new Date(log.timestamp), 'PPp', { locale: tr })}
 </p>
 </div>

 {log.validationScore !== null && (
 <div className="flex items-center gap-1">
 <span className="text-xs text-gray-500">Güven:</span>
 <span className="text-xs font-semibold text-blue-600">
 {log.validationScore}%
 </span>
 </div>
 )}
 </div>

 {log.aiReasoning && (
 <div className="bg-gray-50 rounded-md p-3 mt-2">
 <p className="text-xs text-gray-600 leading-relaxed">
 {log.aiReasoning}
 </p>
 </div>
 )}

 {log.extractedInsights && Object.keys(log.extractedInsights).length > 0 && (
 <div className="mt-2 flex flex-wrap gap-1">
 {Object.entries(log.extractedInsights).slice(0, 3).map(([key, value]) => (
 <Badge key={key} variant="secondary" className="text-xs">
 {key}: {String(value).substring(0, 20)}
 {String(value).length > 20 && '...'}
 </Badge>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </ScrollArea>
 )}
 </CardContent>
 </Card>
 );
}
