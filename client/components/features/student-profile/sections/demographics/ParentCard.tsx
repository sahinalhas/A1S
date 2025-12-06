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
    if (defaultValues.vitalStatus) items.push({ label: "Hayatta mı", value: defaultValues.vitalStatus });
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
  }, [student, onUpdate, form, isMother, title]);

  const handleCancel = useCallback(() => {
    form.reset(defaultValues);
    setIsExpanded(false);
  }, [form, defaultValues]);

  return (
    <Card className={cn(
      "border-opacity-50 dark:border-opacity-50 transition-all duration-300",
      "shadow-md hover:shadow-lg",
      isMother 
        ? "border-pink-200 dark:border-pink-800 bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-950/20 dark:to-rose-950/20"
        : "border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/20 dark:to-violet-950/20"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className={cn("h-5 w-5", isMother ? "text-pink-600" : "text-indigo-600")} />
            {title}
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
              <Pencil className={cn("h-4 w-4", isMother ? "text-pink-600" : "text-indigo-600")} />
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
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                        isMother 
                          ? "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
                          : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                      )}
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
