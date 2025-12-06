
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { Slider } from "@/components/atoms/Slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { EnhancedTextarea } from "@/components/molecules/EnhancedTextarea";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/organisms/Collapsible";
import { Button } from "@/components/atoms/Button";
import { GraduationCap, TrendingUp, Target, BookOpen, Brain, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/organisms/ScrollArea";

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

export default function StandardizedAcademicSection({ 
  studentId, 
  academicData,
  onUpdate 
}: StandardizedAcademicSectionProps) {
  const { setIsDirty, registerFormSubmit, unregisterFormSubmit } = useFormDirty();
  const componentId = useMemo(() => crypto.randomUUID(), []);
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isLearningStylesOpen, setIsLearningStylesOpen] = useState(false);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
  const [isAdditionalOpen, setIsAdditionalOpen] = useState(false);
  const [localIsDirty, setLocalIsDirty] = useState(false);
  
  const form = useForm<AcademicProfileFormValues>({
    resolver: zodResolver(academicProfileSchema),
    mode: 'onSubmit',
    defaultValues: {
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
      setLocalIsDirty(true);
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

  const handleSave = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      await form.handleSubmit(onSubmit)();
      setLocalIsDirty(false);
    }
  };

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

  // Group subjects by category
  const subjectsByCategory = useMemo(() => {
    const grouped: Record<string, typeof ACADEMIC_SUBJECTS> = {};
    ACADEMIC_SUBJECTS.forEach(subject => {
      const category = subject.category || 'Diğer';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(subject);
    });
    return grouped;
  }, []);

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const grouped: Record<string, typeof ACADEMIC_SKILLS> = {};
    ACADEMIC_SKILLS.forEach(skill => {
      const category = skill.category || 'Diğer';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
    });
    return grouped;
  }, []);

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
          <Collapsible open={isSubjectsOpen} onOpenChange={setIsSubjectsOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">Ders Performansı</CardTitle>
                    </div>
                    {isSubjectsOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Güçlü Dersler */}
                <FormField
                  control={form.control}
                  name="strongSubjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base font-medium mb-3">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Güçlü Dersler
                      </FormLabel>
                      <ScrollArea className="h-[300px] rounded-lg border p-4">
                        <div className="space-y-4">
                          {Object.entries(subjectsByCategory).map(([category, subjects]) => (
                            <div key={category} className="space-y-2">
                              <h4 className="text-sm font-semibold text-muted-foreground sticky top-0 bg-background py-1">
                                {category}
                              </h4>
                              <div className="space-y-2 pl-2">
                                {subjects.map((subject) => (
                                  <div key={subject.value} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`strong-${subject.value}`}
                                      checked={field.value?.includes(subject.value)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, subject.value]);
                                        } else {
                                          field.onChange(current.filter((v) => v !== subject.value));
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`strong-${subject.value}`}
                                      className={cn(
                                        "text-sm font-medium leading-none cursor-pointer select-none",
                                        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      )}
                                    >
                                      {subject.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {field.value.map((value) => {
                            const subject = ACADEMIC_SUBJECTS.find(s => s.value === value);
                            return (
                              <Badge key={value} variant="secondary" className="text-xs">
                                {subject?.label}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Geliştirilmesi Gereken Dersler */}
                <FormField
                  control={form.control}
                  name="weakSubjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base font-medium mb-3">
                        <Target className="h-4 w-4 text-orange-600" />
                        Geliştirilmesi Gereken Dersler
                      </FormLabel>
                      <ScrollArea className="h-[300px] rounded-lg border p-4">
                        <div className="space-y-4">
                          {Object.entries(subjectsByCategory).map(([category, subjects]) => (
                            <div key={category} className="space-y-2">
                              <h4 className="text-sm font-semibold text-muted-foreground sticky top-0 bg-background py-1">
                                {category}
                              </h4>
                              <div className="space-y-2 pl-2">
                                {subjects.map((subject) => (
                                  <div key={subject.value} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`weak-${subject.value}`}
                                      checked={field.value?.includes(subject.value)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, subject.value]);
                                        } else {
                                          field.onChange(current.filter((v) => v !== subject.value));
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`weak-${subject.value}`}
                                      className={cn(
                                        "text-sm font-medium leading-none cursor-pointer select-none",
                                        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      )}
                                    >
                                      {subject.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {field.value.map((value) => {
                            const subject = ACADEMIC_SUBJECTS.find(s => s.value === value);
                            return (
                              <Badge key={value} variant="secondary" className="text-xs">
                                {subject?.label}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                </CardContent>
                {localIsDirty && (
                  <CardContent className="pt-0">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </CardContent>
                )}
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Beceriler Bölümü */}
          <Collapsible open={isSkillsOpen} onOpenChange={setIsSkillsOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <CardTitle className="text-lg">Akademik Beceriler</CardTitle>
                    </div>
                    {isSkillsOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Güçlü Beceriler */}
                <FormField
                  control={form.control}
                  name="strongSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base font-medium mb-3">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Güçlü Beceriler
                      </FormLabel>
                      <ScrollArea className="h-[300px] rounded-lg border p-4">
                        <div className="space-y-4">
                          {Object.entries(skillsByCategory).map(([category, skills]) => (
                            <div key={category} className="space-y-2">
                              <h4 className="text-sm font-semibold text-muted-foreground sticky top-0 bg-background py-1">
                                {category}
                              </h4>
                              <div className="space-y-2 pl-2">
                                {skills.map((skill) => (
                                  <div key={skill.value} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`strong-skill-${skill.value}`}
                                      checked={field.value?.includes(skill.value)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, skill.value]);
                                        } else {
                                          field.onChange(current.filter((v) => v !== skill.value));
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`strong-skill-${skill.value}`}
                                      className={cn(
                                        "text-sm font-medium leading-none cursor-pointer select-none",
                                        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      )}
                                    >
                                      {skill.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {field.value.map((value) => {
                            const skill = ACADEMIC_SKILLS.find(s => s.value === value);
                            return (
                              <Badge key={value} variant="secondary" className="text-xs">
                                {skill?.label}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Geliştirilmesi Gereken Beceriler */}
                <FormField
                  control={form.control}
                  name="weakSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base font-medium mb-3">
                        <Target className="h-4 w-4 text-orange-600" />
                        Geliştirilmesi Gereken Beceriler
                      </FormLabel>
                      <ScrollArea className="h-[300px] rounded-lg border p-4">
                        <div className="space-y-4">
                          {Object.entries(skillsByCategory).map(([category, skills]) => (
                            <div key={category} className="space-y-2">
                              <h4 className="text-sm font-semibold text-muted-foreground sticky top-0 bg-background py-1">
                                {category}
                              </h4>
                              <div className="space-y-2 pl-2">
                                {skills.map((skill) => (
                                  <div key={skill.value} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`weak-skill-${skill.value}`}
                                      checked={field.value?.includes(skill.value)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, skill.value]);
                                        } else {
                                          field.onChange(current.filter((v) => v !== skill.value));
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`weak-skill-${skill.value}`}
                                      className={cn(
                                        "text-sm font-medium leading-none cursor-pointer select-none",
                                        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      )}
                                    >
                                      {skill.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {field.value.map((value) => {
                            const skill = ACADEMIC_SKILLS.find(s => s.value === value);
                            return (
                              <Badge key={value} variant="secondary" className="text-xs">
                                {skill?.label}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                </CardContent>
                {localIsDirty && (
                  <CardContent className="pt-0">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </CardContent>
                )}
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Öğrenme Stilleri */}
          <Collapsible open={isLearningStylesOpen} onOpenChange={setIsLearningStylesOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-pink-600" />
                      <CardTitle className="text-lg">Öğrenme Stilleri</CardTitle>
                    </div>
                    {isLearningStylesOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
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
                {localIsDirty && (
                  <CardContent className="pt-0">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </CardContent>
                )}
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Performans Metrikleri */}
          <Collapsible open={isPerformanceOpen} onOpenChange={setIsPerformanceOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Performans Göstergeleri</CardTitle>
                    {isPerformanceOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
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
                {localIsDirty && (
                  <CardContent className="pt-0">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </CardContent>
                )}
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Ek Bilgiler */}
          <Collapsible open={isAdditionalOpen} onOpenChange={setIsAdditionalOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Ek Bilgiler</CardTitle>
                    {isAdditionalOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
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
                {localIsDirty && (
                  <CardContent className="pt-0">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </CardContent>
                )}
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </form>
      </Form>
    </div>
  );
}
