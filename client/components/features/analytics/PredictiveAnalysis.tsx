import React, { useMemo, useState, useEffect } from "react";
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
 SuccessPredictionGauge,
 EarlyWarningIndicator,
} from "../charts/AnalyticsCharts";
import {
 calculateAttendanceRate,
 calculateAcademicTrend,
 calculateStudyConsistency,
 getStudentPerformanceData,
} from "@/lib/analytics";
import {
 optimizedPredictStudentSuccess,
 optimizedCalculateRiskScore,
 optimizedGenerateEarlyWarnings,
} from "@/lib/analytics-cache";
import { loadStudents } from "@/lib/storage";
import { 
 Brain, 
 Users, 
 Target,
 BookOpen,
 Calendar,
 Clock,
 Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RISK_BADGE_COLORS } from "@/lib/config/theme.config";

// =================== TYP TANIMLARI ===================

interface PredictionResult {
 studentId: string;
 studentName: string;
 currentGrade: string;
 successProbability: number;
 riskLevel:"Düşük" |"Orta" |"Yüksek" |"Kritik";
 keyFactors: {
 academic: number;
 attendance: number;
 study: number;
 engagement: number;
 };
 recommendations: string[];
 interventionPriority: number;
 predictedOutcome: string;
}

interface ClassPrediction {
 class: string;
 className?: string;
 totalStudents: number;
 highSuccessProbability: number; // >80%
 mediumSuccessProbability: number; // 50-80%
 lowSuccessProbability: number; // <50%
 averageSuccessRate: number;
 riskStudentsCount: number;
 interventionRecommendations: string[];
}

// =================== YARDIMCI FONKSİYONLAR ===================

async function calculateDetailedPrediction(studentId: string): Promise<PredictionResult> {
 const students = loadStudents();
 const student = students.find(s => s.id === studentId);
 if (!student) throw new Error("Öğrenci bulunamadı");

 const data = await getStudentPerformanceData(studentId);
 const successProbability = await optimizedPredictStudentSuccess(studentId);
 const riskScore = await optimizedCalculateRiskScore(studentId);
 
 // Anahtar faktörleri hesapla
 const attendanceRate = calculateAttendanceRate(data.attendance);
 const academicTrend = calculateAcademicTrend(data.academics);
 const studyConsistency = calculateStudyConsistency(data.studySessions);
 
 // Engagement skoru (anket sonuçları, hedefler, öz değerlendirme)
 const recentSurveys = data.surveys.slice(-3);
 const avgSurveyScore = recentSurveys.length > 0 
 ? recentSurveys.reduce((sum, s) => sum + (s.score || 0), 0) / recentSurveys.length / 100
 : 0.5;
 
 const activeGoals = data.goals.filter(g => g.status ==="Başladı" || g.status ==="Devam").length;
 const engagementScore = Math.min(1, (avgSurveyScore + Math.min(1, activeGoals / 3)) / 2);

 const keyFactors = {
 academic: Math.max(0, (academicTrend + 1) / 2), // -1/1 aralığından 0/1 aralığına
 attendance: attendanceRate,
 study: studyConsistency,
 engagement: engagementScore,
 };

 // Risk seviyesi belirleme
 let riskLevel:"Düşük" |"Orta" |"Yüksek" |"Kritik";
 if (riskScore < 0.3) riskLevel ="Düşük";
 else if (riskScore < 0.5) riskLevel ="Orta";
 else if (riskScore < 0.7) riskLevel ="Yüksek";
 else riskLevel ="Kritik";

 // Öneriler oluştur
 const recommendations: string[] = [];
 
 if (keyFactors.academic < 0.6) {
 recommendations.push("Akademik destek programına dahil et");
 recommendations.push("Bireysel ders takviyesi planla");
 }
 
 if (keyFactors.attendance < 0.8) {
 recommendations.push("Devamsızlık sebeplerini araştır");
 recommendations.push("Veli ile görüşme ayarla");
 }
 
 if (keyFactors.study < 0.5) {
 recommendations.push("Çalışma teknikleri eğitimi ver");
 recommendations.push("Zaman yönetimi danışmanlığı sağla");
 }
 
 if (keyFactors.engagement < 0.6) {
 recommendations.push("Motivasyon artırıcı etkinlikler planla");
 recommendations.push("Kişisel hedefler belirleme konusunda destek ver");
 }

 // Müdahale önceliği
 const interventionPriority = Math.round((1 - successProbability) * 10);

 // Tahmini sonuç
 let predictedOutcome: string;
 if (successProbability >= 0.8) predictedOutcome ="Yüksek başarı bekleniyor";
 else if (successProbability >= 0.6) predictedOutcome ="Orta düzey başarı bekleniyor";
 else if (successProbability >= 0.4) predictedOutcome ="Risk altında - müdahale gerekli";
 else predictedOutcome ="Yüksek risk - acil müdahale gerekli";

 return {
 studentId,
 studentName: `${student.name} ${student.surname}`,
 currentGrade: student.class ||"Belirtilmemiş",
 successProbability,
 riskLevel,
 keyFactors,
 recommendations,
 interventionPriority,
 predictedOutcome,
 };
}

async function generateClassPredictions(): Promise<ClassPrediction[]> {
 const students = loadStudents();
 const classGroups = new Map<string, string[]>();

 // Öğrencileri sınıfa göre grupla
 students.forEach(student => {
 const className = student.class ||"Belirtilmemiş";
 if (!classGroups.has(className)) {
 classGroups.set(className, []);
 }
 classGroups.get(className)!.push(student.id);
 });

 const classPredictions: ClassPrediction[] = [];

 for (const [className, studentIds] of classGroups.entries()) {
 const predictions = await Promise.all(studentIds.map(id => optimizedPredictStudentSuccess(id)));
 
 const highSuccessProbability = predictions.filter(p => p >= 0.8).length;
 const mediumSuccessProbability = predictions.filter(p => p >= 0.5 && p < 0.8).length;
 const lowSuccessProbability = predictions.filter(p => p < 0.5).length;
 
 const averageSuccessRate = predictions.reduce((sum, p) => sum + p, 0) / predictions.length;
 const riskStudentsCount = predictions.filter(p => p < 0.4).length;

 // Sınıf düzeyinde öneriler
 const interventionRecommendations: string[] = [];
 
 if (lowSuccessProbability / studentIds.length > 0.3) {
 interventionRecommendations.push("Sınıf düzeyinde akademik destek programı");
 }
 
 if (riskStudentsCount > 3) {
 interventionRecommendations.push("Çoklu öğrenci risk değerlendirmesi");
 }
 
 if (averageSuccessRate < 0.6) {
 interventionRecommendations.push("Sınıf öğretmeni ile acil görüşme");
 interventionRecommendations.push("Ders programı gözden geçirme");
 }

 classPredictions.push({
 class: className,
 totalStudents: studentIds.length,
 highSuccessProbability,
 mediumSuccessProbability,
 lowSuccessProbability,
 averageSuccessRate,
 riskStudentsCount,
 interventionRecommendations,
 });
 }

 return classPredictions.sort((a, b) => a.class.localeCompare(b.class));
}

// =================== BİLEŞENLER ===================

export function StudentPredictionCard({ studentId }: { studentId: string }) {
 const [prediction, setPrediction] = useState<PredictionResult | null>(null);

 useEffect(() => {
 async function loadPrediction() {
 try {
 const data = await calculateDetailedPrediction(studentId);
 setPrediction(data);
 } catch (error) {
 setPrediction(null);
 }
 }
 loadPrediction();
 }, [studentId]);

 if (!prediction) {
 return (
 <Card>
 <CardContent className="p-6 text-center text-muted-foreground">
 Öğrenci verisi bulunamadı
 </CardContent>
 </Card>
 );
 }

 const successPercentage = Math.round(prediction.successProbability * 100);

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Brain className="h-5 w-5" />
 {prediction.studentName}
 </div>
 <Badge 
 className={cn(RISK_BADGE_COLORS[prediction.riskLevel])}
 >
 {prediction.riskLevel} Risk
 </Badge>
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 {/* Başarı Tahmini */}
 <div className="text-center">
 <div className="text-3xl font-bold text-primary mb-1">
 %{successPercentage}
 </div>
 <div className="text-sm text-muted-foreground">
 {prediction.predictedOutcome}
 </div>
 <Progress value={successPercentage} className="mt-2" />
 </div>

 {/* Anahtar Faktörler */}
 <div className="space-y-2">
 <h4 className="font-medium text-sm">Performans Faktörleri</h4>
 
 <div className="grid grid-cols-2 gap-2 text-sm">
 <div className="flex items-center justify-between">
 <span className="flex items-center gap-1">
 <BookOpen className="h-3 w-3" />
 Akademik
 </span>
 <span className="font-medium">
 %{Math.round(prediction.keyFactors.academic * 100)}
 </span>
 </div>
 
 <div className="flex items-center justify-between">
 <span className="flex items-center gap-1">
 <Calendar className="h-3 w-3" />
 Devam
 </span>
 <span className="font-medium">
 %{Math.round(prediction.keyFactors.attendance * 100)}
 </span>
 </div>
 
 <div className="flex items-center justify-between">
 <span className="flex items-center gap-1">
 <Clock className="h-3 w-3" />
 Çalışma
 </span>
 <span className="font-medium">
 %{Math.round(prediction.keyFactors.study * 100)}
 </span>
 </div>
 
 <div className="flex items-center justify-between">
 <span className="flex items-center gap-1">
 <Target className="h-3 w-3" />
 Katılım
 </span>
 <span className="font-medium">
 %{Math.round(prediction.keyFactors.engagement * 100)}
 </span>
 </div>
 </div>
 </div>

 {/* Öneriler */}
 {prediction.recommendations.length > 0 && (
 <div>
 <h4 className="font-medium text-sm mb-2">Öneriler</h4>
 <ul className="text-xs text-muted-foreground space-y-1">
 {prediction.recommendations.slice(0, 3).map((rec, index) => (
 <li key={index} className="flex items-start">
 <span className="mr-1">•</span>
 {rec}
 </li>
 ))}
 </ul>
 </div>
 )}

 {/* Müdahale Önceliği */}
 <div className="flex items-center justify-between text-sm">
 <span>Müdahale Önceliği:</span>
 <Badge variant={prediction.interventionPriority > 7 ?"destructive" : 
 prediction.interventionPriority > 4 ?"default" :"secondary"}>
 {prediction.interventionPriority}/10
 </Badge>
 </div>
 </CardContent>
 </Card>
 );
}

export function ClassPredictionOverview() {
 const [selectedClass, setSelectedClass] = useState<string>("all");
 const [classPredictions, setClassPredictions] = useState<ClassPrediction[]>([]);

 useEffect(() => {
 async function loadPredictions() {
 const data = await generateClassPredictions();
 setClassPredictions(data);
 }
 loadPredictions();
 }, []);
 
 const filteredData = selectedClass ==="all" 
 ? classPredictions 
 : classPredictions.filter(c => c.className === selectedClass);

 const totalStats = useMemo(() => {
 const totals = classPredictions.reduce((acc, cls) => ({
 students: acc.students + cls.totalStudents,
 high: acc.high + cls.highSuccessProbability,
 medium: acc.medium + cls.mediumSuccessProbability,
 low: acc.low + cls.lowSuccessProbability,
 risk: acc.risk + cls.riskStudentsCount,
 }), { students: 0, high: 0, medium: 0, low: 0, risk: 0 });

 return {
 ...totals,
 averageSuccess: classPredictions.length > 0 
 ? classPredictions.reduce((sum, c) => sum + c.averageSuccessRate, 0) / classPredictions.length
 : 0,
 };
 }, [classPredictions]);

 return (
 <div className="space-y-6">
 {/* Özet İstatistikler */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{totalStats.students}</div>
 </CardContent>
 </Card>
 
 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Yüksek Başarı</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold text-green-600">{totalStats.high}</div>
 <div className="text-xs text-muted-foreground">
 %{totalStats.students > 0 ? Math.round((totalStats.high / totalStats.students) * 100) : 0}
 </div>
 </CardContent>
 </Card>
 
 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Risk Altında</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold text-red-600">{totalStats.risk}</div>
 <div className="text-xs text-muted-foreground">
 %{totalStats.students > 0 ? Math.round((totalStats.risk / totalStats.students) * 100) : 0}
 </div>
 </CardContent>
 </Card>
 
 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Ortalama Başarı</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">
 %{Math.round(totalStats.averageSuccess * 100)}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Sınıf Filtresi */}
 <div className="flex items-center gap-4">
 <span className="text-sm font-medium">Sınıf:</span>
 <Select value={selectedClass} onValueChange={setSelectedClass}>
 <SelectTrigger className="w-48">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tüm Sınıflar</SelectItem>
 {classPredictions.map(cls => (
 <SelectItem key={cls.class} value={cls.class}>
 {cls.class}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 {/* Sınıf Detayları */}
 <div className="grid gap-4">
 {filteredData.map(cls => (
 <Card key={cls.class}>
 <CardHeader>
 <CardTitle className="flex items-center justify-between">
 <span className="flex items-center gap-2">
 <Users className="h-5 w-5" />
 {cls.class}
 </span>
 <Badge variant="outline">
 {cls.totalStudents} öğrenci
 </Badge>
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {/* Başarı Dağılımı */}
 <div>
 <h4 className="font-medium text-sm mb-2">Başarı Dağılımı</h4>
 <div className="space-y-2">
 <div className="flex items-center justify-between text-sm">
 <span className="text-green-600">Yüksek (%80+)</span>
 <span className="font-medium">{cls.highSuccessProbability}</span>
 </div>
 <div className="flex items-center justify-between text-sm">
 <span className="text-blue-600">Orta (%50-80)</span>
 <span className="font-medium">{cls.mediumSuccessProbability}</span>
 </div>
 <div className="flex items-center justify-between text-sm">
 <span className="text-red-600">Düşük (%50-)</span>
 <span className="font-medium">{cls.lowSuccessProbability}</span>
 </div>
 </div>
 </div>

 {/* Genel Durum */}
 <div>
 <h4 className="font-medium text-sm mb-2">Genel Durum</h4>
 <div className="space-y-2">
 <div className="text-center">
 <div className="text-lg font-bold">
 %{Math.round(cls.averageSuccessRate * 100)}
 </div>
 <div className="text-xs text-muted-foreground">
 Ortalama Başarı
 </div>
 </div>
 {cls.riskStudentsCount > 0 && (
 <div className="text-center">
 <div className="text-lg font-bold text-red-600">
 {cls.riskStudentsCount}
 </div>
 <div className="text-xs text-muted-foreground">
 Risk Altında
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Öneriler */}
 <div>
 <h4 className="font-medium text-sm mb-2">Öneriler</h4>
 {cls.interventionRecommendations.length > 0 ? (
 <ul className="text-xs text-muted-foreground space-y-1">
 {cls.interventionRecommendations.map((rec, index) => (
 <li key={index} className="flex items-start">
 <span className="mr-1">•</span>
 {rec}
 </li>
 ))}
 </ul>
 ) : (
 <div className="text-xs text-muted-foreground">
 Özel müdahale gerekmiyor
 </div>
 )}
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 );
}

const PredictiveAnalysis = React.memo(function PredictiveAnalysis() {
 const [selectedStudent, setSelectedStudent] = useState<string>("");
 const [warnings, setWarnings] = useState<any[]>([]);
 const [successProbability, setSuccessProbability] = useState<number>(0);
 const students = loadStudents();

 useEffect(() => {
 async function loadWarnings() {
 const data = await optimizedGenerateEarlyWarnings();
 setWarnings(data);
 }
 loadWarnings();
 }, []);

 useEffect(() => {
 async function loadSuccessProbability() {
 if (selectedStudent) {
 const prob = await optimizedPredictStudentSuccess(selectedStudent);
 setSuccessProbability(prob);
 }
 }
 loadSuccessProbability();
 }, [selectedStudent]);

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold">Prediktif Analiz</h2>
 <p className="text-muted-foreground">
 Öğrenci başarı tahminleri ve risk analizi
 </p>
 </div>
 <Button variant="outline">
 <Download className="h-4 w-4" />
 Rapor İndir
 </Button>
 </div>

 <Tabs defaultValue="overview" className="space-y-4">
 <TabsList>
 <TabsTrigger value="overview" variant="nested">Genel Bakış</TabsTrigger>
 <TabsTrigger value="student" variant="nested">Bireysel Analiz</TabsTrigger>
 <TabsTrigger value="warnings" variant="nested">Erken Uyarılar</TabsTrigger>
 </TabsList>

 <TabsContent value="overview" className="space-y-4">
 <ClassPredictionOverview />
 </TabsContent>

 <TabsContent value="student" className="space-y-4">
 <div className="flex items-center gap-4">
 <span className="text-sm font-medium">Öğrenci Seç:</span>
 <Select value={selectedStudent} onValueChange={setSelectedStudent}>
 <SelectTrigger className="w-64">
 <SelectValue placeholder="Öğrenci seçin..." />
 </SelectTrigger>
 <SelectContent>
 {students.map(student => (
 <SelectItem key={student.id} value={student.id}>
 {student.name} {student.surname} ({student.class})
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 {selectedStudent && (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <StudentPredictionCard studentId={selectedStudent} />
 <SuccessPredictionGauge 
 value={successProbability}
 studentName={
 (students.find(s => s.id === selectedStudent)?.name ||"") +"" +
 (students.find(s => s.id === selectedStudent)?.surname ||"")
 }
 details={{
 factors: ["Akademik Performans","Devam Durumu","Çalışma Tutarlılığı"],
 recommendations: ["Bireysel takip","Ek destek","Motivasyon artırma"]
 }}
 />
 </div>
 )}
 </TabsContent>

 <TabsContent value="warnings" className="space-y-4">
 <EarlyWarningIndicator warnings={warnings} maxDisplay={10} />
 </TabsContent>
 </Tabs>
 </div>
 );
});

export default PredictiveAnalysis;