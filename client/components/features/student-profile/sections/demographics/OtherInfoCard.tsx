import { useEffect, useState, useCallback } from "react";
import type { Student } from "@/lib/types/student.types";
import { upsertStudent } from "@/lib/api/endpoints/students.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Home, Users, Bus, Briefcase, Thermometer, Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

const schema = z.object({
  numberOfSiblings: z.number().min(0).optional().or(z.literal("")),
  livingWith: z.string().optional(),
  homeRentalStatus: z.string().optional(),
  homeHeatingType: z.string().optional(),
  transportationToSchool: z.string().optional(),
  studentWorkStatus: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface OtherInfoCardProps {
  student: Student;
  onUpdate: () => void;
}

export function OtherInfoCard({ student, onUpdate }: OtherInfoCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      numberOfSiblings: student.numberOfSiblings ?? "",
      livingWith: student.livingWith || "",
      homeRentalStatus: student.homeRentalStatus || "",
      homeHeatingType: student.homeHeatingType || "",
      transportationToSchool: student.transportationToSchool || "",
      studentWorkStatus: student.studentWorkStatus || "",
    },
  });

  const { dirtyFields } = useFormState({ control: form.control });
  const isDirty = Object.keys(dirtyFields).length > 0;

  const onSubmit = useCallback(async (data: FormValues) => {
    setIsSaving(true);
    try {
      const updatedStudent: Student = {
        ...student,
        ...data,
        numberOfSiblings: typeof data.numberOfSiblings === "number" ? data.numberOfSiblings : undefined,
      };
      await upsertStudent(updatedStudent);
      form.reset(data);
      setShowSuccess(true);
      toast.success("Diğer bilgiler kaydedildi");
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
      numberOfSiblings: student.numberOfSiblings ?? "",
      livingWith: student.livingWith || "",
      homeRentalStatus: student.homeRentalStatus || "",
      homeHeatingType: student.homeHeatingType || "",
      transportationToSchool: student.transportationToSchool || "",
      studentWorkStatus: student.studentWorkStatus || "",
    });
  }, [student, form]);

  return (
    <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-950/20 dark:to-gray-950/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Home className="h-5 w-5 text-slate-600" />
              Diğer Bilgiler
            </CardTitle>
            <CardDescription>Aile yapısı ve yaşam koşulları</CardDescription>
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
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Aile Yapısı</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="numberOfSiblings" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Kardeş Sayısı</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0}
                        className="h-10" 
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="livingWith" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kiminle Yaşıyor?</FormLabel>
                    <FormControl><Input {...field} className="h-10" placeholder="Örn: Anne-Baba" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Ev ve Yaşam Koşulları</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="homeRentalStatus" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><Home className="h-3.5 w-3.5" />Ev Durumu</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Kira">Kira</SelectItem>
                        <SelectItem value="Kendine Ait">Kendine Ait</SelectItem>
                        <SelectItem value="Lojman">Lojman</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="homeHeatingType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><Thermometer className="h-3.5 w-3.5" />Isınma Şekli</FormLabel>
                    <FormControl><Input {...field} className="h-10" placeholder="Örn: Doğalgaz" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Okul ve Çalışma</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="transportationToSchool" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><Bus className="h-3.5 w-3.5" />Okula Ulaşım</FormLabel>
                    <FormControl><Input {...field} className="h-10" placeholder="Örn: Servis" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="studentWorkStatus" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />Çalışma Durumu</FormLabel>
                    <FormControl><Input {...field} className="h-10" placeholder="Örn: Çalışmıyor" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
