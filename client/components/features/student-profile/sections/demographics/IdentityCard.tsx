import { useEffect, useState, useCallback } from "react";
import type { Student } from "@/lib/types/student.types";
import { upsertStudent } from "@/lib/api/endpoints/students.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { User, Hash, GraduationCap, Calendar, MapPin, Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Ad zorunludur"),
  surname: z.string().min(1, "Soyad zorunludur"),
  tcIdentityNo: z.string().optional(),
  studentNumber: z.string().min(1, "Okul numarası zorunludur"),
  class: z.string().min(1, "Sınıf zorunludur"),
  gender: z.enum(["K", "E"]).optional().or(z.literal("")),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface IdentityCardProps {
  student: Student;
  onUpdate: () => void;
}

export function IdentityCard({ student, onUpdate }: IdentityCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: student.name || "",
      surname: student.surname || "",
      tcIdentityNo: student.tcIdentityNo || "",
      studentNumber: student.studentNumber || "",
      class: student.class || "",
      gender: student.gender || "",
      birthDate: student.birthDate || "",
      birthPlace: student.birthPlace || "",
    },
  });

  const isDirty = form.formState.isDirty;

  const onSubmit = useCallback(async (data: FormValues) => {
    setIsSaving(true);
    try {
      const updatedStudent: Student = { ...student, ...data };
      await upsertStudent(updatedStudent);
      form.reset(data);
      setShowSuccess(true);
      toast.success("Kimlik bilgileri kaydedildi");
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
    form.reset({
      name: student.name || "",
      surname: student.surname || "",
      tcIdentityNo: student.tcIdentityNo || "",
      studentNumber: student.studentNumber || "",
      class: student.class || "",
      gender: student.gender || "",
      birthDate: student.birthDate || "",
      birthPlace: student.birthPlace || "",
    });
  }, [student, form]);

  return (
    <Card className="border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-600" />
              Temel Kimlik Bilgileri
            </CardTitle>
            <CardDescription>Öğrencinin temel tanımlayıcı bilgileri</CardDescription>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Ad *</FormLabel>
                <FormControl><Input {...field} className="h-10" placeholder="Öğrenci adı" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="surname" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Soyad *</FormLabel>
                <FormControl><Input {...field} className="h-10" placeholder="Öğrenci soyadı" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="tcIdentityNo" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" />TC Kimlik No</FormLabel>
                <FormControl><Input {...field} className="h-10" placeholder="11 haneli TC no" maxLength={11} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <FormField control={form.control} name="studentNumber" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" />Okul No *</FormLabel>
                <FormControl><Input {...field} className="h-10" placeholder="Örn: 101" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="class" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" />Sınıf *</FormLabel>
                <FormControl><Input {...field} className="h-10" placeholder="Örn: 9/A" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel>Cinsiyet *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="K">Kız</SelectItem>
                    <SelectItem value="E">Erkek</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField control={form.control} name="birthDate" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Doğum Tarihi</FormLabel>
                <FormControl><Input type="date" {...field} className="h-10" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="birthPlace" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Doğum Yeri</FormLabel>
                <FormControl><Input {...field} className="h-10" placeholder="İl/İlçe" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
