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
    <Card className="border border-gray-200/60 dark:border-gray-700/40 bg-white dark:bg-gray-900/30 transition-all duration-300 hover:border-blue-300/60 dark:hover:border-blue-600/40 hover:shadow-[0_8px_24px_rgba(59,130,246,0.08)] dark:hover:shadow-[0_8px_24px_rgba(59,130,246,0.12)] backdrop-blur-sm">
      <CardHeader 
        className="pb-4 cursor-pointer select-none hover:bg-blue-50/40 dark:hover:bg-blue-900/15 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0",
              isExpanded 
                ? "bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/30 ring-2 ring-blue-300/50 dark:ring-blue-600/50" 
                : "bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 ring-1 ring-gray-200/50 dark:ring-gray-700/50"
            )}>
              <User className={cn(
                "h-6 w-6 transition-all duration-300",
                isExpanded
                  ? "text-blue-600 dark:text-blue-300 scale-110"
                  : "text-gray-600 dark:text-gray-400"
              )} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-50">
                Temel Kimlik Bilgileri
              </CardTitle>
              {!isExpanded && getSummaryItems.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 truncate font-medium">
                  {defaultValues.name && defaultValues.surname ? `${defaultValues.name} ${defaultValues.surname}` : "Eksik bilgiler"}
                </p>
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
              isExpanded
                ? "text-blue-600 dark:text-blue-300 scale-110"
                : "text-gray-400 dark:text-gray-500"
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
                      className="p-3.5 rounded-lg bg-gradient-to-br from-blue-50/70 to-cyan-50/40 dark:from-blue-900/20 dark:to-cyan-900/10 border border-blue-100/60 dark:border-blue-800/30 hover:border-blue-200/80 dark:hover:border-blue-700/60 hover:shadow-md dark:hover:shadow-blue-900/20 transition-all duration-200 group"
                    >
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2 uppercase tracking-wide">
                        {item.icon && <span className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">{item.icon}</span>}
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
              className="py-4"
            >
              <Form {...form}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><User className="h-3.5 w-3.5" />Ad *</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder="Öğrenci adı" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="surname" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><User className="h-3.5 w-3.5" />Soyad *</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder="Öğrenci soyadı" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tcIdentityNo" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Hash className="h-3.5 w-3.5" />TC Kimlik No</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder="11 haneli TC no" maxLength={11} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <FormField control={form.control} name="studentNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Hash className="h-3.5 w-3.5" />Okul No *</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder="Örn: 101" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="class" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><GraduationCap className="h-3.5 w-3.5" />Sınıf *</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder="Örn: 9/A" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Cinsiyet</FormLabel>
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
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Calendar className="h-3.5 w-3.5" />Doğum Tarihi</FormLabel>
                      <FormControl><Input type="date" {...field} className="h-10" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="birthPlace" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><MapPin className="h-3.5 w-3.5" />Doğum Yeri</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder="İl/İlçe" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
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
