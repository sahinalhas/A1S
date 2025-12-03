import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from '@/components/organisms/Card';
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
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/atoms/Select';
import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/atoms/Textarea';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { Calendar } from '@/components/organisms/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/organisms/Popover';
import { Plus, GraduationCap, CalendarIcon, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { cn } from '@/lib/utils';
import type { SchoolExamResult } from '../../../shared/types/exam-management.types';

const formSchema = z.object({
 student_id: z.string().min(1, 'Öğrenci seçimi gereklidir'),
 subject_name: z.string().min(1, 'Ders adı gereklidir'),
 exam_type: z.string().min(1, 'Sınav türü gereklidir'),
 score: z.number().min(0, 'Not 0\'dan küçük olamaz'),
 max_score: z.number().min(1, 'Tam puan 1\'den küçük olamaz'),
 exam_date: z.date({ required_error: 'Sınav tarihi gereklidir' }),
 semester: z.string().optional(),
 year: z.number().optional(),
 notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Student {
 id: string;
 name: string;
 class?: string;
 studentNumber?: string;ame: string;
}

interface SchoolExamsManagementProps {
 students: Student[];
 schoolExams: SchoolExamResult[];
 onSave: (data: any) => Promise<void>;
 onDelete: (id: string) => Promise<void>;
}

const EXAM_TYPES = [
 'Yazılı 1',
 'Yazılı 2',
 'Sözlü',
 'Performans',
 'Proje',
 'Dönem Sonu',
];

const SEMESTERS = ['1. Dönem', '2. Dönem', 'Yaz Okulu'];

const SUBJECTS = [
 'Türkçe',
 'Matematik',
 'Fen Bilimleri',
 'Sosyal Bilgiler',
 'İngilizce',
 'Din Kültürü',
 'Beden Eğitimi',
 'Müzik',
 'Görsel Sanatlar',
 'Teknoloji ve Tasarım',
];

export function SchoolExamsManagement({
 students,
 schoolExams,
 onSave,
 onDelete,
}: SchoolExamsManagementProps) {
 const [dialogOpen, setDialogOpen] = useState(false);
 const [selectedStudent, setSelectedStudent] = useState<string>('');
 const [editingExam, setEditingExam] = useState<SchoolExamResult | null>(null);

 const form = useForm<FormValues>({
 resolver: zodResolver(formSchema),
 defaultValues: {
 student_id: '',
 subject_name: '',
 exam_type: '',
 score: 0,
 max_score: 100,
 exam_date: new Date(),
 semester: '',
 year: new Date().getFullYear(),
 notes: '',
 },
 });

 const onSubmit = async (values: FormValues) => {
 try {
 await onSave({
 ...values,
 exam_date: format(values.exam_date, 'yyyy-MM-dd'),
 });
 setDialogOpen(false);
 setEditingExam(null);
 form.reset();
 } catch (error) {
 console.error('Error saving school exam:', error);
 }
 };

 const handleEdit = (exam: SchoolExamResult) => {
 setEditingExam(exam);
 form.reset({
 student_id: exam.student_id,
 subject_name: exam.subject_name,
 exam_type: exam.exam_type,
 score: exam.score,
 max_score: exam.max_score,
 exam_date: new Date(exam.exam_date),
 semester: exam.semester,
 year: exam.year,
 notes: exam.notes,
 });
 setDialogOpen(true);
 };

 const filteredExams = selectedStudent && selectedStudent !== 'all'
 ? schoolExams.filter((e) => e.student_id === selectedStudent)
 : schoolExams;

 return (
 <div className="space-y-6">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
 <div>
 <CardTitle className="flex items-center gap-2">
 <GraduationCap className="h-5 w-5" />
 Okul Sınavları Yönetimi
 </CardTitle>
 <CardDescription>
 Dönem sonu, yazılı ve diğer okul sınav notlarını yönetin
 </CardDescription>
 </div>
 <Button onClick={() => setDialogOpen(true)}>
 <Plus className="h-4 w-4 mr-2" />
 Not Ekle
 </Button>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <label className="text-sm font-medium">Öğrenci Filtrele</label>
 <Select value={selectedStudent} onValueChange={setSelectedStudent}>
 <SelectTrigger>
 <SelectValue placeholder="Tüm öğrenciler" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tüm öğrenciler</SelectItem>
 {students.map((student) => (
 <SelectItem key={student.id} value={student.id}>
 {student.name} {student.surname}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 {filteredExams.length === 0 ? (
 <Alert>
 <AlertDescription>Henüz not girilmemiş.</AlertDescription>
 </Alert>
 ) : (
 <div className="space-y-3">
 {filteredExams.map((exam) => (
 <div
 key={exam.id}
 className="flex items-center justify-between p-4 border rounded-lg"
 >
 <div className="flex-1 space-y-1">
 <div className="flex items-center gap-2">
 <span className="font-semibold">{exam.subject_name}</span>
 <Badge variant="outline">{exam.exam_type}</Badge>
 {exam.semester && <Badge variant="secondary">{exam.semester}</Badge>}
 </div>
 <div className="text-sm text-muted-foreground">
 {format(new Date(exam.exam_date), 'dd MMMM yyyy', { locale: tr })}
 {exam.year && ` - ${exam.year}`}
 </div>
 {exam.notes && (
 <div className="text-sm text-muted-foreground italic">{exam.notes}</div>
 )}
 </div>
 <div className="flex items-center gap-4">
 <div className="text-right">
 <div className="text-2xl font-bold text-primary">
 {exam.score}/{exam.max_score}
 </div>
 <div className="text-xs text-muted-foreground">
 {((exam.score / exam.max_score) * 100).toFixed(0)}%
 </div>
 </div>
 <div className="flex gap-1">
 <Button
 variant="ghost"
 size="icon"
 onClick={() => handleEdit(exam)}
 >
 <Pencil className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="icon"
 onClick={() => onDelete(exam.id)}
 >
 <Trash2 className="h-4 w-4 text-destructive" />
 </Button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>

 <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
 <DialogContent className="sm:max-w-[600px]">
 <DialogHeader>
 <DialogTitle>
 {editingExam ? 'Not Düzenle' : 'Yeni Not Ekle'}
 </DialogTitle>
 <DialogDescription>
 Okul sınavı notu ekleyin veya düzenleyin
 </DialogDescription>
 </DialogHeader>

 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <FormField
 control={form.control}
 name="student_id"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Öğrenci</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Öğrenci seçin" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 {students.map((student) => (
 <SelectItem key={student.id} value={student.id}>
 {student.name} {student.surname}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="subject_name"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Ders</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Ders seçin" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 {SUBJECTS.map((subject) => (
 <SelectItem key={subject} value={subject}>
 {subject}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <FormField
 control={form.control}
 name="exam_type"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Sınav Türü</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Sınav türü seçin" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 {EXAM_TYPES.map((type) => (
 <SelectItem key={type} value={type}>
 {type}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
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
 </div>

 <div className="grid grid-cols-3 gap-4">
 <FormField
 control={form.control}
 name="score"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Alınan Not</FormLabel>
 <FormControl>
 <Input
 type="number"
 step="0.01"
 {...field}
 onChange={(e) => field.onChange(parseFloat(e.target.value))}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="max_score"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Tam Puan</FormLabel>
 <FormControl>
 <Input
 type="number"
 step="0.01"
 {...field}
 onChange={(e) => field.onChange(parseFloat(e.target.value))}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="year"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Yıl</FormLabel>
 <FormControl>
 <Input
 type="number"
 {...field}
 onChange={(e) => field.onChange(parseInt(e.target.value))}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <FormField
 control={form.control}
 name="semester"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Dönem (İsteğe Bağlı)</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Dönem seçin" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 {SEMESTERS.map((semester) => (
 <SelectItem key={semester} value={semester}>
 {semester}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="notes"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Notlar (İsteğe Bağlı)</FormLabel>
 <FormControl>
 <Textarea {...field} placeholder="Ek notlar..." />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <DialogFooter>
 <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
 İptal
 </Button>
 <Button type="submit">
 {editingExam ? 'Güncelle' : 'Kaydet'}
 </Button>
 </DialogFooter>
 </form>
 </Form>
 </DialogContent>
 </Dialog>
 </div>
 );
}
