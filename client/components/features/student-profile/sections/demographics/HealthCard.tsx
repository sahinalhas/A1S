import { useEffect, useState, useCallback } from "react";
import type { Student } from "@/lib/types/student.types";
import { upsertStudent } from "@/lib/api/endpoints/students.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Heart, Droplets, AlertTriangle, Pill, Phone, FileText, Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/atoms/Badge";

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
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>(student.chronicDiseases || []);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(student.allergies || []);
  const [selectedMedications, setSelectedMedications] = useState<string[]>(student.medications || []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
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
    },
  });

  const { dirtyFields } = useFormState({ control: form.control });
  const isDirty = Object.keys(dirtyFields).length > 0 || 
    JSON.stringify(selectedDiseases) !== JSON.stringify(student.chronicDiseases || []) ||
    JSON.stringify(selectedAllergies) !== JSON.stringify(student.allergies || []) ||
    JSON.stringify(selectedMedications) !== JSON.stringify(student.medications || []);

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
      setTimeout(() => setShowSuccess(false), 2000);
      onUpdate();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Kaydetme hatası");
    } finally {
      setIsSaving(false);
    }
  }, [student, onUpdate, form, selectedDiseases, selectedAllergies, selectedMedications]);

  useEffect(() => {
    setSelectedDiseases(student.chronicDiseases || []);
    setSelectedAllergies(student.allergies || []);
    setSelectedMedications(student.medications || []);
    form.reset({
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
    });
  }, [student, form]);

  return (
    <Card className="border-red-200/50 dark:border-red-800/50 bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-950/20 dark:to-rose-950/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-red-600" />
              Sağlık Bilgileri
            </CardTitle>
            <CardDescription>Öğrencinin sağlık durumu ve acil durum bilgileri</CardDescription>
          </div>
          {isDirty && (
            <Button
              size="sm"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSaving}
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
          )}
        </div>
      </CardHeader>
      <CardContent>
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
        </Form>
      </CardContent>
    </Card>
  );
}
