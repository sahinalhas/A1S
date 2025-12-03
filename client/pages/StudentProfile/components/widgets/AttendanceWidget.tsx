import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Calendar, AlertTriangle } from "lucide-react";
import { getAttendanceByStudent } from "@/lib/api/endpoints/attendance.api";

interface AttendanceWidgetProps {
  studentId: string;
}

export function AttendanceWidget({ studentId }: AttendanceWidgetProps) {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, absent: 0, lastAbsent: '' });

  useEffect(() => {
    loadAttendance();
  }, [studentId]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const records = await getAttendanceByStudent(studentId);
      setAttendance(records);

      const absent = records.filter(r => r.status === 'Devamsız').length;
      const sortedRecords = records
        .filter(r => r.status === 'Devamsız')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const lastAbsent = sortedRecords.length > 0 
        ? new Date(sortedRecords[0].date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
        : '';

      setStats({ total: records.length, absent, lastAbsent });
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const absenceRate = stats.total > 0 ? (stats.absent / stats.total) * 100 : 0;
  const isHighAbsence = absenceRate > 15;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          Devamsızlık
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">{stats.absent}</span>
              <Badge variant={isHighAbsence ? "destructive" : "secondary"} className="text-xs">
                {absenceRate.toFixed(0)}%
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <div>Toplam {stats.total} kayıt</div>
              {stats.lastAbsent && (
                <div className="flex items-center gap-1">
                  {isHighAbsence && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                  Son: {stats.lastAbsent}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
