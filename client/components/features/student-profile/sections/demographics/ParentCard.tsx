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
import { Users, Phone, Mail, GraduationCap, Briefcase, Save, Check, Loader2, ChevronDown } from "lucide-react";
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

  const colorScheme = isMother ? { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400", border: "border-pink-100/50 dark:border-pink-800/30", hover: "hover:border-pink-200/70 dark:hover:border-pink-700/50", gradient: "from-pink-50/50 to-rose-50/30 dark:from-pink-900/10 dark:to-rose-900/5" } : { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-100/50 dark:border-blue-800/30", hover: "hover:border-blue-200/70 dark:hover:border-blue-700/50", gradient: "from-blue-50/50 to-cyan-50/30 dark:from-blue-900/10 dark:to-cyan-900/5" };

  const colorMap = isMother ? { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-300", ring: "ring-pink-300/50 dark:ring-pink-600/50", shadow: "hover:shadow-[0_8px_24px_rgba(236,72,153,0.08)] dark:hover:shadow-[0_8px_24px_rgba(236,72,153,0.12)]", border: "hover:border-pink-300/60 dark:hover:border-pink-600/40", hover: "hover:bg-pink-50/40 dark:hover:bg-pink-900/15" } : { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-300", ring: "ring-blue-300/50 dark:ring-blue-600/50", shadow: "hover:shadow-[0_8px_24px_rgba(59,130,246,0.08)] dark:hover:shadow-[0_8px_24px_rgba(59,130,246,0.12)]", border: "hover:border-blue-300/60 dark:hover:border-blue-600/40", hover: "hover:bg-blue-50/40 dark:hover:bg-blue-900/15" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn(
        "border transition-all duration-500 shadow-lg dark:shadow-2xl backdrop-blur-xl",
        isMother 
          ? "border-pink-100/30 dark:border-pink-800/20 bg-gradient-to-br from-white/95 via-pink-50/20 to-pink-100/10 dark:from-gray-900/95 dark:via-pink-950/10 dark:to-pink-900/5 hover:shadow-2xl hover:border-pink-200/50 dark:hover:shadow-pink-900/40 dark:hover:border-pink-700/30" 
          : "border-blue-100/30 dark:border-blue-800/20 bg-gradient-to-br from-white/95 via-blue-50/20 to-blue-100/10 dark:from-gray-900/95 dark:via-blue-950/10 dark:to-blue-900/5 hover:shadow-2xl hover:border-blue-200/50 dark:hover:shadow-blue-900/40 dark:hover:border-blue-700/30"
      )}>
        <CardHeader 
          className={cn("pb-4 cursor-pointer select-none transition-colors duration-300 relative group", isMother ? "hover:bg-pink-50/30 dark:hover:bg-pink-900/15" : "hover:bg-blue-50/30 dark:hover:bg-blue-900/15")}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: isExpanded ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 flex-shrink-0",
                  isExpanded 
                    ? cn("ring-2", isMother ? "bg-gradient-to-br from-pink-200 to-pink-100 dark:from-pink-800/50 dark:to-pink-700/30 ring-pink-300/50 dark:ring-pink-600/40 shadow-lg dark:shadow-pink-900/50" : "bg-gradient-to-br from-blue-200 to-blue-100 dark:from-blue-800/50 dark:to-blue-700/30 ring-blue-300/50 dark:ring-blue-600/40 shadow-lg dark:shadow-blue-900/50")
                    : "bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 ring-1 ring-gray-200/50 dark:ring-gray-700/50"
                )}
              >
                <Users className={cn(
                  "h-7 w-7 transition-all duration-300",
                  isExpanded 
                    ? cn(isMother ? "text-pink-600 dark:text-pink-300 scale-110" : "text-blue-600 dark:text-blue-300 scale-110")
                    : "text-gray-600 dark:text-gray-400"
                )} />
              </motion.div>
              <div className="min-w-0">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-50">{title}</CardTitle>
                {!isExpanded && getSummaryItems.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 truncate font-medium">{defaultValues.name || "Eksik bilgiler"}</p>
                )}
              </div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex-shrink-0"
            >
              <ChevronDown className={cn(
                "h-5 w-5 transition-all duration-300",
                isExpanded ? cn(isMother ? "text-pink-600 dark:text-pink-300" : "text-blue-600 dark:text-blue-300", "scale-110") : "text-gray-400 dark:text-gray-500"
              )} />
            </motion.div>
          </div>
        </CardHeader>
      <CardContent className="pt-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {getSummaryItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
                  {getSummaryItems.map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.08 }}
                      className={cn("p-4 rounded-xl bg-gradient-to-br border transition-all duration-200 group hover:shadow-md", isMother ? "from-pink-50/80 to-rose-50/40 dark:from-pink-900/20 dark:to-rose-900/10 border-pink-100/50 dark:border-pink-800/30 hover:border-pink-200/80 dark:hover:border-pink-700/60 dark:hover:shadow-pink-900/20" : "from-blue-50/80 to-cyan-50/40 dark:from-blue-900/20 dark:to-cyan-900/10 border-blue-100/50 dark:border-blue-800/30 hover:border-blue-200/80 dark:hover:border-blue-700/60 dark:hover:shadow-blue-900/20")}
                    >
                      <p className={cn("text-xs font-bold mb-2 flex items-center gap-2 uppercase tracking-wide", isMother ? "text-pink-700 dark:text-pink-300" : "text-blue-700 dark:text-blue-300")}>
                        {item.icon && <span className={cn("group-hover:scale-110 transition-transform", isMother ? "text-pink-600 dark:text-pink-400" : "text-blue-600 dark:text-blue-400")}>{item.icon}</span>}
                        {item.label}
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2">{item.value}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">Henüz bilgi girilmemiş</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="form" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.2 }} 
              className="py-4">
              <Form {...form}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Users className="h-3.5 w-3.5" />Ad Soyad</FormLabel><FormControl><Input {...field} className="h-10" placeholder={isMother ? "Anne adı" : "Baba adı"} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Phone className="h-3.5 w-3.5" />Telefon</FormLabel><FormControl><Input {...field} className="h-10" placeholder="Telefon numarası" /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Mail className="h-3.5 w-3.5" />E-posta</FormLabel><FormControl><Input type="email" {...field} className="h-10" placeholder="E-posta adresi" /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="education" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-1.5 text-sm font-medium"><GraduationCap className="h-3.5 w-3.5" />Öğrenim Düzeyi</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl><SelectContent>{educationOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField control={form.control} name="occupation" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Briefcase className="h-3.5 w-3.5" />Meslek</FormLabel><FormControl><Input {...field} className="h-10" placeholder="Meslek adı" /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="vitalStatus" render={({ field }) => (<FormItem><FormLabel className="text-sm font-medium">Durumu</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Sağ">Sağ</SelectItem><SelectItem value="Vefat Etmiş">Vefat Etmiş</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="livingStatus" render={({ field }) => (<FormItem className="mt-4"><FormLabel className="text-sm font-medium">Yaşadıkları Yer</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Birlikte">Birlikte</SelectItem><SelectItem value="Ayrı">Ayrı</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>İptal</Button>
                  <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isSaving || !isDirty} className={cn("transition-all duration-300", showSuccess && "bg-green-600 hover:bg-green-700")}>{isSaving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Kaydediliyor</> : showSuccess ? <><Check className="h-4 w-4 mr-1" />Kaydedildi</> : <><Save className="h-4 w-4 mr-1" />Kaydet</>}</Button>
                </div>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      </Card>
    </motion.div>
  );
}
