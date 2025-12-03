import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card/card';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Skeleton } from '@/components/atoms/Skeleton/skeleton';
import { Badge } from '@/components/atoms/Badge/badge';
import { TrendingUp, TrendingDown, Minus, Flame } from 'lucide-react';

async function fetchHeatmap(studentId: string, examTypeId: string) {
 const response = await fetchWithSchool(`/api/exam-management/heatmap/${studentId}/${examTypeId}`);
 const result = await response.json();
 if (!result.success) throw new Error(result.error);
 return result.data;
}

interface SubjectHeatmapWidgetProps {
 studentId: string;
 examTypeId: string;
 studentName?: string;
}

export function SubjectHeatmapWidget({ studentId, examTypeId, studentName }: SubjectHeatmapWidgetProps) {
 const { data: heatmap, isLoading } = useQuery({
 queryKey: ['heatmap', studentId, examTypeId],
 queryFn: () => fetchHeatmap(studentId, examTypeId),
 });

 const getHeatmapColor = (intensity: number) => {
 if (intensity < 0.25) return 'bg-red-500';
 if (intensity < 0.5) return 'bg-orange-500';
 if (intensity < 0.75) return 'bg-yellow-500';
 return 'bg-green-500';
 };

 const getStrengthBadge = (level: string) => {
 switch (level) {
 case 'strong':
 return <Badge className="bg-green-100 text-green-700">Güçlü</Badge>;
 case 'moderate':
 return <Badge className="bg-yellow-100 text-yellow-700">Orta</Badge>;
 case 'weak':
 return <Badge className="bg-red-100 text-red-700">Zayıf</Badge>;
 default:
 return null;
 }
 };

 const getTrendIcon = (trend: string) => {
 switch (trend) {
 case 'improving':
 return <TrendingUp className="h-4 w-4 text-green-600" />;
 case 'declining':
 return <TrendingDown className="h-4 w-4 text-red-600" />;
 default:
 return <Minus className="h-4 w-4 text-gray-600" />;
 }
 };

 if (isLoading) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Konu Performans Isı Haritası</CardTitle>
 <CardDescription>Yükleniyor...</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
 {[...Array(8)].map((_, i) => (
 <Skeleton key={i} className="h-24" />
 ))}
 </div>
 </CardContent>
 </Card>
 );
 }

 if (!heatmap || !heatmap.subjects || heatmap.subjects.length === 0) {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Flame className="h-5 w-5 text-primary" />
 Konu Performans Isı Haritası
 </CardTitle>
 <CardDescription>Ders bazında performans analizi</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="text-center py-8 text-muted-foreground">
 <p>Henüz yeterli veri yok</p>
 </div>
 </CardContent>
 </Card>
 );
 }

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Flame className="h-5 w-5 text-primary" />
 Konu Performans Isı Haritası
 </CardTitle>
 <CardDescription>
 {studentName || heatmap.student_name} - Ders bazında performans analizi
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
 {heatmap.subjects
 .sort((a: any, b: any) => a.performance_score - b.performance_score)
 .map((subject: any) => (
 <div
 key={subject.subject_id}
 className="relative overflow-hidden rounded-lg border p-3"
 >
 <div
 className={`absolute top-0 left-0 w-1 h-full ${getHeatmapColor(subject.color_intensity)}`}
 />
 <div className="space-y-2 pl-2">
 <div className="flex items-start justify-between gap-2">
 <h4 className="font-medium text-sm leading-tight">{subject.subject_name}</h4>
 {getTrendIcon(subject.trend)}
 </div>
 <div className="flex items-center justify-between">
 <span className="text-2xl font-bold text-primary">
 {subject.performance_score.toFixed(1)}
 </span>
 {getStrengthBadge(subject.strength_level)}
 </div>
 <div className="text-xs text-muted-foreground">
 {subject.trend === 'improving' && 'Gelişiyor'}
 {subject.trend === 'declining' && 'Düşüyor'}
 {subject.trend === 'stable' && 'Stabil'}
 </div>
 </div>
 </div>
 ))}
 </div>
 <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground">
 <div className="flex items-center gap-2">
 <div className="w-4 h-4 bg-red-500 rounded" />
 <span>Zayıf (0-5)</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-4 h-4 bg-orange-500 rounded" />
 <span>Gelişmeli (5-10)</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-4 h-4 bg-yellow-500 rounded" />
 <span>Orta (10-15)</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-4 h-4 bg-green-500 rounded" />
 <span>Güçlü (15+)</span>
 </div>
 </div>
 </CardContent>
 </Card>
 );
}
