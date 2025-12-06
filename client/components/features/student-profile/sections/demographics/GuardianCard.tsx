import { useEffect, useState, useCallback } from "react";
import type { Student } from "@/lib/types/student.types";
import { upsertStudent } from "@/lib/api/endpoints/students.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UserCheck, Phone, Mail, Link, Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

const schema = z.object({
  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email("Geçerli e-posta giriniz").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface GuardianCardProps {
  student: Student;
  onUpdate: () => void;
}

export function GuardianCard({ student, onUpdate }: GuardianCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      guardianName: student.guardianName || "",
      guardianRelation: student.guardianRelation || "",
      guardianPhone: student.guardianPhone || "",
      guardianEmail: student.guardianEmail || "",
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
      toast.success("Vasi bilgileri kaydedildi");
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
      guardianName: student.guardianName || "",
      guardianRelation: student.guardianRelation || "",
      guardianPhone: student.guardianPhone || "",
      guardianEmail: student.guardianEmail || "",
    });
  }, [student, form]);

  return (
    <Card className="border-amber-200/50 dark:border-amber-800/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="h-5 w-5 text-amber-600" />
              Vasi Bilgileri
            </CardTitle>
            <CardDescription>Anne-babasıyla yaşamıyorsa uygun vasi bilgileri doldurunuz.”</CardDescription>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="guardianName" render={({ field }) => (
              <FormItem>
                <FormLabel>Adı Soyadı</FormLabel>
                <FormControl><Input {...field} className="h-10" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="guardianRelation" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><Link className="h-3.5 w-3.5" />Yakınlık Derecesi</FormLabel>
                <FormControl><Input {...field} className="h-10" placeholder="Örn: Dayı, Teyze" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="guardianPhone" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Cep Telefonu</FormLabel>
                <FormControl><Input {...field} type="tel" className="h-10" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="guardianEmail" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />E-posta</FormLabel>
                <FormControl><Input {...field} type="email" className="h-10" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
