import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from '@/components/organisms/Dialog';
import {
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from '@/components/organisms/Form';
import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/atoms/Textarea';
import { Button } from '@/components/atoms/Button';
import { Calendar } from '@/components/organisms/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/organisms/Popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { cn } from '@/lib/utils';
import type { ExamSession } from '../../../shared/types/exam-management.types';

const formSchema = z.object({
 name: z.string().min(1, 'Sınav adı gereklidir').max(200, 'Sınav adı çok uzun'),
 exam_date: z.date({ required_error: 'Sınav tarihi gereklidir' }),
 description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ExamSessionDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 examTypeId: string;
 examTypeName: string;
 session?: ExamSession;
 onSave: (data: { name: string; exam_date: string; description?: string }) => Promise<void>;
}

export function ExamSessionDialog({
 open,
 onOpenChange,
 examTypeId,
 examTypeName,
 session,
 onSave,
}: ExamSessionDialogProps) {
 const [isSubmitting, setIsSubmitting] = useState(false);

 const form = useForm<FormValues>({
 resolver: zodResolver(formSchema),
 defaultValues: {
 name: '',
 exam_date: new Date(),
 description: '',
 },
 });

 useEffect(() => {
 if (session) {
 form.reset({
 name: session.name,
 exam_date: new Date(session.exam_date),
 description: session.description || '',
 });
 } else {
 form.reset({
 name: '',
 exam_date: new Date(),
 description: '',
 });
 }
 }, [session, form]);

 const onSubmit = async (values: FormValues) => {
 try {
 setIsSubmitting(true);
 await onSave({
 name: values.name,
 exam_date: format(values.exam_date, 'yyyy-MM-dd'),
 description: values.description,
 });
 form.reset();
 onOpenChange(false);
 } catch (error) {
 console.error('Error saving exam session:', error);
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="sm:max-w-[500px]">
 <DialogHeader>
 <DialogTitle>
 {session ? 'Deneme Sınavını Düzenle' : 'Yeni Deneme Sınavı Oluştur'}
 </DialogTitle>
 <DialogDescription>
 {examTypeName} için {session ? 'sınav bilgilerini güncelleyin' : 'yeni bir deneme sınavı oluşturun'}
 </DialogDescription>
 </DialogHeader>

 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
 <FormField
 control={form.control}
 name="name"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Sınav Adı</FormLabel>
 <FormControl>
 <Input placeholder="Örn: 1. Deneme Sınavı" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="exam_date"
 render={({ field }) => (
 <FormItem className="flex flex-col">
 <FormLabel>Sınav Tarihi</FormLabel>
 <Popover>
 <PopoverTrigger asChild>
 <FormControl>
 <Button
 variant="outline"
 className={cn(
 'w-full pl-3 text-left font-normal',
 !field.value && 'text-muted-foreground'
 )}
 >
 {field.value ? (
 format(field.value, 'PPP', { locale: tr })
 ) : (
 <span>Tarih seçin</span>
 )}
 <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
 </Button>
 </FormControl>
 </PopoverTrigger>
 <PopoverContent className="w-auto p-0" align="start">
 <Calendar
 mode="single"
 selected={field.value}
 onSelect={field.onChange}
 disabled={(date) =>
 date > new Date() || date < new Date('1900-01-01')
 }
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
 name="description"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Açıklama (İsteğe Bağlı)</FormLabel>
 <FormControl>
 <Textarea
 placeholder="Sınav hakkında notlar..."
 className="resize-none"
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <DialogFooter>
 <Button
 type="button"
 variant="outline"
 onClick={() => onOpenChange(false)}
 disabled={isSubmitting}
 >
 İptal
 </Button>
 <Button type="submit" disabled={isSubmitting}>
 {isSubmitting ? 'Kaydediliyor...' : session ? 'Güncelle' : 'Oluştur'}
 </Button>
 </DialogFooter>
 </form>
 </Form>
 </DialogContent>
 </Dialog>
 );
}
