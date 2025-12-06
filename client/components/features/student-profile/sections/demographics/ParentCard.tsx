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
import { Users, Phone, Mail, GraduationCap, Briefcase, Save, Check, Loader2, Pencil, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isExpanded, setIsExpanded] = useState(false);

  const isMother = parentType === "mother";
  const title = isMother ? "Anne Bilgileri" : "Baba Bilgileri";

  const getField = (field: string) => {
    const prefix = isMother ? "mother" : "father";
    return `${prefix}${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof Student;
  };

  const defaultValues = useMemo(() => ({
    name: (student[getField("name")] as string) || "",
    phone: (student[getField("phone")] as string) || "",
    email: (student[getField("email")] as string) || "",
    education: (student[getField("education")] as string) || "",
    occupation: (student[getField("occupation")] as string) || "",
    vitalStatus: (student[getField("vitalStatus")] as "Sağ" | "Vefat Etmiş") || "",
    livingStatus: (student[getField("livingStatus")] as "Birlikte" | "Ayrı") || "",
  }), [student, getField]);

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
    if (defaultValues.name) items.push({ label: "Ad Soyad", value: defaultValues.name, icon: <Users className="h-3.5 w-3.5" /> });
    if (defaultValues.phone) items.push({ label: "Telefon", value: defaultValues.phone, icon: <Phone className="h-3.5 w-3.5" /> });
    if (defaultValues.email) items.push({ label: "E-posta", value: defaultValues.email, icon: <Mail className="h-3.5 w-3.5" /> });
    if (defaultValues.education) items.push({ label: "Öğrenim", value: defaultValues.education, icon: <GraduationCap className="h-3.5 w-3.5" /> });
    if (defaultValues.occupation) items.push({ label: "Meslek", value: defaultValues.occupation, icon: <Briefcase className="h-3.5 w-3.5" /> });
    if (defaultValues.vitalStatus) items.push({ label: "Durumu", value: defaultValues.vitalStatus });
    if (defaultValues.livingStatus) items.push({ label: "Birlikte/Ayrı", value: defaultValues.livingStatus });
    return items;
  }, [defaultValues]);

  const onSubmit = useCallback(async (data: FormValues) => {
    setIsSaving(true);
    try {
      const prefix = isMother ? "mother" : "father";
      
      const updatedStudent: Student = {
        ...student,
        [`${prefix}Name`]: data.name || undefined,
        [`${prefix}Phone`]: data.phone || undefined,
        [`${prefix}Email`]: data.email || undefined,
        [`${prefix}Education`]: data.education || undefined,
        [`${prefix}Occupation`]: data.occupation || undefined,
        [`${prefix}VitalStatus`]: data.vitalStatus || undefined,
        [`${prefix}LivingStatus`]: data.livingStatus || undefined,
      } as Student;
      
      await upsertStudent(updatedStudent);
      form.reset(data);
      setShowSuccess(true);
      toast.success(`${title} kaydedildi`);
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
  }, [student, isMother, onUpdate, title, form]);

  const handleCancel = useCallback(() => {
    form.reset(defaultValues);
    setIsExpanded(false);
  }, [form, defaultValues]);

  return (
    <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "h-9 gap-1.5 text-sm transition-colors",
              isExpanded 
                ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            )}
          >
            {isExpanded ? (
              <><X className="h-4 w-4" />Kapat</>
            ) : (
              <><Pencil className="h-4 w-4" />Düzenle</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {getSummaryItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getSummaryItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
                    >
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        {item.icon}
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Henüz bilgi girilmemiş</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Form {...form}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Users className="h-3.5 w-3.5" />Ad Soyad</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder={isMother ? "Anne adı" : "Baba adı"} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Phone className="h-3.5 w-3.5" />Telefon</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder="Telefon numarası" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Mail className="h-3.5 w-3.5" />E-posta</FormLabel>
                      <FormControl><Input type="email" {...field} className="h-10" placeholder="E-posta adresi" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="education" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><GraduationCap className="h-3.5 w-3.5" />Öğrenim Düzeyi</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {educationOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField control={form.control} name="occupation" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Briefcase className="h-3.5 w-3.5" />Meslek</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder="Meslek adı" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="vitalStatus" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Durumu</FormLabel>
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
                </div>
                <FormField control={form.control} name="livingStatus" render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="text-sm font-medium">Yaşadıkları Yer</FormLabel>
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
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>İptal</Button>
                  <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isSaving || !isDirty} className={cn("transition-all duration-300", showSuccess && "bg-green-600 hover:bg-green-700")}>
                    {isSaving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Kaydediliyor</> : showSuccess ? <><Check className="h-4 w-4 mr-1" />Kaydedildi</> : <><Save className="h-4 w-4 mr-1" />Kaydet</>}
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
