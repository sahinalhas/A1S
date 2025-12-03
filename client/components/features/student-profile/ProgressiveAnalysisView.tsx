/**
 * Progressive Analysis View
 * Aşamalı veri yükleme ile öğrenci analizi görünümü
 */

import { Button } from '@/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Progress } from '@/components/atoms/Progress';
import { Skeleton } from '@/components/atoms/Skeleton';
import { useStreamingAnalysis } from '@/hooks/useStreamingAnalysis';
import {
 User,
 BookOpen,
 Heart,
 Brain,
 TrendingUp,
 Clock,
 AlertCircle,
 CheckCircle2,
 Loader2,
 Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProgressiveAnalysisViewProps {
 studentId: string;
 includeAI?: boolean;
}

export function ProgressiveAnalysisView({ 
 studentId, 
 includeAI = false 
}: ProgressiveAnalysisViewProps) {
 const { analysis, isStreaming, progress, startStreaming, error } = useStreamingAnalysis(
 studentId,
 {
 includeAI,
 onProgress: (p) => {
 if (p === 100) {
 toast.success('Analiz tamamlandı!');
 }
 },
 onError: (err) => {
 toast.error(`Hata: ${err}`);
 },
 }
 );

 return (
 <div className="space-y-6">
 {/* Header & Progress */}
 <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="flex items-center gap-2">
 <Sparkles className="h-5 w-5 text-primary" />
 Aşamalı Analiz
 </CardTitle>
 <CardDescription>
 Veri parça parça yükleniyor, hiçbir şey kaçmayacak
 </CardDescription>
 </div>
 {!isStreaming && !analysis.isComplete && (
 <Button onClick={startStreaming} size="sm">
 <Loader2 className="h-4 w-4 mr-2" />
 Analizi Başlat
 </Button>
 )}
 </div>
 </CardHeader>
 {(isStreaming || analysis.progress > 0) && (
 <CardContent>
 <div className="space-y-2">
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">İlerleme</span>
 <span className="font-medium">{progress}%</span>
 </div>
 <Progress value={progress} className="h-2" />
 {analysis.isComplete && (
 <div className="flex items-center gap-2 text-sm text-green-600">
 <CheckCircle2 className="h-4 w-4" />
 Tamamlandı
 </div>
 )}
 </div>
 </CardContent>
 )}
 </Card>

 {/* Error Display */}
 {error && (
 <Card className="border-destructive/50 bg-destructive/5">
 <CardContent className="pt-6">
 <div className="flex items-center gap-2 text-destructive">
 <AlertCircle className="h-5 w-5" />
 <span>{error}</span>
 </div>
 </CardContent>
 </Card>
 )}

 {/* 1. Basic Info (en hızlı - 50ms) */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <User className="h-5 w-5" />
 Temel Bilgiler
 </CardTitle>
 </CardHeader>
 <CardContent>
 {analysis.basic ? (
 <div className="grid gap-4 md:grid-cols-2">
 <div>
 <p className="text-sm text-muted-foreground">Ad Soyad</p>
 <p className="font-medium">{analysis.basic.name}</p>
 </div>
 <div>
 <p className="text-sm text-muted-foreground">Öğrenci No</p>
 <p className="font-medium">{analysis.basic.studentNumber}</p>
 </div>
 <div>
 <p className="text-sm text-muted-foreground">Sınıf</p>
 <p className="font-medium">
 {analysis.basic.grade}. Sınıf {analysis.basic.className && `- ${analysis.basic.className}`}
 </p>
 </div>
 <div>
 <p className="text-sm text-muted-foreground">Son Güncelleme</p>
 <p className="font-medium text-sm">
 {new Date(analysis.basic.lastUpdated).toLocaleDateString('tr-TR')}
 </p>
 </div>
 </div>
 ) : (
 <div className="space-y-3">
 <Skeleton className="h-16 w-full" />
 <Skeleton className="h-16 w-full" />
 </div>
 )}
 </CardContent>
 </Card>

 {/* 2. Academic Summary (200ms) */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <BookOpen className="h-5 w-5" />
 Akademik Performans
 </CardTitle>
 </CardHeader>
 <CardContent>
 {analysis.academic ? (
 <div className="space-y-4">
 <div className="grid gap-4 md:grid-cols-3">
 <div className="p-3 bg-primary/5 rounded-lg">
 <p className="text-sm text-muted-foreground">Ortalama</p>
 <p className="text-2xl font-bold">{analysis.academic.gpa.toFixed(1)}</p>
 </div>
 <div className="p-3 bg-primary/5 rounded-lg">
 <p className="text-sm text-muted-foreground">Not Sayısı</p>
 <p className="text-2xl font-bold">{analysis.academic.gradeCount}</p>
 </div>
 <div className="p-3 bg-primary/5 rounded-lg">
 <p className="text-sm text-muted-foreground">Devamsızlık</p>
 <p className="text-2xl font-bold">{analysis.academic.averageAttendance.toFixed(0)}%</p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <TrendingUp className="h-4 w-4" />
 <span className="text-sm font-medium">Trend:</span>
 <Badge
 variant={
 analysis.academic.recentTrend === 'DECLINING'
 ? 'destructive'
 : 'default'
 }
 className={
 analysis.academic.recentTrend === 'IMPROVING'
 ? 'bg-green-100 text-green-800'
 : ''
 }
 >
 {analysis.academic.recentTrend === 'IMPROVING' && 'İyileşiyor'}
 {analysis.academic.recentTrend === 'STABLE' && 'Stabil'}
 {analysis.academic.recentTrend === 'DECLINING' && 'Düşüyor'}
 </Badge>
 </div>

 {analysis.academic.strongSubjects.length > 0 && (
 <div>
 <p className="text-sm font-medium mb-2">Güçlü Dersler</p>
 <div className="flex flex-wrap gap-2">
 {analysis.academic.strongSubjects.map((subject) => (
 <Badge 
 key={subject} 
 variant="default"
 className="bg-green-100 text-green-800"
 >
 {subject}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {analysis.academic.weakSubjects.length > 0 && (
 <div>
 <p className="text-sm font-medium mb-2">Geliştirilmesi Gereken Dersler</p>
 <div className="flex flex-wrap gap-2">
 {analysis.academic.weakSubjects.map((subject) => (
 <Badge key={subject} variant="secondary">
 {subject}
 </Badge>
 ))}
 </div>
 </div>
 )}
 </div>
 ) : (
 <div className="space-y-3">
 <Skeleton className="h-24 w-full" />
 <Skeleton className="h-16 w-full" />
 </div>
 )}
 </CardContent>
 </Card>

 {/* 3. Behavior Summary (300ms) */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Heart className="h-5 w-5" />
 Davranış Analizi
 </CardTitle>
 </CardHeader>
 <CardContent>
 {analysis.behavior ? (
 <div className="space-y-4">
 <div className="grid gap-4 md:grid-cols-3">
 <div className="p-3 bg-primary/5 rounded-lg">
 <p className="text-sm text-muted-foreground">Davranış Puanı</p>
 <p className="text-2xl font-bold">{analysis.behavior.behaviorScore}</p>
 </div>
 <div className="p-3 bg-green-50 rounded-lg">
 <p className="text-sm text-muted-foreground">Pozitif Olay</p>
 <p className="text-2xl font-bold text-green-600">
 {analysis.behavior.positiveIncidents}
 </p>
 </div>
 <div className="p-3 bg-red-50 rounded-lg">
 <p className="text-sm text-muted-foreground">Negatif Olay</p>
 <p className="text-2xl font-bold text-red-600">
 {analysis.behavior.negativeIncidents}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <Clock className="h-4 w-4" />
 <span className="text-sm font-medium">Genel Trend:</span>
 <Badge
 variant={
 analysis.behavior.overallTrend === 'CONCERNING'
 ? 'destructive'
 : 'default'
 }
 className={
 analysis.behavior.overallTrend === 'IMPROVING'
 ? 'bg-green-100 text-green-800'
 : ''
 }
 >
 {analysis.behavior.overallTrend === 'IMPROVING' && 'İyileşiyor'}
 {analysis.behavior.overallTrend === 'STABLE' && 'Stabil'}
 {analysis.behavior.overallTrend === 'CONCERNING' && 'Dikkat'}
 </Badge>
 </div>

 <div className="text-sm text-muted-foreground">
 Toplam {analysis.behavior.counselingSessionCount} görüşme yapıldı
 </div>
 </div>
 ) : (
 <div className="space-y-3">
 <Skeleton className="h-24 w-full" />
 <Skeleton className="h-12 w-full" />
 </div>
 )}
 </CardContent>
 </Card>

 {/* 4-6. AI Analyses (opsiyonel - yavaş) */}
 {includeAI && (
 <>
 {/* Psychological Analysis */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Brain className="h-5 w-5" />
 Psikolojik Analiz
 </CardTitle>
 </CardHeader>
 <CardContent>
 {analysis.psychological ? (
 <div className="text-sm">
 <p className="text-muted-foreground">AI destekli psikolojik analiz tamamlandı</p>
 {/* Detaylar burada gösterilebilir */}
 </div>
 ) : isStreaming ? (
 <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
 <Loader2 className="h-4 w-4" />
 <span>AI psikolojik analizi yapılıyor...</span>
 </div>
 ) : (
 <Skeleton className="h-32 w-full" />
 )}
 </CardContent>
 </Card>

 {/* Predictive & Timeline - Benzer şekilde */}
 </>
 )}
 </div>
 );
}
