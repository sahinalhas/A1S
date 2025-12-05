import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Slider } from "@/components/atoms/Slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { EnhancedTextarea } from "@/components/molecules/EnhancedTextarea";
import { MultiSelect } from "@/components/molecules/MultiSelect";
import { GraduationCap } from "lucide-react";
import { 
 ACADEMIC_SUBJECTS, 
 ACADEMIC_SKILLS,
 LEARNING_STYLES 
} from "@shared/constants/student-profile-taxonomy";
import { useStandardizedProfileSection } from "@/hooks/state/standardized-profile-section.state";
import { Textarea } from "@/components/atoms/Textarea";
import { useFormDirty } from "@/pages/StudentProfile/StudentProfile";

const academicProfileSchema = z.object({
 assessmentDate: z.string(),
 strongSubjects: z.array(z.string()),
 weakSubjects: z.array(z.string()),
 strongSkills: z.array(z.string()),
 weakSkills: z.array(z.string()),
 primaryLearningStyle: z.string().optional(),
 secondaryLearningStyle: z.string().optional(),
 overallMotivation: z.number().min(1).max(10),
 studyHoursPerWeek: z.number().min(0),
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
 primaryLearningStyle:"",
 secondaryLearningStyle:"",
 overallMotivation: 5,
 studyHoursPerWeek: 0,
 homeworkCompletionRate: 50,
 additionalNotes:"",
 languageSkills:"",
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

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <GraduationCap className="h-5 w-5" />
 Akademik Profil
 </CardTitle>
 <CardDescription>
 Ölçülebilir akademik yetkinlikler ve öğrenme stilleri
 </CardDescription>
 </CardHeader>
 <CardContent>
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
 <FormField
 control={form.control}
 name="assessmentDate"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Değerlendirme Tarihi</FormLabel>
 <FormControl>
 <Input type="date" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <FormField
 control={form.control}
 name="strongSubjects"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Güçlü Dersler</FormLabel>
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
 <FormItem>
 <FormLabel>Geliştirilmesi Gereken Dersler</FormLabel>
 <FormControl>
 <MultiSelect
 options={ACADEMIC_SUBJECTS}
 selected={field.value}
 onChange={field.onChange}
 placeholder="Zayıf olduğu dersleri seçiniz..."
 groupByCategory
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <FormField
 control={form.control}
 name="strongSkills"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Güçlü Beceriler</FormLabel>
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
 <FormItem>
 <FormLabel>Geliştirilmesi Gereken Beceriler</FormLabel>
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

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <FormField
 control={form.control}
 name="primaryLearningStyle"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Birincil Öğrenme Stili</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Öğrenme stili seçiniz" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 {LEARNING_STYLES.map((style) => (
 <SelectItem key={style.value} value={style.value}>
 {style.label} - {style.description}
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
 <SelectValue placeholder="Öğrenme stili seçiniz" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 {LEARNING_STYLES.map((style) => (
 <SelectItem key={style.value} value={style.value}>
 {style.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <FormField
 control={form.control}
 name="overallMotivation"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Genel Motivasyon Seviyesi (1-10): {field.value}</FormLabel>
 <FormControl>
 <Slider
 min={1}
 max={10}
 step={1}
 value={[field.value]}
 onValueChange={(vals) => field.onChange(vals[0])}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <FormField
 control={form.control}
 name="studyHoursPerWeek"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Haftalık Çalışma Saati</FormLabel>
 <FormControl>
 <Input 
 type="number" 
 {...field} 
 onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="homeworkCompletionRate"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Ödev Tamamlama Oranı: {field.value}%</FormLabel>
 <FormControl>
 <Slider
 min={0}
 max={100}
 step={5}
 value={[field.value]}
 onValueChange={(vals) => field.onChange(vals[0])}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="languageSkills"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Dil Becerileri</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Örn: İngilizce (B2), Almanca (A1)..." 
 className="min-h-[60px]"
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <FormField
 control={form.control}
 name="additionalNotes"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Ek Notlar</FormLabel>
 <FormControl>
 <EnhancedTextarea {...field} rows={3} aiContext="academic" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 </form>
 </Form>
 </CardContent>
 </Card>
 );
}