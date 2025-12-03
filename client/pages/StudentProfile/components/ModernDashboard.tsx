/**
 * Modern Student Dashboard - 2025 Simplified Edition
 * Sadece özet bilgiler ve hızlı aksiyonlar - detaylar ilgili sekmelerde
 * 
 * Tasarım İlkeleri:
 * - Her bilgi tek bir yerde (bilgi tekrarı YOK)
 * - Sadece KPI'lar ve özet metrikler
 * - Hızlı aksiyonlar için butonlar
 * - Sezgisel ve minimal tasarım
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";

import { Progress } from "@/components/atoms/Progress";
import { 
 Bot, 
 FileText, 
 Shield, 
 TrendingUp, 
 Heart, 
 Target, 
 Activity,
 BookOpen,
 AlertTriangle,
 Sparkles,
 ArrowRight,
 TrendingDown,
 User,
 Clock,
 CheckCircle2,
 ExternalLink
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { Student } from "@/lib/storage";
import { useLiveProfile } from "@/hooks/features/live-profile/live-profile.hooks";
import { cn } from "@/lib/utils";

interface ModernDashboardProps {
 student: Student;
 studentId: string;
 scoresData?: any;
 loadingScores?: boolean;
}

interface MetricCardProps {
 title: string;
 score: number;
 icon: React.ElementType;
 color: string;
 bgGradient: string;
 description?: string;
 trend?: 'up' | 'down' | 'stable';
 trendValue?: number;
 onClick?: () => void;
}

const MetricCard = ({ title, score, icon: Icon, color, bgGradient, description, trend, trendValue, onClick }: MetricCardProps) => {
 const getTrendIcon = () => {
 if (trend === 'up') return <TrendingUp className="h-3 w-3 text-emerald-600" />;
 if (trend === 'down') return <TrendingDown className="h-3 w-3 text-red-600" />;
 return null;
 };

 return (
 <Card 
 className={cn(
"relative overflow-hidden",
 onClick &&"cursor-pointer"
 )}
 onClick={onClick}
 >
 <div className={`absolute inset-0 ${bgGradient} opacity-5`}></div>
 
 <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
 <CardTitle className="text-sm font-medium text-muted-foreground">
 {title}
 </CardTitle>
 <div className={`p-2 rounded-lg ${bgGradient} bg-opacity-10`}>
 <Icon className="h-4 w-4" />
 </div>
 </CardHeader>
 <CardContent className="relative">
 <div className="text-2xl font-bold">{Math.round(score)}</div>
 {description && (
 <p className="text-xs text-muted-foreground mt-1">
 {description}
 </p>
 )}
 {trend && trendValue !== undefined && (
 <div className="flex items-center gap-1 mt-2">
 {getTrendIcon()}
 <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
 {trend === 'up' ? '+' : ''}{trendValue}%
 </span>
 </div>
 )}
 {onClick && (
 <div className="flex items-center gap-1 mt-2 text-xs text-primary">
 Detaylara git <ArrowRight className="h-3 w-3" />
 </div>
 )}
 </CardContent>
 </Card>
 );
};

export function ModernDashboard({ 
 student, 
 studentId, 
 scoresData,
 loadingScores 
}: ModernDashboardProps) {
 const navigate = useNavigate();
 const { identity } = useLiveProfile(studentId);


 const handleGenerateReport = () => {
 navigate(`/ai-asistan?student=${studentId}&action=report`);
 };

 const scores = scoresData || {
 akademikSkor: 0,
 sosyalDuygusalSkor: 0,
 motivasyonSkor: 0,
 riskSkoru: 0,
 };

 const completeness = scoresData?.completeness?.overall ?? 0;

 return (
 <div className="space-y-8">
 {/* Mini Profil Özeti */}
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
 <User className="h-6 w-6 text-primary" />
 </div>
 <div>
 <h2 className="text-2xl font-bold">Öğrenci Özeti</h2>
 <p className="text-sm text-muted-foreground">Genel durum ve hızlı erişim</p>
 </div>
 </div>
 </div>
 
 <Card className="relative overflow-hidden border border-border/50">
 <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl -z-10"></div>
 
 <CardContent className="p-6">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {/* Öğrenci Durumu */}
 <div className="space-y-3">
 <div className="flex items-center gap-2">
 <div className={cn(
"p-2 rounded-lg",
 identity?.interventionPriority === 'critical' ? 'bg-red-500/10' : 
 identity?.interventionPriority === 'high' ? 'bg-orange-500/10' :
 'bg-green-500/10'
 )}>
 <Shield className={cn(
"h-4 w-4",
 identity?.interventionPriority === 'critical' ? 'text-red-600' : 
 identity?.interventionPriority === 'high' ? 'text-orange-600' :
 'text-green-600'
 )} />
 </div>
 <div>
 <p className="text-xs text-muted-foreground">Durum</p>
 <p className="text-sm font-semibold">
 {identity?.interventionPriority === 'critical' ? 'Kritik' :
 identity?.interventionPriority === 'high' ? 'Yüksek Risk' :
 identity?.interventionPriority === 'medium' ? 'Orta Risk' :
 'İyi Durum'}
 </p>
 </div>
 </div>
 </div>

 {/* Profil Tamlığı */}
 <div className="space-y-3">
 <div className="flex items-center gap-2">
 <div className="p-2 rounded-lg bg-blue-500/10">
 <CheckCircle2 className="h-4 w-4 text-blue-600" />
 </div>
 <div className="flex-1">
 <p className="text-xs text-muted-foreground">Profil Tamlığı</p>
 <div className="flex items-center gap-2">
 <Progress value={completeness} className="h-2 flex-1" />
 <span className="text-sm font-semibold">{Math.round(completeness)}%</span>
 </div>
 </div>
 </div>
 </div>

 {/* Son Güncelleme */}
 <div className="space-y-3">
 <div className="flex items-center gap-2">
 <div className="p-2 rounded-lg bg-purple-500/10">
 <Clock className="h-4 w-4 text-purple-600" />
 </div>
 <div>
 <p className="text-xs text-muted-foreground">Son Güncelleme</p>
 <p className="text-sm font-semibold">
 {identity?.lastUpdated 
 ? new Date(identity.lastUpdated).toLocaleDateString('tr-TR')
 : 'Henüz güncellenmedi'}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* AI Özet - Sadece tek satır */}
 {identity?.summary && (
 <div className="mt-4 pt-4 border-t">
 <p className="text-sm text-muted-foreground italic">
"{identity.summary}"
 </p>
 </div>
 )}
 </CardContent>
 </Card>
 </div>

 {/* Performans Metrikleri - KPI Kartları */}
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
 <Activity className="h-6 w-6 text-primary" />
 </div>
 <div>
 <h2 className="text-2xl font-bold">Performans Göstergeleri</h2>
 <p className="text-sm text-muted-foreground">Özet metrikler - detaylar ilgili sekmelerde</p>
 </div>
 </div>
 </div>
 
 {loadingScores ? (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
 {[1, 2, 3, 4].map((i) => (
 <Card key={i} className="border-2">
 <CardContent className="p-6">
 <div className=" space-y-4">
 <div className="h-16 w-16 bg-muted rounded-2xl"></div>
 <div className="h-4 bg-muted rounded w-3/4"></div>
 <div className="h-12 bg-muted rounded w-1/2"></div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
 <MetricCard
 title="Akademik Performans"
 score={scores.akademikSkor || 0}
 icon={BookOpen}
 color="text-blue-600"
 bgGradient="bg-gradient-to-br from-blue-500 to-cyan-500"
 description="Not ortalaması ve başarı"
 trend="up"
 trendValue={5}
 onClick={() => navigate(`/ogrenci/${studentId}#akademik`)}
 />
 <MetricCard
 title="Sosyal-Duygusal"
 score={scores.sosyalDuygusalSkor || 0}
 icon={Heart}
 color="text-pink-600"
 bgGradient="bg-gradient-to-br from-pink-500 to-rose-500"
 description="Duygusal zeka ve sosyal beceriler"
 trend="stable"
 onClick={() => navigate(`/ogrenci/${studentId}#gelisim`)}
 />
 <MetricCard
 title="Motivasyon"
 score={scores.motivasyonSkor || 0}
 icon={Target}
 color="text-purple-600"
 bgGradient="bg-gradient-to-br from-purple-500 to-fuchsia-500"
 description="Öğrenme isteği ve hedef odaklılık"
 trend="up"
 trendValue={8}
 onClick={() => navigate(`/ogrenci/${studentId}#gelisim`)}
 />
 <MetricCard
 title="Genel Durum"
 score={100 - (scores.riskSkoru || 0)}
 icon={Shield}
 color={scores.riskSkoru > 60 ?"text-red-600" : scores.riskSkoru > 30 ?"text-amber-600" :"text-emerald-600"}
 bgGradient={
 scores.riskSkoru > 60 
 ?"bg-gradient-to-br from-red-500 to-orange-500" 
 : scores.riskSkoru > 30 
 ?"bg-gradient-to-br from-amber-500 to-yellow-500" 
 :"bg-gradient-to-br from-emerald-500 to-green-500"
 }
 description={
 scores.riskSkoru > 60 
 ?"Yüksek risk - acil müdahale" 
 : scores.riskSkoru > 30 
 ?"Orta risk - yakın takip" 
 :"Düşük risk - stabil durum"
 }
 onClick={() => navigate(`/ogrenci/${studentId}#risk`)}
 />
 </div>
 )}
 </div>

 {/* Hızlı Aksiyonlar */}
 <div className="space-y-6">
 <div className="flex items-center gap-3">
 <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
 <Sparkles className="h-6 w-6 text-primary" />
 </div>
 <div>
 <h2 className="text-2xl font-bold">Hızlı İşlemler</h2>
 <p className="text-sm text-muted-foreground">AI destekli araçlar ve raporlama</p>
 </div>
 </div>
 
 <Card>
 <CardContent className="p-6">
 <div className="grid grid-cols-1 gap-4">
 <Button
 onClick={handleGenerateReport}
 variant="outline"
 className="h-auto py-4 flex flex-col items-start gap-2"
 >
 <div className="flex items-center gap-2 w-full">
 <FileText className="h-5 w-5 text-primary" />
 <span className="font-semibold">Rapor Oluştur</span>
 </div>
 <span className="text-xs text-muted-foreground text-left">
 AI ile otomatik rapor hazırla
 </span>
 </Button>

 </div>
 </CardContent>
 </Card>
 </div>

 {/* Yüksek Risk Uyarısı */}
 {scores.riskSkoru > 60 && (
 <Card className="border-2 border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
 <CardHeader>
 <CardTitle className="flex items-center gap-3 text-red-700 dark:text-red-400">
 <div className="p-2 bg-red-500/10 rounded-lg">
 <AlertTriangle className="h-5 w-5 text-red-600" />
 </div>
 Yüksek Risk Uyarısı
 </CardTitle>
 </CardHeader>
 
 <CardContent>
 <p className="text-sm text-muted-foreground mb-4">
 Bu öğrenci için risk skoru kritik seviyede ({Math.round(scores.riskSkoru)}/100). 
 Derhal <strong>Risk & Müdahale</strong> sekmesini inceleyip müdahale planı oluşturun.
 </p>
 
 <div className="flex gap-3">
 <Button 
 onClick={() => navigate(`/ogrenci/${studentId}#risk`)}
 variant="destructive"
 className="gap-2"
 >
 <Shield className="h-4 w-4" />
 Risk Sekmesine Git
 </Button>
 </div>
 </CardContent>
 </Card>
 )}
 </div>
 );
}
