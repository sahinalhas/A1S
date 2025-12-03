import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { School, TrendingUp, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/utils/toast.utils';

interface ClassComparison {
 className: string;
 totalStudents: number;
 averageGPA?: number;
 riskDistribution?: {
 low?: number;
 medium?: number;
 high?: number;
 critical?: number;
 };
 strengths?: string[];
 concerns?: string[];
}

interface SchoolAnalysis {
 overallSummary: string;
 totalStudents: number;
 classComparisons?: ClassComparison[];
 keyFindings?: string[];
 trends?: {
 academic?: string;
 behavioral?: string;
 attendance?: string;
 socialEmotional?: string;
 };
 priorityActions?: {
 immediate?: string[];
 shortTerm?: string[];
 };
}

interface AlertItem {
 studentId?: string;
 studentName: string;
 description: string;
 severity: string;
 recommendedAction: string;
 riskLevel?: string;
 concerns?: string[];
}

interface TrendAlert {
 type?: string;
 pattern?: string;
 description: string;
 affectedStudents: number;
 recommendation?: string;
}

interface EarlyWarnings {
 criticalAlerts?: AlertItem[];
 trendAlerts?: TrendAlert[];
}

export default function BulkAnalysisDashboard() {
 const [loading, setLoading] = useState(false);
 const [schoolAnalysis, setSchoolAnalysis] = useState<SchoolAnalysis | null>(null);
 const [earlyWarnings, setEarlyWarnings] = useState<EarlyWarnings | null>(null);

 const loadSchoolAnalysis = async () => {
 setLoading(true);
 try {
 const response = await fetchWithSchool('/api/analytics/bulk-ai/school-wide');
 const data = await response.json();
 
 if (data.success) {
 setSchoolAnalysis(data.data);
 } else {
 throw new Error(data.error);
 }
 } catch (error: unknown) {
 toast({
 title: 'Hata',
 description: error instanceof Error ? error.message : 'Analiz yüklenemedi',
 variant: 'destructive'
 });
 } finally {
 setLoading(false);
 }
 };

 const loadEarlyWarnings = async () => {
 setLoading(true);
 try {
 const response = await fetchWithSchool('/api/analytics/bulk-ai/early-warning');
 const data = await response.json();
 
 if (data.success) {
 setEarlyWarnings(data.data);
 }
 } catch (error: unknown) {
 toast({
 title: 'Hata',
 description: error instanceof Error ? error.message : 'Uyarılar yüklenemedi',
 variant: 'destructive'
 });
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 loadSchoolAnalysis();
 loadEarlyWarnings();
 }, []);

 return (
 <div className="space-y-4">
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="flex items-center gap-2">
 <School className="h-5 w-5" />
 Toplu AI Analiz Merkezi
 </CardTitle>
 <CardDescription>Okul geneli AI destekli analiz ve erken uyarı sistemi</CardDescription>
 </div>
 <Button variant="outline" size="sm" onClick={() => { loadSchoolAnalysis(); loadEarlyWarnings(); }} disabled={loading}>
 <RefreshCw className="h-4 w-4 mr-2" />
 Yenile
 </Button>
 </div>
 </CardHeader>
 </Card>

 <Tabs defaultValue="overview" className="w-full">
 <TabsList variant="nested">
 <TabsTrigger value="overview" variant="nested">Genel Bakış</TabsTrigger>
 <TabsTrigger value="classes" variant="nested">Sınıflar</TabsTrigger>
 <TabsTrigger value="warnings" variant="nested">Erken Uyarılar</TabsTrigger>
 </TabsList>

 <TabsContent value="overview" className="space-y-4">
 {schoolAnalysis ? (
 <>
 <Card>
 <CardHeader>
 <CardTitle className="text-lg">Okul Geneli Özet</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="mb-4 p-4 bg-muted/50 rounded-lg">
 <p className="text-sm">{schoolAnalysis.overallSummary}</p>
 </div>
 <div className="grid gap-2">
 <div className="flex items-center justify-between p-2 border rounded">
 <span className="text-sm font-medium">Toplam Öğrenci</span>
 <Badge variant="secondary">{schoolAnalysis.totalStudents}</Badge>
 </div>
 <div className="flex items-center justify-between p-2 border rounded">
 <span className="text-sm font-medium">Sınıf Sayısı</span>
 <Badge variant="secondary">{schoolAnalysis.classComparisons?.length || 0}</Badge>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-lg">Ana Bulgular</CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-2">
 {schoolAnalysis.keyFindings?.map((finding, i) => (
 <li key={i} className="flex items-start gap-2 text-sm">
 <TrendingUp className="h-4 w-4 mt-0.5 text-primary" />
 {finding}
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>

 <div className="grid gap-4 md:grid-cols-2">
 <Card>
 <CardHeader>
 <CardTitle className="text-base">Trendler</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <div>
 <h4 className="text-xs font-medium mb-1">Akademik</h4>
 <p className="text-sm text-muted-foreground">{schoolAnalysis.trends?.academic}</p>
 </div>
 <div>
 <h4 className="text-xs font-medium mb-1">Davranışsal</h4>
 <p className="text-sm text-muted-foreground">{schoolAnalysis.trends?.behavioral}</p>
 </div>
 <div>
 <h4 className="text-xs font-medium mb-1">Devam</h4>
 <p className="text-sm text-muted-foreground">{schoolAnalysis.trends?.attendance}</p>
 </div>
 <div>
 <h4 className="text-xs font-medium mb-1">Sosyal-Duygusal</h4>
 <p className="text-sm text-muted-foreground">{schoolAnalysis.trends?.socialEmotional}</p>
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-base">Öncelikli Eylemler</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <div>
 <h4 className="text-xs font-medium mb-1 text-red-600">Acil</h4>
 <ul className="text-sm space-y-1">
 {schoolAnalysis.priorityActions?.immediate?.map((a, i) => (
 <li key={i} className="text-muted-foreground">• {a}</li>
 ))}
 </ul>
 </div>
 <div>
 <h4 className="text-xs font-medium mb-1 text-orange-600">Kısa Vadeli</h4>
 <ul className="text-sm space-y-1">
 {schoolAnalysis.priorityActions?.shortTerm?.map((a, i) => (
 <li key={i} className="text-muted-foreground">• {a}</li>
 ))}
 </ul>
 </div>
 </CardContent>
 </Card>
 </div>
 </>
 ) : (
 <Card>
 <CardContent className="py-12 text-center">
 <Loader2 className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
 <p className="text-sm text-muted-foreground">Analiz yükleniyor...</p>
 </CardContent>
 </Card>
 )}
 </TabsContent>

 <TabsContent value="classes" className="space-y-4">
 <div className="grid gap-4">
 {schoolAnalysis?.classComparisons?.map((classData, i) => (
 <Card key={i}>
 <CardHeader>
 <div className="flex items-start justify-between">
 <CardTitle className="text-base">{classData.className}</CardTitle>
 <div className="flex gap-2">
 <Badge variant="outline">{classData.totalStudents} öğrenci</Badge>
 <Badge variant="secondary">Ort: {classData.averageGPA?.toFixed(1)}</Badge>
 </div>
 </div>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="grid grid-cols-4 gap-2">
 <div className="text-center p-2 border rounded">
 <div className="text-xs text-muted-foreground">Düşük Risk</div>
 <div className="text-sm font-medium text-green-600">{classData.riskDistribution?.low || 0}</div>
 </div>
 <div className="text-center p-2 border rounded">
 <div className="text-xs text-muted-foreground">Orta Risk</div>
 <div className="text-sm font-medium text-yellow-600">{classData.riskDistribution?.medium || 0}</div>
 </div>
 <div className="text-center p-2 border rounded">
 <div className="text-xs text-muted-foreground">Yüksek Risk</div>
 <div className="text-sm font-medium text-orange-600">{classData.riskDistribution?.high || 0}</div>
 </div>
 <div className="text-center p-2 border rounded">
 <div className="text-xs text-muted-foreground">Kritik</div>
 <div className="text-sm font-medium text-red-600">{classData.riskDistribution?.critical || 0}</div>
 </div>
 </div>

 <div className="grid gap-3 md:grid-cols-2">
 <div>
 <h4 className="text-xs font-medium mb-1 text-green-600">Güçlü Yönler</h4>
 <ul className="text-xs space-y-1">
 {classData.strengths?.map((s, idx) => (
 <li key={idx} className="text-muted-foreground">• {s}</li>
 ))}
 </ul>
 </div>
 <div>
 <h4 className="text-xs font-medium mb-1 text-orange-600">Endişe Alanları</h4>
 <ul className="text-xs space-y-1">
 {classData.concerns?.map((c, idx) => (
 <li key={idx} className="text-muted-foreground">• {c}</li>
 ))}
 </ul>
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </TabsContent>

 <TabsContent value="warnings" className="space-y-4">
 {earlyWarnings ? (
 <>
 <Card>
 <CardHeader>
 <CardTitle className="text-lg flex items-center gap-2">
 <AlertTriangle className="h-5 w-5 text-red-600" />
 Kritik Uyarılar
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 {earlyWarnings.criticalAlerts?.slice(0, 10).map((alert, i) => (
 <div key={i} className="p-3 border rounded-lg">
 <div className="flex items-start justify-between mb-1">
 <div className="flex-1">
 <h4 className="text-sm font-medium">{alert.studentName}</h4>
 <p className="text-xs text-muted-foreground">{alert.description}</p>
 </div>
 <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
 {alert.severity}
 </Badge>
 </div>
 <p className="text-xs text-primary mt-2">→ {alert.recommendedAction}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {earlyWarnings.trendAlerts && earlyWarnings.trendAlerts.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="text-lg">Trend Uyarıları</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {earlyWarnings.trendAlerts.map((trend, i) => (
 <div key={i} className="p-3 border rounded-lg">
 <h4 className="text-sm font-medium mb-1">{trend.pattern}</h4>
 <p className="text-xs text-muted-foreground mb-2">{trend.description}</p>
 <div className="flex items-center justify-between">
 <Badge variant="outline">{trend.affectedStudents} öğrenci</Badge>
 <p className="text-xs text-primary">{trend.recommendation}</p>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 )}
 </>
 ) : (
 <Card>
 <CardContent className="py-12 text-center">
 <Loader2 className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
 <p className="text-sm text-muted-foreground">Erken uyarılar yükleniyor...</p>
 </CardContent>
 </Card>
 )}
 </TabsContent>
 </Tabs>
 </div>
 );
}
