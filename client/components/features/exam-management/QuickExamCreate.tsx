import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/atoms/Select';
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from '@/components/organisms/Card';
import { Plus, Loader2 } from 'lucide-react';
import type { ExamType } from '../../../shared/types/exam-management.types';

interface QuickExamCreateProps {
 examTypes: ExamType[];
 onCreateExam: (data: {
 exam_type_id: string;
 name: string;
 exam_date: string;
 description?: string;
 }) => Promise<void>;
 defaultExamTypeId?: string;
 isLoading?: boolean;
}

export function QuickExamCreate({
 examTypes,
 onCreateExam,
 defaultExamTypeId,
 isLoading = false,
}: QuickExamCreateProps) {
 const [examTypeId, setExamTypeId] = useState<string>(
 defaultExamTypeId || examTypes[0]?.id || ''
 );
 const [name, setName] = useState('');
 const [examDate, setExamDate] = useState(
 new Date().toISOString().split('T')[0]
 );
 const [description, setDescription] = useState('');

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!examTypeId || !name || !examDate) return;

 await onCreateExam({
 exam_type_id: examTypeId,
 name,
 exam_date: examDate,
 description: description || undefined,
 });

 setName('');
 setDescription('');
 setExamDate(new Date().toISOString().split('T')[0]);
 };

 return (
 <Card className="overflow-hidden border-2">
 <CardHeader className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b">
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="flex items-center gap-2 text-lg">
 <Plus className="h-5 w-5 text-primary" />
 Hızlı Deneme Oluştur
 </CardTitle>
 <CardDescription className="mt-1">
 Deneme sınavını oluşturun ve hemen sonuç girişine başlayın
 </CardDescription>
 </div>
 </div>
 </CardHeader>
 <CardContent className="pt-6">
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
 <div className="space-y-1.5">
 <Label htmlFor="exam-type" className="text-sm">
 Sınav Türü
 </Label>
 <Select value={examTypeId} onValueChange={setExamTypeId}>
 <SelectTrigger id="exam-type" className="h-9">
 <SelectValue placeholder="Seçin" />
 </SelectTrigger>
 <SelectContent>
 {examTypes.map((type) => (
 <SelectItem key={type.id} value={type.id}>
 {type.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1.5">
 <Label htmlFor="exam-name" className="text-sm">
 Deneme Adı
 </Label>
 <Input
 id="exam-name"
 placeholder="örn: 1. Deneme"
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="h-9"
 required
 />
 </div>

 <div className="space-y-1.5">
 <Label htmlFor="exam-date" className="text-sm">
 Tarih
 </Label>
 <Input
 id="exam-date"
 type="date"
 value={examDate}
 onChange={(e) => setExamDate(e.target.value)}
 className="h-9"
 required
 />
 </div>

 <div className="space-y-1.5">
 <Label htmlFor="exam-description" className="text-sm">
 Açıklama
 </Label>
 <Input
 id="exam-description"
 placeholder="Opsiyonel"
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 className="h-9"
 />
 </div>
 </div>

 <div className="flex justify-end pt-2">
 <Button
 type="submit"
 disabled={!examTypeId || !name || !examDate || isLoading}
 size="sm"
 className="min-w-[140px]"
 >
 {isLoading ? (
 <>
 <Loader2 className="mr-2 h-4 w-4" />
 Oluşturuluyor...
 </>
 ) : (
 <>
 <Plus className="mr-2 h-4 w-4" />
 Oluştur
 </>
 )}
 </Button>
 </div>
 </form>
 </CardContent>
 </Card>
 );
}
