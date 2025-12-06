
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { Slider } from "@/components/atoms/Slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { EnhancedTextarea } from "@/components/molecules/EnhancedTextarea";
import { MultiSelect } from "@/components/molecules/MultiSelect";
import { GraduationCap, TrendingUp, Target, BookOpen, Brain, Sparkles } from "lucide-react";
import { 
  ACADEMIC_SUBJECTS, 
  ACADEMIC_SKILLS,
  LEARNING_STYLES 
} from "@shared/constants/student-profile-taxonomy";
import { useStandardizedProfileSection } from "@/hooks/state/standardized-profile-section.state";
import { Textarea } from "@/components/atoms/Textarea";
import { useFormDirty } from "@/pages/StudentProfile/StudentProfile";
import { Badge } from "@/components/atoms/Badge";
import { Separator } from "@/components/atoms/Separator";

const academicProfileSchema = z.object({
  assessmentDate: z.string().optional(),
  strongSubjects: z.array(z.string()),
  weakSubjects: z.array(z.string()),
  strongSkills: z.array(z.string()),
  weakSkills: z.array(z.string()),
  primaryLearningStyle: z.string().optional(),
  secondaryLearningStyle: z.string().optional(),
  overallMotivation: z.number().min(1).max(10),
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

export default function StandardizedAcademicSection({ 
  studentId, 
  academicData,
  onUpdate 
}: StandardizedAcademicSectionProps) {
  const { setIsDirty, registerFormSubmit, unregisterFormSubmit } = useFormDirty();
  const componentId = useMemo(() => crypto.randomUUID(), []);
  
  const form = useForm<AcademicProfileFormValues>({
    resolver: zodResolver(academicProfileSchema),
    mode: 'onSubmit',
    defaultValues: {
      assessmentDate: new Date().toISOString().slice(0, 10),
      strongSubjects: [],
      weakSubjects: [],
      strongSkills: [],
      weakSkills: [],
      primaryLearningStyle: "",
      secondaryLearningStyle: "",
      overallMotivation: 5,
      homeworkCompletionRate: 50,
      additionalNotes: "",
      languageSkills: "",
    },
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      setIsDirty(true);
    });
    return () => subscription.unsubscribe();
  }, [form, setIsDirty]);

  const { isSubmitting, onSubmit } = useStandardizedProfileSection({
    studentId,
    sectionName: 'Akademik profil',
    apiEndpoint: 'academic',
    form,
    defaultValues: form.getValues(),
    onUpdate,
  });
  
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

  const getMotivationColor = (level: number) => {
    if (level >= 8) return "text-green-600";
    if (level >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Akademik Profil</CardTitle>
              <CardDescription className="mt-1">
                Öğrencinin akademik yetkinliklerini ve öğrenme stilini değerlendirin
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Dersler Bölümü */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Ders Performansı</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="strongSubjects"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Güçlü Dersler
                      </FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={ACADEMIC_SUBJECTS}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Güçlü olduğu dersleri seçiniz..."
                          groupByCategory
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weakSubjects"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="flex items-center gap-2 text-base">
                        <Target className="h-4 w-4 text-orange-600" />
                        Geliştirilmesi Gereken Dersler
                      </FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={ACADEMIC_SUBJECTS}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Geliştirilecek dersleri seçiniz..."
                          groupByCategory
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Beceriler Bölümü */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Akademik Beceriler</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="strongSkills"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Güçlü Beceriler
                      </FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={ACADEMIC_SKILLS}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Güçlü becerilerini seçiniz..."
                          groupByCategory
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weakSkills"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="flex items-center gap-2 text-base">
                        <Target className="h-4 w-4 text-orange-600" />
                        Geliştirilmesi Gereken Beceriler
                      </FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={ACADEMIC_SKILLS}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Geliştirilecek becerilerini seçiniz..."
                          groupByCategory
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Öğrenme Stilleri */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-600" />
                <CardTitle className="text-lg">Öğrenme Stilleri</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="primaryLearningStyle"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-medium">
                        Birincil Öğrenme Stili
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Öğrenme stili seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LEARNING_STYLES.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">{style.label}</span>
                                <span className="text-xs text-muted-foreground">{style.description}</span>
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
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-medium">
                        İkincil Öğrenme Stili
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Öğrenme stili seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LEARNING_STYLES.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              <span className="font-medium">{style.label}</span>
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

          {/* Performans Metrikleri */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performans Göstergeleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="overallMotivation"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel className="text-base font-medium">
                        Genel Motivasyon Seviyesi
                      </FormLabel>
                      <Badge variant="outline" className={getMotivationColor(field.value)}>
                        {field.value}/10
                      </Badge>
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
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Düşük</span>
                      <span>Orta</span>
                      <span>Yüksek</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="homeworkCompletionRate"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel className="text-base font-medium">
                        Ödev Tamamlama Oranı
                      </FormLabel>
                      <Badge variant="outline" className={getCompletionColor(field.value)}>
                        {field.value}%
                      </Badge>
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
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Ek Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ek Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="languageSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Dil Becerileri
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Örn: İngilizce (B2), Almanca (A1)..." 
                        className="min-h-[80px] resize-none"
                        {...field} 
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
                    <FormLabel className="text-base font-medium">
                      Ek Notlar ve Gözlemler
                    </FormLabel>
                    <FormControl>
                      <EnhancedTextarea 
                        {...field} 
                        rows={4} 
                        aiContext="academic"
                        placeholder="Akademik performans hakkında ek gözlemlerinizi yazınız..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
