import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Progress } from "@/components/atoms/Progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { 
 Select, 
 SelectContent, 
 SelectItem, 
 SelectTrigger, 
 SelectValue 
} from "@/components/atoms/Select";
import {
 ProgressTimeline,
 PerformanceTrendChart,
 SuccessMetricCard,
} from "../charts/AnalyticsCharts";
import { CHART_COLORS, MASTERY_COLORS, DIFFICULTY_COLORS } from "@/lib/config/theme.config";
import {
 generateProgressTimeline,
 getStudentPerformanceData,
 calculateAttendanceRate,
 calculateAcademicTrend,
 calculateStudyConsistency,
} from "@/lib/analytics";
import { loadStudents, loadProgress, loadTopics, loadSessions } from "@/lib/storage";
import { 
 TrendingUp, 
 BookOpen, 
 Calendar,
 Award,
 Clock,
 Target,
 Activity,
 BarChart3,
 CheckCircle,
 AlertCircle,
 Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

// =================== TYP TANIMLARI ===================

interface StudentProgress {
 studentId: string;
 studentName: string;
 totalTopics: number;
 completedTopics: number;
 inProgressTopics: number;
 notStartedTopics: number;
 completionRate: number;
 averageScore: number;
 studyTimeTotal: number; // dakika
 consistencyScore: number;
 milestones: {
 date: string;
 achievement: string;
 type:"completion" |"milestone" |"improvement";
 }[];
}

interface TopicMastery {
 topicId: string;
 topicName: string;
 subjectName: string;
 completed: boolean;
 score?: number;
 timeSpent: number; // dakika
 difficulty:"Kolay" |"Orta" |"Zor";
 masteryLevel:"Başlangıç" |"Gelişiyor" |"Yeterli" |"İleri";
 lastStudied?: string;
}

interface AchievementData {
 id: string;
 title: string;
 description: string;
 earnedDate: string;
 category:"academic" |"attendance" |"study" |"social";
 level:"bronze" |"silver" |"gold";
}

interface TimelineEvent {
 date: string;
 type:"academic" |"study" |"achievement" |"milestone";
 title: string;
 description: string;
 value?: number;
 trend?:"up" |"down" |"stable";
}

// =================== VERİ İŞLEME FONKSİYONLARI ===================

async function calculateStudentProgress(studentId: string): Promise<StudentProgress> {
 const students = loadStudents();
 const student = students.find(s => s.id === studentId);
 if (!student) throw new Error("Öğrenci bulunamadı");

 const data = await getStudentPerformanceData(studentId);
 const progress = data.topicProgress;
 const sessions = data.studySessions;

 const completedTopics = progress.filter(p => p.completedFlag).length;
 const inProgressTopics = progress.filter(p => !p.completedFlag && p.completed > 0).length;
 const notStartedTopics = progress.filter(p => p.completed === 0).length;
 
 const completionRate = progress.length > 0 ? completedTopics / progress.length : 0;
 
 // Ortalama tamamlanma oranı hesaplama
 const progressWithTime = progress.filter(p => (p.completed + p.remaining) > 0);
 const averageScore = progressWithTime.length > 0 
 ? progressWithTime.reduce((sum, p) => sum + (p.completed / (p.completed + p.remaining) * 100), 0) / progressWithTime.length
 : 0;

 // Toplam çalışma süresi
 const studyTimeTotal = sessions.reduce((total, session) => total + (session.minutes || 0), 0);

 // Tutarlılık skoru
 const consistencyScore = calculateStudyConsistency(sessions);

 // Kilometre taşları oluşturma
 const milestones: StudentProgress["milestones"] = [];
 
 // Tamamlanan konular için kilometre taşı (tarihi simüle et)
 progress
 .filter(p => p.completedFlag)
 .forEach(p => {
 milestones.push({
 date: new Date().toISOString(), // Gerçek proje için tamamlanma tarihi eklenebilir
 achievement: `${loadTopics().find(t => t.id === p.topicId)?.name ||"Konu"} tamamlandı`,
 type:"completion"
 });
 });

 // Akademik başarılar
 data.academics.forEach(academic => {
 if (academic.gpa && academic.gpa >= 3.5) {
 milestones.push({
 date: academic.term,
 achievement: `Yüksek GPA: ${academic.gpa}`,
 type:"milestone"
 });
 }
 });

 return {
 studentId,
 studentName: `${student.name} ${student.surname}`,
 totalTopics: progress.length,
 completedTopics,
 inProgressTopics,
 notStartedTopics,
 completionRate,
 averageScore,
 studyTimeTotal,
 consistencyScore,
 milestones: milestones.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
 };
}

async function getTopicMastery(studentId: string): Promise<TopicMastery[]> {
 const topics = loadTopics();
 const progress = (await loadProgress()).filter(p => p.studentId === studentId);
 const sessions = (await loadSessions()).filter(s => s.studentId === studentId);

 return topics.map(topic => {
 const topicProgress = progress.find(p => p.topicId === topic.id);
 const topicSessions = sessions.filter(s => s.topicId === topic.id);
 const timeSpent = topicSessions.reduce((total, session) => total + (session.minutes || 0), 0);

 // Ustalık seviyesi hesaplama
 let masteryLevel: TopicMastery["masteryLevel"] ="Başlangıç";
 if (topicProgress?.completedFlag) {
 const completionRate = topicProgress.completed / (topicProgress.completed + topicProgress.remaining) * 100;
 if (completionRate >= 90) masteryLevel ="İleri";
 else if (completionRate >= 70) masteryLevel ="Yeterli";
 else masteryLevel ="Gelişiyor";
 } else if (topicProgress?.completed && topicProgress.completed > 0) {
 masteryLevel ="Gelişiyor";
 }

 // Son çalışma tarihi
 const lastSession = topicSessions
 .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

 return {
 topicId: topic.id,
 topicName: topic.name,
 subjectName:"Genel", // Bu alan gerçek projede topic.subjectId'den alınabilir
 completed: topicProgress?.completedFlag || false,
 score: topicProgress ? Math.round(topicProgress.completed / (topicProgress.completed + topicProgress.remaining) * 100) : undefined,
 timeSpent,
 difficulty: (topic as any).difficulty ||"Orta",
 masteryLevel,
 lastStudied: lastSession?.date,
 };
 });
}

async function generateStudentTimeline(studentId: string): Promise<TimelineEvent[]> {
 const data = await getStudentPerformanceData(studentId);
 const timeline: TimelineEvent[] = [];

 // Akademik kayıtlar
 data.academics.forEach(academic => {
 if (academic.gpa) {
 timeline.push({
 date: academic.term,
 type:"academic",
 title: `GPA: ${academic.gpa}`,
 description: `${academic.term} dönemi akademik performansı`,
 value: academic.gpa,
 trend: academic.gpa >= 3.0 ?"up" : academic.gpa >= 2.0 ?"stable" :"down"
 });
 }
 });

 // Çalışma oturumları (haftalık toplam)
 const weeklyStudy = new Map<string, number>();
 data.studySessions.forEach(session => {
 const week = new Date(session.date).toISOString().split('T')[0];
 const current = weeklyStudy.get(week) || 0;
 weeklyStudy.set(week, current + (session.minutes || 0));
 });

 weeklyStudy.forEach((minutes, week) => {
 if (minutes > 60) { // En az 1 saat çalışma
 timeline.push({
 date: week,
 type:"study",
 title: `${Math.round(minutes / 60)} saat çalışma`,
 description:"Haftalık çalışma süresi",
 value: minutes,
 trend: minutes > 120 ?"up" :"stable"
 });
 }
 });

 // Başarılar (achievements)
 data.achievements.forEach(achievement => {
 timeline.push({
 date: achievement.earnedAt,
 type:"achievement",
 title: achievement.title,
 description: achievement.description ||"Başarı kazanıldı"
 });
 });

 // Hedefler tamamlanması
 data.goals.filter(g => g.status ==="Tamamlandı" && g.completedDate).forEach(goal => {
 timeline.push({
 date: goal.completedDate!,
 type:"milestone",
 title: `Hedef Tamamlandı: ${goal.title}`,
 description: goal.description,
 trend:"up"
 });
 });

 return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// =================== BİLEŞENLER ===================

export function StudentProgressOverview({ studentId }: { studentId: string }) {
 const [progress, setProgress] = useState<StudentProgress | null>(null);

 useEffect(() => {
 async function loadProgress() {
 try {
 const data = await calculateStudentProgress(studentId);
 setProgress(data);
 } catch (error) {
 setProgress(null);
 }
 }
 loadProgress();
 }, [studentId]);

 if (!progress) {
 return (
 <Card>
 <CardContent className="p-6 text-center text-muted-foreground">
 Öğrenci ilerleme verisi bulunamadı
 </CardContent>
 </Card>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <SuccessMetricCard
 title="Toplam Konu"
 value={progress.totalTopics}
 icon={BookOpen}
 description="Atanan toplam konu sayısı"
 />
 
 <SuccessMetricCard
 title="Tamamlanan"
 value={progress.completedTopics}
 total={progress.totalTopics}
 icon={CheckCircle}
 description={`%${Math.round(progress.completionRate * 100)} tamamlanma`}
 trend="up"
 />
 
 <SuccessMetricCard
 title="Ortalama Puan"
 value={Math.round(progress.averageScore)}
 icon={Award}
 description="Tamamlanan konulardaki ortalama"
 trend={progress.averageScore >= 80 ?"up" : progress.averageScore >= 60 ?"stable" :"down"}
 />
 
 <SuccessMetricCard
 title="Çalışma Süresi"
 value={Math.round(progress.studyTimeTotal / 60)}
 icon={Clock}
 description="Toplam çalışma süresi (saat)"
 trend="up"
 />
 </div>
 );
}

export function TopicMasteryGrid({ studentId }: { studentId: string }) {
 const [topicMastery, setTopicMastery] = useState<TopicMastery[]>([]);
 const [filterLevel, setFilterLevel] = useState<string>("all");
 const [filterSubject, setFilterSubject] = useState<string>("all");

 useEffect(() => {
 async function loadMastery() {
 const data = await getTopicMastery(studentId);
 setTopicMastery(data);
 }
 loadMastery();
 }, [studentId]);

 const subjects = Array.from(new Set(topicMastery.map(t => t.subjectName)));
 
 const filteredTopics = topicMastery.filter(topic => {
 if (filterLevel !=="all" && topic.masteryLevel !== filterLevel) return false;
 if (filterSubject !=="all" && topic.subjectName !== filterSubject) return false;
 return true;
 });

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Target className="h-5 w-5" />
 Konu Ustalığı
 </CardTitle>
 <div className="flex gap-4">
 <Select value={filterLevel} onValueChange={setFilterLevel}>
 <SelectTrigger className="w-48">
 <SelectValue placeholder="Ustalık seviyesi..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tüm Seviyeler</SelectItem>
 <SelectItem value="Başlangıç">Başlangıç</SelectItem>
 <SelectItem value="Gelişiyor">Gelişiyor</SelectItem>
 <SelectItem value="Yeterli">Yeterli</SelectItem>
 <SelectItem value="İleri">İleri</SelectItem>
 </SelectContent>
 </Select>
 
 <Select value={filterSubject} onValueChange={setFilterSubject}>
 <SelectTrigger className="w-48">
 <SelectValue placeholder="Ders seçin..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tüm Dersler</SelectItem>
 {subjects.map(subject => (
 <SelectItem key={subject} value={subject}>
 {subject}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {filteredTopics.map(topic => (
 <div 
 key={topic.topicId}
 className={cn(
"border rounded-lg p-4",
 DIFFICULTY_COLORS[topic.difficulty]
 )}
 >
 <div className="flex items-start justify-between mb-2">
 <div className="flex-1">
 <h3 className="font-medium text-sm">{topic.topicName}</h3>
 <p className="text-xs text-muted-foreground">{topic.subjectName}</p>
 </div>
 {topic.completed && (
 <CheckCircle className="h-4 w-4 text-green-600" />
 )}
 </div>
 
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <Badge className={cn("text-xs", MASTERY_COLORS[topic.masteryLevel])}>
 {topic.masteryLevel}
 </Badge>
 <Badge variant="outline" className="text-xs">
 {topic.difficulty}
 </Badge>
 </div>
 
 {topic.score && (
 <div className="text-center">
 <div className="text-lg font-bold">{topic.score}</div>
 <div className="text-xs text-muted-foreground">Puan</div>
 </div>
 )}
 
 <div className="text-xs text-muted-foreground">
 <div>Çalışma: {Math.round(topic.timeSpent / 60)} saat</div>
 {topic.lastStudied && (
 <div>Son: {new Date(topic.lastStudied).toLocaleDateString('tr-TR')}</div>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 
 {filteredTopics.length === 0 && (
 <div className="text-center text-muted-foreground py-8">
 <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
 <p>Seçilen kriterlere uygun konu bulunamadı</p>
 </div>
 )}
 </CardContent>
 </Card>
 );
}

export function StudentTimeline({ studentId }: { studentId: string }) {
 const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
 const [selectedType, setSelectedType] = useState<string>("all");

 useEffect(() => {
 async function loadTimeline() {
 const data = await generateStudentTimeline(studentId);
 setTimeline(data);
 }
 loadTimeline();
 }, [studentId]);

 const filteredTimeline = selectedType ==="all" 
 ? timeline 
 : timeline.filter(event => event.type === selectedType);

 const typeIcons = {
 academic: BookOpen,
 study: Clock,
 achievement: Award,
 milestone: Target,
 };

 const typeColors = {
 academic:"border-l-blue-500",
 study:"border-l-green-500",
 achievement:"border-l-yellow-500",
 milestone:"border-l-purple-500",
 };

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Activity className="h-5 w-5" />
 İlerleme Zaman Çizelgesi
 </CardTitle>
 <Select value={selectedType} onValueChange={setSelectedType}>
 <SelectTrigger className="w-48">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tüm Etkinlikler</SelectItem>
 <SelectItem value="academic">Akademik</SelectItem>
 <SelectItem value="study">Çalışma</SelectItem>
 <SelectItem value="achievement">Başarılar</SelectItem>
 <SelectItem value="milestone">Kilometre Taşları</SelectItem>
 </SelectContent>
 </Select>
 </CardHeader>
 <CardContent>
 <div className="space-y-4 max-h-96 overflow-y-auto">
 {filteredTimeline.map((event, index) => {
 const IconComponent = typeIcons[event.type];
 
 return (
 <div 
 key={index}
 className={cn(
"flex items-start gap-4 p-4 border-l-4 bg-card rounded-r-lg",
 typeColors[event.type]
 )}
 >
 <div className="flex-shrink-0 mt-1">
 <IconComponent className="h-4 w-4" />
 </div>
 
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between">
 <h4 className="font-medium text-sm">{event.title}</h4>
 <div className="flex items-center gap-2">
 {event.trend && (
 <span className={cn(
"text-xs",
 event.trend ==="up" ?"text-green-600" : 
 event.trend ==="down" ?"text-red-600" :"text-gray-600"
 )}>
 {event.trend ==="up" ?"↗" : event.trend ==="down" ?"↘" :"→"}
 </span>
 )}
 <span className="text-xs text-muted-foreground">
 {new Date(event.date).toLocaleDateString('tr-TR')}
 </span>
 </div>
 </div>
 <p className="text-sm text-muted-foreground mt-1">
 {event.description}
 </p>
 {event.value && (
 <div className="text-sm font-medium mt-1">
 Değer: {event.value}
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 
 {filteredTimeline.length === 0 && (
 <div className="text-center text-muted-foreground py-8">
 <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
 <p>Henüz etkinlik kaydı bulunmuyor</p>
 </div>
 )}
 </CardContent>
 </Card>
 );
}

export default function ProgressCharts() {
 const [selectedStudent, setSelectedStudent] = useState<string>("");
 const students = loadStudents();

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold">Gelişim Grafikleri</h2>
 <p className="text-muted-foreground">
 Öğrenci ilerlemesinin görsel takibi ve analizi
 </p>
 </div>
 <Button variant="outline">
 <Download className="h-4 w-4" />
 Rapor İndir
 </Button>
 </div>

 {/* Öğrenci Seçimi */}
 <Card>
 <CardHeader>
 <CardTitle>Öğrenci Seçin</CardTitle>
 </CardHeader>
 <CardContent>
 <Select value={selectedStudent} onValueChange={setSelectedStudent}>
 <SelectTrigger className="w-full max-w-md">
 <SelectValue placeholder="İlerleme takibi yapılacak öğrenciyi seçin..." />
 </SelectTrigger>
 <SelectContent>
 {students.map(student => (
 <SelectItem key={student.id} value={student.id}>
 {student.name} {student.surname} ({student.class})
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </CardContent>
 </Card>

 {selectedStudent && (
 <Tabs defaultValue="overview" className="space-y-4">
 <TabsList>
 <TabsTrigger value="overview" variant="nested">Genel Bakış</TabsTrigger>
 <TabsTrigger value="mastery" variant="nested">Konu Ustalığı</TabsTrigger>
 <TabsTrigger value="timeline" variant="nested">Zaman Çizelgesi</TabsTrigger>
 <TabsTrigger value="trends" variant="nested">Trend Analizi</TabsTrigger>
 </TabsList>

 <TabsContent value="overview" className="space-y-4">
 <StudentProgressOverview studentId={selectedStudent} />
 </TabsContent>

 <TabsContent value="mastery" className="space-y-4">
 <TopicMasteryGrid studentId={selectedStudent} />
 </TabsContent>

 <TabsContent value="timeline" className="space-y-4">
 <StudentTimeline studentId={selectedStudent} />
 </TabsContent>

 <TabsContent value="trends" className="space-y-4">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <ProgressTimeline 
 data={generateProgressTimeline(selectedStudent)}
 title={`${students.find(s => s.id === selectedStudent)?.name} İlerleme Trendi`}
 />
 
 <PerformanceTrendChart 
 data={generateProgressTimeline(selectedStudent).map(d => ({
 date: d.date,
 value: d.value,
 }))}
 title="Performans Değişimi"
 color={CHART_COLORS.success}
 />
 </div>
 </TabsContent>
 </Tabs>
 )}

 {!selectedStudent && (
 <Card>
 <CardContent className="p-12 text-center text-muted-foreground">
 <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
 <h3 className="text-lg font-medium mb-2">Öğrenci Seçin</h3>
 <p>İlerleme grafiklerini görüntülemek için yukarıdan bir öğrenci seçin</p>
 </CardContent>
 </Card>
 )}
 </div>
 );
}