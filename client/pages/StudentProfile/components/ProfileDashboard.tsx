import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Progress } from "@/components/atoms/Progress";
import { Badge } from "@/components/atoms/Badge";
import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { 
 TrendingUp, 
 Brain, 
 Heart, 
 Target, 
 Shield, 
 Activity,
 Sparkles,
 AlertCircle,
 CheckCircle2,
} from "lucide-react";
import { 
 RadarChart, 
 PolarGrid, 
 PolarAngleAxis, 
 PolarRadiusAxis, 
 Radar, 
 ResponsiveContainer,
 Tooltip
} from 'recharts';
import UnifiedProfileCard from "@/components/features/profile-sync/UnifiedProfileCard";
import ProfileChangeTimeline from "@/components/features/profile-sync/ProfileChangeTimeline";
import ConflictResolutionPanel from "@/components/features/profile-sync/ConflictResolutionPanel";
import ManualCorrectionPanel from "@/components/features/profile-sync/ManualCorrectionPanel";
import ConflictResolutionUI from "@/components/features/profile-sync/ConflictResolutionUI";

interface UnifiedScores {
 akademikSkor: number;
 sosyalDuygusalSkor: number;
 davranissalSkor: number;
 motivasyonSkor: number;
 riskSkoru: number;
 protectiveScore?: number;
 healthScore?: number;
 talentsScore?: number;
}

interface ProfileCompleteness {
 overall: number;
 akademikProfil: number;
 sosyalDuygusalProfil: number;
 yetenekIlgiProfil: number;
 saglikProfil: number;
 davranisalProfil: number;
 eksikAlanlar: Array<{ kategori: string; alanlar: string[] }>;
}

interface ProfileDashboardProps {
 studentId: string;
 scores?: UnifiedScores | null;
 completeness?: ProfileCompleteness | null;
 isLoading?: boolean;
}

const ScoreCard = ({ 
 title, 
 score, 
 icon: Icon, 
 color 
}: { 
 title: string; 
 score: number; 
 icon: any; 
 color: string;
}) => {
 const getScoreLabel = (score: number) => {
 if (score >= 80) return { label:"Çok İyi", color:"text-green-600", gradient:"bg-gradient-to-br from-green-500 to-green-600" };
 if (score >= 60) return { label:"İyi", color:"text-blue-600", gradient:"bg-gradient-to-br from-blue-500 to-blue-600" };
 if (score >= 40) return { label:"Orta", color:"text-yellow-600", gradient:"bg-gradient-to-br from-yellow-500 to-yellow-600" };
 return { label:"Gelişmeli", color:"text-red-600", gradient:"bg-gradient-to-br from-red-500 to-red-600" };
 };

 const scoreInfo = getScoreLabel(score);

 return (
 <Card className="relative overflow-hidden">
 <div className={`absolute inset-0 opacity-5 ${scoreInfo.gradient}`} />
 <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
 <CardTitle className="text-sm font-medium text-muted-foreground">
 {title}
 </CardTitle>
 <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
 <Icon className="h-4 w-4" />
 </div>
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{Math.round(score)}</div>
 <div className="flex items-center gap-2 mt-2">
 <Progress value={score} className="h-2 flex-1" />
 </div>
 <div className={`text-xs ${scoreInfo.color} mt-1 font-medium`}>{scoreInfo.label}</div>
 </CardContent>
 </Card>
 );
};

export function ProfileDashboard({ 
 studentId, 
 scores, 
 completeness,
 isLoading 
}: ProfileDashboardProps) {

 const radarData = useMemo(() => {
 if (!scores) return [];
 
 return [
 { 
 subject: 'Akademik', 
 value: scores.akademikSkor || 0,
 fullMark: 100 
 },
 { 
 subject: 'Sosyal-Duygusal', 
 value: scores.sosyalDuygusalSkor || 0,
 fullMark: 100 
 },
 { 
 subject: 'Davranışsal', 
 value: scores.davranissalSkor || 0,
 fullMark: 100 
 },
 { 
 subject: 'Motivasyon', 
 value: scores.motivasyonSkor || 0,
 fullMark: 100 
 },
 { 
 subject: 'Yetenek', 
 value: scores.talentsScore || 0,
 fullMark: 100 
 },
 { 
 subject: 'Sağlık', 
 value: scores.healthScore || 0,
 fullMark: 100 
 },
 ];
 }, [scores]);

 const overallScore = useMemo(() => {
 if (!scores) return 0;
 const values = [
 scores.akademikSkor,
 scores.sosyalDuygusalSkor,
 scores.davranissalSkor,
 scores.motivasyonSkor,
 scores.talentsScore || 0,
 scores.healthScore || 0,
 ].filter(v => v > 0);
 
 return values.length > 0 
 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
 : 0;
 }, [scores]);

 if (isLoading) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Profil Analizi Yükleniyor...</CardTitle>
 </CardHeader>
 <CardContent>
 <div className=" space-y-3">
 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
 <div className="h-4 bg-gray-200 rounded w-1/2"></div>
 </div>
 </CardContent>
 </Card>
 );
 }

 return (
 <div className="space-y-4">
 {/* Canlı Profil Kartı - YENİ! */}
 <UnifiedProfileCard studentId={studentId} />


 {/* Manuel Düzeltme ve Çelişki Çözüm Araçları - YENİ! */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <div>
 <ManualCorrectionPanel studentId={studentId} />
 </div>
 <div>
 <ConflictResolutionUI studentId={studentId} />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Profil Değişim Geçmişi - YENİ! */}
 <div className="md:col-span-2">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div className="lg:col-span-2">
 <ProfileChangeTimeline studentId={studentId} />
 </div>
 <div>
 <ConflictResolutionPanel studentId={studentId} />
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Sparkles className="h-5 w-5 text-primary" />
 Genel Profil Skoru
 </CardTitle>
 <CardDescription>
 Tüm değerlendirmelerin ortalaması
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="flex items-center justify-center">
 <div className="relative w-32 h-32">
 <svg className="w-32 h-32 transform -rotate-90">
 <circle
 cx="64"
 cy="64"
 r="56"
 stroke="currentColor"
 strokeWidth="8"
 fill="transparent"
 className="text-gray-200"
 />
 <circle
 cx="64"
 cy="64"
 r="56"
 stroke="currentColor"
 strokeWidth="8"
 fill="transparent"
 strokeDasharray={`${(overallScore / 100) * 351.86} 351.86`}
 className="text-primary"
 />
 </svg>
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <span className="text-3xl font-bold">{overallScore}</span>
 <span className="text-xs text-muted-foreground">/ 100</span>
 </div>
 </div>
 </div>
 {completeness && (
 <div className="mt-4 space-y-2">
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">Profil Tamamlama</span>
 <span className="font-semibold">{completeness.overall}%</span>
 </div>
 <Progress value={completeness.overall} className="h-2" />
 </div>
 )}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Target className="h-5 w-5 text-primary" />
 Çok Boyutlu Profil
 </CardTitle>
 <CardDescription>
 6 farklı boyutta değerlendirme
 </CardDescription>
 </CardHeader>
 <CardContent>
 {radarData.length > 0 ? (
 <ResponsiveContainer width="100%" height={200}>
 <RadarChart data={radarData}>
 <PolarGrid />
 <PolarAngleAxis 
 dataKey="subject" 
 tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
 />
 <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
 <Radar
 name="Skor"
 dataKey="value"
 stroke="hsl(var(--primary))"
 fill="hsl(var(--primary))"
 fillOpacity={0.6}
 />
 <Tooltip 
 content={({ payload }) => {
 if (payload && payload.length > 0) {
 return (
 <div className="bg-background border rounded-lg p-2">
 <p className="text-sm font-semibold">{payload[0].payload.subject}</p>
 <p className="text-sm text-primary">{payload[0].value}/100</p>
 </div>
 );
 }
 return null;
 }}
 />
 </RadarChart>
 </ResponsiveContainer>
 ) : (
 <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
 Henüz yeterli veri yok
 </div>
 )}
 </CardContent>
 </Card>
 </div>

 {scores && (
 <Card>
 <CardHeader>
 <CardTitle>Detaylı Skorlar</CardTitle>
 <CardDescription>
 Her boyut için standardize edilmiş 0-100 arası skorlar
 </CardDescription>
 </CardHeader>
 <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <ScoreCard
 title="Akademik Yeterlilik"
 score={scores.akademikSkor || 0}
 icon={TrendingUp}
 color="bg-blue-100 text-blue-600"
 />
 <ScoreCard
 title="Sosyal-Duygusal"
 score={scores.sosyalDuygusalSkor || 0}
 icon={Heart}
 color="bg-pink-100 text-pink-600"
 />
 <ScoreCard
 title="Davranışsal Uyum"
 score={scores.davranissalSkor || 0}
 icon={CheckCircle2}
 color="bg-green-100 text-green-600"
 />
 <ScoreCard
 title="Motivasyon Seviyesi"
 score={scores.motivasyonSkor || 0}
 icon={Target}
 color="bg-purple-100 text-purple-600"
 />
 {scores.talentsScore !== undefined && (
 <ScoreCard
 title="Yetenek & İlgi"
 score={scores.talentsScore}
 icon={Sparkles}
 color="bg-yellow-100 text-yellow-600"
 />
 )}
 {scores.healthScore !== undefined && (
 <ScoreCard
 title="Sağlık & Wellness"
 score={scores.healthScore}
 icon={Activity}
 color="bg-teal-100 text-teal-600"
 />
 )}
 </CardContent>
 </Card>
 )}

 {scores && scores.riskSkoru > 0 && (
 <Alert variant={scores.riskSkoru > 60 ?"destructive" :"default"}>
 <Shield className="h-4 w-4" />
 <AlertDescription>
 <strong>Risk Seviyesi:</strong> {Math.round(scores.riskSkoru)}/100
 {scores.riskSkoru > 60 &&" - Yüksek risk, müdahale önerilir"}
 {scores.riskSkoru <= 60 && scores.riskSkoru > 30 &&" - Orta risk, takip edilmeli"}
 {scores.riskSkoru <= 30 &&" - Düşük risk"}
 </AlertDescription>
 </Alert>
 )}

 {completeness && completeness.eksikAlanlar && completeness.eksikAlanlar.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-orange-600">
 <AlertCircle className="h-5 w-5" />
 Eksik Profil Alanları
 </CardTitle>
 <CardDescription>
 Daha iyi analiz için bu alanları tamamlayın
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 {completeness.eksikAlanlar.map((kategori, idx) => (
 <div key={idx} className="space-y-1">
 <div className="font-semibold text-sm">{kategori.kategori}</div>
 <div className="flex flex-wrap gap-1">
 {kategori.alanlar.map((alan, alanIdx) => (
 <Badge key={alanIdx} variant="outline" className="text-xs">
 {alan}
 </Badge>
 ))}
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 )}
 </div>
 );
}
