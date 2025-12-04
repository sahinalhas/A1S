import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addRiskFactors } from "@/lib/storage";
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
import { AlertTriangle } from "lucide-react";

const riskLevels = ["DÜŞÜK","ORTA","YÜKSEK","ÇOK_YÜKSEK"] as const;

interface RiskFactors {
 id: string;
 studentId: string;
 assessmentDate: string;
 academicRiskLevel: typeof riskLevels[number];
 behavioralRiskLevel: typeof riskLevels[number];
 attendanceRiskLevel: typeof riskLevels[number];
 socialEmotionalRiskLevel: typeof riskLevels[number];
 academicFactors?: string;
 behavioralFactors?: string;
 protectiveFactors?: string;
 interventionsNeeded?: string;
 parentNotified?: boolean;
 assignedCounselor?: string;
 nextAssessmentDate?: string;
 status: string;
}

const riskAssessmentSchema = z.object({
 assessmentDate: z.string().min(1,"Değerlendirme tarihi gereklidir"),
 academicRiskLevel: z.enum(riskLevels),
 behavioralRiskLevel: z.enum(riskLevels),
 attendanceRiskLevel: z.enum(riskLevels),
 socialEmotionalRiskLevel: z.enum(riskLevels),
 academicFactors: z.string().optional(),
 behavioralFactors: z.string().optional(),
 protectiveFactors: z.string().optional(),
 interventionsNeeded: z.string().optional(),
 parentNotified: z.boolean(),
 assignedCounselor: z.string().optional(),
 nextAssessmentDate: z.string().optional(),
});

type RiskAssessmentFormValues = z.infer<typeof riskAssessmentSchema>;

interface RiskDegerlendirmeSectionProps {
 studentId: string;
 riskFactors: RiskFactors | null;
 onUpdate: () => void;
}

export default function RiskDegerlendirmeSection({ studentId, riskFactors, onUpdate }: RiskDegerlendirmeSectionProps) {
 const { registerFormSubmit, unregisterFormSubmit } = useFormDirty();
 const componentId = useMemo(() => crypto.randomUUID(), []);
 const form = useForm<RiskAssessmentFormValues>({
 resolver: zodResolver(riskAssessmentSchema),
 defaultValues: {
 assessmentDate: new Date().toISOString().slice(0, 10),
 academicRiskLevel:"DÜŞÜK",
 behavioralRiskLevel:"DÜŞÜK",
 attendanceRiskLevel:"DÜŞÜK",
 socialEmotionalRiskLevel:"DÜŞÜK",
 academicFactors:"",
 behavioralFactors:"",
 protectiveFactors:"",
 interventionsNeeded:"",
 parentNotified: false,
 assignedCounselor:"",
 nextAssessmentDate:"",
 },
 });

 const onSubmitRef = useRef<(data: RiskAssessmentFormValues) => Promise<void>>();

 const onSubmit = async (data: RiskAssessmentFormValues) => {
 const riskData: RiskFactors = {
 id: crypto.randomUUID(),
 studentId,
 assessmentDate: data.assessmentDate,
 academicRiskLevel: data.academicRiskLevel,
 behavioralRiskLevel: data.behavioralRiskLevel,
 attendanceRiskLevel: data.attendanceRiskLevel,
 socialEmotionalRiskLevel: data.socialEmotionalRiskLevel,
 academicFactors: data.academicFactors,
 behavioralFactors: data.behavioralFactors,
 protectiveFactors: data.protectiveFactors,
 interventionsNeeded: data.interventionsNeeded,
 parentNotified: data.parentNotified,
 assignedCounselor: data.assignedCounselor,
 nextAssessmentDate: data.nextAssessmentDate,
 status: 'AKTİF'
 };
 
 await addRiskFactors(riskData);
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

 const getRiskBadgeVariant = (level: string) => {
 return level === 'YÜKSEK' || level === 'ÇOK_YÜKSEK' ? 'destructive' : 'secondary';
 };

 return (
 <Card>
 <CardHeader>
 <CardTitle>Risk Değerlendirme ve Erken Uyarı</CardTitle>
 <CardDescription>Akademik, davranışsal ve sosyal-duygusal risk faktörleri</CardDescription>
 </CardHeader>
 <CardContent>
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
 name="academicRiskLevel"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Akademik Risk</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Risk seviyesi seçin" />
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
 name="behavioralRiskLevel"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Davranışsal Risk</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Risk seviyesi seçin" />
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
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <FormField
 control={form.control}
 name="attendanceRiskLevel"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Devamsızlık Riski</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Risk seviyesi seçin" />
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
 name="socialEmotionalRiskLevel"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Sosyal-Duygusal Risk</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Risk seviyesi seçin" />
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
 </div>
 
 <FormField
 control={form.control}
 name="academicFactors"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Akademik Risk Faktörleri</FormLabel>
 <FormControl>
 <EnhancedTextarea placeholder="Akademik risk faktörlerini açıklayın" rows={2} {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="behavioralFactors"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Davranışsal Faktörler</FormLabel>
 <FormControl>
 <EnhancedTextarea placeholder="Davranışsal faktörleri açıklayın" rows={2} {...field} aiContext="notes" />
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
 <EnhancedTextarea placeholder="Koruyucu faktörleri belirtin" rows={2} {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="interventionsNeeded"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Gerekli Müdahaleler</FormLabel>
 <FormControl>
 <EnhancedTextarea placeholder="Önerilen müdahaleleri listeleyin" rows={2} {...field} aiContext="notes" />
 </FormControl>
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
 name="assignedCounselor"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Sorumlu Danışman</FormLabel>
 <FormControl>
 <Input placeholder="Danışman adını girin" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="nextAssessmentDate"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Sonraki Değerlendirme</FormLabel>
 <FormControl>
 <Input type="date" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 </form>
 </Form>
 
 {riskFactors && (
 <div className="space-y-2 mt-6">
 <h4 className="font-medium">Son Risk Değerlendirmesi</h4>
 <div className="border rounded-lg p-3 space-y-2">
 <div className="text-sm font-medium">
 {new Date(riskFactors.assessmentDate).toLocaleDateString()}
 </div>
 <div className="grid grid-cols-2 gap-2 text-xs">
 <div className="flex items-center gap-1">
 <span>Akademik:</span>
 <Badge variant={getRiskBadgeVariant(riskFactors.academicRiskLevel)}>
 {riskFactors.academicRiskLevel}
 </Badge>
 </div>
 <div className="flex items-center gap-1">
 <span>Davranış:</span>
 <Badge variant={getRiskBadgeVariant(riskFactors.behavioralRiskLevel)}>
 {riskFactors.behavioralRiskLevel}
 </Badge>
 </div>
 </div>
 {riskFactors.interventionsNeeded && (
 <div className="text-sm"><strong>Müdahaleler:</strong> {riskFactors.interventionsNeeded}</div>
 )}
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 );
}
