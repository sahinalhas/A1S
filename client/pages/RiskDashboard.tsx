import { useState, useEffect } from 'react';
import { earlyWarningApi } from '@/lib/api/endpoints/early-warning.api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/Alert';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/organisms/Tooltip';
import { AlertTriangle, TrendingUp, Users, FileText, ChevronRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { EarlyWarningAlert } from '@shared/types';
import { AIToolsLayout } from '@/components/features/ai-tools/AIToolsLayout';
import { AIToolsLoadingState } from '@/components/features/ai-tools/AIToolsLoadingState';

export default function RiskDashboard() {
 const [summary, setSummary] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const navigate = useNavigate();

 useEffect(() => {
 loadDashboard();
 }, []);

 const loadDashboard = async () => {
 try {
 const data = await earlyWarningApi.getDashboardSummary();
 setSummary(data);
 } catch (error) {
 console.error('Dashboard yüklenirken hata:', error);
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

 const getAlertTypeIcon = (type: string) => {
 switch (type) {
 case 'AKADEMİK': return '';
 case 'DAVRANIŞSAL': return '';
 case 'DEVAMSIZLIK': return '📅';
 case 'SOSYAL-DUYGUSAL': return '💭';
 default: return '';
 }
 };

 if (loading) {
 return (
 <AIToolsLoadingState 
 icon={ShieldAlert}
 message="Risk verileri yükleniyor..."
 />
 );
 }

 return (
 <TooltipProvider>
 <div className="w-full max-w-7xl mx-auto py-6 space-y-6">
 <AIToolsLayout
 title="Risk Değerlendirme ve Erken Uyarı Sistemi"
 description="Öğrenci risk analizi, erken uyarılar ve müdahale önerileri"
 icon={ShieldAlert}
 >
 <Tabs defaultValue="alerts" className="space-y-6">
 <TabsList variant="minimal" className="w-full justify-start sm:justify-center">
 <Tooltip delayDuration={200}>
 <TooltipTrigger asChild>
 <TabsTrigger value="alerts" variant="minimal">
 <AlertTriangle className="h-4 w-4" />
 <span className="hidden sm:inline">Aktif Uyarılar</span>
 </TabsTrigger>
 </TooltipTrigger>
 <TooltipContent>Acil dikkat ve müdahale gereken mevcut uyarılar</TooltipContent>
 </Tooltip>
 <Tooltip delayDuration={200}>
 <TooltipTrigger asChild>
 <TabsTrigger value="students" variant="minimal">
 <Users className="h-4 w-4" />
 <span className="hidden sm:inline">Yüksek Riskli Öğrenciler</span>
 </TabsTrigger>
 </TooltipTrigger>
 <TooltipContent>Yoğun takip ve destek gerektiren öğrencilerin listesi</TooltipContent>
 </Tooltip>
 </TabsList>

 <TabsContent value="alerts" className="space-y-4 mt-0">
 <Card>
 <CardHeader>
 <CardTitle>Son Uyarılar</CardTitle>
 <CardDescription>
 Aktif ve incelenmesi gereken erken uyarılar
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 {summary?.recentAlerts?.length > 0 ? (
 summary.recentAlerts.map((alert: EarlyWarningAlert) => (
 <Alert key={alert.id} className="relative">
 <div className="flex items-start gap-4">
 <div className="text-2xl">{getAlertTypeIcon(alert.alertType)}</div>
 <div className="flex-1 space-y-2">
 <div className="flex items-center gap-2">
 <AlertTitle className="mb-0">{alert.title}</AlertTitle>
 <Badge variant={getAlertLevelColor(alert.alertLevel)}>
 {alert.alertLevel}
 </Badge>
 </div>
 <AlertDescription>{alert.description}</AlertDescription>
 <div className="flex items-center gap-2 text-xs text-muted-foreground">
 <span>{new Date(alert.created_at || '').toLocaleDateString('tr-TR')}</span>
 <span>•</span>
 <span>{alert.alertType}</span>
 </div>
 </div>
 <Button
 variant="ghost"
 size="icon"
 onClick={() => navigate(`/ogrenci/${alert.studentId}`)}
 >
 <ChevronRight className="h-4 w-4" />
 </Button>
 </div>
 </Alert>
 ))
 ) : (
 <p className="text-center text-muted-foreground py-8">
 Aktif uyarı bulunmamaktadır
 </p>
 )}
 
 {summary?.recentAlerts?.length > 0 && (
 <Button 
 variant="outline" 
 className="w-full"
 onClick={() => navigate('/risk/alerts')}
 >
 Tüm Uyarıları Görüntüle
 </Button>
 )}
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="students" className="space-y-4 mt-0">
 <Card>
 <CardHeader>
 <CardTitle>Yüksek Riskli Öğrenciler</CardTitle>
 <CardDescription>
 Acil müdahale gerektirebilecek öğrenciler
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {summary?.topRiskStudents?.length > 0 ? (
 summary.topRiskStudents.map((student: any) => (
 <div
 key={student.studentId}
 className="flex items-center justify-between p-3 border rounded-lg cursor-pointer"
 onClick={() => navigate(`/ogrenci/${student.studentId}`)}
 >
 <div className="flex-1">
 <div className="font-medium">{student.name} {student.surname}</div>
 <div className="text-sm text-muted-foreground">{student.className}</div>
 </div>
 <div className="flex items-center gap-3">
 <div className="text-right">
 <div className="text-sm font-medium">
 Risk Skoru: {student.overallRiskScore?.toFixed(1)}
 </div>
 <Badge variant={getAlertLevelColor(student.riskLevel)}>
 {student.riskLevel}
 </Badge>
 </div>
 <ChevronRight className="h-4 w-4 text-muted-foreground" />
 </div>
 </div>
 ))
 ) : (
 <p className="text-center text-muted-foreground py-8">
 Yüksek riskli öğrenci bulunmamaktadır
 </p>
 )}
 </div>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>

 <div className="grid gap-4 md:grid-cols-4">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Aktif Uyarılar</CardTitle>
 <AlertTriangle className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{summary?.totalActiveAlerts || 0}</div>
 <p className="text-xs text-muted-foreground">
 {summary?.criticalAlerts || 0} kritik uyarı
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Yüksek Riskli Öğrenci</CardTitle>
 <Users className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{summary?.highRiskStudentCount || 0}</div>
 <p className="text-xs text-muted-foreground">
 Müdahale gerekiyor
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Bekleyen Öneriler</CardTitle>
 <FileText className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{summary?.pendingRecommendations || 0}</div>
 <p className="text-xs text-muted-foreground">
 Planlanmayı bekliyor
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Risk Trendi</CardTitle>
 <TrendingUp className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">
 {summary?.highRiskStudentCount > 0 ? '↑' : '→'}
 </div>
 <p className="text-xs text-muted-foreground">
 Son 30 gün
 </p>
 </CardContent>
 </Card>
 </div>
 </AIToolsLayout>
 </div>
 </TooltipProvider>
 );
}
