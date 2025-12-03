import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Badge } from "@/components/atoms/Badge";
import { Progress } from "@/components/atoms/Progress";
import { ScrollArea } from "@/components/organisms/ScrollArea";
import { Separator } from "@/components/atoms/Separator";
import { Input } from "@/components/atoms/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { toast } from "sonner";
import {
 Briefcase,
 TrendingUp,
 Target,
 Search,
 Sparkles,
 ChevronRight,
 AlertCircle,
 CheckCircle2,
 Clock,
 ArrowRight,
 BookOpen,
 Loader2,
 Award,
 BarChart3,
 History,
 GitCompare,
 RefreshCw,
 TrendingDown,
 MapPin
} from "lucide-react";
import {
 getAllCareers,
 analyzeCareerMatch,
 generateCareerRoadmap,
 getStudentRoadmap,
 getStudentAnalysisHistory,
 getStudentCompetencies,
 refreshStudentCompetencies,
 getStudentCompetencyStats,
 getAllStudentRoadmaps,
 updateRoadmapProgress,
 compareCareers,
 type StudentCompetency,
 type CompetencyStats,
 type CareerComparison
} from "@/lib/api/endpoints/career-guidance.api";
import type {
 CareerProfile,
 CareerAnalysisResult,
 CareerRoadmap,
 CareerCategory
} from "@shared/types/career-guidance.types";

interface CareerGuidanceSectionProps {
 studentId: string;
 studentName: string;
 onUpdate?: () => void;
}

const CAREER_CATEGORIES: { value: CareerCategory; label: string }[] = [
 { value: 'STEM', label: 'Fen, Teknoloji, Mühendislik' },
 { value: 'HEALTH', label: 'Sağlık' },
 { value: 'EDUCATION', label: 'Eğitim' },
 { value: 'BUSINESS', label: 'İş ve Yönetim' },
 { value: 'ARTS', label: 'Sanat ve Tasarım' },
 { value: 'SOCIAL_SERVICES', label: 'Sosyal Hizmetler' },
 { value: 'LAW', label: 'Hukuk' },
 { value: 'SPORTS', label: 'Spor' },
 { value: 'MEDIA', label: 'Medya ve İletişim' },
 { value: 'TRADES', label: 'El Sanatları' },
];

export default function CareerGuidanceSection({ studentId, studentName }: CareerGuidanceSectionProps) {
 const [activeTab, setActiveTab] = useState("analysis");
 const [careers, setCareers] = useState<CareerProfile[]>([]);
 const [analysis, setAnalysis] = useState<CareerAnalysisResult | null>(null);
 const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
 const [loading, setLoading] = useState(false);
 const [searchTerm, setSearchTerm] = useState("");
 const [selectedCategory, setSelectedCategory] = useState<CareerCategory |"ALL">("ALL");
 const [selectedCareer, setSelectedCareer] = useState<CareerProfile | null>(null);
 
 const [competencies, setCompetencies] = useState<StudentCompetency[]>([]);
 const [competencyStats, setCompetencyStats] = useState<CompetencyStats | null>(null);
 const [allRoadmaps, setAllRoadmaps] = useState<CareerRoadmap[]>([]);
 const [analysisHistory, setAnalysisHistory] = useState<CareerAnalysisResult[]>([]);
 const [comparison, setComparison] = useState<CareerComparison | null>(null);
 const [selectedCareersForComparison, setSelectedCareersForComparison] = useState<string[]>([]);

 useEffect(() => {
 loadInitialData();
 }, [studentId]);

 const loadInitialData = async () => {
 try {
 const [careersData, roadmapData, competenciesData, statsData, roadmapsData, historyData] = await Promise.all([
 getAllCareers(),
 getStudentRoadmap(studentId),
 getStudentCompetencies(studentId),
 getStudentCompetencyStats(studentId),
 getAllStudentRoadmaps(studentId),
 getStudentAnalysisHistory(studentId, 10)
 ]);
 setCareers(careersData);
 setRoadmap(roadmapData);
 setCompetencies(competenciesData);
 setCompetencyStats(statsData);
 setAllRoadmaps(roadmapsData);
 setAnalysisHistory(historyData);
 } catch (error) {
 console.error("Error loading career data:", error);
 }
 };

 const handleAnalyze = async () => {
 setLoading(true);
 try {
 const result = await analyzeCareerMatch({ studentId });
 setAnalysis(result);
 
 const updatedHistory = await getStudentAnalysisHistory(studentId, 10);
 setAnalysisHistory(updatedHistory);
 
 toast.success("Kariyer analizi tamamlandı!");
 setActiveTab("analysis");
 } catch (error) {
 toast.error("Analiz sırasında hata oluştu");
 console.error("Analysis error:", error);
 } finally {
 setLoading(false);
 }
 };

 const handleGenerateRoadmap = async (careerId: string) => {
 setLoading(true);
 try {
 const result = await generateCareerRoadmap({ studentId, careerId });
 setRoadmap(result);
 
 const updatedRoadmaps = await getAllStudentRoadmaps(studentId);
 setAllRoadmaps(updatedRoadmaps);
 
 toast.success("Kariyer yol haritası oluşturuldu!");
 setActiveTab("roadmap");
 } catch (error) {
 toast.error("Yol haritası oluşturulamadı");
 console.error("Roadmap generation error:", error);
 } finally {
 setLoading(false);
 }
 };

 const filteredCareers = careers.filter((career) => {
 const matchesSearch = career.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 career.description.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesCategory = selectedCategory ==="ALL" || career.category === selectedCategory;
 return matchesSearch && matchesCategory;
 });

 const getCompatibilityColor = (score: number) => {
 if (score >= 80) return"text-green-600 bg-green-50";
 if (score >= 60) return"text-blue-600 bg-blue-50";
 if (score >= 40) return"text-yellow-600 bg-yellow-50";
 return"text-red-600 bg-red-50";
 };

 const getCompatibilityLabel = (score: number) => {
 if (score >= 80) return"Mükemmel Uyum";
 if (score >= 60) return"İyi Uyum";
 if (score >= 40) return"Orta Uyum";
 return"Düşük Uyum";
 };

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Briefcase className="h-5 w-5" />
 Kariyer Rehberliği ve Optimizasyon
 </CardTitle>
 <CardDescription>
 AI destekli meslek uyumu analizi ve kişiselleştirilmiş kariyer yol haritası
 </CardDescription>
 </CardHeader>
 <CardContent>
 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList variant="nested">
 <TabsTrigger value="analysis" variant="nested">
 <Sparkles className="h-4 w-4" />
 <span className="hidden sm:inline">Analiz</span>
 </TabsTrigger>
 <TabsTrigger value="explore" variant="nested">
 <Briefcase className="h-4 w-4" />
 <span className="hidden sm:inline">Keşfet</span>
 </TabsTrigger>
 <TabsTrigger value="roadmap" variant="nested">
 <MapPin className="h-4 w-4" />
 <span className="hidden sm:inline">Yol Haritası</span>
 </TabsTrigger>
 <TabsTrigger value="competencies" variant="nested">
 <Award className="h-4 w-4" />
 <span className="hidden sm:inline">Yetkinlikler</span>
 </TabsTrigger>
 <TabsTrigger value="compare" variant="nested">
 <BarChart3 className="h-4 w-4" />
 <span className="hidden sm:inline">Karşılaştır</span>
 </TabsTrigger>
 <TabsTrigger value="history" variant="nested">
 <History className="h-4 w-4" />
 <span className="hidden sm:inline">Geçmiş</span>
 </TabsTrigger>
 </TabsList>

 <TabsContent value="analysis" className="space-y-4 mt-4">
 <div className="flex items-center justify-between">
 <div className="space-y-1">
 <h3 className="text-sm font-medium">Meslek Uyum Analizi</h3>
 <p className="text-xs text-muted-foreground">
 {studentName} için en uygun meslekleri keşfedin
 </p>
 </div>
 <Button
 onClick={handleAnalyze}
 disabled={loading}

 >
 {loading ? (
 <><Loader2 className="h-4 w-4" /> Analiz Ediliyor...</>
 ) : (
 <><Sparkles className="h-4 w-4" /> Analiz Başlat</>
 )}
 </Button>
 </div>

 {analysis && (
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Genel Uyumluluk</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{analysis.overallCompatibility?.toFixed(0) || 0}%</div>
 <p className="text-xs text-muted-foreground mt-1">
 {analysis.topMatches?.length || 0} meslek analiz edildi
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">En İyi Eşleşme</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-sm font-semibold">{analysis.topMatches?.[0]?.careerName || 'N/A'}</div>
 <div className="flex items-center gap-2 mt-1">
 <Progress value={analysis.topMatches?.[0]?.matchScore || 0} className="flex-1 h-2" />
 <span className="text-xs font-medium">{analysis.topMatches?.[0]?.matchScore?.toFixed(0) || 0}%</span>
 </div>
 </CardContent>
 </Card>
 </div>

 <div className="space-y-2">
 <h4 className="text-sm font-semibold flex items-center gap-2">
 <TrendingUp className="h-4 w-4" />
 En Uygun Meslekler
 </h4>
 <ScrollArea className="h-[400px] pr-4">
 <div className="space-y-3">
 {(analysis.topMatches || []).map((match, index) => (
 <Card key={match.careerId} className="">
 <CardContent className="p-4">
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1 space-y-2">
 <div className="flex items-center gap-2">
 <Badge variant="outline" className="font-mono text-xs">
 #{index + 1}
 </Badge>
 <h5 className="font-semibold">{match.careerName}</h5>
 <Badge className={getCompatibilityColor(match.matchScore)}>
 {getCompatibilityLabel(match.matchScore)}
 </Badge>
 </div>
 
 <div className="flex items-center gap-4 text-xs text-muted-foreground">
 <span>Uyum: {match.matchScore?.toFixed(0) || 0}%</span>
 <span>•</span>
 <span>{match.strengths?.length || 0} güçlü yön</span>
 <span>•</span>
 <span>{match.gaps?.length || 0} gelişim alanı</span>
 </div>

 <Progress value={match.matchScore || 0} className="h-2" />

 {(match.gaps || []).filter(g => g.importance === 'CRITICAL').length > 0 && (
 <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
 <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
 <span>
 {(match.gaps || []).filter(g => g.importance === 'CRITICAL').length} kritik yetkinlik gerekiyor
 </span>
 </div>
 )}
 </div>

 <Button
 size="sm"
 variant="outline"
 onClick={() => handleGenerateRoadmap(match.careerId)}
 disabled={loading}
 >
 Yol Haritası Oluştur
 </Button>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </ScrollArea>
 </div>
 </div>
 )}

 {!analysis && (
 <div className="text-center py-12 text-muted-foreground">
 <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
 <p className="text-sm">Kariyer analizi başlatarak en uygun meslekleri keşfedin</p>
 </div>
 )}
 </TabsContent>

 <TabsContent value="explore" className="space-y-4 mt-4">
 <div className="flex gap-2">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder="Meslek ara..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-9"
 />
 </div>
 <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as CareerCategory |"ALL")}>
 <SelectTrigger className="w-[200px]">
 <SelectValue placeholder="Kategori seçin" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="ALL">Tüm Kategoriler</SelectItem>
 {CAREER_CATEGORIES.map(cat => (
 <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <ScrollArea className="h-[500px] pr-4">
 <div className="grid gap-3">
 {filteredCareers.map((career) => (
 <Card
 key={career.id}
 className="cursor-pointer"
 onClick={() => setSelectedCareer(career)}
 >
 <CardContent className="p-4">
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1 space-y-1">
 <div className="flex items-center gap-2">
 <h5 className="font-semibold">{career.name}</h5>
 <Badge variant="secondary" className="text-xs">
 {CAREER_CATEGORIES.find(c => c.value === career.category)?.label}
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground line-clamp-2">
 {career.description}
 </p>
 <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
 <span>{career.requiredEducationLevel}</span>
 {career.averageSalary && (
 <>
 <span>•</span>
 <span>{career.averageSalary}</span>
 </>
 )}
 {career.jobOutlook && (
 <>
 <span>•</span>
 <span>İş Bulma: {career.jobOutlook}</span>
 </>
 )}
 </div>
 </div>
 <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
 </div>
 </CardContent>
 </Card>
 ))}

 {filteredCareers.length === 0 && (
 <div className="text-center py-12 text-muted-foreground">
 <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
 <p className="text-sm">Arama kriterlerinize uygun meslek bulunamadı</p>
 </div>
 )}
 </div>
 </ScrollArea>

 {selectedCareer && (
 <Card>
 <CardHeader>
 <div className="flex items-start justify-between">
 <div className="space-y-1">
 <CardTitle>{selectedCareer.name}</CardTitle>
 <CardDescription>{selectedCareer.description}</CardDescription>
 </div>
 <Button onClick={() => handleGenerateRoadmap(selectedCareer.id)} disabled={loading}>
 Yol Haritası Oluştur
 </Button>
 </div>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div>
 <span className="text-muted-foreground">Eğitim:</span>
 <p className="font-medium">{selectedCareer.requiredEducationLevel}</p>
 </div>
 {selectedCareer.averageSalary && (
 <div>
 <span className="text-muted-foreground">Maaş Aralığı:</span>
 <p className="font-medium">{selectedCareer.averageSalary}</p>
 </div>
 )}
 {selectedCareer.jobOutlook && (
 <div>
 <span className="text-muted-foreground">İş Bulma Kolaylığı:</span>
 <p className="font-medium">{selectedCareer.jobOutlook}</p>
 </div>
 )}
 {selectedCareer.workEnvironment && (
 <div>
 <span className="text-muted-foreground">Çalışma Ortamı:</span>
 <p className="font-medium">{selectedCareer.workEnvironment}</p>
 </div>
 )}
 </div>

 <div className="space-y-2">
 <h4 className="text-sm font-semibold">Gerekli Yetkinlikler</h4>
 <div className="space-y-2">
 {selectedCareer.requiredCompetencies.map((comp) => (
 <div key={comp.competencyId} className="flex items-center justify-between text-xs">
 <span>{comp.competencyName}</span>
 <div className="flex items-center gap-2">
 <Badge variant={comp.importance === 'CRITICAL' ? 'destructive' : 'secondary'} className="text-xs">
 {comp.importance}
 </Badge>
 <span className="text-muted-foreground">Seviye {comp.minimumLevel}/10</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </CardContent>
 </Card>
 )}
 </TabsContent>

 <TabsContent value="roadmap" className="space-y-4 mt-4">
 {roadmap ? (
 <div className="space-y-4">
 <Card>
 <CardHeader>
 <div className="flex items-start justify-between">
 <div className="space-y-1">
 <CardTitle className="flex items-center gap-2">
 <Target className="h-5 w-5" />
 {roadmap.targetCareerName}
 </CardTitle>
 <CardDescription>
 Kişiselleştirilmiş Kariyer Gelişim Planı
 </CardDescription>
 </div>
 <Badge variant="outline">
 <Clock className="h-3 w-3" />
 {roadmap.estimatedCompletionTime}
 </Badge>
 </div>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <p className="text-xs text-muted-foreground">Mevcut Uyum</p>
 <div className="flex items-center gap-2 mt-1">
 <Progress value={roadmap.currentMatchScore || 0} className="flex-1 h-2" />
 <span className="text-sm font-semibold">{roadmap.currentMatchScore?.toFixed(0) || 0}%</span>
 </div>
 </div>
 <div>
 <p className="text-xs text-muted-foreground">Hedef Uyum</p>
 <div className="flex items-center gap-2 mt-1">
 <Progress value={roadmap.projectedMatchScore || 0} className="flex-1 h-2" />
 <span className="text-sm font-semibold">{roadmap.projectedMatchScore?.toFixed(0) || 0}%</span>
 </div>
 </div>
 </div>

 {roadmap.motivationalInsights && (roadmap.motivationalInsights || []).length > 0 && (
 <div className="bg-blue-50 text-blue-900 p-3 rounded-lg text-sm space-y-2">
 <p className="font-medium">Motivasyonel İçgörüler</p>
 {(roadmap.motivationalInsights || []).map((insight, idx) => (
 <p key={idx} className="text-xs">{insight}</p>
 ))}
 </div>
 )}
 </CardContent>
 </Card>

 <div className="space-y-3">
 <h4 className="text-sm font-semibold flex items-center gap-2">
 <BookOpen className="h-4 w-4" />
 Gelişim Adımları ({(roadmap.developmentSteps || []).length})
 </h4>

 <ScrollArea className="h-[400px] pr-4">
 <div className="space-y-3">
 {(roadmap.developmentSteps || []).map((step, index) => (
 <Card key={step.id}>
 <CardContent className="p-4">
 <div className="flex items-start gap-3">
 <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
 {index + 1}
 </div>
 <div className="flex-1 space-y-2">
 <div className="flex items-start justify-between gap-2">
 <h5 className="font-semibold">{step.competencyName}</h5>
 <div className="flex items-center gap-2 shrink-0">
 <Badge variant="outline">{step.timeline}</Badge>
 <Badge variant={step.priority === 'CRITICAL' ? 'destructive' : 'secondary'}>
 {step.priority}
 </Badge>
 </div>
 </div>
 
 <div className="text-xs text-muted-foreground">
 <span>Mevcut: {step.currentLevel}/10</span>
 <ArrowRight className="inline h-3 w-3 mx-2" />
 <span>Hedef: {step.targetLevel}/10</span>
 </div>

 {(step.strategies || []).length > 0 && (
 <div className="space-y-1 mt-2">
 <p className="text-xs font-medium">Geliştirme Stratejileri:</p>
 <ul className="text-xs text-muted-foreground space-y-1">
 {(step.strategies || []).map((strategy, idx) => (
 <li key={idx} className="flex items-start gap-1">
 <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0 text-green-600" />
 <span>{strategy}</span>
 </li>
 ))}
 </ul>
 </div>
 )}

 {(step.resources || []).length > 0 && (
 <div className="space-y-1 mt-2 pt-2 border-t">
 <p className="text-xs font-medium">Önerilen Kaynaklar:</p>
 {(step.resources || []).slice(0, 3).map((resource, idx) => (
 <div key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
 <BookOpen className="h-3 w-3 mt-0.5 shrink-0" />
 <span>{resource.title} ({resource.type})</span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </ScrollArea>
 </div>

 {roadmap.aiRecommendations && (roadmap.aiRecommendations || []).length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="text-sm flex items-center gap-2">
 <Sparkles className="h-4 w-4" />
 AI Önerileri
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-2">
 {(roadmap.aiRecommendations || []).map((recommendation, idx) => (
 <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
 <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
 <span>{recommendation}</span>
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 )}
 </div>
 ) : (
 <div className="text-center py-12 text-muted-foreground">
 <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
 <p className="text-sm mb-4">Henüz bir kariyer yol haritası oluşturulmamış</p>
 <Button onClick={() => setActiveTab("analysis")}>
 Kariyer Analizi Başlat
 <ArrowRight className="ml-2 h-4 w-4" />
 </Button>
 </div>
 )}
 </TabsContent>

 <TabsContent value="competencies" className="space-y-4 mt-4">
 <div className="flex items-center justify-between">
 <div className="space-y-1">
 <h3 className="text-sm font-medium">Yetkinlik Profili</h3>
 <p className="text-xs text-muted-foreground">
 Mevcut yetkinliklerinizi görüntüleyin ve geliştirin
 </p>
 </div>
 <Button
 onClick={async () => {
 setLoading(true);
 try {
 const updated = await refreshStudentCompetencies(studentId);
 setCompetencies(updated);
 const stats = await getStudentCompetencyStats(studentId);
 setCompetencyStats(stats);
 } catch (error) {
 console.error("Error refreshing competencies:", error);
 } finally {
 setLoading(false);
 }
 }}
 disabled={loading}
 variant="outline"

 >
 {loading ? (
 <><Loader2 className="h-4 w-4" /> Yenileniyor...</>
 ) : (
 <><RefreshCw className="h-4 w-4" /> AI ile Yenile</>
 )}
 </Button>
 </div>

 {competencyStats && (
 <div className="grid grid-cols-3 gap-4">
 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Toplam Yetkinlik</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{competencyStats.totalCompetencies}</div>
 <p className="text-xs text-muted-foreground mt-1">Değerlendirilen alan</p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Ortalama Seviye</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{competencyStats.averageLevel.toFixed(1)}/10</div>
 <Progress value={competencyStats.averageLevel * 10} className="mt-2 h-2" />
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Güçlü Alanlar</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{competencyStats.strongCompetencies?.length || 0}</div>
 <p className="text-xs text-muted-foreground mt-1">Seviye 7+ yetkinlik</p>
 </CardContent>
 </Card>
 </div>
 )}

 <ScrollArea className="h-[500px] pr-4">
 <div className="space-y-3">
 {competencies.length > 0 ? (
 competencies.map((comp) => (
 <Card key={comp.competencyId}>
 <CardContent className="p-4">
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1 space-y-2">
 <div className="flex items-center gap-2">
 <Award className="h-4 w-4 text-primary" />
 <h5 className="font-semibold">{comp.competencyName}</h5>
 <Badge variant="secondary" className="text-xs">{comp.category}</Badge>
 </div>
 
 <div className="flex items-center gap-4">
 <div className="flex-1">
 <Progress value={comp.currentLevel * 10} className="h-2" />
 </div>
 <span className="text-sm font-medium">{comp.currentLevel}/10</span>
 </div>

 <div className="text-xs text-muted-foreground">
 Kaynak: {comp.source} • Değerlendirme: {new Date(comp.assessmentDate).toLocaleDateString('tr-TR')}
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 ))
 ) : (
 <div className="text-center py-12 text-muted-foreground">
 <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
 <p className="text-sm mb-4">Henüz yetkinlik değerlendirmesi yapılmamış</p>
 <Button
 onClick={async () => {
 setLoading(true);
 try {
 const updated = await refreshStudentCompetencies(studentId);
 setCompetencies(updated);
 } catch (error) {
 console.error("Error refreshing:", error);
 } finally {
 setLoading(false);
 }
 }}
 disabled={loading}
 >
 <Sparkles className="mr-2 h-4 w-4" />
 AI ile Yetkinlikleri Çıkar
 </Button>
 </div>
 )}
 </div>
 </ScrollArea>
 </TabsContent>

 <TabsContent value="compare" className="space-y-4 mt-4">
 <div className="space-y-4">
 <div className="space-y-2">
 <h3 className="text-sm font-medium">Meslek Karşılaştırma</h3>
 <p className="text-xs text-muted-foreground">
 Birden fazla mesleği karşılaştırarak en uygun olanı bulun
 </p>
 </div>

 <div className="flex gap-2">
 <div className="flex-1">
 <Select 
 onValueChange={(value) => {
 if (!selectedCareersForComparison.includes(value) && selectedCareersForComparison.length < 5) {
 setSelectedCareersForComparison([...selectedCareersForComparison, value]);
 }
 }}
 >
 <SelectTrigger>
 <SelectValue placeholder="Meslek seçin (en fazla 5)" />
 </SelectTrigger>
 <SelectContent>
 {careers
 .filter(c => !selectedCareersForComparison.includes(c.id))
 .map(career => (
 <SelectItem key={career.id} value={career.id}>
 {career.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <Button
 onClick={async () => {
 if (selectedCareersForComparison.length >= 2) {
 setLoading(true);
 try {
 const result = await compareCareers(studentId, selectedCareersForComparison);
 setComparison(result);
 } catch (error) {
 console.error("Comparison error:", error);
 } finally {
 setLoading(false);
 }
 } else {
 toast.error("En az 2 meslek seçmelisiniz");
 }
 }}
 disabled={loading || selectedCareersForComparison.length < 2}
 >
 <GitCompare className="mr-2 h-4 w-4" />
 Karşılaştır
 </Button>
 </div>

 {selectedCareersForComparison.length > 0 && (
 <div className="flex flex-wrap gap-2">
 {selectedCareersForComparison.map(careerId => {
 const career = careers.find(c => c.id === careerId);
 return (
 <Badge key={careerId} variant="secondary">
 {career?.name}
 <button
 onClick={() => setSelectedCareersForComparison(selectedCareersForComparison.filter(id => id !== careerId))}
 className=""
 >
 ×
 </button>
 </Badge>
 );
 })}
 </div>
 )}

 {comparison && (
 <div className="space-y-4">
 <Card>
 <CardHeader>
 <CardTitle className="text-sm">En İyi Eşleşme</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex items-center gap-2">
 <Award className="h-5 w-5 text-primary" />
 <span className="font-semibold">{comparison.bestMatch || 'N/A'}</span>
 </div>
 </CardContent>
 </Card>

 <ScrollArea className="h-[450px] pr-4">
 <div className="space-y-3">
 {(comparison.careers || []).map((item) => (
 <Card key={item.career.id}>
 <CardContent className="p-4">
 <div className="space-y-3">
 <div className="flex items-start justify-between">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <Badge variant="outline" className="font-mono">#{item.rank}</Badge>
 <h5 className="font-semibold">{item.career.name}</h5>
 </div>
 <p className="text-xs text-muted-foreground">{item.career.description}</p>
 </div>
 <div className="text-right shrink-0">
 <div className="text-2xl font-bold">{item.matchScore?.toFixed(0) || 0}%</div>
 <Badge className={getCompatibilityColor(item.matchScore || 0)}>
 {getCompatibilityLabel(item.matchScore || 0)}
 </Badge>
 </div>
 </div>

 <Progress value={item.matchScore || 0} className="h-2" />

 <div className="grid grid-cols-2 gap-4 text-xs">
 <div>
 <p className="font-medium mb-1">Güçlü Yönler ({item.strengths?.length || 0})</p>
 <ul className="space-y-0.5 text-muted-foreground">
 {(item.strengths || []).slice(0, 3).map((s, i) => (
 <li key={i}>• {s}</li>
 ))}
 </ul>
 </div>
 <div>
 <p className="font-medium mb-1">Gelişim Alanları ({item.gaps?.length || 0})</p>
 <ul className="space-y-0.5 text-muted-foreground">
 {(item.gaps || []).slice(0, 3).map((g: any, i: number) => (
 <li key={i}>• {g?.competencyName || 'N/A'}</li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </ScrollArea>
 </div>
 )}

 {!comparison && (
 <div className="text-center py-12 text-muted-foreground">
 <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
 <p className="text-sm">Karşılaştırma yapmak için en az 2 meslek seçin</p>
 </div>
 )}
 </div>
 </TabsContent>

 <TabsContent value="history" className="space-y-4 mt-4">
 <div className="space-y-4">
 <div>
 <h3 className="text-sm font-medium">Kariyer Geçmişi</h3>
 <p className="text-xs text-muted-foreground">
 Geçmiş analizler ve yol haritalarınızı görüntüleyin
 </p>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <BarChart3 className="h-4 w-4" />
 Toplam Analiz
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{analysisHistory.length}</div>
 <p className="text-xs text-muted-foreground mt-1">Yapılan kariyer analizi</p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <Target className="h-4 w-4" />
 Yol Haritaları
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{allRoadmaps.length}</div>
 <p className="text-xs text-muted-foreground mt-1">Oluşturulan yol haritası</p>
 </CardContent>
 </Card>
 </div>

 <Separator />

 <div className="space-y-2">
 <h4 className="text-sm font-semibold flex items-center gap-2">
 <History className="h-4 w-4" />
 Analiz Geçmişi
 </h4>
 <ScrollArea className="h-[250px] pr-4">
 {analysisHistory.length > 0 ? (
 <div className="space-y-2">
 {analysisHistory.map((analysis, index) => (
 <Card key={index} className=" cursor-pointer">
 <CardContent className="p-3">
 <div className="flex items-start justify-between gap-2">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <Badge variant="outline" className="text-xs">
 {new Date(analysis.analysisDate).toLocaleDateString('tr-TR')}
 </Badge>
 {analysis.targetCareer && (
 <span className="text-xs font-medium">{analysis.targetCareer.name}</span>
 )}
 </div>
 <div className="text-xs text-muted-foreground">
 {analysis.topMatches?.length || 0} meslek analiz edildi • Uyumluluk: {analysis.overallCompatibility?.toFixed(0) || 0}%
 </div>
 </div>
 <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 ) : (
 <div className="text-center py-8 text-muted-foreground">
 <p className="text-sm">Henüz analiz yapılmamış</p>
 </div>
 )}
 </ScrollArea>
 </div>

 <Separator />

 <div className="space-y-2">
 <h4 className="text-sm font-semibold flex items-center gap-2">
 <Target className="h-4 w-4" />
 Yol Haritası Geçmişi
 </h4>
 <ScrollArea className="h-[250px] pr-4">
 {allRoadmaps.length > 0 ? (
 <div className="space-y-2">
 {allRoadmaps.map((rm) => (
 <Card key={rm.id} className="">
 <CardContent className="p-3">
 <div className="flex items-start justify-between gap-2">
 <div className="flex-1 space-y-1">
 <div className="flex items-center gap-2">
 <h5 className="font-semibold text-sm">{rm.targetCareerName}</h5>
 <Badge variant={
 (rm as any).status === 'ACTIVE' ? 'default' : 
 (rm as any).status === 'COMPLETED' ? 'secondary' : 'outline'
 } className="text-xs">
 {(rm as any).status || 'ACTIVE'}
 </Badge>
 </div>
 <div className="flex items-center gap-4 text-xs text-muted-foreground">
 <span>Oluşturulma: {new Date(rm.createdAt).toLocaleDateString('tr-TR')}</span>
 <span>•</span>
 <span>{(rm.developmentSteps || []).length} adım</span>
 <span>•</span>
 <span>{rm.estimatedCompletionTime}</span>
 </div>
 <div className="flex items-center gap-2">
 <Progress value={rm.currentMatchScore || 0} className="flex-1 h-1.5" />
 <span className="text-xs font-medium">{rm.currentMatchScore?.toFixed(0) || 0}%</span>
 </div>
 </div>
 <Button
 size="sm"
 variant="ghost"
 onClick={() => {
 setRoadmap(rm);
 setActiveTab("roadmap");
 }}
 >
 Görüntüle
 </Button>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 ) : (
 <div className="text-center py-8 text-muted-foreground">
 <p className="text-sm">Henüz yol haritası oluşturulmamış</p>
 </div>
 )}
 </ScrollArea>
 </div>
 </div>
 </TabsContent>
 </Tabs>
 </CardContent>
 </Card>
 );
}
