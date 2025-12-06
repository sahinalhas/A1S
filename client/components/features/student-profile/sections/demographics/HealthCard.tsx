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
import { Heart, Droplets, Phone, Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

const bloodTypes = ["A Rh+", "A Rh-", "B Rh+", "B Rh-", "AB Rh+", "AB Rh-", "0 Rh+", "0 Rh-", "Bilinmiyor"];

const schema = z.object({
  bloodType: z.string().optional(),
  chronicDiseases: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
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

function arrayToString(arr: string[] | undefined): string {
  if (!arr || !Array.isArray(arr)) return "";
  return arr.join(", ");
}

function stringToArray(str: string | undefined): string[] {
  if (!str) return [];
  return str.split(",").map(s => s.trim()).filter(s => s.length > 0);
}

export function HealthCard({ student, onUpdate }: HealthCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const getDefaultValues = useCallback((): FormValues => ({
    bloodType: student.bloodType || "",
    chronicDiseases: arrayToString(student.chronicDiseases),
    allergies: arrayToString(student.allergies),
    medications: arrayToString(student.medications),
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
    mode: "onSubmit",
    defaultValues: getDefaultValues(),
  });

  const { dirtyFields } = useFormState({ control: form.control });
  const isDirty = Object.keys(dirtyFields).length > 0;

  const onSubmit = useCallback(async (data: FormValues) => {
    setIsSaving(true);
    try {
      const updatedStudent: Student = {
        ...student,
        bloodType: data.bloodType || undefined,
        chronicDiseases: stringToArray(data.chronicDiseases),
        allergies: stringToArray(data.allergies),
        medications: stringToArray(data.medications),
        medicalHistory: data.medicalHistory || undefined,
        specialNeeds: data.specialNeeds || undefined,
        physicalLimitations: data.physicalLimitations || undefined,
        emergencyContact1Name: data.emergencyContact1Name || undefined,
        emergencyContact1Phone: data.emergencyContact1Phone || undefined,
        emergencyContact1Relation: data.emergencyContact1Relation || undefined,
        emergencyContact2Name: data.emergencyContact2Name || undefined,
        emergencyContact2Phone: data.emergencyContact2Phone || undefined,
        emergencyContact2Relation: data.emergencyContact2Relation || undefined,
        healthAdditionalNotes: data.healthAdditionalNotes || undefined,
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
  }, [student, onUpdate, form]);

  useEffect(() => {
    form.reset(getDefaultValues());
  }, [student, form, getDefaultValues]);

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

            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="chronicDiseases" render={({ field }) => (
                <FormItem>
                  <FormLabel>Kronik Hastalıklar</FormLabel>
                  <FormControl><Input {...field} placeholder="Astım, Diyabet... (virgülle ayırın)" className="h-10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="allergies" render={({ field }) => (
                <FormItem>
                  <FormLabel>Alerjiler</FormLabel>
                  <FormControl><Input {...field} placeholder="Polen, Süt... (virgülle ayırın)" className="h-10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="medications" render={({ field }) => (
                <FormItem>
                  <FormLabel>Kullanılan İlaçlar</FormLabel>
                  <FormControl><Input {...field} placeholder="İlaç adları... (virgülle ayırın)" className="h-10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="medicalHistory" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tıbbi Geçmiş</FormLabel>
                  <FormControl><Textarea {...field} placeholder="Geçmiş ameliyatlar, tedaviler..." className="min-h-[80px]" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="specialNeeds" render={({ field }) => (
                <FormItem>
                  <FormLabel>Özel İhtiyaçlar</FormLabel>
                  <FormControl><Textarea {...field} placeholder="Özel bakım gereksinimleri..." className="min-h-[80px]" /></FormControl>
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
