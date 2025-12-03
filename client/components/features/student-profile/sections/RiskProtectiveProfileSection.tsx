import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Slider } from "@/components/atoms/Slider";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import { MultiSelect } from "@/components/molecules/MultiSelect";
import { Shield, AlertTriangle } from "lucide-react";
import { useStandardizedProfileSection } from "@/hooks/state/standardized-profile-section.state";
import { useFormDirty } from "@/pages/StudentProfile/StudentProfile";

const riskProtectiveProfileSchema = z.object({
 assessmentDate: z.string(),
 identifiedRiskFactors: z.array(z.string()),
 protectiveFactors: z.array(z.string()),
 recommendedInterventions: z.array(z.string()),
 overallRiskLevel: z.number().min(1).max(10),
 academicRiskLevel: z.number().min(1).max(10),
 behavioralRiskLevel: z.number().min(1).max(10),
 emotionalRiskLevel: z.number().min(1).max(10),
 socialRiskLevel: z.number().min(1).max(10),
 familySupport: z.number().min(1).max(10),
 peerSupport: z.number().min(1).max(10),
 schoolEngagement: z.number().min(1).max(10),
 resilienceLevel: z.number().min(1).max(10),
 copingSkills: z.number().min(1).max(10),
 riskAssessmentNotes: z.string().optional(),
 interventionPlan: z.string().optional(),
 monitoringFrequency: z.enum(['GÜN', 'HAFTA', 'AY', 'ÜÇAY', 'YARI_YIL']).optional(),
 additionalNotes: z.string().optional(),
});

type RiskProtectiveProfileFormValues = z.infer<typeof riskProtectiveProfileSchema>;

interface RiskProtectiveProfileSectionProps {
 studentId: string;
 riskData?: any;
 onUpdate: () => void;
}

export default function RiskProtectiveProfileSection({ 
 studentId, 
 riskData,
 onUpdate 
}: RiskProtectiveProfileSectionProps) {
 const { setIsDirty, registerFormSubmit, unregisterFormSubmit } = useFormDirty();
 const componentId = useMemo(() => crypto.randomUUID(), []);
 const form = useForm<RiskProtectiveProfileFormValues>({
 resolver: zodResolver(riskProtectiveProfileSchema),
 defaultValues: {
 assessmentDate: new Date().toISOString().slice(0, 10),
 identifiedRiskFactors: [],
 protectiveFactors: [],
 recommendedInterventions: [],
 overallRiskLevel: 5,
 academicRiskLevel: 5,
 behavioralRiskLevel: 5,
 emotionalRiskLevel: 5,
 socialRiskLevel: 5,
 familySupport: 5,
 peerSupport: 5,
 schoolEngagement: 5,
 resilienceLevel: 5,
 copingSkills: 5,
 riskAssessmentNotes:"",
 interventionPlan:"",
 monitoringFrequency: undefined,
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
 sectionName: 'Risk ve koruyucu faktörler profili',
 apiEndpoint: 'risk-protective',
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

 const riskFactorOptions = [
 { value: 'DÜŞÜK_AKADEMİK_BAŞARI', label: 'Düşük Akademik Başarı', category: 'Akademik' },
 { value: 'DEVAMSIZLIK', label: 'Yüksek Devamsızlık', category: 'Akademik' },
 { value: 'ÖĞRENİM_GÜÇLÜGü', label: 'Öğrenim Güçlüğü', category: 'Akademik' },
 { value: 'AİLE_ÇATIŞMASI', label: 'Aile İçi Çatışma', category: 'Ailesel' },
 { value: 'İHMAL', label: 'İhmal/İstismar', category: 'Ailesel' },
 { value: 'EKONOMİK_ZORLUK', label: 'Ekonomik Zorluk', category: 'Ailesel' },
 { value: 'MADDE_KULLANIMI', label: 'Madde Kullanımı', category: 'Davranışsal' },
 { value: 'ŞİDDET', label: 'Şiddet Eğilimi', category: 'Davranışsal' },
 { value: 'AKRAN_BASKI', label: 'Olumsuz Akran Baskısı', category: 'Sosyal' },
 { value: 'İZOLASYON', label: 'Sosyal İzolasyon', category: 'Sosyal' },
 { value: 'DEPRESYON', label: 'Depresyon Belirtileri', category: 'Duygusal' },
 { value: 'KAYGI', label: 'Yüksek Kaygı', category: 'Duygusal' },
 { value: 'TRAVMA', label: 'Travma Öyküsü', category: 'Duygusal' },
 ];

 const protectiveFactorOptions = [
 { value: 'AİLE_DESTEĞİ', label: 'Güçlü Aile Desteği', category: 'Ailesel' },
 { value: 'OLUMLU_ROL_MODEL', label: 'Olumlu Rol Model', category: 'Ailesel' },
 { value: 'AKADEMİK_YETKİNLİK', label: 'Akademik Yetkinlik', category: 'Akademik' },
 { value: 'OKUL_BAĞLILIĞI', label: 'Okul Bağlılığı', category: 'Akademik' },
 { value: 'SOSYAL_BECERİLER', label: 'İyi Sosyal Beceriler', category: 'Sosyal' },
 { value: 'OLUMLU_AKRAN_İLİŞKİLERİ', label: 'Olumlu Akran İlişkileri', category: 'Sosyal' },
 { value: 'PROBLEM_ÇÖZME', label: 'Problem Çözme Becerisi', category: 'Bireysel' },
 { value: 'ÖZ_YETERLİLİK', label: 'Yüksek Öz-yeterlilik', category: 'Bireysel' },
 { value: 'BASAMSAL_İNANÇ', label: 'Olumlu Gelecek İnancı', category: 'Bireysel' },
 { value: 'TOPLULUK_DESTEĞİ', label: 'Topluluk/Kurum Desteği', category: 'Çevresel' },
 ];

 const interventionOptions = [
 { value: 'BİREYSEL_DANIŞMANLIK', label: 'Bireysel Danışmanlık', category: 'Psikolojik Destek' },
 { value: 'GRUP_DANIŞMANLIK', label: 'Grup Danışmanlığı', category: 'Psikolojik Destek' },
 { value: 'AİLE_DANIŞMANLIK', label: 'Aile Danışmanlığı', category: 'Psikolojik Destek' },
 { value: 'AKADEMİK_DESTEK', label: 'Akademik Destek Programı', category: 'Akademik' },
 { value: 'DERS_ÇALIŞMA_BECERİLERİ', label: 'Ders Çalışma Becerileri', category: 'Akademik' },
 { value: 'SOSYAL_BECERİ_EĞİTİMİ', label: 'Sosyal Beceri Eğitimi', category: 'Sosyal-Duygusal' },
 { value: 'ÖFKE_YÖNETİMİ', label: 'Öfke Yönetimi', category: 'Sosyal-Duygusal' },
 { value: 'STRES_YÖNETİMİ', label: 'Stres Yönetimi', category: 'Sosyal-Duygusal' },
 { value: 'MENTOR_PROGRAMI', label: 'Mentor Programı', category: 'Destek Sistemleri' },
 { value: 'OKUL_DIŞI_ETKİNLİK', label: 'Okul Dışı Etkinlik', category: 'Destek Sistemleri' },
 ];

 const overallRisk = form.watch('overallRiskLevel');
 const getRiskColor = (level: number) => {
 if (level <= 3) return 'text-green-600';
 if (level <= 6) return 'text-yellow-600';
 if (level <= 8) return 'text-orange-600';
 return 'text-red-600';
 };

 const getRiskLabel = (level: number) => {
 if (level <= 3) return 'Düşük Risk';
 if (level <= 6) return 'Orta Risk';
 if (level <= 8) return 'Yüksek Risk';
 return 'Çok Yüksek Risk';
 };

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Shield className="h-5 w-5" />
 Risk ve Koruyucu Faktörler Profili
 </CardTitle>
 <CardDescription>
 Öğrenci risk değerlendirmesi ve koruyucu faktör analizi
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

 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-semibold text-muted-foreground">
 Genel Risk Değerlendirmesi
 </h3>
 <div className={`text-lg font-bold ${getRiskColor(overallRisk)}`}>
 {getRiskLabel(overallRisk)}
 </div>
 </div>

 <FormField
 control={form.control}
 name="overallRiskLevel"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Genel Risk Seviyesi: {field.value}/10</FormLabel>
 <FormControl>
 <Slider
 min={1}
 max={10}
 step={1}
 value={[field.value]}
 onValueChange={(vals) => field.onChange(vals[0])}
 className="w-full"
 />
 </FormControl>
 <FormDescription>Öğrencinin genel risk durumu</FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <div className="space-y-6 border-t pt-6">
 <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
 <AlertTriangle className="h-4 w-4" />
 Alan Bazlı Risk Seviyeleri (1-10 Ölçeği)
 </h3>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <FormField
 control={form.control}
 name="academicRiskLevel"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Akademik Risk: {field.value}/10</FormLabel>
 <FormControl>
 <Slider
 min={1}
 max={10}
 step={1}
 value={[field.value]}
 onValueChange={(vals) => field.onChange(vals[0])}
 className="w-full"
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="behavioralRiskLevel"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Davranışsal Risk: {field.value}/10</FormLabel>
 <FormControl>
 <Slider
 min={1}
 max={10}
 step={1}
 value={[field.value]}
 onValueChange={(vals) => field.onChange(vals[0])}
 className="w-full"
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="emotionalRiskLevel"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Duygusal Risk: {field.value}/10</FormLabel>
 <FormControl>
 <Slider
 min={1}
 max={10}
 step={1}
 value={[field.value]}
 onValueChange={(vals) => field.onChange(vals[0])}
 className="w-full"
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="socialRiskLevel"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Sosyal Risk: {field.value}/10</FormLabel>
 <FormControl>
 <Slider
 min={1}
 max={10}
 step={1}
 value={[field.value]}
 onValueChange={(vals) => field.onChange(vals[0])}
 className="w-full"
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 </div>

 <div className="space-y-4 border-t pt-6">
 <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
 <Shield className="h-4 w-4" />
 Koruyucu Faktör Seviyeleri (1-10 Ölçeği)
 </h3>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <FormField
 control={form.control}
 name="familySupport"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Aile Desteği: {field.value}/10</FormLabel>
 <FormControl>
 <Slider
 min={1}
 max={10}
 step={1}
 value={[field.value]}
 onValueChange={(vals) => field.onChange(vals[0])}
 className="w-full"
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="peerSupport"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Akran Desteği: {field.value}/10</FormLabel>
 <FormControl>
 <Slider
 min={1}
 max={10}
 step={1}
 value={[field.value]}
 onValueChange={(vals) => field.onChange(vals[0])}
 className="w-full"
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="schoolEngagement"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Okul Bağlılığı: {field.value}/10</FormLabel>
 <FormControl>
 <Slider
 min={1}
 max={10}
 step={1}
 value={[field.value]}
 onValueChange={(vals) => field.onChange(vals[0])}
 className="w-full"
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="resilienceLevel"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Dayanıklılık: {field.value}/10</FormLabel>
 <FormControl>
 <Slider
 min={1}
 max={10}
 step={1}
 value={[field.value]}
 onValueChange={(vals) => field.onChange(vals[0])}
 className="w-full"
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="copingSkills"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Başa Çıkma Becerileri: {field.value}/10</FormLabel>
 <FormControl>
 <Slider
 min={1}
 max={10}
 step={1}
 value={[field.value]}
 onValueChange={(vals) => field.onChange(vals[0])}
 className="w-full"
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 </div>

 <div className="space-y-4 border-t pt-6">
 <h3 className="text-sm font-semibold text-muted-foreground">
 Risk ve Koruyucu Faktörler
 </h3>

 <FormField
 control={form.control}
 name="identifiedRiskFactors"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Tespit Edilen Risk Faktörleri</FormLabel>
 <FormControl>
 <MultiSelect
 options={riskFactorOptions}
 selected={field.value}
 onChange={field.onChange}
 placeholder="Risk faktörlerini seçin"
 groupByCategory
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="protectiveFactors"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Koruyucu Faktörler</FormLabel>
 <FormControl>
 <MultiSelect
 options={protectiveFactorOptions}
 selected={field.value}
 onChange={field.onChange}
 placeholder="Koruyucu faktörleri seçin"
 groupByCategory
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="recommendedInterventions"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Önerilen Müdahaleler</FormLabel>
 <FormControl>
 <MultiSelect
 options={interventionOptions}
 selected={field.value}
 onChange={field.onChange}
 placeholder="Müdahaleleri seçin"
 groupByCategory
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <div className="space-y-4 border-t pt-6">
 <h3 className="text-sm font-semibold text-muted-foreground">
 Değerlendirme ve Plan
 </h3>

 <FormField
 control={form.control}
 name="riskAssessmentNotes"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Risk Değerlendirme Notları</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Risk faktörlerinin detaylı analizi..." 
 className="min-h-[100px]"
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="interventionPlan"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Müdahale Planı</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Önerilen müdahalelerin detaylı planı ve uygulama adımları..." 
 className="min-h-[100px]"
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="monitoringFrequency"
 render={({ field }) => (
 <FormItem>
 <FormLabel>İzleme Sıklığı</FormLabel>
 <FormControl>
 <select
 className="w-full p-2 border rounded"
 value={field.value || ''}
 onChange={field.onChange}
 >
 <option value="">Seçiniz</option>
 <option value="GÜN">Günlük</option>
 <option value="HAFTA">Haftalık</option>
 <option value="AY">Aylık</option>
 <option value="ÜÇAY">3 Aylık</option>
 <option value="YARI_YIL">6 Aylık</option>
 </select>
 </FormControl>
 <FormDescription>Öğrencinin ne sıklıkla takip edilmesi gerekiyor</FormDescription>
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
 <Textarea 
 placeholder="Risk ve koruyucu faktörler hakkında ek gözlemler..." 
 className="min-h-[80px]"
 {...field} 
 />
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
