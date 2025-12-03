import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
 BarChart, 
 Bar, 
 LineChart, 
 Line, 
 XAxis, 
 YAxis, 
 CartesianGrid, 
 Tooltip, 
 Legend, 
 ResponsiveContainer,
 RadarChart,
 PolarGrid,
 PolarAngleAxis,
 PolarRadiusAxis,
 Radar
} from 'recharts';
import { 
 TrendingUp, 
 TrendingDown, 
 Activity,
 AlertCircle,
 Download
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Button } from '@/components/atoms/Button';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { apiClient } from '@/lib/api/core/client';

interface AdvancedAnalyticsCardProps {
 studentId: string;
}

export function AdvancedAnalyticsCard({ studentId }: AdvancedAnalyticsCardProps) {
 const { data: analyticsData, isLoading, error } = useQuery({
 queryKey: ['advanced-analytics', studentId],
 queryFn: async () => {
 const response = await apiClient.get<{ success: boolean; data: any }>(
 `/api/advanced-analytics/student/${studentId}`
 );
 return response.data.data;
 },
 staleTime: 5 * 60 * 1000,
 });

 const handleExportReport = async () => {
 try {
 const response = await apiClient.post(`/api/advanced-analytics/student/${studentId}/export-report`, {
 format: 'pdf'
 });
 console.log('Rapor oluşturuldu:', response);
 } catch (error) {
 console.error('Rapor oluşturma hatası:', error);
 }
 };

 if (isLoading) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Gelişmiş Analitik Dashboard</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex items-center justify-center h-40">
 <div className=" rounded-full h-8 w-8 border-b-2 border-primary"></div>
 </div>
 </CardContent>
 </Card>
 );
 }

 if (error || !analyticsData) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Gelişmiş Analitik Dashboard</CardTitle>
 </CardHeader>
 <CardContent>
 <Alert>
 <AlertCircle className="h-4 w-4" />
 <AlertDescription>
 Analitik verileri yüklenirken bir hata oluştu.
 </AlertDescription>
 </Alert>
 </CardContent>
 </Card>
 );
 }

 const performanceData = analyticsData.performanceMetrics?.trendData || [];
 const radarData = analyticsData.comprehensiveScore?.dimensionScores?.map((dim: any) => ({
 dimension: dim.dimension,
 score: dim.score,
 fullMark: 100
 })) || [];

 return (
 <div className="space-y-4">
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <CardTitle className="flex items-center gap-2">
 <Activity className="h-5 w-5" />
 Gelişmiş Analitik Dashboard
 </CardTitle>
 <Button size="sm" variant="outline" onClick={handleExportReport}>
 <Download className="h-4 w-4 mr-2" />
 Rapor İndir
 </Button>
 </div>
 </CardHeader>
 <CardContent className="space-y-6">
 <Tabs defaultValue="overview" className="w-full">
 <TabsList variant="nested">
 <TabsTrigger value="overview" variant="nested">Genel Bakış</TabsTrigger>
 <TabsTrigger value="performance" variant="nested">Performans</TabsTrigger>
 <TabsTrigger value="trends" variant="nested">Trendler</TabsTrigger>
 <TabsTrigger value="comparison" variant="nested">Karşılaştırma</TabsTrigger>
 </TabsList>

 <TabsContent value="overview" className="space-y-4 mt-4">
 {analyticsData.comprehensiveScore && (
 <>
 <div className="grid grid-cols-3 gap-4">
 <div className="text-center p-4 bg-muted/50 rounded-lg">
 <p className="text-3xl font-bold">
 {analyticsData.comprehensiveScore.overallScore.toFixed(1)}
 </p>
 <p className="text-sm text-muted-foreground">Genel Skor</p>
 </div>
 <div className="text-center p-4 bg-muted/50 rounded-lg">
 <p className="text-3xl font-bold">
 {analyticsData.comprehensiveScore.academicScore.toFixed(1)}
 </p>
 <p className="text-sm text-muted-foreground">Akademik</p>
 </div>
 <div className="text-center p-4 bg-muted/50 rounded-lg">
 <p className="text-3xl font-bold">
 {analyticsData.comprehensiveScore.wellbeingScore.toFixed(1)}
 </p>
 <p className="text-sm text-muted-foreground">Genel Gelişim</p>
 </div>
 </div>

 {radarData.length > 0 && (
 <div className="h-80">
 <ResponsiveContainer width="100%" height="100%">
 <RadarChart data={radarData}>
 <PolarGrid />
 <PolarAngleAxis dataKey="dimension" />
 <PolarRadiusAxis angle={90} domain={[0, 100]} />
 <Radar
 name="Skor"
 dataKey="score"
 stroke="#8884d8"
 fill="#8884d8"
 fillOpacity={0.6}
 />
 <Tooltip />
 </RadarChart>
 </ResponsiveContainer>
 </div>
 )}
 </>
 )}
 </TabsContent>

 <TabsContent value="performance" className="space-y-4 mt-4">
 {analyticsData.performanceMetrics && (
 <>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <h4 className="font-medium text-sm">Akademik Trend</h4>
 <div className="flex items-center gap-2">
 {analyticsData.performanceMetrics.academicTrend === 'IMPROVING' ? (
 <>
 <TrendingUp className="h-4 w-4 text-green-500" />
 <span className="text-sm text-green-600">Gelişiyor</span>
 </>
 ) : analyticsData.performanceMetrics.academicTrend === 'DECLINING' ? (
 <>
 <TrendingDown className="h-4 w-4 text-red-500" />
 <span className="text-sm text-red-600">Düşüyor</span>
 </>
 ) : (
 <span className="text-sm text-muted-foreground">Stabil</span>
 )}
 </div>
 </div>
 <div className="space-y-2">
 <h4 className="font-medium text-sm">Davranışsal Trend</h4>
 <div className="flex items-center gap-2">
 {analyticsData.performanceMetrics.behavioralTrend === 'IMPROVING' ? (
 <>
 <TrendingUp className="h-4 w-4 text-green-500" />
 <span className="text-sm text-green-600">Gelişiyor</span>
 </>
 ) : analyticsData.performanceMetrics.behavioralTrend === 'DECLINING' ? (
 <>
 <TrendingDown className="h-4 w-4 text-red-500" />
 <span className="text-sm text-red-600">Düşüyor</span>
 </>
 ) : (
 <span className="text-sm text-muted-foreground">Stabil</span>
 )}
 </div>
 </div>
 </div>

 {performanceData.length > 0 && (
 <div className="h-64">
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={performanceData}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="period" />
 <YAxis />
 <Tooltip />
 <Legend />
 <Line 
 type="monotone" 
 dataKey="score" 
 stroke="#8884d8" 
 name="Performans Skoru" 
 />
 </LineChart>
 </ResponsiveContainer>
 </div>
 )}
 </>
 )}
 </TabsContent>

 <TabsContent value="trends" className="space-y-4 mt-4">
 {analyticsData.insights?.length > 0 ? (
 <div className="space-y-3">
 {analyticsData.insights.map((insight: any, index: number) => (
 <div key={index} className="p-3 border rounded-lg space-y-2">
 <div className="flex items-start justify-between">
 <h5 className="font-medium text-sm">{insight.title}</h5>
 <Badge variant={
 insight.type === 'POSITIVE' ? 'default' :
 insight.type === 'NEGATIVE' ? 'destructive' :
 'secondary'
 }>
 {insight.type}
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground">{insight.description}</p>
 {insight.recommendation && (
 <div className="bg-muted/50 p-2 rounded text-xs">
 <span className="font-medium">Öneri: </span>
 {insight.recommendation}
 </div>
 )}
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground text-center py-8">
 Henüz trend analizi verisi mevcut değil
 </p>
 )}
 </TabsContent>

 <TabsContent value="comparison" className="space-y-4 mt-4">
 {analyticsData.comparison && (
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="p-4 bg-muted/50 rounded-lg">
 <p className="text-sm text-muted-foreground mb-1">Sınıf Ortalaması</p>
 <p className="text-2xl font-bold">{analyticsData.comparison.classAverage?.toFixed(1) || 'N/A'}</p>
 </div>
 <div className="p-4 bg-muted/50 rounded-lg">
 <p className="text-sm text-muted-foreground mb-1">Öğrenci Skoru</p>
 <p className="text-2xl font-bold">{analyticsData.comparison.studentScore?.toFixed(1) || 'N/A'}</p>
 </div>
 </div>
 
 {analyticsData.comparison.percentile && (
 <div className="p-4 border rounded-lg">
 <p className="text-sm font-medium mb-2">Sınıf İçi Konum</p>
 <p className="text-muted-foreground text-sm">
 Öğrenci, sınıfın <span className="font-bold text-primary">
 %{analyticsData.comparison.percentile.toFixed(0)}
 </span> diliminde yer alıyor
 </p>
 </div>
 )}
 </div>
 )}
 </TabsContent>
 </Tabs>

 <div className="text-xs text-muted-foreground text-center pt-2 border-t">
 Son güncelleme: {new Date().toLocaleString('tr-TR')}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
