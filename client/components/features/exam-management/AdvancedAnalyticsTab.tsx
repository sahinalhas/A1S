import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select/select';
import { Label } from '@/components/atoms/Label/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/organisms/Accordion/accordion';
import { Brain, Flame, Award, Clock, FileQuestion, TrendingUp, Target, BarChart2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/atoms/Alert/alert';
import { DashboardMetricsWidget } from './DashboardMetricsWidget';
import { GoalTrackingWidget } from './GoalTrackingWidget';
import { SubjectHeatmapWidget } from './SubjectHeatmapWidget';
import { BenchmarkComparisonWidget } from './BenchmarkComparisonWidget';
import { PredictiveAnalysisWidget } from './PredictiveAnalysisWidget';
import { TimeAnalysisWidget } from './TimeAnalysisWidget';
import { QuestionAnalysisWidget } from './QuestionAnalysisWidget';
import { PDFReportDownloadWidget } from './PDFReportDownloadWidget';
import { AlertsWidget } from './AlertsWidget';

async function fetchStudents() {
 const response = await fetchWithSchool('/api/students');
 if (!response.ok) throw new Error('Öğrenciler yüklenemedi');
 const data = await response.json();
 return data.data || [];
}

async function fetchSessions() {
 const response = await fetchWithSchool('/api/exam-management/sessions');
 const result = await response.json();
 if (!result.success) throw new Error(result.error);
 return result.data || [];
}

interface AdvancedAnalyticsTabProps {
 examTypes: any[];
}

export function AdvancedAnalyticsTab({ examTypes }: AdvancedAnalyticsTabProps) {
 const [selectedStudent, setSelectedStudent] = useState('');
 const [selectedExamType, setSelectedExamType] = useState('');
 const [selectedSession, setSelectedSession] = useState('');

 const { data: students = [] } = useQuery({
 queryKey: ['students'],
 queryFn: fetchStudents,
 });

 const { data: sessions = [] } = useQuery({
 queryKey: ['exam-sessions'],
 queryFn: fetchSessions,
 });

 const { data: subjects = [] } = useQuery({
 queryKey: ['subjects', selectedExamType],
 queryFn: async () => {
 if (!selectedExamType) return [];
 const response = await fetchWithSchool(`/api/exam-management/types/${selectedExamType}/subjects`);
 const result = await response.json();
 if (!result.success) throw new Error(result.error);
 return result.data;
 },
 enabled: !!selectedExamType,
 });

 const selectedStudentData = students.find((s: any) => s.id === selectedStudent);

 return (
 <div className="space-y-6">
 <Card className="border-2 border-primary/20">
 <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/5 border-b">
 <CardTitle className="flex items-center gap-2 text-xl">
 <Brain className="h-6 w-6 text-primary" />
 Gelişmiş Analitik Merkezi
 </CardTitle>
 <CardDescription>
 Gerçek zamanlı metrikler, tahminsel analitik, hedef takip ve detaylı performans analizleri
 </CardDescription>
 </CardHeader>
 <CardContent className="pt-6">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="space-y-2">
 <Label htmlFor="adv-student" className="text-sm font-medium">Öğrenci Seç</Label>
 <Select value={selectedStudent} onValueChange={setSelectedStudent}>
 <SelectTrigger id="adv-student">
 <SelectValue placeholder="Öğrenci seçin" />
 </SelectTrigger>
 <SelectContent>
 {students.map((student: any) => (
 <SelectItem key={student.id} value={student.id}>
 {student.fullName || student.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label htmlFor="adv-exam-type" className="text-sm font-medium">Sınav Türü</Label>
 <Select value={selectedExamType} onValueChange={setSelectedExamType}>
 <SelectTrigger id="adv-exam-type">
 <SelectValue placeholder="Sınav türü seçin" />
 </SelectTrigger>
 <SelectContent>
 {examTypes.map((type) => (
 <SelectItem key={type.id} value={type.id}>
 {type.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label htmlFor="adv-session" className="text-sm font-medium">Deneme Sınavı (Soru Analizi)</Label>
 <Select value={selectedSession} onValueChange={setSelectedSession}>
 <SelectTrigger id="adv-session">
 <SelectValue placeholder="Deneme seçin" />
 </SelectTrigger>
 <SelectContent>
 {sessions.map((session: any) => (
 <SelectItem key={session.id} value={session.id}>
 {session.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 </CardContent>
 </Card>

 <DashboardMetricsWidget />

 {!selectedStudent || !selectedExamType ? (
 <Alert>
 <TrendingUp className="h-4 w-4" />
 <AlertDescription>
 Detaylı analizleri görüntülemek için yukarıdan öğrenci ve sınav türü seçin.
 </AlertDescription>
 </Alert>
 ) : (
 <Accordion type="multiple" className="space-y-4" defaultValue={['performance', 'reports']}>
 <AccordionItem value="performance" className="border-2 rounded-lg">
 <AccordionTrigger className="px-6">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-blue-500/10 rounded-lg">
 <BarChart2 className="h-5 w-5 text-blue-600" />
 </div>
 <div className="text-left">
 <div className="font-semibold">Performans Analizi</div>
 <div className="text-xs text-muted-foreground mt-0.5">
 Hedef takibi, benchmark karşılaştırma ve zaman analizi
 </div>
 </div>
 </div>
 </AccordionTrigger>
 <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <GoalTrackingWidget
 studentId={selectedStudent}
 examTypes={examTypes}
 subjects={subjects}
 />
 <BenchmarkComparisonWidget
 studentId={selectedStudent}
 studentName={selectedStudentData?.fullName || selectedStudentData?.name}
 />
 </div>
 <TimeAnalysisWidget
 studentId={selectedStudent}
 examTypeId={selectedExamType}
 studentName={selectedStudentData?.fullName || selectedStudentData?.name}
 />
 </AccordionContent>
 </AccordionItem>

 <AccordionItem value="heatmap" className="border-2 rounded-lg">
 <AccordionTrigger className="px-6">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-orange-500/10 rounded-lg">
 <Flame className="h-5 w-5 text-orange-600" />
 </div>
 <div className="text-left">
 <div className="font-semibold">Konu Isı Haritası</div>
 <div className="text-xs text-muted-foreground mt-0.5">
 Ders bazında güçlü ve zayıf yönleri görsel analiz
 </div>
 </div>
 </div>
 </AccordionTrigger>
 <AccordionContent className="px-6 pb-6 pt-2">
 <SubjectHeatmapWidget
 studentId={selectedStudent}
 examTypeId={selectedExamType}
 studentName={selectedStudentData?.fullName || selectedStudentData?.name}
 />
 </AccordionContent>
 </AccordionItem>

 <AccordionItem value="prediction" className="border-2 rounded-lg">
 <AccordionTrigger className="px-6">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-purple-500/10 rounded-lg">
 <Brain className="h-5 w-5 text-purple-600" />
 </div>
 <div className="text-left">
 <div className="font-semibold">Tahminsel AI Analizi</div>
 <div className="text-xs text-muted-foreground mt-0.5">
 Gelecek performans tahmini ve risk değerlendirmesi
 </div>
 </div>
 </div>
 </AccordionTrigger>
 <AccordionContent className="px-6 pb-6 pt-2">
 <PredictiveAnalysisWidget
 studentId={selectedStudent}
 examTypeId={selectedExamType}
 studentName={selectedStudentData?.fullName || selectedStudentData?.name}
 />
 </AccordionContent>
 </AccordionItem>

 <AccordionItem value="reports" className="border-2 rounded-lg">
 <AccordionTrigger className="px-6">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-green-500/10 rounded-lg">
 <Target className="h-5 w-5 text-green-600" />
 </div>
 <div className="text-left">
 <div className="font-semibold">Rapor ve Dökümantasyon</div>
 <div className="text-xs text-muted-foreground mt-0.5">
 Detaylı PDF rapor oluşturma ve indirme
 </div>
 </div>
 </div>
 </AccordionTrigger>
 <AccordionContent className="px-6 pb-6 pt-2">
 <PDFReportDownloadWidget
 studentId={selectedStudent}
 examTypes={examTypes}
 studentName={selectedStudentData?.fullName || selectedStudentData?.name}
 />
 </AccordionContent>
 </AccordionItem>
 </Accordion>
 )}

 {selectedSession && (
 <Card className="border-2">
 <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border-b">
 <CardTitle className="flex items-center gap-2">
 <FileQuestion className="h-5 w-5 text-cyan-600" />
 Soru Bazlı Analiz
 </CardTitle>
 <CardDescription>
 Deneme sınavı sorularının detaylı performans analizi
 </CardDescription>
 </CardHeader>
 <CardContent className="pt-6">
 <QuestionAnalysisWidget
 sessionId={selectedSession}
 sessionName={sessions.find((s: any) => s.id === selectedSession)?.name}
 />
 </CardContent>
 </Card>
 )}

 <Card className="border-2">
 <CardHeader className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-b">
 <CardTitle className="flex items-center gap-2">
 <Award className="h-5 w-5 text-amber-600" />
 Uyarılar ve Bildirimler
 </CardTitle>
 <CardDescription>
 Sistem bildirimleri ve önemli uyarılar
 </CardDescription>
 </CardHeader>
 <CardContent className="pt-6">
 <AlertsWidget showAll={true} />
 </CardContent>
 </Card>
 </div>
 );
}
