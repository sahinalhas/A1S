import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth, PermissionGuard, getExportPermissions } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/organisms/Dialog";

// Analytics Components
import PredictiveAnalysis from "@/components/features/analytics/PredictiveAnalysis";
import ComparativeReports from "@/components/features/analytics/ComparativeReports";
import ProgressCharts from "@/components/features/analytics/ProgressCharts";
import EarlyWarningSystem from "@/components/features/analytics/EarlyWarningSystem";

// Chart Components
import {
  RiskDistributionChart,
  ClassComparisonChart,
  EarlyWarningIndicator,
} from "@/components/features/charts/AnalyticsCharts";

// Analytics Functions
import {
  exportAnalyticsData,
} from "@/lib/analytics";

import {
  getReportsOverview,
} from "@/lib/api/endpoints/analytics.api";

import {
  BarChart3,
  TrendingUp,
  Users,
  AlertTriangle,
  Award,
  Download,
  Filter,
  Settings,
  RefreshCw,
  Sparkles,
  PieChart,
  Brain,
  Mail,
  LineChart,
} from "lucide-react";
import { PageHeader } from "@/components/features/common/PageHeader";

// =================== OVERVIEW DASHBOARD ===================

function OverviewDashboard({
  overallStats,
  riskDistribution,
  classComparisonData,
  setActiveTab,
  reportsData
}: any) {

  return (
    <div className="space-y-6">
      {/* Uyarı Özeti */}
      {overallStats.activeWarnings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative overflow-hidden border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800 relative z-10">
                <div className="p-2 rounded-lg bg-orange-100">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                Aktif Uyarılar
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-orange-800">
                    {overallStats.activeWarnings}
                  </div>
                  <div className="text-sm text-orange-600 mt-1">
                    {overallStats.criticalWarnings > 0 && (
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        {overallStats.criticalWarnings} kritik uyarı
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('warnings')}
                  className="bg-white hover:bg-orange-50 border-orange-200"
                >
                  Detayları Görüntüle
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDistributionChart data={riskDistribution} />
        <ClassComparisonChart data={classComparisonData} />
      </div>

      {/* Son Uyarılar */}
      {reportsData && reportsData.topWarnings.length > 0 && (
        <EarlyWarningIndicator warnings={reportsData.topWarnings} maxDisplay={5} />
      )}
    </div>
  );
}

// =================== EXPORT & SETTINGS ===================

function ExportSettings() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [reportType, setReportType] = useState<string>("all");
  const [includePersonalData, setIncludePersonalData] = useState(false);

  const exportPermissions = useMemo(() => {
    return user ? getExportPermissions(user.role) : { canExportAll: false, canExportFiltered: false, allowedFormats: [] };
  }, [user]);

  const handleExport = async () => {
    if (!exportPermissions.canExportFiltered && !exportPermissions.canExportAll) {
      alert('Bu işlem için yetkiniz bulunmamaktadır.');
      return;
    }

    if (!exportPermissions.allowedFormats.includes(exportFormat)) {
      alert(`${exportFormat.toUpperCase()} formatında dışa aktarma izniniz bulunmamaktadır.`);
      return;
    }

    try {
      const rawData = await exportAnalyticsData({
        includePersonalData: includePersonalData && hasPermission('view_sensitive_data'),
      });

      const dataString = exportFormat === "json"
        ? JSON.stringify(rawData, null, 2)
        : convertToCSV(rawData);

      const blob = new Blob([dataString], {
        type: exportFormat === "json" ? "application/json" : "text/csv"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert('Rapor ihracı sırasında hata oluştu.');
    }
  };

  function convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(field => JSON.stringify(row[field] || '')).join(','))
    ];
    return csvRows.join('\n');
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Rapor İhracı
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Rapor Türü</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Raporlar</SelectItem>
                  <SelectItem value="predictive">Prediktif Analiz</SelectItem>
                  <SelectItem value="comparative">Karşılaştırmalı</SelectItem>
                  <SelectItem value="progress">İlerleme Takibi</SelectItem>
                  <SelectItem value="warnings">Erken Uyarılar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Format</label>
              <Select
                value={exportFormat}
                onValueChange={(value) => setExportFormat(value as "json" | "csv")}
                disabled={!exportPermissions.canExportFiltered}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportPermissions.allowedFormats.includes('json') && (
                    <SelectItem value="json">JSON</SelectItem>
                  )}
                  {exportPermissions.allowedFormats.includes('csv') && (
                    <SelectItem value="csv">CSV</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasPermission('view_sensitive_data') && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includePersonalData"
                checked={includePersonalData}
                onChange={(e) => setIncludePersonalData(e.target.checked)}
              />
              <label htmlFor="includePersonalData" className="text-sm">
                Kişisel verileri dahil et
              </label>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              className="gap-2"
              disabled={!exportPermissions.canExportFiltered && !exportPermissions.canExportAll}
            >
              <Download className="h-4 w-4" />
              Raporu İndir
            </Button>
            <PermissionGuard permission="export_all_data">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  alert('E-posta gönderme özelliği yakında eklenecek. Şu an için raporu indirip manuel olarak gönderebilirsiniz.');
                }}
              >
                <Mail className="h-4 w-4" />
                E-posta Gönder
              </Button>
            </PermissionGuard>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Rapor Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Otomatik Rapor</div>
                <div className="text-sm text-muted-foreground">
                  Haftalık otomatik rapor oluşturma
                </div>
              </div>
              <Badge variant="outline">Kapalı</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Uyarı Bildirimleri</div>
                <div className="text-sm text-muted-foreground">
                  Kritik uyarılar için e-posta bildirimi
                </div>
              </div>
              <Badge >Açık</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Veri Saklama</div>
                <div className="text-sm text-muted-foreground">
                  Analitik verilerin saklama süresi
                </div>
              </div>
              <Badge variant="outline">12 Ay</Badge>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/ayarlar')}
          >
            Ayarları Düzenle
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// =================== MAIN REPORTS PAGE ===================

export default function Reports() {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(["overview"]));
  const [refreshKey, setRefreshKey] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Moved data fetching to main component to show stats above tabs
  const { data: reportsData, isLoading: loading, error } = useQuery({
    queryKey: ['reports-overview'],
    queryFn: getReportsOverview,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const overallStats = useMemo(() => {
    if (!reportsData) {
      return {
        totalStudents: 0,
        averageSuccessRate: 0,
        highSuccessCount: 0,
        atRiskCount: 0,
        criticalWarnings: 0,
        activeWarnings: 0,
      };
    }

    const avgSuccess = reportsData.studentAnalytics.length > 0
      ? reportsData.studentAnalytics.reduce((sum, s) => sum + s.successProbability, 0) / reportsData.studentAnalytics.length
      : 0;

    return {
      totalStudents: reportsData.totalStudents,
      averageSuccessRate: Math.round(avgSuccess),
      highSuccessCount: reportsData.riskDistribution.düşük,
      atRiskCount: reportsData.riskDistribution.yüksek + reportsData.riskDistribution.kritik,
      criticalWarnings: reportsData.topWarnings.filter(w => w.severity === 'kritik').length,
      activeWarnings: reportsData.topWarnings.length,
    };
  }, [reportsData]);

  const riskDistribution = useMemo(() => {
    if (!reportsData) return [];
    return [
      { name: "Düşük", value: reportsData.riskDistribution.düşük },
      { name: "Orta", value: reportsData.riskDistribution.orta },
      { name: "Yüksek", value: reportsData.riskDistribution.yüksek + reportsData.riskDistribution.kritik },
    ];
  }, [reportsData]);

  const classComparisonData = useMemo(() => {
    if (!reportsData) return [];
    return reportsData.classComparisons.map(cls => ({
      category: cls.className,
      current: cls.averageGPA,
      previous: cls.averageGPA * 0.95,
      target: 3.5,
    }));
  }, [reportsData]);

  const statsCards = useMemo(() => [
    {
      title: "Toplam Uyarı",
      value: overallStats.totalStudents,
      description: "Sistemde kayıtlı öğrenci",
      icon: Users,
      gradient: "from-blue-500 to-cyan-600",
      change: `${overallStats.totalStudents}`,
    },
    {
      title: "Kritik Uyarılar",
      value: overallStats.criticalWarnings,
      description: "Acil müdahale gerektiren",
      icon: AlertTriangle,
      gradient: "from-red-500 to-rose-600",
      change: overallStats.criticalWarnings > 0 ? "Dikkat" : "İyi",
    },
    {
      title: "Yüksek Risk",
      value: overallStats.atRiskCount,
      description: "Yakın takip gerektiren",
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-600",
      change: `${overallStats.atRiskCount}`,
    },
    {
      title: "Risk Dağılımı",
      value: `%${overallStats.totalStudents > 0 ? Math.round((overallStats.highSuccessCount / overallStats.totalStudents) * 100) : 0}`,
      description: "Düşük risk oranı",
      icon: Award,
      gradient: "from-emerald-500 to-teal-600",
      change: "İyi",
    },
  ], [overallStats]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setLoadedTabs(prev => new Set(prev).add(tab));
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setLoadedTabs(new Set([activeTab]));
  };

  const exportPermissions = useMemo(() => {
    return user ? getExportPermissions(user.role) : { canExportAll: false, canExportFiltered: false, allowedFormats: [] };
  }, [user]);

  const handleHeaderExport = async () => {
    if (!exportPermissions.canExportFiltered && !exportPermissions.canExportAll) {
      alert('Bu işlem için yetkiniz bulunmamaktadır.');
      return;
    }

    if (!exportPermissions.allowedFormats || exportPermissions.allowedFormats.length === 0) {
      alert('İzin verilen dışa aktarma formatı bulunamadı.');
      return;
    }

    const format = exportPermissions.allowedFormats[0] as "json" | "csv";

    try {
      const rawData = await exportAnalyticsData({
        includePersonalData: hasPermission('view_sensitive_data'),
      });

      const dataString = format === "json"
        ? JSON.stringify(rawData, null, 2)
        : convertToCSV(rawData);

      const mimeType = format === "json" ? "application/json" : "text/csv";
      const blob = new Blob([dataString], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert('Rapor ihracı sırasında hata oluştu.');
    }
  };

  function convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(field => JSON.stringify(row[field] || '')).join(','))
    ];
    return csvRows.join('\n');
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Giriş Gerekli</h2>
          <p className="text-muted-foreground">Bu sayfaya erişmek için giriş yapmanız gerekiyor.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
          <p className="text-muted-foreground">Raporlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-6">
      <PageHeader
        title="Analiz & Raporlar"
        description="Öğrenci başarı analizleri, karşılaştırmalı raporlar ve erken uyarı sistemi"
        icon={BarChart3}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleRefresh}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button
              onClick={() => setFiltersOpen(true)}
              size="sm"
              variant="outline"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtreler
            </Button>
            <Button
              onClick={handleHeaderExport}
              size="sm"
              className="bg-primary hover:bg-primary/90"
              disabled={!exportPermissions.canExportFiltered && !exportPermissions.canExportAll}
            >
              <Download className="h-4 w-4 mr-2" />
              Rapor İndir
            </Button>
          </div>
        }
      />

      <div className="space-y-6 max-w-7xl mx-auto px-6">
        {/* Global Statistics Cards - Above Tabs */}
        {!error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {statsCards.map((card, index) => (
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
        )}

        {/* Ana İçerik */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList variant="minimal" className="w-full justify-start sm:justify-center">
              <TabsTrigger value="overview" variant="minimal">
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Genel Bakış</span>
              </TabsTrigger>
              <TabsTrigger value="predictive" variant="minimal">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Prediktif</span>
              </TabsTrigger>
              <TabsTrigger value="comparative" variant="minimal">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Karşılaştırmalı</span>
              </TabsTrigger>
              <TabsTrigger value="progress" variant="minimal">
                <LineChart className="h-4 w-4" />
                <span className="hidden sm:inline">İlerleme</span>
              </TabsTrigger>
              <TabsTrigger value="warnings" variant="minimal">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Erken Uyarı</span>
              </TabsTrigger>
              <TabsTrigger value="settings" variant="minimal">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Ayarlar</span>
              </TabsTrigger>
            </TabsList>

            {/* Error State for Tabs */}
            {error ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-destructive">Rapor verileri yüklenirken bir hata oluştu</p>
                  <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-4">
                    Tekrar Dene
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {activeTab === "overview" && (
                  <div className="mt-4">
                    <OverviewDashboard
                      overallStats={overallStats}
                      riskDistribution={riskDistribution}
                      classComparisonData={classComparisonData}
                      setActiveTab={setActiveTab}
                      reportsData={reportsData}
                    />
                  </div>
                )}

                {activeTab === "predictive" && (
                  <div className="mt-4">
                    <PermissionGuard
                      permission="view_predictive_analysis"
                      fallback={
                        <div className="text-center py-12 text-muted-foreground">
                          <p>Bu özelliğe erişim yetkiniz bulunmamaktadır.</p>
                        </div>
                      }
                    >
                      {loadedTabs.has("predictive") && <PredictiveAnalysis key={refreshKey} />}
                    </PermissionGuard>
                  </div>
                )}

                {/* Other tabs follow same pattern - truncated for brevity if unchanged */}
                {activeTab === "comparative" && (
                  <div className="mt-4">
                    <PermissionGuard permission="view_comparative_reports">
                      {loadedTabs.has("comparative") && <ComparativeReports key={refreshKey} />}
                    </PermissionGuard>
                  </div>
                )}

                {activeTab === "progress" && (
                  <div className="mt-4">
                    <PermissionGuard permission="view_progress_charts">
                      {loadedTabs.has("progress") && <ProgressCharts key={refreshKey} />}
                    </PermissionGuard>
                  </div>
                )}

                {activeTab === "warnings" && (
                  <div className="mt-4">
                    <PermissionGuard permission="view_early_warnings">
                      {loadedTabs.has("warnings") && <EarlyWarningSystem key={refreshKey} />}
                    </PermissionGuard>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="mt-4">
                    <ExportSettings />
                  </div>
                )}
              </>
            )}
          </Tabs>
        </motion.div>

        {/* Filtreler Dialog */}
        <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rapor Filtreleri</DialogTitle>
              <DialogDescription>
                Raporları filtrelemek için aşağıdaki seçenekleri kullanın
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tarih Aralığı</label>
                <Select defaultValue="30days">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Son 7 Gün</SelectItem>
                    <SelectItem value="30days">Son 30 Gün</SelectItem>
                    <SelectItem value="90days">Son 90 Gün</SelectItem>
                    <SelectItem value="1year">Son 1 Yıl</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sınıf</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Sınıflar</SelectItem>
                    <SelectItem value="9">9. Sınıf</SelectItem>
                    <SelectItem value="10">10. Sınıf</SelectItem>
                    <SelectItem value="11">11. Sınıf</SelectItem>
                    <SelectItem value="12">12. Sınıf</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Risk Düzeyi</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFiltersOpen(false)}>
                İptal
              </Button>
              <Button onClick={() => {
                setFiltersOpen(false);
                handleRefresh();
              }}>
                Filtreleri Uygula
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}