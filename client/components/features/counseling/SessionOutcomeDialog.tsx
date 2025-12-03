import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Calendar as CalendarIcon, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/organisms/Dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { EnhancedTextarea } from "@/components/molecules/EnhancedTextarea";
import { Button } from "@/components/atoms/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/organisms/Popover";
import { Calendar } from "@/components/organisms/Calendar";
import { Separator } from "@/components/atoms/Separator";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Label } from "@/components/atoms/Label";

import { outcomeSchema, type OutcomeFormValues, type CounselingSession } from "./types";

interface SessionOutcomeDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 session: CounselingSession | null;
 onSubmit: (data: OutcomeFormValues) => void;
 isPending: boolean;
 initialData?: Partial<OutcomeFormValues> & { id?: string };
}

export default function SessionOutcomeDialog({
 open,
 onOpenChange,
 session,
 onSubmit,
 isPending,
 initialData,
}: SessionOutcomeDialogProps) {
 const [dateOpen, setDateOpen] = useState(false);
 const [rating, setRating] = useState<number | undefined>(initialData?.effectivenessRating);

 const form = useForm<OutcomeFormValues>({
 resolver: zodResolver(outcomeSchema) as any,
 defaultValues: {
 sessionId: session?.id || initialData?.sessionId ||"",
 effectivenessRating: initialData?.effectivenessRating,
 progressNotes: initialData?.progressNotes ||"",
 goalsAchieved: initialData?.goalsAchieved ||"",
 nextSteps: initialData?.nextSteps ||"",
 recommendations: initialData?.recommendations ||"",
 followUpRequired: initialData?.followUpRequired || false,
 followUpDate: initialData?.followUpDate ? new Date(initialData.followUpDate) : undefined,
 },
 });

 const followUpRequired = form.watch("followUpRequired");

 useEffect(() => {
 if (open && (session || initialData)) {
 const formData = {
 sessionId: session?.id || initialData?.sessionId ||"",
 effectivenessRating: initialData?.effectivenessRating,
 progressNotes: initialData?.progressNotes ||"",
 goalsAchieved: initialData?.goalsAchieved ||"",
 nextSteps: initialData?.nextSteps ||"",
 recommendations: initialData?.recommendations ||"",
 followUpRequired: initialData?.followUpRequired || false,
 followUpDate: initialData?.followUpDate ? new Date(initialData.followUpDate) : undefined,
 };
 form.reset(formData);
 setRating(initialData?.effectivenessRating);
 }
 }, [open, session, initialData]);

 const handleClose = () => {
 onOpenChange(false);
 form.reset({
 sessionId:"",
 effectivenessRating: undefined,
 progressNotes:"",
 goalsAchieved:"",
 nextSteps:"",
 recommendations:"",
 followUpRequired: false,
 followUpDate: undefined,
 });
 setRating(undefined);
 };

 const handleSubmit = (data: OutcomeFormValues) => {
 onSubmit(data);
 if (!isPending) {
 handleClose();
 }
 };

 const handleRatingChange = (value: number) => {
 setRating(value);
 form.setValue("effectivenessRating", value);
 };

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2">
 <CheckCircle2 className="h-5 w-5" />
 {initialData?.id ?"Görüşme Sonucunu Düzenle" :"Görüşme Sonucu Ekle"}
 </DialogTitle>
 <DialogDescription>
 {session && (
 <div className="mt-2 space-y-1 text-sm">
 <div><strong>Görüşme:</strong> {session.topic}</div>
 <div><strong>Tarih:</strong> {format(new Date(session.sessionDate), 'dd MMMM yyyy', { locale: tr })}</div>
 {session.student && <div><strong>Öğrenci:</strong> {session.student.name} {session.student.surname}</div>}
 {session.groupName && <div><strong>Grup:</strong> {session.groupName}</div>}
 </div>
 )}
 </DialogDescription>
 </DialogHeader>

 <Form {...form}>
 <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
 <div className="space-y-4">
 <FormField
 control={form.control}
 name="effectivenessRating"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Etkinlik Değerlendirmesi</FormLabel>
 <FormControl>
 <div className="flex items-center gap-2">
 {[1, 2, 3, 4, 5].map((value) => (
 <button
 key={value}
 type="button"
 onClick={() => handleRatingChange(value)}
 className={cn(
"p-2 rounded",
 rating && rating >= value
 ?"text-yellow-500"
 :"text-gray-300"
 )}
 >
 <Star className="h-8 w-8 fill-current" />
 </button>
 ))}
 {rating && (
 <span className="ml-2 text-sm text-muted-foreground">
 {rating}/5
 </span>
 )}
 </div>
 </FormControl>
 <FormDescription>
 Görüşmenin ne kadar etkili olduğunu değerlendirin (1-5)
 </FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />

 <Separator />

 <FormField
 control={form.control}
 name="progressNotes"
 render={({ field }) => (
 <FormItem>
 <FormLabel>İlerleme Notları</FormLabel>
 <FormControl>
 <EnhancedTextarea
 {...field}
 placeholder="Öğrencinin gösterdiği ilerleme ve gelişim hakkında notlar..."
 className="min-h-[100px] resize-y"
 aiContext="counseling"
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="goalsAchieved"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Ulaşılan Hedefler</FormLabel>
 <FormControl>
 <EnhancedTextarea
 {...field}
 placeholder="Bu görüşmede ulaşılan hedefler ve başarılar..."
 className="min-h-[100px] resize-y"
 aiContext="counseling"
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="nextSteps"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Sonraki Adımlar</FormLabel>
 <FormControl>
 <EnhancedTextarea
 {...field}
 placeholder="Öğrenci için önerilen sonraki adımlar..."
 className="min-h-[100px] resize-y"
 aiContext="counseling"
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="recommendations"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Öneriler ve Tavsiyeler</FormLabel>
 <FormControl>
 <EnhancedTextarea
 {...field}
 placeholder="Öğrenci, veli veya öğretmenler için öneriler..."
 className="min-h-[100px] resize-y"
 aiContext="counseling"
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <Separator />

 <FormField
 control={form.control}
 name="followUpRequired"
 render={({ field }) => (
 <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
 <FormControl>
 <Checkbox
 checked={field.value}
 onCheckedChange={field.onChange}
 />
 </FormControl>
 <div className="space-y-1 leading-none">
 <FormLabel>Takip Görüşmesi Gerekli</FormLabel>
 <FormDescription>
 Bu görüşme için takip görüşmesi planlanmalı mı?
 </FormDescription>
 </div>
 </FormItem>
 )}
 />

 {followUpRequired && (
 <FormField
 control={form.control}
 name="followUpDate"
 render={({ field }) => (
 <FormItem className="flex flex-col">
 <FormLabel>Takip Tarihi *</FormLabel>
 <Popover open={dateOpen} onOpenChange={setDateOpen}>
 <PopoverTrigger asChild>
 <FormControl>
 <Button
 variant="outline"
 className={cn(
"w-full h-11 pl-3 text-left font-normal",
 !field.value &&"text-muted-foreground"
 )}
 >
 {field.value ? (
 format(field.value,"PPP", { locale: tr })
 ) : (
 <span>Takip tarihi seçin</span>
 )}
 <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
 </Button>
 </FormControl>
 </PopoverTrigger>
 <PopoverContent className="w-auto p-0" align="start">
 <Calendar
 mode="single"
 selected={field.value}
 onSelect={(date) => {
 field.onChange(date);
 setDateOpen(false);
 }}
 disabled={(date) => date < new Date()}
 initialFocus
 locale={tr}
 />
 </PopoverContent>
 </Popover>
 <FormDescription>
 Takip görüşmesinin yapılacağı tarihi seçin
 </FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />
 )}
 </div>

 <DialogFooter className="gap-2">
 <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
 İptal
 </Button>
 <Button type="submit" disabled={isPending}>
 {isPending && <Loader2 className="mr-2 h-4 w-4" />}
 {initialData?.id ?"Güncelle" :"Kaydet"}
 </Button>
 </DialogFooter>
 </form>
 </Form>
 </DialogContent>
 </Dialog>
 );
}
