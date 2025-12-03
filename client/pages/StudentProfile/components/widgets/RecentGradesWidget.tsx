import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { loadAcademics } from "@/lib/api/endpoints/academic.api";

interface RecentGradesWidgetProps {
  studentId: string;
}

export function RecentGradesWidget({ studentId }: RecentGradesWidgetProps) {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    loadGrades();
  }, [studentId]);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const records = await loadAcademics(studentId);
      const sortedRecords = records.sort((a, b) => b.term.localeCompare(a.term)).slice(0, 3);
      setGrades(sortedRecords);

      // Trend hesapla
      if (sortedRecords.length >= 2) {
        const latest = sortedRecords[0].gpa || 0;
        const previous = sortedRecords[1].gpa || 0;
        if (latest > previous + 0.2) setTrend('up');
        else if (latest < previous - 0.2) setTrend('down');
        else setTrend('stable');
      }
    } catch (error) {
      console.error('Error loading grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (gpa: number) => {
    if (gpa >= 85) return "text-green-600";
    if (gpa >= 70) return "text-blue-600";
    if (gpa >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium flex items-center justify-between">
          <span>Son Notlar</span>
          <TrendIcon className={`h-3 w-3 ${trendColor}`} />
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        ) : grades.length > 0 ? (
          <div className="space-y-1.5">
            {grades.map((grade, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{grade.term}</span>
                <span className={`font-semibold ${getGradeColor(grade.gpa || 0)}`}>
                  {grade.gpa?.toFixed(1) || '-'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">Henüz not bilgisi yok</p>
        )}
      </CardContent>
    </Card>
  );
}
