import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import {
 ClassComparisonChart,
 RiskDistributionChart,
 PerformanceTrendChart,
 SuccessMetricCard,
} from "../charts/AnalyticsCharts";
import {
 calculateAttendanceRate,
 getStudentPerformanceData,
} from "@/lib/analytics";
import {
 optimizedGenerateClassComparisons,
 optimizedPredictStudentSuccess,
 optimizedCalculateRiskScore,
} from "@/lib/analytics-cache";
import { loadStudents } from "@/lib/storage";
import { 
 BarChart3, 
 Users, 
 TrendingUp,
 Award,
 AlertTriangle,
 Filter,
 Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_BAR_COLORS } from "@/lib/config/theme.config";

// =================== TYP TANIMLARI ===================

interface DemographicComparison {
 category: string;
 groups: {
 name: string;
 studentCount: number;
 averageSuccess: number;
 averageGPA: number;
 attendanceRate: number;
 riskDistribution: { düşük: number; orta: number; yüksek: number };
 }[];
}

interface PerformanceMetrics {
 metric: string;
 values: { name: string; value: number; trend?:"up" |"down" |"stable" }[];
}

interface BenchmarkData {
 category: string;
 current: number;
 target: number;
 benchmark: number; // Okul ortalaması
 national?: number; // Ulusal ortalama (simüle)
}

// =================== VERİ İŞLEME FONKSİYONLARI ===================

async function generateDemographicComparisons(): Promise<DemographicComparison[]> {
 const students = loadStudents();
 const comparisons: DemographicComparison[] = [];

 // Cinsiyete göre karşılaştırma
 const genderGroups = new Map<string, typeof students>();
 students.forEach(student => {
 const gender = student.cinsiyet ==="K" ?"Kız" :"Erkek";
 if (!genderGroups.has(gender)) {
 genderGroups.set(gender, []);
 }
 genderGroups.get(gender)!.push(student);
 });

 const genderComparison: DemographicComparison = {
 category:"Cinsiyet",
 groups: [],
 };

 for (const [genderName, groupStudents] of genderGroups.entries()) {
 const studentIds = groupStudents.map(s => s.id);
 const successRates = await Promise.all(studentIds.map(id => optimizedPredictStudentSuccess(id)));
 const performanceData = await Promise.all(studentIds.map(id => getStudentPerformanceData(id)));
 const attendanceRates = performanceData.map(data => calculateAttendanceRate(data.attendance));
 
 // GPA hesaplama
 const gpaValues: number[] = [];
 performanceData.forEach(data => {
 const recentGPA = data.academics
 .filter(a => a.gpa !== undefined)
 .sort((a, b) => b.term.localeCompare(a.term))[0];
 if (recentGPA) gpaValues.push(recentGPA.gpa!);
 });

 // Risk dağılımı
 const riskCounts = { düşük: 0, orta: 0, yüksek: 0 };
 groupStudents.forEach(student => {
 const risk = student.risk ||"Düşük";
 riskCounts[risk.toLowerCase() as keyof typeof riskCounts]++;
 });

 genderComparison.groups.push({
 name: genderName,
 studentCount: groupStudents.length,
 averageSuccess: successRates.reduce((sum, rate) => sum + rate, 0) / successRates.length,
 averageGPA: gpaValues.length > 0 ? gpaValues.reduce((sum, gpa) => sum + gpa, 0) / gpaValues.length : 0,
 attendanceRate: attendanceRates.reduce((sum, rate) => sum + rate, 0) / attendanceRates.length,
 riskDistribution: riskCounts,
 });
 }

 comparisons.push(genderComparison);

 // Sınıfa göre karşılaştırma
 const classComparisons = await optimizedGenerateClassComparisons();
 const classComparison: DemographicComparison = {
 category:"Sınıf",
 groups: classComparisons.map(cls => ({
 name: cls.class,
 studentCount: cls.studentCount,
 averageSuccess: cls.averageGPA / 4.0,
 averageGPA: cls.averageGPA,
 attendanceRate: cls.attendanceRate,
 riskDistribution: cls.riskDistribution,
 })),
 };

 comparisons.push(classComparison);

 return comparisons;
}

async function generatePerformanceMetrics(): Promise<PerformanceMetrics[]> {
 const classComparisons = await optimizedGenerateClassComparisons();
 
 return [
 {
 metric:"Ortalama GPA",
 values: classComparisons.map(cls => ({
 name: cls.class,
 value: cls.averageGPA,
 trend: cls.averageGPA >= 3.0 ?"up" : cls.averageGPA >= 2.0 ?"stable" :"down"
 })),
 },
 {
 metric:"Devam Oranı",
 values: classComparisons.map(cls => ({
 name: cls.class,
 value: cls.attendanceRate * 100,
 trend: cls.attendanceRate >= 0.85 ?"up" : cls.attendanceRate >= 0.75 ?"stable" :"down"
 })),
 },
 {
 metric:"Risk Altında Öğrenci",
 values: classComparisons.map(cls => ({
 name: cls.class,
 value: cls.atRiskStudents.length,
 trend: cls.atRiskStudents.length <= 2 ?"up" : cls.atRiskStudents.length <= 5 ?"stable" :"down"
 })),
 },
 ];
}

async function generateBenchmarkData(): Promise<BenchmarkData[]> {
 const students = loadStudents();
 const totalStudents = students.length;

 // Genel başarı oranı
 const successRates = await Promise.all(students.map(s => optimizedPredictStudentSuccess(s.id)));
 const averageSuccess = successRates.reduce((sum, rate) => sum + rate, 0) / successRates.length;

 // Devam oranı
 const performanceData = await Promise.all(students.map(s => getStudentPerformanceData(s.id)));
 const attendanceRates = performanceData.map(data => calculateAttendanceRate(data.attendance));
 const averageAttendance = attendanceRates.reduce((sum, rate) => sum + rate, 0) / attendanceRates.length;

 // Risk dağılımı
 const riskScores = await Promise.all(students.map(s => optimizedCalculateRiskScore(s.id)));
 const highRiskCount = riskScores.filter(score => score > 0.6).length;
 const riskPercentage = (highRiskCount / totalStudents) * 100;

 return [
 {
 category:"Genel Başarı Oranı",
 current: averageSuccess * 100,
 target: 85,
 benchmark: 78,
 national: 75,
 },
 {
 category:"Devam Oranı",
 current: averageAttendance * 100,
 target: 95,
 benchmark: 87,
 national: 85,
 },
 {
 category:"Risk Altında Öğrenci",
 current: riskPercentage,
 target: 5,
 benchmark: 12,
 national: 15,
 },
 ];
}

// =================== BİLEŞENLER ===================

export function DemographicComparisonView({ comparison }: { comparison: DemographicComparison }) {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Users className="h-5 w-5" />
 {comparison.category} Karşılaştırması
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 {comparison.groups.map((group, index) => (
 <div key={index} className="border rounded-lg p-4">
 <div className="flex items-center justify-between mb-3">
 <h3 className="font-medium">{group.name}</h3>
 <Badge variant="outline">
 {group.studentCount} öğrenci
 </Badge>
 </div>
 
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
 <div className="text-center">
 <div className="text-lg font-bold text-blue-600">
 %{Math.round(group.averageSuccess * 100)}
 </div>
 <div className="text-muted-foreground">Başarı Oranı</div>
 </div>
 
 <div className="text-center">
 <div className="text-lg font-bold text-green-600">
 {group.averageGPA.toFixed(2)}
 </div>
 <div className="text-muted-foreground">Ortalama GPA</div>
 </div>
 
 <div className="text-center">
 <div className="text-lg font-bold text-purple-600">
 %{Math.round(group.attendanceRate * 100)}
 </div>
 <div className="text-muted-foreground">Devam Oranı</div>
 </div>
 
 <div className="text-center">
 <div className="text-lg font-bold text-red-600">
 {group.riskDistribution.yüksek}
 </div>
 <div className="text-muted-foreground">Yüksek Risk</div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 );
}

export function PerformanceMetricsTable({ metrics }: { metrics: PerformanceMetrics[] }) {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <BarChart3 className="h-5 w-5" />
 Performans Metrikleri
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 {metrics.map((metric, index) => (
 <div key={index}>
 <h3 className="font-medium mb-2">{metric.metric}</h3>
 <div className="grid gap-2">
 {metric.values.map((value, valueIndex) => (
 <div key={valueIndex} className="flex items-center justify-between p-2 rounded border">
 <span className="text-sm">{value.name}</span>
 <div className="flex items-center gap-2">
 <span className="font-medium">
 {metric.metric.includes("Oranı") ? `%${Math.round(value.value)}` : value.value.toFixed(2)}
 </span>
 {value.trend && (
 <span className={cn(
"text-xs",
 value.trend ==="up" ?"text-green-600" : 
 value.trend ==="down" ?"text-red-600" :"text-gray-600"
 )}>
 {value.trend ==="up" ?"↗" : value.trend ==="down" ?"↘" :"→"}
 </span>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 );
}

export function BenchmarkComparison({ benchmarks }: { benchmarks: BenchmarkData[] }) {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Award className="h-5 w-5" />
 Benchmark Karşılaştırması
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 {benchmarks.map((benchmark, index) => (
 <div key={index} className="border rounded-lg p-4">
 <h3 className="font-medium mb-3">{benchmark.category}</h3>
 
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
 <div className="text-center">
 <div className="text-lg font-bold text-blue-600">
 {benchmark.category.includes("Risk") 
 ? `%${benchmark.current.toFixed(1)}`
 : `%${Math.round(benchmark.current)}`
 }
 </div>
 <div className="text-muted-foreground">Mevcut</div>
 </div>
 
 <div className="text-center">
 <div className="text-lg font-bold text-green-600">
 {benchmark.category.includes("Risk") 
 ? `%${benchmark.target}`
 : `%${benchmark.target}`
 }
 </div>
 <div className="text-muted-foreground">Hedef</div>
 </div>
 
 <div className="text-center">
 <div className="text-lg font-bold text-purple-600">
 {benchmark.category.includes("Risk") 
 ? `%${benchmark.benchmark}`
 : `%${benchmark.benchmark}`
 }
 </div>
 <div className="text-muted-foreground">Okul Ort.</div>
 </div>
 
 {benchmark.national && (
 <div className="text-center">
 <div className="text-lg font-bold text-gray-600">
 {benchmark.category.includes("Risk") 
 ? `%${benchmark.national}`
 : `%${benchmark.national}`
 }
 </div>
 <div className="text-muted-foreground">Ulusal Ort.</div>
 </div>
 )}
 </div>

 {/* İlerleme çubuğu */}
 <div className="mt-3 space-y-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>İlerleme</span>
 <span>
 {benchmark.category.includes("Risk") 
 ? (benchmark.current <= benchmark.target ?"Hedefin Altında ✓" :"Hedefin Üstünde")
 : (benchmark.current >= benchmark.target ?"Hedefte ✓" : `%${Math.round((benchmark.current / benchmark.target) * 100)}`)
 }
 </span>
 </div>
 <div className="w-full bg-gray-200 rounded-full h-2">
 <div 
 className={cn(
"h-2 rounded-full",
 benchmark.category.includes("Risk")
 ? (benchmark.current <= benchmark.target ? STATUS_BAR_COLORS.success : STATUS_BAR_COLORS.danger)
 : (benchmark.current >= benchmark.target ? STATUS_BAR_COLORS.success : STATUS_BAR_COLORS.warning)
 )}
 style={{
 width: benchmark.category.includes("Risk")
 ? `${Math.min(100, (benchmark.target / Math.max(benchmark.current, benchmark.target)) * 100)}%`
 : `${Math.min(100, (benchmark.current / benchmark.target) * 100)}%`
 }}
 />
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 );
}

const ComparativeReports = React.memo(function ComparativeReports() {
 const [demographicComparisons, setDemographicComparisons] = useState<DemographicComparison[]>([]);
 const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
 const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
 const [classComparisons, setClassComparisons] = useState<any[]>([]);
 const [activeTab, setActiveTab] = useState<string>("demographic");
 const [isLoadingDetails, setIsLoadingDetails] = useState(false);

 // İlk yükleme - sadece özet veriler
 useEffect(() => {
 optimizedGenerateClassComparisons().then(setClassComparisons);
 }, []);

 // Progressive loading - sekme değiştiğinde detayları yükle
 useEffect(() => {
 if (activeTab ==="demographic" && demographicComparisons.length === 0) {
 setIsLoadingDetails(true);
 generateDemographicComparisons().then((data) => {
 setDemographicComparisons(data);
 setIsLoadingDetails(false);
 });
 } else if (activeTab ==="performance" && performanceMetrics.length === 0) {
 setIsLoadingDetails(true);
 generatePerformanceMetrics().then((data) => {
 setPerformanceMetrics(data);
 setIsLoadingDetails(false);
 });
 } else if (activeTab ==="benchmark" && benchmarkData.length === 0) {
 setIsLoadingDetails(true);
 generateBenchmarkData().then((data) => {
 setBenchmarkData(data);
 setIsLoadingDetails(false);
 });
 }
 }, [activeTab, demographicComparisons.length, performanceMetrics.length, benchmarkData.length]);

 // Risk dağılımı için veri hazırlama
 const riskDistributionData = useMemo(() => {
 const totalRisk = { düşük: 0, orta: 0, yüksek: 0 };
 
 classComparisons.forEach(cls => {
 totalRisk.düşük += cls.riskDistribution.düşük;
 totalRisk.orta += cls.riskDistribution.orta;
 totalRisk.yüksek += cls.riskDistribution.yüksek;
 });

 return [
 { name:"Düşük", value: totalRisk.düşük },
 { name:"Orta", value: totalRisk.orta },
 { name:"Yüksek", value: totalRisk.yüksek },
 ];
 }, [classComparisons]);

 // Sınıf karşılaştırması için veri
 const classComparisonData = useMemo(() => 
 classComparisons.map(cls => ({
 category: cls.class,
 current: cls.averageGPA,
 previous: cls.averageGPA * 0.9, // Simüle önceki dönem
 target: 3.5, // Hedef GPA
 })), [classComparisons]);

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold">Karşılaştırmalı Raporlar</h2>
 <p className="text-muted-foreground">
 Sınıf ve öğrenci grupları arası performans karşılaştırmaları
 </p>
 </div>
 <div className="flex gap-2">
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

 {/* Özet Kartları */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <SuccessMetricCard
 title="Toplam Sınıf"
 value={classComparisons.length}
 icon={Users}
 description="Karşılaştırılan sınıf sayısı"
 />
 <SuccessMetricCard
 title="En Başarılı Sınıf"
 value={Math.max(...classComparisons.map(c => c.averageGPA))}
 icon={Award}
 description="En yüksek ortalama GPA"
 trend="up"
 />
 <SuccessMetricCard
 title="Risk Altında"
 value={riskDistributionData.find(r => r.name ==="Yüksek")?.value || 0}
 icon={AlertTriangle}
 description="Yüksek riskli öğrenci sayısı"
 trend="down"
 />
 <SuccessMetricCard
 title="Genel Başarı"
 value={benchmarkData.find(b => b.category ==="Genel Başarı Oranı")?.current || 0}
 icon={TrendingUp}
 description="Okul geneli başarı oranı"
 trend="up"
 />
 </div>

 <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
 <TabsList>
 <TabsTrigger value="demographic" variant="nested">Demografik Karşılaştırma</TabsTrigger>
 <TabsTrigger value="performance" variant="nested">Performans Metrikleri</TabsTrigger>
 <TabsTrigger value="benchmark" variant="nested">Benchmark Analizi</TabsTrigger>
 <TabsTrigger value="charts" variant="nested">Grafik Analizi</TabsTrigger>
 </TabsList>

 <TabsContent value="demographic" className="space-y-4">
 {isLoadingDetails ? (
 <Card>
 <CardContent className="p-12 text-center">
 <div className=" h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
 <p className="text-muted-foreground">Demografik karşılaştırmalar yükleniyor...</p>
 </CardContent>
 </Card>
 ) : (
 <div className="space-y-4">
 {demographicComparisons.map((comparison, index) => (
 <DemographicComparisonView key={index} comparison={comparison} />
 ))}
 </div>
 )}
 </TabsContent>

 <TabsContent value="performance" className="space-y-4">
 {isLoadingDetails ? (
 <Card>
 <CardContent className="p-12 text-center">
 <div className=" h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
 <p className="text-muted-foreground">Performans metrikleri hesaplanıyor...</p>
 </CardContent>
 </Card>
 ) : (
 <PerformanceMetricsTable metrics={performanceMetrics} />
 )}
 </TabsContent>

 <TabsContent value="benchmark" className="space-y-4">
 {isLoadingDetails ? (
 <Card>
 <CardContent className="p-12 text-center">
 <div className=" h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
 <p className="text-muted-foreground">Benchmark verileri analiz ediliyor...</p>
 </CardContent>
 </Card>
 ) : (
 <BenchmarkComparison benchmarks={benchmarkData} />
 )}
 </TabsContent>

 <TabsContent value="charts" className="space-y-4">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <ClassComparisonChart data={classComparisonData} />
 <RiskDistributionChart data={riskDistributionData} />
 </div>
 
 <div className="mt-6">
 <PerformanceTrendChart 
 data={classComparisons.map((cls) => ({
 date: cls.class,
 value: cls.averageGPA,
 target: 3.5,
 }))}
 title="Sınıf Bazında GPA Karşılaştırması"
 />
 </div>
 </TabsContent>
 </Tabs>
 </div>
 );
});

export default ComparativeReports;