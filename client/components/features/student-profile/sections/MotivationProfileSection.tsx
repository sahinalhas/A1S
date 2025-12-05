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
import { Target } from "lucide-react";
import { useStandardizedProfileSection } from "@/hooks/state/standardized-profile-section.state";
import { useFormDirty } from "@/pages/StudentProfile/StudentProfile";

const motivationProfileSchema = z.object({
 assessmentDate: z.string(),
 primaryMotivators: z.array(z.string()),
 careerAspirations: z.array(z.string()),
 academicGoals: z.array(z.string()),
 goalClarityLevel: z.number().min(1).max(10),
 intrinsicMotivationLevel: z.number().min(1).max(10),
 extrinsicMotivationLevel: z.number().min(1).max(10),
 persistenceLevel: z.number().min(1).max(10),
 futureOrientationLevel: z.number().min(1).max(10),
 shortTermGoals: z.string().optional(),
 longTermGoals: z.string().optional(),
 obstacles: z.string().optional(),
 supportNeeds: z.string().optional(),
 additionalNotes: z.string().optional(),
 studentExpectations: z.string().optional(),
 familyExpectations: z.string().optional(),
});

type MotivationProfileFormValues = z.infer<typeof motivationProfileSchema>;

interface MotivationProfileSectionProps {
 studentId: string;
 motivationData?: any;
 onUpdate: () => void;
}

export default function MotivationProfileSection({ 
 studentId, 
 motivationData,
 onUpdate 
}: MotivationProfileSectionProps) {
 const { setIsDirty, registerFormSubmit, unregisterFormSubmit } = useFormDirty();
 const componentId = useMemo(() => crypto.randomUUID(), []);
 const form = useForm<MotivationProfileFormValues>({
 resolver: zodResolver(motivationProfileSchema),
 mode: 'onBlur',
 defaultValues: {
 assessmentDate: new Date().toISOString().slice(0, 10),
 primaryMotivators: [],
 careerAspirations: [],
 academicGoals: [],
 goalClarityLevel: 5,
 intrinsicMotivationLevel: 5,
 extrinsicMotivationLevel: 5,
 persistenceLevel: 5,
 futureOrientationLevel: 5,
 shortTermGoals:"",
 longTermGoals:"",
 obstacles:"",
 supportNeeds:"",
 additionalNotes:"",
 studentExpectations:"",
 familyExpectations:"",
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
 sectionName: 'Motivasyon profili',
 apiEndpoint: 'motivation',
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

 const motivatorOptions = [
 { value: 'AKADEMİK_BAŞARI', label: 'Akademik Başarı', category: 'İçsel' },
 { value: 'MERAK', label: 'Merak ve Öğrenme İsteği', category: 'İçsel' },
 { value: 'ÖZERKLIK', label: 'Özerklik ve Bağımsızlık', category: 'İçsel' },
 { value: 'YETKİNLİK', label: 'Yetkinlik Hissi', category: 'İçsel' },
 { value: 'AİLE_BEKLENTİSİ', label: 'Aile Beklentisi', category: 'Dışsal' },
 { value: 'AKRAN_TANINMA', label: 'Akran Tanınması', category: 'Dışsal' },
 { value: 'ÖDÜL_TAKDİR', label: 'Ödül ve Takdir', category: 'Dışsal' },
 { value: 'GELECEKTEKİ_BAŞARI', label: 'Gelecekteki Kariyer Başarısı', category: 'Dışsal' },
 { value: 'REKABET', label: 'Rekabet', category: 'Dışsal' },
 ];

 const careerOptions = [
 { value: 'TIP', label: 'Tıp', category: 'Sağlık Bilimleri' },
 { value: 'MÜHENDİSLİK', label: 'Mühendislik', category: 'Fen Bilimleri' },
 { value: 'HUKUK', label: 'Hukuk', category: 'Sosyal Bilimler' },
 { value: 'EĞİTİM', label: 'Eğitim', category: 'Sosyal Bilimler' },
 { value: 'İŞLETME', label: 'İşletme/Ekonomi', category: 'İdari Bilimler' },
 { value: 'SANAT_TASARIM', label: 'Sanat ve Tasarım', category: 'Güzel Sanatlar' },
 { value: 'MEDYA_İLETİŞİM', label: 'Medya ve İletişim', category: 'İletişim' },
 { value: 'SPOR', label: 'Spor Bilimleri', category: 'Sağlık Bilimleri' },
 { value: 'TEKNOLOJİ_BT', label: 'Teknoloji/BT', category: 'Fen Bilimleri' },
 { value: 'BELİRSİZ', label: 'Henüz Belirli Değil', category: 'Diğer' },
 ];

 const academicGoalOptions = [
 { value: 'ÜNİVERSİTE', label: 'Üniversite Kazanma', category: 'Kısa Vadeli' },
 { value: 'BURS', label: 'Burs Kazanma', category: 'Kısa Vadeli' },
 { value: 'NOT_ORTALAMASI', label: 'Not Ortalaması Yükseltme', category: 'Kısa Vadeli' },
 { value: 'SINAV_BAŞARISI', label: 'Sınav Başarısı', category: 'Kısa Vadeli' },
 { value: 'LİSANSÜSTÜ', label: 'Lisansüstü Eğitim', category: 'Uzun Vadeli' },
 { value: 'YURT_DIŞI_EĞİTİM', label: 'Yurt Dışı Eğitim', category: 'Uzun Vadeli' },
 { value: 'ARAŞTIRMACI', label: 'Araştırmacı Olma', category: 'Uzun Vadeli' },
 ];

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Target className="h-5 w-5" />
 Motivasyon ve Hedef Profili
 </CardTitle>
 <CardDescription>
 Öğrenci motivasyon kaynakları ve kariyer hedefleri
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
 <h3 className="text-sm font-semibold text-muted-foreground">
 Motivasyon Kaynakları ve Hedefler
 </h3>

 <FormField
 control={form.control}
 name="primaryMotivators"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Ana Motivasyon Kaynakları</FormLabel>
 <FormControl>
 <MultiSelect
 options={motivatorOptions}
 selected={field.value}
 onChange={field.onChange}
 placeholder="Motivasyon kaynaklarını seçin"
 groupByCategory
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="careerAspirations"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Kariyer Aspirasyonları</FormLabel>
 <FormControl>
 <MultiSelect
 options={careerOptions}
 selected={field.value}
 onChange={field.onChange}
 placeholder="İlgilenilen kariyer alanlarını seçin"
 groupByCategory
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="academicGoals"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Akademik Hedefler</FormLabel>
 <FormControl>
 <MultiSelect
 options={academicGoalOptions}
 selected={field.value}
 onChange={field.onChange}
 placeholder="Akademik hedefleri seçin"
 groupByCategory
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <div className="space-y-6 border-t pt-6">
 <h3 className="text-sm font-semibold text-muted-foreground">
 Motivasyon Düzey Değerlendirmesi (1-10 Ölçeği)
 </h3>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <FormField
 control={form.control}
 name="goalClarityLevel"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Hedef Netliği: {field.value}/10</FormLabel>
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
 <FormDescription>Hedeflerini ne kadar net tanımlayabiliyor</FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="intrinsicMotivationLevel"
 render={({ field }) => (
 <FormItem>
 <FormLabel>İçsel Motivasyon: {field.value}/10</FormLabel>
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
 <FormDescription>Kendi isteğiyle öğrenme ve gelişme isteği</FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="extrinsicMotivationLevel"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Dışsal Motivasyon: {field.value}/10</FormLabel>
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
 <FormDescription>Ödül, takdir ve dış teşviklerle motive olma</FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="persistenceLevel"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Azim ve Sebat: {field.value}/10</FormLabel>
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
 <FormDescription>Zorluklara karşı dayanıklılık</FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="futureOrientationLevel"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Gelecek Yönelimi: {field.value}/10</FormLabel>
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
 <FormDescription>Uzun vadeli planlama ve gelecek odaklılık</FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 </div>

 <div className="space-y-4 border-t pt-6">
 <h3 className="text-sm font-semibold text-muted-foreground">
 Hedef Detayları
 </h3>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <FormField
 control={form.control}
 name="shortTermGoals"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Kısa Vadeli Hedefler (1 yıl içi)</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Bu yıl için hedefler..." 
 className="min-h-[80px]"
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="longTermGoals"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Uzun Vadeli Hedefler (5-10 yıl)</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Gelecek için büyük hedefler..." 
 className="min-h-[80px]"
 {...field} 
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
 name="obstacles"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Engeller ve Zorluklar</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Hedeflere ulaşmada karşılaşılan zorluklar..." 
 className="min-h-[80px]"
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="supportNeeds"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Destek İhtiyaçları</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Öğrencinin hedeflerine ulaşması için gerekli destekler..." 
 className="min-h-[80px]"
 {...field} 
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
 <Target className="h-4 w-4" />
 Beklentiler ve Hedefler
 </h3>

 <FormField
 control={form.control}
 name="studentExpectations"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Öğrenci Beklentileri</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Öğrencinin kendi eğitim ve gelecek hedefleri, beklentileri..." 
 className="min-h-[100px]"
 {...field} 
 />
 </FormControl>
 <FormDescription>
 Öğrencinin kendi ifadeleriyle gelecek planları
 </FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="familyExpectations"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Aile Beklentileri</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Ailenin öğrenciden beklentileri, eğitim hedefleri..." 
 className="min-h-[100px]"
 {...field} 
 />
 </FormControl>
 <FormDescription>
 Velilerin çocuklarından akademik ve sosyal beklentileri
 </FormDescription>
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
 placeholder="Motivasyon ve hedefler hakkında ek gözlemler..." 
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