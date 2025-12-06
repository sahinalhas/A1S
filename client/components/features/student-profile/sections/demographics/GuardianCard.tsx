import { useCallback, useEffect, useMemo, useState } from "react";
import type { Student } from "@/lib/types/student.types";
import { upsertStudent } from "@/lib/api/endpoints/students.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UserCheck, Phone, Mail, Link, Save, Check, Loader2, Pencil, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const schema = z.object({
  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email("Geçerli e-posta giriniz").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface GuardianCardProps {
  student: Student;
  onUpdate: () => void;
}

export function GuardianCard({ student, onUpdate }: GuardianCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const defaultValues = useMemo(() => ({
    guardianName: student.guardianName || "",
    guardianRelation: student.guardianRelation || "",
    guardianPhone: student.guardianPhone || "",
    guardianEmail: student.guardianEmail || "",
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
    if (defaultValues.guardianName) items.push({ label: "Ad Soyad", value: defaultValues.guardianName, icon: <UserCheck className="h-3.5 w-3.5" /> });
    if (defaultValues.guardianRelation) items.push({ label: "Yakınlık", value: defaultValues.guardianRelation, icon: <Link className="h-3.5 w-3.5" /> });
    if (defaultValues.guardianPhone) items.push({ label: "Telefon", value: defaultValues.guardianPhone, icon: <Phone className="h-3.5 w-3.5" /> });
    if (defaultValues.guardianEmail) items.push({ label: "E-posta", value: defaultValues.guardianEmail, icon: <Mail className="h-3.5 w-3.5" /> });
    return items;
  }, [defaultValues]);

  const onSubmit = useCallback(async (data: FormValues) => {
    setIsSaving(true);
    try {
      const updatedStudent: Student = { ...student, ...data };
      await upsertStudent(updatedStudent);
      form.reset(data);
      setShowSuccess(true);
      toast.success("Vasi bilgileri kaydedildi");
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
              <UserCheck className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            Vasi Bilgileri
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
                  <FormField control={form.control} name="guardianName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><UserCheck className="h-3.5 w-3.5" />Ad Soyad</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder="Vasi adı soyadı" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="guardianRelation" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Link className="h-3.5 w-3.5" />Yakınlık</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder="Örn: Amca, Teyze" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField control={form.control} name="guardianPhone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Phone className="h-3.5 w-3.5" />Telefon</FormLabel>
                      <FormControl><Input {...field} className="h-10" placeholder="Telefon numarası" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="guardianEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><Mail className="h-3.5 w-3.5" />E-posta</FormLabel>
                      <FormControl><Input type="email" {...field} className="h-10" placeholder="E-posta adresi" /></FormControl>
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
