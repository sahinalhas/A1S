import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select/select';
import { Badge } from '@/components/atoms/Badge/badge';
import { Skeleton } from '@/components/atoms/Skeleton/skeleton';
import { BarChart3, Target, TrendingUp, Award, Calendar, FileText } from 'lucide-react';
import { GoalTrackingWidget } from './GoalTrackingWidget';
import { SubjectHeatmapWidget } from './SubjectHeatmapWidget';
import { BenchmarkComparisonWidget } from './BenchmarkComparisonWidget';
import { PredictiveAnalysisWidget } from './PredictiveAnalysisWidget';
import { TimeAnalysisWidget } from './TimeAnalysisWidget';
import { PDFReportDownloadWidget } from './PDFReportDownloadWidget';
import { AlertsWidget } from './AlertsWidget';

async function fetchExamTypes() {
 const response = await fetchWithSchool('/api/exam-management/types');
 const result = await response.json();
 if (!result.success) throw new Error(result.error);
 return result.data;
}

async function fetchSubjects(examTypeId: string) {
 const response = await fetchWithSchool(`/api/exam-management/types/${examTypeId}/subjects`);
 const result = await response.json();
 if (!result.success) throw new Error(result.error);
 return result.data;
}

async function fetchStudentSessions(studentId: string) {
 const response = await fetchWithSchool(`/api/exam-management/results/student/${studentId}`);
 const result = await response.json();
 if (!result.success) throw new Error(result.error);
 return result.data;
}

interface StudentSelfServiceDashboardProps {
 studentId: string;
 studentName: string;
}

export function StudentSelfServiceDashboard({ studentId, studentName }: StudentSelfServiceDashboardProps) {
 const [selectedExamType, setSelectedExamType] = useState('');

 const { data: examTypes, isLoading: loadingTypes } = useQuery({
 queryKey: ['exam-types'],
 queryFn: fetchExamTypes,
 });

 const { data: subjects } = useQuery({
 queryKey: ['subjects', selectedExamType],
 queryFn: () => fetchSubjects(selectedExamType),
 enabled: !!selectedExamType,
 });

 const { data: sessions, isLoading: loadingSessions } = useQuery({
 queryKey: ['student-sessions', studentId],
 queryFn: () => fetchStudentSessions(studentId),
 });

 if (loadingTypes || loadingSessions) {
 return (
 <div className="space-y-6 p-6">
 <Skeleton className="h-32 w-full" />
 <Skeleton className="h-64 w-full" />
 <Skeleton className="h-64 w-full" />
 </div>
 );
 }

 const uniqueExamTypeIds = [...new Set(sessions?.map((s: any) => s.exam_type_id))];
 const relevantExamTypes = examTypes?.filter((t: any) => uniqueExamTypeIds.includes(t.id)) || [];

 if (!selectedExamType && relevantExamTypes.length > 0) {
 setSelectedExamType(relevantExamTypes[0].id);
 }

 const studentStats = {
 total_exams: sessions?.length || 0,
 avg_performance: sessions?.reduce((sum: number, s: any) => sum + (s.net_score || 0), 0) / (sessions?.length || 1) || 0,
 best_performance: Math.max(...(sessions?.map((s: any) => s.net_score || 0) || [0])),
 recent_trend: 'improving',
 };

 return (
 <div className="space-y-6">
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="text-2xl">{studentName} - Öğrenci Panosu</CardTitle>
 <CardDescription>Performans analizi ve kişisel gelişim takibi</CardDescription>
 </div>
 <Badge variant="outline" className="text-lg px-4 py-2">
 Aktif
 </Badge>
 </div>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="flex items-center gap-3 p-4 border rounded-lg">
 <div className="p-3 bg-blue-100 rounded-lg">
 <Calendar className="h-6 w-6 text-blue-600" />
 </div>
 <div>
 <p className="text-sm text-muted-foreground">Toplam Sınav</p>
 <p className="text-2xl font-bold">{studentStats.total_exams}</p>
 </div>
 </div>

 <div className="flex items-center gap-3 p-4 border rounded-lg">
 <div className="p-3 bg-green-100 rounded-lg">
 <TrendingUp className="h-6 w-6 text-green-600" />
 </div>
 <div>
 <p className="text-sm text-muted-foreground">Ortalama</p>
 <p className="text-2xl font-bold">{studentStats.avg_performance.toFixed(1)}</p>
 </div>
 </div>

 <div className="flex items-center gap-3 p-4 border rounded-lg">
 <div className="p-3 bg-amber-100 rounded-lg">
 <Award className="h-6 w-6 text-amber-600" />
 </div>
 <div>
 <p className="text-sm text-muted-foreground">En İyi</p>
 <p className="text-2xl font-bold">{studentStats.best_performance.toFixed(1)}</p>
 </div>
 </div>

 <div className="flex items-center gap-3 p-4 border rounded-lg">
 <div className="p-3 bg-purple-100 rounded-lg">
 <Target className="h-6 w-6 text-purple-600" />
 </div>
 <div>
 <p className="text-sm text-muted-foreground">Trend</p>
 <Badge className="bg-green-100 text-green-700">Gelişiyor</Badge>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 <div className="flex items-center justify-between">
 <h3 className="text-lg font-semibold">Sınav Türü Seçin</h3>
 <Select value={selectedExamType} onValueChange={setSelectedExamType}>
 <SelectTrigger className="w-64">
 <SelectValue placeholder="Sınav türü seçin" />
 </SelectTrigger>
 <SelectContent>
 {relevantExamTypes.map((type: any) => (
 <SelectItem key={type.id} value={type.id}>
 {type.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <Tabs defaultValue="overview" className="space-y-4">
 <TabsList variant="nested">
 <TabsTrigger value="overview" variant="nested">
 <BarChart3 className="h-4 w-4 mr-2" />
 Genel Bakış
 </TabsTrigger>
 <TabsTrigger value="goals" variant="nested">
 <Target className="h-4 w-4 mr-2" />
 Hedefler
 </TabsTrigger>
 <TabsTrigger value="analysis" variant="nested">
 <TrendingUp className="h-4 w-4 mr-2" />
 Analiz
 </TabsTrigger>
 <TabsTrigger value="reports" variant="nested">
 <FileText className="h-4 w-4 mr-2" />
 Raporlar
 </TabsTrigger>
 <TabsTrigger value="alerts" variant="nested">
 <Award className="h-4 w-4 mr-2" />
 Bildirimler
 </TabsTrigger>
 </TabsList>

 <TabsContent value="overview" className="space-y-6">
 {selectedExamType && (
 <>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <SubjectHeatmapWidget
 studentId={studentId}
 examTypeId={selectedExamType}
 studentName={studentName}
 />
 <BenchmarkComparisonWidget studentId={studentId} studentName={studentName} />
 </div>
 <TimeAnalysisWidget
 studentId={studentId}
 examTypeId={selectedExamType}
 studentName={studentName}
 />
 </>
 )}
 </TabsContent>

 <TabsContent value="goals" className="space-y-6">
 {selectedExamType && examTypes && subjects && (
 <GoalTrackingWidget studentId={studentId} examTypes={examTypes} subjects={subjects} />
 )}
 </TabsContent>

 <TabsContent value="analysis" className="space-y-6">
 {selectedExamType && (
 <PredictiveAnalysisWidget
 studentId={studentId}
 examTypeId={selectedExamType}
 studentName={studentName}
 />
 )}
 </TabsContent>

 <TabsContent value="reports" className="space-y-6">
 {examTypes && (
 <PDFReportDownloadWidget studentId={studentId} examTypes={examTypes} studentName={studentName} />
 )}
 </TabsContent>

 <TabsContent value="alerts" className="space-y-6">
 <AlertsWidget studentId={studentId} showAll={true} />
 </TabsContent>
 </Tabs>
 </div>
 );
}
