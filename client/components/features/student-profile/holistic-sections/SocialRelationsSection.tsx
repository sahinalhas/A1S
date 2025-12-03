import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { EnhancedTextarea } from "@/components/molecules/EnhancedTextarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/organisms/Form";
import { useForm } from "react-hook-form";
import { Users2, Edit, Plus } from "lucide-react";
import { holisticProfileApi } from "@/lib/api/endpoints/holistic-profile.api";
import type { StudentSocialRelation } from "@shared/types";

export default function SocialRelationsSection({ studentId, onUpdate }: { studentId: string; onUpdate: () => void }) {
 const [data, setData] = useState<StudentSocialRelation | null>(null);
 const [isEditing, setIsEditing] = useState(false);
 const form = useForm();

 useEffect(() => {
 holisticProfileApi.getLatestSocialRelation(studentId).then(d => {
 if (d) { setData(d); form.reset(d); } else { setIsEditing(true); }
 }).catch(console.error);
 }, [studentId]);

 const onSubmit = async (formData: any) => {
 try {
 if (data?.id) {
 await holisticProfileApi.updateSocialRelation(data.id, formData);
 } else {
 await holisticProfileApi.createSocialRelation({ studentId, assessmentDate: new Date().toISOString(), ...formData });
 }
 const updated = await holisticProfileApi.getLatestSocialRelation(studentId);
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
 <Users2 className="h-5 w-5" />Sosyal İlişkiler & Akran Etkileşimi
 </CardTitle>
 <CardDescription>Öğrencinin sosyal çevresi, arkadaşlık ilişkileri ve akran etkileşimleri</CardDescription>
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
 <FormField control={form.control} name="friendCircleSize" render={({ field }) => (
 <FormItem>
 <FormLabel>Arkadaş Çevresi Büyüklüğü</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
 <SelectContent>
 {['YOK', 'AZ', 'ORTA', 'GENİŞ'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
 </SelectContent>
 </Select>
 </FormItem>
 )} />
 <FormField control={form.control} name="socialRole" render={({ field }) => (
 <FormItem>
 <FormLabel>Sosyal Rol</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
 <SelectContent>
 {['LİDER', 'AKTİF_ÜYE', 'TAKİPÇİ', 'GÖZLEMCİ', 'İZOLE'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
 </SelectContent>
 </Select>
 </FormItem>
 )} />
 <FormField control={form.control} name="bullyingStatus" render={({ field }) => (
 <FormItem>
 <FormLabel>Zorbalık Durumu</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
 <SelectContent>
 {['YOK', 'MAĞDUR', 'FAİL', 'HER_İKİSİ', 'GÖZLEMCİ'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
 </SelectContent>
 </Select>
 </FormItem>
 )} />
 <FormField control={form.control} name="socialGroupDynamics" render={({ field }) => (
 <FormItem>
 <FormLabel>Sosyal Grup Dinamikleri</FormLabel>
 <FormControl><EnhancedTextarea {...field} aiContext="notes" /></FormControl>
 </FormItem>
 )} />
 <FormField control={form.control} name="notes" render={({ field }) => (
 <FormItem>
 <FormLabel>Notlar</FormLabel>
 <FormControl><EnhancedTextarea {...field} aiContext="notes" /></FormControl>
 </FormItem>
 )} />
 <Button type="submit">Kaydet</Button>
 </form>
 </Form>
 ) : data ? (
 <div className="space-y-3">
 {data.friendCircleSize && <div><strong>Arkadaş Çevresi:</strong> {data.friendCircleSize}</div>}
 {data.socialRole && <div><strong>Sosyal Rol:</strong> {data.socialRole}</div>}
 {data.bullyingStatus && <div><strong>Zorbalık Durumu:</strong> {data.bullyingStatus}</div>}
 {data.socialGroupDynamics && <div><strong>Sosyal Grup:</strong> {data.socialGroupDynamics}</div>}
 {data.notes && <div><strong>Notlar:</strong> {data.notes}</div>}
 </div>
 ) : <p className="text-sm text-muted-foreground">Henüz veri yok.</p>}
 </CardContent>
 </Card>
 );
}
