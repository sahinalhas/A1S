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
import { User, Hash, GraduationCap, Calendar, MapPin, Save, Check, Loader2, ChevronDown } from "lucide-react";
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
    if (fullName) items.push({ label: "Ad Soyad", value: fullName, icon: <User className="h-4 w-4" /> });
    if (defaultValues.studentNumber) items.push({ label: "Okul No", value: defaultValues.studentNumber, icon: <Hash className="h-4 w-4" /> });
    if (defaultValues.class) items.push({ label: "Sınıf", value: defaultValues.class, icon: <GraduationCap className="h-4 w-4" /> });
    if (defaultValues.gender) items.push({ label: "Cinsiyet", value: defaultValues.gender === "K" ? "Kız" : "Erkek" });
    if (defaultValues.birthDate) items.push({ label: "Doğum", value: defaultValues.birthDate, icon: <Calendar className="h-4 w-4" /> });
    if (defaultValues.birthPlace) items.push({ label: "Doğum Yeri", value: defaultValues.birthPlace, icon: <MapPin className="h-4 w-4" /> });
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 shadow-sm dark:shadow-lg backdrop-blur transition-all duration-500 hover:shadow-lg dark:hover:shadow-blue-900/30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
        
        <CardHeader 
          className="relative pb-0 pt-6 px-6 cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <motion.div
                animate={{ scale: isExpanded ? 1.08 : 1 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-400",
                  "bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20",
                  "shadow-md dark:shadow-lg border border-blue-200/50 dark:border-blue-700/30",
                  isExpanded && "shadow-lg dark:shadow-blue-900/50 border-blue-300 dark:border-blue-600/50 ring-2 ring-blue-200 dark:ring-blue-700/50"
                )}>
                  <User className={cn(
                    "h-7 w-7 text-blue-600 dark:text-blue-300 transition-all duration-400",
                    isExpanded && "scale-125"
                  )} />
                </div>
              </motion.div>
              
              <div className="min-w-0 pt-1">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-50 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300">
                  Temel Kimlik Bilgileri
                </CardTitle>
                {!isExpanded && getSummaryItems.length > 0 && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-600 dark:text-gray-400 mt-2 truncate font-medium"
                  >
                    {defaultValues.name && defaultValues.surname ? `${defaultValues.name} ${defaultValues.surname}` : "Eksik bilgiler"}
                  </motion.p>
                )}
              </div>
            </div>
            
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex-shrink-0 pt-1"
            >
              <div className="p-2 rounded-lg bg-blue-100/50 dark:bg-blue-900/30 group-hover:bg-blue-200/60 dark:group-hover:bg-blue-900/50 transition-colors duration-300">
                <ChevronDown className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="relative pt-4 px-6 pb-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              <motion.div
                key="summary"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                {getSummaryItems.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getSummaryItems.map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group/item"
                      >
                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-blue-100/40 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200/60 dark:border-blue-700/30 hover:border-blue-300 dark:hover:border-blue-600/50 hover:bg-blue-50/90 dark:hover:bg-blue-900/30 transition-all duration-300 group-hover/item:shadow-md dark:group-hover/item:shadow-blue-900/30">
                          <div className="flex items-center gap-2 mb-2">
                            {item.icon && <span className="text-blue-600 dark:text-blue-400 group-hover/item:scale-120 transition-transform duration-300">{item.icon}</span>}
                            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-widest">{item.label}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-50 line-clamp-2">{item.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="inline-block p-4 rounded-full bg-blue-100/50 dark:bg-blue-900/20 mb-3">
                      <User className="h-6 w-6 text-blue-400 dark:text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Henüz bilgi girilmemiş</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="form" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <Form {...form}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"><User className="h-4 w-4 text-blue-600 dark:text-blue-400" />Ad *</FormLabel>
                        <FormControl><Input {...field} className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-blue-500 rounded-lg" placeholder="Öğrenci adı" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="surname" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"><User className="h-4 w-4 text-blue-600 dark:text-blue-400" />Soyad *</FormLabel>
                        <FormControl><Input {...field} className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-blue-500 rounded-lg" placeholder="Öğrenci soyadı" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="tcIdentityNo" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"><Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />TC Kimlik No</FormLabel>
                        <FormControl><Input {...field} className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-blue-500 rounded-lg" placeholder="11 haneli TC no" maxLength={11} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="studentNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"><Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />Okul No *</FormLabel>
                        <FormControl><Input {...field} className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-blue-500 rounded-lg" placeholder="Örn: 101" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="class" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"><GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />Sınıf *</FormLabel>
                        <FormControl><Input {...field} className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-blue-500 rounded-lg" placeholder="Örn: 9/A" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="gender" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Cinsiyet</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-blue-500 rounded-lg"><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="K">Kız</SelectItem>
                            <SelectItem value="E">Erkek</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="birthDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"><Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />Doğum Tarihi</FormLabel>
                        <FormControl><Input type="date" {...field} className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-blue-500 rounded-lg" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="birthPlace" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"><MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />Doğum Yeri</FormLabel>
                        <FormControl><Input {...field} className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-blue-500 rounded-lg" placeholder="İl/İlçe" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="h-11 px-6"
                    >
                      İptal
                    </Button>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSaving || !isDirty}
                        className={cn(
                          "h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300",
                          showSuccess && "bg-green-600 hover:bg-green-700"
                        )}
                      >
                        {isSaving ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Kaydediliyor</>
                        ) : showSuccess ? (
                          <><Check className="h-4 w-4 mr-2" />Kaydedildi</>
                        ) : (
                          <><Save className="h-4 w-4 mr-2" />Kaydet</>
                        )}
                      </Button>
                    </motion.div>
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
