import { useState, useMemo } from 'react';
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
import { Button } from '@/components/atoms/Button';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { CheckCircle2, Save, Calculator } from 'lucide-react';
import type {
 ExamSession,
 ExamSubject,
 ExamType,
 SubjectResults,
} from '../../../shared/types/exam-management.types';

interface Student {
 id: string;
 name: string;
}

interface ExamResultsEntryProps {
 sessions: ExamSession[];
 subjects: ExamSubject[];
 students: Student[];
 examTypes: ExamType[];
 onSave: (sessionId: string, studentId: string, results: SubjectResults[]) => Promise<void>;
}

export function ExamResultsEntry({
 sessions,
 subjects,
 students,
 examTypes,
 onSave,
}: ExamResultsEntryProps) {
 const [selectedSession, setSelectedSession] = useState<string>('');
 const [selectedStudent, setSelectedStudent] = useState<string>('');
 const [subjectResults, setSubjectResults] = useState<Map<string, SubjectResults>>(new Map());
 const [isSaving, setIsSaving] = useState(false);
 const [saveSuccess, setSaveSuccess] = useState(false);

 const activeSession = useMemo(
 () => sessions.find((s) => s.id === selectedSession),
 [sessions, selectedSession]
 );

 const penaltyDivisor = useMemo(() => {
 if (!activeSession) return 4;
 const examType = examTypes.find((et) => et.id === activeSession.exam_type_id);
 return examType?.penalty_divisor || 4;
 }, [activeSession, examTypes]);

 const handleSubjectChange = (
 subjectId: string,
 field: 'correct_count' | 'wrong_count' | 'empty_count',
 value: string
 ) => {
 const numValue = parseInt(value) || 0;
 const currentResults = subjectResults.get(subjectId) || {
 subject_id: subjectId,
 correct_count: 0,
 wrong_count: 0,
 empty_count: 0,
 };

 const updatedResults = { ...currentResults, [field]: numValue };
 const newMap = new Map(subjectResults);
 newMap.set(subjectId, updatedResults);
 setSubjectResults(newMap);
 };

 const calculateNet = (subjectId: string): number => {
 const result = subjectResults.get(subjectId);
 if (!result) return 0;
 return Math.max(0, result.correct_count - result.wrong_count / penaltyDivisor);
 };

 const getTotalNet = (): number => {
 return subjects.reduce((total, subject) => total + calculateNet(subject.id), 0);
 };

 const handleSave = async () => {
 if (!selectedSession || !selectedStudent) {
 return;
 }

 try {
 setIsSaving(true);
 setSaveSuccess(false);

 const results: SubjectResults[] = subjects.map((subject) => {
 const result = subjectResults.get(subject.id);
 return result || {
 subject_id: subject.id,
 correct_count: 0,
 wrong_count: 0,
 empty_count: 0,
 };
 });

 await onSave(selectedSession, selectedStudent, results);
 setSaveSuccess(true);
 setSubjectResults(new Map());
 
 setTimeout(() => setSaveSuccess(false), 3000);
 } catch (error) {
 console.error('Error saving exam results:', error);
 } finally {
 setIsSaving(false);
 }
 };

 const canSave = selectedSession && selectedStudent && subjectResults.size > 0;

 return (
 <div className="space-y-6">
 <Card>
 <CardHeader>
 <CardTitle>Sonuç Girişi</CardTitle>
 <CardDescription>
 Sınav ve öğrenci seçerek ders bazında sonuç girişi yapın
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-sm font-medium">Deneme Sınavı</label>
 <Select value={selectedSession} onValueChange={setSelectedSession}>
 <SelectTrigger>
 <SelectValue placeholder="Sınav seçin" />
 </SelectTrigger>
 <SelectContent>
 {sessions.map((session) => (
 <SelectItem key={session.id} value={session.id}>
 {session.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Öğrenci</label>
 <Select value={selectedStudent} onValueChange={setSelectedStudent}>
 <SelectTrigger>
 <SelectValue placeholder="Öğrenci seçin" />
 </SelectTrigger>
 <SelectContent>
 {students.map((student) => (
 <SelectItem key={student.id} value={student.id}>
 {student.name} {student.surname}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>

 {saveSuccess && (
 <Alert className="bg-green-50 border-green-200">
 <CheckCircle2 className="h-4 w-4 text-green-600" />
 <AlertDescription className="text-green-800">
 Sonuçlar başarıyla kaydedildi!
 </AlertDescription>
 </Alert>
 )}
 </CardContent>
 </Card>

 {selectedSession && selectedStudent && subjects.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle>Ders Bazında Sonuç Girişi</CardTitle>
 <CardDescription>
 Her ders için doğru, yanlış ve boş sayılarını girin
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 <div className="rounded-md border">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b bg-muted/50">
 <th className="p-3 text-left font-medium">Ders</th>
 <th className="p-3 text-center font-medium w-24">Doğru</th>
 <th className="p-3 text-center font-medium w-24">Yanlış</th>
 <th className="p-3 text-center font-medium w-24">Boş</th>
 <th className="p-3 text-center font-medium w-24">Net</th>
 </tr>
 </thead>
 <tbody>
 {subjects.map((subject, idx) => {
 const result = subjectResults.get(subject.id);
 return (
 <tr
 key={subject.id}
 className={idx % 2 === 0 ? 'bg-white' : 'bg-muted/20'}
 >
 <td className="p-3 font-medium">
 {subject.subject_name}
 <span className="ml-2 text-xs text-muted-foreground">
 ({subject.question_count} soru)
 </span>
 </td>
 <td className="p-3">
 <Input
 type="number"
 min="0"
 max={subject.question_count}
 value={result?.correct_count || ''}
 onChange={(e) =>
 handleSubjectChange(
 subject.id,
 'correct_count',
 e.target.value
 )
 }
 className="text-center"
 placeholder="0"
 />
 </td>
 <td className="p-3">
 <Input
 type="number"
 min="0"
 max={subject.question_count}
 value={result?.wrong_count || ''}
 onChange={(e) =>
 handleSubjectChange(subject.id, 'wrong_count', e.target.value)
 }
 className="text-center"
 placeholder="0"
 />
 </td>
 <td className="p-3">
 <Input
 type="number"
 min="0"
 max={subject.question_count}
 value={result?.empty_count || ''}
 onChange={(e) =>
 handleSubjectChange(subject.id, 'empty_count', e.target.value)
 }
 className="text-center"
 placeholder="0"
 />
 </td>
 <td className="p-3 text-center font-bold text-primary">
 {calculateNet(subject.id).toFixed(2)}
 </td>
 </tr>
 );
 })}
 <tr className="border-t-2 bg-primary/5">
 <td className="p-3 font-bold" colSpan={4}>
 Toplam Net
 </td>
 <td className="p-3 text-center font-bold text-primary text-lg">
 {getTotalNet().toFixed(2)}
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 <div className="flex justify-end gap-2">
 <Button
 variant="outline"
 onClick={() => {
 setSubjectResults(new Map());
 }}
 >
 Temizle
 </Button>
 <Button onClick={handleSave} disabled={!canSave || isSaving}>
 <Save className="h-4 w-4 mr-2" />
 {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
 </Button>
 </div>
 </div>
 </CardContent>
 </Card>
 )}

 {selectedSession && selectedStudent && subjects.length === 0 && (
 <Alert>
 <AlertDescription>
 Bu sınav türü için henüz ders tanımlanmamış. Lütfen sistem yöneticisine başvurun.
 </AlertDescription>
 </Alert>
 )}
 </div>
 );
}
