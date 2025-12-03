import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { logger } from '@/lib/utils/logger';
import { StatCard } from '@/components/molecules/StatCard';
import { StatsGrid } from '@/components/molecules/StatsGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { PageHeader } from '@/components/molecules/PageHeader';
import { MODERN_GRADIENTS } from '@/lib/config/theme.config';
import { 
 Users, 
 GraduationCap, 
 TrendingUp, 
 AlertTriangle,
 Download,
 BarChart3,
 PieChart as PieChartIcon,
 Calendar
} from 'lucide-react';
import { 
 getSchoolStatistics, 
 getClassComparisons, 
 getTrendAnalysis,
 exportToExcel,
 downloadExcel,
 type SchoolStatistics as SchoolStatsType,
 type ClassComparison,
 type TimeSeriesAnalysis
} from '@/lib/api/endpoints/advanced-reports.api';
import { useToast } from '@/hooks/utils/toast.utils';
import { 
 BarChart, 
 Bar, 
 PieChart, 
 Pie, 
 LineChart,
 Line,
 Cell, 
 XAxis, 
 YAxis, 
 CartesianGrid, 
 Tooltip, 
 Legend, 
 ResponsiveContainer 
} from 'recharts';

const COLORS = {
 low: '#10b981',
 medium: '#f59e0b',
 high: '#ef4444',
 critical: '#7c2d12',
};

export default function SchoolDashboard() {
 const { user } = useAuth();
 const { toast } = useToast();
 const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
 
 const { data: schoolStats, isLoading: statsLoading } = useQuery({
 queryKey: ['school-stats'],
 queryFn: getSchoolStatistics,
 });
 
 const { data: classComparisons, isLoading: classLoading } = useQuery({
 queryKey: ['class-comparisons'],
 queryFn: () => getClassComparisons(),
 });
 
 const { data: trendAnalysis, isLoading: trendLoading } = useQuery({
 queryKey: ['trend-analysis', selectedPeriod],
 queryFn: () => getTrendAnalysis(selectedPeriod),
 });
 
 const handleExportExcel = async () => {
 if (!user) return;
 
 try {
 const result = await exportToExcel(user.id, {
 includeAIAnalysis: true,
 period: selectedPeriod,
 });
 
 downloadExcel(result.filename, result.data);
 
 toast({
 title: 'Excel Raporu Oluşturuldu',
 description: `${result.filename} indirildi`,
 });
 } catch (error) {
 logger.error('Excel export failed', 'SchoolDashboard', error);
 toast({
 title: 'Hata',
 description: 'Excel raporu oluşturulamadı',
 variant: 'destructive',
 });
 }
 };
 
 if (statsLoading) {
 return (
 <div className="flex items-center justify-center h-screen">
 <div className=" h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
 </div>
 );
 }
 
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="w-full max-w-7xl mx-auto py-6 space-y-6"
 >
 <PageHeader
 icon={GraduationCap}
 title="Okul Geneli Dashboard"
 subtitle="Okul performans ve istatistiklerine genel bakış"
 actions={
 <Button onClick={handleExportExcel} className="gap-2">
 <Download className="h-4 w-4" />
 Excel İndir
 </Button>
 }
 />
 
 {/* Quick Stats */}
 <StatsGrid columns={4}>
 <StatCard
 title="Toplam Öğrenci"
 value={schoolStats?.totalStudents || 0}
 icon={Users}
 gradient={MODERN_GRADIENTS.blue}
 delay={0}
 />
 <StatCard
 title="Toplam Sınıf"
 value={schoolStats?.totalClasses || 0}
 icon={GraduationCap}
 gradient={MODERN_GRADIENTS.indigo}
 delay={0.1}
 />
 <StatCard
 title="Ortalama GPA"
 value={schoolStats?.academicOverview.averageGPA.toFixed(2) || '0.00'}
 icon={TrendingUp}
 gradient={MODERN_GRADIENTS.teal}
 delay={0.2}
 />
 <StatCard
 title="Risk Altında"
 value={(schoolStats?.riskDistribution.high || 0) + (schoolStats?.riskDistribution.critical || 0)}
 icon={AlertTriangle}
 gradient={MODERN_GRADIENTS.rose}
 delay={0.3}
 />
 </StatsGrid>
 
 <Tabs defaultValue="overview" className="space-y-4">
 <TabsList variant="minimal" className="w-full justify-start sm:justify-center">
 <TabsTrigger value="overview" variant="minimal">
 <PieChartIcon className="h-4 w-4" />
 <span className="hidden sm:inline">Genel Bakış</span>
 </TabsTrigger>
 <TabsTrigger value="classes" variant="minimal">
 <BarChart3 className="h-4 w-4" />
 <span className="hidden sm:inline">Sınıf Karşılaştırma</span>
 </TabsTrigger>
 <TabsTrigger value="trends" variant="minimal">
 <TrendingUp className="h-4 w-4" />
 <span className="hidden sm:inline">Trend Analizi</span>
 </TabsTrigger>
 </TabsList>
 
 <TabsContent value="overview" className="space-y-4">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <RiskDistributionChart data={schoolStats} />
 <GenderDistributionChart data={schoolStats} />
 </div>
 
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <AttendanceOverviewCard data={schoolStats} />
 <AcademicOverviewCard data={schoolStats} />
 </div>
 </TabsContent>
 
 <TabsContent value="classes" className="space-y-4">
 {classLoading ? (
 <div className="flex justify-center p-12">
 <div className=" h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
 </div>
 ) : (
 <>
 <ClassComparisonChart data={classComparisons || []} />
 <ClassComparisonTable data={classComparisons || []} />
 </>
 )}
 </TabsContent>
 
 <TabsContent value="trends" className="space-y-4">
 <div className="flex gap-2 mb-4">
 <Button 
 variant={selectedPeriod === 'daily' ? 'default' : 'outline'}
 onClick={() => setSelectedPeriod('daily')}
 >
 Günlük
 </Button>
 <Button 
 variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
 onClick={() => setSelectedPeriod('weekly')}
 >
 Haftalık
 </Button>
 <Button 
 variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
 onClick={() => setSelectedPeriod('monthly')}
 >
 Aylık
 </Button>
 </div>
 
 {trendLoading ? (
 <div className="flex justify-center p-12">
 <div className=" h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
 </div>
 ) : (
 <>
 <TrendChart data={trendAnalysis} />
 <TrendInsights data={trendAnalysis} />
 </>
 )}
 </TabsContent>
 </Tabs>
 </motion.div>
 );
}


function RiskDistributionChart({ data }: { data?: SchoolStatsType }) {
 if (!data) return null;
 
 const chartData = [
 { name: 'Düşük', value: data.riskDistribution.low, color: COLORS.low },
 { name: 'Orta', value: data.riskDistribution.medium, color: COLORS.medium },
 { name: 'Yüksek', value: data.riskDistribution.high, color: COLORS.high },
 { name: 'Kritik', value: data.riskDistribution.critical, color: COLORS.critical },
 ];
 
 return (
 <Card>
 <CardHeader>
 <CardTitle>Risk Dağılımı</CardTitle>
 <CardDescription>Öğrenci risk seviyelerine göre dağılım</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={300}>
 <PieChart>
 <Pie
 data={chartData}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
 outerRadius={80}
 fill="#8884d8"
 dataKey="value"
 >
 {chartData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip />
 </PieChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 );
}

function GenderDistributionChart({ data }: { data?: SchoolStatsType }) {
 if (!data) return null;
 
 const chartData = [
 { name: 'Erkek', value: data.genderDistribution.male },
 { name: 'Kız', value: data.genderDistribution.female },
 { name: 'Diğer', value: data.genderDistribution.other },
 ];
 
 return (
 <Card>
 <CardHeader>
 <CardTitle>Cinsiyet Dağılımı</CardTitle>
 <CardDescription>Öğrenci cinsiyet dağılımı</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={300}>
 <BarChart data={chartData}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" />
 <YAxis />
 <Tooltip />
 <Bar dataKey="value" fill="#8b5cf6" />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 );
}

function AttendanceOverviewCard({ data }: { data?: SchoolStatsType }) {
 if (!data) return null;
 
 return (
 <Card>
 <CardHeader>
 <CardTitle>Devam Durumu</CardTitle>
 <CardDescription>Okul geneli devam istatistikleri</CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="flex justify-between items-center">
 <span>Ortalama Devam:</span>
 <Badge variant="outline">{(data.attendanceOverview.average * 100).toFixed(1)}%</Badge>
 </div>
 <div className="flex justify-between items-center">
 <span>Mükemmel Devam:</span>
 <Badge >{data.attendanceOverview.excellent} öğrenci</Badge>
 </div>
 <div className="flex justify-between items-center">
 <span>İyi Devam:</span>
 <Badge variant="secondary">{data.attendanceOverview.good} öğrenci</Badge>
 </div>
 <div className="flex justify-between items-center">
 <span>Zayıf Devam:</span>
 <Badge variant="destructive">{data.attendanceOverview.poor} öğrenci</Badge>
 </div>
 </CardContent>
 </Card>
 );
}

function AcademicOverviewCard({ data }: { data?: SchoolStatsType }) {
 if (!data) return null;
 
 return (
 <Card>
 <CardHeader>
 <CardTitle>Akademik Durum</CardTitle>
 <CardDescription>Okul geneli akademik istatistikler</CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="flex justify-between items-center">
 <span>Ortalama GPA:</span>
 <Badge variant="outline">{data.academicOverview.averageGPA.toFixed(2)}</Badge>
 </div>
 <div className="flex justify-between items-center">
 <span>Başarılı Öğrenci:</span>
 <Badge >{data.academicOverview.topPerformers} öğrenci</Badge>
 </div>
 <div className="flex justify-between items-center">
 <span>Destek Gereken:</span>
 <Badge variant="destructive">{data.academicOverview.needsSupport} öğrenci</Badge>
 </div>
 </CardContent>
 </Card>
 );
}

function ClassComparisonChart({ data }: { data: ClassComparison[] }) {
 const chartData = data.map(cc => ({
 name: cc.className,
 GPA: cc.averageGPA,
 Devam: cc.attendanceRate * 100,
 }));
 
 return (
 <Card>
 <CardHeader>
 <CardTitle>Sınıf Performans Karşılaştırması</CardTitle>
 <CardDescription>Sınıfların akademik ve devam karşılaştırması</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={400}>
 <BarChart data={chartData}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" />
 <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
 <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
 <Tooltip />
 <Legend />
 <Bar yAxisId="left" dataKey="GPA" fill="#8884d8" name="Ortalama GPA" />
 <Bar yAxisId="right" dataKey="Devam" fill="#82ca9d" name="Devam %" />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 );
}

function ClassComparisonTable({ data }: { data: ClassComparison[] }) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Sınıf Detay Tablosu</CardTitle>
 <CardDescription>Tüm sınıfların detaylı karşılaştırması</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b">
 <th className="text-left p-2">Sınıf</th>
 <th className="text-right p-2">Öğrenci</th>
 <th className="text-right p-2">GPA</th>
 <th className="text-right p-2">Devam %</th>
 <th className="text-right p-2">Davranış</th>
 <th className="text-right p-2">Görüşme</th>
 </tr>
 </thead>
 <tbody>
 {data.map((cc) => (
 <tr key={cc.className} className="border-b">
 <td className="p-2 font-medium">{cc.className}</td>
 <td className="text-right p-2">{cc.studentCount}</td>
 <td className="text-right p-2">{cc.averageGPA.toFixed(2)}</td>
 <td className="text-right p-2">{(cc.attendanceRate * 100).toFixed(1)}%</td>
 <td className="text-right p-2">{cc.behaviorIncidents}</td>
 <td className="text-right p-2">{cc.counselingSessions}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 );
}

function TrendChart({ data }: { data?: TimeSeriesAnalysis }) {
 if (!data || data.trends.length === 0) {
 return <Card><CardContent className="p-12 text-center text-muted-foreground">Veri bulunamadı</CardContent></Card>;
 }
 
 return (
 <Card>
 <CardHeader>
 <CardTitle>Performans Trend Analizi</CardTitle>
 <CardDescription>Zaman içinde performans değişimi</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={400}>
 <LineChart data={data.trends}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="period" />
 <YAxis yAxisId="left" />
 <YAxis yAxisId="right" orientation="right" />
 <Tooltip />
 <Legend />
 <Line yAxisId="left" type="monotone" dataKey="academicAverage" stroke="#8884d8" name="Akademik Ort." />
 <Line yAxisId="right" type="monotone" dataKey="riskStudents" stroke="#ef4444" name="Risk Öğrenci" />
 <Line yAxisId="left" type="monotone" dataKey="sessionCount" stroke="#10b981" name="Görüşme" />
 </LineChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 );
}

function TrendInsights({ data }: { data?: TimeSeriesAnalysis }) {
 if (!data) return null;
 
 return (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <Card>
 <CardHeader>
 <CardTitle className="text-green-600">İyileşen Alanlar</CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-2">
 {data.insights.improving.map((item, idx) => (
 <li key={idx} className="flex items-start gap-2">
 <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
 <span className="text-sm">{item}</span>
 </li>
 ))}
 {data.insights.improving.length === 0 && (
 <p className="text-sm text-muted-foreground">Yok</p>
 )}
 </ul>
 </CardContent>
 </Card>
 
 <Card>
 <CardHeader>
 <CardTitle className="text-red-600">Kötüleşen Alanlar</CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-2">
 {data.insights.declining.map((item, idx) => (
 <li key={idx} className="flex items-start gap-2">
 <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
 <span className="text-sm">{item}</span>
 </li>
 ))}
 {data.insights.declining.length === 0 && (
 <p className="text-sm text-muted-foreground">Yok</p>
 )}
 </ul>
 </CardContent>
 </Card>
 
 <Card>
 <CardHeader>
 <CardTitle className="text-blue-600">Tahminler</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="flex justify-between items-center">
 <span className="text-sm">Akademik Trend:</span>
 <Badge variant={data.predictions.academicTrend === 'up' ? 'default' : data.predictions.academicTrend === 'down' ? 'destructive' : 'secondary'}>
 {data.predictions.academicTrend === 'up' ? '↑ Yükseliş' : data.predictions.academicTrend === 'down' ? '↓ Düşüş' : '→ Stabil'}
 </Badge>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-sm">Risk Trend:</span>
 <Badge variant={data.predictions.riskTrend === 'down' ? 'default' : data.predictions.riskTrend === 'up' ? 'destructive' : 'secondary'}>
 {data.predictions.riskTrend === 'up' ? '↑ Artış' : data.predictions.riskTrend === 'down' ? '↓ Azalış' : '→ Stabil'}
 </Badge>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-sm">Güven:</span>
 <Badge variant="outline">{(data.predictions.confidence * 100).toFixed(0)}%</Badge>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
