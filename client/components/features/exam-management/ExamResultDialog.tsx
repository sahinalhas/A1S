import { useState, useMemo, useEffect } from 'react';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
} from '@/components/organisms/Dialog';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/atoms/Select';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { Badge } from '@/components/atoms/Badge';
import { CheckCircle2, Save, ArrowRight, Copy, Info, AlertCircle } from 'lucide-react';
import { useExamSubjects, useExamResultsBySessionAndStudent } from '@/hooks/queries/exams.query-hooks';
import { useStudentFilter } from '@/hooks/state/student-filter.state';
import { calculateNetScore } from '@/lib/utils/helpers/exam';
import type {
 ExamSession,
 ExamSubject,
 ExamType,
 SubjectResults,
} from '../../../shared/types/exam-management.types';

interface Student {
 id: string;
 name: string;
 surname: string;
}

interface ExamResultDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 session: ExamSession;
 students: Student[];
 examTypes: ExamType[];
 onSave: (sessionId: string, studentId: string, results: SubjectResults[]) => Promise<void>;
}

export function ExamResultDialog({
 open,
 onOpenChange,
 session,
 students,
 examTypes,
 onSave,
}: ExamResultDialogProps) {
 const { data: subjects = [], isLoading: subjectsLoading } = useExamSubjects(session.exam_type_id);
 const [selectedStudent, setSelectedStudent] = useState<string>('');
 const [studentSearch, setStudentSearch] = useState<string>('');
 const [subjectResults, setSubjectResults] = useState<Map<string, SubjectResults>>(new Map());
 const [isSaving, setIsSaving] = useState(false);
 const [saveSuccess, setSaveSuccess] = useState(false);
 const [lastSavedResults, setLastSavedResults] = useState<Map<string, SubjectResults>>(new Map());
 const [savedStudentsCount, setSavedStudentsCount] = useState(0);
 
 const { data: existingResults = [] } = useExamResultsBySessionAndStudent(
 session.id,
 selectedStudent || undefined
 );

 const filteredStudents = useStudentFilter(students, studentSearch);

 const penaltyDivisor = useMemo(() => {
 const examType = examTypes.find((et) => et.id === session.exam_type_id);
 return examType?.penalty_divisor || 4;
 }, [examTypes, session.exam_type_id]);

 const currentStudentIndex = useMemo(() => {
 return students.findIndex((s) => s.id === selectedStudent);
 }, [students, selectedStudent]);

 const hasNextStudent = currentStudentIndex < students.length - 1;
 const hasPreviousStudent = currentStudentIndex > 0;

 useEffect(() => {
 if (open) {
 setSavedStudentsCount(0);
 }
 }, [open]);

 useEffect(() => {
 if (!selectedStudent) {
 setSubjectResults(new Map());
 setSaveSuccess(false);
 return;
 }

 if (existingResults.length > 0) {
 const resultsMap = new Map<string, SubjectResults>();
 existingResults.forEach((result) => {
 resultsMap.set(result.subject_id, {
 subject_id: result.subject_id,
 correct_count: result.correct_count,
 wrong_count: result.wrong_count,
 empty_count: result.empty_count,
 });
 });
 setSubjectResults(resultsMap);
 } else {
 setSubjectResults(new Map());
 }
 setSaveSuccess(false);
 }, [selectedStudent, existingResults]);

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
 return calculateNetScore(result.correct_count, result.wrong_count, penaltyDivisor);
 };

 const getTotalNet = (): number => {
 return subjects.reduce((total, subject) => total + calculateNet(subject.id), 0);
 };

 const copyLastResults = () => {
 if (lastSavedResults.size > 0) {
 setSubjectResults(new Map(lastSavedResults));
 setSaveSuccess(false);
 }
 };

 const handleSave = async (moveToNext: boolean = false) => {
 if (!selectedStudent) return;

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

 await onSave(session.id, selectedStudent, results);
 
 setLastSavedResults(new Map(subjectResults));
 setSaveSuccess(true);
 setSavedStudentsCount((prev) => prev + 1);

 if (moveToNext && hasNextStudent) {
 setTimeout(() => {
 const nextStudent = students[currentStudentIndex + 1];
 setSelectedStudent(nextStudent.id);
 setSubjectResults(new Map());
 setSaveSuccess(false);
 }, 500);
 } else if (!moveToNext) {
 setTimeout(() => {
 setSaveSuccess(false);
 setSubjectResults(new Map());
 setSelectedStudent('');
 if (!hasNextStudent) {
 onOpenChange(false);
 }
 }, 1500);
 }
 } catch (error) {
 console.error('Error saving exam results:', error);
 } finally {
 setIsSaving(false);
 }
 };

 const handleNext = () => {
 if (hasNextStudent) {
 const nextStudent = students[currentStudentIndex + 1];
 setSelectedStudent(nextStudent.id);
 setSubjectResults(new Map());
 setSaveSuccess(false);
 }
 };

 const handlePrevious = () => {
 if (hasPreviousStudent) {
 const prevStudent = students[currentStudentIndex - 1];
 setSelectedStudent(prevStudent.id);
 setSubjectResults(new Map());
 setSaveSuccess(false);
 }
 };

 const canSave = !!selectedStudent;

 const handleKeyPress = (e: React.KeyboardEvent) => {
 if (e.ctrlKey && e.key === 'Enter' && canSave) {
 e.preventDefault();
 handleSave(true);
 }
 };

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onKeyDown={handleKeyPress}>
 <DialogHeader>
 <div className="flex items-center justify-between">
 <div>
 <DialogTitle>Bireysel Sonuç Girişi - {session.name}</DialogTitle>
 <DialogDescription>
 Öğrenci seçerek ders bazında sonuç girişi yapın
 </DialogDescription>
 </div>
 {savedStudentsCount > 0 && (
 <Badge variant="secondary" className="text-sm">
 <CheckCircle2 className="h-3 w-3 mr-1" />
 {savedStudentsCount} Kaydedildi
 </Badge>
 )}
 </div>
 </DialogHeader>

 <div className="space-y-4">
 <div className="flex items-center gap-2">
 <div className="flex-1 space-y-2">
 <Label htmlFor="student-select">Öğrenci Seçin *</Label>
 <Select value={selectedStudent} onValueChange={setSelectedStudent}>
 <SelectTrigger id="student-select">
 <SelectValue placeholder="Numara veya isim ile ara..." />
 </SelectTrigger>
 <SelectContent>
 <div className="px-2 pb-2">
 <Input
 placeholder="Numara veya isim ile ara..."
 value={studentSearch}
 onChange={(e) => setStudentSearch(e.target.value)}
 className="h-8"
 onClick={(e) => e.stopPropagation()}
 onKeyDown={(e) => e.stopPropagation()}
 />
 </div>
 {filteredStudents.length === 0 ? (
 <div className="p-2 text-sm text-muted-foreground text-center">
 Öğrenci bulunamadı
 </div>
 ) : (
 filteredStudents.map((student) => (
 <SelectItem key={student.id} value={student.id}>
 {student.id} - {student.name} {student.surname}
 </SelectItem>
 ))
 )}
 </SelectContent>
 </Select>
 </div>
 <div className="flex gap-1 mt-7">
 <Button
 variant="outline"
 size="icon"
 onClick={handlePrevious}
 disabled={!hasPreviousStudent}
 title="Önceki Öğrenci"
 >
 ←
 </Button>
 <Button
 variant="outline"
 size="icon"
 onClick={handleNext}
 disabled={!hasNextStudent}
 title="Sonraki Öğrenci"
 >
 →
 </Button>
 </div>
 </div>

 {lastSavedResults.size > 0 && (
 <Alert>
 <Info className="h-4 w-4" />
 <AlertDescription className="flex items-center justify-between">
 <span className="text-sm">Son girdiğiniz değerleri kopyalayabilirsiniz</span>
 <Button variant="outline" size="sm" onClick={copyLastResults}>
 <Copy className="h-3 w-3 mr-2" />
 Son Değerleri Kopyala
 </Button>
 </AlertDescription>
 </Alert>
 )}

 {saveSuccess && (
 <Alert className="bg-green-50 border-green-200">
 <CheckCircle2 className="h-4 w-4 text-green-600" />
 <AlertDescription className="text-green-800">
 Sonuçlar başarıyla kaydedildi!
 </AlertDescription>
 </Alert>
 )}

 {!selectedStudent && (
 <Alert>
 <Info className="h-4 w-4" />
 <AlertDescription>
 Lütfen yukarıdan bir öğrenci seçin
 </AlertDescription>
 </Alert>
 )}

 {selectedStudent && subjects.length === 0 && (
 <Alert variant="destructive">
 <AlertCircle className="h-4 w-4" />
 <AlertDescription>
 Bu sınav türü için ders bilgisi bulunamadı. Lütfen önce sınav türüne dersler ekleyin.
 </AlertDescription>
 </Alert>
 )}

 {selectedStudent && subjects.length > 0 && (
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
 )}

 <div className="flex justify-between items-center">
 <Button
 variant="outline"
 onClick={() => {
 setSubjectResults(new Map());
 }}
 >
 Temizle
 </Button>
 <div className="flex gap-2">
 <Button onClick={() => handleSave(false)} disabled={!canSave || isSaving}>
 <Save className="h-4 w-4 mr-2" />
 {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
 </Button>
 {hasNextStudent && (
 <Button
 onClick={() => handleSave(true)}
 disabled={!canSave || isSaving}
 variant="default"
 className="bg-green-600"
 >
 <Save className="h-4 w-4 mr-2" />
 Kaydet ve Sonraki
 <ArrowRight className="h-4 w-4 ml-2" />
 </Button>
 )}
 </div>
 </div>

 <div className="text-xs text-muted-foreground text-center">
 Kısayol: Ctrl + Enter ile"Kaydet ve Sonraki"
 </div>
 </div>
 </DialogContent>
 </Dialog>
 );
}
