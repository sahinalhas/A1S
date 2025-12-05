import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BehaviorIncident, addBehaviorIncident } from "@/lib/storage";
import { useFormDirty } from "@/pages/StudentProfile/StudentProfile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { EnhancedTextarea } from "@/components/molecules/EnhancedTextarea";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Checkbox } from "@/components/atoms/Checkbox";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/atoms/Select";
import {
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from "@/components/organisms/Form";
import { ClipboardList } from "lucide-react";

const behaviorTypes = ["SÖZLÜ","FİZİKSEL","KURALLARA_UYMAMA","DERSE_KATILMAMA","DİĞER"] as const;
const intensityLevels = ["DÜŞÜK","ORTA","YÜKSEK"] as const;
const effectivenessLevels = ["ÇOK_ETKİLİ","ETKİLİ","KISMEN_ETKİLİ","ETKİSİZ"] as const;

const behaviorIncidentSchema = z.object({
 incidentDate: z.string().min(1,"Olay tarihi gereklidir"),
 incidentTime: z.string().optional(),
 location: z.string().optional(),
 behaviorType: z.enum(behaviorTypes),
 description: z.string().min(1,"Davranış açıklaması gereklidir"),
 antecedent: z.string().optional(),
 consequence: z.string().optional(),
 intensity: z.enum(intensityLevels).optional(),
 interventionUsed: z.string().optional(),
 interventionEffectiveness: z.enum(effectivenessLevels).optional(),
 parentNotified: z.boolean(),
 recordedBy: z.string().optional(),
 notes: z.string().optional(),
});

type BehaviorIncidentFormValues = z.infer<typeof behaviorIncidentSchema>;

interface DavranisTakibiSectionProps {
 studentId: string;
 behaviorIncidents: BehaviorIncident[];
 onUpdate: () => void;
}

export default function DavranisTakibiSection({ studentId, behaviorIncidents, onUpdate }: DavranisTakibiSectionProps) {
 const { setIsDirty, registerFormSubmit, unregisterFormSubmit } = useFormDirty();
 const componentId = useMemo(() => crypto.randomUUID(), []);
 const form = useForm<BehaviorIncidentFormValues>({
 resolver: zodResolver(behaviorIncidentSchema),
 mode: 'onSubmit',
 defaultValues: {
 incidentDate: new Date().toISOString().slice(0, 10),
 incidentTime:"",
 location:"",
 behaviorType:"SÖZLÜ",
 description:"",
 antecedent:"",
 consequence:"",
 intensity:"ORTA",
 interventionUsed:"",
 interventionEffectiveness:"KISMEN_ETKİLİ",
 parentNotified: false,
 recordedBy:"",
 notes:"",
 },
 });

 useEffect(() => {
 const subscription = form.watch(() => {
 setIsDirty(true);
 });
 return () => subscription.unsubscribe();
 }, [form, setIsDirty]);

 const onSubmitRef = useRef<(data: BehaviorIncidentFormValues) => Promise<void>>();

 const onSubmit = async (data: BehaviorIncidentFormValues) => {
 const behaviorData: BehaviorIncident = {
 id: crypto.randomUUID(),
 studentId,
 incidentDate: data.incidentDate,
 incidentTime: data.incidentTime || '',
 location: data.location || '',
 behaviorType: data.behaviorType,
 behaviorCategory: data.behaviorType,
 description: data.description,
 antecedent: data.antecedent,
 consequence: data.consequence,
 intensity: data.intensity,
 interventionUsed: data.interventionUsed,
 interventionEffectiveness: data.interventionEffectiveness,
 parentNotified: data.parentNotified,
 followUpRequired: false,
 adminNotified: false,
 status: 'KAYITLI',
 recordedBy: data.recordedBy || 'Sistem',
 notes: data.notes,
 };
 
 await addBehaviorIncident(behaviorData);
 form.reset();
 onUpdate();
 };

 useEffect(() => {
 onSubmitRef.current = onSubmit;
 }, [onSubmit]);

 useEffect(() => {
 registerFormSubmit(componentId, async () => {
 const isValid = await form.trigger();
 if (isValid && onSubmitRef.current) {
 await form.handleSubmit(onSubmitRef.current)();
 }
 });
 return () => unregisterFormSubmit(componentId);
 }, [form, componentId, registerFormSubmit, unregisterFormSubmit]);

 return (
 <Card>
 <CardHeader>
 <CardTitle>Davranış Takibi - ABC Analizi</CardTitle>
 <CardDescription>Davranış olayları ve müdahale etkinliği</CardDescription>
 </CardHeader>
 <CardContent>
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <FormField
 control={form.control}
 name="incidentDate"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Olay Tarihi</FormLabel>
 <FormControl>
 <Input type="date" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="incidentTime"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Olay Saati</FormLabel>
 <FormControl>
 <Input type="time" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 
 <FormField
 control={form.control}
 name="location"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Konum</FormLabel>
 <FormControl>
 <Input placeholder="Sınıf, bahçe, vb." {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <FormField
 control={form.control}
 name="behaviorType"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Davranış Türü</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Davranış türü seçin" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 <SelectItem value="SÖZLÜ">Sözlü</SelectItem>
 <SelectItem value="FİZİKSEL">Fiziksel</SelectItem>
 <SelectItem value="KURALLARA_UYMAMA">Kurallara Uymama</SelectItem>
 <SelectItem value="DERSE_KATILMAMA">Derse Katılmama</SelectItem>
 <SelectItem value="DİĞER">Diğer</SelectItem>
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="intensity"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Yoğunluk</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Yoğunluk seviyesi seçin" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 <SelectItem value="DÜŞÜK">Düşük</SelectItem>
 <SelectItem value="ORTA">Orta</SelectItem>
 <SelectItem value="YÜKSEK">Yüksek</SelectItem>
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 
 <FormField
 control={form.control}
 name="description"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Davranış Açıklaması</FormLabel>
 <FormControl>
 <EnhancedTextarea 
 placeholder="Davranışı detaylı olarak açıklayın" 
 rows={2} 
 {...field} 
 aiContext="notes"
 enableVoice={true}
 voiceLanguage="tr-TR"
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="antecedent"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Öncül (Antecedent)</FormLabel>
 <FormControl>
 <EnhancedTextarea placeholder="Davranıştan önce ne oldu?" rows={2} {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="consequence"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Sonuç (Consequence)</FormLabel>
 <FormControl>
 <EnhancedTextarea placeholder="Davranıştan sonra ne oldu?" rows={2} {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="interventionUsed"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Kullanılan Müdahale</FormLabel>
 <FormControl>
 <EnhancedTextarea placeholder="Uygulanan müdahaleyi açıklayın" rows={2} {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="interventionEffectiveness"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Müdahale Etkinliği</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Etkinlik seviyesi seçin" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 <SelectItem value="ÇOK_ETKİLİ">Çok Etkili</SelectItem>
 <SelectItem value="ETKİLİ">Etkili</SelectItem>
 <SelectItem value="KISMEN_ETKİLİ">Kısmen Etkili</SelectItem>
 <SelectItem value="ETKİSİZ">Etkisiz</SelectItem>
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="parentNotified"
 render={({ field }) => (
 <FormItem className="flex flex-row items-start space-x-3 space-y-0">
 <FormControl>
 <Checkbox
 checked={field.value}
 onCheckedChange={field.onChange}
 />
 </FormControl>
 <div className="space-y-1 leading-none">
 <FormLabel>
 Veli bilgilendirildi
 </FormLabel>
 </div>
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="recordedBy"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Kaydeden Kişi</FormLabel>
 <FormControl>
 <Input placeholder="Adınızı girin" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="notes"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Notlar ve Patern Analizi</FormLabel>
 <FormControl>
 <EnhancedTextarea placeholder="Ek notlar ve gözlemler" rows={2} {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 </form>
 </Form>
 
 {behaviorIncidents.length > 0 && (
 <div className="space-y-2 mt-6">
 <h4 className="font-medium">Davranış Kayıtları</h4>
 {behaviorIncidents.map(incident => (
 <div key={incident.id} className="border rounded-lg p-3 space-y-2">
 <div className="flex items-center justify-between">
 <div className="text-sm font-medium">
 {new Date(incident.incidentDate).toLocaleDateString()} {incident.incidentTime}
 </div>
 <Badge>{incident.behaviorType}</Badge>
 </div>
 <div className="text-sm">{incident.description}</div>
 {incident.antecedent && (
 <div className="text-xs"><strong>Öncül:</strong> {incident.antecedent}</div>
 )}
 {incident.interventionUsed && (
 <div className="text-xs"><strong>Müdahale:</strong> {incident.interventionUsed}</div>
 )}
 </div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 );
}
