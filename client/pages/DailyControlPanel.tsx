import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/organisms/Tooltip';
import { 
  Calendar, AlertTriangle, Users, Clock, TrendingUp, 
  CheckCircle2, ShieldAlert, Activity 
} from 'lucide-react';
import { AIToolsLayout } from '@/components/features/ai-tools/AIToolsLayout';
import { AIToolsLoadingState } from '@/components/features/ai-tools/AIToolsLoadingState';
import { apiClient } from '@/lib/api/core/client';
import { AI_ENDPOINTS, STUDENT_ENDPOINTS } from '@/lib/constants/api-endpoints';
import { earlyWarningApi } from '@/lib/api/endpoints/early-warning.api';
import { getTodayActionPlan } from '@/lib/api/endpoints/advanced-ai-analysis.api';
import type { EarlyWarningAlert } from '@shared/types';

export default function DailyControlPanel() {
  const [activeSubTab, setActiveSubTab] = useState('priorities');

  // Fetch student data for stats
  const { data: studentsData } = useQuery<any[]>({
    queryKey: [STUDENT_ENDPOINTS.BASE],
    queryFn: () => apiClient.get<any[]>(STUDENT_ENDPOINTS.BASE, { showErrorToast: false })
  });

  // Fetch risk dashboard summary
  const { data: riskSummary, isLoading: riskLoading } = useQuery({
    queryKey: ['risk-summary'],
    queryFn: async () => {
      try {
        return await earlyWarningApi.getDashboardSummary();
      } catch (error) {
        return null;
      }
    }
  });

  // Fetch today's action plan
  const { data: todayPlan, isLoading: planLoading } = useQuery({
    queryKey: ['today-plan'],
    queryFn: getTodayActionPlan,
    staleTime: 60 * 60 * 1000
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!studentsData) {
      return {
        totalStudents: 0,
        highRiskCount: 0,
        criticalAlerts: 0,
        todayTasks: 0,
      };
    }

    const highRiskCount = studentsData.filter((s: any) => s.risk === 'Yüksek').length;
    const criticalAlerts = riskSummary?.criticalAlerts || 0;
    const todayTasks = todayPlan?.dailySummary?.totalActions || 0;

    return {
      totalStudents: studentsData.length,
      highRiskCount,
      criticalAlerts,
      todayTasks,
    };
  }, [studentsData, riskSummary, todayPlan]);

  // Get today's priorities (max 5)
  const todayPriorities = useMemo(() => {
    const priorities: Array<{
      id: string;
      title: string;
      type: 'critical' | 'high' | 'medium';
      action: string;
      time?: string;
    }> = [];

    // Add critical alerts
    if (riskSummary?.recentAlerts) {
      riskSummary.recentAlerts.slice(0, 2).forEach((alert: EarlyWarningAlert) => {
        priorities.push({
          id: alert.id,
          title: `${alert.title}`,
          type: 'critical',
          action: alert.description,
        });
      });
    }

    // Add high risk students that need attention
    if (studentsData) {
      const highRiskStudents = studentsData.filter((s: any) => s.risk === 'Yüksek').slice(0, 2);
      highRiskStudents.forEach((student: any) => {
        priorities.push({
          id: student.id,
          title: `${student.name} ${student.surname}`,
          type: 'high',
          action: 'Takip ve değerlendirme yapılmalı',
        });
      });
    }

    // Add from morning briefing if available
    if (todayPlan?.morningBriefing?.urgentMatters) {
      todayPlan.morningBriefing.urgentMatters.slice(0, 1).forEach((matter: string, index: number) => {
        priorities.push({
          id: `urgent-${index}`,
          title: 'Acil Konu',
          type: 'high',
          action: matter,
        });
      });
    }

    return priorities.slice(0, 5); // Max 5 priorities
  }, [riskSummary, studentsData, todayPlan]);

  const getPriorityColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-l-4 border-red-500 bg-red-50/50 dark:bg-red-950/30';
      case 'high': return 'border-l-4 border-orange-500 bg-orange-50/50 dark:bg-orange-950/30';
      case 'medium': return 'border-l-4 border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/30';
      default: return 'border-l-4 border-gray-400 bg-gray-50/50 dark:bg-gray-800/30';
    }
  };

  const getPriorityIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'high': return <TrendingUp className="h-5 w-5 text-orange-600" />;
      default: return <CheckCircle2 className="h-5 w-5 text-yellow-600" />;
    }
  };

  if (riskLoading || planLoading) {
    return (
      <AIToolsLoadingState 
        icon={Calendar}
        message="Günlük veriler yükleniyor..."
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto py-6 space-y-6">
        <AIToolsLayout
          title="Günlük Kontrol Paneli"
          description={`${new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
          icon={Calendar}
        >
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              {
                title: "Toplam Öğrenci",
                value: stats.totalStudents,
                icon: Users,
                gradient: "from-blue-500 to-cyan-600",
              },
              {
                title: "Yüksek Risk",
                value: stats.highRiskCount,
                icon: ShieldAlert,
                gradient: "from-red-500 to-rose-600",
              },
              {
                title: "Kritik Uyarılar",
                value: stats.criticalAlerts,
                icon: AlertTriangle,
                gradient: "from-orange-500 to-amber-600",
              },
              {
                title: "Bugünkü Görevler",
                value: stats.todayTasks,
                icon: CheckCircle2,
                gradient: "from-emerald-500 to-teal-600",
              },
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -3, scale: 1.01 }}
              >
                <Card className="relative overflow-hidden border hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 hover:opacity-5 transition-opacity`}></div>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start justify-between mb-2 md:mb-3">
                      <div className={`p-2 md:p-2.5 rounded-lg bg-gradient-to-br ${card.gradient} shadow-md`}>
                        <card.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{card.title}</p>
                      <p className="text-xl md:text-2xl font-bold tracking-tight">{card.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Today's Priorities */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Bugünkü Öncelikler
              </CardTitle>
              <CardDescription>
                Bugün dikkat edilmesi gereken konular
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayPriorities.length > 0 ? (
                  todayPriorities.map((priority, index) => (
                    <motion.div
                      key={priority.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg ${getPriorityColor(priority.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getPriorityIcon(priority.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{priority.title}</h4>
                            <Badge variant={priority.type === 'critical' ? 'destructive' : 'default'} className="text-xs">
                              {priority.type === 'critical' ? 'Kritik' : priority.type === 'high' ? 'Yüksek' : 'Orta'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{priority.action}</p>
                          {priority.time && (
                            <p className="text-xs text-primary mt-1">{priority.time}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Bugün için kritik öncelik bulunmuyor</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sub Tabs */}
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-4">
            <TabsList variant="nested" className="w-full justify-start sm:justify-center">
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <TabsTrigger value="priorities" variant="nested">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Kritik Uyarılar</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>Acil dikkat gerektiren uyarılar</TooltipContent>
              </Tooltip>
              
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <TabsTrigger value="risk" variant="nested">
                    <ShieldAlert className="h-4 w-4" />
                    <span className="hidden sm:inline">Yüksek Riskli Öğrenciler</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>Yakın takip gerektiren öğrenciler</TooltipContent>
              </Tooltip>
            </TabsList>

            <TabsContent value="priorities" className="space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Kritik Uyarılar</CardTitle>
                  <CardDescription>
                    Acil dikkat ve müdahale gerektiren durumlar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {riskSummary?.recentAlerts?.length > 0 ? (
                    riskSummary.recentAlerts.map((alert: EarlyWarningAlert) => (
                      <div key={alert.id} className="border-l-4 border-red-500 pl-4 py-3 bg-red-50/50 dark:bg-red-950/30 rounded-r">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{alert.title}</h4>
                              <Badge variant="destructive">{alert.alertLevel}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.description}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                              <span>{new Date(alert.created_at || '').toLocaleDateString('tr-TR')}</span>
                              <span>•</span>
                              <span>{alert.alertType}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aktif kritik uyarı bulunmamaktadır</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risk" className="space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Yüksek Riskli Öğrenciler</CardTitle>
                  <CardDescription>
                    Yakın takip ve destek gerektiren öğrenciler
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {riskSummary?.topRiskStudents?.length > 0 ? (
                      riskSummary.topRiskStudents.map((student: any) => (
                        <div
                          key={student.studentId}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{student.name} {student.surname}</div>
                            <div className="text-sm text-muted-foreground">{student.className}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                Risk Skoru: {student.overallRiskScore?.toFixed(1)}
                              </div>
                              <Badge variant="destructive">
                                {student.riskLevel}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Yüksek riskli öğrenci bulunmamaktadır</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </AIToolsLayout>
      </div>
    </TooltipProvider>
  );
}
