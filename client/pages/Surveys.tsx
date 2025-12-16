import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import {
  Plus,
  ClipboardList,
  FileText,
  Send,
  MessageSquare,
  BarChart3,
  Brain,
  Sparkles,
  RotateCcw
} from "lucide-react";
import { PageHeader } from "@/components/features/common/PageHeader";
import {
  useSurveyTemplates,
  useSurveyDistributions,
  useTemplateQuestions,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useCreateDistribution,
  useUpdateDistribution,
  useDeleteDistribution
} from "@/hooks/features/surveys";
import { useToast } from "@/hooks/utils/toast.utils";
import { SurveyTemplate, SurveyResponse } from "@/lib/survey-types";
import SurveyCreationDialog from "@/components/features/surveys/SurveyCreationDialog";
import SurveyDistributionDialog from "@/components/features/surveys/SurveyDistributionDialog";
import SurveyDistributionEditDialog from "@/components/features/surveys/SurveyDistributionEditDialog";
import SurveyTemplateEditDialog from "@/components/features/surveys/SurveyTemplateEditDialog";
import SurveyAnalyticsTab from "@/components/features/surveys/SurveyAnalyticsTab";
import TemplatesList from "@/components/features/surveys/TemplatesList";
import DistributionsList from "@/components/features/surveys/DistributionsList";
import SurveyResponsesList from "@/components/features/surveys/SurveyResponsesList";
import TemplateSelector from "@/components/features/surveys/TemplateSelector";
import SurveyAIAnalysis from "@/components/features/ai/SurveyAIAnalysis";
import SurveyStatsCards from "@/components/features/surveys/SurveyStatsCards";
import { useSurveyStats } from "@/hooks/features/surveys/survey-stats.hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/core/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/organisms/AlertDialog";

export default function Surveys() {
  const { toast } = useToast();
  const { data: templates = [], isLoading: templatesLoading } = useSurveyTemplates();
  const { data: distributions = [], isLoading: distributionsLoading } = useSurveyDistributions();

  const { data: allResponses = [] } = useQuery<SurveyResponse[]>({
    queryKey: ['survey-responses-all'],
    queryFn: () => apiClient.get('/api/surveys/responses'),
  });

  const stats = useSurveyStats(templates, distributions, allResponses);

  const [selectedTemplate, setSelectedTemplate] = useState<SurveyTemplate | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const { data: questions = [] } = useTemplateQuestions(selectedTemplateId, !!selectedTemplateId);

  const [selectedDistributionForAI, setSelectedDistributionForAI] = useState<any>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showDistributionDialog, setShowDistributionDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SurveyTemplate | null>(null);
  const [editingDistribution, setEditingDistribution] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const queryClient = useQueryClient();

  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const createDistribution = useCreateDistribution();

  const loading = templatesLoading || distributionsLoading;

  const handleCreateDistribution = async (template: SurveyTemplate) => {
    setSelectedTemplateId(template.id);
    setSelectedTemplate(template);
    setShowDistributionDialog(true);
  };

  const handleDistributionCreated = async (distributionData: any) => {
    await createDistribution.mutateAsync({
      ...distributionData,
      templateId: selectedTemplate?.id,
    });

    setSelectedTemplate(null);
    setSelectedTemplateId("");
    setShowDistributionDialog(false);
  };

  const handleNewDistribution = () => {
    setShowTemplateSelector(true);
  };

  const handleTemplateSelected = async (template: SurveyTemplate) => {
    setShowTemplateSelector(false);
    setSelectedTemplateId(template.id);
    setSelectedTemplate(template);
    setShowDistributionDialog(true);
  };

  const handleEditTemplate = async (template: SurveyTemplate) => {
    setEditingTemplate(template);
    setShowEditDialog(true);
  };

  const handleDuplicateTemplate = async (template: SurveyTemplate) => {
    const duplicatedTemplate = {
      ...template,
      id: `${template.id}_copy_${Date.now()}`,
      title: `${template.title} (Kopya)`,
      createdAt: new Date().toISOString(),
    };

    await createTemplate.mutateAsync(duplicatedTemplate);
  };

  const handleDeleteTemplate = async (template: SurveyTemplate) => {
    if (!confirm(`"${template.title}" anket şablonunu silmek istediğinizden emin misiniz?`)) {
      return;
    }

    await deleteTemplate.mutateAsync(template.id);
  };

  const handleResetToDefaults = async () => {
    try {
      setIsResetting(true);
      const response = await apiClient.post<{ success: boolean; message?: string; error?: string }>('/api/surveys/survey-templates/reset');

      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ['survey-templates'] });
        await queryClient.invalidateQueries({ queryKey: ['survey-questions'] });
        toast({
          title: 'Başarılı',
          description: 'Anket şablonları varsayılana sıfırlandı',
        });
      } else {
        throw new Error(response.error || 'Sıfırlama başarısız');
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: error instanceof Error ? error.message : 'Sıfırlama sırasında bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
      setResetDialogOpen(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Anketler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-6">
      {/* Modern Gradient Header */}
      <PageHeader
        title="Ölçek & Anketler"
        description="Modern ölçek ve anket yönetimi sistemi"
        icon={ClipboardList}
        actions={
          <div className="flex flex-wrap gap-2">
            <SurveyCreationDialog>
              <Button
                size="default"
              >
                <Plus className="mr-2 h-4 w-4" />
                Yeni Anket Oluştur
              </Button>
            </SurveyCreationDialog>

            <Button
              size="default"
              variant="outline"
              onClick={() => setResetDialogOpen(true)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Varsayılana Sıfırla
            </Button>
          </div>
        }
      />

      <div className="space-y-6 max-w-7xl mx-auto px-6">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <SurveyStatsCards stats={stats} isLoading={templatesLoading || distributionsLoading} />
        </motion.div>

        {/* Modern Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs defaultValue="templates" className="space-y-4">
            <TabsList variant="minimal" className="w-full justify-start sm:justify-center">
              <TabsTrigger value="templates" variant="minimal">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Şablonlar</span>
              </TabsTrigger>
              <TabsTrigger value="distributions" variant="minimal">
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Dağıtımlar</span>
              </TabsTrigger>
              <TabsTrigger value="responses" variant="minimal">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Yanıtlar</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" variant="minimal">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analiz</span>
              </TabsTrigger>
              <TabsTrigger value="ai-analysis" variant="minimal">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">AI Analiz</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <TemplatesList
                templates={templates}
                onDistribute={handleCreateDistribution}
                onEdit={handleEditTemplate}
                onDuplicate={handleDuplicateTemplate}
                onDelete={handleDeleteTemplate}
              />
            </TabsContent>

            <TabsContent value="distributions" className="space-y-4">
              <DistributionsList
                distributions={distributions}
                onNewDistribution={handleNewDistribution}
                onEdit={(distribution) => setEditingDistribution(distribution)}
              />
            </TabsContent>

            <TabsContent value="responses" className="space-y-4">
              <SurveyResponsesList distributions={distributions} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <SurveyAnalyticsTab distributions={distributions} />
            </TabsContent>

            <TabsContent value="ai-analysis" className="space-y-4">
              {distributions.length > 0 ? (
                <div className="space-y-4">
                  <Card className="border-muted">
                    <CardHeader>
                      <CardTitle>Dağıtım Seçin</CardTitle>
                      <CardDescription>AI analizi için bir anket dağıtımı seçin</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {distributions.map((dist: any) => (
                          <Button
                            key={dist.id}
                            variant="outline"
                            className="justify-start h-auto p-4"
                            onClick={() => setSelectedDistributionForAI(dist)}
                          >
                            <div className="text-left">
                              <div className="font-medium">{dist.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {dist.targetClasses?.join(', ') || 'Tüm Sınıflar'} • {dist.startDate ? new Date(dist.startDate).toLocaleDateString('tr-TR') : 'Tarih belirtilmedi'}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {selectedDistributionForAI && (
                    <SurveyAIAnalysis distributionId={String(selectedDistributionForAI.id)} />
                  )}
                </div>
              ) : (
                <Card className="border-muted">
                  <CardContent className="py-16 text-center">
                    <ClipboardList className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz anket dağıtımı bulunmuyor</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <TemplateSelector
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        templates={templates}
        onSelect={handleTemplateSelected}
      />

      {selectedTemplate && questions.length > 0 && (
        <SurveyDistributionDialog
          open={showDistributionDialog}
          onOpenChange={(open) => {
            setShowDistributionDialog(open);
            if (!open) {
              setSelectedTemplate(null);
              setSelectedTemplateId("");
            }
          }}
          survey={selectedTemplate}
          questions={questions}
          onDistributionCreated={handleDistributionCreated}
        >
          <div />
        </SurveyDistributionDialog>
      )}

      {editingDistribution && (
        <SurveyDistributionEditDialog
          open={!!editingDistribution}
          onOpenChange={(open) => !open && setEditingDistribution(null)}
          distribution={editingDistribution}
          onEditComplete={() => setEditingDistribution(null)}
        />
      )}

      {editingTemplate && (
        <SurveyTemplateEditDialog
          open={!!editingTemplate}
          onOpenChange={(open) => !open && setEditingTemplate(null)}
          template={editingTemplate}
          onEditComplete={() => setEditingTemplate(null)}
        />
      )}

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Varsayılana Sıfırla</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem tüm özel anket şablonlarınızı silecek ve varsayılan anketleri geri yükleyecektir.
              Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetToDefaults} disabled={isResetting}>
              {isResetting ? 'Sıfırlanıyor...' : 'Sıfırla'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
