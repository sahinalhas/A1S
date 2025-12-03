import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { EnhancedTextarea } from "@/components/molecules/EnhancedTextarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/organisms/Form";
import { useForm } from "react-hook-form";
import { Palette, Edit, Plus } from "lucide-react";
import { holisticProfileApi } from "@/lib/api/endpoints/holistic-profile.api";
import type { StudentInterest } from "@shared/types";

export default function InterestsSection({ studentId, onUpdate }: { studentId: string; onUpdate: () => void }) {
 const [data, setData] = useState<StudentInterest | null>(null);
 const [isEditing, setIsEditing] = useState(false);
 const form = useForm();

 useEffect(() => {
 holisticProfileApi.getLatestInterest(studentId).then(d => {
 if (d) { setData(d); form.reset(d); } else { setIsEditing(true); }
 }).catch(console.error);
 }, [studentId]);

 const onSubmit = async (formData: any) => {
 try {
 if (data?.id) {
 await holisticProfileApi.updateInterest(data.id, formData);
 } else {
 await holisticProfileApi.createInterest({ studentId, assessmentDate: new Date().toISOString(), ...formData });
 }
 const updated = await holisticProfileApi.getLatestInterest(studentId);
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
 <Palette className="h-5 w-5" />İlgi Alanları & Yetenekler
 </CardTitle>
 <CardDescription>Hobiler, tutkular, özel yetenekler ve ilgi alanları</CardDescription>
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
 <FormField control={form.control} name="hobbies" render={({ field }) => (
 <FormItem>
 <FormLabel>Hobiler</FormLabel>
 <FormControl><EnhancedTextarea placeholder="Öğrencinin hobileri..." {...field} aiContext="notes" /></FormControl>
 </FormItem>
 )} />
 <FormField control={form.control} name="passions" render={({ field }) => (
 <FormItem>
 <FormLabel>Tutkular</FormLabel>
 <FormControl><EnhancedTextarea placeholder="Tutkuyla ilgilendiği alanlar..." {...field} aiContext="notes" /></FormControl>
 </FormItem>
 )} />
 <FormField control={form.control} name="favoriteSubjects" render={({ field }) => (
 <FormItem>
 <FormLabel>Favori Dersler</FormLabel>
 <FormControl><EnhancedTextarea placeholder="En çok sevdiği dersler..." {...field} aiContext="notes" /></FormControl>
 </FormItem>
 )} />
 <FormField control={form.control} name="specialTalents" render={({ field }) => (
 <FormItem>
 <FormLabel>Özel Yetenekler</FormLabel>
 <FormControl><EnhancedTextarea placeholder="Özel beceri ve yetenekler..." {...field} aiContext="notes" /></FormControl>
 </FormItem>
 )} />
 <FormField control={form.control} name="sportsActivities" render={({ field }) => (
 <FormItem>
 <FormLabel>Spor Aktiviteleri</FormLabel>
 <FormControl><EnhancedTextarea placeholder="Spor ve fiziksel aktiviteler..." {...field} aiContext="notes" /></FormControl>
 </FormItem>
 )} />
 <FormField control={form.control} name="clubMemberships" render={({ field }) => (
 <FormItem>
 <FormLabel>Kulüp Üyelikleri</FormLabel>
 <FormControl><EnhancedTextarea placeholder="Okul kulüpleri, topluluklar..." {...field} aiContext="notes" /></FormControl>
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
 {data.hobbies && <div><strong>Hobiler:</strong> {data.hobbies}</div>}
 {data.passions && <div><strong>Tutkular:</strong> {data.passions}</div>}
 {data.favoriteSubjects && <div><strong>Favori Dersler:</strong> {data.favoriteSubjects}</div>}
 {data.specialTalents && <div><strong>Özel Yetenekler:</strong> {data.specialTalents}</div>}
 {data.sportsActivities && <div><strong>Spor Aktiviteleri:</strong> {data.sportsActivities}</div>}
 {data.clubMemberships && <div><strong>Kulüp Üyelikleri:</strong> {data.clubMemberships}</div>}
 </div>
 ) : <p className="text-sm text-muted-foreground">Henüz veri yok.</p>}
 </CardContent>
 </Card>
 );
}
