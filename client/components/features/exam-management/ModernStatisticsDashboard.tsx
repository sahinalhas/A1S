import { useMemo } from 'react';
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Progress } from '@/components/atoms/Progress';
import {
 BarChart3,
 TrendingUp,
 TrendingDown,
 Users,
 Target,
 Award,
 AlertCircle,
 BookOpen,
 Zap,
 Activity,
} from 'lucide-react';
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
 ResponsiveContainer,
 LineChart,
 Line,
 RadarChart,
 PolarGrid,
 PolarAngleAxis,
 PolarRadiusAxis,
 Radar,
 Area,
 AreaChart,
} from 'recharts';
import type { ExamSession } from '../../../shared/types/exam-management.types';

interface ExamStatisticsData {
 session_id: string;
 session_name: string;
 exam_type_id: string;
 exam_date: string;
 total_students: number;
 subject_stats: SubjectStats[];
 overall_stats: {
 avg_total_net: number;
 highest_total_net: number;
 lowest_total_net: number;
 };
}

interface SubjectStats {
 subject_id: string;
 subject_name: string;
 question_count: number;
 avg_correct: number;
 avg_wrong: number;
 avg_empty: number;
 avg_net: number;
 highest_net: number;
 lowest_net: number;
 std_deviation: number;
}

interface ModernStatisticsDashboardProps {
 sessions: ExamSession[];
 selectedSession: string;
 statistics: ExamStatisticsData | null;
 isLoading: boolean;
}

export function ModernStatisticsDashboard({
 sessions,
 selectedSession,
 statistics,
 isLoading,
}: ModernStatisticsDashboardProps) {
 const chartData = useMemo(() => {
 if (!statistics?.subject_stats) return [];
 return statistics.subject_stats.map((stat) => ({
 name: stat.subject_name,
 ortalama: parseFloat(stat.avg_net.toFixed(2)),
 enYüksek: parseFloat(stat.highest_net.toFixed(2)),
 enDüşük: parseFloat(stat.lowest_net.toFixed(2)),
 sapma: parseFloat(stat.std_deviation.toFixed(2)),
 }));
 }, [statistics]);

 const performanceData = useMemo(() => {
 if (!statistics?.subject_stats) return [];
 return statistics.subject_stats.map((stat) => ({
 name: stat.subject_name,
 doğru: parseFloat(stat.avg_correct.toFixed(1)),
 yanlış: parseFloat(stat.avg_wrong.toFixed(1)),
 boş: parseFloat(stat.avg_empty.toFixed(1)),
 }));
 }, [statistics]);

 const radarData = useMemo(() => {
 if (!statistics?.subject_stats) return [];
 return statistics.subject_stats.slice(0, 6).map((stat) => ({
 subject: stat.subject_name,
 performans: (stat.avg_net / stat.question_count) * 100,
 maksimum: 100,
 }));
 }, [statistics]);

 const trendData = useMemo(() => {
 if (!statistics?.subject_stats) return [];
 return statistics.subject_stats.map((stat, idx) => ({
 name: stat.subject_name,
 başarı: parseFloat(((stat.avg_net / stat.question_count) * 100).toFixed(1)),
 hedef: 75, // Example target
 }));
 }, [statistics]);

 const getSuccessRate = (stat: SubjectStats) => {
 return ((stat.avg_net / stat.question_count) * 100).toFixed(1);
 };

 const getPerformanceColor = (percentage: number) => {
 if (percentage >= 75) return 'text-green-600';
 if (percentage >= 50) return 'text-yellow-600';
 return 'text-red-600';
 };

 const getPerformanceBadge = (percentage: number) => {
 if (percentage >= 75) return { text: 'Mükemmel', variant: 'default' as const, color: 'bg-green-100 text-green-700 border-green-200' };
 if (percentage >= 50) return { text: 'İyi', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
 return { text: 'Geliştirilmeli', variant: 'destructive' as const, color: 'bg-red-100 text-red-700 border-red-200' };
 };

 const topSubjects = useMemo(() => {
 if (!statistics?.subject_stats) return [];
 return [...statistics.subject_stats]
 .sort((a, b) => b.avg_net - a.avg_net)
 .slice(0, 3);
 }, [statistics]);

 const attentionSubjects = useMemo(() => {
 if (!statistics?.subject_stats) return [];
 return [...statistics.subject_stats]
 .sort((a, b) => a.avg_net - b.avg_net)
 .slice(0, 3);
 }, [statistics]);

 if (isLoading) {
 return (
 <div className="space-y-4">
 {[1, 2, 3].map((i) => (
 <div key={i} className="h-32 bg-muted/30 rounded-lg" />
 ))}
 </div>
 );
 }

 if (!statistics) {
 return (
 <Card className="border-dashed">
 <CardContent className="p-8 text-center">
 <div className="flex flex-col items-center gap-3 text-muted-foreground">
 <BarChart3 className="h-12 w-12" />
 <p>Bu sınav için henüz sonuç girilmemiş.</p>
 </div>
 </CardContent>
 </Card>
 );
 }

 const overallSuccessRate = statistics.overall_stats.avg_total_net;
 const totalQuestions = statistics.subject_stats.reduce((sum, stat) => sum + stat.question_count, 0);
 const maxPossibleNet = totalQuestions;
 const performancePercentage = (overallSuccessRate / maxPossibleNet) * 100;

 return (
 <div className="space-y-6">
 {/* Top Summary Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <Card className="relative overflow-hidden border-2">
 <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
 <Users className="h-4 w-4 text-blue-600" />
 Katılım
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 <div className="text-3xl font-bold text-blue-600">
 {statistics.total_students}
 </div>
 <p className="text-xs text-muted-foreground flex items-center gap-1">
 <TrendingUp className="h-3 w-3" />
 Toplam öğrenci
 </p>
 </CardContent>
 </Card>

 <Card className="relative overflow-hidden border-2">
 <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10" />
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
 <Activity className="h-4 w-4 text-green-600" />
 Ortalama Net
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 <div className="text-3xl font-bold text-green-600">
 {statistics.overall_stats.avg_total_net.toFixed(2)}
 </div>
 <Progress 
 value={performancePercentage} 
 className="h-1.5"
 />
 <p className="text-xs text-muted-foreground">
 %{performancePercentage.toFixed(1)} başarı oranı
 </p>
 </CardContent>
 </Card>

 <Card className="relative overflow-hidden border-2">
 <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10" />
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
 <Award className="h-4 w-4 text-purple-600" />
 En Yüksek
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 <div className="text-3xl font-bold text-purple-600">
 {statistics.overall_stats.highest_total_net.toFixed(2)}
 </div>
 <p className="text-xs text-muted-foreground flex items-center gap-1">
 <Zap className="h-3 w-3" />
 En başarılı
 </p>
 </CardContent>
 </Card>

 <Card className="relative overflow-hidden border-2">
 <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -mr-10 -mt-10" />
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
 <BookOpen className="h-4 w-4 text-amber-600" />
 Ders Sayısı
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 <div className="text-3xl font-bold text-amber-600">
 {statistics.subject_stats.length}
 </div>
 <p className="text-xs text-muted-foreground">
 {totalQuestions} toplam soru
 </p>
 </CardContent>
 </Card>
 </div>

 {/* Performance Insights */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="border-2 border-green-500/20 bg-green-50/50">
 <CardHeader className="pb-3">
 <CardTitle className="text-base flex items-center gap-2">
 <TrendingUp className="h-5 w-5 text-green-600" />
 En Başarılı Dersler
 </CardTitle>
 <CardDescription>Yüksek performans gösterilen dersler</CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 {topSubjects.map((stat, idx) => {
 const percentage = parseFloat(getSuccessRate(stat));
 return (
 <div key={stat.subject_id} className="flex items-center gap-3">
 <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm">
 {idx + 1}
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-1">
 <span className="font-medium text-sm">{stat.subject_name}</span>
 <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
 {stat.avg_net.toFixed(1)} net
 </Badge>
 </div>
 <Progress value={percentage} className="h-1.5" />
 </div>
 </div>
 );
 })}
 </CardContent>
 </Card>

 <Card className="border-2 border-red-500/20 bg-red-50/50">
 <CardHeader className="pb-3">
 <CardTitle className="text-base flex items-center gap-2">
 <AlertCircle className="h-5 w-5 text-red-600" />
 Dikkat Gereken Dersler
 </CardTitle>
 <CardDescription>Geliştirilmesi gereken alanlar</CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 {attentionSubjects.map((stat, idx) => {
 const percentage = parseFloat(getSuccessRate(stat));
 return (
 <div key={stat.subject_id} className="flex items-center gap-3">
 <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-sm">
 {idx + 1}
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-1">
 <span className="font-medium text-sm">{stat.subject_name}</span>
 <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
 {stat.avg_net.toFixed(1)} net
 </Badge>
 </div>
 <Progress value={percentage} className="h-1.5" />
 </div>
 </div>
 );
 })}
 </CardContent>
 </Card>
 </div>

 {/* Main Charts */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* Net Distribution Chart */}
 <Card>
 <CardHeader>
 <CardTitle className="text-base">Ders Bazında Net Dağılımı</CardTitle>
 <CardDescription>Ortalama, en yüksek ve en düşük net değerleri</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={300}>
 <BarChart data={chartData}>
 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
 <XAxis 
 dataKey="name" 
 angle={-45} 
 textAnchor="end" 
 height={80} 
 tick={{ fontSize: 11 }}
 />
 <YAxis tick={{ fontSize: 11 }} />
 <Tooltip 
 contentStyle={{
 backgroundColor: '#fff',
 border: '1px solid #e5e7eb',
 borderRadius: '8px',
 fontSize: '12px',
 }}
 />
 <Legend wrapperStyle={{ fontSize: '11px' }} />
 <Bar dataKey="ortalama" fill="#3b82f6" name="Ortalama" radius={[4, 4, 0, 0]} />
 <Bar dataKey="enYüksek" fill="#10b981" name="En Yüksek" radius={[4, 4, 0, 0]} />
 <Bar dataKey="enDüşük" fill="#ef4444" name="En Düşük" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 {/* Performance Radar */}
 <Card>
 <CardHeader>
 <CardTitle className="text-base">Performans Haritası</CardTitle>
 <CardDescription>Derslerdeki başarı yüzdesi dağılımı</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={300}>
 <RadarChart data={radarData}>
 <PolarGrid stroke="#e5e7eb" />
 <PolarAngleAxis 
 dataKey="subject" 
 tick={{ fontSize: 11, fill: '#6b7280' }}
 />
 <PolarRadiusAxis 
 angle={90} 
 domain={[0, 100]} 
 tick={{ fontSize: 10 }}
 />
 <Radar
 name="Başarı Oranı"
 dataKey="performans"
 stroke="#8b5cf6"
 fill="#8b5cf6"
 fillOpacity={0.6}
 strokeWidth={2}
 />
 <Tooltip 
 contentStyle={{
 backgroundColor: '#fff',
 border: '1px solid #e5e7eb',
 borderRadius: '8px',
 fontSize: '12px',
 }}
 formatter={(value: any) => `${Number(value).toFixed(1)}%`}
 />
 <Legend wrapperStyle={{ fontSize: '11px' }} />
 </RadarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 </div>

 {/* Answer Distribution */}
 <Card>
 <CardHeader>
 <CardTitle className="text-base">Doğru-Yanlış-Boş Dağılımı</CardTitle>
 <CardDescription>Her ders için ortalama soru dağılımı</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={300}>
 <AreaChart data={performanceData}>
 <defs>
 <linearGradient id="colorCorrect" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
 </linearGradient>
 <linearGradient id="colorWrong" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
 </linearGradient>
 <linearGradient id="colorEmpty" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
 <XAxis 
 dataKey="name" 
 angle={-45} 
 textAnchor="end" 
 height={80}
 tick={{ fontSize: 11 }}
 />
 <YAxis tick={{ fontSize: 11 }} />
 <Tooltip 
 contentStyle={{
 backgroundColor: '#fff',
 border: '1px solid #e5e7eb',
 borderRadius: '8px',
 fontSize: '12px',
 }}
 />
 <Legend wrapperStyle={{ fontSize: '11px' }} />
 <Area 
 type="monotone" 
 dataKey="doğru" 
 stroke="#10b981" 
 strokeWidth={2}
 fillOpacity={1}
 fill="url(#colorCorrect)"
 name="Doğru" 
 />
 <Area 
 type="monotone" 
 dataKey="yanlış" 
 stroke="#ef4444" 
 strokeWidth={2}
 fillOpacity={1}
 fill="url(#colorWrong)"
 name="Yanlış" 
 />
 <Area 
 type="monotone" 
 dataKey="boş" 
 stroke="#f59e0b" 
 strokeWidth={2}
 fillOpacity={1}
 fill="url(#colorEmpty)"
 name="Boş" 
 />
 </AreaChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 {/* Detailed Subject Statistics */}
 <Card>
 <CardHeader>
 <CardTitle className="text-base">Ders Bazında Detaylı İstatistikler</CardTitle>
 <CardDescription>Her ders için kapsamlı performans analizi</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {statistics.subject_stats.map((stat) => {
 const successRate = parseFloat(getSuccessRate(stat));
 const badge = getPerformanceBadge(successRate);
 
 return (
 <Card
 key={stat.subject_id}
 className="border-2"
 >
 <CardContent className="p-4">
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-lg bg-primary/10">
 <BookOpen className="h-5 w-5 text-primary" />
 </div>
 <div>
 <h4 className="font-semibold text-base">{stat.subject_name}</h4>
 <p className="text-xs text-muted-foreground">
 {stat.question_count} soru
 </p>
 </div>
 </div>
 <div className="text-right space-y-1">
 <Badge className={badge.color}>{badge.text}</Badge>
 <div className={`text-2xl font-bold ${getPerformanceColor(successRate)}`}>
 %{successRate}
 </div>
 </div>
 </div>
 
 <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
 <div className="space-y-1">
 <div className="text-xs text-muted-foreground">Ort. Doğru</div>
 <div className="font-bold text-green-600 flex items-center gap-1">
 <TrendingUp className="h-3 w-3" />
 {stat.avg_correct.toFixed(1)}
 </div>
 </div>
 <div className="space-y-1">
 <div className="text-xs text-muted-foreground">Ort. Yanlış</div>
 <div className="font-bold text-red-600 flex items-center gap-1">
 <TrendingDown className="h-3 w-3" />
 {stat.avg_wrong.toFixed(1)}
 </div>
 </div>
 <div className="space-y-1">
 <div className="text-xs text-muted-foreground">Ort. Boş</div>
 <div className="font-bold text-orange-600">
 {stat.avg_empty.toFixed(1)}
 </div>
 </div>
 <div className="space-y-1">
 <div className="text-xs text-muted-foreground">Ort. Net</div>
 <div className="font-bold text-blue-600">
 {stat.avg_net.toFixed(2)}
 </div>
 </div>
 <div className="space-y-1">
 <div className="text-xs text-muted-foreground">Sapma</div>
 <div className="font-bold text-purple-600">
 ±{stat.std_deviation.toFixed(2)}
 </div>
 </div>
 </div>
 
 <div className="mt-3 space-y-1.5">
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground">Performans</span>
 <span className="font-medium">%{successRate}</span>
 </div>
 <Progress value={successRate} className="h-2" />
 </div>
 </CardContent>
 </Card>
 );
 })}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
