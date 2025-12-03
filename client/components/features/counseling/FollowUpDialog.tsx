import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Calendar as CalendarIcon, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/organisms/Dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/organisms/Popover";
import { Calendar } from "@/components/organisms/Calendar";
import { Badge } from "@/components/atoms/Badge";

import { followUpSchema, type FollowUpFormValues } from "./types";

interface FollowUpDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 onSubmit: (data: FollowUpFormValues) => void;
 isPending: boolean;
 initialData?: Partial<FollowUpFormValues> & { id?: string };
}

const priorityConfig = {
 low: { label:"Düşük", variant:"secondary" as const, color:"bg-blue-100 text-blue-800" },
 medium: { label:"Orta", variant:"default" as const, color:"bg-yellow-100 text-yellow-800" },
 high: { label:"Yüksek", variant:"default" as const, color:"bg-orange-100 text-orange-800" },
 urgent: { label:"Acil", variant:"destructive" as const, color:"bg-red-100 text-red-800" },
};

export default function FollowUpDialog({
 open,
 onOpenChange,
 onSubmit,
 isPending,
 initialData,
}: FollowUpDialogProps) {
 const [dateOpen, setDateOpen] = useState(false);

 const form = useForm<FollowUpFormValues>({
 resolver: zodResolver(followUpSchema),
 defaultValues: {
 followUpDate: initialData?.followUpDate || new Date(),
 assignedTo: initialData?.assignedTo ||"",
 priority: initialData?.priority ||"medium",
 actionItems: initialData?.actionItems ||"",
 notes: initialData?.notes ||"",
 },
 });

 const selectedPriority = form.watch("priority");

 const handleClose = () => {
 onOpenChange(false);
 form.reset();
 };

 const handleSubmit = (data: FollowUpFormValues) => {
 onSubmit(data);
 if (!isPending) {
 handleClose();
 }
 };

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2">
 <CheckSquare className="h-5 w-5" />
 {initialData?.id ?"Takibi Düzenle" :"Yeni Takip"}
 </DialogTitle>
 <DialogDescription>
 Yapılacak işler ve takip için görev oluşturun
 </DialogDescription>
 </DialogHeader>

 <Form {...form}>
 <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
 <div className="space-y-4">
 <FormField
 control={form.control}
 name="assignedTo"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Atanan Kişi *</FormLabel>
 <FormControl>
 <Input {...field} placeholder="Rehber öğretmen adı" className="h-11" />
 </FormControl>
 <FormDescription>
 Bu görevi takip edecek kişinin adı
 </FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
"justify-start text-left font-normal h-11",
 !field.value &&"text-muted-foreground"
 )}
 >
 <CalendarIcon className="mr-2 h-4 w-4" />
 {field.value ? (
 format(field.value,"d MMMM yyyy, EEEE", { locale: tr })
 ) : (
 <span>Tarih seçin</span>
 )}
 </Button>
 </FormControl>
 </PopoverTrigger>
 <PopoverContent className="w-auto p-0" align="start">
 <Calendar
 mode="single"
 selected={field.value}
 onSelect={(date) => {
 if (date) {
 field.onChange(date);
 setDateOpen(false);
 }
 }}
 initialFocus
 />
 </PopoverContent>
 </Popover>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="priority"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Öncelik *</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl>
 <SelectTrigger className="h-11">
 <SelectValue />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 {Object.entries(priorityConfig).map(([value, config]) => (
 <SelectItem key={value} value={value}>
 <div className="flex items-center gap-2">
 <div className={cn("w-2 h-2 rounded-full", config.color)} />
 {config.label}
 </div>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <FormDescription>
 <Badge variant={priorityConfig[selectedPriority].variant} className="mt-1">
 {priorityConfig[selectedPriority].label}
 </Badge>
 </FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <FormField
 control={form.control}
 name="actionItems"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Yapılacaklar *</FormLabel>
 <FormControl>
 <Textarea 
 {...field} 
 placeholder="• İlk yapılacak iş&#10;• İkinci yapılacak iş&#10;• Üçüncü yapılacak iş"
 rows={5}
 className="resize-none font-mono"
 />
 </FormControl>
 <FormDescription>
 Takip için yapılması gereken işleri listeleyin
 </FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="notes"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Notlar (Opsiyonel)</FormLabel>
 <FormControl>
 <Textarea 
 {...field} 
 placeholder="Ek notlar, açıklamalar veya hatırlatmalar..."
 rows={3}
 className="resize-none"
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <DialogFooter className="gap-2">
 <Button 
 type="button" 
 variant="outline" 
 onClick={handleClose}
 disabled={isPending}
 >
 İptal
 </Button>
 <Button 
 type="submit" 
 disabled={isPending}
 >
 {isPending && (
 <Loader2 className="mr-2 h-4 w-4" />
 )}
 {initialData?.id ?"Güncelle" :"Oluştur"}
 </Button>
 </DialogFooter>
 </form>
 </Form>
 </DialogContent>
 </Dialog>
 );
}
