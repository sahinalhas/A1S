import { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import { MultiSelect } from "@/components/molecules/MultiSelect";
import { toast } from "sonner";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { BEHAVIOR_CATEGORIES } from "@shared/constants/student-profile-taxonomy";
import { useFormDirty } from "@/pages/StudentProfile/StudentProfile";

const behaviorIncidentSchema = z.object({
 incidentDate: z.string(),
 behaviorCategory: z.string(),
 antecedent: z.string(),
 behavior: z.string(),
 consequence: z.string(),
 severity: z.enum(['DÜŞÜK', 'ORTA', 'YÜKSEK', 'ÇOK_YÜKSEK']),
 frequency: z.enum(['TEK_OLAY', 'NADİR', 'HAFTALIK', 'GÜNLÜK', 'SÜREKLİ']),
 duration: z.string().optional(),
 triggerFactors: z.array(z.string()),
 interventionUsed: z.string().optional(),
 interventionEffectiveness: z.number().min(1).max(10).optional(),
 followUpNeeded: z.boolean(),
 followUpNotes: z.string().optional(),
});

type BehaviorIncidentFormValues = z.infer<typeof behaviorIncidentSchema>;

interface StandardizedBehaviorSectionProps {
 studentId: string;
 behaviorData?: any[];
 onUpdate: () => void;
}

export default function StandardizedBehaviorSection({ 
 studentId, 
 behaviorData = [],
 onUpdate 
}: StandardizedBehaviorSectionProps) {
 const { setIsDirty, registerFormSubmit, unregisterFormSubmit } = useFormDirty();
 const componentId = useMemo(() => crypto.randomUUID(), []);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [showForm, setShowForm] = useState(false);

 const { data: savedBehaviorData = [], refetch } = useQuery({
 queryKey: ['/api/standardized-profile/behavior-incidents', studentId],
 queryFn: async () => {
 const response = await fetch(`/api/standardized-profile/${studentId}/behavior-incidents`, {
   credentials: 'include'
 });
 if (!response.ok) throw new Error('Failed to fetch behavior incidents');
 return response.json();
 },
 enabled: !!studentId,
 });

 const form = useForm<BehaviorIncidentFormValues>({
 resolver: zodResolver(behaviorIncidentSchema),
 mode: 'onSubmit',
 defaultValues: {
 incidentDate: new Date().toISOString().slice(0, 10),
 behaviorCategory:"",
 antecedent:"",
 behavior:"",
 consequence:"",
 severity:"ORTA",
 frequency:"TEK_OLAY",
 duration:"",
 triggerFactors: [],
 interventionUsed:"",
 interventionEffectiveness: 5,
 followUpNeeded: false,
 followUpNotes:"",
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
 setIsSubmitting(true);
 try {
 const payload = {
 id: self.crypto.randomUUID(),
 studentId,
 ...data,
 };

 const response = await fetch(`/api/standardized-profile/${studentId}/behavior-incident`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 credentials: 'include',
 body: JSON.stringify(payload),
 });

 if (!response.ok) throw new Error('Failed to save');

 toast.success("Davranış kaydı eklendi");
 form.reset();
 setShowForm(false);
 await refetch();
 onUpdate();
 } catch (error) {
 toast.error("Kayıt sırasında hata oluştu");
 console.error("Error saving behavior incident:", error);
 } finally {
 setIsSubmitting(false);
 }
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

 const handleDelete = async (incidentId: string) => {
 try {
 const response = await fetch(`/api/standardized-profile/${studentId}/behavior-incident/${incidentId}`, {
 method: 'DELETE',
 credentials: 'include',
 });

 if (!response.ok) throw new Error('Failed to delete');

 toast.success("Davranış kaydı silindi");
 await refetch();
 onUpdate();
 } catch (error) {
 toast.error("Silme işlemi başarısız");
 console.error("Error deleting incident:", error);
 }
 };

 const triggerOptions = [
 { value: 'ÖDEV_YÜKÜ', label: 'Ödev Yükü', category: 'Akademik' },
 { value: 'SINAV_KAYGISI', label: 'Sınav Kaygısı', category: 'Akademik' },
 { value: 'AKRAN_ÇATIŞMASI', label: 'Akran Çatışması', category: 'Sosyal' },
 { value: 'DIŞLANMA', label: 'Dışlanma', category: 'Sosyal' },
 { value: 'AİLE_SORUNU', label: 'Aile Sorunu', category: 'Ailesel' },
 { value: 'EKONOMİK_SIKINTI', label: 'Ekonomik Sıkıntı', category: 'Ailesel' },
 { value: 'YORGUNLUK', label: 'Yorgunluk', category: 'Fiziksel' },
 { value: 'AÇLIK', label: 'Açlık', category: 'Fiziksel' },
 { value: 'UYKU_EKSIKLIĞI', label: 'Uyku Eksikliği', category: 'Fiziksel' },
 ];

 return (
 <div className="space-y-6">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <AlertTriangle className="h-5 w-5" />
 Standartlaştırılmış Davranış Takibi (ABC Modeli)
 </CardTitle>
 <CardDescription>
 Antecedent-Behavior-Consequence analizi ve müdahale kayıtları
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 {savedBehaviorData.length > 0 ? (
 <div className="space-y-3">
 {savedBehaviorData.map((incident: any) => (
 <Card key={incident.id} className="border-l-4 border-l-orange-500">
 <CardContent className="pt-4">
 <div className="flex justify-between items-start mb-3">
 <div>
 <p className="font-semibold text-sm">
 {new Date(incident.incidentDate).toLocaleDateString('tr-TR')} - {incident.behaviorCategory}
 </p>
 <div className="flex gap-2 mt-1">
 <span className={`text-xs px-2 py-0.5 rounded ${
 incident.severity === 'ÇOK_YÜKSEK' ? 'bg-red-100 text-red-800' :
 incident.severity === 'YÜKSEK' ? 'bg-orange-100 text-orange-800' :
 incident.severity === 'ORTA' ? 'bg-yellow-100 text-yellow-800' :
 'bg-green-100 text-green-800'
 }`}>
 {incident.severity}
 </span>
 <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
 {incident.frequency}
 </span>
 </div>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleDelete(incident.id)}
 >
 <Trash2 className="h-4 w-4 text-red-500" />
 </Button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
 <div>
 <p className="font-medium text-muted-foreground">Öncül (A):</p>
 <p>{incident.antecedent}</p>
 </div>
 <div>
 <p className="font-medium text-muted-foreground">Davranış (B):</p>
 <p>{incident.behavior}</p>
 </div>
 <div>
 <p className="font-medium text-muted-foreground">Sonuç (C):</p>
 <p>{incident.consequence}</p>
 </div>
 </div>

 {incident.interventionUsed && (
 <div className="mt-3 pt-3 border-t">
 <p className="text-sm">
 <span className="font-medium">Müdahale:</span> {incident.interventionUsed}
 {incident.interventionEffectiveness && (
 <span className="ml-2 text-muted-foreground">
 (Etkinlik: {incident.interventionEffectiveness}/10)
 </span>
 )}
 </p>
 </div>
 )}

 {incident.followUpNeeded && incident.followUpNotes && (
 <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
 <p className="font-medium text-blue-800">Takip Gerekli:</p>
 <p className="text-blue-700">{incident.followUpNotes}</p>
 </div>
 )}
 </CardContent>
 </Card>
 ))}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground text-center py-6">
 Henüz davranış kaydı bulunmuyor
 </p>
 )}

 <Button
 type="button"
 variant="outline"
 className="w-full"
 onClick={() => setShowForm(!showForm)}
 >
 <Plus className="h-4 w-4 mr-2" />
 {showForm ?"Formu Kapat" :"Yeni Davranış Kaydı Ekle"}
 </Button>
 </div>
 </CardContent>
 </Card>

 {showForm && (
 <Card>
 <CardHeader>
 <CardTitle className="text-lg">Yeni Davranış Olayı Kaydı</CardTitle>
 </CardHeader>
 <CardContent>
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
 name="behaviorCategory"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Davranış Kategorisi</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Kategori seçin" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 {BEHAVIOR_CATEGORIES.map((cat) => (
 <SelectItem key={cat.value} value={cat.value}>
 {cat.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <div className="space-y-4 border-t pt-4">
 <h3 className="text-sm font-semibold text-muted-foreground">ABC Analizi</h3>

 <FormField
 control={form.control}
 name="antecedent"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Öncül (Antecedent) - Ne oldu?</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Davranıştan hemen önce ne oldu, ortam nasıldı?" 
 className="min-h-[60px]"
 {...field} 
 />
 </FormControl>
 <FormDescription>Davranışı tetikleyen durumu tanımlayın</FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="behavior"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Davranış (Behavior) - Ne yaptı?</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Gözlemlenen davranışı spesifik ve gözlemlenebilir şekilde tanımlayın" 
 className="min-h-[60px]"
 {...field} 
 />
 </FormControl>
 <FormDescription>Nesnel, ölçülebilir davranış tanımı</FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="consequence"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Sonuç (Consequence) - Ne oldu?</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Davranış sonrasında ne oldu, nasıl tepki verildi?" 
 className="min-h-[60px]"
 {...field} 
 />
 </FormControl>
 <FormDescription>Davranış sonrası ortaya çıkan sonuçlar</FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <FormField
 control={form.control}
 name="severity"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Şiddet Düzeyi</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 <SelectItem value="DÜŞÜK">Düşük</SelectItem>
 <SelectItem value="ORTA">Orta</SelectItem>
 <SelectItem value="YÜKSEK">Yüksek</SelectItem>
 <SelectItem value="ÇOK_YÜKSEK">Çok Yüksek</SelectItem>
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="frequency"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Sıklık</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 <SelectItem value="TEK_OLAY">Tek Olay</SelectItem>
 <SelectItem value="NADİR">Nadir</SelectItem>
 <SelectItem value="HAFTALIK">Haftalık</SelectItem>
 <SelectItem value="GÜNLÜK">Günlük</SelectItem>
 <SelectItem value="SÜREKLİ">Sürekli</SelectItem>
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="duration"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Süre (opsiyonel)</FormLabel>
 <FormControl>
 <Input placeholder="ör: 10 dakika" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <FormField
 control={form.control}
 name="triggerFactors"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Tetikleyici Faktörler</FormLabel>
 <FormControl>
 <MultiSelect
 options={triggerOptions}
 selected={field.value}
 onChange={field.onChange}
 placeholder="Tetikleyicileri seçin"
 groupByCategory
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <div className="space-y-4 border-t pt-4">
 <h3 className="text-sm font-semibold text-muted-foreground">Müdahale Bilgileri</h3>

 <FormField
 control={form.control}
 name="interventionUsed"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Uygulanan Müdahale</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Hangi stratejiler veya müdahaleler kullanıldı?" 
 className="min-h-[60px]"
 {...field} 
 />
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
 <FormLabel>Müdahale Etkinliği: {field.value}/10</FormLabel>
 <FormControl>
 <div className="flex items-center gap-4">
 <input
 type="range"
 min="1"
 max="10"
 value={field.value}
 onChange={(e) => field.onChange(Number(e.target.value))}
 className="flex-1"
 />
 <span className="text-sm font-medium w-8 text-center">{field.value}</span>
 </div>
 </FormControl>
 <FormDescription>Müdahalenin ne kadar etkili olduğunu değerlendirin</FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />

 <div className="flex items-center gap-2">
 <FormField
 control={form.control}
 name="followUpNeeded"
 render={({ field }) => (
 <FormItem className="flex items-center gap-2">
 <FormControl>
 <input
 type="checkbox"
 checked={field.value}
 onChange={field.onChange}
 className="h-4 w-4"
 />
 </FormControl>
 <FormLabel className="!mt-0">Takip gerekli mi?</FormLabel>
 </FormItem>
 )}
 />
 </div>

 {form.watch('followUpNeeded') && (
 <FormField
 control={form.control}
 name="followUpNotes"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Takip Notları</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Takip için gereken adımlar ve notlar..." 
 className="min-h-[60px]"
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 )}
 </div>

 <div className="flex gap-2">
 <Button
 type="button"
 variant="outline"
 onClick={() => {
 form.reset();
 setShowForm(false);
 }}
 >
 İptal
 </Button>
 </div>
 </form>
 </Form>
 </CardContent>
 </Card>
 )}
 </div>
 );
}
