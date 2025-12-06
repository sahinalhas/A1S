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
import { Sparkles, Palette, Dumbbell, Lightbulb, Users, Trophy, Save, Check, Loader2, X, Pencil } from "lucide-react";
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
    const items: { label: string; value: string; icon?: React.ReactNode }[] = [];
    if ((student.creativeTalents || []).length > 0) items.push({ label: "Sanatsal", value: `${(student.creativeTalents || []).length} yetenek`, icon: <Palette className="h-3.5 w-3.5" /> });
    if ((student.physicalTalents || []).length > 0) items.push({ label: "Sportif", value: `${(student.physicalTalents || []).length} yetenek`, icon: <Dumbbell className="h-3.5 w-3.5" /> });
    if ((student.primaryInterests || []).length > 0) items.push({ label: "İlgi", value: `${(student.primaryInterests || []).length} alan`, icon: <Lightbulb className="h-3.5 w-3.5" /> });
    if ((student.clubMemberships || []).length > 0) items.push({ label: "Kulüp", value: `${(student.clubMemberships || []).length} kulüp`, icon: <Users className="h-3.5 w-3.5" /> });
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
    <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            Yetenek & İlgi Alanları
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className={cn("h-9 gap-1.5 text-sm transition-colors", isExpanded ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100")}>
            {isExpanded ? <><X className="h-4 w-4" />Kapat</> : <><Pencil className="h-4 w-4" />Düzenle</>}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {getSummaryItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getSummaryItems.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">{item.icon}{item.label}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Henüz bilgi girilmemiş</p>
              )}
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <Form {...form}>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-1.5"><Palette className="h-3.5 w-3.5" />Yaratıcı & Sanatsal Yetenekler</p>
                    <div className="flex flex-wrap gap-2">{creativeTalentOptions.map(talent => (
                      <Badge key={talent} variant={creativeTalents.includes(talent) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleSelection(talent, creativeTalents, setCreativeTalents)}>{talent}</Badge>
                    ))}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-1.5"><Dumbbell className="h-3.5 w-3.5" />Fiziksel & Sportif Yetenekler</p>
                    <div className="flex flex-wrap gap-2">{physicalTalentOptions.map(talent => (
                      <Badge key={talent} variant={physicalTalents.includes(talent) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleSelection(talent, physicalTalents, setPhysicalTalents)}>{talent}</Badge>
                    ))}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5" />Ana İlgi Alanları</p>
                    <div className="flex flex-wrap gap-2">{interestOptions.map(interest => (
                      <Badge key={interest} variant={primaryInterests.includes(interest) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleSelection(interest, primaryInterests, setPrimaryInterests)}>{interest}</Badge>
                    ))}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <FormField control={form.control} name="hobbiesDetailed" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Hobiler</FormLabel>
                        <FormControl><Textarea {...field} placeholder="Düzenli aktiviteler..." className="min-h-[60px] text-sm" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="extracurricularActivities" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Okul Dışı Aktiviteler</FormLabel>
                        <FormControl><Textarea {...field} placeholder="Kurslar, spor, gönüllülük..." className="min-h-[60px] text-sm" /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Kulüp Üyelikleri</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {clubs.map(club => (
                        <Badge key={club} variant="secondary" className="flex items-center gap-1">{club}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setClubs(clubs.filter(c => c !== club))} />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input value={newClub} onChange={(e) => setNewClub(e.target.value)} placeholder="Kulüp adı ekle..." className="h-9 max-w-xs text-sm" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addClub())} />
                      <Button type="button" size="sm" onClick={addClub} variant="outline">Ekle</Button>
                    </div>
                  </div>
                  <FormField control={form.control} name="talentsAdditionalNotes" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Ek Notlar</FormLabel>
                      <FormControl><Textarea {...field} placeholder="Diğer yetenekler, başarılar..." className="min-h-[60px] text-sm" /></FormControl>
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
