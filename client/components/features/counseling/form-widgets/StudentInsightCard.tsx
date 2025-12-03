import { MessageSquare, Calendar, AlertTriangle, Sparkles } from "lucide-react";
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
    <div className="border border-violet-200/50 dark:border-violet-800/30 rounded-lg bg-white/60 dark:bg-slate-900/40 p-3 space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400">
        <Sparkles className="h-3 w-3" />
        <span>Öğrenci Bilgileri</span>
      </div>

      <div className="p-2 rounded-md bg-slate-50/80 dark:bg-slate-800/40">
        <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{studentName}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{className}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          <MessageSquare className="h-3 w-3 text-blue-500" />
          <span className="text-slate-600 dark:text-slate-400">Görüşme:</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">{totalSessions}</span>
        </div>

        {riskLevel && (
          <div className="flex items-center gap-1.5 text-xs">
            <AlertTriangle className="h-3 w-3 text-orange-500" />
            <Badge variant={getRiskColor(riskLevel)} className="text-[10px] px-1.5 py-0">{riskLevel}</Badge>
          </div>
        )}
      </div>

      {lastSession && (
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/40">
          <div className="flex items-start gap-1.5">
            <Calendar className="h-3 w-3 text-purple-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Son görüşme</p>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{lastSession.topic}</p>
              <p className="text-[10px] text-slate-400">
                {format(new Date(lastSession.date), 'd MMM yyyy', { locale: tr })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
