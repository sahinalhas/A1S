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
import { Phone, Mail, MapPin, Home, Save, Check, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const schema = z.object({
  phone: z.string().optional(),
  email: z.string().email("Geçerli e-posta giriniz").optional().or(z.literal("")),
  province: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ContactCardProps {
  student: Student;
  onUpdate: () => void;
}

export function ContactCard({ student, onUpdate }: ContactCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const defaultValues = useMemo(() => ({
    phone: student.phone || "",
    email: student.email || "",
    province: student.province || "",
    district: student.district || "",
    address: student.address || "",
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
    if (defaultValues.phone) items.push({ label: "Telefon", value: defaultValues.phone, icon: <Phone className="h-4 w-4" /> });
    if (defaultValues.email) items.push({ label: "E-posta", value: defaultValues.email, icon: <Mail className="h-4 w-4" /> });
    if (defaultValues.province) items.push({ label: "İl", value: defaultValues.province, icon: <MapPin className="h-4 w-4" /> });
    if (defaultValues.district) items.push({ label: "İlçe", value: defaultValues.district, icon: <Home className="h-4 w-4" /> });
    if (defaultValues.address) items.push({ label: "Adres", value: defaultValues.address.substring(0, 30) + (defaultValues.address.length > 30 ? "..." : "") });
    return items;
  }, [defaultValues]);

  const onSubmit = useCallback(async (data: FormValues) => {
    setIsSaving(true);
    try {
      const updatedStudent: Student = { ...student, ...data };
      await upsertStudent(updatedStudent);
      form.reset(data);
      setShowSuccess(true);
      toast.success("İletişim bilgileri kaydedildi");
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
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20 shadow-sm dark:shadow-lg backdrop-blur transition-all duration-500 hover:shadow-lg dark:hover:shadow-emerald-900/30">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        
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
                  "bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/20",
                  "shadow-md dark:shadow-lg border border-emerald-200/50 dark:border-emerald-700/30",
                  isExpanded && "shadow-lg dark:shadow-emerald-900/50 border-emerald-300 dark:border-emerald-600/50 ring-2 ring-emerald-200 dark:ring-emerald-700/50"
                )}>
                  <Phone className={cn(
                    "h-7 w-7 text-emerald-600 dark:text-emerald-300 transition-all duration-400",
                    isExpanded && "scale-125"
                  )} />
                </div>
              </motion.div>
              
              <div className="min-w-0 pt-1">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors duration-300">
                  İletişim Bilgileri
                </CardTitle>
                {!isExpanded && getSummaryItems.length > 0 && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium"
                  >
                    {getSummaryItems.length} bilgi kayıtlı
                  </motion.p>
                )}
              </div>
            </div>
            
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex-shrink-0 pt-1"
            >
              <div className="p-2 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 group-hover:bg-emerald-200/60 dark:group-hover:bg-emerald-900/50 transition-colors duration-300">
                <ChevronDown className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
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
                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/40 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200/60 dark:border-emerald-700/30 hover:border-emerald-300 dark:hover:border-emerald-600/50 hover:bg-emerald-50/90 dark:hover:bg-emerald-900/30 transition-all duration-300 group-hover/item:shadow-md dark:group-hover/item:shadow-emerald-900/30">
                          <div className="flex items-center gap-2 mb-2">
                            {item.icon && <span className="text-emerald-600 dark:text-emerald-400 group-hover/item:scale-120 transition-transform duration-300">{item.icon}</span>}
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">{item.label}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-50 line-clamp-2">{item.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="inline-block p-4 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20 mb-3">
                      <Phone className="h-6 w-6 text-emerald-400 dark:text-emerald-500" />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"><Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />Telefon</FormLabel>
                        <FormControl><Input {...field} className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-emerald-500 rounded-lg" placeholder="Telefon numarası" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"><Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />E-posta</FormLabel>
                        <FormControl><Input type="email" {...field} className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-emerald-500 rounded-lg" placeholder="E-posta adresi" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="province" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"><MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />İl</FormLabel>
                        <FormControl><Input {...field} className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-emerald-500 rounded-lg" placeholder="İl adı" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="district" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"><Home className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />İlçe</FormLabel>
                        <FormControl><Input {...field} className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-emerald-500 rounded-lg" placeholder="İlçe adı" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Adres</FormLabel>
                      <FormControl><textarea {...field} className="flex min-h-24 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600" placeholder="Tam adres" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
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
                          "h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300",
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
