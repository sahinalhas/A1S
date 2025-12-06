import { useCallback, useEffect, useMemo, useState } from "react";
import type { Student } from "@/lib/types/student.types";
import { upsertStudent } from "@/lib/api/endpoints/students.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Sparkles, Palette, Dumbbell, Lightbulb, Users, Trophy, Save, Check, Loader2, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/atoms/Badge";
import { motion, AnimatePresence } from "framer-motion";

const creativeTalentOptions = ["Resim", "Heykel", "Grafik Tasarım", "Fotoğrafçılık", "Seramik", "Müzik (Çalgı)", "Vokal/Şan", "Beste", "Dans", "Tiyatro", "Yaratıcı Yazarlık", "Şiir", "El Becerileri", "Yaratıcı Problem Çözme"];
const physicalTalentOptions = ["Futbol", "Basketbol", "Voleybol", "Hentbol", "Atletizm", "Yüzme", "Jimnastik", "Tenis", "Masa Tenisi", "Bisiklet", "Koşu", "Karate", "Taekwondo", "Judo", "Güç Antrenmanı", "Yoga"];
const interestOptions = ["Bilim ve Teknoloji", "Okuma/Kitap", "Robotik", "Kodlama", "Yapay Zeka", "Edebiyat", "Sinema", "Müzik Dinleme", "Fotoğrafçılık", "Video Yapımı", "Tarih", "Felsefe", "Psikoloji", "Gönüllü Çalışmalar", "Çevre ve Doğa", "Podcast", "Blog Yazarlığı", "Yemek Yapma", "Seyahat", "Oyunlar"];

const schema = z.object({
  creativeTalents: z.array(z.string()).optional(),
  physicalTalents: z.array(z.string()).optional(),
  primaryInterests: z.array(z.string()).optional(),
  exploratoryInterests: z.array(z.string()).optional(),
  hobbiesDetailed: z.string().optional(),
  extracurricularActivities: z.string().optional(),
  clubMemberships: z.array(z.string()).optional(),
  competitionsParticipated: z.array(z.string()).optional(),
  talentsAdditionalNotes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface TalentsCardProps {
  student: Student;
  onUpdate: () => void;
}

export function TalentsCard({ student, onUpdate }: TalentsCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [creativeTalents, setCreativeTalents] = useState<string[]>(student.creativeTalents || []);
  const [physicalTalents, setPhysicalTalents] = useState<string[]>(student.physicalTalents || []);
  const [primaryInterests, setPrimaryInterests] = useState<string[]>(student.primaryInterests || []);
  const [clubs, setClubs] = useState<string[]>(student.clubMemberships || []);
  const [newClub, setNewClub] = useState("");

  const defaultValues = useMemo(() => ({
    hobbiesDetailed: student.hobbiesDetailed || "",
    extracurricularActivities: student.extracurricularActivities || "",
    talentsAdditionalNotes: student.talentsAdditionalNotes || "",
  }), [student]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues,
  });

  const isDirty = form.formState.isDirty || JSON.stringify(creativeTalents) !== JSON.stringify(student.creativeTalents || []) || JSON.stringify(physicalTalents) !== JSON.stringify(student.physicalTalents || []) || JSON.stringify(primaryInterests) !== JSON.stringify(student.primaryInterests || []) || JSON.stringify(clubs) !== JSON.stringify(student.clubMemberships || []);

  useEffect(() => {
    form.reset(defaultValues);
    setCreativeTalents(student.creativeTalents || []);
    setPhysicalTalents(student.physicalTalents || []);
    setPrimaryInterests(student.primaryInterests || []);
    setClubs(student.clubMemberships || []);
  }, [student]);

  const getSummaryItems = useMemo(() => {
    const items: { label: string; items?: string[]; icon?: React.ReactNode }[] = [];
    if ((student.creativeTalents || []).length > 0) items.push({ label: "Sanatsal Yetenekler", items: student.creativeTalents, icon: <Palette className="h-3.5 w-3.5" /> });
    if ((student.physicalTalents || []).length > 0) items.push({ label: "Sportif Yetenekler", items: student.physicalTalents, icon: <Dumbbell className="h-3.5 w-3.5" /> });
    if ((student.primaryInterests || []).length > 0) items.push({ label: "İlgi Alanları", items: student.primaryInterests, icon: <Lightbulb className="h-3.5 w-3.5" /> });
    if ((student.clubMemberships || []).length > 0) items.push({ label: "Kulüp Üyelikleri", items: student.clubMemberships, icon: <Users className="h-3.5 w-3.5" /> });
    return items;
  }, [student]);

  const toggleSelection = (item: string, list: string[], setList: (items: string[]) => void) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const addClub = () => {
    if (newClub.trim() && !clubs.includes(newClub.trim())) {
      setClubs([...clubs, newClub.trim()]);
      setNewClub("");
    }
  };

  const onSubmit = useCallback(async (data: FormValues) => {
    setIsSaving(true);
    try {
      const updatedStudent: Student = {
        ...student,
        ...data,
        creativeTalents,
        physicalTalents,
        primaryInterests,
        clubMemberships: clubs,
      };
      await upsertStudent(updatedStudent);
      form.reset(data);
      setShowSuccess(true);
      toast.success("Yetenek bilgileri kaydedildi");
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
  }, [student, onUpdate, form, creativeTalents, physicalTalents, primaryInterests, clubs]);

  const handleCancel = useCallback(() => {
    form.reset(defaultValues);
    setCreativeTalents(student.creativeTalents || []);
    setPhysicalTalents(student.physicalTalents || []);
    setPrimaryInterests(student.primaryInterests || []);
    setClubs(student.clubMemberships || []);
    setIsExpanded(false);
  }, [form, defaultValues, student]);

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
                ? "bg-orange-100 dark:bg-orange-900/30" 
                : "bg-gray-100 dark:bg-gray-800"
            )}>
              <Sparkles className={cn(
                "h-5 w-5 transition-colors duration-300",
                isExpanded
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-400"
              )} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">Yetenek & İlgi Alanları</CardTitle>
              {!isExpanded && getSummaryItems.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getSummaryItems.length} alan doldurulmuş</p>
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
                ? "text-orange-600 dark:text-orange-400"
                : "text-gray-400 dark:text-gray-500"
            )} />
          </motion.div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div key="summary" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
              {getSummaryItems.length > 0 ? (
                <div className="space-y-3 py-2">
                  {getSummaryItems.map((item, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.05 }} className="p-3 rounded-lg bg-gradient-to-br from-orange-50/50 to-amber-50/30 dark:from-orange-900/10 dark:to-amber-900/5 border border-orange-100/50 dark:border-orange-800/30 hover:border-orange-200/70 dark:hover:border-orange-700/50 transition-colors duration-200">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">{item.icon && <span className="text-orange-500 dark:text-orange-400">{item.icon}</span>}{item.label}</p>
                      <div className="flex flex-wrap gap-1.5">{item.items?.map((val, i) => (<span key={i} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-700/40 text-orange-900 dark:text-orange-100 rounded">{val}</span>))}</div>
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
                <div className="space-y-4">
                  <div><p className="text-sm font-medium mb-2 flex items-center gap-1.5"><Palette className="h-3.5 w-3.5" />Yaratıcı & Sanatsal Yetenekler</p><div className="flex flex-wrap gap-2">{creativeTalentOptions.map(talent => (<Badge key={talent} variant={creativeTalents.includes(talent) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleSelection(talent, creativeTalents, setCreativeTalents)}>{talent}</Badge>))}</div></div>
                  <div><p className="text-sm font-medium mb-2 flex items-center gap-1.5"><Dumbbell className="h-3.5 w-3.5" />Fiziksel & Sportif Yetenekler</p><div className="flex flex-wrap gap-2">{physicalTalentOptions.map(talent => (<Badge key={talent} variant={physicalTalents.includes(talent) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleSelection(talent, physicalTalents, setPhysicalTalents)}>{talent}</Badge>))}</div></div>
                  <div><p className="text-sm font-medium mb-2 flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5" />Ana İlgi Alanları</p><div className="flex flex-wrap gap-2">{interestOptions.map(interest => (<Badge key={interest} variant={primaryInterests.includes(interest) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleSelection(interest, primaryInterests, setPrimaryInterests)}>{interest}</Badge>))}</div></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"><FormField control={form.control} name="hobbiesDetailed" render={({ field }) => (<FormItem><FormLabel className="text-sm font-medium">Hobiler</FormLabel><FormControl><Textarea {...field} placeholder="Düzenli aktiviteler..." className="min-h-[60px] text-sm" /></FormControl></FormItem>)} /><FormField control={form.control} name="extracurricularActivities" render={({ field }) => (<FormItem><FormLabel className="text-sm font-medium">Okul Dışı Aktiviteler</FormLabel><FormControl><Textarea {...field} placeholder="Kurslar, spor, gönüllülük..." className="min-h-[60px] text-sm" /></FormControl></FormItem>)} /></div>
                  <div><p className="text-sm font-medium mb-2 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Kulüp Üyelikleri</p><div className="flex flex-wrap gap-2 mb-2">{clubs.map(club => (<Badge key={club} variant="secondary" className="flex items-center gap-1">{club}<X className="h-3 w-3 cursor-pointer" onClick={() => setClubs(clubs.filter(c => c !== club))} /></Badge>))}</div><div className="flex gap-2"><Input value={newClub} onChange={(e) => setNewClub(e.target.value)} placeholder="Kulüp adı ekle..." className="h-9 max-w-xs text-sm" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addClub())} /><Button type="button" size="sm" onClick={addClub} variant="outline">Ekle</Button></div></div>
                  <FormField control={form.control} name="talentsAdditionalNotes" render={({ field }) => (<FormItem><FormLabel className="text-sm font-medium">Ek Notlar</FormLabel><FormControl><Textarea {...field} placeholder="Diğer yetenekler, başarılar..." className="min-h-[60px] text-sm" /></FormControl></FormItem>)} />
                </div>
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"><Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>İptal</Button><Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isSaving || !isDirty} className={cn("transition-all duration-300", showSuccess && "bg-green-600 hover:bg-green-700")}>{isSaving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Kaydediliyor</> : showSuccess ? <><Check className="h-4 w-4 mr-1" />Kaydedildi</> : <><Save className="h-4 w-4 mr-1" />Kaydet</>}</Button></div>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
