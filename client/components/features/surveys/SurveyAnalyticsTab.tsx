import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { StatCard } from "@/components/molecules/StatCard";
import { StatsGrid } from "@/components/molecules/StatsGrid";
import { 
  BarChart, 
  TrendingUp, 
  Users, 
  CheckCircle,
  FileText,
  Clock
} from "lucide-react";
import { SurveyDistribution } from "@/lib/survey-types";
import QuestionAnalyticsCard from "./analytics/QuestionAnalyticsCard";

interface SurveyAnalyticsTabProps {
  distributions: SurveyDistribution[];
}

interface AnalyticsData {
  distributionInfo: {
    id: string;
    title: string;
    templateTitle: string;
    status: string;
    totalTargets: number;
    totalResponses: number;
    responseRate: string;
  };
  overallStats: {
    averageCompletionTime: string;
    mostSkippedQuestion: any;
    satisfactionScore: string;
  };
  questionAnalytics: any[];
}

interface DistributionStats {
  totalResponses: number;
  completionRate: string;
  responsesByDay: { [key: string]: number };
  demographicBreakdown: any;
  submissionTypes: { [key: string]: number };
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge className="bg-green-100 text-green-700">Aktif</Badge>;
    case 'CLOSED':
      return <Badge className="bg-blue-100 text-blue-700">Kapandı</Badge>;
    case 'DRAFT':
      return <Badge variant="outline">Taslak</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR');
};

export default function SurveyAnalyticsTab({ distributions }: SurveyAnalyticsTabProps) {
  const [selectedDistribution, setSelectedDistribution] = useState<string>("");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [distributionStats, setDistributionStats] = useState<DistributionStats | null>(null);
  const [loading, setLoading] = useState(false);

  const activeDistributions = distributions.filter(d => 
    d.status === 'ACTIVE' || d.status === 'CLOSED'
  );

  useEffect(() => {
    if (selectedDistribution) {
      loadAnalytics();
    }
  }, [selectedDistribution]);

  const loadAnalytics = async () => {
    if (!selectedDistribution) return;

    try {
      setLoading(true);
      
      const analyticsResponse = await fetch(`/api/surveys/survey-analytics/${selectedDistribution}`);
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalyticsData(analyticsData);
      }

      const statsResponse = await fetch(`/api/surveys/survey-statistics/${selectedDistribution}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDistributionStats(statsData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setLoading(false);
    }
  };

  if (activeDistributions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Anket Analizleri</CardTitle>
          <CardDescription>
            Analiz yapabilmek için aktif veya tamamlanmış anket dağıtımlarınız olmalı
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart className="mx-auto h-12 w-12 mb-4" />
            <p>Henüz analiz edilecek anket dağıtımı bulunmuyor</p>
            <p className="text-sm">Önce anket dağıtımları oluşturun ve yanıtları toplayın</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Anket Analizi Seçimi</CardTitle>
            <CardDescription>
              Analiz yapmak istediğiniz anket dağıtımını seçin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedDistribution} onValueChange={setSelectedDistribution}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Anket dağıtımı seçin..." />
              </SelectTrigger>
              <SelectContent>
                {activeDistributions.map((distribution) => (
                  <SelectItem key={distribution.id} value={distribution.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{distribution.title}</span>
                      <div className="flex items-center gap-2 ml-4">
                        {getStatusBadge(distribution.status)}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(distribution.created_at)}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </motion.div>

      {selectedDistribution && (
        <>
          {loading ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <div className="text-lg">Analiz sonuçları yükleniyor...</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            analyticsData && (
              <div className="space-y-6">
                {/* Modern Stats Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <StatsGrid columns={4}>
                    <StatCard
                      title="Toplam Yanıt"
                      value={analyticsData.distributionInfo.totalResponses}
                      subtitle={`Hedef: ${analyticsData.distributionInfo.totalTargets}`}
                      icon={Users}
                      gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                      delay={0}
                    />
                    <StatCard
                      title="Yanıt Oranı"
                      value={analyticsData.distributionInfo.responseRate}
                      subtitle="Katılım oranı"
                      icon={TrendingUp}
                      gradient="bg-gradient-to-br from-green-500 to-green-600"
                      delay={0.1}
                    />
                    <StatCard
                      title="Memnuniyet"
                      value={analyticsData.overallStats.satisfactionScore !== 'N/A' ? 
                        analyticsData.overallStats.satisfactionScore : '-'}
                      subtitle="Genel memnuniyet"
                      icon={CheckCircle}
                      gradient="bg-gradient-to-br from-amber-500 to-amber-600"
                      delay={0.2}
                    />
                    <StatCard
                      title="Ortalama Süre"
                      value={analyticsData.overallStats.averageCompletionTime}
                      subtitle="Tamamlama süresi"
                      icon={Clock}
                      gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                      delay={0.3}
                    />
                  </StatsGrid>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{analyticsData.distributionInfo.title}</CardTitle>
                      <CardDescription>
                        Şablon: {analyticsData.distributionInfo.templateTitle} • {getStatusBadge(analyticsData.distributionInfo.status)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {analyticsData.overallStats.mostSkippedQuestion && (
                          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">En Çok Atlanan Soru</h4>
                            <p className="text-sm mb-1">{analyticsData.overallStats.mostSkippedQuestion.questionText}</p>
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                              {analyticsData.overallStats.mostSkippedQuestion.skipRate} atlanma oranı
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Soru Bazlı Analiz</CardTitle>
                      <CardDescription>
                        Her sorunun detaylı istatistikleri
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.questionAnalytics.map((question) => (
                          <QuestionAnalyticsCard key={question.questionId} question={question} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {distributionStats && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>İstatistikler</CardTitle>
                        <CardDescription>
                          Ek analizler ve demografik bilgiler
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <h4 className="font-medium mb-3 text-blue-900 dark:text-blue-100">Gönderim Türleri</h4>
                            <div className="space-y-2">
                              {Object.entries(distributionStats.submissionTypes).map(([type, count]) => (
                                <div key={type} className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">{type === 'ONLINE' ? 'Online' : 'Excel Yükleme'}</span>
                                  <span className="font-medium">{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {distributionStats.demographicBreakdown?.byClass && Object.keys(distributionStats.demographicBreakdown.byClass).length > 0 && (
                            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800">
                              <h4 className="font-medium mb-3 text-purple-900 dark:text-purple-100">Sınıf Bazlı Dağılım</h4>
                              <div className="space-y-2">
                                {Object.entries(distributionStats.demographicBreakdown.byClass).map(([className, count]) => (
                                  <div key={className} className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">{className}</span>
                                    <span className="font-medium">{count as number}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
