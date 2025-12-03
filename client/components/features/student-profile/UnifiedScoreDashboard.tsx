/**
 * Unified Score Dashboard
 * Birleşik Skor Gösterge Paneli
 * 
 * Akademik, sosyal, davranışsal skorları görselleştirir
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Progress } from "@/components/atoms/Progress";
import { Badge } from "@/components/atoms/Badge";
import { 
 GraduationCap, 
 Heart, 
 Users, 
 TrendingUp, 
 AlertTriangle,
 Target
} from "lucide-react";

interface UnifiedScores {
 akademikSkor: number;
 sosyalDuygusalSkor: number;
 davranissalSkor: number;
 motivasyonSkor: number;
 riskSkoru: number;
 lastUpdated: string;
}

interface UnifiedScoreDashboardProps {
 scores: UnifiedScores;
 studentName: string;
}

export function UnifiedScoreDashboard({ scores, studentName }: UnifiedScoreDashboardProps) {
 const getScoreColor = (score: number) => {
 if (score >= 80) return { bg:"bg-green-500", text:"text-green-600", badge:"default" };
 if (score >= 60) return { bg:"bg-blue-500", text:"text-blue-600", badge:"secondary" };
 if (score >= 40) return { bg:"bg-yellow-500", text:"text-yellow-600", badge:"outline" };
 return { bg:"bg-red-500", text:"text-red-600", badge:"destructive" };
 };

 const getScoreLabel = (score: number) => {
 if (score >= 80) return"Güçlü";
 if (score >= 60) return"İyi";
 if (score >= 40) return"Geliştirilmeli";
 return"Destek Gerekli";
 };

 const getRiskLabel = (score: number) => {
 if (score >= 80) return"Düşük Risk";
 if (score >= 60) return"Orta Risk";
 if (score >= 40) return"Yüksek Risk";
 return"Kritik Risk";
 };

 const scoreCards = [
 {
 title:"Akademik Performans",
 icon: GraduationCap,
 score: scores.akademikSkor,
 description:"Not ortalaması, ders başarısı ve çalışma becerileri"
 },
 {
 title:"Sosyal-Duygusal Gelişim",
 icon: Heart,
 score: scores.sosyalDuygusalSkor,
 description:"Empati, öz-farkındalık, duygu düzenlemesi"
 },
 {
 title:"Davranışsal Durum",
 icon: Users,
 score: scores.davranissalSkor,
 description:"Sınıf davranışı, kurallara uyum, akran ilişkileri"
 },
 {
 title:"Motivasyon Düzeyi",
 icon: TrendingUp,
 score: scores.motivasyonSkor,
 description:"İçsel motivasyon, hedef belirleme, sebat"
 }
 ];

 const overallScore = Math.round(
 (scores.akademikSkor + scores.sosyalDuygusalSkor + scores.davranissalSkor + scores.motivasyonSkor) / 4
 );

 return (
 <div className="space-y-4">
 {/* Genel Durum Kartı */}
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="text-2xl">{studentName} - Genel Durum</CardTitle>
 <CardDescription>
 Nesnel değerlendirme skorları
 <span className="block text-xs mt-1">
 Son güncelleme: {new Date(scores.lastUpdated).toLocaleDateString('tr-TR')}
 </span>
 </CardDescription>
 </div>
 <div className="text-center">
 <div className={`text-5xl font-bold ${getScoreColor(overallScore).text}`}>
 {overallScore}
 </div>
 <Badge variant={getScoreColor(overallScore).badge as any} className="mt-2">
 {getScoreLabel(overallScore)}
 </Badge>
 </div>
 </div>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 <div className="flex items-center justify-between text-sm">
 <span className="font-medium">Genel Performans</span>
 <span className="text-muted-foreground">{overallScore}/100</span>
 </div>
 <div className="relative">
 <Progress value={overallScore} className="h-4" />
 <div 
 className={`absolute top-0 left-0 h-4 rounded-full ${getScoreColor(overallScore).bg}`}
 style={{ width: `${overallScore}%` }}
 />
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Detaylı Skorlar */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {scoreCards.map((card) => {
 const Icon = card.icon;
 const colors = getScoreColor(card.score);
 
 return (
 <Card key={card.title}>
 <CardHeader className="pb-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Icon className={`h-5 w-5 ${colors.text}`} />
 <CardTitle className="text-lg">{card.title}</CardTitle>
 </div>
 <Badge variant={colors.badge as any}>
 {card.score}
 </Badge>
 </div>
 <CardDescription className="text-xs">
 {card.description}
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="relative">
 <Progress value={card.score} className="h-3" />
 <div 
 className={`absolute top-0 left-0 h-3 rounded-full ${colors.bg}`}
 style={{ width: `${card.score}%` }}
 />
 </div>
 <div className="mt-2 text-sm text-muted-foreground text-center">
 {getScoreLabel(card.score)}
 </div>
 </CardContent>
 </Card>
 );
 })}
 </div>

 {/* Risk Değerlendirmesi */}
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 {scores.riskSkoru < 60 ? (
 <AlertTriangle className="h-5 w-5 text-red-600" />
 ) : (
 <Target className="h-5 w-5 text-green-600" />
 )}
 <CardTitle>Risk Değerlendirmesi</CardTitle>
 </div>
 <Badge variant={getScoreColor(scores.riskSkoru).badge as any}>
 {getRiskLabel(scores.riskSkoru)}
 </Badge>
 </div>
 <CardDescription>
 Akademik, davranışsal ve sosyal risk faktörleri
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 <div className="flex items-center justify-between text-sm">
 <span className="font-medium">Risk Skoru (Tersine)</span>
 <span className={`font-bold ${getScoreColor(scores.riskSkoru).text}`}>
 {scores.riskSkoru}/100
 </span>
 </div>
 <div className="relative">
 <Progress value={scores.riskSkoru} className="h-3" />
 <div 
 className={`absolute top-0 left-0 h-3 rounded-full ${getScoreColor(scores.riskSkoru).bg}`}
 style={{ width: `${scores.riskSkoru}%` }}
 />
 </div>
 {scores.riskSkoru < 60 && (
 <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
 <p className="text-sm text-red-800">
 <strong>Dikkat:</strong> Risk seviyesi yüksek. Müdahale planı oluşturulması önerilir.
 </p>
 </div>
 )}
 {scores.riskSkoru >= 60 && scores.riskSkoru < 80 && (
 <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
 <p className="text-sm text-yellow-800">
 <strong>Bilgi:</strong> Düzenli takip önerilir.
 </p>
 </div>
 )}
 {scores.riskSkoru >= 80 && (
 <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
 <p className="text-sm text-green-800">
 <strong>Güzel:</strong> Öğrenci düşük risk grubunda. Destekleyici çalışmalara devam edilebilir.
 </p>
 </div>
 )}
 </div>
 </CardContent>
 </Card>

 {/* Yorumlama Notları */}
 <Card>
 <CardHeader>
 <CardTitle className="text-base">Skorların Yorumlanması</CardTitle>
 </CardHeader>
 <CardContent className="text-sm text-muted-foreground space-y-2">
 <p><strong>80-100:</strong> Güçlü performans. Mevcut başarının sürdürülmesi için destekleyici çalışmalar.</p>
 <p><strong>60-79:</strong> İyi performans. Bazı alanlarda gelişim fırsatları mevcut.</p>
 <p><strong>40-59:</strong> Geliştirilmeli. Hedefli müdahale programları önerilir.</p>
 <p><strong>0-39:</strong> Acil destek gerekli. Yoğun müdahale planı oluşturulmalı.</p>
 </CardContent>
 </Card>
 </div>
 );
}
