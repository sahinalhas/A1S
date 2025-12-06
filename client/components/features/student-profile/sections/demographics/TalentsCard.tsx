import { useEffect, useState, useCallback } from "react";
import type { Student } from "@/lib/types/student.types";
import { upsertStudent } from "@/lib/api/endpoints/students.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Sparkles, Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

const schema = z.object({
  creativeTalents: z.string().optional(),
  physicalTalents: z.string().optional(),
  primaryInterests: z.string().optional(),
  exploratoryInterests: z.string().optional(),
  hobbiesDetailed: z.string().optional(),
  extracurricularActivities: z.string().optional(),
  clubMemberships: z.string().optional(),
  competitionsParticipated: z.string().optional(),
  talentsAdditionalNotes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface TalentsCardProps {
  student: Student;
  onUpdate: () => void;
}

function arrayToString(arr: string[] | undefined): string {
  if (!arr || !Array.isArray(arr)) return "";
  return arr.join(", ");
}

function stringToArray(str: string | undefined): string[] {
  if (!str) return [];
  return str.split(",").map(s => s.trim()).filter(s => s.length > 0);
}

export function TalentsCard({ student, onUpdate }: TalentsCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const getDefaultValues = useCallback((): FormValues => ({
    creativeTalents: arrayToString(student.creativeTalents),
    physicalTalents: arrayToString(student.physicalTalents),
    primaryInterests: arrayToString(student.primaryInterests),
    exploratoryInterests: arrayToString(student.exploratoryInterests),
    hobbiesDetailed: student.hobbiesDetailed || "",
    extracurricularActivities: student.extracurricularActivities || "",
    clubMemberships: arrayToString(student.clubMemberships),
    competitionsParticipated: arrayToString(student.competitionsParticipated),
    talentsAdditionalNotes: student.talentsAdditionalNotes || "",
  }), [student]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: getDefaultValues(),
  });

  const { dirtyFields } = useFormState({ control: form.control });
  const isDirty = Object.keys(dirtyFields).length > 0;

  const onSubmit = useCallback(async (data: FormValues) => {
    setIsSaving(true);
    try {
      const updatedStudent: Student = {
        ...student,
        creativeTalents: stringToArray(data.creativeTalents),
        physicalTalents: stringToArray(data.physicalTalents),
        primaryInterests: stringToArray(data.primaryInterests),
        exploratoryInterests: stringToArray(data.exploratoryInterests),
        hobbiesDetailed: data.hobbiesDetailed || undefined,
        extracurricularActivities: data.extracurricularActivities || undefined,
        clubMemberships: stringToArray(data.clubMemberships),
        competitionsParticipated: stringToArray(data.competitionsParticipated),
        talentsAdditionalNotes: data.talentsAdditionalNotes || undefined,
      };
      await upsertStudent(updatedStudent);
      form.reset(data);
      setShowSuccess(true);
      toast.success("Yetenek bilgileri kaydedildi");
      setTimeout(() => setShowSuccess(false), 2000);
      onUpdate();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Kaydetme hatası");
    } finally {
      setIsSaving(false);
    }
  }, [student, onUpdate, form]);

  useEffect(() => {
    form.reset(getDefaultValues());
  }, [student, form, getDefaultValues]);

  return (
    <Card className="border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-950/20 dark:to-violet-950/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Yetenek & İlgi Alanları
            </CardTitle>
            <CardDescription>Öğrencinin yetenekleri, ilgi alanları ve aktiviteleri</CardDescription>
          </div>
          {isDirty && (
            <Button
              size="sm"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSaving}
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
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="creativeTalents" render={({ field }) => (
                <FormItem>
                  <FormLabel>Yaratıcı & Sanatsal Yetenekler</FormLabel>
                  <FormControl><Input {...field} placeholder="Resim, Müzik, Dans... (virgülle ayırın)" className="h-10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="physicalTalents" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fiziksel & Sportif Yetenekler</FormLabel>
                  <FormControl><Input {...field} placeholder="Futbol, Yüzme, Atletizm... (virgülle ayırın)" className="h-10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="primaryInterests" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ana İlgi Alanları</FormLabel>
                  <FormControl><Input {...field} placeholder="Teknoloji, Edebiyat... (virgülle ayırın)" className="h-10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="exploratoryInterests" render={({ field }) => (
                <FormItem>
                  <FormLabel>Keşfedilen İlgi Alanları</FormLabel>
                  <FormControl><Input {...field} placeholder="Yeni ilgi alanları... (virgülle ayırın)" className="h-10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
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

            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="clubMemberships" render={({ field }) => (
                <FormItem>
                  <FormLabel>Kulüp Üyelikleri</FormLabel>
                  <FormControl><Input {...field} placeholder="Satranç Kulübü, Müzik... (virgülle ayırın)" className="h-10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="competitionsParticipated" render={({ field }) => (
                <FormItem>
                  <FormLabel>Yarışmalar / Turnuvalar</FormLabel>
                  <FormControl><Input {...field} placeholder="TÜBİTAK, Olimpiyat... (virgülle ayırın)" className="h-10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="talentsAdditionalNotes" render={({ field }) => (
              <FormItem className="border-t pt-4">
                <FormLabel>Ek Notlar</FormLabel>
                <FormControl><Textarea {...field} placeholder="Yetenek ve ilgilerle ilgili ek açıklamalar..." className="min-h-[80px]" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
