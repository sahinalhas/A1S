import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Badge } from '@/components/atoms/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Target, Clock, Users, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/utils/toast.utils';
import { getPriorityColor, getUrgencyLabel, getPriorityLabel } from '@/lib/ai/ai-utils';

interface InterventionRecommendationsProps {
 studentId: string;
 studentName: string;
}

export default function InterventionRecommendations({ studentId, studentName }: InterventionRecommendationsProps) {
 const [loading, setLoading] = useState(false);
 const [plan, setPlan] = useState<any>(null);

 const generatePlan = async () => {
 setLoading(true);
 try {
 const response = await fetchWithSchool(`/api/counseling-sessions/interventions/generate-plan/${studentId}`, {
 method: 'POST'
 });
 const data = await response.json();
 
 if (data.success) {
 setPlan(data.data);
 toast({
 title: 'Plan Oluşturuldu',
 description: 'Müdahale planı başarıyla hazırlandı'
 });
 } else {
 throw new Error(data.error);
 }
 } catch (error: unknown) {
 toast({
 title: 'Hata',
 description: error instanceof Error ? error.message : 'Plan oluşturulamadı',
 variant: 'destructive'
 });
 } finally {
 setLoading(false);
 }
 };

 if (!plan) {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Target className="h-5 w-5" />
 AI Müdahale Planlayıcı
 </CardTitle>
 <CardDescription>
 {studentName} için kanıta dayalı müdahale planı oluşturun
 </CardDescription>
 </CardHeader>
 <CardContent>
 <Button onClick={generatePlan} disabled={loading} className="w-full">
 {loading ? (
 <>
 <Loader2 className="mr-2 h-4 w-4" />
 Plan Oluşturuluyor...
 </>
 ) : (
 <>
 <Target className="mr-2 h-4 w-4" />
 Müdahale Planı Oluştur
 </>
 )}
 </Button>
 </CardContent>
 </Card>
 );
 }

 return (
 <div className="space-y-4">
 <Card>
 <CardHeader>
 <div className="flex items-start justify-between">
 <CardTitle className="flex items-center gap-2">
 <Target className="h-5 w-5" />
 Müdahale Planı - {plan.studentName}
 </CardTitle>
 <Badge variant={plan?.urgencyLevel?.toLowerCase() === 'immediate' ? 'destructive' : 'default'}>
 {getUrgencyLabel(plan?.urgencyLevel)}
 </Badge>
 </div>
 </CardHeader>
 <CardContent>
 <p className="text-sm text-muted-foreground">{plan.overallAssessment}</p>
 </CardContent>
 </Card>

 <Tabs defaultValue="recommendations" className="w-full">
 <TabsList variant="nested">
 <TabsTrigger value="recommendations" variant="nested">Öneriler</TabsTrigger>
 <TabsTrigger value="action-plan" variant="nested">Eylem Planı</TabsTrigger>
 <TabsTrigger value="monitoring" variant="nested">İzleme</TabsTrigger>
 </TabsList>

 <TabsContent value="recommendations" className="space-y-4">
 {plan.recommendations?.map((rec: any, index: number) => (
 <Card key={index}>
 <CardHeader>
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-3 flex-1">
 <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
 {index + 1}
 </div>
 <div className="flex-1">
 <CardTitle className="text-base mb-1">{rec.title}</CardTitle>
 <div className="flex gap-2 mb-2">
 <Badge variant={getPriorityColor(rec?.priority)}>
 {getPriorityLabel(rec?.priority)}
 </Badge>
 <Badge variant="outline">{rec.category}</Badge>
 {rec.evidenceBased && <Badge variant="secondary">Kanıta Dayalı</Badge>}
 </div>
 </div>
 </div>
 </div>
 </CardHeader>
 <CardContent className="space-y-3">
 <p className="text-sm text-muted-foreground">{rec.description}</p>
 
 <div className="grid gap-3 md:grid-cols-2">
 <div>
 <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
 <Clock className="h-3 w-3" />
 Kısa Vadeli
 </h4>
 <ul className="text-xs space-y-1 text-muted-foreground">
 {rec.strategies?.shortTerm?.map((s: string, i: number) => (
 <li key={i}>• {s}</li>
 ))}
 </ul>
 </div>
 <div>
 <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
 <Target className="h-3 w-3" />
 Uzun Vadeli
 </h4>
 <ul className="text-xs space-y-1 text-muted-foreground">
 {rec.strategies?.longTerm?.map((s: string, i: number) => (
 <li key={i}>• {s}</li>
 ))}
 </ul>
 </div>
 </div>

 <div>
 <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
 <CheckCircle2 className="h-3 w-3" />
 Beklenen Sonuçlar
 </h4>
 <ul className="text-xs space-y-1 text-muted-foreground">
 {rec.expectedOutcomes?.map((o: string, i: number) => (
 <li key={i}>• {o}</li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
 <Users className="h-3 w-3" />
 Paydaşlar
 </h4>
 <div className="flex flex-wrap gap-1">
 {rec.stakeholders?.map((s: string, i: number) => (
 <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
 ))}
 </div>
 </div>

 <div className="flex items-center gap-2 text-xs text-muted-foreground">
 <Clock className="h-3 w-3" />
 <span>Süre: {rec.timeframe}</span>
 </div>
 </CardContent>
 </Card>
 ))}
 </TabsContent>

 <TabsContent value="action-plan" className="space-y-4">
 <div className="grid gap-4 md:grid-cols-3">
 <Card>
 <CardHeader>
 <CardTitle className="text-sm">1. Hafta</CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-2">
 {plan.actionPlan?.week1?.map((action: string, i: number) => (
 <li key={i} className="text-sm flex items-start gap-2">
 <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
 <span>{action}</span>
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-sm">2-4. Hafta</CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-2">
 {plan.actionPlan?.week2_4?.map((action: string, i: number) => (
 <li key={i} className="text-sm flex items-start gap-2">
 <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
 <span>{action}</span>
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-sm">2-3. Ay</CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-2">
 {plan.actionPlan?.month2_3?.map((action: string, i: number) => (
 <li key={i} className="text-sm flex items-start gap-2">
 <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
 <span>{action}</span>
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 <TabsContent value="monitoring" className="space-y-4">
 <Card>
 <CardHeader>
 <CardTitle className="text-lg">İzleme ve Değerlendirme Planı</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div>
 <h4 className="text-sm font-medium mb-2">Başarı Metrikleri</h4>
 <ul className="space-y-1">
 {plan.monitoringPlan?.metrics?.map((metric: string, i: number) => (
 <li key={i} className="text-sm text-muted-foreground">• {metric}</li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="text-sm font-medium mb-2">Kontrol Noktaları</h4>
 <ul className="space-y-1">
 {plan.monitoringPlan?.checkpoints?.map((cp: string, i: number) => (
 <li key={i} className="text-sm text-muted-foreground">• {cp}</li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="text-sm font-medium mb-2">Ayarlama Tetikleyicileri</h4>
 <ul className="space-y-1">
 {plan.monitoringPlan?.adjustmentTriggers?.map((trigger: string, i: number) => (
 <li key={i} className="text-sm text-muted-foreground">• {trigger}</li>
 ))}
 </ul>
 </div>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>

 <div className="flex justify-end">
 <Button variant="outline" onClick={() => setPlan(null)}>
 Yeni Plan Oluştur
 </Button>
 </div>
 </div>
 );
}
