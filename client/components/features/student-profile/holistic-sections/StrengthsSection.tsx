import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { EnhancedTextarea } from "@/components/molecules/EnhancedTextarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Sparkles, Plus, Edit, Trash2 } from "lucide-react";
import { holisticProfileApi } from "@/lib/api/endpoints/holistic-profile.api";
import type { StudentStrength } from "@shared/types";

const strengthSchema = z.object({
 personalStrengths: z.string().optional(),
 academicStrengths: z.string().optional(),
 socialStrengths: z.string().optional(),
 creativeStrengths: z.string().optional(),
 physicalStrengths: z.string().optional(),
 successStories: z.string().optional(),
 resilienceFactors: z.string().optional(),
 supportSystems: z.string().optional(),
 skills: z.string().optional(),
 talents: z.string().optional(),
 notes: z.string().optional(),
});

type StrengthFormValues = z.infer<typeof strengthSchema>;

interface StrengthsSectionProps {
 studentId: string;
 onUpdate: () => void;
}

export default function StrengthsSection({ studentId, onUpdate }: StrengthsSectionProps) {
 const [strength, setStrength] = useState<StudentStrength | null>(null);
 const [isEditing, setIsEditing] = useState(false);
 const [loading, setLoading] = useState(true);

 const form = useForm<StrengthFormValues>({
 resolver: zodResolver(strengthSchema),
 defaultValues: {},
 });

 const loadData = async () => {
 try {
 setLoading(true);
 const data = await holisticProfileApi.getLatestStrength(studentId);
 if (data) {
 setStrength(data);
 form.reset(data);
 } else {
 setIsEditing(true);
 }
 } catch (error) {
 console.error("Error loading strengths:", error);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 loadData();
 }, [studentId]);

 const onSubmit = async (data: StrengthFormValues) => {
 try {
 if (strength?.id) {
 await holisticProfileApi.updateStrength(strength.id, data);
 } else {
 await holisticProfileApi.createStrength({
 studentId,
 assessmentDate: new Date().toISOString(),
 ...data,
 });
 }
 await loadData();
 setIsEditing(false);
 onUpdate();
 } catch (error) {
 toast.error("Kayıt sırasında hata oluştu");
 console.error("Error saving strength:", error);
 }
 };

 if (loading) {
 return <Card><CardContent className="p-6">Yükleniyor...</CardContent></Card>;
 }

 return (
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="flex items-center gap-2">
 <Sparkles className="h-5 w-5" />
 Güçlü Yönler & Kaynaklar
 </CardTitle>
 <CardDescription>Öğrencinin güçlü yanları, yetenekleri ve destek sistemleri</CardDescription>
 </div>
 <div className="flex gap-2">
 {!isEditing && strength && (
 <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
 <Edit className="h-4 w-4 mr-2" /> Düzenle
 </Button>
 )}
 {!isEditing && !strength && (
 <Button size="sm" onClick={() => setIsEditing(true)}>
 <Plus className="h-4 w-4 mr-2" /> Yeni Ekle
 </Button>
 )}
 </div>
 </div>
 </CardHeader>
 <CardContent>
 {isEditing ? (
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
 <FormField
 control={form.control}
 name="personalStrengths"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Kişisel Güçlü Yönler</FormLabel>
 <FormControl>
 <EnhancedTextarea placeholder="Karakter, değerler, kişilik özellikleri..." {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="academicStrengths"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Akademik Güçlü Yönler</FormLabel>
 <FormControl>
 <EnhancedTextarea placeholder="Başarılı olduğu dersler, yetenekler..." {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="socialStrengths"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Sosyal Güçlü Yönler</FormLabel>
 <FormControl>
 <EnhancedTextarea placeholder="İlişki kurma, iletişim, empati..." {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="skills"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Beceriler & Yetenekler</FormLabel>
 <FormControl>
 <EnhancedTextarea placeholder="Özel beceriler, yetenekler..." {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="successStories"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Başarı Hikayeleri</FormLabel>
 <FormControl>
 <EnhancedTextarea placeholder="Öğrencinin başarı öyküleri, gurur duyduğu anlar..." {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="supportSystems"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Destek Sistemleri</FormLabel>
 <FormControl>
 <EnhancedTextarea placeholder="Aile, arkadaşlar, mentorlar..." {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="notes"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Notlar</FormLabel>
 <FormControl>
 <EnhancedTextarea placeholder="Ek notlar..." {...field} aiContext="notes" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <div className="flex gap-2">
 <Button type="submit">Kaydet</Button>
 {strength && (
 <Button type="button" variant="outline" onClick={() => {
 setIsEditing(false);
 form.reset(strength);
 }}>
 İptal
 </Button>
 )}
 </div>
 </form>
 </Form>
 ) : strength ? (
 <div className="space-y-4">
 {strength.personalStrengths && (
 <div>
 <h4 className="font-medium mb-1">Kişisel Güçlü Yönler</h4>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">{strength.personalStrengths}</p>
 </div>
 )}
 {strength.academicStrengths && (
 <div>
 <h4 className="font-medium mb-1">Akademik Güçlü Yönler</h4>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">{strength.academicStrengths}</p>
 </div>
 )}
 {strength.socialStrengths && (
 <div>
 <h4 className="font-medium mb-1">Sosyal Güçlü Yönler</h4>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">{strength.socialStrengths}</p>
 </div>
 )}
 {strength.skills && (
 <div>
 <h4 className="font-medium mb-1">Beceriler & Yetenekler</h4>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">{strength.skills}</p>
 </div>
 )}
 {strength.successStories && (
 <div>
 <h4 className="font-medium mb-1">Başarı Hikayeleri</h4>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">{strength.successStories}</p>
 </div>
 )}
 {strength.supportSystems && (
 <div>
 <h4 className="font-medium mb-1">Destek Sistemleri</h4>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">{strength.supportSystems}</p>
 </div>
 )}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">Henüz güçlü yönler kaydedilmemiş.</p>
 )}
 </CardContent>
 </Card>
 );
}
