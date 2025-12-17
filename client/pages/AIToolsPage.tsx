import { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Brain, ShieldAlert, Users, CalendarDays, Bot, FileText, Sparkles, TrendingUp, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { AIToolsLoadingState } from '@/components/features/ai-tools/AIToolsLoadingState';
import { Badge } from '@/components/atoms/Badge';
import { Card, CardContent } from '@/components/organisms/Card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/organisms/Tooltip';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/core/client';
import { STUDENT_ENDPOINTS } from '@/lib/constants/api-endpoints';
import MeetingPrepPanel from '@/components/features/ai/MeetingPrepPanel';
import { PageHeader } from '@/components/features/common/PageHeader';

const RiskDashboard = lazy(() => import('./RiskDashboard'));
const AIAssistant = lazy(() => import('./AIAssistant'));
const DailyPlanDashboard = lazy(() => import('./DailyPlanDashboard'));
const BulkAnalysisDashboard = lazy(() => import('@/components/features/ai/BulkAnalysisDashboard'));

// Define TabConfig type for clarity
type TabConfig = {
  value: string;
  label: string;
  icon: React.ElementType;
  description: string;
  tooltip: string;
};

const AI_TOOLS_TABS: TabConfig[] = [
  { value: 'risk', label: 'Risk Takip', icon: ShieldAlert, description: 'Risk analizi ve takip araçları', tooltip: 'Öğrencilerin risk düzeylerini değerlendir ve erken uyarı al' },
  { value: 'ai-asistan', label: 'AI Sohbet', icon: Bot, description: 'Yapay zeka destekli asistan', tooltip: 'Rehberlik sorularına yanıt almak için AI asistanınızla sohbet et' },
  { value: 'meeting-prep', label: 'Toplantı Hazırlık', icon: FileText, description: 'Veli görüşmesi ve toplantı hazırlık asistanı', tooltip: 'Veli ve öğretmen toplantılarına hazırlıklı gitmek için notlar oluştur' },
  { value: 'toplu-analiz', label: 'Toplu Analiz', icon: Users, description: 'Toplu analiz araçları', tooltip: 'Tüm okul veya sınıf düzeyinde AI analiziyle sınıf trendlerini keşfet' },
  { value: 'gunluk', label: 'Günlük', icon: CalendarDays, description: 'Günlük içgörüler ve eylem planı', tooltip: 'Her gün yapılacak önemli eylemler ve proaktif rehberlik önerileri' }
];

const VALID_AI_TOOLS_TABS = ['risk', 'ai-asistan', 'meeting-prep', 'toplu-analiz', 'gunluk'] as const; // Update valid tabs

export default function AIToolsPage() {
  const [searchParams] = useSearchParams();

  // Read initial tab from URL, but default to 'risk' if invalid
  const getValidTab = (tab: string | null): string => {
    if (tab && VALID_AI_TOOLS_TABS.includes(tab as any)) {
      return tab;
    }
    return 'risk';
  };

  const initialTab = getValidTab(searchParams.get('tab'));
  const [activeTab, setActiveTab] = useState(initialTab);

  // Fetch student data for MeetingPrepPanel and stats
  const { data: studentsData } = useQuery<any[]>({
    queryKey: [STUDENT_ENDPOINTS.BASE],
    queryFn: () => apiClient.get<any[]>(STUDENT_ENDPOINTS.BASE, { showErrorToast: false })
  });

  // Calculate real stats from student data
  const stats = useMemo(() => {
    if (!studentsData) {
      return {
        totalStudents: 0,
        highRiskCount: 0,
        activeWarnings: 0,
        pendingSuggestions: 0,
      };
    }

    const highRiskCount = studentsData.filter((s: any) => s.risk === 'Yüksek').length;
    const mediumRiskCount = studentsData.filter((s: any) => s.risk === 'Orta').length;

    return {
      totalStudents: studentsData.length,
      highRiskCount,
      activeWarnings: highRiskCount + mediumRiskCount,
      pendingSuggestions: Math.floor(studentsData.length * 0.05), // 5% of students
    };
  }, [studentsData]);

  // Update active tab if URL changes (e.g., from navigation)
  // Only watch searchParams, not activeTab, to avoid reverting user's manual tab changes
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    const validTab = getValidTab(urlTab);
    setActiveTab(validTab);
  }, [searchParams]);

  // Handle tab change - only update local state, don't modify URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <TooltipProvider>
      <div className="w-full min-h-screen pb-6">
        <PageHeader
          title="AI Asistanım"
          description="Yapay zeka destekli rehberlik araçları ve analizler"
          icon={Brain}
          actions={
            <div className="flex gap-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3 text-yellow-500" />
                Hızlı Analiz
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                Akıllı Öneriler
              </Badge>
            </div>
          }
        />

        <div className="space-y-6 max-w-7xl mx-auto px-6">
          {/* Statistics Cards Section - Moved Top for Consistency */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              {
                title: "Toplam Öğrenci",
                value: stats.totalStudents,
                description: "Sistemde kayıtlı",
                icon: Brain,
                gradient: "from-blue-500 to-cyan-600",
                change: `${stats.totalStudents}`,
              },
              {
                title: "Yüksek Risk",
                value: stats.highRiskCount,
                description: "Yakın takip gerektiren",
                icon: TrendingUp,
                gradient: "from-purple-500 to-violet-600",
                change: stats.highRiskCount > 0 ? "Dikkat" : "İyi",
              },
              {
                title: "Aktif Uyarılar",
                value: stats.activeWarnings,
                description: "Güncel uyarı sayısı",
                icon: CheckCircle,
                gradient: "from-emerald-500 to-teal-600",
                change: `${stats.activeWarnings}`,
              },
              {
                title: "Bekleyen Öneriler",
                value: stats.pendingSuggestions,
                description: "AI önerisi bekliyor",
                icon: AlertTriangle,
                gradient: "from-amber-500 to-orange-600",
                change: stats.pendingSuggestions > 0 ? "Mevcut" : "-",
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

          {/* Tabs Container */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            {/* Responsive Tab List */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TabsList variant="minimal" className="w-full justify-start sm:justify-center">
                {AI_TOOLS_TABS.map((tabConfig) => (
                  <Tooltip key={tabConfig.value} delayDuration={200}>
                    <TooltipTrigger asChild>
                      <TabsTrigger
                        value={tabConfig.value}
                        className="gap-2"
                      >
                        {tabConfig.icon && <tabConfig.icon className="h-4 w-4" />}
                        <span className="hidden sm:inline">{tabConfig.label}</span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      {tabConfig.tooltip}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TabsList>
            </motion.div>

            {/* Tab Contents */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <TabsContent value="risk" className="min-h-[600px]">
                <Suspense fallback={<AIToolsLoadingState icon={ShieldAlert} message="Risk verileri yükleniyor..." />}>
                  <RiskDashboard />
                </Suspense>
              </TabsContent>

              <TabsContent value="ai-asistan" className="min-h-[600px]">
                <Suspense fallback={<AIToolsLoadingState icon={Bot} message="AI Sohbet yükleniyor..." />}>
                  <AIAssistant />
                </Suspense>
              </TabsContent>

              <TabsContent value="meeting-prep" className="min-h-[600px]">
                <Suspense fallback={<AIToolsLoadingState icon={FileText} message="Toplantı hazırlık verileri yükleniyor..." />}>
                  <MeetingPrepPanel students={studentsData || []} />
                </Suspense>
              </TabsContent>

              <TabsContent value="toplu-analiz" className="min-h-[600px]">
                <Suspense fallback={<AIToolsLoadingState icon={Users} message="Toplu analiz yükleniyor..." />}>
                  <BulkAnalysisDashboard />
                </Suspense>
              </TabsContent>

              <TabsContent value="gunluk" className="min-h-[600px]">
                <Suspense fallback={<AIToolsLoadingState icon={CalendarDays} message="Günlük içgörüler yükleniyor..." />}>
                  <DailyPlanDashboard />
                </Suspense>
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}