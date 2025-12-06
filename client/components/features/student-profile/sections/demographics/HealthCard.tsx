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
import { Heart, Droplets, AlertTriangle, Pill, Phone, FileText, Save, Check, Loader2, Pencil, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/atoms/Badge";
import { motion, AnimatePresence } from "framer-motion";

const bloodTypes = ["A Rh+", "A Rh-", "B Rh+", "B Rh-", "AB Rh+", "AB Rh-", "0 Rh+", "0 Rh-", "Bilinmiyor"];

const chronicDiseaseOptions = [
  "Astım", "Diyabet Tip 1", "Diyabet Tip 2", "Epilepsi", "Migren", 
  "Otizm Spektrum Bozukluğu", "DEHB", "Disleksi", "Kalp Hastalığı", 
  "Alerjik Rinit", "Tiroid Hastalıkları", "Anemi", "Görme Bozukluğu", "İşitme Bozukluğu"
];

const allergyOptions = [
  "Polen", "Toz Akarı", "Hayvan Tüyü", "Süt Ürünleri", "Yumurta", 
  "Fıstık", "Gluten", "Balık", "Penisilin", "Arı Sokması", "Lateks"
];

const medicationOptions = [
  "Ağrı Kesici", "Antibiyotik", "Astım İlacı", "İnsülin", "Epilepsi İlacı",
  "DEHB İlacı", "Antihistaminik", "Vitamin/Mineral", "Demir İlacı", "Tiroid İlacı"
];

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

  const isDirty = form.formState.isDirty || 
    JSON.stringify(selectedDiseases) !== JSON.stringify(student.chronicDiseases || []) ||
    JSON.stringify(selectedAllergies) !== JSON.stringify(student.allergies || []) ||
    JSON.stringify(selectedMedications) !== JSON.stringify(student.medications || []);

  useEffect(() => {
    form.reset(defaultValues);
    setSelectedDiseases(student.chronicDiseases || []);
    setSelectedAllergies(student.allergies || []);
    setSelectedMedications(student.medications || []);
  }, [student]);

  const getSummaryItems = useMemo(() => {
    const items: { label: string; value: string; icon?: React.ReactNode }[] = [];
    if (defaultValues.bloodType) items.push({ label: "Kan Grubu", value: defaultValues.bloodType, icon: <Droplets className="h-3.5 w-3.5" /> });
    if ((student.chronicDiseases || []).length > 0) items.push({ label: "Hastalık", value: `${(student.chronicDiseases || []).length} kronik`, icon: <AlertTriangle className="h-3.5 w-3.5" /> });
    if ((student.allergies || []).length > 0) items.push({ label: "Alerji", value: `${(student.allergies || []).length} alerji` });
    if ((student.medications || []).length > 0) items.push({ label: "İlaç", value: `${(student.medications || []).length} ilaç`, icon: <Pill className="h-3.5 w-3.5" /> });
    if (defaultValues.emergencyContact1Name) items.push({ label: "Acil", value: defaultValues.emergencyContact1Name, icon: <Phone className="h-3.5 w-3.5" /> });
    return items;
  }, [defaultValues, student]);

  const toggleSelection = (item: string, list: string[], setList: (items: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
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
    <Card className="border-red-200/50 dark:border-red-800/50 bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-950/20 dark:to-rose-950/20 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-red-600" />
            Sağlık Bilgileri
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "h-8 w-8 rounded-full transition-all duration-200",
              isExpanded 
                ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700" 
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            {isExpanded ? (
              <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <Pencil className="h-4 w-4 text-red-600" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {getSummaryItems.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {getSummaryItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    >
                      {item.icon}
                      <span className="truncate max-w-[150px]">{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Henüz bilgi girilmemiş. Düzenlemek için kalem ikonuna tıklayın.</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Form {...form}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="bloodType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><Droplets className="h-3.5 w-3.5" />Kan Grubu</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {bloodTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" />Kronik Hastalıklar
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {chronicDiseaseOptions.map(disease => (
                        <Badge
                          key={disease}
                          variant={selectedDiseases.includes(disease) ? "default" : "outline"}
                          className="cursor-pointer transition-all hover:scale-105"
                          onClick={() => toggleSelection(disease, selectedDiseases, setSelectedDiseases)}
                        >
                          {disease}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Alerjiler</h3>
                    <div className="flex flex-wrap gap-2">
                      {allergyOptions.map(allergy => (
                        <Badge
                          key={allergy}
                          variant={selectedAllergies.includes(allergy) ? "default" : "outline"}
                          className="cursor-pointer transition-all hover:scale-105"
                          onClick={() => toggleSelection(allergy, selectedAllergies, setSelectedAllergies)}
                        >
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-1.5">
                      <Pill className="h-4 w-4" />Kullanılan İlaçlar
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {medicationOptions.map(med => (
                        <Badge
                          key={med}
                          variant={selectedMedications.includes(med) ? "default" : "outline"}
                          className="cursor-pointer transition-all hover:scale-105"
                          onClick={() => toggleSelection(med, selectedMedications, setSelectedMedications)}
                        >
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="medicalHistory" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />Tıbbi Geçmiş</FormLabel>
                        <FormControl><Textarea {...field} placeholder="Geçmiş ameliyatlar..." className="min-h-[80px]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="specialNeeds" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Özel İhtiyaçlar</FormLabel>
                        <FormControl><Textarea {...field} placeholder="Özel bakım..." className="min-h-[80px]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="physicalLimitations" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fiziksel Kısıtlamalar</FormLabel>
                        <FormControl><Textarea {...field} placeholder="Hareket kısıtlamaları..." className="min-h-[80px]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />Acil Durum Kişileri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground">1. Acil Durum Kişisi</p>
                        <div className="grid grid-cols-1 gap-3">
                          <FormField control={form.control} name="emergencyContact1Name" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Ad Soyad</FormLabel>
                              <FormControl><Input {...field} className="h-9" /></FormControl>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="emergencyContact1Phone" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Telefon</FormLabel>
                              <FormControl><Input {...field} type="tel" className="h-9" /></FormControl>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="emergencyContact1Relation" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Yakınlık</FormLabel>
                              <FormControl><Input {...field} className="h-9" placeholder="Örn: Anne" /></FormControl>
                            </FormItem>
                          )} />
                        </div>
                      </div>
                      <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground">2. Acil Durum Kişisi</p>
                        <div className="grid grid-cols-1 gap-3">
                          <FormField control={form.control} name="emergencyContact2Name" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Ad Soyad</FormLabel>
                              <FormControl><Input {...field} className="h-9" /></FormControl>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="emergencyContact2Phone" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Telefon</FormLabel>
                              <FormControl><Input {...field} type="tel" className="h-9" /></FormControl>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="emergencyContact2Relation" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Yakınlık</FormLabel>
                              <FormControl><Input {...field} className="h-9" placeholder="Örn: Baba" /></FormControl>
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <FormField control={form.control} name="healthAdditionalNotes" render={({ field }) => (
                    <FormItem className="border-t pt-4">
                      <FormLabel>Ek Bilgiler</FormLabel>
                      <FormControl><Textarea {...field} placeholder="Sağlık durumu hakkında ek bilgiler..." className="min-h-[80px]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    İptal
                  </Button>
                  <Button
                    size="sm"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isSaving || !isDirty}
                    className={cn(
                      "transition-all duration-300",
                      showSuccess && "bg-green-600 hover:bg-green-700"
                    )}
                  >
                    {isSaving ? (
                      <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Kaydediliyor</>
                    ) : showSuccess ? (
                      <><Check className="h-4 w-4 mr-1" />Kaydedildi</>
                    ) : (
                      <><Save className="h-4 w-4 mr-1" />Kaydet</>
                    )}
                  </Button>
                </div>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
