import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Target, CheckCircle } from "lucide-react";
import { getInterventionsByStudent } from "@/lib/api/endpoints/academic.api";

interface ActiveInterventionsWidgetProps {
  studentId: string;
}

export function ActiveInterventionsWidget({ studentId }: ActiveInterventionsWidgetProps) {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterventions();
  }, [studentId]);

  const loadInterventions = async () => {
    try {
      setLoading(true);
      const data = await getInterventionsByStudent(studentId);
      const active = Array.isArray(data) 
        ? data.filter(i => i.status === 'Devam' || i.status === 'Planlandı')
        : [];
      setInterventions(active.slice(0, 3));
    } catch (error) {
      console.error('Error loading interventions:', error);
      setInterventions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium flex items-center gap-1.5">
          <Target className="h-3 w-3" />
          Aktif Müdahaleler
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        ) : interventions.length > 0 ? (
          <div className="space-y-1.5">
            {interventions.map((intervention, idx) => (
              <div key={idx} className="text-xs">
                <div className="font-medium text-foreground leading-snug">
                  {intervention.type || intervention.title || 'Müdahale'}
                </div>
                <div className="text-muted-foreground text-[11px] leading-snug line-clamp-1">
                  {intervention.goal || intervention.description || ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center py-2">
            <CheckCircle className="h-3 w-3" />
            <span>Aktif müdahale yok</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
