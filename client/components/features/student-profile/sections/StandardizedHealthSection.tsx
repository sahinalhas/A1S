import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import { MultiSelect } from "@/components/molecules/MultiSelect";
import { Activity, Droplet, Phone, Calendar } from "lucide-react";
import {
 BLOOD_TYPES,
 CHRONIC_DISEASES,
 ALLERGIES,
 MEDICATION_TYPES
} from "@shared/constants/student-profile-taxonomy";
import { useStandardizedProfileSection } from "@/hooks/state/standardized-profile-section.state";
import { useFormDirty } from "@/pages/StudentProfile/StudentProfile";

const healthProfileSchema = z.object({
 bloodType: z.string().optional(),
 chronicDiseases: z.array(z.string()),
 allergies: z.array(z.string()),
 currentMedications: z.array(z.string()),
 medicalHistory: z.string().optional(),
 specialNeeds: z.string().optional(),
 physicalLimitations: z.string().optional(),
 emergencyContact1Name: z.string().optional(),
 emergencyContact1Phone: z.string().optional(),
 emergencyContact1Relation: z.string().optional(),
 emergencyContact2Name: z.string().optional(),
 emergencyContact2Phone: z.string().optional(),
 emergencyContact2Relation: z.string().optional(),
 physicianName: z.string().optional(),
 physicianPhone: z.string().optional(),
 lastHealthCheckup: z.string().optional(),
 additionalNotes: z.string().optional(),
});

type HealthProfileFormValues = z.infer<typeof healthProfileSchema>;

interface StandardizedHealthSectionProps {
 studentId: string;
 healthData?: any;
 onUpdate: () => void;
}

export default function StandardizedHealthSection({
 studentId,
 healthData,
 onUpdate
}: StandardizedHealthSectionProps) {
 const { setIsDirty, registerFormSubmit, unregisterFormSubmit } = useFormDirty();
 const componentId = useMemo(() => crypto.randomUUID(), []);
 const form = useForm<HealthProfileFormValues>({
 resolver: zodResolver(healthProfileSchema),
 defaultValues: {
 bloodType:"",
 chronicDiseases: [],
 allergies: [],
 currentMedications: [],
 medicalHistory:"",
 specialNeeds:"",
 physicalLimitations:"",
 emergencyContact1Name:"",
 emergencyContact1Phone:"",
 emergencyContact1Relation:"",
 emergencyContact2Name:"",
 emergencyContact2Phone:"",
 emergencyContact2Relation:"",
 physicianName:"",
 physicianPhone:"",
 lastHealthCheckup:"",
 additionalNotes:"",
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
 sectionName: 'Sağlık profili',
 apiEndpoint: 'health',
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
 <Card className="border-none">
 <CardHeader className="pb-4">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
 <Activity className="h-5 w-5 text-red-600 dark:text-red-400" />
 </div>
 <div>
 <CardTitle className="text-lg">Sağlık Bilgileri</CardTitle>
 <CardDescription className="text-xs">Kategorize sağlık ve tıbbi bilgiler</CardDescription>
 </div>
 </div>
 </CardHeader>
 <CardContent className="pt-0">
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
 {/* Temel Sağlık Bilgileri */}
 <div className="space-y-3">
 <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
 <Droplet className="h-3.5 w-3.5" />
 <span>Temel Bilgiler</span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <FormField
 control={form.control}
 name="bloodType"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs font-medium">Kan Grubu</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger className="h-9 text-sm">
 <SelectValue placeholder="Seçiniz" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 {BLOOD_TYPES.map((type) => (
 <SelectItem key={type.value} value={type.value}>
 {type.label}
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
 name="lastHealthCheckup"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs font-medium flex items-center gap-1.5">
 <Calendar className="h-3 w-3" />
 Son Sağlık Kontrolü
 </FormLabel>
 <FormControl>
 <Input type="date" {...field} className="h-9 text-sm" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <FormField
 control={form.control}
 name="chronicDiseases"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs font-medium">Kronik Hastalıklar</FormLabel>
 <FormControl>
 <MultiSelect
 options={CHRONIC_DISEASES}
 selected={field.value}
 onChange={field.onChange}
 placeholder="Seçiniz (opsiyonel)"
 groupByCategory
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="allergies"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs font-medium">Alerjiler</FormLabel>
 <FormControl>
 <MultiSelect
 options={ALLERGIES}
 selected={field.value}
 onChange={field.onChange}
 placeholder="Seçiniz (opsiyonel)"
 groupByCategory
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="currentMedications"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs font-medium">Kullanılan İlaçlar</FormLabel>
 <FormControl>
 <MultiSelect
 options={MEDICATION_TYPES}
 selected={field.value}
 onChange={field.onChange}
 placeholder="Seçiniz (opsiyonel)"
 groupByCategory
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="medicalHistory"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs font-medium">Tıbbi Geçmiş</FormLabel>
 <FormControl>
 <Textarea
 placeholder="Geçmiş ameliyatlar, hastalıklar..."
 className="min-h-[70px] text-sm resize-none"
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <FormField
 control={form.control}
 name="specialNeeds"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs font-medium">Özel İhtiyaçlar</FormLabel>
 <FormControl>
 <Textarea
 placeholder="Özel bakım gereksinimleri..."
 className="min-h-[70px] text-sm resize-none"
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="physicalLimitations"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs font-medium">Fiziksel Kısıtlamalar</FormLabel>
 <FormControl>
 <Textarea
 placeholder="Hareket kısıtlamaları, fiziksel engeller..."
 className="min-h-[70px] text-sm resize-none"
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 </div>

 {/* Acil Durum İletişim */}
 <div className="space-y-3 pt-3 border-t">
 <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
 <Phone className="h-3.5 w-3.5" />
 <span>Acil Durum Kişileri</span>
 </div>

 <div className="bg-muted/30 p-3 rounded-lg space-y-2">
 <div className="text-xs font-medium text-muted-foreground mb-2">Acil Durum Kişileri</div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
 <FormField
 control={form.control}
 name="emergencyContact1Name"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs">1. Kişi - Ad Soyad</FormLabel>
 <FormControl>
 <Input placeholder="Ad Soyad" {...field} className="h-9 text-sm" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="emergencyContact1Phone"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs">1. Kişi - Telefon</FormLabel>
 <FormControl>
 <Input placeholder="0555 123 45 67" {...field} className="h-9 text-sm" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="emergencyContact1Relation"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs">1. Kişi - Yakınlık</FormLabel>
 <FormControl>
 <Input placeholder="Anne, Baba vb." {...field} className="h-9 text-sm" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="emergencyContact2Name"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs">2. Kişi - Ad Soyad</FormLabel>
 <FormControl>
 <Input placeholder="Ad Soyad" {...field} className="h-9 text-sm" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="emergencyContact2Phone"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs">2. Kişi - Telefon</FormLabel>
 <FormControl>
 <Input placeholder="0555 123 45 67" {...field} className="h-9 text-sm" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="emergencyContact2Relation"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs">2. Kişi - Yakınlık</FormLabel>
 <FormControl>
 <Input placeholder="Anne, Baba vb." {...field} className="h-9 text-sm" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 </div>
 </div>

 {/* Ek Bilgiler */}
 <div className="space-y-3 pt-3 border-t">
 <FormField
 control={form.control}
 name="additionalNotes"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs font-medium">Ek Bilgiler</FormLabel>
 <FormControl>
 <Textarea
 placeholder="Sağlık durumu hakkında ek bilgiler ve açıklamalar..."
 className="min-h-[80px] text-sm resize-none"
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 </form>
 </Form>
 </CardContent>
 </Card>
 );
}