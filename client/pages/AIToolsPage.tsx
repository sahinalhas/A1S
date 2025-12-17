import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Brain, Bot, Calendar, Sparkles, TrendingUp } from 'lucide-react';
import { AIToolsLoadingState } from '@/components/features/ai-tools/AIToolsLoadingState';
import { Badge } from '@/components/atoms/Badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/organisms/Tooltip';
import { PageHeader } from '@/components/features/common/PageHeader';

const AIAssistant = lazy(() => import('./AIAssistant'));
const DailyControlPanel = lazy(() => import('./DailyControlPanel'));

type TabConfig = {
  value: string;
  label: string;
  icon: React.ElementType;
  description: string;
  tooltip: string;
};

const AI_TOOLS_TABS: TabConfig[] = [
  { value: 'ai-asistan', label: 'AI Asistan', icon: Bot, description: 'Öğrenci bazlı sohbet ve toplantı hazırlıkları', tooltip: 'Öğrenci bazlı AI sohbet, analiz ve toplantı hazırlık asistanı' },
  { value: 'gunluk-kontrol', label: 'Günlük Kontrol', icon: Calendar, description: 'Bugünkü öncelikler ve eylem planı', tooltip: 'Bugünkü kritik uyarılar, öncelikler ve yüksek riskli öğrenciler' },
];

const VALID_AI_TOOLS_TABS = ['ai-asistan', 'gunluk-kontrol'] as const;

export default function AIToolsPage() {
  const [searchParams] = useSearchParams();

  const getValidTab = (tab: string | null): string => {
    if (tab && VALID_AI_TOOLS_TABS.includes(tab as any)) {
      return tab;
    }
    return 'ai-asistan';
  };

  const initialTab = getValidTab(searchParams.get('tab'));
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const urlTab = searchParams.get('tab');
    const validTab = getValidTab(urlTab);
    setActiveTab(validTab);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <TooltipProvider>
      <div className="w-full min-h-screen pb-6">
        <PageHeader
          title="AI Asistanım"
          description="Yapay zeka destekli rehberlik araçları"
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
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
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

            <TabsContent value="ai-asistan" className="min-h-[600px]">
              <Suspense fallback={<AIToolsLoadingState icon={Bot} message="AI Asistan yükleniyor..." />}>
                <AIAssistant />
              </Suspense>
            </TabsContent>

            <TabsContent value="gunluk-kontrol" className="min-h-[600px]">
              <Suspense fallback={<AIToolsLoadingState icon={Calendar} message="Günlük kontrol paneli yükleniyor..." />}>
                <DailyControlPanel />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}