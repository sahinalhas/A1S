import { useEffect, useState, useMemo, useRef } from "react";
import { SpecialEducation } from "@/lib/storage";
import { addSpecialEducation, updateSpecialEducation, getSpecialEducationByStudent } from "@/lib/api/endpoints/special-education.api";
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
import { FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useFormDirty } from "@/pages/StudentProfile/StudentProfile";

const specialEducationSchema = z.object({
 hasIEP: z.boolean(),
 iepStartDate: z.string().optional(),
 iepEndDate: z.string().optional(),
 iepGoals: z.string().optional(),
 diagnosis: z.string().optional(),
 ramReportDate: z.string().optional(),
 ramReportSummary: z.string().optional(),
 supportServices: z.string().optional(),
 accommodations: z.string().optional(),
 status: z.string(),
 nextReviewDate: z.string().optional(),
 notes: z.string().optional(),
});

type SpecialEducationFormValues = z.infer<typeof specialEducationSchema>;

interface OzelEgitimSectionProps {
 studentId: string;
 specialEducation: SpecialEducation[];
 onUpdate: () => void;
}

export default function OzelEgitimSection({ studentId, specialEducation, onUpdate }: OzelEgitimSectionProps) {
 const { setIsDirty, registerFormSubmit, unregisterFormSubmit } = useFormDirty();
 const componentId = useMemo(() => crypto.randomUUID(), []);
 const [records, setRecords] = useState<SpecialEducation[]>(specialEducation || []);
 const [isLoading, setIsLoading] = useState(false);
 const existingRecord = records && records.length > 0 ? records[0] : null;

 // Backend'den verileri çek
 useEffect(() => {
 const fetchRecords = async () => {
 try {
 setIsLoading(true);
 const data = await getSpecialEducationByStudent(studentId);
 setRecords(data);
 } catch (error) {
 console.error('Error fetching special education records:', error);
 } finally {
 setIsLoading(false);
 }
 };
 fetchRecords();
 }, [studentId]);
 
 const form = useForm<SpecialEducationFormValues>({
 resolver: zodResolver(specialEducationSchema),
 mode: 'onSubmit',
 defaultValues: {
 hasIEP: existingRecord?.hasIEP || false,
 iepStartDate: existingRecord?.iepStartDate ||"",
 iepEndDate: existingRecord?.iepEndDate ||"",
 iepGoals: existingRecord?.iepGoals ||"",
 diagnosis: existingRecord?.diagnosis ||"",
 ramReportDate: existingRecord?.ramReportDate ||"",
 ramReportSummary: existingRecord?.ramReportSummary ||"",
 supportServices: existingRecord?.supportServices ||"",
 accommodations: existingRecord?.accommodations ||"",
 status: existingRecord?.status ||"AKTİF",
 nextReviewDate: existingRecord?.nextReviewDate ||"",
 notes: existingRecord?.notes ||"",
 },
 });

 useEffect(() => {
 const subscription = form.watch(() => {
 setIsDirty(true);
 });
 return () => subscription.unsubscribe();
 }, [form, setIsDirty]);

 const onSubmitRef = useRef<(data: SpecialEducationFormValues) => Promise<void>>();

 // Form verilerini records değiştiğinde güncelle
 useEffect(() => {
 const record = records && records.length > 0 ? records[0] : null;
 form.reset({
 hasIEP: record?.hasIEP || false,
 iepStartDate: record?.iepStartDate ||"",
 iepEndDate: record?.iepEndDate ||"",
 iepGoals: record?.iepGoals ||"",
 diagnosis: record?.diagnosis ||"",
 ramReportDate: record?.ramReportDate ||"",
 ramReportSummary: record?.ramReportSummary ||"",
 supportServices: record?.supportServices ||"",
 accommodations: record?.accommodations ||"",
 status: record?.status ||"AKTİF",
 nextReviewDate: record?.nextReviewDate ||"",
 notes: record?.notes ||"",
 });
 }, [records, form]);

 const onSubmit = async (data: SpecialEducationFormValues) => {
 try {
 if (existingRecord) {
 // Güncelleme
 await updateSpecialEducation(existingRecord.id, data);
 } else {
 // Yeni kayıt
 const specialEd: SpecialEducation = {
 id: crypto.randomUUID(),
 studentId,
 ...data,
 };
 await addSpecialEducation(specialEd);
 }
 
 // Verileri yeniden çek
 const updatedRecords = await getSpecialEducationByStudent(studentId);
 setRecords(updatedRecords);
 onUpdate();
 } catch (error) {
 console.error("Error saving special education:", error);
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

 if (isLoading) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Özel Eğitim - BEP Takibi</CardTitle>
 <CardDescription>Yükleniyor...</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="flex items-center justify-center h-32">
 <div className=" rounded-full h-8 w-8 border-b-2 border-primary"></div>
 </div>
 </CardContent>
 </Card>
 );
 }

 return (
 <Card className="card-lift">
 <CardHeader>
 <CardTitle>Özel Eğitim - BEP Takibi</CardTitle>
 <CardDescription>Bireysel Eğitim Planı ve RAM raporları</CardDescription>
 </CardHeader>
 <CardContent>
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
 <FormField
 control={form.control}
 name="hasIEP"
 render={({ field }) => (
 <FormItem className="flex flex-row items-center space-x-2 space-y-0">
 <FormControl>
 <Checkbox
 checked={field.value}
 onCheckedChange={field.onChange}
 />
 </FormControl>
 <FormLabel className="font-normal">BEP var</FormLabel>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <FormField
 control={form.control}
 name="iepStartDate"
 render={({ field }) => (
 <FormItem>
 <FormControl>
 <Input type="date" placeholder="BEP Başlangıç" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="iepEndDate"
 render={({ field }) => (
 <FormItem>
 <FormControl>
 <Input type="date" placeholder="BEP Bitiş" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 
 <FormField
 control={form.control}
 name="iepGoals"
 render={({ field }) => (
 <FormItem>
 <FormControl>
 <EnhancedTextarea placeholder="BEP Hedefleri" rows={3} {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="diagnosis"
 render={({ field }) => (
 <FormItem>
 <FormControl>
 <EnhancedTextarea placeholder="Tanı" rows={2} {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <FormField
 control={form.control}
 name="ramReportDate"
 render={({ field }) => (
 <FormItem>
 <FormControl>
 <Input type="date" placeholder="RAM Rapor Tarihi" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="status"
 render={({ field }) => (
 <FormItem>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Durum" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 <SelectItem value="AKTİF">Aktif</SelectItem>
 <SelectItem value="TAMAMLANDI">Tamamlandı</SelectItem>
 <SelectItem value="İPTAL">İptal</SelectItem>
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 
 <FormField
 control={form.control}
 name="ramReportSummary"
 render={({ field }) => (
 <FormItem>
 <FormControl>
 <EnhancedTextarea placeholder="RAM Rapor Özeti" rows={2} {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="supportServices"
 render={({ field }) => (
 <FormItem>
 <FormControl>
 <EnhancedTextarea placeholder="Destek Hizmetleri" rows={2} {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="accommodations"
 render={({ field }) => (
 <FormItem>
 <FormControl>
 <EnhancedTextarea placeholder="Uyarlamalar" rows={2} {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="nextReviewDate"
 render={({ field }) => (
 <FormItem>
 <FormControl>
 <Input type="date" placeholder="Sonraki Değerlendirme" {...field} />
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
 <FormControl>
 <EnhancedTextarea placeholder="Notlar" rows={2} {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 </form>
 </Form>
 
 {existingRecord && (
 <div className="space-y-2 mt-4">
 <h4 className="font-medium">BEP Kaydı</h4>
 <div className="border rounded-lg p-3 space-y-2">
 <div className="flex items-center justify-between">
 <Badge variant={existingRecord.hasIEP ?"default" :"secondary"}>
 {existingRecord.hasIEP ?"BEP Var" :"BEP Yok"}
 </Badge>
 <Badge variant="outline">{existingRecord.status}</Badge>
 </div>
 {existingRecord.diagnosis && <div className="text-sm"><strong>Tanı:</strong> {existingRecord.diagnosis}</div>}
 {existingRecord.iepGoals && <div className="text-sm"><strong>Hedefler:</strong> {existingRecord.iepGoals}</div>}
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 );
}
