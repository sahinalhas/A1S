import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronDown, X, Loader2, Calendar as CalendarIcon, Clock, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/organisms/Dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { EnhancedTextarea } from "@/components/molecules/EnhancedTextarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/organisms/Popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/organisms/Command";
import { Badge } from "@/components/atoms/Badge";
import { Calendar } from "@/components/organisms/Calendar";
import { Separator } from "@/components/atoms/Separator";

import { reminderSchema, type ReminderFormValues, type Student } from "./types";

interface ReminderDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 students: Student[];
 onSubmit: (data: ReminderFormValues) => void;
 isPending: boolean;
 initialData?: Partial<ReminderFormValues> & { id?: string };
}

const reminderTypeLabels = {
 planned_session:"Planlı Görüşme",
 follow_up:"Takip Görüşmesi",
 parent_meeting:"Veli Görüşmesi",
};

export default function ReminderDialog({
 open,
 onOpenChange,
 students,
 onSubmit,
 isPending,
 initialData,
}: ReminderDialogProps) {
 const [studentSearchOpen, setStudentSearchOpen] = useState(false);
 const [dateOpen, setDateOpen] = useState(false);
 const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

 const form = useForm<ReminderFormValues>({
 resolver: zodResolver(reminderSchema) as any,
 defaultValues: {
 reminderType: initialData?.reminderType ||"planned_session",
 reminderDate: initialData?.reminderDate || new Date(),
 reminderTime: initialData?.reminderTime || new Date().toTimeString().slice(0, 5),
 title: initialData?.title ||"",
 description: initialData?.description ||"",
 studentIds: initialData?.studentIds || [],
 },
 });

 const handleClose = () => {
 onOpenChange(false);
 form.reset();
 setSelectedStudents([]);
 };

 const handleSubmit = (data: ReminderFormValues) => {
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
 <Bell className="h-5 w-5" />
 {initialData?.id ?"Hatırlatmayı Düzenle" :"Yeni Hatırlatma"}
 </DialogTitle>
 <DialogDescription>
 Gelecekteki bir görüşme için hatırlatma oluşturun
 </DialogDescription>
 </DialogHeader>

 <Form {...form}>
 <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
 <div className="space-y-4">
 <FormField
 control={form.control}
 name="reminderType"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Hatırlatma Tipi *</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl>
 <SelectTrigger className="h-11">
 <SelectValue />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 <SelectItem value="planned_session">Planlı Görüşme</SelectItem>
 <SelectItem value="follow_up">Takip Görüşmesi</SelectItem>
 <SelectItem value="parent_meeting">Veli Görüşmesi</SelectItem>
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="title"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Başlık *</FormLabel>
 <FormControl>
 <Input {...field} placeholder="Hatırlatma başlığı" className="h-11" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="studentIds"
 render={({ field }) => (
 <FormItem className="flex flex-col">
 <FormLabel>Öğrenciler * ({selectedStudents.length} seçili)</FormLabel>
 <Popover open={studentSearchOpen} onOpenChange={setStudentSearchOpen}>
 <PopoverTrigger asChild>
 <FormControl>
 <Button
 variant="outline"
 role="combobox"
 className={cn(
"justify-between h-11",
 selectedStudents.length === 0 &&"text-muted-foreground"
 )}
 >
 {selectedStudents.length > 0
 ? `${selectedStudents.length} öğrenci seçildi`
 :"Öğrenci seçin"}
 <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
 </Button>
 </FormControl>
 </PopoverTrigger>
 <PopoverContent className="w-[400px] p-0">
 <Command>
 <CommandInput placeholder="Öğrenci ara..." />
 <CommandList>
 <CommandEmpty>Öğrenci bulunamadı.</CommandEmpty>
 <CommandGroup>
 {students.map((student) => {
 const isSelected = selectedStudents.some(s => s.id === student.id);
 return (
 <CommandItem
 key={student.id}
 value={`${student.name} ${student.surname}`}
 onSelect={() => {
 if (isSelected) {
 const updated = selectedStudents.filter(s => s.id !== student.id);
 setSelectedStudents(updated);
 field.onChange(updated.map(s => s.id));
 } else {
 const updated = [...selectedStudents, student];
 setSelectedStudents(updated);
 field.onChange(updated.map(s => s.id));
 }
 }}
 >
 <Check
 className={cn(
"mr-2 h-4 w-4",
 isSelected ?"opacity-100" :"opacity-0"
 )}
 />
 <div>
 <p className="font-medium">{student.name} {student.surname}</p>
 <p className="text-sm text-muted-foreground">{student.className}</p>
 </div>
 </CommandItem>
 );
 })}
 </CommandGroup>
 </CommandList>
 </Command>
 </PopoverContent>
 </Popover>
 {selectedStudents.length > 0 && (
 <div className="flex flex-wrap gap-2 mt-2">
 {selectedStudents.map((student) => (
 <Badge key={student.id} variant="secondary" className="gap-1">
 {student.name} {student.surname}
 <X
 className="h-3 w-3 cursor-pointer"
 onClick={() => {
 const updated = selectedStudents.filter(s => s.id !== student.id);
 setSelectedStudents(updated);
 field.onChange(updated.map(s => s.id));
 }}
 />
 </Badge>
 ))}
 </div>
 )}
 <FormMessage />
 </FormItem>
 )}
 />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <FormField
 control={form.control}
 name="reminderDate"
 render={({ field }) => (
 <FormItem className="flex flex-col">
 <FormLabel>Hatırlatma Tarihi *</FormLabel>
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
 name="reminderTime"
 render={({ field }) => (
 <FormItem className="flex flex-col">
 <FormLabel>Hatırlatma Saati *</FormLabel>
 <FormControl>
 <div className="relative">
 <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input 
 type="time" 
 {...field} 
 className="pl-10 h-11"
 />
 </div>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <FormField
 control={form.control}
 name="description"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Açıklama (Opsiyonel)</FormLabel>
 <FormControl>
 <EnhancedTextarea 
 {...field} 
 placeholder="Hatırlatma hakkında ek bilgiler..."
 rows={3}
 className="resize-none"
 aiContext="notes"
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
