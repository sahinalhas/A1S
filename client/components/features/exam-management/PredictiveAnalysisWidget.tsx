import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card/card';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Badge } from '@/components/atoms/Badge/badge';
import { Progress } from '@/components/atoms/Progress/progress';
import { Alert, AlertDescription } from '@/components/atoms/Alert/alert';
import { Brain, TrendingUp, AlertTriangle, Target, CheckCircle2, Clock } from 'lucide-react';
import { Skeleton } from '@/components/atoms/Skeleton/skeleton';

async function fetchPrediction(studentId: string, examTypeId: string) {
 const response = await fetchWithSchool(`/api/exam-management/predictions/${studentId}/${examTypeId}`);
 const result = await response.json();
 if (!result.success) throw new Error(result.error);
 return result.data;
}

interface PredictiveAnalysisWidgetProps {
 studentId: string;
 examTypeId: string;
 studentName?: string;
}

export function PredictiveAnalysisWidget({ studentId, examTypeId, studentName }: PredictiveAnalysisWidgetProps) {
 const { data: prediction, isLoading } = useQuery({
 queryKey: ['prediction', studentId, examTypeId],
 queryFn: () => fetchPrediction(studentId, examTypeId),
 });

 const getRiskColor = (level: string) => {
 switch (level) {
 case 'high':
 return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
 case 'medium':
 return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
 case 'low':
 return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
 default:
 return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
 }
 };

 if (isLoading) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Tahminsel Analitik</CardTitle>
 <CardDescription>Yükleniyor...</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 <Skeleton className="h-24" />
 <Skeleton className="h-24" />
 <Skeleton className="h-32" />
 </div>
 </CardContent>
 </Card>
 );
 }

 if (!prediction) {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Brain className="h-5 w-5 text-primary" />
 Tahminsel Analitik
 </CardTitle>
 <CardDescription>AI destekli performans tahmini</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="text-center py-8 text-muted-foreground">
 <p>Tahmin için yeterli veri yok</p>
 </div>
 </CardContent>
 </Card>
 );
 }

 const riskColors = getRiskColor(prediction.risk_assessment.risk_level);

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Brain className="h-5 w-5 text-primary" />
 Tahminsel Analitik
 </CardTitle>
 <CardDescription>
 {studentName} - AI destekli performans tahmini ve risk değerlendirmesi
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="border rounded-lg p-4 space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">Mevcut Performans</span>
 <Target className="h-4 w-4 text-gray-600" />
 </div>
 <div className="text-3xl font-bold text-gray-700">
 {prediction.current_performance.toFixed(1)}
 </div>
 <p className="text-xs text-muted-foreground">Son 3 deneme ortalaması</p>
 </div>

 <div className="border rounded-lg p-4 space-y-2 bg-primary/5">
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">Tahmin Edilen</span>
 <TrendingUp className="h-4 w-4 text-primary" />
 </div>
 <div className="text-3xl font-bold text-primary">
 {prediction.predicted_performance.toFixed(1)}
 </div>
 <p className="text-xs text-muted-foreground">
 %{prediction.confidence.toFixed(0)} güvenilirlik
 </p>
 </div>
 </div>

 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium">Risk Seviyesi</span>
 <Badge className={`${riskColors.bg} ${riskColors.text} ${riskColors.border} border`}>
 {prediction.risk_assessment.risk_level === 'high' && 'Yüksek Risk'}
 {prediction.risk_assessment.risk_level === 'medium' && 'Orta Risk'}
 {prediction.risk_assessment.risk_level === 'low' && 'Düşük Risk'}
 </Badge>
 </div>
 <Progress value={prediction.success_probability} className="h-2" />
 <p className="text-xs text-muted-foreground">
 Başarı olasılığı: %{prediction.success_probability.toFixed(0)}
 </p>
 </div>

 {prediction.risk_assessment.risk_factors.length > 0 && (
 <Alert>
 <AlertTriangle className="h-4 w-4" />
 <AlertDescription>
 <div className="font-medium mb-2">Risk Faktörleri:</div>
 <ul className="list-disc list-inside space-y-1">
 {prediction.risk_assessment.risk_factors.map((factor: string, idx: number) => (
 <li key={idx} className="text-sm">{factor}</li>
 ))}
 </ul>
 </AlertDescription>
 </Alert>
 )}

 {prediction.risk_assessment.protective_factors.length > 0 && (
 <Alert className="border-green-200 bg-green-50">
 <CheckCircle2 className="h-4 w-4 text-green-600" />
 <AlertDescription>
 <div className="font-medium mb-2 text-green-800">Koruyucu Faktörler:</div>
 <ul className="list-disc list-inside space-y-1">
 {prediction.risk_assessment.protective_factors.map((factor: string, idx: number) => (
 <li key={idx} className="text-sm text-green-700">{factor}</li>
 ))}
 </ul>
 </AlertDescription>
 </Alert>
 )}

 <div className="border-t pt-4">
 <h4 className="font-medium mb-3 flex items-center gap-2">
 <Clock className="h-4 w-4" />
 Gelişim Yolu
 </h4>
 <div className="space-y-3">
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">Hedef:</span>
 <span className="font-medium">{prediction.improvement_path.target_net.toFixed(1)} net</span>
 </div>
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">Gerekli İyileşme:</span>
 <span className="font-medium">{prediction.improvement_path.gap.toFixed(1)} net</span>
 </div>
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">Tahmini Süre:</span>
 <span className="font-medium">{prediction.improvement_path.estimated_weeks_needed} hafta</span>
 </div>
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">Haftalık Hedef:</span>
 <span className="font-medium">+{prediction.improvement_path.weekly_improvement_rate.toFixed(1)} net/hafta</span>
 </div>
 </div>
 </div>

 {prediction.improvement_path.action_plan.length > 0 && (
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
 <h4 className="font-medium mb-2 text-blue-900">Önerilen Eylem Planı:</h4>
 <ul className="space-y-1">
 {prediction.improvement_path.action_plan.map((action: string, idx: number) => (
 <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
 <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
 <span>{action}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 </CardContent>
 </Card>
 );
}
