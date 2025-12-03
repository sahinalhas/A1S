import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Badge } from '@/components/atoms/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Brain, TrendingUp, TrendingDown, Lightbulb, BarChart3, Loader2, Users } from 'lucide-react';
import { toast } from '@/hooks/utils/toast.utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';

interface SurveyAIAnalysisProps {
 distributionId: string;
}

export default function SurveyAIAnalysis({ distributionId }: SurveyAIAnalysisProps) {
 const [analysisMode, setAnalysisMode] = useState<'standard' | 'class-comparison'>('standard');
 const [loading, setLoading] = useState(false);
 const [analysis, setAnalysis] = useState<any>(null);
 const [classComparison, setClassComparison] = useState<any>(null);

 const analyzeResults = async () => {
 setLoading(true);
 try {
 const response = await fetchWithSchool(`/api/surveys/ai-analysis/analyze/${distributionId}`, {
 method: 'POST'
 });
 const data = await response.json();

 if (data.success) {
 setAnalysis(data.data);
 toast({
 title: 'Analiz Tamamlandı',
 description: 'AI analizi başarıyla oluşturuldu'
 });
 } else {
 throw new Error(data.error);
 }
 } catch (error: unknown) {
 toast({
 title: 'Hata',
 description: error instanceof Error ? error.message : 'Analiz oluşturulamadı',
 variant: 'destructive'
 });
 } finally {
 setLoading(false);
 }
 };

 const compareClasses = async () => {
 setLoading(true);
 try {
 const response = await fetchWithSchool(`/api/surveys/ai-analysis/compare-classes`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ distributionId })
 });
 const data = await response.json();

 if (data.success) {
 setClassComparison(data.data);
 toast({
 title: 'Karşılaştırma Tamamlandı',
 description: 'Sınıf karşılaştırması başarıyla oluşturuldu'
 });
 } else {
 throw new Error(data.error);
 }
 } catch (error: unknown) {
 toast({
 title: 'Hata',
 description: error instanceof Error ? error.message : 'Karşılaştırma oluşturulamadı',
 variant: 'destructive'
 });
 } finally {
 setLoading(false);
 }
 };

 const handleAnalyze = () => {
 if (analysisMode === 'standard') {
 analyzeResults();
 } else {
 compareClasses();
 }
 };

 const currentData = analysisMode === 'standard' ? analysis : classComparison;

 if (!currentData) {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Brain className="h-5 w-5" />
 AI Destekli Anket Analizi
 </CardTitle>
 <CardDescription>
 Yapay zeka ile anket sonuçlarınızı derinlemesine analiz edin veya sınıflar arası karşılaştırma yapın
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div>
 <label className="text-sm font-medium mb-2 block">Analiz Türü</label>
 <Select value={analysisMode} onValueChange={(v) => setAnalysisMode(v as any)}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="standard">
 <div className="flex items-center gap-2">
 <Brain className="h-4 w-4" />
 Standart Analiz
 </div>
 </SelectItem>
 <SelectItem value="class-comparison">
 <div className="flex items-center gap-2">
 <Users className="h-4 w-4" />
 Sınıf Karşılaştırması
 </div>
 </SelectItem>
 </SelectContent>
 </Select>
 </div>
 <Button onClick={handleAnalyze} disabled={loading} className="w-full">
 {loading ? (
 <>
 <Loader2 className="mr-2 h-4 w-4" />
 {analysisMode === 'standard' ? 'Analiz Ediliyor...' : 'Karşılaştırılıyor...'}
 </>
 ) : (
 <>
 {analysisMode === 'standard' ? (
 <>
 <Brain className="mr-2 h-4 w-4" />
 AI Analizi Başlat
 </>
 ) : (
 <>
 <Users className="mr-2 h-4 w-4" />
 Sınıf Karşılaştırması Başlat
 </>
 )}
 </>
 )}
 </Button>
 </CardContent>
 </Card>
 );
 }

 if (analysisMode === 'class-comparison' && classComparison) {
 return (
 <div className="space-y-4">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Users className="h-5 w-5" />
 Sınıf Karşılaştırması Sonuçları
 </CardTitle>
 </CardHeader>
 </Card>

 <div className="grid gap-4 md:grid-cols-2">
 {classComparison.map((classData: any, index: number) => (
 <Card key={index}>
 <CardHeader>
 <div className="flex items-center justify-between">
 <CardTitle className="text-lg">{classData.className}</CardTitle>
 <Badge variant="outline">
 Katılım: %{((classData.participationRate || 0) * 100).toFixed(0)}
 </Badge>
 </div>
 <CardDescription>
 Ortalama Puan: {classData.averageScore?.toFixed(1) || 'N/A'}
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div>
 <h4 className="font-semibold text-sm text-green-600 mb-2">Güçlü Yönler</h4>
 <ul className="list-disc list-inside text-sm space-y-1">
 {classData.strengths?.map((strength: string, i: number) => (
 <li key={i}>{strength}</li>
 ))}
 </ul>
 </div>
 <div>
 <h4 className="font-semibold text-sm text-orange-600 mb-2">Endişe Alanları</h4>
 <ul className="list-disc list-inside text-sm space-y-1">
 {classData.concerns?.map((concern: string, i: number) => (
 <li key={i}>{concern}</li>
 ))}
 </ul>
 </div>
 <div>
 <h4 className="font-semibold text-sm text-blue-600 mb-2">Öneriler</h4>
 <ul className="list-disc list-inside text-sm space-y-1">
 {classData.recommendations?.map((rec: string, i: number) => (
 <li key={i}>{rec}</li>
 ))}
 </ul>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>

 <div className="flex justify-end">
 <Button variant="outline" onClick={() => { setClassComparison(null); setAnalysis(null); }}>
 Yeni Analiz
 </Button>
 </div>
 </div>
 );
 }

 if (analysisMode === 'standard' && analysis) {
 return (
 <div className="space-y-4">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Brain className="h-5 w-5" />
 AI Analiz Sonuçları
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="prose max-w-none">
 <p className="text-sm text-muted-foreground">{analysis.summary}</p>
 </div>
 </CardContent>
 </Card>

 <Tabs defaultValue="findings" className="w-full">
 <TabsList variant="nested">
 <TabsTrigger value="findings" variant="nested">Ana Bulgular</TabsTrigger>
 <TabsTrigger value="trends" variant="nested">Trendler</TabsTrigger>
 <TabsTrigger value="insights" variant="nested">İçgörüler</TabsTrigger>
 <TabsTrigger value="recommendations" variant="nested">Öneriler</TabsTrigger>
 </TabsList>

 <TabsContent value="findings" className="space-y-4">
 <Card>
 <CardHeader>
 <CardTitle className="text-lg">Ana Bulgular</CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-2">
 {analysis.keyFindings?.map((finding: string, index: number) => (
 <li key={index} className="flex items-start gap-2">
 <Lightbulb className="h-4 w-4 mt-0.5 text-primary" />
 <span className="text-sm">{finding}</span>
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="trends" className="space-y-4">
 <div className="grid gap-4 md:grid-cols-3">
 <Card>
 <CardHeader>
 <CardTitle className="text-sm flex items-center gap-2 text-green-600">
 <TrendingUp className="h-4 w-4" />
 Pozitif Trendler
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-1">
 {analysis.trends?.positive?.map((trend: string, index: number) => (
 <li key={index} className="text-sm">{trend}</li>
 ))}
 </ul>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-sm flex items-center gap-2 text-red-600">
 <TrendingDown className="h-4 w-4" />
 Negatif Trendler
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-1">
 {analysis.trends?.negative?.map((trend: string, index: number) => (
 <li key={index} className="text-sm">{trend}</li>
 ))}
 </ul>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-sm flex items-center gap-2 text-gray-600">
 <BarChart3 className="h-4 w-4" />
 Nötr Gözlemler
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-1">
 {analysis.trends?.neutral?.map((trend: string, index: number) => (
 <li key={index} className="text-sm">{trend}</li>
 ))}
 </ul>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 <TabsContent value="insights" className="space-y-4">
 {analysis.insights?.map((insight: any, index: number) => (
 <Card key={index}>
 <CardHeader>
 <div className="flex items-start justify-between">
 <CardTitle className="text-base">{insight.title}</CardTitle>
 <Badge variant={
 insight.priority === 'high' ? 'destructive' :
 insight.priority === 'medium' ? 'default' : 'secondary'
 }>
 {insight.priority === 'high' ? 'Yüksek' :
 insight.priority === 'medium' ? 'Orta' : 'Düşük'}
 </Badge>
 </div>
 </CardHeader>
 <CardContent>
 <p className="text-sm text-muted-foreground">{insight.description}</p>
 </CardContent>
 </Card>
 ))}
 </TabsContent>

 <TabsContent value="recommendations" className="space-y-4">
 <Card>
 <CardHeader>
 <CardTitle className="text-lg">AI Önerileri</CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-3">
 {analysis.recommendations?.map((rec: string, index: number) => (
 <li key={index} className="flex items-start gap-2 p-2 rounded-lg">
 <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
 <span className="text-sm flex-1">{rec}</span>
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>

 {analysis.visualizationSuggestions && analysis.visualizationSuggestions.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="text-lg">Görselleştirme Önerileri</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 {analysis.visualizationSuggestions.map((viz: any, index: number) => (
 <div key={index} className="p-3 border rounded-lg">
 <div className="flex items-center justify-between mb-1">
 <span className="font-medium text-sm">{viz.chartType.toUpperCase()} Grafiği</span>
 <Badge variant="secondary">Öneri</Badge>
 </div>
 <p className="text-sm text-muted-foreground">{viz.purpose}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 )}
 </TabsContent>
 </Tabs>

 <div className="flex justify-end">
 <Button variant="outline" onClick={() => { setAnalysis(null); setClassComparison(null); }}>
 Yeni Analiz
 </Button>
 </div>
 </div>
 );
 }

 return null;
}