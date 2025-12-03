import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { 
  ClipboardList, 
  User, 
  Plus,
  BarChart3,
  TrendingUp,
  BookOpen,
  GraduationCap,
  FileText,
  Sparkles
} from 'lucide-react';
import { PageHeader } from '@/components/molecules/PageHeader';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { Skeleton } from '@/components/atoms/Skeleton';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import {
 useExamTypes,
 useExamSubjects,
 useExamSessions,
 useCreateExamSession,
 useUpdateExamSession,
 useDeleteExamSession,
 useUpsertExamResult,
 useSessionStatistics,
 useImportExcelResults,
 downloadExcelTemplate,
 useSchoolExamsByStudent,
 useCreateSchoolExam,
 useDeleteSchoolExam,
} from '@/hooks/queries/exams.query-hooks';
import { ExamSessionDialog } from '@/components/features/exam-management/ExamSessionDialog';
import { PracticeExamsTab } from '@/components/features/exam-management/PracticeExamsTab';
import { SchoolExamsTab } from '@/components/features/exam-management/SchoolExamsTab';
import { DashboardOverviewTab } from '@/components/features/exam-management/DashboardOverviewTab';
import { UnifiedAnalysisTab } from '@/components/features/exam-management/UnifiedAnalysisTab';
import { AdvancedAnalyticsTab } from '@/components/features/exam-management/AdvancedAnalyticsTab';
import { StudentSelfServiceDashboard } from '@/components/features/exam-management/StudentSelfServiceDashboard';
import ExamStatsCards from '@/components/features/exam-management/ExamStatsCards';
import { useDashboardOverview } from '@/hooks/queries/exams.query-hooks';
import type {
 ExamSession,
 SubjectResults,
} from '../../shared/types/exam-management.types';

interface Student {
 id: string;
 name: string;
 class?: string;
 studentNumber?: string;
 grade?: number;
}

function useStudents() {
 return useQuery<Student[]>({
 queryKey: ['students'],
 queryFn: async () => {
 const response = await fetch('/api/students');
 if (!response.ok) throw new Error('Öğrenciler yüklenemedi');
 const data = await response.json();
 return data.data || [];
 },
 });
}

export default function ExamManagementPage() {
 const [activeTab, setActiveTab] = useState<string>('overview');
 const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
 const [editingSession, setEditingSession] = useState<ExamSession | null>(null);
 const [statsSessionId, setStatsSessionId] = useState<string>('');
 const [resultEntrySessionId, setResultEntrySessionId] = useState<string>('');
 const [selectedStudentForDashboard, setSelectedStudentForDashboard] = useState<string>('');

 const { data: examTypes, isLoading: typesLoading, error: typesError } = useExamTypes();
 const { data: allSessions = [], refetch: refetchSessions } = useExamSessions();
 const { data: students = [] } = useStudents();
 const { data: schoolExams = [] } = useSchoolExamsByStudent(undefined);
 const { data: overview, isLoading: overviewLoading } = useDashboardOverview();

 const createSession = useCreateExamSession();
 const updateSession = useUpdateExamSession();
 const deleteSession = useDeleteExamSession();
 const upsertResult = useUpsertExamResult();
 const importExcel = useImportExcelResults();
 const createSchoolExam = useCreateSchoolExam();
 const deleteSchoolExam = useDeleteSchoolExam();

 const { data: statistics, isLoading: statsLoading } = useSessionStatistics(
 statsSessionId || undefined
 );

 const resultEntrySession = allSessions.find((s) => s.id === resultEntrySessionId);
 const subjectsForResultEntry = useExamSubjects(
 resultEntrySession?.exam_type_id
 );

 const handleCreateExam = async (data: {
 exam_type_id: string;
 name: string;
 exam_date: string;
 description?: string;
 }) => {
 try {
 await createSession.mutateAsync(data);
 toast.success('Deneme sınavı oluşturuldu');
 refetchSessions();
 } catch (error) {
 toast.error('Deneme sınavı oluşturulamadı');
 throw error;
 }
 };

 const handleSaveSession = async (data: {
 name: string;
 exam_date: string;
 description?: string;
 }) => {
 try {
 if (editingSession) {
 await updateSession.mutateAsync({
 id: editingSession.id,
 input: data,
 });
 toast.success('Deneme sınavı güncellendi');
 } else {
 toast.error('Geçersiz işlem');
 }
 setEditingSession(null);
 setSessionDialogOpen(false);
 refetchSessions();
 } catch (error) {
 toast.error('Bir hata oluştu');
 }
 };

 const handleEditSession = (session: ExamSession) => {
 setEditingSession(session);
 setSessionDialogOpen(true);
 };

 const handleDeleteSession = async (sessionId: string) => {
 try {
 await deleteSession.mutateAsync(sessionId);
 toast.success('Deneme sınavı silindi');
 refetchSessions();
 } catch (error) {
 toast.error('Deneme sınavı silinemedi');
 }
 };

 const handleViewStatistics = (session: ExamSession) => {
 setStatsSessionId(session.id);
 setActiveTab('analysis');
 };

 const handleSaveResults = async (
 sessionId: string,
 studentId: string,
 results: SubjectResults[]
 ) => {
 try {
 const promises = results.map((result) =>
 upsertResult.mutateAsync({
 session_id: sessionId,
 student_id: studentId,
 ...result,
 })
 );
 await Promise.all(promises);
 toast.success('Sonuçlar kaydedildi');
 } catch (error) {
 toast.error('Sonuçlar kaydedilemedi');
 throw error;
 }
 };

 const handleImportExcel = async (sessionId: string, file: File) => {
 try {
 const result = await importExcel.mutateAsync({ sessionId, file });
 toast.success(result.message || 'Dosya başarıyla yüklendi');
 return { success: true, message: result.message || 'İçe aktarma başarılı' };
 } catch (error: unknown) {
 toast.error(error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Dosya yüklenemedi');
 return {
 success: false,
 message: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Bir hata oluştu',
 };
 }
 };

 const handleDownloadTemplate = async (examTypeId: string) => {
 downloadExcelTemplate(examTypeId, true);
 toast.success('Şablon indiriliyor');
 };

 const handleSaveSchoolExam = async (data: any) => {
 try {
 await createSchoolExam.mutateAsync(data);
 toast.success('Okul sınavı kaydedildi');
 } catch (error) {
 toast.error('Okul sınavı kaydedilemedi');
 throw error;
 }
 };

 const handleDeleteSchoolExam = async (examId: string) => {
 try {
 await deleteSchoolExam.mutateAsync(examId);
 toast.success('Okul sınavı silindi');
 } catch (error) {
 toast.error('Okul sınavı silinemedi');
 }
 };

 if (typesLoading) {
 return (
 <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
 <div className="space-y-2">
 <Skeleton className="h-8 w-64" />
 <Skeleton className="h-4 w-96" />
 </div>
 <Skeleton className="h-[500px] w-full" />
 </div>
 );
 }

 if (typesError) {
 return (
 <div className="w-full max-w-7xl mx-auto p-6">
 <Alert variant="destructive">
 <AlertDescription>
 Sınav türleri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
 </AlertDescription>
 </Alert>
 </div>
 );
 }

 return (
 <div className="w-full min-h-screen pb-6">
 {/* Modern Gradient Header */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 p-5 md:p-6 shadow-xl"
 >
 <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
 <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-400/20 rounded-full blur-3xl"></div>
 
 <div className="relative z-10 max-w-full flex items-center justify-between">
 <div className="flex-1">
 <Badge className="mb-2 bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
 <ClipboardList className="h-3 w-3 mr-1" />
 Sınav & Deneme Sistemi
 </Badge>
 <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
 Sınav & Denemeler
 </h1>
 <p className="text-sm md:text-base text-white/90 mb-4 max-w-xl leading-relaxed">
 Deneme sınavları, okul notları ve değerlendirme sonuçlarını yönetin
 </p>
 
 <Button 
 size="sm" 
 onClick={() => setActiveTab('practice-exams')}
 className="gap-2 bg-white text-indigo-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
 >
 <Plus className="h-4 w-4" />
 Yeni Deneme Ekle
 </Button>
 </div>

 <motion.div
 className="hidden md:block opacity-30"
 animate={{ rotate: 360 }}
 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
 >
 <GraduationCap className="h-20 w-20 text-white" />
 </motion.div>
 </div>
 </motion.div>

 <div className="space-y-6 max-w-7xl mx-auto px-6">
 {/* Stats Cards */}
 <ExamStatsCards
 stats={overview ? {
 totalSessions: overview.summary.total_sessions,
 totalStudents: overview.summary.total_students,
 avgParticipationRate: overview.summary.avg_participation_rate,
 avgOverallSuccess: overview.summary.avg_overall_success,
 sessionsThisMonth: overview.summary.sessions_this_month,
 sessionsLastMonth: overview.summary.sessions_last_month,
 trend: overview.summary.trend,
 } : {
 totalSessions: 0,
 totalStudents: 0,
 avgParticipationRate: 0,
 avgOverallSuccess: 0,
 sessionsThisMonth: 0,
 sessionsLastMonth: 0,
 trend: 'stable' as const,
 }}
 isLoading={overviewLoading}
 />

 {/* Modern Tabs */}
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 >
 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList variant="minimal" className="w-full justify-start sm:justify-center">
 <TabsTrigger value="overview" variant="minimal">
 <BarChart3 className="h-4 w-4" />
 <span className="hidden sm:inline">Genel Bakış</span>
 </TabsTrigger>
 <TabsTrigger value="practice-exams" variant="minimal">
 <FileText className="h-4 w-4" />
 <span className="hidden sm:inline">Denemeler</span>
 </TabsTrigger>
 <TabsTrigger value="school-exams" variant="minimal">
 <BookOpen className="h-4 w-4" />
 <span className="hidden sm:inline">Okul Sınavları</span>
 </TabsTrigger>
 <TabsTrigger value="analysis" variant="minimal">
 <TrendingUp className="h-4 w-4" />
 <span className="hidden sm:inline">Analizler</span>
 </TabsTrigger>
 <TabsTrigger value="advanced" variant="minimal">
 <BarChart3 className="h-4 w-4" />
 <span className="hidden sm:inline">Gelişmiş Analitik</span>
 </TabsTrigger>
 <TabsTrigger value="student-dashboard" variant="minimal">
 <User className="h-4 w-4" />
 <span className="hidden sm:inline">Öğrenci Panosu</span>
 </TabsTrigger>
 </TabsList>

 <TabsContent value="overview" className="mt-6">
 <DashboardOverviewTab
 examTypes={examTypes || []}
 onNavigateToTab={setActiveTab}
 onCreateSession={() => {
 setActiveTab('practice-exams');
 }}
 />
 </TabsContent>

 <TabsContent value="practice-exams" className="mt-6">
 <PracticeExamsTab
 examTypes={examTypes || []}
 sessions={allSessions}
 subjects={subjectsForResultEntry.data || []}
 students={students}
 onCreateExam={handleCreateExam}
 onViewStatistics={handleViewStatistics}
 onImportExcel={handleImportExcel}
 onDownloadTemplate={handleDownloadTemplate}
 onSaveResults={handleSaveResults}
 onResultSessionChange={setResultEntrySessionId}
 onEditSession={handleEditSession}
 onDeleteSession={handleDeleteSession}
 isCreating={createSession.isPending}
 />
 </TabsContent>

 <TabsContent value="school-exams" className="mt-6">
 <SchoolExamsTab
 students={students}
 schoolExams={schoolExams}
 onSave={handleSaveSchoolExam}
 onDelete={handleDeleteSchoolExam}
 />
 </TabsContent>

 <TabsContent value="analysis" className="mt-6">
 <UnifiedAnalysisTab
 examTypes={examTypes || []}
 sessions={allSessions}
 statistics={statistics || null}
 isLoading={statsLoading}
 onSessionChange={setStatsSessionId}
 selectedSessionId={statsSessionId}
 />
 </TabsContent>

 <TabsContent value="advanced" className="mt-6">
 <AdvancedAnalyticsTab examTypes={examTypes || []} />
 </TabsContent>

 <TabsContent value="student-dashboard" className="mt-6">
 {selectedStudentForDashboard ? (
 <StudentSelfServiceDashboard
 studentId={selectedStudentForDashboard}
 studentName={students.find((s) => s.id === selectedStudentForDashboard)?.name || ''}
 />
 ) : (
 <div className="bg-card border rounded-lg p-12 text-center">
 <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
 <h3 className="text-lg font-medium mb-2">Öğrenci Seçin</h3>
 <p className="text-muted-foreground mb-6">
 Öğrenci panosu görüntülemek için bir öğrenci seçin
 </p>
 <select
 className="border rounded px-4 py-2 min-w-[300px]"
 value={selectedStudentForDashboard}
 onChange={(e) => setSelectedStudentForDashboard(e.target.value)}
 >
 <option value="">Öğrenci seçin...</option>
 {students.map((student: any) => (
 <option key={student.id} value={student.id}>
 {student.name}
 </option>
 ))}
 </select>
 </div>
 )}
 </TabsContent>
 </Tabs>
 </motion.div>
 </div>

 <ExamSessionDialog
 open={sessionDialogOpen}
 onOpenChange={setSessionDialogOpen}
 examTypeId={editingSession?.exam_type_id || ''}
 examTypeName={
 examTypes?.find((t) => t.id === editingSession?.exam_type_id)?.name || ''
 }
 session={editingSession || undefined}
 onSave={handleSaveSession}
 />
 </div>
 );
}
