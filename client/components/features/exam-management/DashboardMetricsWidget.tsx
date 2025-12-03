import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card/card';
import { Badge } from '@/components/atoms/Badge/badge';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Calendar, TrendingUp, Users, AlertCircle, Target, Award, Clock } from 'lucide-react';
import { Skeleton } from '@/components/atoms/Skeleton/skeleton';

async function fetchDashboardMetrics() {
 const response = await fetchWithSchool('/api/exam-management/dashboard/metrics');
 const result = await response.json();
 if (!result.success) throw new Error(result.error);
 return result.data;
}

export function DashboardMetricsWidget() {
 const { data: metrics, isLoading } = useQuery({
 queryKey: ['dashboard-metrics'],
 queryFn: fetchDashboardMetrics,
 refetchInterval: 60000,
 });

 if (isLoading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {[...Array(8)].map((_, i) => (
 <Card key={i}>
 <CardHeader className="pb-2">
 <Skeleton className="h-4 w-24" />
 </CardHeader>
 <CardContent>
 <Skeleton className="h-8 w-16" />
 </CardContent>
 </Card>
 ))}
 </div>
 );
 }

 if (!metrics) return null;

 const todayCards = [
 {
 title: 'Bugünkü Sınavlar',
 value: metrics.today.exams_today,
 icon: Calendar,
 color: 'text-blue-600',
 bgColor: 'bg-blue-50',
 },
 {
 title: 'Girilen Sonuçlar',
 value: metrics.today.results_entered_today,
 icon: TrendingUp,
 color: 'text-green-600',
 bgColor: 'bg-green-50',
 },
 {
 title: 'Bugünkü Uyarılar',
 value: metrics.today.alerts_today,
 icon: AlertCircle,
 color: 'text-orange-600',
 bgColor: 'bg-orange-50',
 },
 {
 title: 'Aktif Öğrenciler',
 value: metrics.today.active_students,
 icon: Users,
 color: 'text-purple-600',
 bgColor: 'bg-purple-50',
 },
 ];

 const weekCards = [
 {
 title: 'Bu Hafta Sınavlar',
 value: metrics.this_week.exams_this_week,
 icon: Calendar,
 color: 'text-cyan-600',
 bgColor: 'bg-cyan-50',
 },
 {
 title: 'Ortalama Performans',
 value: metrics.this_week.avg_performance.toFixed(1),
 icon: Award,
 color: 'text-amber-600',
 bgColor: 'bg-amber-50',
 },
 {
 title: 'Katılım Oranı',
 value: `%${metrics.this_week.participation_rate.toFixed(0)}`,
 icon: Users,
 color: 'text-pink-600',
 bgColor: 'bg-pink-50',
 },
 ];

 const monthCards = [
 {
 title: 'Aylık Sınav Sayısı',
 value: metrics.this_month.total_exams,
 icon: Calendar,
 color: 'text-indigo-600',
 bgColor: 'bg-indigo-50',
 },
 {
 title: 'Risk Altındaki Öğrenci',
 value: metrics.quick_stats.at_risk_count,
 icon: AlertCircle,
 color: 'text-red-600',
 bgColor: 'bg-red-50',
 },
 {
 title: 'Ulaşılan Hedefler',
 value: metrics.quick_stats.goals_achieved_this_month,
 icon: Target,
 color: 'text-emerald-600',
 bgColor: 'bg-emerald-50',
 },
 ];

 const allCards = [...todayCards, ...weekCards, ...monthCards];

 return (
 <div>
 <div className="mb-4">
 <h3 className="text-lg font-semibold flex items-center gap-2">
 <Clock className="h-5 w-5 text-primary" />
 Gerçek Zamanlı Dashboard
 </h3>
 <p className="text-sm text-muted-foreground">Güncel performans metrikleri</p>
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
 {allCards.map((card, index) => {
 const Icon = card.icon;
 return (
 <Card key={index} className="">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <div className={`p-2 rounded-lg ${card.bgColor}`}>
 <Icon className={`h-4 w-4 ${card.color}`} />
 </div>
 {card.title}
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{card.value}</div>
 </CardContent>
 </Card>
 );
 })}
 </div>
 </div>
 );
}
