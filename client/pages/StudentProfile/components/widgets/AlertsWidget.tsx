import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { AlertCircle, CheckCircle } from "lucide-react";
import { earlyWarningApi } from "@/lib/api/endpoints/early-warning.api";
import { Button } from "@/components/atoms/Button";

interface AlertsWidgetProps {
  studentId: string;
}

export function AlertsWidget({ studentId }: AlertsWidgetProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [studentId]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await earlyWarningApi.getAlertsByStudent(studentId);
      const activeAlerts = Array.isArray(data) 
        ? data.filter(a => a.status === 'AÇIK' || a.status === 'İNCELENİYOR')
        : [];
      setAlerts(activeAlerts.slice(0, 3));
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (severity?.toLowerCase()) {
      case 'high': case 'critical': return 'destructive';
      case 'medium': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3" />
          Aktif Uyarılar
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-1.5">
            {alerts.map((alert, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <Badge variant={getSeverityColor(alert.severity)} className="text-[10px] px-1.5 py-0 h-5 mt-0.5 shrink-0">
                  {alert.type || 'Uyarı'}
                </Badge>
                <span className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                  {alert.message || alert.description || 'Detay yok'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-green-600 justify-center py-2">
            <CheckCircle className="h-3 w-3" />
            <span>Aktif uyarı yok</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
