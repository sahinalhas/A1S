import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { 
  Loader2, 
  MessageSquare, 
  Target, 
  FileText, 
  ClipboardCheck, 
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download as DownloadIcon
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/organisms/Dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import { Button } from "@/components/atoms/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Switch } from "@/components/atoms/Switch";
import { Slider } from "@/components/atoms/Slider";
import { Calendar } from "@/components/organisms/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/organisms/Popover";
import { Badge } from "@/components/atoms/Badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/organisms/Collapsible";
import { useToast } from "@/hooks/utils/toast.utils";

import { completeSessionSchema, type CompleteSessionFormValues, type CounselingSession, type CounselingTopic } from "../types";
import CounselingTopicSelector from "./CounselingTopicSelector";
import ActionItemsManager from "./ActionItemsManager";
import AIAnalysisPreview from "../ai/AIAnalysisPreview";
import { useAISessionAnalysis } from "@/hooks/features/counseling/useAISessionAnalysis";
import { cn } from "@/lib/utils";
import { generateSessionCompletionPDF } from "../utils/sessionCompletionPDF";
import { useSettings } from "@/hooks/queries/settings.query-hooks";
import { apiClient } from "@/lib/api/core/client";
import type { Student } from "@/lib/types/student.types";
import { useAuth } from "@/lib/auth-context";

interface EnhancedCompleteSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: CounselingSession | null;
  topics: CounselingTopic[];
  onSubmit: (data: CompleteSessionFormValues) => void;
  isPending: boolean;
}

export default function EnhancedCompleteSessionDialog({
  open,
  onOpenChange,
  session,
  topics,
  onSubmit,
  isPending,
}: EnhancedCompleteSessionDialogProps) {
  const [activeTab, setActiveTab] = useState("summary");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [actionItemsOpen, setActionItemsOpen] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const { toast } = useToast();
  const { data: settings } = useSettings();
  const { user, selectedSchool } = useAuth();

  const { analyzeSession, analysis, isAnalyzing, clearAnalysis } = useAISessionAnalysis();

  const { data: fullStudentData } = useQuery<Student | null>({
    queryKey: ['student-full-data', session?.student?.id],
    queryFn: async () => {
      if (!session?.student?.id) return null;
      try {
        const response = await apiClient.get<Student>(`/api/students/${session.student.id}`, { showErrorToast: false });
        return response || null;
      } catch {
        return null;
      }
    },
    enabled: !!session?.student?.id && open,
    staleTime: 5 * 60 * 1000,
  });

  const normalizeTopicValue = (topicValue: string | undefined): string => {
    if (!topicValue) return "";
    
    const topicById = topics.find(t => t.id === topicValue);
    if (topicById) return topicValue;
    
    const topicByTitle = topics.find(t => t.title === topicValue);
    if (topicByTitle) return topicByTitle.id;
    
    return topicValue;
  };

  const form = useForm<CompleteSessionFormValues>({
    resolver: zodResolver(completeSessionSchema) as any,
    mode: "onBlur",
    defaultValues: {
      topic: normalizeTopicValue(session?.topic),
      exitTime: new Date().toTimeString().slice(0, 5),
      detailedNotes: "",
      actionItems: [],
      followUpNeeded: false,
      cooperationLevel: 3,
      emotionalState: "sakin",
      physicalState: "normal",
      communicationQuality: "açık",
      followUpDate: undefined,
      followUpTime: undefined,
    },
  });

  const followUpNeeded = form.watch("followUpNeeded");

  useEffect(() => {
    if (followUpNeeded && !form.getValues("followUpDate")) {
      setDatePickerOpen(true);
    }
  }, [followUpNeeded]);

  const handleSubmit = (data: CompleteSessionFormValues) => {
    onSubmit(data);
    form.reset();
  };

  const handleDownloadPDF = async () => {
    if (!session) return;
    
    try {
      setIsDownloadingPDF(true);
      const formValues = form.getValues();
      const topic = topics.find(t => t.id === formValues.topic);
      const topicFullPath = topic?.fullPath;
      const schoolName = selectedSchool?.name;
      
      const studentData = fullStudentData ? {
        gender: fullStudentData.gender === 'K' ? 'Kız' : fullStudentData.gender === 'E' ? 'Erkek' : undefined,
        idNumber: fullStudentData.tcIdentityNo,
        studentNumber: fullStudentData.studentNumber,
        familyInfo: fullStudentData.livingWith,
        term: '1. Dönem',
        healthInfo: fullStudentData.healthNote || 'Sürekli hastalığı yok',
        specialEducationInfo: fullStudentData.tags?.includes('specialEducation') ? 'Evet' : 'Yok',
      } : undefined;
      
      const counselorName = settings?.account?.displayName || user?.name;
      await generateSessionCompletionPDF(session, formValues, topicFullPath, schoolName, undefined, studentData, counselorName);
      toast({
        title: "PDF İndirildi",
        description: "Görüşme raporu başarıyla indirildi",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "PDF oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleFormSubmit = () => {
    const errors = form.formState.errors;
    
    if (Object.keys(errors).length > 0) {
      if (errors.topic) {
        toast({
          title: 'Eksik bilgi',
          description: 'Görüşme konusu seçmelisiniz.',
          variant: 'destructive'
        });
        setActiveTab('summary');
        return;
      }
      
      if (errors.followUpDate || errors.followUpTime) {
        toast({
          title: 'Eksik bilgi',
          description: 'Takip görüşmesi için tarih ve saat seçmelisiniz.',
          variant: 'destructive'
        });
        setActiveTab('summary');
        return;
      }

      toast({
        title: 'Form hatası',
        description: 'Lütfen tüm gerekli alanları doldurun.',
        variant: 'destructive'
      });
    }
  };

  const getSubmitButtonText = () => {
    if (followUpNeeded) {
      return "Kaydet ve Takip Planla";
    }
    return "Görüşmeyi Kaydet";
  };

  const handleAIAnalyze = async () => {
    const rawNotes = form.getValues('detailedNotes');
    const selectedTopic = form.getValues('topic');

    if (!selectedTopic || selectedTopic.trim() === '') {
      toast({
        title: 'Görüşme konusu seçilmedi',
        description: 'Lütfen önce görüşme konusunu seçin',
        variant: 'destructive'
      });
      setActiveTab('summary');
      return;
    }

    if (!rawNotes || rawNotes.trim().length < 10) {
      toast({
        title: 'Yetersiz not',
        description: 'Analiz için en az 10 karakter uzunluğunda not yazın',
        variant: 'destructive'
      });
      return;
    }

    if (!session) {
      toast({
        title: 'Hata',
        description: 'Oturum bilgisi bulunamadı',
        variant: 'destructive'
      });
      return;
    }

    try {
      const studentId = session.sessionType === 'group' 
        ? session.students?.[0]?.id 
        : session.student?.id;
      
      if (!studentId) {
        throw new Error('Öğrenci ID bulunamadı');
      }

      const sessionDateTime = `${session.sessionDate}T${session.entryTime}:00`;
      
      const selectedTopicObj = topics.find(t => t.id === selectedTopic);
      const topicTitle = selectedTopicObj?.title || selectedTopic;
      const requestData = {
        rawNotes,
        sessionId: session.id,
        studentId,
        sessionType: session.sessionType,
        sessionDate: sessionDateTime,
        entryTime: session.entryTime,
        sessionTopic: topicTitle
      };
      
      await analyzeSession(requestData);
      setPreviewOpen(true);

      toast({
        title: 'Analiz tamamlandı',
        description: 'AI önerileri hazır.',
      });

    } catch (error: any) {
      toast({
        title: 'Analiz hatası',
        description: error.message || 'Bir hata oluştu.',
        variant: 'destructive'
      });
    }
  };

  const handleApplyAnalysis = (selections: any) => {
    if (!analysis) return;

    if (selections.summary) {
      form.setValue('detailedNotes', analysis.summary.professional);
    }

    if (selections.emotionalState) {
      form.setValue('emotionalState', analysis.formSuggestions.emotionalState);
    }

    if (selections.physicalState) {
      form.setValue('physicalState', analysis.formSuggestions.physicalState);
    }

    if (selections.cooperationLevel) {
      form.setValue('cooperationLevel', analysis.formSuggestions.cooperationLevel);
    }

    if (selections.communicationQuality) {
      form.setValue('communicationQuality', analysis.formSuggestions.communicationQuality);
    }

    if (selections.sessionFlow) {
      form.setValue('sessionFlow', analysis.formSuggestions.sessionFlow);
    }

    if (selections.studentParticipationLevel) {
      form.setValue('studentParticipationLevel', analysis.formSuggestions.studentParticipationLevel);
    }

    if (selections.actionItems && analysis.actionItems.length > 0) {
      const selectedItems = analysis.actionItems
        .filter((_, index) => selections.actionItems[index] !== false)
        .map(item => ({
          description: item.description,
          assignedTo: item.assignedTo,
          priority: item.priority,
          dueDate: item.dueDate instanceof Date 
            ? item.dueDate.toISOString().split('T')[0] 
            : item.dueDate
        }));
      form.setValue('actionItems', selectedItems);
    }

    if (selections.followUp && analysis.followUpRecommendation?.needed) {
      form.setValue('followUpNeeded', true);
      if (analysis.followUpRecommendation.suggestedDays) {
        const suggestedDate = new Date();
        suggestedDate.setDate(suggestedDate.getDate() + analysis.followUpRecommendation.suggestedDays);
        form.setValue('followUpDate', suggestedDate);
      }
    }

    setPreviewOpen(false);

    toast({
      title: 'Uygulandı',
      description: 'AI önerileri forma uygulandı.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col rounded-xl">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100/60 dark:bg-violet-900/30">
              <MessageSquare className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                Görüşmeyi Tamamla
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Görüşme detaylarını kaydedin
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, handleFormSubmit)} className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-9">
                  <TabsTrigger value="summary" className="text-xs gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Özet
                  </TabsTrigger>
                  <TabsTrigger value="assessment" className="text-xs gap-1.5">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Değerlendirme
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-3 mt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="exitTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-violet-500" />
                            Çıkış Saati <span className="text-rose-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              {...field} 
                              className="h-8 text-sm rounded-lg" 
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Görüşme Konusu <span className="text-rose-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <CounselingTopicSelector
                              topics={topics}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Konu seç..."
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="detailedNotes"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <FileText className="h-3 w-3 text-violet-500" />
                            Notlar <span className="text-[10px] text-slate-400 ml-1">(İsteğe bağlı)</span>
                          </FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAIAnalyze}
                            disabled={isAnalyzing}
                            className="gap-1 h-6 text-[10px] px-2"
                          >
                            {isAnalyzing ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3" />
                            )}
                            AI Analiz
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Görüşme detayları..."
                            rows={3}
                            className="rounded-lg resize-none text-sm"
                            enableVoice={true}
                            voiceLanguage="tr-TR"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="followUpNeeded"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 px-3 py-2">
                          <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer m-0 flex items-center gap-1.5">
                            <Target className="h-3.5 w-3.5 text-amber-500" />
                            Takip Görüşmesi Planla
                          </FormLabel>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {followUpNeeded && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-amber-200/60 dark:border-amber-700/40 bg-amber-50/40 dark:bg-amber-950/20 p-2.5">
                      <FormField
                        control={form.control}
                        name="followUpDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] text-slate-700 dark:text-slate-300">
                              Tarih <span className="text-rose-500">*</span>
                            </FormLabel>
                            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal h-8 text-xs",
                                      !field.value && "text-slate-400"
                                    )}
                                  >
                                    <CalendarIcon className="mr-1.5 h-3 w-3" />
                                    {field.value ? (
                                      format(field.value, "d MMM yyyy", { locale: tr })
                                    ) : (
                                      <span>Tarih seç</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    if (date) {
                                      field.onChange(date);
                                      setDatePickerOpen(false);
                                    }
                                  }}
                                  disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return date < today;
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="followUpTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] text-slate-700 dark:text-slate-300">
                              Saat <span className="text-rose-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="time" 
                                {...field} 
                                className="h-8 text-xs" 
                              />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <Collapsible open={actionItemsOpen} onOpenChange={setActionItemsOpen}>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20">
                      <CollapsibleTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full flex items-center justify-between px-3 py-2 h-auto"
                        >
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <Target className="h-3.5 w-3.5 text-slate-500" />
                            Aksiyon Maddeleri
                            <span className="text-[10px] text-slate-400 font-normal">(İsteğe bağlı)</span>
                          </div>
                          {actionItemsOpen ? (
                            <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3">
                        <FormField
                          control={form.control}
                          name="actionItems"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <ActionItemsManager
                                  items={field.value || []}
                                  onItemsChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] mt-1" />
                            </FormItem>
                          )}
                        />
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                </TabsContent>

                <TabsContent value="assessment" className="space-y-3 mt-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <ClipboardCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-medium text-sm text-slate-800 dark:text-slate-100">
                      Değerlendirme
                    </h3>
                    <Badge variant="outline" className="text-[10px] ml-auto">İsteğe bağlı</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="sessionFlow"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Görüşme Seyri
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 rounded-lg text-xs">
                                <SelectValue placeholder="Seçiniz" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-lg">
                              <SelectItem value="çok_olumlu">Çok Olumlu</SelectItem>
                              <SelectItem value="olumlu">Olumlu</SelectItem>
                              <SelectItem value="nötr">Nötr</SelectItem>
                              <SelectItem value="sorunlu">Sorunlu</SelectItem>
                              <SelectItem value="kriz">Kriz</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="studentParticipationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Katılım Düzeyi
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 rounded-lg text-xs">
                                <SelectValue placeholder="Seçiniz" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-lg">
                              <SelectItem value="çok_aktif">Çok Aktif</SelectItem>
                              <SelectItem value="aktif">Aktif</SelectItem>
                              <SelectItem value="pasif">Pasif</SelectItem>
                              <SelectItem value="dirençli">Dirençli</SelectItem>
                              <SelectItem value="kapalı">Kapalı</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emotionalState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Duygu Durumu
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 rounded-lg text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-lg">
                              <SelectItem value="sakin">Sakin</SelectItem>
                              <SelectItem value="kaygılı">Kaygılı</SelectItem>
                              <SelectItem value="üzgün">Üzgün</SelectItem>
                              <SelectItem value="sinirli">Sinirli</SelectItem>
                              <SelectItem value="mutlu">Mutlu</SelectItem>
                              <SelectItem value="karışık">Karışık</SelectItem>
                              <SelectItem value="diğer">Diğer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="physicalState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Fiziksel Durum
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 rounded-lg text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-lg">
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="yorgun">Yorgun</SelectItem>
                              <SelectItem value="enerjik">Enerjik</SelectItem>
                              <SelectItem value="huzursuz">Huzursuz</SelectItem>
                              <SelectItem value="hasta">Hasta</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="communicationQuality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            İletişim Kalitesi
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 rounded-lg text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-lg">
                              <SelectItem value="açık">Açık</SelectItem>
                              <SelectItem value="çekingen">Çekingen</SelectItem>
                              <SelectItem value="dirençli">Dirençli</SelectItem>
                              <SelectItem value="sınırlı">Sınırlı</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cooperationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            İşbirliği: {field.value}/5
                          </FormLabel>
                          <FormControl>
                            <div className="pt-2 px-1">
                              <Slider
                                min={1}
                                max={5}
                                step={1}
                                value={[field.value || 3]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="h-9 px-4 text-sm"
                >
                  İptal
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={isPending || isDownloadingPDF}
                  className="h-9 px-3 text-sm gap-1.5"
                >
                  {isDownloadingPDF ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <DownloadIcon className="h-3.5 w-3.5" />
                  )}
                  PDF
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending || isDownloadingPDF}
                  className="h-9 px-5 text-sm bg-violet-600 hover:bg-violet-700"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      {getSubmitButtonText()}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>

      <AIAnalysisPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        analysis={analysis}
        isLoading={isAnalyzing}
        onApply={handleApplyAnalysis}
      />
    </Dialog>
  );
}
