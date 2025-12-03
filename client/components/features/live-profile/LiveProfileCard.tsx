/**
 * Live Profile Card Component
 *"Öğrenci Kimdir?" - Canlı öğrenci kimlik kartı
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Progress } from "@/components/atoms/Progress";
import { Skeleton } from "@/components/atoms/Skeleton";
import { 
 User, 
 Brain, 
 TrendingUp, 
 AlertTriangle, 
 Lightbulb, 
 RefreshCw,
 Heart,
 BookOpen,
 Activity,
 Target,
 Clock
} from "lucide-react";
import { useLiveProfile } from "@/hooks/features/live-profile/live-profile.hooks";
import { cn } from "@/lib/utils";

interface LiveProfileCardProps {
 studentId: string;
 compact?: boolean;
}

export default function LiveProfileCard({ studentId, compact = false }: LiveProfileCardProps) {
 const { identity, isLoading, refresh, isRefreshing } = useLiveProfile(studentId);

 if (isLoading) {
 return (
 <Card className="border-2 border-blue-200">
 <CardHeader>
 <Skeleton className="h-6 w-2/3" />
 <Skeleton className="h-4 w-1/2 mt-2" />
 </CardHeader>
 <CardContent>
 <Skeleton className="h-20 w-full" />
 </CardContent>
 </Card>
 );
 }

 if (!identity) {
 return (
 <Card className="border-2 border-gray-200">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <User className="h-5 w-5" />
 Canlı Profil
 </CardTitle>
 <CardDescription>Profil henüz oluşturulmadı</CardDescription>
 </CardHeader>
 <CardContent>
 <Button onClick={() => refresh()} disabled={isRefreshing}>
 <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing &&"")} />
 Profil Oluştur
 </Button>
 </CardContent>
 </Card>
 );
 }

 const priorityColors = {
 low: 'bg-green-100 text-green-700 border-green-300',
 medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
 high: 'bg-orange-100 text-orange-700 border-orange-300',
 critical: 'bg-red-100 text-red-700 border-red-300',
 };

 const priorityIcons = {
 low: TrendingUp,
 medium: Target,
 high: AlertTriangle,
 critical: AlertTriangle,
 };

 const PriorityIcon = priorityIcons[identity.interventionPriority];

 return (
 <Card className="relative overflow-hidden border border-border/50 bg-gradient-to-br from-background via-background to-primary/5">
 {/* Subtle Background Accent */}
 <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10"></div>
 
 <CardHeader className="p-4 md:p-6">
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-2">
 <div className={cn(
"p-2 rounded-lg flex-shrink-0",
 identity.interventionPriority === 'critical' ? 'bg-red-500/10' : 
 identity.interventionPriority === 'high' ? 'bg-orange-500/10' :
 'bg-primary/10'
 )}>
 <User className={cn(
"h-4 w-4",
 identity.interventionPriority === 'critical' ? 'text-red-600' : 
 identity.interventionPriority === 'high' ? 'text-orange-600' :
 'text-primary'
 )} />
 </div>
 <CardTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent truncate">
 Canlı Öğrenci Profili
 </CardTitle>
 </div>
 
 <div className="flex items-center gap-2 text-xs text-muted-foreground">
 <Clock className="h-3 w-3 flex-shrink-0" />
 <span className="truncate">
 {new Date(identity.lastUpdated).toLocaleString('tr-TR', { 
 day: 'numeric', 
 month: 'short', 
 hour: '2-digit', 
 minute: '2-digit' 
 })}
 </span>
 </div>
 </div>
 
 <div className="flex items-center gap-1.5 flex-shrink-0">
 <Badge className={cn(
"text-xs font-medium px-2 py-0.5",
 priorityColors[identity.interventionPriority]
 )}>
 <PriorityIcon className="h-3 w-3 mr-1" />
 <span className="hidden sm:inline">
 {identity.interventionPriority === 'critical' ? 'KRİTİK' :
 identity.interventionPriority === 'high' ? 'YÜKSEK' :
 identity.interventionPriority === 'medium' ? 'ORTA' : 'NORMAL'}
 </span>
 <span className="sm:hidden">
 {identity.interventionPriority === 'critical' ? 'K' :
 identity.interventionPriority === 'high' ? 'Y' :
 identity.interventionPriority === 'medium' ? 'O' : 'N'}
 </span>
 </Badge>
 
 <Button 
 variant="ghost" 
 size="sm" 
 onClick={() => refresh()}
 disabled={isRefreshing}
 className="h-8 w-8 p-0"
 >
 <RefreshCw className={cn("h-4 w-4", isRefreshing &&"")} />
 </Button>
 </div>
 </div>
 </CardHeader>

 <CardContent className="space-y-4 p-4 md:p-6">
 {/* Kim Bu Öğrenci? */}
 <div className="bg-muted/30 rounded-lg p-3 md:p-4">
 <div className="flex items-start gap-2">
 <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
 <div className="flex-1 min-w-0">
 <h3 className="font-semibold text-sm mb-1.5">Kim Bu Öğrenci?</h3>
 <p className="text-sm text-muted-foreground leading-relaxed">{identity.summary}</p>
 </div>
 </div>
 </div>

 {/* Anlık Durum */}
 <div className="bg-muted/30 rounded-lg p-3 md:p-4">
 <div className="flex items-start gap-2">
 <Activity className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
 <div className="flex-1 min-w-0">
 <h3 className="font-semibold text-sm mb-1.5">Şu Anki Durum</h3>
 <p className="text-sm text-muted-foreground">{identity.currentState}</p>
 </div>
 </div>
 </div>

 {!compact && (
 <>
 {/* Profil Skorları */}
 <div className="grid grid-cols-2 gap-3">
 <div>
 <div className="flex items-center justify-between mb-1.5">
 <span className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
 <BookOpen className="h-3 w-3" />
 Akademik
 </span>
 <span className="text-xs font-bold">{identity.academicScore}%</span>
 </div>
 <Progress value={identity.academicScore} className="h-1.5" />
 </div>

 <div>
 <div className="flex items-center justify-between mb-1.5">
 <span className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
 <Heart className="h-3 w-3" />
 Sosyal-Duygusal
 </span>
 <span className="text-xs font-bold">{identity.socialEmotionalScore}%</span>
 </div>
 <Progress value={identity.socialEmotionalScore} className="h-1.5" />
 </div>

 <div>
 <div className="flex items-center justify-between mb-1.5">
 <span className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
 <Target className="h-3 w-3" />
 Motivasyon
 </span>
 <span className="text-xs font-bold">{identity.motivationScore}%</span>
 </div>
 <Progress value={identity.motivationScore} className="h-1.5" />
 </div>

 <div>
 <div className="flex items-center justify-between mb-1.5">
 <span className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
 <AlertTriangle className="h-3 w-3" />
 Risk Seviyesi
 </span>
 <span className="text-xs font-bold">{identity.riskLevel}%</span>
 </div>
 <Progress value={identity.riskLevel} className="h-1.5" />
 </div>
 </div>

 {/* Güçlü Yönler & Zorluklar */}
 <div className="grid grid-cols-2 gap-3">
 <div>
 <h4 className="font-semibold text-xs mb-1.5 flex items-center gap-1">
 <TrendingUp className="h-3 w-3 text-primary" />
 Güçlü Yönler
 </h4>
 <ul className="space-y-1">
 {identity.strengths.slice(0, 3).map((strength, idx) => (
 <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
 <span className="text-primary">•</span>
 <span className="flex-1">{strength}</span>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="font-semibold text-xs mb-1.5 flex items-center gap-1">
 <AlertTriangle className="h-3 w-3 text-orange-600" />
 Zorluklar
 </h4>
 <ul className="space-y-1">
 {identity.challenges.slice(0, 3).map((challenge, idx) => (
 <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
 <span className="text-orange-600">•</span>
 <span className="flex-1">{challenge}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>

 {/* AI Önerileri */}
 {identity.recommendedActions.length > 0 && (
 <div className="bg-muted/30 rounded-lg p-3">
 <h4 className="font-semibold text-xs mb-2 flex items-center gap-1">
 <Lightbulb className="h-3 w-3 text-primary" />
 AI Önerileri
 </h4>
 <ul className="space-y-1.5">
 {identity.recommendedActions.slice(0, 3).map((action, idx) => (
 <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
 <span className="text-primary font-bold flex-shrink-0">{idx + 1}.</span>
 <span className="flex-1">{action}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 </>
 )}
 </CardContent>
 </Card>
 );
}
