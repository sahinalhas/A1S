/**
 * Daily Plan Dashboard - Günlük İçgörüler + Eylem Planı (Birleşik)
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { StatCard } from '@/components/molecules/StatCard';
import { StatsGrid } from '@/components/molecules/StatsGrid';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { 
  AlertTriangle, TrendingUp, Users, Calendar, Brain, FileText, 
  Clock, CheckCircle2, Phone, Activity 
} from 'lucide-react';
import { MODERN_GRADIENTS } from '@/lib/config/theme.config';
import { apiClient } from '@/lib/api/core/client';
import { AI_ENDPOINTS } from '@/lib/constants/api-endpoints';
import { AIToolsLayout } from '@/components/features/ai-tools/AIToolsLayout';
import { AIToolsLoadingState } from '@/components/features/ai-tools/AIToolsLoadingState';
import { getTodayActionPlan, generateDailyActionPlan } from '@/lib/api/endpoints/advanced-ai-analysis.api';
import type { CounselorDailyPlan, HourlyAction } from '../../shared/types/advanced-ai-analysis.types';

interface DailyInsightsSummary {
  date: string;
  insight: {
    summary: string;
    totalStudents: number;
    highRiskCount: number;
    mediumRiskCount: number;
    criticalAlertsCount: number;
    newAlertsCount: number;
    keyFindings?: string;
    aiInsights?: string;
  };
  priorityStudents: any[];
  criticalAlerts: any[];
  positiveUpdates: any[];
  recommendedActions: string[];
}

export default function DailyPlanDashboard() {
  const [insights, setInsights] = useState<DailyInsightsSummary | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const response = await apiClient.get<any>(
        AI_ENDPOINTS.DAILY_INSIGHTS,
        { showErrorToast: false }
      );
      const data = response?.data || response;
      if (data) {
        setInsights(data);
      }
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  const generateNewInsights = async () => {
    setGenerating(true);
    try {
      await apiClient.post(
        AI_ENDPOINTS.GENERATE_INSIGHTS,
        {},
        {
          showSuccessToast: true,
          successMessage: 'Yeni analiz oluşturuldu',
          showErrorToast: true,
        }
      );
      await loadInsights();
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setGenerating(false);
    }
  };

  const { data: plan, isLoading: planLoading, refetch: refetchPlan } = useQuery({
    queryKey: ['daily-action-plan', selectedDate],
    queryFn: () => selectedDate === new Date().toISOString().split('T')[0] 
      ? getTodayActionPlan() 
      : generateDailyActionPlan(selectedDate),
    staleTime: 60 * 60 * 1000
  });

  const handleRefreshPlan = async () => {
    await generateDailyActionPlan(selectedDate, undefined, true);
    refetchPlan();
  };

  const getActionIcon = (type: HourlyAction['actionType']) => {
    switch (type) {
      case 'GÖRÜŞME': return <Users className="w-4 h-4" />;
      case 'İZLEME': return <Activity className="w-4 h-4" />;
      case 'MÜDAHALE': return <AlertTriangle className="w-4 h-4" />;
      case 'DÖKÜMENTASYON': return <FileText className="w-4 h-4" />;
      case 'AİLE_İLETİŞİMİ': return <Phone className="w-4 h-4" />;
      case 'ACİL': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: HourlyAction['priority']) => {
    switch (priority) {
      case 'ACİL': return 'border-red-500 bg-red-50 dark:bg-red-950/30';
      case 'YÜKSEK': return 'border-orange-500 bg-orange-50 dark:bg-orange-950/30';
      case 'ORTA': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30';
      case 'DÜŞÜK': return 'border-gray-400 bg-gray-50 dark:bg-gray-800/30';
    }
  };

  if (insightsLoading && planLoading) {
    return (
      <AIToolsLoadingState 
        icon={Calendar}
        message="Günlük veriler yükleniyor..."
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 space-y-6">
      <AIToolsLayout
        title="Günlük İçgörüler ve Eylem Planı"
        description="AI destekli günlük analiz, öneriler ve eylem planlaması"
        icon={Calendar}
      >
        <Tabs defaultValue="insights" className="w-full space-y-6">
          <TabsList variant="minimal" className="w-full justify-start sm:justify-center">
            <TabsTrigger value="insights">
              <Brain className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">İçgörüler</span>
            </TabsTrigger>
            <TabsTrigger value="plan">
              <Clock className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Eylem Planı</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6 mt-0 min-h-[400px]">
            <div className="flex justify-end">
              <Button onClick={generateNewInsights} disabled={generating}>
                {generating ? 'Oluşturuluyor...' : 'Yeni Analiz Oluştur'}
              </Button>
            </div>

            {insights && (
              <>
                <StatsGrid columns={4}>
                  <StatCard
                    title="Toplam Öğrenci"
                    value={insights.insight.totalStudents}
                    icon={Users}
                    gradient={MODERN_GRADIENTS.blue}
                    delay={0}
                  />
                  <StatCard
                    title="Yüksek Risk"
                    value={insights.insight.highRiskCount}
                    icon={AlertTriangle}
                    gradient={MODERN_GRADIENTS.rose}
                    delay={0.1}
                  />
                  <StatCard
                    title="Kritik Uyarı"
                    value={insights.insight.criticalAlertsCount}
                    icon={AlertTriangle}
                    gradient={MODERN_GRADIENTS.amber}
                    delay={0.2}
                  />
                  <StatCard
                    title="Yeni Uyarı"
                    value={insights.insight.newAlertsCount}
                    icon={TrendingUp}
                    gradient={MODERN_GRADIENTS.cyan}
                    delay={0.3}
                  />
                </StatsGrid>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Günlük Özet
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{insights.insight.summary}</p>
                      {insights.insight.keyFindings && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <h4 className="font-medium mb-2">Ana Bulgular:</h4>
                          <p className="text-sm whitespace-pre-wrap">{insights.insight.keyFindings}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        AI Analizi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">
                        {insights.insight.aiInsights || 'AI analizi mevcut değil'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {insights.recommendedActions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Önerilen Aksiyonlar
                      </CardTitle>
                      <CardDescription>Bugün yapılması gerekenler</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {insights.recommendedActions.map((action, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-sm">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {insights.criticalAlerts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Kritik Uyarılar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {insights.criticalAlerts.map((alert) => (
                          <div key={alert.id} className="border-l-4 border-red-500 pl-4 py-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium">{alert.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {alert.description}
                                </p>
                                {alert.recommendation && (
                                  <p className="text-sm text-blue-600 mt-2">
                                    {alert.recommendation}
                                  </p>
                                )}
                              </div>
                              <Badge variant="destructive">{alert.severity}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {insights.positiveUpdates.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <TrendingUp className="w-5 h-5" />
                        Pozitif Gelişmeler
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {insights.positiveUpdates.map((update) => (
                          <div key={update.id} className="border-l-4 border-green-500 pl-4 py-2">
                            <h4 className="font-medium">{update.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {update.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="plan" className="space-y-6 mt-0 min-h-[400px]">
            <div className="flex items-center justify-end gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
              />
              <Button onClick={handleRefreshPlan}>
                Yeni Plan Oluştur
              </Button>
            </div>

            {planLoading ? (
              <AIToolsLoadingState 
                icon={Calendar}
                message="Günlük plan hazırlanıyor..."
              />
            ) : plan ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Toplam Aksiyon</div>
                    <div className="text-2xl font-bold mt-1">{plan.dailySummary?.totalActions || 0}</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-900">
                    <div className="text-sm text-red-700 dark:text-red-400">Kritik Öncelikli</div>
                    <div className="text-2xl font-bold mt-1 text-red-600">{plan.dailySummary?.criticalCount || 0}</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-900">
                    <div className="text-sm text-orange-700 dark:text-orange-400">Yüksek Öncelikli</div>
                    <div className="text-2xl font-bold mt-1 text-orange-600">{plan.dailySummary?.highPriorityCount || 0}</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                    <div className="text-sm text-blue-700 dark:text-blue-400">İş Yükü</div>
                    <div className="text-xl font-semibold mt-1 text-blue-600">{plan.dailySummary?.estimatedWorkload || 'Hesaplanıyor'}</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-6 rounded-lg border">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Sabah Brifing
                  </h2>
                  
                  {plan.morningBriefing?.urgentMatters?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-red-600 mb-2">Acil Konular</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {plan.morningBriefing.urgentMatters.map((matter: string, i: number) => (
                          <li key={i} className="text-sm">{matter}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {plan.morningBriefing?.keyStudentsToMonitor?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">İzlenecek Öğrenciler</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {plan.morningBriefing.keyStudentsToMonitor.map((student: any, i: number) => (
                          <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded border">
                            <div className="font-medium">{student.name} {student.surname || ''}</div>
                            <div className="text-sm text-muted-foreground">{student.reason}</div>
                            <div className="text-xs text-blue-600 mt-1">{student.suggestedTime}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {plan.morningBriefing?.preparationTasks?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Hazırlık Görevleri</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {plan.morningBriefing.preparationTasks.map((task: string, i: number) => (
                          <li key={i} className="text-sm">{task}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg border">
                  <div className="p-4 border-b bg-gray-50 dark:bg-slate-800">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Saatlik Program
                    </h2>
                  </div>
                  <div className="divide-y dark:divide-slate-800">
                    {plan.hourlySchedule?.map((action: HourlyAction, i: number) => (
                      <div
                        key={i}
                        className={`p-4 border-l-4 ${getPriorityColor(action.priority)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                {getActionIcon(action.actionType)}
                                <span className="font-semibold text-lg">{action.timeSlot}</span>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                action.priority === 'ACİL' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                                action.priority === 'YÜKSEK' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                                action.priority === 'ORTA' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              }`}>
                                {action.priority}
                              </span>
                              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-1 rounded">
                                {action.actionType}
                              </span>
                            </div>

                            {action.studentName && (
                              <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                                {action.studentName}
                              </div>
                            )}

                            <div className="font-medium mb-2">{action.action}</div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">Süre:</span> {action.duration} dk
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-muted-foreground">Beklenen Sonuç:</span> {action.expectedOutcome}
                              </div>
                            </div>

                            {action.preparationNeeded?.length > 0 && (
                              <div className="mt-2 text-sm">
                                <span className="text-muted-foreground">Hazırlık:</span>{' '}
                                {Array.isArray(action.preparationNeeded) ? action.preparationNeeded.join(', ') : action.preparationNeeded}
                              </div>
                            )}

                            {action.resources?.length > 0 && (
                              <div className="mt-1 text-sm">
                                <span className="text-muted-foreground">Kaynaklar:</span>{' '}
                                {Array.isArray(action.resources) ? action.resources.join(', ') : action.resources}
                              </div>
                            )}

                            {action.followUp && (
                              <div className="mt-2 text-sm bg-blue-50 dark:bg-blue-950/30 p-2 rounded border border-blue-200 dark:border-blue-900">
                                <span className="text-blue-700 dark:text-blue-400 font-medium">Takip:</span> {action.followUp}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )) || <div className="p-8 text-center text-muted-foreground">Henüz saatlik program oluşturulmamış</div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Esneklik Önerileri
                    </h3>
                    <div className="space-y-3 text-sm">
                      {plan.flexibilityRecommendations?.bufferTimes?.length > 0 && (
                        <div>
                          <div className="font-medium text-muted-foreground mb-1">Tampon Zamanlar:</div>
                          <div>{plan.flexibilityRecommendations.bufferTimes.join(', ')}</div>
                        </div>
                      )}
                      {plan.flexibilityRecommendations?.contingencyPlans?.length > 0 && (
                        <div>
                          <div className="font-medium text-muted-foreground mb-1">Beklenmedik Durumlar:</div>
                          <ul className="space-y-1">
                            {plan.flexibilityRecommendations.contingencyPlans.map((cp: any, i: number) => (
                              <li key={i}>
                                <span className="font-medium">{cp.scenario}:</span> {cp.action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Gün Sonu Kontrol
                    </h3>
                    <ul className="space-y-2">
                      {plan.endOfDayChecklist?.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <input type="checkbox" className="mt-1" />
                          <span className="text-sm">{item}</span>
                        </li>
                      )) || <li className="text-sm text-muted-foreground">Kontrol listesi hazırlanıyor...</li>}
                    </ul>
                  </div>
                </div>

                {plan.tomorrowPrep?.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-4 rounded-lg border">
                    <h3 className="font-semibold mb-3">Yarına Hazırlık</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {plan.tomorrowPrep.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <p className="text-muted-foreground">Henüz günlük plan oluşturulmamış</p>
                <Button onClick={handleRefreshPlan} className="mt-4">
                  Plan Oluştur
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </AIToolsLayout>
    </div>
  );
}
