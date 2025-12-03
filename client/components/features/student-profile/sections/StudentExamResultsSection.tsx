import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Badge } from '@/components/atoms/Badge';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { TrendingUp, FileText, BarChart3, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import {
 useExamResultsByStudent,
 useSchoolExamsByStudent,
 useStudentStatistics,
} from '@/hooks/queries/exams.query-hooks';
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
} from 'recharts';

interface StudentExamResultsSectionProps {
 studentId: string;
}

export default function StudentExamResultsSection({ studentId }: StudentExamResultsSectionProps) {
 const [selectedExamType, setSelectedExamType] = useState<string>('');
 
 const { data: examResults = [], isLoading: resultsLoading } = useExamResultsByStudent(studentId);
 const { data: schoolExams = [], isLoading: schoolLoading } = useSchoolExamsByStudent(studentId);
 const { data: statistics } = useStudentStatistics(studentId, selectedExamType || undefined);

 const chartData = statistics?.recent_exams?.map((stat) => ({
 name: stat.session_name,
 net: stat.total_net,
 tarih: format(new Date(stat.exam_date), 'dd/MM', { locale: tr }),
 })) || [];

 const subjectData = statistics?.subject_performance?.map((subject) => ({
 name: subject.subject_name,
 ortalama: subject.avg_net,
 trend: subject.trend,
 level: subject.strength_level,
 })) || [];

 if (resultsLoading || schoolLoading) {
 return (
 <div className="space-y-4">
 <Card>
 <CardContent className="p-8">
 <div className="text-center text-muted-foreground">Yükleniyor...</div>
 </CardContent>
 </Card>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <FileText className="h-5 w-5" />
 Öğrenci Sınav ve Değerlendirme Sonuçları
 </CardTitle>
 <CardDescription>
 Tüm deneme sınavları, okul notları ve performans değerlendirmeleri
 </CardDescription>
 </CardHeader>
 </Card>

 <Tabs defaultValue="deneme" className="space-y-4">
 <TabsList variant="nested">
 <TabsTrigger value="deneme" variant="nested">
 <FileText className="h-4 w-4" />
 <span className="hidden sm:inline">Deneme Sınavları</span>
 </TabsTrigger>
 <TabsTrigger value="okul" variant="nested">
 <GraduationCap className="h-4 w-4" />
 <span className="hidden sm:inline">Okul Notları</span>
 </TabsTrigger>
 <TabsTrigger value="analiz" variant="nested">
 <BarChart3 className="h-4 w-4" />
 <span className="hidden sm:inline">İstatistikler</span>
 </TabsTrigger>
 </TabsList>

 <TabsContent value="deneme" className="space-y-4">
 {examResults.length === 0 ? (
 <Alert>
 <AlertDescription>
 Bu öğrenci için henüz deneme sınavı sonucu girilmemiş.
 </AlertDescription>
 </Alert>
 ) : (
 <>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <FileText className="h-4 w-4 text-blue-600" />
 Toplam Sınav
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-3xl font-bold">{examResults.length}</div>
 <p className="text-xs text-muted-foreground mt-1">Girilen deneme sayısı</p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <TrendingUp className="h-4 w-4 text-green-600" />
 Son Deneme
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold text-green-600">
 {examResults[0]?.session_name || '-'}
 </div>
 <p className="text-xs text-muted-foreground mt-1">
 {examResults[0]?.exam_date 
 ? format(new Date(examResults[0].exam_date), 'dd MMM yyyy', { locale: tr })
 : '-'
 }
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <BarChart3 className="h-4 w-4 text-purple-600" />
 Sınav Türü
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold text-purple-600">
 {examResults[0]?.exam_type_id?.toUpperCase() || '-'}
 </div>
 <p className="text-xs text-muted-foreground mt-1">Son sınav türü</p>
 </CardContent>
 </Card>
 </div>

 <Card>
 <CardHeader>
 <CardTitle>Deneme Sınavı Geçmişi</CardTitle>
 <CardDescription>Son girilen deneme sınav sonuçları</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {examResults.slice(0, 10).map((result) => (
 <div
 key={result.id}
 className="flex items-center justify-between p-4 border rounded-lg"
 >
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <span className="font-semibold">{result.session_name}</span>
 <Badge variant="outline">
 {result.exam_type_id?.toUpperCase()}
 </Badge>
 </div>
 <div className="text-sm text-muted-foreground">
 {result.subject_name} - {result.exam_date 
 ? format(new Date(result.exam_date), 'dd MMMM yyyy', { locale: tr })
 : '-'
 }
 </div>
 </div>
 <div className="text-right">
 <div className="text-lg font-bold text-blue-600">
 {result.net_score.toFixed(2)} Net
 </div>
 <div className="text-xs text-muted-foreground">
 D: {result.correct_count} / Y: {result.wrong_count} / B: {result.empty_count}
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </>
 )}
 </TabsContent>

 <TabsContent value="okul" className="space-y-4">
 {schoolExams.length === 0 ? (
 <Alert>
 <AlertDescription>
 Bu öğrenci için henüz okul sınavı notu girilmemiş.
 </AlertDescription>
 </Alert>
 ) : (
 <>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <GraduationCap className="h-4 w-4 text-blue-600" />
 Toplam Not
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-3xl font-bold">{schoolExams.length}</div>
 <p className="text-xs text-muted-foreground mt-1">Girilen not sayısı</p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <TrendingUp className="h-4 w-4 text-green-600" />
 Ortalama
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-3xl font-bold text-green-600">
 {(
 schoolExams.reduce((acc, exam) => acc + (exam.score / exam.max_score) * 100, 0) /
 schoolExams.length
 ).toFixed(0)}
 </div>
 <p className="text-xs text-muted-foreground mt-1">Genel not ortalaması (%)</p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <FileText className="h-4 w-4 text-purple-600" />
 Son Sınav
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold text-purple-600">
 {schoolExams[0]?.subject_name || '-'}
 </div>
 <p className="text-xs text-muted-foreground mt-1">
 {schoolExams[0]?.exam_type || '-'}
 </p>
 </CardContent>
 </Card>
 </div>

 <Card>
 <CardHeader>
 <CardTitle>Okul Sınavları Geçmişi</CardTitle>
 <CardDescription>Tüm okul sınav notları</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {schoolExams.map((exam) => (
 <div
 key={exam.id}
 className="flex items-center justify-between p-4 border rounded-lg"
 >
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <span className="font-semibold">{exam.subject_name}</span>
 <Badge variant="outline">{exam.exam_type}</Badge>
 {exam.semester && <Badge variant="secondary">{exam.semester}</Badge>}
 </div>
 <div className="text-sm text-muted-foreground">
 {format(new Date(exam.exam_date), 'dd MMMM yyyy', { locale: tr })}
 {exam.year && ` - ${exam.year}`}
 </div>
 {exam.notes && (
 <div className="text-sm text-muted-foreground italic mt-1">
 {exam.notes}
 </div>
 )}
 </div>
 <div className="text-right">
 <div className="text-2xl font-bold text-primary">
 {exam.score}/{exam.max_score}
 </div>
 <div className="text-xs text-muted-foreground">
 {((exam.score / exam.max_score) * 100).toFixed(0)}%
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </>
 )}
 </TabsContent>

 <TabsContent value="analiz" className="space-y-4">
 {!statistics || examResults.length === 0 ? (
 <Alert>
 <AlertDescription>
 Analiz için yeterli veri bulunmamaktadır. Öğrenci en az bir deneme sınavına girmiş olmalıdır.
 </AlertDescription>
 </Alert>
 ) : (
 <>
 {chartData.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle>Net Değişim Grafiği</CardTitle>
 <CardDescription>Deneme sınavları net gelişimi</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={300}>
 <LineChart data={chartData}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="tarih" />
 <YAxis />
 <Tooltip />
 <Legend />
 <Line 
 type="monotone" 
 dataKey="net" 
 stroke="#3b82f6" 
 strokeWidth={2} 
 name="Toplam Net"
 />
 </LineChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 )}

 {subjectData.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle>Ders Bazında Performans</CardTitle>
 <CardDescription>Ortalama net değerleri ve gelişim durumu</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={300}>
 <BarChart data={subjectData}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
 <YAxis />
 <Tooltip />
 <Legend />
 <Bar dataKey="ortalama" fill="#3b82f6" name="Ortalama Net" />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 )}

 {statistics.subject_performance && statistics.subject_performance.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle>Ders Bazında Detaylı İstatistikler</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 {statistics.subject_performance.map((subject) => (
 <div
 key={subject.subject_id}
 className="p-4 border rounded-lg"
 >
 <div className="flex items-center justify-between mb-3">
 <h4 className="font-semibold text-lg">{subject.subject_name}</h4>
 <div className="flex gap-2">
 <Badge variant={
 subject.strength_level === 'strong' ? 'default' :
 subject.strength_level === 'moderate' ? 'secondary' : 'outline'
 }>
 {subject.strength_level === 'strong' ? 'Güçlü' :
 subject.strength_level === 'moderate' ? 'Orta' : 'Zayıf'}
 </Badge>
 <Badge variant={
 subject.trend === 'improving' ? 'default' :
 subject.trend === 'stable' ? 'secondary' : 'destructive'
 }>
 {subject.trend === 'improving' ? '↗ Gelişiyor' :
 subject.trend === 'stable' ? '→ Stabil' : '↘ Düşüyor'}
 </Badge>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3 text-sm">
 <div>
 <div className="text-muted-foreground">Ortalama Net</div>
 <div className="font-bold text-blue-600">
 {subject.avg_net.toFixed(2)}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 )}
 </>
 )}
 </TabsContent>
 </Tabs>
 </div>
 );
}
