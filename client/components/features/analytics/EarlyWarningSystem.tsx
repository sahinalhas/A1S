import React, { useMemo, useState, useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { 
 Select, 
 SelectContent, 
 SelectItem, 
 SelectTrigger, 
 SelectValue 
} from "@/components/atoms/Select";
import {
 EarlyWarningIndicator,
 SuccessMetricCard,
 RiskDistributionChart,
} from "../charts/AnalyticsCharts";
import {
 calculateAttendanceRate,
 calculateAcademicTrend,
 calculateStudyConsistency,
 getStudentPerformanceData,
 type EarlyWarning,
} from "@/lib/analytics";
import {
 optimizedGenerateEarlyWarnings,
 optimizedCalculateRiskScore,
} from "@/lib/analytics-cache";
import { loadStudents } from "@/lib/storage";
import { 
 checkAndCreateAutomaticInterventions, 
 type AutoInterventionResult 
} from "@/lib/automatic-interventions";
import { toast } from "sonner";
import { 
 AlertTriangle, 
 Bell,
 Users,
 TrendingDown,
 Activity,
 CheckCircle,
 XCircle,
 Filter,
 Download,
 Mail,
 Phone,
 Calendar,
 Zap,
 Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RISK_BADGE_COLORS, STATUS_SURFACE_COLORS } from "@/lib/config/theme.config";

interface RiskProfile {
 studentId: string;
 studentName: string;
 class: string;
 riskScore: number;
 riskLevel:"Düşük" |"Orta" |"Yüksek" |"Kritik";
 riskFactors: {
 attendance: { score: number; risk: boolean };
 academic: { score: number; risk: boolean };
 study: { score: number; risk: boolean };
 behavioral: { score: number; risk: boolean };
 };
 actionPlan: string[];
 lastUpdated: string;
}

interface InterventionPlan {
 studentId: string;
 warningType: string;
 severity: string;
 interventions: {
 immediate: string[];
 shortTerm: string[];
 longTerm: string[];
 };
 estimatedTimeframe: string;
 involvedParties: string[];
 monitoringFrequency:"günlük" |"haftalık" |"aylık";
}

async function generateRiskProfiles(): Promise<RiskProfile[]> {
 const students = loadStudents();
 
 const profiles: RiskProfile[] = [];
 const BATCH_SIZE = 15;
 
 for (let i = 0; i < students.length; i += BATCH_SIZE) {
 const batch = students.slice(i, i + BATCH_SIZE);
 
 const batchProfiles = await Promise.all(batch.map(async (student) => {
 try {
 const data = await getStudentPerformanceData(student.id);
 const riskScore = await optimizedCalculateRiskScore(student.id);
 
 const attendanceRate = calculateAttendanceRate(data.attendance);
 const academicTrend = calculateAcademicTrend(data.academics);
 const studyConsistency = calculateStudyConsistency(data.studySessions);
 
 const recentSurveys = data.surveys.slice(-3);
 const avgSurveyScore = recentSurveys.length > 0 
 ? recentSurveys.reduce((sum, s) => sum + (s.score || 0), 0) / recentSurveys.length
 : 50;
 const behavioralScore = avgSurveyScore / 100;

 const riskFactors = {
 attendance: { 
 score: attendanceRate, 
 risk: attendanceRate < 0.8 
 },
 academic: { 
 score: Math.max(0, (academicTrend + 1) / 2), 
 risk: academicTrend < -0.3 
 },
 study: { 
 score: studyConsistency, 
 risk: studyConsistency < 0.5 
 },
 behavioral: { 
 score: behavioralScore, 
 risk: behavioralScore < 0.6 
 },
 };

 let riskLevel: RiskProfile["riskLevel"];
 if (riskScore < 0.3) riskLevel ="Düşük";
 else if (riskScore < 0.5) riskLevel ="Orta";
 else if (riskScore < 0.7) riskLevel ="Yüksek";
 else riskLevel ="Kritik";

 const actionPlan: string[] = [];
 if (riskFactors.attendance.risk) {
 actionPlan.push("Devamsızlık izleme ve veli görüşmesi");
 }
 if (riskFactors.academic.risk) {
 actionPlan.push("Akademik destek ve bireysel takip");
 }
 if (riskFactors.study.risk) {
 actionPlan.push("Çalışma tekniklerinde rehberlik");
 }
 if (riskFactors.behavioral.risk) {
 actionPlan.push("Psikolojik destek ve motivasyon");
 }

 return {
 studentId: student.id,
 studentName: `${student.name} ${student.surname}`,
 class: student.class ||"Belirtilmemiş",
 riskScore,
 riskLevel,
 riskFactors,
 actionPlan,
 lastUpdated: new Date().toISOString(),
 };
 } catch (error) {
 console.error(`Error processing student ${student.id}:`, error);
 return null;
 }
 }));
 
 profiles.push(...batchProfiles.filter((p): p is RiskProfile => p !== null));
 }
 
 return profiles.sort((a, b) => b.riskScore - a.riskScore);
}

function generateInterventionPlan(warning: EarlyWarning): InterventionPlan {
 const baseInterventions = {
 attendance: {
 immediate: ["Veli ile acil iletişim","Devamsızlık sebeplerini araştır"],
 shortTerm: ["Günlük devam takibi","Okula uyum programı"],
 longTerm: ["Aile danışmanlığı","Sosyal hizmetler koordinasyonu"]
 },
 academic: {
 immediate: ["Ders içi bireysel destek","Eksik konuları tespit et"],
 shortTerm: ["Haftalık ek ders programı","Akran mentörlüğü"],
 longTerm: ["Öğrenme güçlüğü değerlendirmesi","Bireysel eğitim planı"]
 },
 behavioral: {
 immediate: ["Bireysel görüşme planla","Sınıf içi gözlem"],
 shortTerm: ["Davranış değişiklik programı","Grup terapisi"],
 longTerm: ["Uzman psikolog desteği","Aile terapisi"]
 },
 wellbeing: {
 immediate: ["Acil durum değerlendirmesi","Güvenlik planı"],
 shortTerm: ["Düzenli psikolojik destek","Kriz müdahale planı"],
 longTerm: ["Kapsamlı tedavi programı","Sosyal destek ağı kurma"]
 }
 };

 const interventions = baseInterventions[warning.warningType as keyof typeof baseInterventions] || 
 baseInterventions.behavioral;

 return {
 studentId: warning.studentId,
 warningType: warning.warningType,
 severity: warning.severity,
 interventions,
 estimatedTimeframe: warning.severity ==="kritik" ?"1-2 hafta" : 
 warning.severity ==="yüksek" ?"2-4 hafta" :"1-2 ay",
 involvedParties: [
"Rehber Öğretmen",
"Sınıf Öğretmeni", 
"Veli",
 ...(warning.severity ==="kritik" ? ["Okul Yönetimi","Uzman Destek"] : [])
 ],
 monitoringFrequency: warning.severity ==="kritik" ?"günlük" : 
 warning.severity ==="yüksek" ?"haftalık" :"aylık"
 };
}

export function RiskProfilesTable({ profiles }: { profiles: RiskProfile[] }) {
 const [filterRisk, setFilterRisk] = useState<string>("all");
 const [filterClass, setFilterClass] = useState<string>("all");
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 20; // Sayfa başına 20 öğrenci
 const parentRef = useRef<HTMLDivElement>(null);

 const filteredProfiles = profiles.filter(profile => {
 if (filterRisk !=="all" && profile.riskLevel !== filterRisk) return false;
 if (filterClass !=="all" && profile.class !== filterClass) return false;
 return true;
 });

 const classes = Array.from(new Set(profiles.map(p => p.class)));
 
 // Sayfalama
 const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
 const paginatedProfiles = filteredProfiles.slice(
 (currentPage - 1) * itemsPerPage,
 currentPage * itemsPerPage
 );

 // Filtre değiştiğinde sayfayı sıfırla
 useEffect(() => {
 setCurrentPage(1);
 }, [filterRisk, filterClass]);

 const virtualizer = useVirtualizer({
 count: paginatedProfiles.length,
 getScrollElement: () => parentRef.current,
 estimateSize: () => 200,
 overscan: 5,
 });

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Users className="h-5 w-5" />
 Risk Profilleri ({filteredProfiles.length})
 </CardTitle>
 <div className="flex gap-4">
 <Select value={filterRisk} onValueChange={setFilterRisk}>
 <SelectTrigger className="w-48">
 <SelectValue placeholder="Risk seviyesi..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tüm Risk Seviyeleri</SelectItem>
 <SelectItem value="Kritik">Kritik</SelectItem>
 <SelectItem value="Yüksek">Yüksek</SelectItem>
 <SelectItem value="Orta">Orta</SelectItem>
 <SelectItem value="Düşük">Düşük</SelectItem>
 </SelectContent>
 </Select>
 
 <Select value={filterClass} onValueChange={setFilterClass}>
 <SelectTrigger className="w-48">
 <SelectValue placeholder="Sınıf seçin..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tüm Sınıflar</SelectItem>
 {classes.map(cls => (
 <SelectItem key={cls} value={cls}>
 {cls}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </CardHeader>
 <CardContent>
 {filteredProfiles.length === 0 ? (
 <div className="text-center py-12 text-muted-foreground">
 <p>Filtrelere uygun risk profili bulunamadı.</p>
 </div>
 ) : (
 <div ref={parentRef} className="h-[600px] overflow-auto">
 <div
 style={{
 height: `${virtualizer.getTotalSize()}px`,
 width: '100%',
 position: 'relative',
 }}
 >
 {virtualizer.getVirtualItems().map((virtualRow) => {
 const profile = paginatedProfiles[virtualRow.index];
 return (
 <div
 key={virtualRow.index}
 style={{
 position: 'absolute',
 top: 0,
 left: 0,
 width: '100%',
 height: `${virtualRow.size}px`,
 transform: `translateY(${virtualRow.start}px)`,
 }}
 className="px-2"
 >
 <div className="border rounded-lg p-4 bg-card mb-4">
 <div className="flex items-center justify-between mb-3">
 <div>
 <h3 className="font-medium">{profile.studentName}</h3>
 <p className="text-sm text-muted-foreground">{profile.class}</p>
 </div>
 <div className="flex items-center gap-2">
 <Badge className={cn(RISK_BADGE_COLORS[profile.riskLevel])}>
 {profile.riskLevel}
 </Badge>
 <span className="text-sm font-medium">
 %{Math.round(profile.riskScore * 100)}
 </span>
 </div>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
 <div className="text-center">
 <div className={cn(
"text-sm font-medium",
 profile.riskFactors.attendance.risk ?"text-red-600" :"text-green-600"
 )}>
 {profile.riskFactors.attendance.risk ? (
 <XCircle className="h-4 w-4 mx-auto mb-1" />
 ) : (
 <CheckCircle className="h-4 w-4 mx-auto mb-1" />
 )}
 Devam
 </div>
 <div className="text-xs text-muted-foreground">
 %{Math.round(profile.riskFactors.attendance.score * 100)}
 </div>
 </div>

 <div className="text-center">
 <div className={cn(
"text-sm font-medium",
 profile.riskFactors.academic.risk ?"text-red-600" :"text-green-600"
 )}>
 {profile.riskFactors.academic.risk ? (
 <XCircle className="h-4 w-4 mx-auto mb-1" />
 ) : (
 <CheckCircle className="h-4 w-4 mx-auto mb-1" />
 )}
 Akademik
 </div>
 <div className="text-xs text-muted-foreground">
 %{Math.round(profile.riskFactors.academic.score * 100)}
 </div>
 </div>

 <div className="text-center">
 <div className={cn(
"text-sm font-medium",
 profile.riskFactors.study.risk ?"text-red-600" :"text-green-600"
 )}>
 {profile.riskFactors.study.risk ? (
 <XCircle className="h-4 w-4 mx-auto mb-1" />
 ) : (
 <CheckCircle className="h-4 w-4 mx-auto mb-1" />
 )}
 Çalışma
 </div>
 <div className="text-xs text-muted-foreground">
 %{Math.round(profile.riskFactors.study.score * 100)}
 </div>
 </div>

 <div className="text-center">
 <div className={cn(
"text-sm font-medium",
 profile.riskFactors.behavioral.risk ?"text-red-600" :"text-green-600"
 )}>
 {profile.riskFactors.behavioral.risk ? (
 <XCircle className="h-4 w-4 mx-auto mb-1" />
 ) : (
 <CheckCircle className="h-4 w-4 mx-auto mb-1" />
 )}
 Davranış
 </div>
 <div className="text-xs text-muted-foreground">
 %{Math.round(profile.riskFactors.behavioral.score * 100)}
 </div>
 </div>
 </div>

 {profile.actionPlan.length > 0 && (
 <div className="pt-3 border-t">
 <h4 className="text-sm font-medium mb-2">Önerilen Eylemler:</h4>
 <ul className="text-sm space-y-1">
 {profile.actionPlan.map((action, idx) => (
 <li key={idx} className="flex items-start">
 <span className="mr-2 text-primary">•</span>
 {action}
 </li>
 ))}
 </ul>
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}
 
 {/* Sayfalama Kontrolleri */}
 {totalPages > 1 && (
 <div className="flex items-center justify-between border-t pt-4 mt-4">
 <div className="text-sm text-muted-foreground">
 Toplam {filteredProfiles.length} öğrenci - Sayfa {currentPage} / {totalPages}
 </div>
 <div className="flex gap-2">
 <Button
 variant="outline"
 size="sm"
 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
 disabled={currentPage === 1}
 >
 Önceki
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
 disabled={currentPage === totalPages}
 >
 Sonraki
 </Button>
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 );
}

export function InterventionPlanCard({ warning }: { warning: EarlyWarning }) {
 const plan = generateInterventionPlan(warning);

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-lg">
 <Activity className="h-5 w-5" />
 Müdahale Planı: {warning.studentName}
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <Alert>
 <AlertTriangle className="h-4 w-4" />
 <AlertDescription>
 <strong>{warning.warningType}</strong> kategorisinde <strong>{warning.severity}</strong> seviye uyarı
 </AlertDescription>
 </Alert>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <h4 className="font-medium text-sm mb-2">Acil Müdahaleler</h4>
 <ul className="text-sm space-y-1">
 {plan.interventions.immediate.map((action, index) => (
 <li key={index} className="flex items-start">
 <span className="mr-1 text-red-600">●</span>
 {action}
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="font-medium text-sm mb-2">Kısa Vadeli</h4>
 <ul className="text-sm space-y-1">
 {plan.interventions.shortTerm.map((action, index) => (
 <li key={index} className="flex items-start">
 <span className="mr-1 text-yellow-600">●</span>
 {action}
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="font-medium text-sm mb-2">Uzun Vadeli</h4>
 <ul className="text-sm space-y-1">
 {plan.interventions.longTerm.map((action, index) => (
 <li key={index} className="flex items-start">
 <span className="mr-1 text-green-600">●</span>
 {action}
 </li>
 ))}
 </ul>
 </div>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
 <div>
 <h4 className="font-medium text-sm">Tahmini Süre</h4>
 <p className="text-sm text-muted-foreground">{plan.estimatedTimeframe}</p>
 </div>

 <div>
 <h4 className="font-medium text-sm">İzleme Sıklığı</h4>
 <p className="text-sm text-muted-foreground">{plan.monitoringFrequency}</p>
 </div>

 <div>
 <h4 className="font-medium text-sm">Katılımcılar</h4>
 <div className="flex flex-wrap gap-1">
 {plan.involvedParties.map((party, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {party}
 </Badge>
 ))}
 </div>
 </div>
 </div>

 <div className="flex gap-2 pt-4">
 <Button size="sm">
 <Mail className="h-3 w-3" />
 Veli Bilgilendir
 </Button>
 <Button size="sm" variant="outline">
 <Phone className="h-3 w-3" />
 Uzman Ara
 </Button>
 <Button size="sm" variant="outline">
 <Calendar className="h-3 w-3" />
 Takip Randevusu
 </Button>
 </div>
 </CardContent>
 </Card>
 );
}

const EarlyWarningSystem = React.memo(function EarlyWarningSystem() {
 const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
 const [selectedType, setSelectedType] = useState<string>("all");
 const [warnings, setWarnings] = useState<EarlyWarning[]>([]);
 const [riskProfiles, setRiskProfiles] = useState<RiskProfile[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [autoInterventionResults, setAutoInterventionResults] = useState<AutoInterventionResult[]>([]);
 const [isCreatingInterventions, setIsCreatingInterventions] = useState(false);

 useEffect(() => {
 async function loadData() {
 setIsLoading(true);
 try {
 const warningsData = await optimizedGenerateEarlyWarnings();
 setWarnings(warningsData);
 
 const profilesData = await generateRiskProfiles();
 setRiskProfiles(profilesData);
 } catch (error) {
 console.error('Error loading early warning data:', error);
 } finally {
 setIsLoading(false);
 }
 }
 loadData();
 }, []);

 const filteredWarnings = warnings.filter(warning => {
 if (selectedSeverity !=="all" && warning.severity !== selectedSeverity) return false;
 if (selectedType !=="all" && warning.warningType !== selectedType) return false;
 return true;
 });

 const stats = useMemo(() => {
 const total = warnings.length;
 const critical = warnings.filter(w => w.severity ==="kritik").length;
 const high = warnings.filter(w => w.severity ==="yüksek").length;
 const highRisk = riskProfiles.filter(p => p.riskLevel ==="Yüksek" || p.riskLevel ==="Kritik").length;

 return { total, critical, high, highRisk };
 }, [warnings, riskProfiles]);

 const riskDistribution = useMemo(() => {
 const counts = {
"Düşük": 0,
"Orta": 0,
"Yüksek": 0,
"Kritik": 0,
 };

 riskProfiles.forEach(profile => {
 counts[profile.riskLevel] = (counts[profile.riskLevel] || 0) + 1;
 });
 
 return [
 { name:"Düşük", value: counts["Düşük"] },
 { name:"Orta", value: counts["Orta"] },
 { name:"Yüksek", value: counts["Yüksek"] },
 { name:"Kritik", value: counts["Kritik"] },
 ];
 }, [riskProfiles]);

 const handleAutoIntervention = async () => {
 setIsCreatingInterventions(true);
 try {
 const results = await checkAndCreateAutomaticInterventions();
 setAutoInterventionResults(results);
 
 const created = results.filter(r => r.interventionCreated);
 if (created.length > 0) {
 toast.success(`${created.length} öğrenci için otomatik müdahale planı oluşturuldu`, {
 description: created.map(r => r.studentName).join(",")
 });
 } else {
 toast.info("Yeni otomatik müdahale planı oluşturulmadı", {
 description:"Tüm riskli öğrenciler için mevcut müdahale planları aktif"
 });
 }
 } catch (error) {
 console.error('Automatic intervention failed:', error);
 toast.error("Otomatik müdahale oluşturulurken hata oluştu");
 } finally {
 setIsCreatingInterventions(false);
 }
 };

 if (isLoading) {
 return (
 <div className="flex items-center justify-center min-h-[400px]">
 <div className="text-center space-y-2">
 <Loader2 className="h-8 w-8 mx-auto text-primary" />
 <p className="text-muted-foreground">Erken uyarı sistemi yükleniyor...</p>
 <p className="text-xs text-muted-foreground">Risk profilleri hesaplanıyor...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold">Erken Uyarı Sistemi</h2>
 <p className="text-muted-foreground">
 Risk faktörlerinde otomatik uyarı ve müdahale planlaması
 </p>
 </div>
 <div className="flex gap-2">
 <Button 
 variant="default" 

 onClick={handleAutoIntervention}
 disabled={isCreatingInterventions}
 >
 {isCreatingInterventions ? (
 <Loader2 className="h-4 w-4" />
 ) : (
 <Zap className="h-4 w-4" />
 )}
 Otomatik Müdahale Oluştur
 </Button>
 <Button variant="outline">
 <Filter className="h-4 w-4" />
 Filtrele
 </Button>
 <Button variant="outline">
 <Download className="h-4 w-4" />
 Rapor İndir
 </Button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <SuccessMetricCard
 title="Toplam Uyarı"
 value={stats.total}
 icon={Bell}
 description="Aktif uyarı sayısı"
 trend={stats.total > 0 ?"down" :"up"}
 />
 <SuccessMetricCard
 title="Kritik Uyarılar"
 value={stats.critical}
 icon={AlertTriangle}
 description="Acil müdahale gerekli"
 trend="down"
 />
 <SuccessMetricCard
 title="Yüksek Risk"
 value={stats.high}
 icon={TrendingDown}
 description="Yakın takip gerekli"
 trend="down"
 />
 <SuccessMetricCard
 title="Risk Altında"
 value={stats.highRisk}
 icon={Users}
 description="Yüksek/kritik risk öğrenci"
 trend="down"
 />
 </div>

 <Tabs defaultValue="overview" className="space-y-4">
 <TabsList>
 <TabsTrigger value="overview" variant="nested">Genel Bakış</TabsTrigger>
 <TabsTrigger value="warnings" variant="nested">Uyarılar ({warnings.length})</TabsTrigger>
 <TabsTrigger value="profiles" variant="nested">Risk Profilleri ({riskProfiles.length})</TabsTrigger>
 </TabsList>

 <TabsContent value="overview" className="space-y-4">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <RiskDistributionChart data={riskDistribution} />
 </div>
 </TabsContent>

 <TabsContent value="warnings" className="space-y-4">
 <div className="flex gap-4 mb-4">
 <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
 <SelectTrigger className="w-48">
 <SelectValue placeholder="Önem derecesi..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tüm Seviyeler</SelectItem>
 <SelectItem value="kritik">Kritik</SelectItem>
 <SelectItem value="yüksek">Yüksek</SelectItem>
 <SelectItem value="orta">Orta</SelectItem>
 <SelectItem value="düşük">Düşük</SelectItem>
 </SelectContent>
 </Select>
 
 <Select value={selectedType} onValueChange={setSelectedType}>
 <SelectTrigger className="w-48">
 <SelectValue placeholder="Uyarı tipi..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tüm Tipler</SelectItem>
 <SelectItem value="attendance">Devamsızlık</SelectItem>
 <SelectItem value="academic">Akademik</SelectItem>
 <SelectItem value="behavioral">Davranışsal</SelectItem>
 <SelectItem value="wellbeing">Refah</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <EarlyWarningIndicator warnings={filteredWarnings} maxDisplay={20} />
 </TabsContent>

 <TabsContent value="profiles" className="space-y-4">
 <RiskProfilesTable profiles={riskProfiles} />
 </TabsContent>
 </Tabs>
 </div>
 );
});

export default EarlyWarningSystem;
