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
import { Phone, Mail, MapPin, Home, Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

const schema = z.object({
  phone: z.string().optional(),
  email: z.string().email("Geçerli e-posta giriniz").optional().or(z.literal("")),
  province: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ContactCardProps {
  student: Student;
  onUpdate: () => void;
}

export function ContactCard({ student, onUpdate }: ContactCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      phone: student.phone || "",
      email: student.email || "",
      province: student.province || "",
      district: student.district || "",
      address: student.address || "",
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
      toast.success("İletişim bilgileri kaydedildi");
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
      phone: student.phone || "",
      email: student.email || "",
      province: student.province || "",
      district: student.district || "",
      address: student.address || "",
    });
  }, [student, form]);

  return (
    <Card className="border-emerald-200/50 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-emerald-600" />
              İletişim & Adres
            </CardTitle>
            <CardDescription>Öğrenci iletişim bilgileri ve ev adresi</CardDescription>
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
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">İletişim Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Telefon</FormLabel>
                    <FormControl><Input {...field} type="tel" className="h-10" placeholder="+90 5XX..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />E-posta</FormLabel>
                    <FormControl><Input {...field} type="email" className="h-10" placeholder="ornek@email.com" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Adres Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="province" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />İl</FormLabel>
                    <FormControl><Input {...field} className="h-10" placeholder="Örn: İstanbul" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="district" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><Home className="h-3.5 w-3.5" />İlçe</FormLabel>
                    <FormControl><Input {...field} className="h-10" placeholder="Örn: Kadıköy" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Açık Adres</FormLabel>
                  <FormControl><Input {...field} className="h-10" placeholder="Mahalle, sokak, bina no..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
