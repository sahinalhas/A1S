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

const creativeTalentOptions = [
  "Resim", "Heykel", "Grafik Tasarım", "Fotoğrafçılık", "Seramik",
  "Müzik (Çalgı)", "Vokal/Şan", "Beste", "Dans", "Tiyatro",
  "Yaratıcı Yazarlık", "Şiir", "El Becerileri", "Yaratıcı Problem Çözme"
];

const physicalTalentOptions = [
  "Futbol", "Basketbol", "Voleybol", "Hentbol", "Atletizm", "Yüzme",
  "Jimnastik", "Tenis", "Masa Tenisi", "Bisiklet", "Koşu",
  "Karate", "Taekwondo", "Judo", "Güç Antrenmanı", "Yoga"
];

const interestOptions = [
  "Bilim ve Teknoloji", "Okuma/Kitap", "Robotik", "Kodlama", "Yapay Zeka",
  "Edebiyat", "Sinema", "Müzik Dinleme", "Fotoğrafçılık", "Video Yapımı",
  "Tarih", "Felsefe", "Psikoloji", "Gönüllü Çalışmalar", "Çevre ve Doğa",
  "Podcast", "Blog Yazarlığı", "Yemek Yapma", "Seyahat", "Oyunlar"
];

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
  const [exploratoryInterests, setExploratoryInterests] = useState<string[]>(student.exploratoryInterests || []);
  const [clubs, setClubs] = useState<string[]>(student.clubMemberships || []);
  const [competitions, setCompetitions] = useState<string[]>(student.competitionsParticipated || []);
  const [newClub, setNewClub] = useState("");
  const [newCompetition, setNewCompetition] = useState("");

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

  const isDirty = form.formState.isDirty ||
    JSON.stringify(creativeTalents) !== JSON.stringify(student.creativeTalents || []) ||
    JSON.stringify(physicalTalents) !== JSON.stringify(student.physicalTalents || []) ||
    JSON.stringify(primaryInterests) !== JSON.stringify(student.primaryInterests || []) ||
    JSON.stringify(exploratoryInterests) !== JSON.stringify(student.exploratoryInterests || []) ||
    JSON.stringify(clubs) !== JSON.stringify(student.clubMemberships || []) ||
    JSON.stringify(competitions) !== JSON.stringify(student.competitionsParticipated || []);

  useEffect(() => {
    form.reset(defaultValues);
    setCreativeTalents(student.creativeTalents || []);
    setPhysicalTalents(student.physicalTalents || []);
    setPrimaryInterests(student.primaryInterests || []);
    setExploratoryInterests(student.exploratoryInterests || []);
    setClubs(student.clubMemberships || []);
    setCompetitions(student.competitionsParticipated || []);
  }, [student]);

  const getSummaryItems = useMemo(() => {
    const items: { label: string; value: string; icon?: React.ReactNode }[] = [];
    if ((student.creativeTalents || []).length > 0) items.push({ label: "Sanatsal", value: `${(student.creativeTalents || []).length} yetenek`, icon: <Palette className="h-3.5 w-3.5" /> });
    if ((student.physicalTalents || []).length > 0) items.push({ label: "Sportif", value: `${(student.physicalTalents || []).length} yetenek`, icon: <Dumbbell className="h-3.5 w-3.5" /> });
    if ((student.primaryInterests || []).length > 0) items.push({ label: "İlgi", value: `${(student.primaryInterests || []).length} alan`, icon: <Lightbulb className="h-3.5 w-3.5" /> });
    if ((student.clubMemberships || []).length > 0) items.push({ label: "Kulüp", value: `${(student.clubMemberships || []).length} kulüp`, icon: <Users className="h-3.5 w-3.5" /> });
    if ((student.competitionsParticipated || []).length > 0) items.push({ label: "Yarışma", value: `${(student.competitionsParticipated || []).length} yarışma`, icon: <Trophy className="h-3.5 w-3.5" /> });
    return items;
  }, [student]);

  const toggleSelection = (item: string, list: string[], setList: (items: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const addClub = () => {
    if (newClub.trim() && !clubs.includes(newClub.trim())) {
      setClubs([...clubs, newClub.trim()]);
      setNewClub("");
    }
  };

  const addCompetition = () => {
    if (newCompetition.trim() && !competitions.includes(newCompetition.trim())) {
      setCompetitions([...competitions, newCompetition.trim()]);
      setNewCompetition("");
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
        exploratoryInterests,
        clubMemberships: clubs,
        competitionsParticipated: competitions,
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
  }, [student, onUpdate, form, creativeTalents, physicalTalents, primaryInterests, exploratoryInterests, clubs, competitions]);

  const handleCancel = useCallback(() => {
    form.reset(defaultValues);
    setCreativeTalents(student.creativeTalents || []);
    setPhysicalTalents(student.physicalTalents || []);
    setPrimaryInterests(student.primaryInterests || []);
    setExploratoryInterests(student.exploratoryInterests || []);
    setClubs(student.clubMemberships || []);
    setCompetitions(student.competitionsParticipated || []);
    setIsExpanded(false);
  }, [form, defaultValues, student]);

  return (
    <Card className="border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-950/20 dark:to-violet-950/20 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Yetenek & İlgi Alanları
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
              <Pencil className="h-4 w-4 text-purple-600" />
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
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
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
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-1.5">
                      <Palette className="h-4 w-4" />Yaratıcı & Sanatsal Yetenekler
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {creativeTalentOptions.map(talent => (
                        <Badge
                          key={talent}
                          variant={creativeTalents.includes(talent) ? "default" : "outline"}
                          className="cursor-pointer transition-all hover:scale-105"
                          onClick={() => toggleSelection(talent, creativeTalents, setCreativeTalents)}
                        >
                          {talent}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-1.5">
                      <Dumbbell className="h-4 w-4" />Fiziksel & Sportif Yetenekler
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {physicalTalentOptions.map(talent => (
                        <Badge
                          key={talent}
                          variant={physicalTalents.includes(talent) ? "default" : "outline"}
                          className="cursor-pointer transition-all hover:scale-105"
                          onClick={() => toggleSelection(talent, physicalTalents, setPhysicalTalents)}
                        >
                          {talent}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-1.5">
                      <Lightbulb className="h-4 w-4" />Ana İlgi Alanları
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {interestOptions.map(interest => (
                        <Badge
                          key={interest}
                          variant={primaryInterests.includes(interest) ? "default" : "outline"}
                          className="cursor-pointer transition-all hover:scale-105"
                          onClick={() => toggleSelection(interest, primaryInterests, setPrimaryInterests)}
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="hobbiesDetailed" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hobiler</FormLabel>
                        <FormControl><Textarea {...field} placeholder="Düzenli aktiviteler, hobiler..." className="min-h-[80px]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="extracurricularActivities" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Okul Dışı Aktiviteler</FormLabel>
                        <FormControl><Textarea {...field} placeholder="Kurslar, spor, gönüllülük..." className="min-h-[80px]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-1.5">
                      <Users className="h-4 w-4" />Kulüp Üyelikleri
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {clubs.map(club => (
                        <Badge key={club} variant="secondary" className="flex items-center gap-1">
                          {club}
                          <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setClubs(clubs.filter(c => c !== club))} />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newClub}
                        onChange={(e) => setNewClub(e.target.value)}
                        placeholder="Kulüp adı ekle..."
                        className="h-9 max-w-xs"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addClub())}
                      />
                      <Button type="button" size="sm" variant="outline" onClick={addClub}>Ekle</Button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-1.5">
                      <Trophy className="h-4 w-4" />Yarışmalar / Turnuvalar
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {competitions.map(comp => (
                        <Badge key={comp} variant="secondary" className="flex items-center gap-1">
                          {comp}
                          <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setCompetitions(competitions.filter(c => c !== comp))} />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newCompetition}
                        onChange={(e) => setNewCompetition(e.target.value)}
                        placeholder="Yarışma adı ekle..."
                        className="h-9 max-w-xs"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCompetition())}
                      />
                      <Button type="button" size="sm" variant="outline" onClick={addCompetition}>Ekle</Button>
                    </div>
                  </div>

                  <FormField control={form.control} name="talentsAdditionalNotes" render={({ field }) => (
                    <FormItem className="border-t pt-4">
                      <FormLabel>Ek Notlar</FormLabel>
                      <FormControl><Textarea {...field} placeholder="Yetenek ve ilgilerle ilgili ek açıklamalar..." className="min-h-[80px]" /></FormControl>
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
