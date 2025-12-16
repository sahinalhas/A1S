import { useEffect, useMemo, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api/core/client";
import { STUDENT_ENDPOINTS, SURVEY_ENDPOINTS, COUNSELING_ENDPOINTS } from "@/lib/constants/api-endpoints";
import { DashboardSkeleton } from "@/components/features/dashboard/DashboardSkeleton";
import type { Student } from "@/lib/storage";
import type { EarlyWarning } from "@/lib/analytics";
import { optimizedGenerateEarlyWarnings } from "@/lib/analytics-cache";
import RiskSummaryWidget from "@/components/features/common/RiskSummaryWidget";
import { DashboardHero } from "@/components/features/common/DashboardHero";
import WidgetErrorBoundary from "@/components/features/common/WidgetErrorBoundary";
import { logger } from "@/lib/utils/logger";
import {
  Users2,
  CalendarDays,
  MessageSquare,
  AlertTriangle,
  Target,
  Brain,
  Sparkles,
  TrendingUp,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart3,
  FileText,
  Shield,
  Zap,
  Heart,
  Award,
  BookOpen,
  GraduationCap,
  LineChart,
  KeyRound,
  AlertCircle,
  Users,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/organisms/Chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DashboardStats {
  studentCount: number;
  meetingCount: number;
  activeSurveyCount: number;
  openInterventionCount: number;
  completedInterventionsThisMonth: number;
  activeCounselingSessionsToday: number;
}

interface RiskDistribution {
  high: number;
  medium: number;
  low: number;
  none: number;
}

interface CounselingSession {
  id: string;
  sessionDate: string;
  topic: string;
  status: string;
  studentIds?: string[];
}

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  const [isLoading, setIsLoading] = useState(true);
  const [isQuickLoginLoading, setIsQuickLoginLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    studentCount: 0,
    meetingCount: 0,
    activeSurveyCount: 0,
    openInterventionCount: 0,
    completedInterventionsThisMonth: 0,
    activeCounselingSessionsToday: 0,
  });
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution>({
    high: 0,
    medium: 0,
    low: 0,
    none: 0,
  });
  const [weeklyMeetingTrend, setWeeklyMeetingTrend] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [earlyWarnings, setEarlyWarnings] = useState<EarlyWarning[]>([]);


  useEffect(() => {
    if (students.length === 0) {
      setEarlyWarnings([]);
      return;
    }

    const fetchWarnings = async () => {
      try {
        const warnings = await optimizedGenerateEarlyWarnings();
        setEarlyWarnings(warnings.slice(0, 10));
      } catch (error) {
        logger.warn('Failed to generate early warnings', 'Dashboard', error);
        setEarlyWarnings([]);
      }
    };

    setTimeout(() => fetchWarnings(), 500);
  }, [students]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        const [studentsResponse, distributions, sessions] = await Promise.all([
          apiClient.get<Student[]>(STUDENT_ENDPOINTS.BASE, { showErrorToast: false }),
          apiClient.get<any[]>(SURVEY_ENDPOINTS.DISTRIBUTIONS, { showErrorToast: false }),
          apiClient.get<CounselingSession[]>(COUNSELING_ENDPOINTS.BASE, { showErrorToast: false }),
        ]);

        const studentsData = Array.isArray(studentsResponse) ? studentsResponse : [];
        if (studentsData.length > 0) {
          setStudents(studentsData);
          setStats(prev => ({ ...prev, studentCount: studentsData.length }));

          const riskCount = {
            high: studentsData.filter((s: Student) => s.risk === "Yüksek").length,
            medium: studentsData.filter((s: Student) => s.risk === "Orta").length,
            low: studentsData.filter((s: Student) => s.risk === "Düşük").length,
            none: studentsData.filter((s: Student) => !s.risk).length,
          };
          setRiskDistribution(riskCount);
        }

        if (distributions) {
          const activeCount = distributions.filter((d: any) => d.status === 'ACTIVE').length;
          setStats(prev => ({ ...prev, activeSurveyCount: activeCount }));
        }

        if (sessions) {
          const today = new Date().toISOString().split('T')[0];
          const activeTodayCount = sessions.filter(s =>
            s.sessionDate?.startsWith(today) && s.status === 'ACTIVE'
          ).length;
          setStats(prev => ({ ...prev, activeCounselingSessionsToday: activeTodayCount }));

          const thisWeek = getLastNDays(7);
          const weeklyData = thisWeek.map(day => {
            const dayStr = day.toISOString().split('T')[0];
            const count = sessions.filter(s => s.sessionDate?.startsWith(dayStr)).length;
            return {
              day: day.toLocaleDateString('tr-TR', { weekday: 'short' }),
              count: count,
            };
          });
          setWeeklyMeetingTrend(weeklyData);

          const thisWeekTotal = weeklyData.reduce((sum, d) => sum + d.count, 0);
          setStats(prev => ({ ...prev, meetingCount: thisWeekTotal }));
        }

        const interventionData = await apiClient.get<{
          openInterventions: number;
          completedThisMonth: number;
        }>('/api/standardized-profile/intervention-stats', { showErrorToast: false });

        if (interventionData) {
          setStats(prev => ({
            ...prev,
            openInterventionCount: interventionData.openInterventions,
            completedInterventionsThisMonth: interventionData.completedThisMonth
          }));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [isAuthenticated]);

  function getLastNDays(n: number): Date[] {
    const days: Date[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  }

  const handleQuickAdminLogin = async () => {
    setIsQuickLoginLoading(true);
    try {
      const success = await login('admin@okul.edu.tr', 'admin123');
      if (success) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Admin hızlı giriş hatası:', error);
    } finally {
      setIsQuickLoginLoading(false);
    }
  };

  const isDevelopment = import.meta.env.DEV;

  const criticalWarnings = useMemo(() => {
    return earlyWarnings.filter(w => w.severity === 'kritik' || w.severity === 'yüksek');
  }, [earlyWarnings]);

  const quickActions = [
    { title: "Öğrenci Portföyü", description: "Tüm öğrencileri görüntüle", icon: Users2, href: "/ogrenci", gradient: "from-violet-500 to-purple-600" },
    { title: "Görüşme & Randevu", description: "Danışmanlık seansları", icon: CalendarDays, href: "/gorusmeler", gradient: "from-blue-500 to-cyan-600" },
    { title: "Ölçek & Anketler", description: "Aktif anket yönetimi", icon: MessageSquare, href: "/anketler", gradient: "from-emerald-500 to-teal-600" },
    { title: "AI Asistanım", description: "Yapay zeka destekli analiz", icon: Brain, href: "/ai-araclari", gradient: "from-pink-500 to-rose-600" },
    { title: "Analiz & Raporlar", description: "Detaylı istatistikler", icon: FileText, href: "/raporlar", gradient: "from-amber-500 to-orange-600" },
    { title: "Sınav & Denemeler", description: "Sınav ve testler", icon: BarChart3, href: "/olcme-degerlendirme", gradient: "from-indigo-500 to-purple-600" },
  ];

  const riskChartData = useMemo(() => [
    { name: "Düşük", value: riskDistribution.low, color: "#22c55e" },
    { name: "Orta", value: riskDistribution.medium, color: "#f59e0b" },
    { name: "Yüksek", value: riskDistribution.high, color: "#ef4444" },
    { name: "Değerlendirilmemiş", value: riskDistribution.none, color: "#94a3b8" },
  ], [riskDistribution]);

  const statsCards = useMemo(() => [
    {
      title: "Toplam Öğrenci",
      value: stats.studentCount,
      icon: Users2,
      gradient: "from-violet-500 to-purple-600",
      description: "Kayıtlı öğrenci sayısı",
      trend: "+12%"
    },
    {
      title: "Bu Hafta Görüşme",
      value: stats.meetingCount,
      icon: CalendarDays,
      gradient: "from-blue-500 to-cyan-600",
      description: `${stats.activeCounselingSessionsToday} bugün`,
      trend: "+8%"
    },
    {
      title: "Açık Müdahale",
      value: stats.openInterventionCount,
      icon: AlertTriangle,
      gradient: "from-amber-500 to-orange-600",
      description: `${stats.completedInterventionsThisMonth} tamamlandı`,
      trend: "-5%"
    },
    {
      title: "Aktif Anket",
      value: stats.activeSurveyCount,
      icon: MessageSquare,
      gradient: "from-emerald-500 to-teal-600",
      description: "Devam eden anketler",
      trend: "+3"
    },
  ], [stats]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6">
        {isDevelopment ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-flex p-4 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                  <KeyRound className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Geliştirme Modu</h2>
                <p className="text-white/90">Admin olarak hızlı giriş yapabilirsiniz</p>
              </div>
              <Button
                onClick={handleQuickAdminLogin}
                disabled={isQuickLoginLoading}
                className="w-full bg-white text-orange-600 hover:bg-white/90 h-12 text-lg"
                size="lg"
              >
                {isQuickLoginLoading ? (
                  <>
                    <Clock className="mr-2 h-5 w-5 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-5 w-5" />
                    Admin Hızlı Giriş
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="inline-flex p-4 rounded-full bg-muted mb-4">
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Giriş Gerekli</h2>
            <p className="text-muted-foreground mb-6">Bu sayfayı görüntülemek için lütfen giriş yapın</p>
            <Button onClick={() => navigate('/login')} size="lg">
              Giriş Yap
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">

      <DashboardHero />

      {/* Gerçek Zamanlı Dashboard */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Gerçek Zamanlı Dashboard
          </CardTitle>
          <CardDescription>
            Güncel performans metrikleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              {
                title: "Açık Müdahale",
                value: stats.openInterventionCount,
                description: "Devam eden müdahaleler",
                icon: Target,
                gradient: "from-blue-500 to-cyan-600",
                change: stats.openInterventionCount > 0 ? "Aktif" : "Yok",
              },
              {
                title: "Bu Hafta Görüşme",
                value: stats.meetingCount,
                description: "Planlanan seanslar",
                icon: CalendarDays,
                gradient: "from-purple-500 to-violet-600",
                change: `${stats.activeCounselingSessionsToday} bugün`,
              },
              {
                title: "Toplam Öğrenci",
                value: stats.studentCount,
                description: "Kayıtlı öğrenci sayısı",
                icon: Users2,
                gradient: "from-emerald-500 to-teal-600",
                change: "+12%",
              },
              {
                title: "Risk Altında",
                value: riskDistribution.high + riskDistribution.medium,
                description: "Yakın takip gerektiren",
                icon: AlertTriangle,
                gradient: "from-amber-500 to-orange-600",
                change: riskDistribution.high > 0 ? "Dikkat" : "İyi",
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
                      <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 py-0.5">
                        {card.change}
                      </Badge>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{card.title}</p>
                      <p className="text-xl md:text-2xl font-bold tracking-tight">{card.value}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground truncate">{card.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>


      <div className="grid gap-4 md:gap-6 md:grid-cols-3 mb-6 md:mb-8">
        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border hover:shadow-lg transition-all h-full bg-white dark:bg-slate-900">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-violet-600 flex-shrink-0" />
                    <span className="truncate">Haftalık Görüşme Aktivitesi</span>
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm mt-1">Son 7 günlük görüşme trendi</CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1 text-xs ml-2 flex-shrink-0">
                  <Activity className="h-3 w-3" />
                  <span className="hidden sm:inline">Canlı</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <ChartContainer
                config={{
                  count: { label: "Görüşme", color: "hsl(262, 83%, 58%)" },
                }}
                className="h-[180px] md:h-[240px] w-full"
              >
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={weeklyMeetingTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-[10px] md:text-xs"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-[10px] md:text-xs"
                      width={30}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(262, 83%, 58%)"
                      strokeWidth={2}
                      fill="url(#colorGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2 hover:shadow-lg transition-all h-full bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Kritik Uyarılar
              </CardTitle>
              <CardDescription>Acil müdahale gerektiren durumlar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {criticalWarnings.length > 0 ? (
                criticalWarnings.slice(0, 4).map((warning, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 cursor-pointer hover:shadow-md transition-all border border-amber-200/50"
                    onClick={() => navigate(`/ogrenci/${warning.studentId}`)}
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{warning.studentName}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{warning.message}</div>
                    </div>
                    <Badge variant="destructive" className="text-xs flex-shrink-0">{warning.severity}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8 flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <span>Kritik uyarı bulunmuyor</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <Card className="border-2 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5 text-blue-600" />
              Risk Dağılımı Analizi
            </CardTitle>
            <CardDescription>Öğrenci risk seviyeleri dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-[220px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={riskChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium">Yüksek Risk</span>
                  </div>
                  <Badge variant="destructive">{riskDistribution.high}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm font-medium">Orta Risk</span>
                  </div>
                  <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">{riskDistribution.medium}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Düşük Risk</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400">{riskDistribution.low}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                    <span className="text-sm font-medium">Değerlendirilmemiş</span>
                  </div>
                  <Badge variant="outline">{riskDistribution.none}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border mb-6 md:mb-8">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Zap className="h-5 w-5 md:h-6 md:w-6 text-amber-600" />
              Hızlı Erişim
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">En sık kullanılan modüllere hızlıca ulaşın</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="cursor-pointer border hover:shadow-lg transition-all duration-300 group overflow-hidden h-full"
                    onClick={() => navigate(action.href)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                    <CardContent className="p-3 md:p-4 relative">
                      <div className={`inline-flex p-2 md:p-2.5 rounded-lg md:rounded-xl bg-gradient-to-br ${action.gradient} mb-2 md:mb-3 shadow-md`}>
                        <action.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-xs md:text-sm mb-0.5 md:mb-1 truncate">{action.title}</h3>
                      <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2">{action.description}</p>
                      <ArrowRight className="absolute top-3 right-3 md:top-4 md:right-4 h-3 w-3 md:h-4 md:w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="border-2 hover:shadow-lg transition-all bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
            <CardContent className="p-6 text-center">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mb-4 shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{students.length}</h3>
              <p className="text-sm text-muted-foreground">Başarı Hikayesi</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="border-2 hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <CardContent className="p-6 text-center">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 mb-4 shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">%98</h3>
              <p className="text-sm text-muted-foreground">Memnuniyet Oranı</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card className="border-2 hover:shadow-lg transition-all bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <CardContent className="p-6 text-center">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mb-4 shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">AI Destekli</h3>
              <p className="text-sm text-muted-foreground">Akıllı Analiz</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mb-8"
      >
        <RiskSummaryWidget />
      </motion.div>

    </div>
  );
}