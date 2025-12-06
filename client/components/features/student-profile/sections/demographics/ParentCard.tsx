import { useEffect, useState, useCallback } from "react";
import type { Student } from "@/lib/types/student.types";
import { upsertStudent } from "@/lib/api/endpoints/students.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Users, Phone, Mail, GraduationCap, Briefcase, Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

const educationOptions = ["İlkokul", "Ortaokul", "Lise", "Ön Lisans", "Lisans", "Yüksek Lisans", "Doktora"];

const schema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Geçerli e-posta giriniz").optional().or(z.literal("")),
  education: z.string().optional(),
  occupation: z.string().optional(),
  vitalStatus: z.enum(["Sağ", "Vefat Etmiş"]).optional().or(z.literal("")),
  livingStatus: z.enum(["Birlikte", "Ayrı"]).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface ParentCardProps {
  student: Student;
  onUpdate: () => void;
  parentType: "mother" | "father";
}

export function ParentCard({ student, onUpdate, parentType }: ParentCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isMother = parentType === "mother";
  const title = isMother ? "Anne Bilgileri" : "Baba Bilgileri";
  const colorClass = isMother ? "pink" : "indigo";

  const getField = (field: string) => {
    const prefix = isMother ? "mother" : "father";
    return `${prefix}${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof Student;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      name: (student[getField("name")] as string) || "",
      phone: (student[getField("phone")] as string) || "",
      email: (student[getField("email")] as string) || "",
      education: (student[getField("education")] as string) || "",
      occupation: (student[getField("occupation")] as string) || "",
      vitalStatus: (student[getField("vitalStatus")] as "Sağ" | "Vefat Etmiş") || "",
      livingStatus: (student[getField("livingStatus")] as "Birlikte" | "Ayrı") || "",
    },
  });

  const { dirtyFields } = useFormState({ control: form.control });
  const isDirty = Object.keys(dirtyFields).length > 0;

  const onSubmit = useCallback(async (data: FormValues) => {
    setIsSaving(true);
    try {
      const prefix = isMother ? "mother" : "father";
      const updatedStudent: Student = {
        ...student,
        [`${prefix}Name`]: data.name,
        [`${prefix}Phone`]: data.phone,
        [`${prefix}Email`]: data.email,
        [`${prefix}Education`]: data.education,
        [`${prefix}Occupation`]: data.occupation,
        [`${prefix}VitalStatus`]: data.vitalStatus,
        [`${prefix}LivingStatus`]: data.livingStatus,
      };
      await upsertStudent(updatedStudent);
      form.reset(data);
      setShowSuccess(true);
      toast.success(`${title} kaydedildi`);
      setTimeout(() => setShowSuccess(false), 2000);
      onUpdate();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Kaydetme hatası");
    } finally {
      setIsSaving(false);
    }
  }, [student, onUpdate, form, isMother, title]);

  useEffect(() => {
    form.reset({
      name: (student[getField("name")] as string) || "",
      phone: (student[getField("phone")] as string) || "",
      email: (student[getField("email")] as string) || "",
      education: (student[getField("education")] as string) || "",
      occupation: (student[getField("occupation")] as string) || "",
      vitalStatus: (student[getField("vitalStatus")] as "Sağ" | "Vefat Etmiş") || "",
      livingStatus: (student[getField("livingStatus")] as "Birlikte" | "Ayrı") || "",
    });
  }, [student, form, getField]);

  return (
    <Card className={cn(
      "border-opacity-50 dark:border-opacity-50",
      isMother 
        ? "border-pink-200 dark:border-pink-800 bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-950/20 dark:to-rose-950/20"
        : "border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/20 dark:to-violet-950/20"
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className={cn("h-5 w-5", isMother ? "text-pink-600" : "text-indigo-600")} />
            {title}
          </CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Adı Soyadı</FormLabel>
                <FormControl><Input {...field} className="h-10" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Cep Telefonu</FormLabel>
                <FormControl><Input {...field} type="tel" className="h-10" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />E-posta</FormLabel>
                <FormControl><Input {...field} type="email" className="h-10" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="education" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" />Öğrenim Durumu</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {educationOptions.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="occupation" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />Meslek</FormLabel>
                <FormControl><Input {...field} className="h-10" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="vitalStatus" render={({ field }) => (
              <FormItem>
                <FormLabel>Hayatta mı?</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Sağ">Sağ</SelectItem>
                    <SelectItem value="Vefat Etmiş">Vefat Etmiş</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="livingStatus" render={({ field }) => (
              <FormItem>
                <FormLabel>Birlikte / Ayrı</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Birlikte">Birlikte</SelectItem>
                    <SelectItem value="Ayrı">Ayrı</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
