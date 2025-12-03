import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { interventionTrackingApi } from "@/lib/api/endpoints/intervention-tracking.api";
import type { InterventionEffectiveness } from "@/../../shared/types/notification.types";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Progress } from "@/components/atoms/Progress";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/atoms/Select";
import {
 TrendingUp,
 TrendingDown,
 Target,
 Brain,
 CheckCircle,
 AlertTriangle,
} from "lucide-react";

export default function InterventionTracking() {
 const [effectivenessFilter, setEffectivenessFilter] = useState<string>("all");

 const { data: effectiveness, isLoading } = useQuery({
 queryKey: ["intervention-effectiveness", effectivenessFilter],
 queryFn: async () => {
 return await interventionTrackingApi.getEffectiveness({
 effectivenessLevel: effectivenessFilter ==="all" ? undefined : effectivenessFilter,
 });
 },
 });

 const { data: stats } = useQuery({
 queryKey: ["intervention-stats"],
 queryFn: async () => {
 return await interventionTrackingApi.getEffectivenessStats();
 },
 });

 const getEffectivenessColor = (level?: string) => {
 switch (level) {
 case"VERY_EFFECTIVE":
 return"text-green-600 bg-green-50";
 case"EFFECTIVE":
 return"text-blue-600 bg-blue-50";
 case"PARTIALLY_EFFECTIVE":
 return"text-yellow-600 bg-yellow-50";
 case"NOT_EFFECTIVE":
 return"text-red-600 bg-red-50";
 default:
 return"text-gray-600 bg-gray-50";
 }
 };

 const getEffectivenessLabel = (level?: string) => {
 switch (level) {
 case"VERY_EFFECTIVE":
 return"Çok Etkili";
 case"EFFECTIVE":
 return"Etkili";
 case"PARTIALLY_EFFECTIVE":
 return"Kısmen Etkili";
 case"NOT_EFFECTIVE":
 return"Etkisiz";
 case"PENDING":
 return"Değerlendirme Bekleniyor";
 default:
 return"Bilinmiyor";
 }
 };

 const getImpactIcon = (value?: number) => {
 if (!value) return <Target className="h-4 w-4 text-gray-400" />;
 if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
 if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
 return <Target className="h-4 w-4 text-gray-400" />;
 };

 return (
 <div className="w-full max-w-7xl mx-auto py-6 space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold">Müdahale Etkinlik Takibi</h1>
 <p className="text-muted-foreground mt-2">
 AI destekli müdahale analizi ve etkinlik raporları
 </p>
 </div>
 <Select value={effectivenessFilter} onValueChange={setEffectivenessFilter}>
 <SelectTrigger className="w-[200px]">
 <SelectValue placeholder="Etkinlik filtrele" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tümü</SelectItem>
 <SelectItem value="VERY_EFFECTIVE">Çok Etkili</SelectItem>
 <SelectItem value="EFFECTIVE">Etkili</SelectItem>
 <SelectItem value="PARTIALLY_EFFECTIVE">Kısmen Etkili</SelectItem>
 <SelectItem value="NOT_EFFECTIVE">Etkisiz</SelectItem>
 <SelectItem value="PENDING">Bekleyen</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {stats && (
 <div className="grid gap-4 md:grid-cols-4">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">
 Toplam Müdahale
 </CardTitle>
 <Target className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{stats.total}</div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">
 Başarılı
 </CardTitle>
 <CheckCircle className="h-4 w-4 text-green-500" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{stats.effective}</div>
 <p className="text-xs text-muted-foreground">
 {stats.total > 0 ? Math.round((stats.effective / stats.total) * 100) : 0}% başarı oranı
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">
 İyileştirme Gereken
 </CardTitle>
 <AlertTriangle className="h-4 w-4 text-yellow-500" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{stats.needsImprovement}</div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">
 AI Analizi
 </CardTitle>
 <Brain className="h-4 w-4 text-purple-500" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{stats.withAiAnalysis}</div>
 <p className="text-xs text-muted-foreground">
 AI destekli analiz
 </p>
 </CardContent>
 </Card>
 </div>
 )}

 <div className="grid gap-6">
 {isLoading ? (
 <Card>
 <CardContent className="py-8 text-center text-muted-foreground">
 Yükleniyor...
 </CardContent>
 </Card>
 ) : !effectiveness || effectiveness.length === 0 ? (
 <Card>
 <CardContent className="py-8 text-center text-muted-foreground">
 Müdahale etkinlik verisi bulunamadı
 </CardContent>
 </Card>
 ) : (
 (effectiveness as InterventionEffectiveness[]).map((item) => (
 <Card key={item.id}>
 <CardHeader>
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <CardTitle className="text-xl">{item.interventionTitle}</CardTitle>
 <CardDescription className="mt-1">
 {item.interventionType} • {item.duration ? `${item.duration} gün` : 'Devam ediyor'}
 </CardDescription>
 </div>
 <Badge
 variant="outline"
 className={getEffectivenessColor(item.effectivenessLevel)}
 >
 {getEffectivenessLabel(item.effectivenessLevel)}
 </Badge>
 </div>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
 <div className="space-y-2">
 <div className="flex items-center justify-between text-sm">
 <span className="flex items-center gap-2">
 {getImpactIcon(item.academicImpact)}
 Akademik
 </span>
 <span className="font-medium">
 {item.academicImpact ? `${item.academicImpact > 0 ? '+' : ''}${item.academicImpact}%` : 'N/A'}
 </span>
 </div>
 {item.academicImpact && (
 <Progress value={Math.abs(item.academicImpact)} className="h-2" />
 )}
 </div>

 <div className="space-y-2">
 <div className="flex items-center justify-between text-sm">
 <span className="flex items-center gap-2">
 {getImpactIcon(item.behavioralImpact)}
 Davranışsal
 </span>
 <span className="font-medium">
 {item.behavioralImpact ? `${item.behavioralImpact > 0 ? '+' : ''}${item.behavioralImpact}%` : 'N/A'}
 </span>
 </div>
 {item.behavioralImpact && (
 <Progress value={Math.abs(item.behavioralImpact)} className="h-2" />
 )}
 </div>

 <div className="space-y-2">
 <div className="flex items-center justify-between text-sm">
 <span className="flex items-center gap-2">
 {getImpactIcon(item.attendanceImpact)}
 Devam
 </span>
 <span className="font-medium">
 {item.attendanceImpact ? `${item.attendanceImpact > 0 ? '+' : ''}${item.attendanceImpact}%` : 'N/A'}
 </span>
 </div>
 {item.attendanceImpact && (
 <Progress value={Math.abs(item.attendanceImpact)} className="h-2" />
 )}
 </div>

 <div className="space-y-2">
 <div className="flex items-center justify-between text-sm">
 <span className="flex items-center gap-2">
 {getImpactIcon(item.socialEmotionalImpact)}
 Sosyal-Duygusal
 </span>
 <span className="font-medium">
 {item.socialEmotionalImpact ? `${item.socialEmotionalImpact > 0 ? '+' : ''}${item.socialEmotionalImpact}%` : 'N/A'}
 </span>
 </div>
 {item.socialEmotionalImpact && (
 <Progress value={Math.abs(item.socialEmotionalImpact)} className="h-2" />
 )}
 </div>
 </div>

 {item.aiAnalysis && (
 <div className="rounded-lg bg-purple-50 p-4">
 <div className="flex items-start gap-2">
 <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
 <div className="flex-1">
 <h4 className="font-semibold text-purple-900 mb-1">AI Analizi</h4>
 <p className="text-sm text-purple-700">{item.aiAnalysis}</p>
 </div>
 </div>
 </div>
 )}

 {item.recommendations && (
 <div className="rounded-lg bg-blue-50 p-4">
 <h4 className="font-semibold text-blue-900 mb-2">Öneriler</h4>
 <p className="text-sm text-blue-700">{item.recommendations}</p>
 </div>
 )}

 <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
 <span>Başlangıç: {new Date(item.startDate).toLocaleDateString('tr-TR')}</span>
 {item.endDate && (
 <span>Bitiş: {new Date(item.endDate).toLocaleDateString('tr-TR')}</span>
 )}
 </div>
 </CardContent>
 </Card>
 ))
 )}
 </div>
 </div>
 );
}
