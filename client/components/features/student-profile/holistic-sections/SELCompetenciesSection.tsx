import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { EnhancedTextarea } from "@/components/molecules/EnhancedTextarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/organisms/Form";
import { useForm } from "react-hook-form";
import { Brain, Edit, Plus } from "lucide-react";
import { holisticProfileApi } from "@/lib/api/endpoints/holistic-profile.api";
import type { StudentSELCompetency } from "@shared/types";

export default function SELCompetenciesSection({ studentId, onUpdate }: { studentId: string; onUpdate: () => void }) {
 const [data, setData] = useState<StudentSELCompetency | null>(null);
 const [isEditing, setIsEditing] = useState(false);
 const form = useForm();

 useEffect(() => {
 holisticProfileApi.getLatestSELCompetency(studentId).then(d => {
 if (d) { setData(d); form.reset(d); } else { setIsEditing(true); }
 }).catch(console.error);
 }, [studentId]);

 const onSubmit = async (formData: any) => {
 try {
 if (data?.id) {
 await holisticProfileApi.updateSELCompetency(data.id, formData);
 } else {
 await holisticProfileApi.createSELCompetency({ studentId, assessmentDate: new Date().toISOString(), ...formData });
 }
 const updated = await holisticProfileApi.getLatestSELCompetency(studentId);
 setData(updated);
 setIsEditing(false);
 onUpdate();
 } catch (error) {
 console.error(error);
 }
 };

 const skillLevels = ['ZAYIF', 'GELİŞMEKTE', 'YETERLİ', 'İYİ', 'İLERİ'];

 return (
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="flex items-center gap-2">
 <Brain className="h-5 w-5" />Sosyal-Duygusal Yeterlikler (SEL)
 </CardTitle>
 <CardDescription>Duygu yönetimi, empati, problem çözme ve sosyal beceriler</CardDescription>
 </div>
 <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
 {isEditing ?"İptal" : data ? <><Edit className="h-4 w-4 mr-2" />Düzenle</> : <><Plus className="h-4 w-4 mr-2" />Ekle</>}
 </Button>
 </div>
 </CardHeader>
 <CardContent>
 {isEditing ? (
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
 <FormField control={form.control} name="emotionRecognition" render={({ field }) => (
 <FormItem>
 <FormLabel>Duygu Tanıma</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
 <SelectContent>
 {skillLevels.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
 </SelectContent>
 </Select>
 </FormItem>
 )} />
 <FormField control={form.control} name="emotionRegulation" render={({ field }) => (
 <FormItem>
 <FormLabel>Duygu Düzenleme</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
 <SelectContent>
 {skillLevels.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
 </SelectContent>
 </Select>
 </FormItem>
 )} />
 <FormField control={form.control} name="empathyLevel" render={({ field }) => (
 <FormItem>
 <FormLabel>Empati Seviyesi</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
 <SelectContent>
 {['ÇOK_DÜŞÜK', 'DÜŞÜK', 'ORTA', 'YÜKSEK', 'ÇOK_YÜKSEK'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
 </SelectContent>
 </Select>
 </FormItem>
 )} />
 <FormField control={form.control} name="problemSolvingSkills" render={({ field }) => (
 <FormItem>
 <FormLabel>Problem Çözme Becerileri</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
 <SelectContent>
 {skillLevels.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
 </SelectContent>
 </Select>
 </FormItem>
 )} />
 <FormField control={form.control} name="stressCoping" render={({ field }) => (
 <FormItem>
 <FormLabel>Stresle Başa Çıkma</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
 <SelectContent>
 {skillLevels.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
 </SelectContent>
 </Select>
 </FormItem>
 )} />
 <FormField control={form.control} name="stressManagementStrategies" render={({ field }) => (
 <FormItem>
 <FormLabel>Stres Yönetim Stratejileri</FormLabel>
 <FormControl><EnhancedTextarea placeholder="Kullandığı stratejiler..." {...field} aiContext="counseling" /></FormControl>
 </FormItem>
 )} />
 <FormField control={form.control} name="notes" render={({ field }) => (
 <FormItem>
 <FormLabel>Notlar</FormLabel>
 <FormControl><EnhancedTextarea {...field} aiContext="counseling" /></FormControl>
 </FormItem>
 )} />
 <Button type="submit">Kaydet</Button>
 </form>
 </Form>
 ) : data ? (
 <div className="space-y-3">
 {data.emotionRecognition && <div><strong>Duygu Tanıma:</strong> {data.emotionRecognition}</div>}
 {data.emotionRegulation && <div><strong>Duygu Düzenleme:</strong> {data.emotionRegulation}</div>}
 {data.empathyLevel && <div><strong>Empati:</strong> {data.empathyLevel}</div>}
 {data.problemSolvingSkills && <div><strong>Problem Çözme:</strong> {data.problemSolvingSkills}</div>}
 {data.stressCoping && <div><strong>Stresle Başa Çıkma:</strong> {data.stressCoping}</div>}
 {data.stressManagementStrategies && <div><strong>Stres Stratejileri:</strong> {data.stressManagementStrategies}</div>}
 </div>
 ) : <p className="text-sm text-muted-foreground">Henüz veri yok.</p>}
 </CardContent>
 </Card>
 );
}
