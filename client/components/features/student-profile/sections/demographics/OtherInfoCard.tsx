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
import { Home, Users, Bus, Briefcase, Thermometer, Save, Check, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isExpanded, setIsExpanded] = useState(false);

  const defaultValues = useMemo((): FormValues => ({
    numberOfSiblings: (student.numberOfSiblings ?? "") as number | "",
    livingWith: student.livingWith || "",
    homeRentalStatus: student.homeRentalStatus || "",
    homeHeatingType: student.homeHeatingType || "",
    transportationToSchool: student.transportationToSchool || "",
    studentWorkStatus: student.studentWorkStatus || "",
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
    if (typeof defaultValues.numberOfSiblings === "number") items.push({ label: "Kardeş", value: `${defaultValues.numberOfSiblings} kardeş`, icon: <Users className="h-3.5 w-3.5" /> });
    if (defaultValues.livingWith) items.push({ label: "Kiminle", value: defaultValues.livingWith });
    if (defaultValues.homeRentalStatus) items.push({ label: "Ev", value: defaultValues.homeRentalStatus, icon: <Home className="h-3.5 w-3.5" /> });
    if (defaultValues.homeHeatingType) items.push({ label: "Isınma", value: defaultValues.homeHeatingType, icon: <Thermometer className="h-3.5 w-3.5" /> });
    if (defaultValues.transportationToSchool) items.push({ label: "Ulaşım", value: defaultValues.transportationToSchool, icon: <Bus className="h-3.5 w-3.5" /> });
    if (defaultValues.studentWorkStatus) items.push({ label: "Çalışma", value: defaultValues.studentWorkStatus, icon: <Briefcase className="h-3.5 w-3.5" /> });
    return items;
  }, [defaultValues]);

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
    <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg">
      <CardHeader 
        className="pb-4 cursor-pointer select-none hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
              isExpanded 
                ? "bg-amber-100 dark:bg-amber-900/30" 
                : "bg-gray-100 dark:bg-gray-800"
            )}>
              <Home className={cn(
                "h-5 w-5 transition-colors duration-300",
                isExpanded
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-gray-600 dark:text-gray-400"
              )} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">Diğer Bilgiler</CardTitle>
              {!isExpanded && getSummaryItems.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getSummaryItems.length} bilgi kayıtlı</p>
              )}
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ChevronDown className={cn(
              "h-5 w-5 transition-colors duration-300",
              isExpanded
                ? "text-amber-600 dark:text-amber-400"
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
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="p-3 rounded-lg bg-gradient-to-br from-amber-50/50 to-yellow-50/30 dark:from-amber-900/10 dark:to-yellow-900/5 border border-amber-100/50 dark:border-amber-800/30 hover:border-amber-200/70 dark:hover:border-amber-700/50 transition-colors duration-200"
                    >
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                        {item.icon && <span className="text-amber-500 dark:text-amber-400">{item.icon}</span>}
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{item.value}</p>
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
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="py-4">
              <Form {...form}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="numberOfSiblings" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Users className="h-3.5 w-3.5" />Kardeş Sayısı</FormLabel><FormControl><Input type="number" {...field} className="h-10" placeholder="Sayı" onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="livingWith" render={({ field }) => (<FormItem><FormLabel className="text-sm font-medium">Kiminle Yaşıyor</FormLabel><FormControl><Input {...field} className="h-10" placeholder="Örn: Anne-Baba" /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField control={form.control} name="homeRentalStatus" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Home className="h-3.5 w-3.5" />Ev Durumu</FormLabel><FormControl><Input {...field} className="h-10" placeholder="Sahibi/Kiracı" /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="homeHeatingType" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Thermometer className="h-3.5 w-3.5" />Isınma Türü</FormLabel><FormControl><Input {...field} className="h-10" placeholder="Kombi, Kalorifer vb." /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField control={form.control} name="transportationToSchool" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Bus className="h-3.5 w-3.5" />Okula Ulaşım</FormLabel><FormControl><Input {...field} className="h-10" placeholder="Yürüme, Otobüs vb." /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="studentWorkStatus" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Briefcase className="h-3.5 w-3.5" />Çalışma Durumu</FormLabel><FormControl><Input {...field} className="h-10" placeholder="Çalışmıyor/Çalışıyor vb." /></FormControl><FormMessage /></FormItem>)} />
                </div>
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
  );
}
