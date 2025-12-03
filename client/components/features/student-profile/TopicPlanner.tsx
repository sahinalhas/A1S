import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 CardDescription,
} from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Badge } from "@/components/atoms/Badge";
import { Clock, AlertCircle, Zap, TrendingUp, RefreshCcw, Calendar, CheckCircle2, Circle, Download, Printer } from "lucide-react";
import {
 loadSubjects,
 loadTopics,
 planWeek,
 planWeekSmart,
 updateProgress,
 resetTopicProgress,
 ensureProgressForStudent,
 getProgressByStudent,
 getTopicsDueForReview,
 getUpcomingReviews,
 setCompletedFlag,
 saveProgress,
 loadProgress,
 reviewTopic,
} from "@/lib/storage";
import { Switch } from "@/components/atoms/Switch";
import { Label } from "@/components/atoms/Label";
import { Separator } from "@/components/atoms/Separator";
import { Checkbox } from "@/components/atoms/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/organisms/Dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/organisms/Accordion";
import { generateTopicPlanPDF } from "@/lib/utils/pdf-generator";

function mondayOf(dateISO: string) {
 const d = new Date(dateISO +"T00:00:00");
 const wd = d.getDay() === 0 ? 7 : d.getDay(); // 1..7
 const monday = new Date(d.getTime() - (wd - 1) * 24 * 60 * 60 * 1000);
 return monday.toISOString().slice(0, 10);
}

function getDeadlineUrgency(deadline?: string) {
 if (!deadline) return null;
 const today = new Date();
 const deadlineDate = new Date(deadline);
 const daysUntil = Math.floor(
 (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
 );

 if (daysUntil < 0) return { level: 'expired', text: 'Geçti', color: 'text-red-600 bg-red-50' };
 if (daysUntil <= 3) return { level: 'urgent', text: `${daysUntil}g`, color: 'text-red-600 bg-red-50' };
 if (daysUntil <= 7) return { level: 'soon', text: `${daysUntil}g`, color: 'text-orange-600 bg-orange-50' };
 if (daysUntil <= 14) return { level: 'upcoming', text: `${daysUntil}g`, color: 'text-yellow-600 bg-yellow-50' };
 return null;
}

function getEnergyIcon(energyLevel?: 'high' | 'medium' | 'low') {
 if (!energyLevel) return null;
 if (energyLevel === 'high') return { icon: Zap, color: 'text-green-600', title: 'Yüksek enerji' };
 if (energyLevel === 'medium') return { icon: TrendingUp, color: 'text-blue-600', title: 'Orta enerji' };
 return { icon: Clock, color: 'text-gray-600', title: 'Düşük enerji' };
}

export default function TopicPlanner({ sid, studentName }: { sid: string; studentName?: string }) {
 const [subjects, setSubjects] = useState<Awaited<ReturnType<typeof loadSubjects>>>([]);
 const [topics, setTopics] = useState<Awaited<ReturnType<typeof loadTopics>>>([]);
 const [weekStart, setWeekStart] = useState(() =>
 mondayOf(new Date().toISOString().slice(0, 10)),
 );
 const [refresh, setRefresh] = useState(0);
 const [plan, setPlan] = useState<Awaited<ReturnType<typeof planWeek>>>([]);
 const [useSmartPlanning, setUseSmartPlanning] = useState(false);
 const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
 const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
 const [progress, setProgress] = useState<Awaited<ReturnType<typeof getProgressByStudent>>>([]);
 const [isApplying, setIsApplying] = useState(false);

 const updateTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

 useEffect(() => {
 setSubjects(loadSubjects());
 setTopics(loadTopics());
 setProgress(getProgressByStudent(sid));

 const handleSubjectsUpdate = () => setSubjects(loadSubjects());
 const handleTopicsUpdate = () => setTopics(loadTopics());
 const handleProgressUpdate = () => setProgress(getProgressByStudent(sid));

 window.addEventListener('subjectsUpdated', handleSubjectsUpdate);
 window.addEventListener('topicsUpdated', handleTopicsUpdate);
 window.addEventListener('progressUpdated', handleProgressUpdate);

 return () => {
 window.removeEventListener('subjectsUpdated', handleSubjectsUpdate);
 window.removeEventListener('topicsUpdated', handleTopicsUpdate);
 window.removeEventListener('progressUpdated', handleProgressUpdate);
 };
 }, [sid]);

 useEffect(() => {
 ensureProgressForStudent(sid).then(() => {
 const planFn = useSmartPlanning ? planWeekSmart : planWeek;
 planFn(sid, weekStart).then(setPlan);
 });
 }, [sid, weekStart, refresh, useSmartPlanning]);
 const progressByTopic = useMemo(() => {
 const m = new Map<
 string,
 { completed: number; remaining: number; done?: boolean }
 >();
 for (const p of getProgressByStudent(sid))
 m.set(p.topicId, {
 completed: p.completed,
 remaining: p.remaining,
 done: p.completedFlag,
 });
 return m;
 }, [sid, refresh]);

 const planByDate = useMemo(() => {
 const m = new Map<string, typeof plan>();
 for (const p of plan) {
 const arr = m.get(p.date) || [];
 arr.push(p);
 m.set(p.date, arr);
 }
 return m;
 }, [plan]);

  const handleToggleComplete = async (topicId: string, currentState: boolean) => {
    await setCompletedFlag(sid, topicId, !currentState);
    setProgress(getProgressByStudent(sid));
    setRefresh((r) => r + 1);
  };

  const handleUpdateQuestionStats = useCallback(async (
    topicId: string,
    field: 'questionsSolved' | 'questionsCorrect' | 'questionsWrong',
    value: number
  ) => {
    const timeoutKey = `${topicId}-${field}`;
    if (updateTimeoutRef.current[timeoutKey]) {
      clearTimeout(updateTimeoutRef.current[timeoutKey]);
    }

    updateTimeoutRef.current[timeoutKey] = setTimeout(async () => {
      setProgress(prevProgress => {
        const updated = prevProgress.map(p =>
          p.topicId === topicId ? { ...p, [field]: value } : p
        );

        saveProgress(updated).catch(error => {
          console.error('Error updating question stats:', error);
        });

        return updated;
      });
    }, 500);
  }, []);

  const selectedTopic = useMemo(() => {
    if (!selectedTopicId) return null;
    return topics.find(t => t.id === selectedTopicId);
  }, [selectedTopicId, topics]);

  const selectedSubject = useMemo(() => {
    if (!selectedTopic) return null;
    return subjects.find(s => s.id === selectedTopic.subjectId);
  }, [selectedTopic, subjects]);

  const selectedTopicProgress = useMemo(() => {
    if (!selectedTopicId) return null;
    return progress.find(p => p.topicId === selectedTopicId);
  }, [selectedTopicId, progress]);

 const applyPlan = async () => {
 setIsApplying(true);
 try {
 let completedCount = 0;
 for (const p of plan) {
 await updateProgress(sid, p.topicId, p.allocated);
 completedCount++;
 }
 setProgress(getProgressByStudent(sid));
 setRefresh((x) => x + 1);
 // Show success notification
 if (completedCount > 0) {
 console.log(`✅ Plan uygulandı: ${completedCount} konu güncellendi`);
 }
 } catch (error) {
 console.error('Plan uygulanırken hata:', error);
 } finally {
 setIsApplying(false);
 }
 };

  const handleExportPDF = async () => {
    try {
      await generateTopicPlanPDF(plan, planByDate, weekStart, subjects, topics, sid, studentName, { download: true, print: false });
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
    }
  };

  const handlePrintPDF = async () => {
    try {
      await generateTopicPlanPDF(plan, planByDate, weekStart, subjects, topics, sid, studentName, { download: false, print: true });
    } catch (error) {
      console.error('PDF yazdırma hatası:', error);
    }
  };

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center justify-between">
  <span>Konu Bazlı Plan</span>
  <div className="flex gap-2">
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExportPDF}
      disabled={plan.length === 0}
      title="PDF olarak indir"
    >
      <Download className="h-4 w-4 mr-2" />
      PDF İndir
    </Button>
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handlePrintPDF}
      disabled={plan.length === 0}
      title="PDF'i yazdır"
    >
      <Printer className="h-4 w-4 mr-2" />
      Yazdır
    </Button>
  </div>
 </CardTitle>
 <CardDescription>
 Takvim 2 — Konular, Takvim 1 ders bloklarına sırayla yerleştirilir
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-5">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 <div className="md:col-span-2">
 <Input
 type="date"
 value={weekStart}
 onChange={(e) => setWeekStart(mondayOf(e.target.value))}
 />
 </div>
 <Button 
 onClick={applyPlan} 
 disabled={plan.length === 0 || isApplying}
 >
 {isApplying ? 'Uygulanıyor...' : 'Planı Uygula'}
 </Button>
 </div>

 <div className="flex flex-col sm:flex-row gap-4">
 <div className="space-y-1 flex-1">
 <div className="flex items-center space-x-2">
 <Switch
 id="smart-planning"
 checked={useSmartPlanning}
 onCheckedChange={setUseSmartPlanning}
 />
 <Label htmlFor="smart-planning" className="text-sm">
 Akıllı Planlama
 </Label>
 </div>
 {useSmartPlanning && (
 <p className="text-xs text-muted-foreground ml-10">
 Konular deadline, öncelik, zorluk ve enerji seviyesine göre en uygun saatlere yerleştirilir.
 Sabah saatleri (08:00-11:00) zor konular, öğleden sonra (14:00-17:00) orta, akşam düşük enerji gerektiren konular için kullanılır.
 </p>
 )}
 </div>

 <div className="flex gap-2">
 <Button
 variant={viewMode === 'list' ? 'default' : 'outline'}
 size="sm"
 onClick={() => setViewMode('list')}
 >
 Liste
 </Button>
 <Button
 variant={viewMode === 'grid' ? 'default' : 'outline'}
 size="sm"
 onClick={() => setViewMode('grid')}
 >
 Grid
 </Button>
 </div>
 </div>

 {/* Legend */}
 <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground bg-muted/40 p-2 rounded">
 <span className="inline-flex items-center gap-1">
 <span className="size-2 rounded-full bg-primary" /> TYT
 </span>
 <span className="inline-flex items-center gap-1">
 <span className="size-2 rounded-full bg-accent" /> AYT
 </span>
 <span className="inline-flex items-center gap-1">
 <span className="size-2 rounded-full bg-amber-500" /> YDT
 </span>
 <span className="inline-flex items-center gap-1">
 <span className="size-2 rounded-full bg-emerald-500" /> LGS
 </span>
 </div>

 {viewMode === 'grid' ? (
 <WeeklyTopicGrid
 plan={plan}
 weekStart={weekStart}
 subjects={subjects}
 topics={topics}
 />
 ) : (
  <div className="rounded-lg border bg-card">
    {plan.length === 0 ? (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Plan bulunamadı. Önce Haftalık Ders Çizelgesi ekleyin ve konuları yükleyin.
      </div>
    ) : (
      <Accordion type="multiple" defaultValue={DAYS.map(d => d.value.toString())} className="w-full">
        {DAYS.map((d) => {
          const date = dateFromWeekStartLocal(weekStart, d.value);
          const entries = (planByDate.get(date) || [])
            .slice()
            .sort((a, b) => a.start.localeCompare(b.start));
          const dayTotal = entries.reduce((sum, e) => sum + e.allocated, 0);
          const pill = (cat?: string) =>
            cat === "TYT"
              ? "bg-primary/10 border-primary/30"
              : cat === "AYT"
              ? "bg-accent/10 border-accent/30"
              : cat === "YDT"
              ? "bg-amber-500/10 border-amber-500/30"
              : cat === "LGS"
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-muted/40 border-muted-foreground/20";
          
          return (
            <AccordionItem key={d.value} value={d.value.toString()} className="border-b last:border-0">
              <AccordionTrigger className="px-5 py-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="text-base font-semibold">{d.label}</div>
                    <Badge variant="outline" className="font-normal">
                      {date}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    {entries.length > 0 && (
                      <Badge variant="secondary" className="font-medium">
                        {entries.length} konu
                      </Badge>
                    )}
                    <div className="text-sm text-muted-foreground font-medium">
                      {dayTotal > 0 ? `${dayTotal} dakika` : 'Plan yok'}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-3 pt-1">
                {entries.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Bu gün için plan bulunmuyor.
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {entries.map((p, i) => {
                      const sub = subjects.find((s) => s.id === p.subjectId);
                      const top = topics.find((t) => t.id === p.topicId);
                      const total = top?.avgMinutes || 0;
                      const pct =
                        total > 0
                          ? Math.min(
                              100,
                              Math.max(
                                0,
                                Math.round(
                                  ((total - p.remainingAfter) / total) * 100,
                                ),
                              ),
                            )
                          : 0;
                      const deadlineInfo = getDeadlineUrgency(top?.deadline);
                      const energyInfo = getEnergyIcon(top?.energyLevel);
                      const isDueForReview = getTopicsDueForReview(sid).find(r => r.topicId === p.topicId);
                      const isUpcomingReview = getUpcomingReviews(sid).find(r => r.topicId === p.topicId);
                      return (
                        <div
                          key={`${p.topicId}-${i}`}
                          className={`rounded border p-2.5 text-sm cursor-pointer hover:shadow-sm hover:bg-muted/30 transition-all ${
                            isDueForReview
                              ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800'
                              : isUpcomingReview
                              ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800'
                              : pill(sub?.category)
                          }`}
                          title={`${sub?.name}${sub?.category ? ` (${sub.category})` : ""} — ${top?.name}${isDueForReview ? '\n🔄 BUGÜN TEKRAR EDİLMELİ!' : isUpcomingReview ? '\n📅 Yakında tekrar' : ''}\nTıklayarak hızlıca yönetin`}
                          onClick={() => setSelectedTopicId(p.topicId)}
                        >
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {(isDueForReview || isUpcomingReview) && (
                                <RefreshCcw className={`h-3.5 w-3.5 flex-shrink-0 ${isDueForReview ? 'text-red-600' : 'text-blue-600'}`} />
                              )}
                              <Badge variant="outline" className="font-mono text-[11px] px-1.5 py-0 h-5 flex-shrink-0">
                                {p.start}–{p.end}
                              </Badge>
                              <span className="text-xs text-muted-foreground truncate">
                                {sub?.name}{sub?.category && ` (${sub.category})`}
                              </span>
                              <span className="font-medium truncate">
                                {top?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {deadlineInfo && (
                                <Badge className={`text-[10px] px-1 py-0 h-4 ${deadlineInfo.color}`} variant="outline">
                                  <Clock className="size-2.5 mr-0.5" />
                                  {deadlineInfo.text}
                                </Badge>
                              )}
                              {energyInfo && (
                                <div className={`${energyInfo.color}`} title={energyInfo.title}>
                                  <energyInfo.icon className="size-3.5" />
                                </div>
                              )}
                              {top?.difficultyScore && top.difficultyScore >= 7 && (
                                <Badge className="text-[9px] px-1 py-0 h-4 bg-red-50 text-red-700" variant="outline">
                                  Zor
                                </Badge>
                              )}
                              {top?.priority && top.priority >= 7 && (
                                <Badge className="text-[9px] px-1 py-0 h-4 bg-purple-50 text-purple-700" variant="outline">
                                  <AlertCircle className="size-2.5 mr-0.5" />
                                  Önemli
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap ml-1">
                                {p.allocated}dk
                              </span>
                            </div>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${pct}%` }}
                                aria-label={`Tamamlanma: ${pct}%`}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              %{pct} · {p.remainingAfter}dk kaldı
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    )}
  </div>
 )}


 {(getTopicsDueForReview(sid).length > 0 || getUpcomingReviews(sid).length > 0) && (
 <div className="rounded-md border p-3 space-y-3">
 <div className="flex items-center gap-2">
 <RefreshCcw className="h-4 w-4 text-blue-600" />
 <h3 className="text-sm font-medium">Akıllı Tekrar (Spaced Repetition)</h3>
 </div>

 {getTopicsDueForReview(sid).length > 0 && (
 <>
 <div className="space-y-2">
 <div className="flex items-center gap-2 text-xs font-medium text-red-600">
 <AlertCircle className="h-3 w-3" />
 Bugün Tekrar Edilmesi Gerekenler
 </div>
 {getTopicsDueForReview(sid).map((prog) => {
 const topic = topics.find(t => t.id === prog.topicId);
 const subject = subjects.find(s => s.id === topic?.subjectId);
 if (!topic) return null;
 return (
 <div key={prog.id} className="flex items-center justify-between p-2 rounded bg-red-50 border border-red-200">
 <div className="flex items-center gap-2 min-w-0">
 <Badge variant="outline" className="bg-white">{subject?.name}</Badge>
 <span className="text-xs truncate">{topic.name}</span>
 <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 bg-blue-50 text-blue-700">
 {prog.reviewCount || 0}. tekrar
 </Badge>
 </div>
 <span className="text-[10px] text-muted-foreground whitespace-nowrap">
 Son: {prog.lastStudied || '-'}
 </span>
 </div>
 );
 })}
 </div>
 <Separator />
 </>
 )}

 {getUpcomingReviews(sid).length > 0 && (
 <div className="space-y-2">
 <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
 <Calendar className="h-3 w-3" />
 Yaklaşan Tekrarlar (7 gün)
 </div>
 {getUpcomingReviews(sid).slice(0, 5).map((prog) => {
 const topic = topics.find(t => t.id === prog.topicId);
 const subject = subjects.find(s => s.id === topic?.subjectId);
 if (!topic) return null;
 return (
 <div key={prog.id} className="flex items-center justify-between p-2 rounded bg-blue-50 border border-blue-200">
 <div className="flex items-center gap-2 min-w-0">
 <Badge variant="outline" className="bg-white">{subject?.name}</Badge>
 <span className="text-xs truncate">{topic.name}</span>
 <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 bg-green-50 text-green-700">
 {prog.reviewCount || 0}. tekrar
 </Badge>
 </div>
 <span className="text-[10px] text-blue-700 whitespace-nowrap">
 {prog.nextReviewDate}
 </span>
 </div>
 );
 })}
 </div>
 )}
 </div>
 )}

      {/* Konu Yönetim Dialog'u */}
      <Dialog open={!!selectedTopicId} onOpenChange={(open) => !open && setSelectedTopicId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedSubject?.name} - {selectedTopic?.name}
              {selectedSubject?.category && (
                <Badge variant="outline">{selectedSubject.category}</Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Bu konuyu hızlıca yönetin - tamamlanma durumu ve soru istatistikleri
            </DialogDescription>
          </DialogHeader>

          {selectedTopicProgress && (
            <div className="space-y-4 py-4">
              {/* Tamamlama Checkbox */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Checkbox
                  checked={selectedTopicProgress.completedFlag || false}
                  onCheckedChange={() =>
                    handleToggleComplete(
                      selectedTopicId!,
                      selectedTopicProgress.completedFlag || false
                    )
                  }
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <div className="flex items-center gap-2 flex-1">
                  {selectedTopicProgress.completedFlag ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <Label className="text-base cursor-pointer">
                    {selectedTopicProgress.completedFlag ? 'Tamamlandı' : 'Henüz tamamlanmadı'}
                  </Label>
                </div>
              </div>

              {/* Soru İstatistikleri */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Soru İstatistikleri</Label>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Çözülen</Label>
                    <Input
                      type="number"
                      min="0"
                      value={selectedTopicProgress.questionsSolved || ''}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value) || 0;
                        setProgress(prev => prev.map(p =>
                          p.topicId === selectedTopicId ? { ...p, questionsSolved: newValue } : p
                        ));
                        handleUpdateQuestionStats(selectedTopicId!, 'questionsSolved', newValue);
                      }}
                      className="h-10"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-green-600 font-semibold">Doğru</Label>
                    <Input
                      type="number"
                      min="0"
                      max={selectedTopicProgress.questionsSolved || 0}
                      value={selectedTopicProgress.questionsCorrect || ''}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value) || 0;
                        setProgress(prev => prev.map(p =>
                          p.topicId === selectedTopicId ? { ...p, questionsCorrect: newValue } : p
                        ));
                        handleUpdateQuestionStats(selectedTopicId!, 'questionsCorrect', newValue);
                      }}
                      className="h-10 border-green-200"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-red-600 font-semibold">Yanlış</Label>
                    <Input
                      type="number"
                      min="0"
                      max={selectedTopicProgress.questionsSolved || 0}
                      value={selectedTopicProgress.questionsWrong || ''}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value) || 0;
                        setProgress(prev => prev.map(p =>
                          p.topicId === selectedTopicId ? { ...p, questionsWrong: newValue } : p
                        ));
                        handleUpdateQuestionStats(selectedTopicId!, 'questionsWrong', newValue);
                      }}
                      className="h-10 border-red-200"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Başarı Yüzdesi */}
                {(selectedTopicProgress.questionsSolved || 0) > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <span className="text-sm font-medium text-blue-900">Başarı Oranı</span>
                    <Badge className="text-base px-3 py-1 bg-blue-100 text-blue-700">
                      %{Math.round(((selectedTopicProgress.questionsCorrect || 0) / (selectedTopicProgress.questionsSolved || 1)) * 100)}
                    </Badge>
                  </div>
                )}
              </div>

              {/* İlerleme Bilgisi */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tamamlanan Süre</span>
                  <span className="font-medium">{selectedTopicProgress.completed} / {selectedTopic?.avgMinutes} dk</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{
                      width: `${selectedTopic?.avgMinutes ? (selectedTopicProgress.completed / selectedTopic.avgMinutes) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Tekrar Bilgileri */}
              {selectedTopicProgress.completedFlag && selectedTopicProgress.nextReviewDate && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <RefreshCcw className="h-4 w-4 text-blue-600" />
                    <span>Akıllı Tekrar Bilgileri</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 rounded bg-gray-50">
                      <div className="text-xs text-muted-foreground">Tekrar Sayısı</div>
                      <div className="font-medium">{selectedTopicProgress.reviewCount || 0}. tekrar</div>
                    </div>
                    <div className="p-2 rounded bg-gray-50">
                      <div className="text-xs text-muted-foreground">Son Çalışma</div>
                      <div className="font-medium">{selectedTopicProgress.lastStudied || '-'}</div>
                    </div>
                    <div className="col-span-2 p-2 rounded bg-blue-50 border border-blue-200">
                      <div className="text-xs text-blue-700">Bir Sonraki Tekrar</div>
                      <div className="font-medium text-blue-900">{selectedTopicProgress.nextReviewDate}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-2 pt-4">
                {selectedTopicProgress.completedFlag && selectedTopicProgress.nextReviewDate && (
                  <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={async () => {
                      await reviewTopic(sid, selectedTopicId!);
                      setProgress(getProgressByStudent(sid));
                      setRefresh((r) => r + 1);
                    }}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Tekrarı Tamamla
                  </Button>
                )}
                <div className="flex-1" />
                <Button variant="outline" onClick={() => setSelectedTopicId(null)}>
                  Kapat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
 </CardContent>
 </Card>
 );
}

// --- Helpers & grid component for weekly topic visualization ---
const DAYS: { value: 1 | 2 | 3 | 4 | 5 | 6 | 7; label: string }[] = [
 { value: 1, label:"Pazartesi" },
 { value: 2, label:"Salı" },
 { value: 3, label:"Çarşamba" },
 { value: 4, label:"Perşembe" },
 { value: 5, label:"Cuma" },
 { value: 6, label:"Cumartesi" },
 { value: 7, label:"Pazar" },
];
const START_MIN = 7 * 60; // 07:00
const END_MIN = 24 * 60; // 24:00
const STEP = 30; // 30dk
const ROWS = (END_MIN - START_MIN) / STEP; // 34 satır
const ROW_H = 28; // px

function toMinHHmm(t: string) {
 const [h, m] = t.split(":").map(Number);
 return h * 60 + m;
}
function fmtHHmm(mins: number) {
 const m = Math.max(0, Math.min(mins, END_MIN - 1));
 const h = Math.floor(m / 60);
 const mm = m % 60;
 return `${String(h).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;
}
function dateFromWeekStartLocal(
 weekStartISO: string,
 day: 1 | 2 | 3 | 4 | 5 | 6 | 7,
) {
 const d = new Date(weekStartISO +"T00:00:00");
 const result = new Date(d.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
 return result.toISOString().slice(0, 10);
}

function WeeklyTopicGrid({
 plan,
 weekStart,
 subjects,
 topics,
}: {
 plan: Awaited<ReturnType<typeof planWeek>>;
 weekStart: string;
 subjects: Awaited<ReturnType<typeof loadSubjects>>;
 topics: Awaited<ReturnType<typeof loadTopics>>;
}) {
 const planByDate = useMemo(() => {
 const m = new Map<string, typeof plan>();
 for (const p of plan) {
 const arr = m.get(p.date) || [];
 arr.push(p);
 m.set(p.date, arr);
 }
 return m;
 }, [plan]);

 return (
 <div className="w-full overflow-auto rounded border">
 {/* Header */}
 <div
 className="grid"
 style={{ gridTemplateColumns: `100px repeat(7, minmax(180px, 1fr))` }}
 >
 <div className="p-2 text-xs text-muted-foreground border-b bg-muted/40">
 Saat
 </div>
 {DAYS.map((d) => (
 <div
 key={d.value}
 className="p-2 text-xs font-medium border-b bg-muted/40"
 >
 {d.label}
 </div>
 ))}
 </div>
 {/* Body */}
 <div className="relative">
 <div
 className="grid"
 style={{ gridTemplateColumns: `100px repeat(7, minmax(180px, 1fr))` }}
 >
 {/* Time labels */}
 <div className="relative">
 {[...Array(ROWS + 1)].map((_, i) => {
 const m = START_MIN + i * STEP;
 const isHour = m % 60 === 0;
 return (
 <div key={i} style={{ height: ROW_H }} className="relative">
 {isHour && (
 <div className="absolute -translate-y-1/2 top-1/2 right-2 text-[11px] text-muted-foreground">
 {fmtHHmm(m)}
 </div>
 )}
 </div>
 );
 })}
 </div>
 {/* Day columns */}
 {DAYS.map((d) => {
 const date = dateFromWeekStartLocal(weekStart, d.value);
 const entries = (planByDate.get(date) || [])
 .slice()
 .sort((a, b) => a.start.localeCompare(b.start));
 return (
 <div key={d.value} className="relative">
 {[...Array(ROWS)].map((_, ri) => (
 <div
 key={ri}
 style={{ height: ROW_H }}
 className="border-t border-l last:border-r"
 />
 ))}
 {/* Render planned topic blocks */}
 <div className="absolute inset-0 pointer-events-none">
 {entries.map((p, idx) => {
 const top =
 ((toMinHHmm(p.start) - START_MIN) / STEP) * ROW_H;
 const height =
 ((toMinHHmm(p.end) - toMinHHmm(p.start)) / STEP) * ROW_H;
 const sub = subjects.find((s) => s.id === p.subjectId);
 const topc = topics.find((t) => t.id === p.topicId);
 return (
 <div
 key={idx}
 style={{ top, height }}
 className="absolute left-2 right-2 rounded bg-accent/20 border border-accent/40 text-xs p-2 flex items-center justify-between gap-2 backdrop-blur"
 title={`${sub?.name}${sub?.category ? ` (${sub.category})` :""} — ${topc?.name} (${p.start}-${p.end})`}
 >
 <div className="min-w-0">
 <div className="font-medium truncate">
 {sub?.name}
 {sub?.category ? ` (${sub.category})` :""}
 </div>
 <div
 className="text-[11px] text-muted-foreground truncate"
 title={topc?.name}
 >
 {topc?.name}
 </div>
 </div>
 <div className="text-[11px] text-muted-foreground">
 {p.start} – {p.end}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {plan.length === 0 && (
 <div className="p-3 text-sm text-muted-foreground">
 Plan bulunamadı. Önce Haftalık Ders Çizelgesi ekleyin ve konuları
 yükleyin.
 </div>
 )}
 </div>
 );
}