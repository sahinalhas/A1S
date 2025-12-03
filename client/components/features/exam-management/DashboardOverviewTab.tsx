import { useMemo } from 'react';
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Skeleton } from '@/components/atoms/Skeleton';
import {
 LayoutDashboard,
 Users,
 FileText,
 TrendingUp,
 TrendingDown,
 Calendar,
 AlertTriangle,
 Award,
 Target,
 ArrowRight,
 Activity,
} from 'lucide-react';
import { Progress } from '@/components/atoms/Progress';
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
 ResponsiveContainer,
 PieChart,
 Pie,
 Cell,
} from 'recharts';
import { useDashboardOverview } from '@/hooks/queries/exams.query-hooks';
import { QuickActionsPanel } from './QuickActionsPanel';
import type { DashboardOverview } from '../../../shared/types/exam-management.types';

interface DashboardOverviewTabProps {
 examTypes: any[];
 onNavigateToTab?: (tab: string) => void;
 onCreateSession?: () => void;
}

export function DashboardOverviewTab({ examTypes, onNavigateToTab, onCreateSession }: DashboardOverviewTabProps) {
 const { data: overview, isLoading, error } = useDashboardOverview();

 const performanceChartData = useMemo(() => {
 if (!overview?.student_performance.performance_distribution) return [];
 return overview.student_performance.performance_distribution.map(d => ({
 name: d.range,
 value: d.count,
 percentage: d.percentage,
 }));
 }, [overview]);

 const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

 if (isLoading) {
 return (
 <div className="space-y-6 fade-in">
 <div className="flex items-center justify-between">
 <div className="space-y-2">
 <Skeleton className="h-8 w-48" />
 <Skeleton className="h-4 w-96" />
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {[1, 2, 3, 4].map(i => (
 <Skeleton key={i} className="h-32 rounded-xl" />
 ))}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <Skeleton className="h-80 rounded-xl" />
 <Skeleton className="h-80 rounded-xl" />
 </div>
 </div>
 );
 }

 if (error || !overview) {
 return (
 <Card className="border-2 border-red-200 bg-red-50/50">
 <CardContent className="p-12">
 <div className="text-center space-y-4">
 <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
 <AlertTriangle className="h-8 w-8 text-red-600" />
 </div>
 <div>
 <h3 className="font-semibold text-lg text-red-900">Dashboard Yüklenemedi</h3>
 <p className="text-red-700 mt-2">Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
 </div>
 <Button onClick={() => window.location.reload()} variant="outline" className="border-red-300 text-red-700">
 Sayfayı Yenile
 </Button>
 </div>
 </CardContent>
 </Card>
 );
 }

 const { summary, recent_sessions, student_performance, at_risk_students, quick_actions } = overview;

 const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
 if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
 if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
 return <Activity className="h-4 w-4 text-blue-600" />;
 };

 return (
 <div className="space-y-6 fade-in slide-in-from-bottom-4">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-3xl font-bold flex items-center gap-3">
 <div className="p-2 bg-primary/10 rounded-lg">
 <LayoutDashboard className="h-7 w-7 text-primary" />
 </div>
 Genel Bakış
 </h2>
 <p className="text-muted-foreground mt-2 text-base">
 Sınav sisteminin özeti ve hızlı erişim
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <Card className="border-2">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
 <FileText className="h-4 w-4 text-blue-600" />
 Toplam Deneme
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 <div className="text-3xl font-bold text-blue-600">
 {summary.total_sessions}
 </div>
 <div className="flex items-center gap-2 text-xs text-muted-foreground">
 {getTrendIcon(summary.trend)}
 <span>
 Bu ay: {summary.sessions_this_month} | Geçen ay: {summary.sessions_last_month}
 </span>
 </div>
 </CardContent>
 </Card>

 <Card className="border-2">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
 <Users className="h-4 w-4 text-purple-600" />
 Toplam Öğrenci
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 <div className="text-3xl font-bold text-purple-600">
 {summary.total_students}
 </div>
 <p className="text-xs text-muted-foreground">
 Sistemde kayıtlı öğrenci sayısı
 </p>
 </CardContent>
 </Card>

 <Card className="border-2">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
 <Target className="h-4 w-4 text-green-600" />
 Ortalama Katılım
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 <div className="text-3xl font-bold text-green-600">
 {summary.avg_participation_rate.toFixed(1)}
 </div>
 <Progress 
 value={(summary.avg_participation_rate / summary.total_students) * 100} 
 className="h-1.5"
 />
 </CardContent>
 </Card>

 <Card className="border-2">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
 <Award className="h-4 w-4 text-amber-600" />
 Genel Başarı
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 <div className="text-3xl font-bold text-amber-600">
 {summary.avg_overall_success.toFixed(1)}
 </div>
 <p className="text-xs text-muted-foreground">
 Ortalama net skor
 </p>
 </CardContent>
 </Card>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <Card>
 <CardHeader>
 <CardTitle className="text-base">Son Denemeler</CardTitle>
 <CardDescription>En son yapılan sınavlar ve performans özeti</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {recent_sessions.length === 0 ? (
 <p className="text-sm text-muted-foreground text-center py-4">
 Henüz deneme oluşturulmamış
 </p>
 ) : (
 recent_sessions.map(session => (
 <div
 key={session.session_id}
 className="flex items-center justify-between p-3 border rounded-lg"
 >
 <div className="flex-1">
 <div className="font-medium text-sm">{session.session_name}</div>
 <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
 <span className="flex items-center gap-1">
 <Calendar className="h-3 w-3" />
 {session.days_ago === 0 ? 'Bugün' : `${session.days_ago} gün önce`}
 </span>
 <span className="flex items-center gap-1">
 <Users className="h-3 w-3" />
 {session.participants} katılımcı
 </span>
 </div>
 </div>
 <div className="text-right">
 <div className="font-bold text-lg text-primary">
 {session.avg_net.toFixed(1)}
 </div>
 <div className="text-xs text-muted-foreground">ortalama net</div>
 </div>
 </div>
 ))
 )}
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-base">Performans Dağılımı</CardTitle>
 <CardDescription>Öğrenci başarı seviyeleri</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 <div className="grid grid-cols-3 gap-3">
 <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
 <div className="text-2xl font-bold text-green-700">
 {student_performance.high_performers}
 </div>
 <div className="text-xs text-green-600 mt-1">Yüksek</div>
 </div>
 <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
 <div className="text-2xl font-bold text-blue-700">
 {student_performance.average_performers}
 </div>
 <div className="text-xs text-blue-600 mt-1">Orta</div>
 </div>
 <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
 <div className="text-2xl font-bold text-red-700">
 {student_performance.needs_attention}
 </div>
 <div className="text-xs text-red-600 mt-1">Dikkat</div>
 </div>
 </div>

 {performanceChartData.length > 0 && (
 <ResponsiveContainer width="100%" height={200}>
 <PieChart>
 <Pie
 data={performanceChartData}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={entry => `${entry.name}: ${entry.value}`}
 outerRadius={70}
 fill="#8884d8"
 dataKey="value"
 >
 {performanceChartData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip />
 </PieChart>
 </ResponsiveContainer>
 )}
 </div>
 </CardContent>
 </Card>
 </div>

 {at_risk_students.length > 0 && (
 <Card className="border-2 border-red-500/20 bg-red-50/50">
 <CardHeader>
 <CardTitle className="text-base flex items-center gap-2">
 <AlertTriangle className="h-5 w-5 text-red-600" />
 Risk Altındaki Öğrenciler
 </CardTitle>
 <CardDescription>Dikkat gerektiren öğrenciler ve zayıf oldukları konular</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {at_risk_students.slice(0, 5).map(student => (
 <div
 key={student.student_id}
 className="flex items-center justify-between p-3 bg-white border rounded-lg"
 >
 <div className="flex-1">
 <div className="font-medium text-sm">{student.student_name}</div>
 <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
 <Badge 
 variant={student.risk_level === 'high' ? 'destructive' : student.risk_level === 'medium' ? 'secondary' : 'outline'}
 className="text-xs"
 >
 {student.risk_level === 'high' ? 'Yüksek Risk' : student.risk_level === 'medium' ? 'Orta Risk' : 'Düşük Risk'}
 </Badge>
 <span>Ortalama: {student.recent_avg_net.toFixed(1)}</span>
 </div>
 {student.weak_subjects.length > 0 && (
 <div className="flex gap-1 mt-2 flex-wrap">
 {student.weak_subjects.map((subject, idx) => (
 <Badge key={idx} variant="outline" className="text-xs">
 {subject}
 </Badge>
 ))}
 </div>
 )}
 </div>
 <Button
 size="sm"
 variant="ghost"
 className="ml-2"
 >
 Detay
 <ArrowRight className="h-3 w-3 ml-1" />
 </Button>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 )}

 <QuickActionsPanel 
 examTypes={examTypes}
 onNavigateToTab={onNavigateToTab}
 onCreateSession={onCreateSession}
 />
 </div>
 );
}