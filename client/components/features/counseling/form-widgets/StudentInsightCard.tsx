import { MessageSquare, Calendar, AlertTriangle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";

interface StudentInsightCardProps {
 studentName: string;
 className: string;
 lastSession?: {
 date: string;
 topic: string;
 };
 totalSessions?: number;
 riskLevel?: 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik';
}

export default function StudentInsightCard({ 
 studentName, 
 className, 
 lastSession,
 totalSessions = 0,
 riskLevel
}: StudentInsightCardProps) {
 const getRiskColor = (risk?: string) => {
 switch (risk) {
 case 'Kritik': return 'destructive';
 case 'Yüksek': return 'destructive';
 case 'Orta': return 'default';
 case 'Düşük': return 'secondary';
 default: return 'secondary';
 }
 };

 return (
 <Card className="border border-violet-200/40 dark:border-violet-800/30 bg-white/40 dark:bg-slate-900/40">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm flex items-center gap-2">
 <div className="p-1 rounded-lg bg-violet-100/50 dark:bg-violet-900/20">
 <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
 </div>
 <span className="font-semibold text-violet-700 dark:text-violet-300">
 Öğrenci Bilgileri
 </span>
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="p-2.5 rounded-lg bg-slate-50/60 dark:bg-slate-800/40">
 <p className="font-semibold text-base text-slate-800 dark:text-slate-100">{studentName}</p>
 <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{className}</p>
 </div>

 {riskLevel && (
 <div className="flex items-center gap-2 p-2.5 rounded-lg bg-orange-50/60 dark:bg-orange-950/15 border border-orange-200/30 dark:border-orange-800/20">
 <AlertTriangle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
 <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Risk:</span>
 <Badge variant={getRiskColor(riskLevel)} className="text-xs">{riskLevel}</Badge>
 </div>
 )}

 <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/15 border border-blue-200/30 dark:border-blue-800/20">
 <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
 <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Toplam Görüşme:</span>
 <span className="font-semibold text-sm text-blue-700 dark:text-blue-300">{totalSessions}</span>
 </div>

 {lastSession && (
 <div className="pt-2 border-t border-violet-200/30 dark:border-violet-800/20">
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Son Görüşme</p>
 <div className="flex items-start gap-2 p-2.5 rounded-lg bg-purple-50/60 dark:bg-purple-950/15 border border-purple-200/30 dark:border-purple-800/20">
 <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
 <div className="text-sm">
 <p className="font-medium text-slate-800 dark:text-slate-100">{lastSession.topic}</p>
 <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
 {format(new Date(lastSession.date), 'dd MMMM yyyy', { locale: tr })}
 </p>
 </div>
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 );
}
