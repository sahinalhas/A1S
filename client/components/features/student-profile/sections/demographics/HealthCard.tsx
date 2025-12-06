import { useCallback, useEffect, useMemo, useState } from "react";
import type { Student } from "@/lib/types/student.types";
import { upsertStudent } from "@/lib/api/endpoints/students.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Heart, Droplets, AlertTriangle, Pill, Phone, FileText, Save, Check, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/atoms/Badge";
import { motion, AnimatePresence } from "framer-motion";

const bloodTypes = ["A Rh+", "A Rh-", "B Rh+", "B Rh-", "AB Rh+", "AB Rh-", "0 Rh+", "0 Rh-", "Bilinmiyor"];
const chronicDiseaseOptions = ["Astım", "Diyabet Tip 1", "Diyabet Tip 2", "Epilepsi", "Migren", "Otizm Spektrum Bozukluğu", "DEHB", "Disleksi", "Kalp Hastalığı", "Alerjik Rinit", "Tiroid Hastalıkları", "Anemi", "Görme Bozukluğu", "İşitme Bozukluğu"];
const allergyOptions = ["Polen", "Toz Akarı", "Hayvan Tüyü", "Süt Ürünleri", "Yumurta", "Fıstık", "Gluten", "Balık", "Penisilin", "Arı Sokması", "Lateks"];
const medicationOptions = ["Ağrı Kesici", "Antibiyotik", "Astım İlacı", "İnsülin", "Epilepsi İlacı", "DEHB İlacı", "Antihistaminik", "Vitamin/Mineral", "Demir İlacı", "Tiroid İlacı"];

const schema = z.object({
  bloodType: z.string().optional(),
  chronicDiseases: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  medicalHistory: z.string().optional(),
  specialNeeds: z.string().optional(),
  physicalLimitations: z.string().optional(),
  emergencyContact1Name: z.string().optional(),
  emergencyContact1Phone: z.string().optional(),
  emergencyContact1Relation: z.string().optional(),
  emergencyContact2Name: z.string().optional(),
  emergencyContact2Phone: z.string().optional(),
  emergencyContact2Relation: z.string().optional(),
  healthAdditionalNotes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface HealthCardProps {
  student: Student;
  onUpdate: () => void;
}

export function HealthCard({ student, onUpdate }: HealthCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>(student.chronicDiseases || []);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(student.allergies || []);
  const [selectedMedications, setSelectedMedications] = useState<string[]>(student.medications || []);

  const defaultValues = useMemo(() => ({
    bloodType: student.bloodType || "",
    chronicDiseases: student.chronicDiseases || [],
    allergies: student.allergies || [],
    medications: student.medications || [],
    medicalHistory: student.medicalHistory || "",
    specialNeeds: student.specialNeeds || "",
    physicalLimitations: student.physicalLimitations || "",
    emergencyContact1Name: student.emergencyContact1Name || "",
    emergencyContact1Phone: student.emergencyContact1Phone || "",
    emergencyContact1Relation: student.emergencyContact1Relation || "",
    emergencyContact2Name: student.emergencyContact2Name || "",
    emergencyContact2Phone: student.emergencyContact2Phone || "",
    emergencyContact2Relation: student.emergencyContact2Relation || "",
    healthAdditionalNotes: student.healthAdditionalNotes || "",
  }), [student]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues,
  });

  const isDirty = form.formState.isDirty || JSON.stringify(selectedDiseases) !== JSON.stringify(student.chronicDiseases || []) || JSON.stringify(selectedAllergies) !== JSON.stringify(student.allergies || []) || JSON.stringify(selectedMedications) !== JSON.stringify(student.medications || []);

  useEffect(() => {
    form.reset(defaultValues);
    setSelectedDiseases(student.chronicDiseases || []);
    setSelectedAllergies(student.allergies || []);
    setSelectedMedications(student.medications || []);
  }, [student]);

  const getSummaryItems = useMemo(() => {
    const items: { label: string; items?: string[]; icon?: React.ReactNode }[] = [];
    if (defaultValues.bloodType) items.push({ label: "Kan Grubu", items: [defaultValues.bloodType], icon: <Droplets className="h-3.5 w-3.5" /> });
    if ((student.chronicDiseases || []).length > 0) items.push({ label: "Kronik Hastalıklar", items: student.chronicDiseases, icon: <AlertTriangle className="h-3.5 w-3.5" /> });
    if ((student.allergies || []).length > 0) items.push({ label: "Alerjiler", items: student.allergies });
    if ((student.medications || []).length > 0) items.push({ label: "İlaçlar", items: student.medications, icon: <Pill className="h-3.5 w-3.5" /> });
    if (defaultValues.emergencyContact1Name) items.push({ label: "Acil Kişi", items: [defaultValues.emergencyContact1Name], icon: <Phone className="h-3.5 w-3.5" /> });
    return items;
  }, [defaultValues, student]);

  const toggleSelection = (item: string, list: string[], setList: (items: string[]) => void) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const onSubmit = useCallback(async (data: FormValues) => {
    setIsSaving(true);
    try {
      const updatedStudent: Student = {
        ...student,
        ...data,
        chronicDiseases: selectedDiseases,
        allergies: selectedAllergies,
        medications: selectedMedications,
      };
      await upsertStudent(updatedStudent);
      form.reset(data);
      setShowSuccess(true);
      toast.success("Sağlık bilgileri kaydedildi");
      setTimeout(() => {
        setShowSuccess(false);
        setIsExpanded(false);
      }, 1500);
      onUpdate();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Kaydetme hatası");
    } finally {
      setIsSaving(false);
    }
  }, [student, onUpdate, form, selectedDiseases, selectedAllergies, selectedMedications]);

  const handleCancel = useCallback(() => {
    form.reset(defaultValues);
    setSelectedDiseases(student.chronicDiseases || []);
    setSelectedAllergies(student.allergies || []);
    setSelectedMedications(student.medications || []);
    setIsExpanded(false);
  }, [form, defaultValues, student]);

  return (
    <Card className="border border-red-100/30 dark:border-red-800/20 bg-gradient-to-br from-white/95 via-red-50/15 to-red-100/5 dark:from-gray-900/95 dark:via-red-950/10 dark:to-red-900/5 shadow-lg dark:shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:border-red-200/50 dark:hover:shadow-red-900/40 dark:hover:border-red-700/30">
      <CardHeader 
        className="pb-4 cursor-pointer select-none hover:bg-red-50/40 dark:hover:bg-red-900/15 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0",
              isExpanded 
                ? "bg-gradient-to-br from-red-200 to-red-100 dark:from-red-800/50 dark:to-red-700/30 ring-2 ring-red-300/50 dark:ring-red-600/40" 
                : "bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 ring-1 ring-gray-200/50 dark:ring-gray-700/50"
            )}>
              <Heart className={cn(
                "h-6 w-6 transition-all duration-300",
                isExpanded
                  ? "text-red-600 dark:text-red-300 scale-110"
                  : "text-gray-600 dark:text-gray-400"
              )} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-50">Sağlık Bilgileri</CardTitle>
              {!isExpanded && getSummaryItems.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 font-medium">{getSummaryItems.length} alan doldurulmuş</p>
              )}
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex-shrink-0"
          >
            <ChevronDown className={cn(
              "h-5 w-5 transition-all duration-300",
              isExpanded
                ? "text-red-600 dark:text-red-300 scale-110"
                : "text-gray-400 dark:text-gray-500"
            )} />
          </motion.div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div key="summary" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
              {getSummaryItems.length > 0 ? (
                <div className="space-y-3 py-2">
                  {getSummaryItems.map((item, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.08 }} className="p-3.5 rounded-lg bg-gradient-to-br from-red-50/70 to-pink-50/40 dark:from-red-900/20 dark:to-pink-900/10 border border-red-100/60 dark:border-red-800/30 hover:border-red-200/80 dark:hover:border-red-700/60 hover:shadow-md dark:hover:shadow-red-900/20 transition-all duration-200 group">
                      <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2 uppercase tracking-wide">{item.icon && <span className="text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">{item.icon}</span>}{item.label}</p>
                      <div className="flex flex-wrap gap-2">{item.items?.map((val, i) => (<span key={i} className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold bg-red-100 dark:bg-red-700/50 text-red-900 dark:text-red-100 rounded-md">{val}</span>))}</div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">Henüz bilgi girilmemiş</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="py-4">
              <Form {...form}>
                <div className="space-y-4">
                  <FormField control={form.control} name="bloodType" render={({ field }) => (<FormItem><FormLabel className="text-sm font-medium">Kan Grubu</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl><SelectContent>{bloodTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                  <div><p className="text-sm font-medium mb-2 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />Kronik Hastalıklar</p><div className="flex flex-wrap gap-2">{chronicDiseaseOptions.map(disease => (<Badge key={disease} variant={selectedDiseases.includes(disease) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleSelection(disease, selectedDiseases, setSelectedDiseases)}>{disease}</Badge>))}</div></div>
                  <div><p className="text-sm font-medium mb-2">Alerjiler</p><div className="flex flex-wrap gap-2">{allergyOptions.map(allergy => (<Badge key={allergy} variant={selectedAllergies.includes(allergy) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleSelection(allergy, selectedAllergies, setSelectedAllergies)}>{allergy}</Badge>))}</div></div>
                  <div><p className="text-sm font-medium mb-2 flex items-center gap-1.5"><Pill className="h-3.5 w-3.5" />Kullanılan İlaçlar</p><div className="flex flex-wrap gap-2">{medicationOptions.map(med => (<Badge key={med} variant={selectedMedications.includes(med) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleSelection(med, selectedMedications, setSelectedMedications)}>{med}</Badge>))}</div></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"><FormField control={form.control} name="medicalHistory" render={({ field }) => (<FormItem><FormLabel className="text-sm font-medium">Tıbbi Geçmiş</FormLabel><FormControl><Textarea {...field} placeholder="Ameliyatlar..." className="min-h-[60px] text-sm" /></FormControl></FormItem>)} /><FormField control={form.control} name="specialNeeds" render={({ field }) => (<FormItem><FormLabel className="text-sm font-medium">Özel İhtiyaçlar</FormLabel><FormControl><Textarea {...field} placeholder="Özel bakım..." className="min-h-[60px] text-sm" /></FormControl></FormItem>)} /><FormField control={form.control} name="physicalLimitations" render={({ field }) => (<FormItem><FormLabel className="text-sm font-medium">Fiziksel Kısıtlamalar</FormLabel><FormControl><Textarea {...field} placeholder="Hareket kısıtlamaları..." className="min-h-[60px] text-sm" /></FormControl></FormItem>)} /></div>
                  <div className="pt-2"><p className="text-sm font-medium mb-2 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Acil Durum Kişileri</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"><p className="text-xs font-medium text-gray-500">1. Kişi</p><FormField control={form.control} name="emergencyContact1Name" render={({ field }) => (<FormItem><FormLabel className="text-xs">Ad Soyad</FormLabel><FormControl><Input {...field} className="h-9 text-sm" /></FormControl></FormItem>)} /><FormField control={form.control} name="emergencyContact1Phone" render={({ field }) => (<FormItem><FormLabel className="text-xs">Telefon</FormLabel><FormControl><Input {...field} className="h-9 text-sm" /></FormControl></FormItem>)} /></div><div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"><p className="text-xs font-medium text-gray-500">2. Kişi</p><FormField control={form.control} name="emergencyContact2Name" render={({ field }) => (<FormItem><FormLabel className="text-xs">Ad Soyad</FormLabel><FormControl><Input {...field} className="h-9 text-sm" /></FormControl></FormItem>)} /><FormField control={form.control} name="emergencyContact2Phone" render={({ field }) => (<FormItem><FormLabel className="text-xs">Telefon</FormLabel><FormControl><Input {...field} className="h-9 text-sm" /></FormControl></FormItem>)} /></div></div></div>
                  <FormField control={form.control} name="healthAdditionalNotes" render={({ field }) => (<FormItem><FormLabel className="text-sm font-medium">Ek Notlar</FormLabel><FormControl><Textarea {...field} placeholder="Diğer önemli bilgiler..." className="min-h-[60px] text-sm" /></FormControl></FormItem>)} />
                </div>
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"><Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>İptal</Button><Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isSaving || !isDirty} className={cn("transition-all duration-300", showSuccess && "bg-green-600 hover:bg-green-700")}>{isSaving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Kaydediliyor</> : showSuccess ? <><Check className="h-4 w-4 mr-1" />Kaydedildi</> : <><Save className="h-4 w-4 mr-1" />Kaydet</>}</Button></div>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
