import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card/card';
import { Badge } from '@/components/atoms/Badge/badge';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Award } from 'lucide-react';

async function fetchBenchmarks(studentId: string) {
 const response = await fetchWithSchool(`/api/exam-management/benchmarks/student/${studentId}`);
 const result = await response.json();
 if (!result.success) throw new Error(result.error);
 return result.data;
}

interface BenchmarkComparisonWidgetProps {
 studentId: string;
 studentName?: string;
}

export function BenchmarkComparisonWidget({ studentId, studentName }: BenchmarkComparisonWidgetProps) {
 const { data: benchmarks, isLoading } = useQuery({
 queryKey: ['student-benchmarks', studentId],
 queryFn: () => fetchBenchmarks(studentId),
 });

 if (isLoading) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Benchmark Karşılaştırma</CardTitle>
 <CardDescription>Yükleniyor...</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="h-64 bg-muted rounded" />
 </CardContent>
 </Card>
 );
 }

 if (!benchmarks || benchmarks.length === 0) {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Award className="h-5 w-5 text-primary" />
 Benchmark Karşılaştırma
 </CardTitle>
 <CardDescription>Sınıf ve okul ortalaması ile karşılaştırma</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="text-center py-8 text-muted-foreground">
 <p>Henüz benchmark verisi yok</p>
 </div>
 </CardContent>
 </Card>
 );
 }

 const chartData = benchmarks.slice(0, 10).reverse().map((b: any) => ({
 name: new Date(b.exam_date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
 'Öğrenci': b.total_net,
 'Sınıf Ort': b.class_avg,
 'Okul Ort': b.school_avg,
 }));

 const latestBenchmark = benchmarks[0];

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Award className="h-5 w-5 text-primary" />
 Benchmark Karşılaştırma
 </CardTitle>
 <CardDescription>
 {studentName} - Sınıf ve okul ortalaması ile karşılaştırma
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="border rounded-lg p-4 space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">Persentil</span>
 <TrendingUp className="h-4 w-4 text-primary" />
 </div>
 <div className="text-2xl font-bold">%{latestBenchmark.percentile.toFixed(0)}</div>
 <p className="text-xs text-muted-foreground">
 En iyi %{(100 - latestBenchmark.percentile).toFixed(0)}'lik dilimde
 </p>
 </div>

 <div className="border rounded-lg p-4 space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">Sıralama</span>
 <Users className="h-4 w-4 text-primary" />
 </div>
 <div className="text-2xl font-bold">
 {latestBenchmark.rank || '-'} / {latestBenchmark.total_participants || '-'}
 </div>
 <p className="text-xs text-muted-foreground">Genel sıralama</p>
 </div>

 <div className="border rounded-lg p-4 space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">Kategori</span>
 <Award className="h-4 w-4 text-primary" />
 </div>
 <Badge className="text-sm">
 {latestBenchmark.performance_category === 'excellent' && 'Mükemmel'}
 {latestBenchmark.performance_category === 'good' && 'İyi'}
 {latestBenchmark.performance_category === 'average' && 'Orta'}
 {latestBenchmark.performance_category === 'needs_improvement' && 'Gelişmeli'}
 </Badge>
 <p className="text-xs text-muted-foreground">Performans seviyesi</p>
 </div>
 </div>

 <div>
 <h4 className="text-sm font-medium mb-4">Son 10 Deneme Karşılaştırması</h4>
 <ResponsiveContainer width="100%" height={300}>
 <BarChart data={chartData}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" />
 <YAxis />
 <Tooltip />
 <Legend />
 <Bar dataKey="Öğrenci" fill="#3b82f6" />
 <Bar dataKey="Sınıf Ort" fill="#10b981" />
 <Bar dataKey="Okul Ort" fill="#f59e0b" />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>
 );
}
