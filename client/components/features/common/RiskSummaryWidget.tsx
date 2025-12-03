import { useEffect, useState } from 'react';
import { earlyWarningApi } from '@/lib/api/endpoints/early-warning.api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { AlertTriangle, Eye, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RiskSummaryWidget() {
 const [summary, setSummary] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [isVisible, setIsVisible] = useState(true);
 const navigate = useNavigate();

 useEffect(() => {
 loadSummary();
 }, []);

 const loadSummary = async () => {
 try {
 const data = await earlyWarningApi.getDashboardSummary();
 setSummary(data);
 } catch (error) {
 console.error('Risk özeti yüklenirken hata:', error);
 } finally {
 setLoading(false);
 }
 };

 const getAlertLevelColor = (level: string) => {
 switch (level) {
 case 'KRİTİK': return 'destructive';
 case 'YÜKSEK': return 'default';
 case 'ORTA': return 'secondary';
 case 'DÜŞÜK': return 'outline';
 default: return 'outline';
 }
 };

 if (!isVisible) {
 return (
 <Button
 variant="outline"
 size="sm"
 onClick={() => setIsVisible(true)}
 className="w-full"
 >
 <Eye className="h-4 w-4 mr-2" />
 Risk Özetini Göster
 </Button>
 );
 }

 if (loading) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Erken Uyarı Sistemi</CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-sm text-muted-foreground">Yükleniyor...</p>
 </CardContent>
 </Card>
 );
 }

 if (!summary || summary.totalActiveAlerts === 0) {
 return null;
 }

 return (
 <Card className="border-orange-200 dark:border-orange-900">
 <CardHeader>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <AlertTriangle className="h-5 w-5 text-orange-500" />
 <CardTitle>Erken Uyarı Sistemi</CardTitle>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => navigate('/risk')}
 >
 Tümünü Gör
 <ChevronRight className="h-4 w-4 ml-1" />
 </Button>
 </div>
 <CardDescription>
 Aktif uyarılar ve yüksek riskli öğrenciler
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-3 gap-4">
 <div className="text-center p-3 rounded-lg border border-border/50 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
 <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
 {summary.totalActiveAlerts}
 </div>
 <div className="text-xs font-medium text-muted-foreground mt-1">Aktif Uyarı</div>
 </div>
 <div className="text-center p-3 rounded-lg border border-border/50 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
 <div className="text-2xl font-bold text-red-600 dark:text-red-400">
 {summary.criticalAlerts}
 </div>
 <div className="text-xs font-medium text-muted-foreground mt-1">Kritik</div>
 </div>
 <div className="text-center p-3 rounded-lg border border-border/50 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20">
 <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
 {summary.highRiskStudentCount}
 </div>
 <div className="text-xs font-medium text-muted-foreground mt-1">Riskli Öğrenci</div>
 </div>
 </div>

 {summary.recentAlerts && summary.recentAlerts.length > 0 && (
 <div className="space-y-2">
 <div className="text-sm font-medium">Son Uyarılar</div>
 {summary.recentAlerts.slice(0, 3).map((alert: any) => (
 <div
 key={alert.id}
 className="flex items-center justify-between p-2 rounded-md border bg-card cursor-pointer"
 onClick={() => navigate(`/ogrenci/${alert.studentId}`)}
 >
 <div className="flex-1 min-w-0">
 <div className="text-sm font-medium truncate">{alert.title}</div>
 <div className="text-xs text-muted-foreground">{alert.alertType}</div>
 </div>
 <Badge variant={getAlertLevelColor(alert.alertLevel)} className="ml-2">
 {alert.alertLevel}
 </Badge>
 </div>
 ))}
 </div>
 )}

 <Button 
 className="w-full" 
 onClick={() => navigate('/risk')}
 >
 Risk Yönetim Paneline Git
 </Button>
 </CardContent>
 </Card>
 );
}
