import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/utils/toast.utils";
import { motion } from "framer-motion";
import { Plus, Download, Search as SearchIcon, Upload, Sparkles, MessageSquare, Calendar, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Badge } from "@/components/atoms/Badge";
import { useIsMobile } from "@/hooks/utils/mobile.utils";
import { useAIContext } from "@/lib/contexts/ai-context";

import {
 SessionCalendar,
 SessionSearch,
 SessionCardView,
 SessionDrawer,
 SessionStatsCards,
 EnhancedSessionsTable,
 EnhancedSessionAnalytics,
 StatsCardSkeleton,
 CalendarSkeleton,
 TableSkeleton,
 SessionGridSkeleton,
} from "@/components/features/counseling/modern";

import ActiveSessionsGrid from "@/components/features/counseling/ActiveSessionsGrid";
import NewSessionDialog from "@/components/features/counseling/NewSessionDialog";
import EnhancedCompleteSessionDialog from "@/components/features/counseling/enhanced/EnhancedCompleteSessionDialog";
import ReminderDialog from "@/components/features/counseling/ReminderDialog";
import FollowUpDialog from "@/components/features/counseling/FollowUpDialog";
import SessionOutcomeDialog from "@/components/features/counseling/SessionOutcomeDialog";
import RemindersTab from "@/components/features/counseling/RemindersTab";
import OutcomesTab from "@/components/features/counseling/OutcomesTab";
import ReportGenerationDialog, { type ReportOptions } from "@/components/features/counseling/ReportGenerationDialog";
import { MEBBISTransferDialog } from "@/components/features/counseling/MEBBISTransferDialog";

import { useSessionStats } from "@/hooks/features/counseling/session-stats.hooks";
import { useSessionFilters } from "@/hooks/features/counseling/session-filters.hooks";
import { useSessionActions } from "@/hooks/features/counseling/session-actions.hooks";

import { getElapsedTime, getSessionName } from "@/components/features/counseling/utils/sessionHelpers";
import { exportSessionsToExcel } from "@/components/features/counseling/utils/sessionExport";
import { generateSessionsPDF, generateOutcomesPDF, generateComprehensiveReport } from "@/components/features/counseling/utils/sessionReports";

import type {
 CounselingSession,
 Student,
 ClassHour,
 CounselingTopic,
 IndividualSessionFormValues,
 GroupSessionFormValues,
 CompleteSessionFormValues,
 CounselingReminder,
 CounselingFollowUp,
 CounselingOutcome,
 ReminderFormValues,
 FollowUpFormValues,
 OutcomeFormValues,
} from "@/components/features/counseling/types";

import { apiClient } from "@/lib/api/core/client";
import { fetchWithSchool } from "@/lib/api/core/fetch-helpers";
import { COUNSELING_ENDPOINTS, STUDENT_ENDPOINTS } from "@/lib/constants/api-endpoints";
import { useAuth } from "@/lib/auth-context";
import { QUERY_KEYS } from "@/lib/school-context";

export default function CounselingSessions() {
 const { selectedSchool } = useAuth();
 const [activeTab, setActiveTab] = useState("dashboard");
 const [viewMode, setViewMode] = useState<'calendar' | 'table' | 'cards'>('calendar');
 const [dialogOpen, setDialogOpen] = useState(false);
 const [sessionType, setSessionType] = useState<'individual' | 'group'>('individual');
 const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
 const [selectedSession, setSelectedSession] = useState<CounselingSession | null>(null);
 const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
 const [drawerOpen, setDrawerOpen] = useState(false);
 const [searchOpen, setSearchOpen] = useState(false);
 const [remindedSessions, setRemindedSessions] = useState<Set<string>>(new Set());
 const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
 const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
 const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false);
 const [selectedReminder, setSelectedReminder] = useState<CounselingReminder | null>(null);
 const [selectedFollowUp, setSelectedFollowUp] = useState<CounselingFollowUp | null>(null);
 const [selectedOutcome, setSelectedOutcome] = useState<(CounselingOutcome & { session?: CounselingSession }) | null>(null);
 const [reportDialogOpen, setReportDialogOpen] = useState(false);
 const [mebbisDialogOpen, setMebbisDialogOpen] = useState(false);

 const { toast } = useToast();
 const queryClient = useQueryClient();
 const isMobile = useIsMobile();
 const { setStudentContext } = useAIContext();

 const { data: sessions = [], isLoading: sessionsLoading } = useQuery<CounselingSession[]>({
 queryKey: QUERY_KEYS.counselingSessions(selectedSchool?.id),
 queryFn: () => apiClient.get<CounselingSession[]>(COUNSELING_ENDPOINTS.BASE, { showErrorToast: false }),
 });

 const { data: students = [] } = useQuery<Student[]>({
 queryKey: [STUDENT_ENDPOINTS.BASE],
 queryFn: () => apiClient.get<Student[]>(STUDENT_ENDPOINTS.BASE, { showErrorToast: false }),
 });

 const { data: classHours = [] } = useQuery<ClassHour[]>({
 queryKey: ['/api/counseling-sessions/class-hours'],
 queryFn: () => apiClient.get<ClassHour[]>('/api/counseling-sessions/class-hours', { showErrorToast: false }),
 });

 const { data: topics = [] } = useQuery<CounselingTopic[]>({
 queryKey: [COUNSELING_ENDPOINTS.TOPICS],
 queryFn: () => apiClient.get<CounselingTopic[]>(COUNSELING_ENDPOINTS.TOPICS, { showErrorToast: false }),
 });

 const { data: reminders = [] } = useQuery<CounselingReminder[]>({
 queryKey: ['/api/counseling-sessions/reminders'],
 queryFn: async () => {
 const response = await fetchWithSchool('/api/counseling-sessions/reminders');
 if (!response.ok) throw new Error('Failed to fetch reminders');
 return response.json();
 },
 });

 const { data: followUps = [] } = useQuery<CounselingFollowUp[]>({
 queryKey: ['/api/counseling-sessions/follow-ups'],
 queryFn: async () => {
 const response = await fetchWithSchool('/api/counseling-sessions/follow-ups');
 if (!response.ok) throw new Error('Failed to fetch follow-ups');
 return response.json();
 },
 });

 const { data: outcomes = [] } = useQuery<(CounselingOutcome & { session?: CounselingSession })[]>({
 queryKey: ['/api/counseling-sessions/outcomes'],
 queryFn: async () => {
 const response = await fetchWithSchool('/api/counseling-sessions/outcomes');
 if (!response.ok) throw new Error('Failed to fetch outcomes');
 return response.json();
 },
 });

 const stats = useSessionStats(sessions);
 const { filteredSessions } = useSessionFilters(sessions);
 const actions = useSessionActions(classHours);

 const activeSessions = sessions.filter(s => !s.completed);
 const completedSessions = sessions.filter(s => s.completed);

 // Update AI context when a session with student is selected
 useEffect(() => {
   if (selectedSession && selectedSession.student) {
     setStudentContext({
       id: selectedSession.student.id,
       name: `${selectedSession.student.name} ${selectedSession.student.surname}`
     });
   } else {
     setStudentContext(null);
   }
   return () => {
     setStudentContext(null);
   };
 }, [selectedSession, setStudentContext]);

 useEffect(() => {
 const interval = setInterval(() => {
 queryClient.invalidateQueries({ queryKey: QUERY_KEYS.counselingSessions(selectedSchool?.id) });

 activeSessions.forEach(session => {
 const elapsed = getElapsedTime(session.entryTime, session.sessionDate);
 const limit = session.extensionGranted ? 75 : 60;
 const sessionKey = session.id;
 const sessionName = getSessionName(session);

 if (elapsed === 30 && !remindedSessions.has(`${sessionKey}-30`)) {
 toast({
 title:"⏰ 30 Dakika Geçti",
 description: `${sessionName} - Görüşme 30 dakikadır devam ediyor`,
 });
 setRemindedSessions(prev => new Set(prev).add(`${sessionKey}-30`));
 }

 if (elapsed === 45 && !remindedSessions.has(`${sessionKey}-45`)) {
 toast({
 title:"45 Dakika Geçti",
 description: `${sessionName} - ${limit - elapsed} dakika sonra otomatik tamamlanacak`,
 });
 setRemindedSessions(prev => new Set(prev).add(`${sessionKey}-45`));
 }

 if (elapsed === 55 && !remindedSessions.has(`${sessionKey}-55`)) {
 toast({
 title:"55 Dakika Geçti",
 description: `${sessionName} - ${limit - elapsed} dakika sonra otomatik tamamlanacak`,
 variant:"destructive",
 });
 setRemindedSessions(prev => new Set(prev).add(`${sessionKey}-55`));
 }
 });
 }, 30000);

 return () => clearInterval(interval);
 }, [activeSessions, remindedSessions, toast, queryClient, selectedSchool?.id]);

 const handleSelectSession = (session: CounselingSession) => {
 setSelectedSession(session);
 setDrawerOpen(true);
 };

 const handleCompleteSession = (session: CounselingSession) => {
 setSelectedSession(session);
 setDrawerOpen(false);
 setCompleteDialogOpen(true);
 };

 const handleCreateSession = (data: IndividualSessionFormValues | GroupSessionFormValues) => {
 actions.createSessionMutation.mutate(
 { sessionType, formData: data },
 {
 onSuccess: () => {
 setDialogOpen(false);
 },
 }
 );
 };

 const handleCompleteSubmit = (data: CompleteSessionFormValues) => {
 if (!selectedSession) return;
 actions.completeSessionMutation.mutate(
 { id: selectedSession.id, data },
 {
 onSuccess: () => {
 setCompleteDialogOpen(false);
 setSelectedSession(null);
 setActiveTab("journal");
 },
 }
 );
 };

 const handleExport = () => {
 const count = exportSessionsToExcel(sessions);
 toast({
 title:"Excel dosyası oluşturuldu",
 description: `${count} görüşme kaydı başarıyla dışa aktarıldı.`,
 });
 };

 const handleGenerateReport = async (options: ReportOptions) => {
 try {
 let filteredSessions = sessions;
 let filteredOutcomes = outcomes;

 if (options.dateRange) {
 const { start, end } = options.dateRange;
 filteredSessions = sessions.filter(session => {
 const sessionDate = new Date(session.sessionDate);
 return sessionDate >= start && sessionDate <= end;
 });

 const sessionIds = new Set(filteredSessions.map(s => s.id));
 filteredOutcomes = outcomes.filter(outcome => sessionIds.has(outcome.sessionId));
 }

 let result;
 if (options.format === 'pdf') {
 if (options.includeSessions && options.includeOutcomes) {
 result = await generateComprehensiveReport(filteredSessions, filteredOutcomes);
 } else if (options.includeSessions) {
 result = await generateSessionsPDF(filteredSessions, [], { includeOutcomes: false });
 } else if (options.includeOutcomes) {
 result = await generateOutcomesPDF(filteredOutcomes);
 }
 } else {
 const exportedCount = exportSessionsToExcel(filteredSessions);
 result = { success: true, sessionCount: exportedCount };
 }

 if (result && result.success) {
 toast({
 title:"Rapor oluşturuldu",
 description: `${options.format.toUpperCase()} raporu başarıyla indirildi.`,
 });
 }
 } catch (error) {
 console.error('Report generation error:', error);
 toast({
 title:"Hata",
 description:"Rapor oluşturulurken bir hata oluştu.",
 variant:"destructive",
 });
 }
 };

 return (
 <div className="w-full min-h-screen">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-5 md:p-6 shadow-xl"
 >
 <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
 <div className="absolute bottom-0 left-0 w-56 h-56 bg-teal-500/20 rounded-full blur-3xl"></div>

 <div className="relative z-10 max-w-3xl flex items-center justify-between">
 <div className="flex-1">
 <Badge className="mb-2 bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
 <Sparkles className="h-3 w-3 mr-1" />
 Görüşme & Randevu Sistemi
 </Badge>
 <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
 Rehberlik Görüşmeleri
 </h1>
 <p className="text-sm md:text-base text-white/90 mb-4 max-w-xl leading-relaxed">
 Modern görüşme yönetimi ve analiz sistemi.
 </p>
 <div className="flex gap-3 flex-wrap">
 <Button 
 onClick={() => setDialogOpen(true)}
 size="default"
 className="bg-white text-emerald-600 hover:bg-white/90 shadow-lg"
 >
 <Plus className="mr-2 h-4 w-4" />
 Yeni Görüşme
 </Button>
 <Button 
 onClick={() => setSearchOpen(true)}
 size="default"
 variant="outline"
 className="border-white/50 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
 >
 <SearchIcon className="mr-2 h-4 w-4" />
 Ara (⌘K)
 </Button>
 <Button 
 onClick={() => setReportDialogOpen(true)}
 size="default"
 variant="outline"
 className="border-white/50 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
 >
 <Download className="mr-2 h-4 w-4" />
 Rapor
 </Button>
 </div>
 </div>

 <motion.div
 className="hidden md:block opacity-30"
 animate={{ rotate: 360 }}
 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
 >
 <MessageSquare className="h-20 w-20 text-white" />
 </motion.div>
 </div>
 </motion.div>

 <div className="space-y-6 max-w-7xl mx-auto">

 <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 >
 <TabsList variant="minimal" className="w-full justify-start sm:justify-center">
 <TabsTrigger value="dashboard" variant="minimal">
 <TrendingUp className="h-4 w-4" />
 <span className="hidden sm:inline">Dashboard</span>
 </TabsTrigger>
 <TabsTrigger value="active" variant="minimal">
 <Users className="h-4 w-4" />
 <span className="hidden sm:inline">Aktif</span>
 {activeSessions.length > 0 && (
 <Badge variant="secondary" className="ml-2">{activeSessions.length}</Badge>
 )}
 </TabsTrigger>
 <TabsTrigger value="journal" variant="minimal">
 <MessageSquare className="h-4 w-4" />
 <span className="hidden sm:inline">Defter</span>
 </TabsTrigger>
 <TabsTrigger value="reminders" variant="minimal">
 <Calendar className="h-4 w-4" />
 <span className="hidden sm:inline">Hatırlatmalar</span>
 </TabsTrigger>
 <TabsTrigger value="analytics" variant="minimal">
 <TrendingUp className="h-4 w-4" />
 <span className="hidden sm:inline">Analitik</span>
 </TabsTrigger>
 </TabsList>
 </motion.div>

 <TabsContent value="dashboard" className="space-y-6">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 >
 <SessionStatsCards stats={stats} isLoading={sessionsLoading} />
 </motion.div>
 
 <motion.div 
 className="flex items-center justify-between"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.2 }}
 >
 <h2 className="text-xl font-semibold">Görüşme Takvimi</h2>
 <div className="flex gap-2">
 <Button
 variant={viewMode === 'calendar' ? 'default' : 'outline'}
 size="sm"
 onClick={() => setViewMode('calendar')}
 >
 <Calendar className="h-4 w-4 mr-2" />
 Takvim
 </Button>
 <Button
 variant={viewMode === 'table' ? 'default' : 'outline'}
 size="sm"
 onClick={() => setViewMode('table')}
 >
 <Users className="h-4 w-4 mr-2" />
 Tablo
 </Button>
 {isMobile && (
 <Button
 variant={viewMode === 'cards' ? 'default' : 'outline'}
 size="sm"
 onClick={() => setViewMode('cards')}
 >
 Kartlar
 </Button>
 )}
 </div>
 </motion.div>

 {sessionsLoading ? (
 viewMode === 'calendar' ? <CalendarSkeleton /> :
 viewMode === 'table' ? <TableSkeleton /> :
 <SessionGridSkeleton />
 ) : (
 <>
 {viewMode === 'calendar' && (
 <SessionCalendar
 sessions={filteredSessions}
 onSelectSession={handleSelectSession}
 onSelectSlot={() => setDialogOpen(true)}
 />
 )}
 {viewMode === 'table' && (
 <EnhancedSessionsTable
 sessions={filteredSessions}
 topics={topics}
 onExport={handleExport}
 onSelectSession={handleSelectSession}
 />
 )}
 {viewMode === 'cards' && (
 <SessionCardView
 sessions={filteredSessions}
 onSelectSession={handleSelectSession}
 onCompleteSession={handleCompleteSession}
 />
 )}
 </>
 )}
 </TabsContent>

 <TabsContent value="active" className="space-y-4">
 <ActiveSessionsGrid
 sessions={activeSessions}
 isLoading={sessionsLoading}
 onCompleteSession={handleCompleteSession}
 onExtendSession={(id) => actions.extendSessionMutation.mutate(id)}
 extendingSessionId={actions.extendSessionMutation.variables as string | undefined}
 />
 </TabsContent>

 <TabsContent value="journal" className="space-y-4">
 <div className="flex justify-end mb-4">
 <Button
 onClick={() => setMebbisDialogOpen(true)}
 disabled={completedSessions.length === 0}
 className="gap-2"
 >
 <Upload className="h-4 w-4" />
 MEBBIS'e Aktar
 {completedSessions.length > 0 && (
 <Badge variant="secondary" className="ml-1">
 {completedSessions.length}
 </Badge>
 )}
 </Button>
 </div>
 {sessionsLoading ? (
 <TableSkeleton />
 ) : (
 <EnhancedSessionsTable
 sessions={completedSessions}
 topics={topics}
 onExport={handleExport}
 onSelectSession={handleSelectSession}
 />
 )}
 </TabsContent>

 <TabsContent value="reminders" className="space-y-4">
 <RemindersTab
 reminders={reminders}
 followUps={followUps}
 onCreateReminder={() => setReminderDialogOpen(true)}
 onCreateFollowUp={() => setFollowUpDialogOpen(true)}
 onEditReminder={(r) => { setSelectedReminder(r); setReminderDialogOpen(true); }}
 onEditFollowUp={(f) => { setSelectedFollowUp(f); setFollowUpDialogOpen(true); }}
 onCompleteReminder={(id) => actions.updateReminderStatusMutation.mutate({ id, status: 'completed' })}
 onCancelReminder={(id) => actions.updateReminderStatusMutation.mutate({ id, status: 'cancelled' })}
 onCompleteFollowUp={(id) => actions.updateFollowUpStatusMutation.mutate({ id, status: 'completed' })}
 onProgressFollowUp={(id) => actions.updateFollowUpStatusMutation.mutate({ id, status: 'in_progress' })}
 />
 </TabsContent>

 <TabsContent value="analytics" className="space-y-6">
 <EnhancedSessionAnalytics stats={stats} />
 </TabsContent>
 </Tabs>

 <SessionSearch
 sessions={sessions}
 open={searchOpen}
 onOpenChange={setSearchOpen}
 onSelectSession={handleSelectSession}
 />

 <SessionDrawer
 session={selectedSession}
 open={drawerOpen}
 onOpenChange={setDrawerOpen}
 onComplete={handleCompleteSession}
 />

 <NewSessionDialog
 open={dialogOpen}
 onOpenChange={setDialogOpen}
 sessionType={sessionType}
 onSessionTypeChange={setSessionType}
 students={students}
 selectedStudents={selectedStudents}
 onSelectedStudentsChange={setSelectedStudents}
 onSubmit={handleCreateSession}
 isPending={actions.createSessionMutation.isPending}
 />

 {selectedSession && (
 <EnhancedCompleteSessionDialog
 open={completeDialogOpen}
 onOpenChange={setCompleteDialogOpen}
 session={selectedSession}
 topics={topics}
 onSubmit={handleCompleteSubmit}
 isPending={actions.completeSessionMutation.isPending}
 />
 )}

 <ReminderDialog
 open={reminderDialogOpen}
 onOpenChange={setReminderDialogOpen}
 students={students}
 initialData={selectedReminder ? {
 id: selectedReminder.id,
 sessionId: selectedReminder.sessionId,
 reminderType: selectedReminder.reminderType,
 reminderDate: new Date(selectedReminder.reminderDate),
 reminderTime: selectedReminder.reminderTime,
 title: selectedReminder.title,
 description: selectedReminder.description,
 studentIds: selectedReminder.studentIds ? JSON.parse(selectedReminder.studentIds) : [],
 } : undefined}
 onSubmit={(data) => {
 if (selectedReminder) {
 actions.updateReminderMutation.mutate({ id: selectedReminder.id, data });
 } else {
 actions.createReminderMutation.mutate(data);
 }
 setReminderDialogOpen(false);
 setSelectedReminder(null);
 }}
 isPending={selectedReminder 
 ? actions.updateReminderMutation.isPending 
 : actions.createReminderMutation.isPending
 }
 />

 <FollowUpDialog
 open={followUpDialogOpen}
 onOpenChange={setFollowUpDialogOpen}
 initialData={selectedFollowUp ? {
 id: selectedFollowUp.id,
 sessionId: selectedFollowUp.sessionId,
 followUpDate: new Date(selectedFollowUp.followUpDate),
 assignedTo: selectedFollowUp.assignedTo,
 priority: selectedFollowUp.priority,
 actionItems: selectedFollowUp.actionItems,
 notes: selectedFollowUp.notes,
 } : undefined}
 onSubmit={(data) => {
 if (selectedFollowUp) {
 actions.updateFollowUpMutation.mutate({ id: selectedFollowUp.id, data });
 } else {
 actions.createFollowUpMutation.mutate(data);
 }
 setFollowUpDialogOpen(false);
 setSelectedFollowUp(null);
 }}
 isPending={selectedFollowUp 
 ? actions.updateFollowUpMutation.isPending 
 : actions.createFollowUpMutation.isPending
 }
 />

 <SessionOutcomeDialog
 open={outcomeDialogOpen}
 onOpenChange={setOutcomeDialogOpen}
 session={selectedOutcome?.session || null}
 initialData={selectedOutcome ? {
 id: selectedOutcome.id,
 sessionId: selectedOutcome.sessionId,
 effectivenessRating: selectedOutcome.effectivenessRating,
 progressNotes: selectedOutcome.progressNotes,
 goalsAchieved: selectedOutcome.goalsAchieved,
 nextSteps: selectedOutcome.nextSteps,
 recommendations: selectedOutcome.recommendations,
 followUpRequired: selectedOutcome.followUpRequired,
 followUpDate: selectedOutcome.followUpDate ? new Date(selectedOutcome.followUpDate) : undefined,
 } : undefined}
 onSubmit={(data) => {
 if (selectedOutcome) {
 actions.updateOutcomeMutation.mutate({ id: selectedOutcome.id, data });
 } else {
 actions.createOutcomeMutation.mutate(data);
 }
 setOutcomeDialogOpen(false);
 setSelectedOutcome(null);
 }}
 isPending={selectedOutcome 
 ? actions.updateOutcomeMutation.isPending 
 : actions.createOutcomeMutation.isPending
 }
 />

 <ReportGenerationDialog
 open={reportDialogOpen}
 onOpenChange={setReportDialogOpen}
 onGenerate={handleGenerateReport}
 sessionCount={sessions.length}
 outcomeCount={outcomes.length}
 />

 <MEBBISTransferDialog
 open={mebbisDialogOpen}
 onOpenChange={setMebbisDialogOpen}
 sessionIds={completedSessions.map(s => s.id)}
 totalSessions={completedSessions.length}
 schoolId={selectedSchool?.id || ''}
 />
 </div>
 </div>
 );
}
