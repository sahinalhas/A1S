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
  Download as DownloadIcon,
  X,
  User,
  Activity,
  Heart
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { motion, AnimatePresence } from "framer-motion";

import { Dialog, DialogContent } from "@/components/organisms/Dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import { Button } from "@/components/atoms/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Switch } from "@/components/atoms/Switch";
import { Slider } from "@/components/atoms/Slider";
import { Calendar } from "@/components/organisms/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/organisms/Popover";
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
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [actionItemsOpen, setActionItemsOpen] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
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
      sessionFlow: undefined,
      studentParticipationLevel: undefined,
      drpHizmetAlaniId: undefined,
      drpBirId: undefined,
      drpIkiId: undefined,
      drpUcId: undefined,
    },
  });

  const followUpNeeded = form.watch("followUpNeeded");

  useEffect(() => {
    if (followUpNeeded && !form.getValues("followUpDate")) {
      setDatePickerOpen(true);
    }
  }, [followUpNeeded]);

  useEffect(() => {
    if (open && session?.topic) {
      const normalizedTopic = normalizeTopicValue(session.topic);
      if (normalizedTopic) {
        const selectedTopic = topics.find(t => t.id === normalizedTopic);
        if (selectedTopic) {
          form.setValue('drpHizmetAlaniId', selectedTopic.drpHizmetAlaniId);
          form.setValue('drpBirId', selectedTopic.drpBirId);
          form.setValue('drpIkiId', selectedTopic.drpIkiId);
          form.setValue('drpUcId', selectedTopic.drpUcId);
        }
      }
    }
  }, [open, session?.topic, topics]);

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    clearAnalysis();
  };

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
    const values = form.getValues();

    if (session?.entryTime && values.exitTime) {
      if (values.exitTime <= session.entryTime) {
        toast({
          title: 'Hatalı Saat',
          description: `Çıkış saati (${values.exitTime}), başlangıç saatinden (${session.entryTime}) sonra olmalıdır.`,
          variant: 'destructive',
        });
        return;
      }
    }

    if (Object.keys(errors).length > 0) {
      if (errors.topic) {
        toast({
          title: 'Eksik bilgi',
          description: 'Görüşme konusu seçmelisiniz.',
          variant: 'destructive'
        });
        return;
      }

      if (errors.followUpDate || errors.followUpTime) {
        toast({
          title: 'Eksik bilgi',
          description: 'Takip görüşmesi için tarih ve saat seçmelisiniz.',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Form hatası',
        description: 'Lütfen tüm gerekli alanları doldurun.',
        variant: 'destructive'
      });
    }
  };

  const handleTopicChange = (topicId: string) => {
    form.setValue('topic', topicId);

    const selectedTopic = topics.find(t => t.id === topicId);
    if (selectedTopic) {
      form.setValue('drpHizmetAlaniId', selectedTopic.drpHizmetAlaniId);
      form.setValue('drpBirId', selectedTopic.drpBirId);
      form.setValue('drpIkiId', selectedTopic.drpIkiId);
      form.setValue('drpUcId', selectedTopic.drpUcId);
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

  const studentName = session?.sessionType === 'group' 
    ? `${session?.students?.length || 0} öğrenci` 
    : `${session?.student?.name || ''} ${session?.student?.surname || ''}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        hideCloseButton 
        className="max-w-lg p-0 gap-0 border-0 bg-white dark:bg-slate-950 overflow-hidden rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full p-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Görüşmeyi Tamamla</h2>
              <p className="text-white/70 text-sm">{studentName}</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, handleFormSubmit)} className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
            
            {/* Section 1: Time & Topic */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">1</span>
                </div>
                Temel Bilgiler
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="exitTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-slate-500">Çıkış Saati</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <input
                            type="time"
                            {...field}
                            className="flex-1 bg-transparent border-0 focus:outline-none text-sm text-slate-900 dark:text-white"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-xs text-slate-500">Görüşme Konusu</FormLabel>
                      <FormControl>
                        <CounselingTopicSelector
                          topics={topics}
                          value={field.value}
                          onValueChange={handleTopicChange}
                          placeholder="Konu seç..."
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 2: Notes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">2</span>
                  </div>
                  Görüşme Notları
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAIAnalyze}
                  disabled={isAnalyzing}
                  className="gap-1.5 h-7 text-xs px-3 rounded-lg"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  AI Analiz
                </Button>
              </div>

              <FormField
                control={form.control}
                name="detailedNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Görüşme detaylarını buraya yazın..."
                        rows={4}
                        className="rounded-xl resize-none text-sm border-2"
                        enableVoice={true}
                        voiceLanguage="tr-TR"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Section 3: Follow-up */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">3</span>
                </div>
                Takip
              </div>

              <FormField
                control={form.control}
                name="followUpNeeded"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between rounded-xl border-2 border-slate-200 dark:border-slate-700 px-4 py-3">
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer m-0 flex items-center gap-2">
                        <Target className="h-4 w-4 text-amber-500" />
                        Takip görüşmesi planla
                      </FormLabel>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  </FormItem>
                )}
              />

              <AnimatePresence>
                {followUpNeeded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <FormField
                      control={form.control}
                      name="followUpDate"
                      render={({ field }) => (
                        <FormItem>
                          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <button
                                  type="button"
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 text-left"
                                >
                                  <CalendarIcon className="h-4 w-4 text-amber-500" />
                                  <span className={field.value ? "text-slate-900 dark:text-white text-sm" : "text-slate-400 text-sm"}>
                                    {field.value 
                                      ? format(field.value, "d MMM yyyy", { locale: tr })
                                      : "Tarih seç"}
                                  </span>
                                </button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-xl z-[100]" align="start">
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
                          <FormControl>
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                              <Clock className="h-4 w-4 text-amber-500" />
                              <input
                                type="time"
                                {...field}
                                className="flex-1 bg-transparent border-0 focus:outline-none text-sm text-slate-900 dark:text-white"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Collapsible: Action Items */}
            <Collapsible open={actionItemsOpen} onOpenChange={setActionItemsOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Target className="h-4 w-4 text-slate-500" />
                    Aksiyon Maddeleri
                    <span className="text-xs text-slate-400 font-normal">(opsiyonel)</span>
                  </div>
                  {actionItemsOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
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
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Collapsible: Assessment */}
            <Collapsible open={assessmentOpen} onOpenChange={setAssessmentOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <ClipboardCheck className="h-4 w-4 text-slate-500" />
                    Değerlendirme
                    <span className="text-xs text-slate-400 font-normal">(opsiyonel)</span>
                  </div>
                  {assessmentOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="sessionFlow"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500">Görüşme Seyri</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-xl border-2 text-sm">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="çok_olumlu">Çok Olumlu</SelectItem>
                            <SelectItem value="olumlu">Olumlu</SelectItem>
                            <SelectItem value="nötr">Nötr</SelectItem>
                            <SelectItem value="sorunlu">Sorunlu</SelectItem>
                            <SelectItem value="kriz">Kriz</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studentParticipationLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500">Katılım Düzeyi</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-xl border-2 text-sm">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="çok_aktif">Çok Aktif</SelectItem>
                            <SelectItem value="aktif">Aktif</SelectItem>
                            <SelectItem value="pasif">Pasif</SelectItem>
                            <SelectItem value="dirençli">Dirençli</SelectItem>
                            <SelectItem value="kapalı">Kapalı</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emotionalState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500">Duygu Durumu</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-xl border-2 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="sakin">Sakin</SelectItem>
                            <SelectItem value="kaygılı">Kaygılı</SelectItem>
                            <SelectItem value="üzgün">Üzgün</SelectItem>
                            <SelectItem value="sinirli">Sinirli</SelectItem>
                            <SelectItem value="mutlu">Mutlu</SelectItem>
                            <SelectItem value="karışık">Karışık</SelectItem>
                            <SelectItem value="diğer">Diğer</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="physicalState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500">Fiziksel Durum</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-xl border-2 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="yorgun">Yorgun</SelectItem>
                            <SelectItem value="enerjik">Enerjik</SelectItem>
                            <SelectItem value="huzursuz">Huzursuz</SelectItem>
                            <SelectItem value="hasta">Hasta</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="communicationQuality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500">İletişim Kalitesi</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-xl border-2 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="açık">Açık</SelectItem>
                            <SelectItem value="çekingen">Çekingen</SelectItem>
                            <SelectItem value="dirençli">Dirençli</SelectItem>
                            <SelectItem value="sınırlı">Sınırlı</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cooperationLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500">İşbirliği: {field.value}/5</FormLabel>
                        <FormControl>
                          <div className="pt-3 px-1">
                            <Slider
                              min={1}
                              max={5}
                              step={1}
                              value={[field.value || 3]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </form>
        </Form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleClose}
                className="text-slate-500 hover:text-slate-700"
              >
                İptal
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isPending || isDownloadingPDF}
                className="gap-1.5"
              >
                {isDownloadingPDF ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <DownloadIcon className="h-4 w-4" />
                )}
                PDF
              </Button>
            </div>

            <Button 
              type="button"
              onClick={() => form.handleSubmit(handleSubmit, handleFormSubmit)()}
              disabled={isPending || isDownloadingPDF}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 rounded-xl"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {getSubmitButtonText()}
                </span>
              )}
            </Button>
          </div>
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
