import { useState, useMemo } from 'react';
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Skeleton } from '@/components/atoms/Skeleton';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/atoms/Select';
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';
import {
 LineChart,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
 ResponsiveContainer,
 AreaChart,
 Area,
} from 'recharts';
import { useTrendAnalysis } from '@/hooks/queries/exams.query-hooks';
import type { ExamType } from '../../../shared/types/exam-management.types';

interface TrendAnalysisTabProps {
 examTypes: ExamType[];
}

export function TrendAnalysisTab({ examTypes }: TrendAnalysisTabProps) {
 const [selectedExamType, setSelectedExamType] = useState<string>('');
 const [period, setPeriod] = useState<'last_6' | 'last_12' | 'all'>('last_6');

 const { data: trendData, isLoading } = useTrendAnalysis(
 selectedExamType || undefined, 
 period
 );

 const chartData = useMemo(() => {
 if (!trendData?.data_points) return [];
 return trendData.data_points.map(point => ({
 name: point.session_name,
 date: new Date(point.exam_date).toLocaleDateString('tr-TR', { 
 day: 'numeric', 
 month: 'short' 
 }),
 avgNet: point.avg_net,
 participants: point.participants,
 }));
 }, [trendData]);

 const getTrendIcon = () => {
 if (!trendData) return <Activity className="h-5 w-5" />;
 if (trendData.overall_trend === 'improving') {
 return <TrendingUp className="h-5 w-5 text-green-600" />;
 } else if (trendData.overall_trend === 'declining') {
 return <TrendingDown className="h-5 w-5 text-red-600" />;
 }
 return <Activity className="h-5 w-5 text-blue-600" />;
 };

 const getTrendColor = () => {
 if (!trendData) return 'bg-blue-100 text-blue-700 border-blue-200';
 if (trendData.overall_trend === 'improving') {
 return 'bg-green-100 text-green-700 border-green-200';
 } else if (trendData.overall_trend === 'declining') {
 return 'bg-red-100 text-red-700 border-red-200';
 }
 return 'bg-blue-100 text-blue-700 border-blue-200';
 };

 const getTrendText = () => {
 if (!trendData) return 'Stabil';
 if (trendData.overall_trend === 'improving') return 'Gelişiyor';
 if (trendData.overall_trend === 'declining') return 'Düşüyor';
 return 'Stabil';
 };

 return (
 <div className="space-y-6 fade-in slide-in-from-bottom-4">
 <div>
 <h2 className="text-3xl font-bold flex items-center gap-3">
 <div className="p-2 bg-primary/10 rounded-lg">
 <TrendingUp className="h-7 w-7 text-primary" />
 </div>
 Trend Analizi
 </h2>
 <p className="text-muted-foreground mt-2 text-base">
 Sınav performans trendlerini zaman içinde takip edin
 </p>
 </div>

 <Card>
 <CardHeader>
 <CardTitle className="text-base">Analiz Parametreleri</CardTitle>
 <CardDescription>Trend analizini özelleştirin</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-sm font-medium">Sınav Türü</label>
 <Select value={selectedExamType} onValueChange={setSelectedExamType}>
 <SelectTrigger>
 <SelectValue placeholder="Sınav türü seçin" />
 </SelectTrigger>
 <SelectContent>
 {examTypes.map(type => (
 <SelectItem key={type.id} value={type.id}>
 {type.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Dönem</label>
 <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="last_6">Son 6 Deneme</SelectItem>
 <SelectItem value="last_12">Son 12 Deneme</SelectItem>
 <SelectItem value="all">Tüm Denemeler</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </CardContent>
 </Card>

 {isLoading && (
 <div className="space-y-4 fade-in">
 <Skeleton className="h-48 rounded-xl" />
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <Skeleton className="h-32 rounded-xl" />
 <Skeleton className="h-32 rounded-xl" />
 <Skeleton className="h-32 rounded-xl" />
 </div>
 <Skeleton className="h-96 rounded-xl" />
 </div>
 )}

 {!isLoading && !selectedExamType && (
 <Card className="border-2 border-dashed border-muted-foreground/30 bg-muted/20">
 <CardContent className="p-16">
 <div className="text-center space-y-4">
 <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
 <TrendingUp className="h-10 w-10 text-muted-foreground" />
 </div>
 <div>
 <h3 className="font-semibold text-lg mb-2">Trend Analizi Hazır</h3>
 <p className="text-muted-foreground max-w-md mx-auto">
 Yukarıdan bir sınav türü seçerek zaman içindeki performans trendlerini görüntüleyin.
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 )}

 {!isLoading && selectedExamType && trendData && (
 <>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <Card className="border-2">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium text-muted-foreground">
 Genel Trend
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex items-center gap-3">
 {getTrendIcon()}
 <div>
 <div className="text-2xl font-bold">{getTrendText()}</div>
 <Badge className={getTrendColor()}>
 {trendData.trend_percentage > 0 ? '+' : ''}
 {trendData.trend_percentage.toFixed(1)}%
 </Badge>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="border-2">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium text-muted-foreground">
 Toplam Deneme
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-3xl font-bold text-primary">
 {trendData.data_points.length}
 </div>
 <p className="text-xs text-muted-foreground mt-1">
 {period === 'last_6' ? 'Son 6' : period === 'last_12' ? 'Son 12' : 'Tüm'} deneme
 </p>
 </CardContent>
 </Card>

 <Card className="border-2">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium text-muted-foreground">
 Ortalama Katılım
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-3xl font-bold text-purple-600">
 {trendData.data_points.length > 0
 ? Math.round(
 trendData.data_points.reduce((sum, p) => sum + p.participants, 0) /
 trendData.data_points.length
 )
 : 0}
 </div>
 <p className="text-xs text-muted-foreground mt-1">
 Deneme başına öğrenci
 </p>
 </CardContent>
 </Card>
 </div>

 <Card>
 <CardHeader>
 <CardTitle className="text-base">Performans Trend Grafiği</CardTitle>
 <CardDescription>
 {trendData.exam_type_name} sınavları için zaman içinde ortalama net skoru
 </CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={400}>
 <AreaChart data={chartData}>
 <defs>
 <linearGradient id="colorAvgNet" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
 <XAxis 
 dataKey="date" 
 tick={{ fontSize: 11 }}
 angle={-15}
 textAnchor="end"
 height={60}
 />
 <YAxis tick={{ fontSize: 11 }} />
 <Tooltip 
 contentStyle={{
 backgroundColor: '#fff',
 border: '1px solid #e5e7eb',
 borderRadius: '8px',
 fontSize: '12px',
 }}
 labelFormatter={(label) => `Tarih: ${label}`}
 formatter={(value: any, name: string) => {
 if (name === 'avgNet') return [value.toFixed(2), 'Ortalama Net'];
 if (name === 'participants') return [value, 'Katılım'];
 return [value, name];
 }}
 />
 <Legend wrapperStyle={{ fontSize: '11px' }} />
 <Area 
 type="monotone" 
 dataKey="avgNet" 
 stroke="#3b82f6" 
 strokeWidth={3}
 fillOpacity={1}
 fill="url(#colorAvgNet)"
 name="Ortalama Net"
 dot={{ fill: '#3b82f6', r: 4 }}
 activeDot={{ r: 6 }}
 />
 </AreaChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-base">Deneme Detayları</CardTitle>
 <CardDescription>Her deneme için performans özeti</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {trendData.data_points.map((point, idx) => (
 <div
 key={point.session_id}
 className="flex items-center justify-between p-3 border rounded-lg"
 >
 <div className="flex items-center gap-3">
 <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
 {idx + 1}
 </div>
 <div>
 <div className="font-medium text-sm">{point.session_name}</div>
 <div className="text-xs text-muted-foreground flex items-center gap-1">
 <Calendar className="h-3 w-3" />
 {new Date(point.exam_date).toLocaleDateString('tr-TR')}
 </div>
 </div>
 </div>
 <div className="text-right">
 <div className="font-bold text-lg text-primary">
 {point.avg_net.toFixed(2)}
 </div>
 <div className="text-xs text-muted-foreground">
 {point.participants} katılımcı
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </>
 )}
 </div>
 );
}
