import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card/card';
import { Badge } from '@/components/atoms/Badge/badge';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Button } from '@/components/atoms/Button';
import { AlertCircle, CheckCircle, TrendingDown, Target, Award, Bell } from 'lucide-react';
import { toast } from 'sonner';

async function fetchAlerts(studentId?: string) {
 const url = studentId
 ? `/api/exam-management/alerts/student/${studentId}`
 : '/api/exam-management/alerts/unread';
 const response = await fetchWithSchool(url);
 const result = await response.json();
 if (!result.success) throw new Error(result.error);
 return result.data;
}

async function markAsRead(alertId: string) {
 const response = await fetchWithSchool(`/api/exam-management/alerts/${alertId}/read`, { method: 'PUT' });
 const result = await response.json();
 if (!result.success) throw new Error(result.error);
 return result;
}

interface AlertsWidgetProps {
 studentId?: string;
 showAll?: boolean;
}

export function AlertsWidget({ studentId, showAll = false }: AlertsWidgetProps) {
 const queryClient = useQueryClient();

 const { data: alerts, isLoading } = useQuery({
 queryKey: studentId ? ['student-alerts', studentId] : ['all-alerts'],
 queryFn: () => fetchAlerts(studentId),
 refetchInterval: 30000,
 });

 const markReadMutation = useMutation({
 mutationFn: markAsRead,
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: studentId ? ['student-alerts', studentId] : ['all-alerts'] });
 toast.success('Uyarı okundu olarak işaretlendi');
 },
 });

 const getAlertIcon = (type: string) => {
 switch (type) {
 case 'performance_drop':
 return <TrendingDown className="h-4 w-4" />;
 case 'goal_achieved':
 return <Target className="h-4 w-4" />;
 case 'at_risk':
 return <AlertCircle className="h-4 w-4" />;
 case 'milestone':
 return <Award className="h-4 w-4" />;
 default:
 return <Bell className="h-4 w-4" />;
 }
 };

 const getSeverityColor = (severity: string) => {
 switch (severity) {
 case 'high':
 return 'bg-red-100 text-red-700 border-red-200';
 case 'medium':
 return 'bg-yellow-100 text-yellow-700 border-yellow-200';
 case 'low':
 return 'bg-blue-100 text-blue-700 border-blue-200';
 default:
 return 'bg-gray-100 text-gray-700 border-gray-200';
 }
 };

 const displayAlerts = showAll ? alerts : alerts?.filter((a: any) => !a.is_read).slice(0, 5);

 if (isLoading) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Uyarılar</CardTitle>
 <CardDescription>Yükleniyor...</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 {[...Array(3)].map((_, i) => (
 <div key={i} className="h-16 bg-muted rounded" />
 ))}
 </div>
 </CardContent>
 </Card>
 );
 }

 return (
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="flex items-center gap-2">
 <Bell className="h-5 w-5 text-primary" />
 Uyarılar
 </CardTitle>
 <CardDescription>
 {showAll ? 'Tüm uyarılar' : 'Okunmamış uyarılar'}
 </CardDescription>
 </div>
 {!showAll && alerts && alerts.length > 0 && (
 <Badge variant="outline">
 {alerts.filter((a: any) => !a.is_read).length} yeni
 </Badge>
 )}
 </div>
 </CardHeader>
 <CardContent>
 {displayAlerts && displayAlerts.length > 0 ? (
 <div className="space-y-3">
 {displayAlerts.map((alert: any) => (
 <div
 key={alert.id}
 className={`border rounded-lg p-3 ${alert.is_read ? 'opacity-60' : ''}`}
 >
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1 space-y-1">
 <div className="flex items-center gap-2">
 <Badge variant="outline" className={getSeverityColor(alert.severity)}>
 <div className="flex items-center gap-1">
 {getAlertIcon(alert.alert_type)}
 <span className="text-xs">
 {alert.severity === 'high' && 'Yüksek'}
 {alert.severity === 'medium' && 'Orta'}
 {alert.severity === 'low' && 'Düşük'}
 </span>
 </div>
 </Badge>
 {studentId && alert.student_name && (
 <span className="text-xs text-muted-foreground">{alert.student_name}</span>
 )}
 </div>
 <h4 className="font-medium text-sm">{alert.title}</h4>
 <p className="text-sm text-muted-foreground">{alert.message}</p>
 <div className="text-xs text-muted-foreground">
 {new Date(alert.created_at).toLocaleString('tr-TR')}
 </div>
 </div>
 {!alert.is_read && (
 <Button
 size="sm"
 variant="ghost"
 onClick={() => markReadMutation.mutate(alert.id)}
 >
 <CheckCircle className="h-4 w-4" />
 </Button>
 )}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-8 text-muted-foreground">
 <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
 <p>Uyarı bulunmuyor</p>
 </div>
 )}
 </CardContent>
 </Card>
 );
}
