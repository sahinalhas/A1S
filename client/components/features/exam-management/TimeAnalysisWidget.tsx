import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card/card';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Badge } from '@/components/atoms/Badge/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

async function fetchTimeAnalysis(studentId: string, examTypeId: string) {
 const response = await fetchWithSchool(`/api/exam-management/time-analysis/${studentId}/${examTypeId}`);
 const result = await response.json();
 if (!result.success) throw new Error(result.error);
 return result.data;
}

interface TimeAnalysisWidgetProps {
 studentId: string;
 examTypeId: string;
 studentName?: string;
}

export function TimeAnalysisWidget({ studentId, examTypeId, studentName }: TimeAnalysisWidgetProps) {
 const { data: analysis, isLoading } = useQuery({
 queryKey: ['time-analysis', studentId, examTypeId],
 queryFn: () => fetchTimeAnalysis(studentId, examTypeId),
 });

 if (isLoading) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Zaman Analizi</CardTitle>
 <CardDescription>Yükleniyor...</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="h-64 bg-muted rounded" />
 </CardContent>
 </Card>
 );
 }

 if (!analysis || !analysis.exam_history || analysis.exam_history.length === 0) {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Clock className="h-5 w-5 text-primary" />
 Zaman Analizi
 </CardTitle>
 <CardDescription>Deneme sıklığı ve performans korelasyonu</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="text-center py-8 text-muted-foreground">
 <p>Henüz zaman analizi için yeterli veri yok</p>
 </div>
 </CardContent>
 </Card>
 );
 }

 const chartData = analysis.exam_history.map((exam: any) => ({
 date: new Date(exam.exam_date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
 'Performans': exam.total_net,
 'Aralık (gün)': exam.days_since_last || 0,
 }));

 const getFrequencyColor = (frequency: string) => {
 switch (frequency) {
 case 'high':
 return 'bg-green-100 text-green-700';
 case 'medium':
 return 'bg-yellow-100 text-yellow-700';
 case 'low':
 return 'bg-red-100 text-red-700';
 default:
 return 'bg-gray-100 text-gray-700';
 }
 };

 const getConsistencyColor = (score: number) => {
 if (score >= 70) return 'text-green-600';
 if (score >= 40) return 'text-yellow-600';
 return 'text-red-600';
 };

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Clock className="h-5 w-5 text-primary" />
 Zaman Analizi
 </CardTitle>
 <CardDescription>
 {studentName} - Deneme sıklığı ve performans korelasyonu
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="border rounded-lg p-4 space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">Toplam Deneme</span>
 <Calendar className="h-4 w-4 text-gray-600" />
 </div>
 <div className="text-2xl font-bold">{analysis.total_exams}</div>
 <p className="text-xs text-muted-foreground">Son 6 ay</p>
 </div>

 <div className="border rounded-lg p-4 space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">Ort. Aralık</span>
 <Clock className="h-4 w-4 text-gray-600" />
 </div>
 <div className="text-2xl font-bold">{analysis.avg_days_between_exams.toFixed(0)}</div>
 <p className="text-xs text-muted-foreground">gün</p>
 </div>

 <div className="border rounded-lg p-4 space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">Çalışma Sıklığı</span>
 <TrendingUp className="h-4 w-4 text-gray-600" />
 </div>
 <Badge className={getFrequencyColor(analysis.study_frequency)}>
 {analysis.study_frequency === 'high' && 'Yüksek'}
 {analysis.study_frequency === 'medium' && 'Orta'}
 {analysis.study_frequency === 'low' && 'Düşük'}
 </Badge>
 <p className="text-xs text-muted-foreground">Deneme sıklığı</p>
 </div>

 <div className="border rounded-lg p-4 space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">Tutarlılık Skoru</span>
 <AlertCircle className="h-4 w-4 text-gray-600" />
 </div>
 <div className={`text-2xl font-bold ${getConsistencyColor(analysis.consistency_score)}`}>
 %{analysis.consistency_score.toFixed(0)}
 </div>
 <p className="text-xs text-muted-foreground">Düzenlilik</p>
 </div>
 </div>

 <div>
 <h4 className="text-sm font-medium mb-4">Performans ve Deneme Aralığı Trendi</h4>
 <ResponsiveContainer width="100%" height={300}>
 <LineChart data={chartData}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="date" />
 <YAxis yAxisId="left" />
 <YAxis yAxisId="right" orientation="right" />
 <Tooltip />
 <Legend />
 <Line
 yAxisId="left"
 type="monotone"
 dataKey="Performans"
 stroke="#3b82f6"
 strokeWidth={2}
 dot={{ r: 4 }}
 />
 <Line
 yAxisId="right"
 type="monotone"
 dataKey="Aralık (gün)"
 stroke="#f59e0b"
 strokeWidth={2}
 dot={{ r: 4 }}
 />
 </LineChart>
 </ResponsiveContainer>
 </div>

 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
 <h4 className="font-medium mb-2 text-blue-900 flex items-center gap-2">
 <TrendingUp className="h-4 w-4" />
 Önerilen Deneme Düzeni
 </h4>
 <div className="space-y-2 text-sm text-blue-800">
 <p>
 <strong>Optimal Aralık:</strong> {analysis.optimal_interval_days} gün arayla deneme çözmeniz önerilir.
 </p>
 <p>
 <strong>Performans İlişkisi:</strong> {
 analysis.performance_correlation > 0.5
 ? 'Daha sık deneme çözmeniz performansınızı artırıyor.'
 : analysis.performance_correlation < -0.3
 ? 'Deneme aralığınızı azaltmanız performansınızı olumsuz etkileyebilir.'
 : 'Mevcut deneme sıklığınız dengeli görünüyor.'
 }
 </p>
 <p>
 <strong>Hedef:</strong> Haftada en az {Math.floor(7 / analysis.optimal_interval_days)} deneme çözmeye çalışın.
 </p>
 </div>
 </div>

 {analysis.longest_gap > 14 && (
 <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
 <div className="flex items-center gap-2 mb-2">
 <AlertCircle className="h-5 w-5 text-orange-600" />
 <h4 className="font-medium text-orange-900">Uzun Ara Uyarısı</h4>
 </div>
 <p className="text-sm text-orange-800">
 En uzun deneme aranız {analysis.longest_gap} gün. Performansınızı korumak için daha düzenli çalışmanız önerilir.
 </p>
 </div>
 )}
 </CardContent>
 </Card>
 );
}
