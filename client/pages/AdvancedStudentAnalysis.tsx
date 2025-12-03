/**
 * Advanced Student Analysis Page
 * Gelişmiş Öğrenci Analiz Sayfası
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { AlertTriangle } from 'lucide-react';
import { generateComprehensiveAnalysis } from '@/lib/api/endpoints/advanced-ai-analysis.api';

export default function AdvancedStudentAnalysis() {
 const { studentId } = useParams<{ studentId: string }>();
 
 const { data: analysis, isLoading, error } = useQuery({
 queryKey: ['comprehensive-analysis', studentId],
 queryFn: () => generateComprehensiveAnalysis(studentId!),
 enabled: !!studentId,
 staleTime: 10 * 60 * 1000
 });

 if (isLoading) {
 return (
 <div className="flex items-center justify-center h-96">
 <div className="text-center">
 <div className=" rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
 <p className="mt-4 text-muted-foreground">Kapsamlı analiz yapılıyor...</p>
 </div>
 </div>
 );
 }

 if (error || !analysis) {
 return (
 <div className="text-center py-12">
 <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
 <p className="text-red-600">Analiz oluşturulamadı</p>
 </div>
 );
 }

 const { psychological, predictive, timeline } = analysis;

 return (
 <div className="w-full max-w-7xl mx-auto py-6 space-y-6">
 <div className="mb-6">
 <h1 className="text-3xl font-bold">Gelişmiş AI Analizi</h1>
 <p className="text-muted-foreground">{psychological.studentName}</p>
 </div>

 <Tabs defaultValue="psychological" className="space-y-6">
 <TabsList variant="minimal" className="w-full justify-start sm:justify-center">
 <TabsTrigger value="psychological">
 Psikolojik Derinlik
 </TabsTrigger>
 <TabsTrigger value="predictive">
 Öngörücü Risk
 </TabsTrigger>
 <TabsTrigger value="timeline">
 Zaman Çizelgesi
 </TabsTrigger>
 </TabsList>

 <TabsContent value="psychological" className="space-y-6">
 <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg border">
 <h2 className="text-xl font-semibold mb-4">Motivasyonel Profil</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-white p-4 rounded-lg">
 <h3 className="font-semibold mb-2">İçsel Motivasyon: {psychological.motivationalProfile.intrinsicMotivation.level}</h3>
 <div className="text-sm space-y-2">
 <div>
 <span className="text-muted-foreground">Göstergeler:</span>
 <ul className="list-disc list-inside mt-1">
 {psychological.motivationalProfile.intrinsicMotivation.indicators.map((ind, i) => (
 <li key={i}>{ind}</li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 <div className="bg-white p-4 rounded-lg">
 <h3 className="font-semibold mb-2">Dışsal Motivasyon: {psychological.motivationalProfile.extrinsicMotivation.level}</h3>
 <div className="text-sm space-y-2">
 <div>
 <span className="text-muted-foreground">Temel Sürükleyiciler:</span>
 <ul className="list-disc list-inside mt-1">
 {psychological.motivationalProfile.extrinsicMotivation.primaryDrivers.map((drv, i) => (
 <li key={i}>{drv}</li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-white p-6 rounded-lg border">
 <h2 className="text-xl font-semibold mb-4">Aile Dinamikleri</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <h3 className="font-semibold mb-2">Ebeveyn Katılımı</h3>
 <div className="text-sm space-y-1">
 <p><span className="text-muted-foreground">Seviye:</span> {psychological.familyDynamics.parentalInvolvement.level}</p>
 <p><span className="text-muted-foreground">Kalite:</span> {psychological.familyDynamics.parentalInvolvement.quality}</p>
 </div>
 </div>
 <div>
 <h3 className="font-semibold mb-2">Aile Yapısı</h3>
 <div className="text-sm space-y-1">
 <p><span className="text-muted-foreground">Tip:</span> {psychological.familyDynamics.familyStructure.type}</p>
 <p><span className="text-muted-foreground">İstikrar:</span> {psychological.familyDynamics.familyStructure.stabilityLevel}</p>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-white p-6 rounded-lg border">
 <h2 className="text-xl font-semibold mb-4">Akran İlişkileri</h2>
 <div className="mb-4">
 <h3 className="font-semibold mb-2">Sosyal Entegrasyon: {psychological.peerRelationships.socialIntegration.level}</h3>
 <p className="text-sm text-muted-foreground">Arkadaşlık Kalitesi: {psychological.peerRelationships.socialIntegration.friendshipQuality}</p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <h4 className="font-medium mb-2">Güçlü Yönler</h4>
 <ul className="list-disc list-inside text-sm">
 {psychological.peerRelationships.socialSkills.strengths.map((str, i) => (
 <li key={i}>{str}</li>
 ))}
 </ul>
 </div>
 <div>
 <h4 className="font-medium mb-2">Gelişim Alanları</h4>
 <ul className="list-disc list-inside text-sm">
 {psychological.peerRelationships.socialSkills.challenges.map((ch, i) => (
 <li key={i}>{ch}</li>
 ))}
 </ul>
 </div>
 </div>
 </div>

 <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-lg border">
 <h2 className="text-xl font-semibold mb-4">Sentez ve Öneriler</h2>
 <div className="space-y-4">
 <div>
 <h3 className="font-semibold mb-2">Ana Psikolojik Temalar</h3>
 <ul className="list-disc list-inside text-sm">
 {psychological.synthesisAndRecommendations.keyPsychologicalThemes.map((theme, i) => (
 <li key={i}>{theme}</li>
 ))}
 </ul>
 </div>
 <div>
 <h3 className="font-semibold mb-2">Kritik Müdahaleler</h3>
 <div className="space-y-3">
 {psychological.synthesisAndRecommendations.criticalInterventions.map((int, i) => (
 <div key={i} className="bg-white p-3 rounded-lg border">
 <div className="flex items-center justify-between mb-2">
 <span className="font-medium">{int.area}</span>
 <span className={`px-2 py-1 rounded text-xs ${
 int.priority === 'ACİL' ? 'bg-red-100 text-red-700' :
 int.priority === 'YÜKSEK' ? 'bg-orange-100 text-orange-700' :
 'bg-yellow-100 text-yellow-700'
 }`}>
 {int.priority}
 </span>
 </div>
 <p className="text-sm mb-2">{int.intervention}</p>
 <p className="text-xs text-muted-foreground">Beklenen Sonuç: {int.expectedOutcome}</p>
 <p className="text-xs text-muted-foreground">Süre: {int.timeline}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </TabsContent>

 <TabsContent value="predictive" className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="bg-white p-4 rounded-lg border">
 <h3 className="font-semibold text-sm text-muted-foreground mb-2">24 Saat</h3>
 <div className={`text-2xl font-bold ${
 predictive.timeBasedPredictions.next24Hours.riskLevel === 'KRİTİK' ? 'text-red-600' :
 predictive.timeBasedPredictions.next24Hours.riskLevel === 'YÜKSEK' ? 'text-orange-600' :
 predictive.timeBasedPredictions.next24Hours.riskLevel === 'ORTA' ? 'text-yellow-600' :
 'text-green-600'
 }`}>
 {predictive.timeBasedPredictions.next24Hours.riskLevel}
 </div>
 <p className="text-sm text-muted-foreground mt-1">
 Olasılık: %{predictive.timeBasedPredictions.next24Hours.probability}
 </p>
 </div>
 <div className="bg-white p-4 rounded-lg border">
 <h3 className="font-semibold text-sm text-muted-foreground mb-2">48 Saat</h3>
 <div className={`text-2xl font-bold ${
 predictive.timeBasedPredictions.next48Hours.riskLevel === 'KRİTİK' ? 'text-red-600' :
 predictive.timeBasedPredictions.next48Hours.riskLevel === 'YÜKSEK' ? 'text-orange-600' :
 predictive.timeBasedPredictions.next48Hours.riskLevel === 'ORTA' ? 'text-yellow-600' :
 'text-green-600'
 }`}>
 {predictive.timeBasedPredictions.next48Hours.riskLevel}
 </div>
 <p className="text-sm text-muted-foreground mt-1">
 Olasılık: %{predictive.timeBasedPredictions.next48Hours.probability}
 </p>
 </div>
 <div className="bg-white p-4 rounded-lg border">
 <h3 className="font-semibold text-sm text-muted-foreground mb-2">72 Saat</h3>
 <div className={`text-2xl font-bold ${
 predictive.timeBasedPredictions.next72Hours.riskLevel === 'KRİTİK' ? 'text-red-600' :
 predictive.timeBasedPredictions.next72Hours.riskLevel === 'YÜKSEK' ? 'text-orange-600' :
 predictive.timeBasedPredictions.next72Hours.riskLevel === 'ORTA' ? 'text-yellow-600' :
 'text-green-600'
 }`}>
 {predictive.timeBasedPredictions.next72Hours.riskLevel}
 </div>
 <p className="text-sm text-muted-foreground mt-1">
 Olasılık: %{predictive.timeBasedPredictions.next72Hours.probability}
 </p>
 </div>
 <div className="bg-white p-4 rounded-lg border">
 <h3 className="font-semibold text-sm text-muted-foreground mb-2">1 Hafta</h3>
 <div className={`text-2xl font-bold ${
 predictive.timeBasedPredictions.nextWeek.riskLevel === 'KRİTİK' ? 'text-red-600' :
 predictive.timeBasedPredictions.nextWeek.riskLevel === 'YÜKSEK' ? 'text-orange-600' :
 predictive.timeBasedPredictions.nextWeek.riskLevel === 'ORTA' ? 'text-yellow-600' :
 'text-green-600'
 }`}>
 {predictive.timeBasedPredictions.nextWeek.riskLevel}
 </div>
 <p className="text-sm text-muted-foreground mt-1">
 Olasılık: %{predictive.timeBasedPredictions.nextWeek.probability}
 </p>
 </div>
 </div>

 <div className="bg-white p-6 rounded-lg border">
 <h2 className="text-xl font-semibold mb-4">Öngörücü Uyarılar</h2>
 <div className="space-y-3">
 {predictive.predictiveAlerts.map((alert, i) => (
 <div key={i} className={`p-4 rounded-lg border-l-4 ${
 alert.severity === 'KRİTİK' ? 'border-red-500 bg-red-50' :
 alert.severity === 'YÜKSEK' ? 'border-orange-500 bg-orange-50' :
 'border-yellow-500 bg-yellow-50'
 }`}>
 <div className="flex items-start justify-between mb-2">
 <div>
 <h3 className="font-semibold">{alert.title}</h3>
 <p className="text-sm text-muted-foreground">{alert.alertType}</p>
 </div>
 <span className={`px-2 py-1 rounded text-xs ${
 alert.severity === 'KRİTİK' ? 'bg-red-100 text-red-700' :
 alert.severity === 'YÜKSEK' ? 'bg-orange-100 text-orange-700' :
 'bg-yellow-100 text-yellow-700'
 }`}>
 {alert.severity}
 </span>
 </div>
 <p className="text-sm mb-2">{alert.description}</p>
 <p className="text-sm mb-2"><span className="font-medium">Önleme:</span> {alert.preventionStrategy}</p>
 <p className="text-xs text-muted-foreground">Son Tarih: {new Date(alert.actionDeadline).toLocaleDateString('tr-TR')}</p>
 </div>
 ))}
 </div>
 </div>

 <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border">
 <h2 className="text-xl font-semibold mb-4">Erken Müdahale Fırsatları</h2>
 <div className="space-y-3">
 {predictive.earlyInterventionOpportunities.map((opp, i) => (
 <div key={i} className="bg-white p-4 rounded-lg border">
 <div className="flex items-center justify-between mb-2">
 <h3 className="font-semibold">{opp.window}</h3>
 <span className={`px-2 py-1 rounded text-xs ${
 opp.expectedImpact === 'YÜKSEK' ? 'bg-green-100 text-green-700' :
 opp.expectedImpact === 'ORTA' ? 'bg-blue-100 text-blue-700' :
 'bg-gray-100 text-gray-700'
 }`}>
 {opp.expectedImpact} Etki
 </span>
 </div>
 <p className="text-sm mb-2">{opp.opportunity}</p>
 <div className="text-sm">
 <span className="font-medium">Adımlar:</span>
 <ul className="list-disc list-inside ml-2">
 {opp.actionSteps.map((step, j) => (
 <li key={j}>{step}</li>
 ))}
 </ul>
 </div>
 </div>
 ))}
 </div>
 </div>
 </TabsContent>

 <TabsContent value="timeline" className="space-y-6">
 <div className="bg-white p-6 rounded-lg border">
 <h2 className="text-xl font-semibold mb-4">Trend Analizi</h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="p-4 bg-blue-50 rounded-lg">
 <h3 className="font-semibold mb-2">Akademik</h3>
 <p className="text-2xl font-bold text-blue-600">{timeline.trendAnalysis.academicTrend}</p>
 </div>
 <div className="p-4 bg-purple-50 rounded-lg">
 <h3 className="font-semibold mb-2">Davranışsal</h3>
 <p className="text-2xl font-bold text-purple-600">{timeline.trendAnalysis.behavioralTrend}</p>
 </div>
 <div className="p-4 bg-green-50 rounded-lg">
 <h3 className="font-semibold mb-2">Sosyal</h3>
 <p className="text-2xl font-bold text-green-600">{timeline.trendAnalysis.socialTrend}</p>
 </div>
 </div>
 <div className="mt-4 p-4 bg-gray-50 rounded-lg">
 <p className="text-sm"><span className="font-medium">Genel Yörünge:</span> {timeline.trendAnalysis.overallTrajectory}</p>
 </div>
 </div>

 {timeline.successMoments.length > 0 && (
 <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-lg border">
 <h2 className="text-xl font-semibold mb-4">Başarı Anları</h2>
 <div className="space-y-3">
 {timeline.successMoments.map((success, i) => (
 <div key={i} className="bg-white p-4 rounded-lg border">
 <div className="flex items-center justify-between mb-2">
 <h3 className="font-semibold">{success.achievement}</h3>
 <span className="text-sm text-muted-foreground">
 {new Date(success.date).toLocaleDateString('tr-TR')}
 </span>
 </div>
 <div className="text-sm space-y-2">
 <div>
 <span className="font-medium">Katkıda Bulunan Faktörler:</span>
 <ul className="list-disc list-inside ml-2">
 {success.contributingFactors.map((factor, j) => (
 <li key={j}>{factor}</li>
 ))}
 </ul>
 </div>
 <p><span className="font-medium">Tekrar Stratejisi:</span> {success.replicationStrategy}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 <div className="bg-white p-6 rounded-lg border">
 <h2 className="text-xl font-semibold mb-4">İçgörüler</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <h3 className="font-semibold mb-2 text-green-600">Koruyucu Faktörler</h3>
 <ul className="list-disc list-inside text-sm">
 {timeline.insights.protectiveFactors.map((factor, i) => (
 <li key={i}>{factor}</li>
 ))}
 </ul>
 </div>
 <div>
 <h3 className="font-semibold mb-2 text-orange-600">Kırılganlıklar</h3>
 <ul className="list-disc list-inside text-sm">
 {timeline.insights.vulnerabilities.map((vuln, i) => (
 <li key={i}>{vuln}</li>
 ))}
 </ul>
 </div>
 </div>
 <div className="mt-4">
 <h3 className="font-semibold mb-2">Önerilen Müdahaleler</h3>
 <ul className="list-disc list-inside text-sm space-y-1">
 {timeline.insights.recommendedInterventions.map((int, i) => (
 <li key={i}>{int}</li>
 ))}
 </ul>
 </div>
 </div>
 </TabsContent>
 </Tabs>
 </div>
 );
}
