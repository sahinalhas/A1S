import { useCallback, useEffect, useMemo, useState } from "react";
import type { Student } from "@/lib/types/student.types";
import { upsertStudent } from "@/lib/api/endpoints/students.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { User, Hash, GraduationCap, Calendar, MapPin, Save, Check, Loader2, Pencil, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isExpanded, setIsExpanded] = useState(false);

  const defaultValues = useMemo((): FormValues => ({
    name: student.name || "",
    surname: student.surname || "",
    tcIdentityNo: student.tcIdentityNo || "",
    studentNumber: student.studentNumber || "",
    class: student.class || "",
    gender: (student.gender as "K" | "E" | "") || "",
    birthDate: student.birthDate || "",
    birthPlace: student.birthPlace || "",
  }), [student]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues,
  });

  const isDirty = form.formState.isDirty;

  useEffect(() => {
    form.reset(defaultValues);
  }, [student]);

  const getSummaryItems = useMemo(() => {
    const items: { label: string; value: string; icon?: React.ReactNode }[] = [];
    const fullName = `${defaultValues.name} ${defaultValues.surname}`.trim();
    if (fullName) items.push({ label: "Ad Soyad", value: fullName, icon: <User className="h-3.5 w-3.5" /> });
    if (defaultValues.studentNumber) items.push({ label: "Okul No", value: defaultValues.studentNumber, icon: <Hash className="h-3.5 w-3.5" /> });
    if (defaultValues.class) items.push({ label: "Sınıf", value: defaultValues.class, icon: <GraduationCap className="h-3.5 w-3.5" /> });
    if (defaultValues.gender) items.push({ label: "Cinsiyet", value: defaultValues.gender === "K" ? "Kız" : "Erkek" });
    if (defaultValues.birthDate) items.push({ label: "Doğum", value: defaultValues.birthDate, icon: <Calendar className="h-3.5 w-3.5" /> });
    if (defaultValues.birthPlace) items.push({ label: "Doğum Yeri", value: defaultValues.birthPlace, icon: <MapPin className="h-3.5 w-3.5" /> });
    return items;
  }, [defaultValues]);

  const onSubmit = useCallback(async (data: FormValues) => {
    setIsSaving(true);
    try {
      const updatedStudent: Student = { 
        ...student, 
        ...data,
        gender: data.gender || undefined,
      };
      await upsertStudent(updatedStudent);
      form.reset(data);
      setShowSuccess(true);
      toast.success("Kimlik bilgileri kaydedildi");
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
  }, [student, onUpdate, form]);

  const handleCancel = useCallback(() => {
    form.reset(defaultValues);
    setIsExpanded(false);
  }, [form, defaultValues]);

  return (
    <Card className="border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-blue-600" />
            Temel Kimlik Bilgileri
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
              <Pencil className="h-4 w-4 text-blue-600" />
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
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
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
