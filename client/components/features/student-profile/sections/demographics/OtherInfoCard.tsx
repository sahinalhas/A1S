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
import { Home, Users, Bus, Briefcase, Thermometer, Save, Check, Loader2, Pencil, X } from "lucide-react";
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
    <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Home className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            Diğer Bilgiler
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
                  <FormField control={form.control} name="numberOfSiblings" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Users className="h-3.5 w-3.5" />Kardeş Sayısı</FormLabel>
                      <FormControl><Input type="number" {...field} className="h-10" placeholder="Sayı" onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="livingWith" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Kiminle Yaşıyor</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder="Örn: Anne-Baba" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField control={form.control} name="homeRentalStatus" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Home className="h-3.5 w-3.5" />Ev Durumu</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder="Sahibi/Kiracı" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="homeHeatingType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Thermometer className="h-3.5 w-3.5" />Isınma Türü</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder="Kombi, Kalorifer vb." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField control={form.control} name="transportationToSchool" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Bus className="h-3.5 w-3.5" />Okula Ulaşım</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder="Yürüme, Otobüs vb." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="studentWorkStatus" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Briefcase className="h-3.5 w-3.5" />Çalışma Durumu</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder="Çalışmıyor/Çalışıyor vb." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
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
