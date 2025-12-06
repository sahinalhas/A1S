import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { Slider } from "@/components/atoms/Slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { Button } from "@/components/atoms/Button";
import { 
  GraduationCap, 
  TrendingUp, 
  Target, 
  BookOpen, 
  Brain, 
  Sparkles,
  Check,
  Save,
  Loader2
} from "lucide-react";
import { 
  ACADEMIC_SUBJECTS, 
  ACADEMIC_SKILLS,
  LEARNING_STYLES 
} from "@shared/constants/student-profile-taxonomy";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFormDirty } from "@/pages/StudentProfile/StudentProfile";
import { getSelectedSchoolId } from "@/lib/school-context";

const academicProfileSchema = z.object({
  assessmentDate: z.string().optional(),
  strongSubjects: z.array(z.string()),
  weakSubjects: z.array(z.string()),
  strongSkills: z.array(z.string()),
  weakSkills: z.array(z.string()),
  primaryLearningStyle: z.string().optional(),
  secondaryLearningStyle: z.string().optional(),
  overallMotivation: z.number().min(1).max(10),
  studyHoursPerWeek: z.number().min(0).optional(),
  homeworkCompletionRate: z.number().min(0).max(100),
  additionalNotes: z.string().optional(),
  languageSkills: z.string().optional(),
});

type AcademicProfileFormValues = z.infer<typeof academicProfileSchema>;

interface StandardizedAcademicSectionProps {
  studentId: string;
  academicData?: any;
  onUpdate: () => void;
}

type SubjectItem = { value: string; label: string; category: string };
type SkillItem = { value: string; label: string; category: string };

const subjectsList: SubjectItem[] = ACADEMIC_SUBJECTS.map(s => ({ value: s.value, label: s.label, category: s.category }));
const skillsList: SkillItem[] = ACADEMIC_SKILLS.map(s => ({ value: s.value, label: s.label, category: s.category }));
const learningStylesList = LEARNING_STYLES.map(s => ({ value: s.value, label: s.label, description: s.description }));

const categoryColors: Record<string, string> = {
  sayısal: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  sözel: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  dil: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  sanat: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  fiziksel: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  uygulamalı: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  bilişsel: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  yürütücü: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  akademik: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function groupByCategory<T extends { category: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const cat = item.category || 'Diğer';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

interface ChipSelectorProps<T extends { value: string; label: string; category: string }> {
  items: T[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  type: 'strong' | 'weak';
}

function ChipSelector<T extends { value: string; label: string; category: string }>({ 
  items, 
  selectedValues, 
  onChange,
  type 
}: ChipSelectorProps<T>) {
  const grouped = groupByCategory(items);
  
  const toggleItem = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {category}
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryItems.map((item) => {
              const isSelected = selectedValues.includes(item.value);
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => toggleItem(item.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    "border-2 cursor-pointer",
                    isSelected && type === 'strong' && "bg-emerald-500 text-white border-emerald-500 shadow-md",
                    isSelected && type === 'weak' && "bg-amber-500 text-white border-amber-500 shadow-md",
                    !isSelected && "bg-background border-muted-foreground/20 hover:border-muted-foreground/40 text-foreground/70 hover:text-foreground"
                  )}
                >
                  {isSelected && (
                    type === 'strong' 
                      ? <Check className="h-3.5 w-3.5" />
                      : <Target className="h-3.5 w-3.5" />
                  )}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StandardizedAcademicSection({ 
  studentId, 
  onUpdate 
}: StandardizedAcademicSectionProps) {
  const { setIsDirty, registerFormSubmit, unregisterFormSubmit } = useFormDirty();
  const componentId = useMemo(() => crypto.randomUUID(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedData, setSavedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isResettingRef = useRef(false);

  const form = useForm<AcademicProfileFormValues>({
    resolver: zodResolver(academicProfileSchema),
    defaultValues: {
      strongSubjects: [],
      weakSubjects: [],
      strongSkills: [],
      weakSkills: [],
      primaryLearningStyle: "",
      secondaryLearningStyle: "",
      overallMotivation: 5,
      studyHoursPerWeek: 0,
      homeworkCompletionRate: 50,
      additionalNotes: "",
      languageSkills: "",
    },
  });

  const loadData = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    try {
      console.log("Loading academic profile for student:", studentId);
      const schoolId = getSelectedSchoolId();
      const response = await fetch(`/api/standardized-profile/${studentId}/academic`, {
        credentials: 'include',
        headers: {
          'X-School-Id': schoolId || ''
        }
      });
      console.log("Load response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Loaded data:", data);
        setSavedData(data);
        if (data && Object.keys(data).length > 0) {
          const formData: AcademicProfileFormValues = {
            assessmentDate: data.assessmentDate || "",
            strongSubjects: parseJsonArray(data.strongSubjects),
            weakSubjects: parseJsonArray(data.weakSubjects),
            strongSkills: parseJsonArray(data.strongSkills),
            weakSkills: parseJsonArray(data.weakSkills),
            primaryLearningStyle: data.primaryLearningStyle || "",
            secondaryLearningStyle: data.secondaryLearningStyle || "",
            overallMotivation: data.overallMotivation ?? 5,
            studyHoursPerWeek: data.studyHoursPerWeek ?? 0,
            homeworkCompletionRate: data.homeworkCompletionRate ?? 50,
            additionalNotes: data.additionalNotes || "",
            languageSkills: data.languageSkills || "",
          };
          isResettingRef.current = true;
          form.reset(formData);
          setTimeout(() => {
            isResettingRef.current = false;
            setIsDirty(false);
          }, 0);
        }
      } else {
        console.warn("Failed to load academic data:", response.status);
      }
    } catch (error) {
      console.error("Error loading academic data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [studentId, form, setIsDirty]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const subscription = form.watch(() => {
      if (!isResettingRef.current) {
        setIsDirty(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, setIsDirty]);

  function parseJsonArray(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  const onSubmit = useCallback(async (data: AcademicProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        id: savedData?.id || crypto.randomUUID(),
        studentId,
        ...data,
        assessmentDate: data.assessmentDate || new Date().toISOString().split('T')[0],
      };

      console.log("Submitting academic profile:", payload);
      const schoolId = getSelectedSchoolId();

      const response = await fetch(`/api/standardized-profile/${studentId}/academic`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-School-Id': schoolId || ''
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.details || errorData.error || 'Kayıt başarısız');
      }

      const result = await response.json();
      console.log("Save successful:", result);

      toast.success("Akademik profil kaydedildi");
      isResettingRef.current = true;
      await loadData();
      setTimeout(() => {
        isResettingRef.current = false;
        setIsDirty(false);
      }, 0);
      onUpdate?.();
    } catch (error: any) {
      console.error("Error saving academic profile:", error);
      toast.error(error.message || "Kayıt sırasında hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  }, [savedData?.id, studentId, loadData, onUpdate, setIsDirty]);

  const onSubmitRef = useRef(onSubmit);
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    registerFormSubmit(componentId, async () => {
      const isValid = await form.trigger();
      if (isValid) {
        await form.handleSubmit(onSubmitRef.current)();
      }
    });
    return () => unregisterFormSubmit(componentId);
  }, [form, componentId, registerFormSubmit, unregisterFormSubmit]);

  const motivationLevel = form.watch("overallMotivation");
  const completionRate = form.watch("homeworkCompletionRate");
  const studyHours = form.watch("studyHoursPerWeek");

  const getMotivationColor = (level: number) => {
    if (level >= 8) return "text-emerald-600";
    if (level >= 5) return "text-amber-600";
    return "text-rose-600";
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return "text-emerald-600";
    if (rate >= 60) return "text-amber-600";
    return "text-rose-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Akademik Profil
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Öğrencinin akademik yetkinliklerini ve öğrenme stilini değerlendirin
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg">Güçlü Dersler</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Öğrencinin başarılı olduğu dersleri seçin
                </p>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="strongSubjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ChipSelector
                          items={subjectsList}
                          selectedValues={field.value || []}
                          onChange={field.onChange}
                          type="strong"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                    <Target className="h-5 w-5 text-amber-600" />
                  </div>
                  <CardTitle className="text-lg">Geliştirilmesi Gereken Dersler</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Destek gerektiren dersleri işaretleyin
                </p>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="weakSubjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ChipSelector
                          items={subjectsList}
                          selectedValues={field.value || []}
                          onChange={field.onChange}
                          type="weak"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                    <Brain className="h-5 w-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg">Güçlü Beceriler</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Öğrencinin öne çıkan becerilerini seçin
                </p>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="strongSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ChipSelector
                          items={skillsList}
                          selectedValues={field.value || []}
                          onChange={field.onChange}
                          type="strong"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/30">
                    <Target className="h-5 w-5 text-rose-600" />
                  </div>
                  <CardTitle className="text-lg">Geliştirilmesi Gereken Beceriler</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Destek gerektiren becerileri işaretleyin
                </p>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="weakSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ChipSelector
                          items={skillsList}
                          selectedValues={field.value || []}
                          onChange={field.onChange}
                          type="weak"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                  <Sparkles className="h-5 w-5 text-violet-600" />
                </div>
                <CardTitle className="text-lg">Öğrenme Stilleri</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="primaryLearningStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birincil Öğrenme Stili</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {learningStylesList.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              <div>
                                <div className="font-medium">{style.label}</div>
                                <div className="text-xs text-muted-foreground">{style.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondaryLearningStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İkincil Öğrenme Stili</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {learningStylesList.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              <div>
                                <div className="font-medium">{style.label}</div>
                                <div className="text-xs text-muted-foreground">{style.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
                  <BookOpen className="h-5 w-5 text-cyan-600" />
                </div>
                <CardTitle className="text-lg">Performans Göstergeleri</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <FormField
                control={form.control}
                name="overallMotivation"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel className="text-base">Genel Motivasyon Düzeyi</FormLabel>
                      <span className={cn("text-2xl font-bold", getMotivationColor(motivationLevel))}>
                        {motivationLevel}/10
                      </span>
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Düşük</span>
                      <span>Orta</span>
                      <span>Yüksek</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="homeworkCompletionRate"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel className="text-base">Ödev Tamamlama Oranı</FormLabel>
                      <span className={cn("text-2xl font-bold", getCompletionColor(completionRate))}>
                        %{completionRate}
                      </span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>%0</span>
                      <span>%50</span>
                      <span>%100</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studyHoursPerWeek"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel className="text-base">Haftalık Ders Çalışma Saati</FormLabel>
                      <span className="text-2xl font-bold text-primary">
                        {studyHours || 0} saat
                      </span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={40}
                        step={1}
                        value={[field.value || 0]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0 saat</span>
                      <span>20 saat</span>
                      <span>40 saat</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Ek Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="languageSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yabancı Dil Yetkinlikleri</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Öğrencinin yabancı dil becerileri hakkında notlar..."
                        className="min-h-[80px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Değerlendirme Notları</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Akademik performans hakkında ek notlar, gözlemler..."
                        className="min-h-[100px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="sticky bottom-4 z-10">
            <Card className="shadow-xl border-2 border-primary/20 bg-background/95 backdrop-blur">
              <CardContent className="py-4">
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Akademik Profili Kaydet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
