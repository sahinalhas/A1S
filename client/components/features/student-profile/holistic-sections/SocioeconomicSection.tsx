import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { EnhancedTextarea } from "@/components/molecules/EnhancedTextarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { useForm } from "react-hook-form";
import { DollarSign, Edit, Plus, Lock } from "lucide-react";
import { holisticProfileApi } from "@/lib/api/endpoints/holistic-profile.api";
import type { StudentSocioeconomic } from "@shared/types";

export default function SocioeconomicSection({ studentId, onUpdate }: { studentId: string; onUpdate: () => void }) {
 const [data, setData] = useState<StudentSocioeconomic | null>(null);
 const [isEditing, setIsEditing] = useState(false);
 const form = useForm();

 useEffect(() => {
 holisticProfileApi.getLatestSocioeconomic(studentId).then(d => {
 if (d) { setData(d); form.reset(d); } else { setIsEditing(true); }
 }).catch(console.error);
 }, [studentId]);

 const onSubmit = async (formData: any) => {
 try {
 if (data?.id) {
 await holisticProfileApi.updateSocioeconomic(data.id, formData);
 } else {
 await holisticProfileApi.createSocioeconomic({ studentId, assessmentDate: new Date().toISOString(), ...formData });
 }
 const updated = await holisticProfileApi.getLatestSocioeconomic(studentId);
 setData(updated);
 setIsEditing(false);
 onUpdate();
 } catch (error) {
 console.error(error);
 }
 };

 return (
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="flex items-center gap-2">
 <DollarSign className="h-5 w-5" />Sosyoekonomik Faktörler
 <Lock className="h-4 w-4 text-muted-foreground" />
 </CardTitle>
 <CardDescription>Aile ekonomik durumu, kaynaklar ve destekler (Gizli)</CardDescription>
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
 <FormField control={form.control} name="familyIncomeLevel" render={({ field }) => (
 <FormItem>
 <FormLabel>Aile Gelir Düzeyi</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
 <SelectContent>
 {['ÇOK_DÜŞÜK', 'DÜŞÜK', 'ORTA', 'İYİ', 'YÜKSEK'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
 </SelectContent>
 </Select>
 </FormItem>
 )} />
 <FormField control={form.control} name="householdSize" render={({ field }) => (
 <FormItem>
 <FormLabel>Hane Büyüklüğü</FormLabel>
 <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
 </FormItem>
 )} />
 <FormField control={form.control} name="numberOfSiblings" render={({ field }) => (
 <FormItem>
 <FormLabel>Kardeş Sayısı</FormLabel>
 <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
 </FormItem>
 )} />
 
 <FormField control={form.control} name="fatherOccupation" render={({ field }) => (
 <FormItem>
 <FormLabel>Baba Mesleği</FormLabel>
 <FormControl><Input placeholder="Meslek bilgisi" {...field} /></FormControl>
 </FormItem>
 )} />
 
 <FormField control={form.control} name="motherOccupation" render={({ field }) => (
 <FormItem>
 <FormLabel>Anne Mesleği</FormLabel>
 <FormControl><Input placeholder="Meslek bilgisi" {...field} /></FormControl>
 </FormItem>
 )} />
 <FormField control={form.control} name="studySpaceAvailability" render={({ field }) => (
 <FormItem>
 <FormLabel>Çalışma Alanı</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
 <SelectContent>
 {['YOK', 'PAYLAŞIMLI', 'KENDİ_ODASI', 'ÖZEL_ÇALIŞMA_ALANI'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
 </SelectContent>
 </Select>
 </FormItem>
 )} />
 <FormField control={form.control} name="internetAccess" render={({ field }) => (
 <FormItem>
 <FormLabel>İnternet Erişimi</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
 <SelectContent>
 {['YOK', 'SINIRLI', 'YETERLİ', 'İYİ'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
 </SelectContent>
 </Select>
 </FormItem>
 )} />
 <FormField control={form.control} name="financialBarriers" render={({ field }) => (
 <FormItem>
 <FormLabel>Finansal Engeller</FormLabel>
 <FormControl><EnhancedTextarea placeholder="Maddi zorluklar, engeller..." {...field} aiContext="notes" /></FormControl>
 </FormItem>
 )} />
 <FormField control={form.control} name="resourcesAndSupports" render={({ field }) => (
 <FormItem>
 <FormLabel>Kaynaklar ve Destekler</FormLabel>
 <FormControl><EnhancedTextarea placeholder="Mevcut kaynaklar, alınan destekler..." {...field} aiContext="notes" /></FormControl>
 </FormItem>
 )} />
 <FormField control={form.control} name="notes" render={({ field }) => (
 <FormItem>
 <FormLabel>Notlar (Gizli)</FormLabel>
 <FormControl><EnhancedTextarea {...field} aiContext="notes" /></FormControl>
 </FormItem>
 )} />
 <Button type="submit">Kaydet</Button>
 </form>
 </Form>
 ) : data ? (
 <div className="space-y-3">
 {data.familyIncomeLevel && <div><strong>Gelir Düzeyi:</strong> {data.familyIncomeLevel}</div>}
 {data.householdSize && <div><strong>Hane Büyüklüğü:</strong> {data.householdSize}</div>}
 {data.numberOfSiblings !== undefined && <div><strong>Kardeş Sayısı:</strong> {data.numberOfSiblings}</div>}
 {data.studySpaceAvailability && <div><strong>Çalışma Alanı:</strong> {data.studySpaceAvailability}</div>}
 {data.internetAccess && <div><strong>İnternet Erişimi:</strong> {data.internetAccess}</div>}
 {data.financialBarriers && <div><strong>Finansal Engeller:</strong> {data.financialBarriers}</div>}
 {data.resourcesAndSupports && <div><strong>Kaynaklar:</strong> {data.resourcesAndSupports}</div>}
 </div>
 ) : <p className="text-sm text-muted-foreground">Henüz veri yok.</p>}
 </CardContent>
 </Card>
 );
}
