import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
} from '@/components/organisms/Dialog';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { Badge } from '@/components/atoms/Badge';
import { Progress } from '@/components/atoms/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import {
 Save,
 CheckCircle2,
 Table as TableIcon,
 ClipboardPaste,
 Loader2,
 Info,
 Search,
 Zap,
 AlertCircle,
 Clock,
} from 'lucide-react';
import { useExamSubjects, useExamResultsBySession } from '@/hooks/queries/exams.query-hooks';
import { useStudentFilter } from '@/hooks/state/student-filter.state';
import { calculateNetScore } from '@/lib/utils/helpers/exam';
import type {
 ExamSession,
 ExamSubject,
 ExamType,
 SubjectResults,
} from '@shared/types/exam-management.types';

interface Student {
 id: string;
 name: string;
 surname: string;
}

interface StudentResult {
 studentId: string;
 studentName: string;
 subjects: Map<string, SubjectResults>;
 totalNet: number;
}

interface CellError {
 studentId: string;
 subjectId: string;
 field: string;
 message: string;
}

interface EnhancedBulkResultsEntryProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 session: ExamSession;
 students: Student[];
 examTypes: ExamType[];
 onSave: (sessionId: string, studentId: string, results: SubjectResults[]) => Promise<void>;
}

export function EnhancedBulkResultsEntry({
 open,
 onOpenChange,
 session,
 students,
 examTypes,
 onSave,
}: EnhancedBulkResultsEntryProps) {
 const { data: subjects = [], isLoading: subjectsLoading } = useExamSubjects(session.exam_type_id);
 const { data: existingResults = [] } = useExamResultsBySession(session.id);
 const [results, setResults] = useState<Map<string, StudentResult>>(new Map());
 const [isSaving, setIsSaving] = useState(false);
 const [saveSuccess, setSaveSuccess] = useState(false);
 const [pasteData, setPasteData] = useState('');
 const [searchQuery, setSearchQuery] = useState('');
 const [activeTab, setActiveTab] = useState<'table' | 'paste'>('table');
 const [errors, setErrors] = useState<CellError[]>([]);
 const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
 const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
 const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
 const autoSaveTimerRef = useRef<NodeJS.Timeout>();

 const filteredStudents = useStudentFilter(students, searchQuery);

 const penaltyDivisor = useMemo(() => {
 const examType = examTypes.find((et) => et.id === session.exam_type_id);
 return examType?.penalty_divisor || 4;
 }, [examTypes, session.exam_type_id]);

 const createEmptyStudentResult = useCallback((studentId: string): StudentResult => {
 const student = students.find((s) => s.id === studentId);
 return {
 studentId,
 studentName: student ? `${student.name} ${student.surname}` : '',
 subjects: new Map(),
 totalNet: 0,
 };
 }, [students]);

 const calculateTotalNet = useCallback((subjectMap: Map<string, SubjectResults>): number => {
 let total = 0;
 subjectMap.forEach((result) => {
 total += calculateNetScore(result.correct_count, result.wrong_count, penaltyDivisor);
 });
 return total;
 }, [penaltyDivisor]);

 useEffect(() => {
 if (open && existingResults.length > 0) {
 const newResults = new Map<string, StudentResult>();
 
 const studentResultsMap = new Map<string, Map<string, SubjectResults>>();
 
 existingResults.forEach((result) => {
 if (!studentResultsMap.has(result.student_id)) {
 studentResultsMap.set(result.student_id, new Map());
 }
 studentResultsMap.get(result.student_id)!.set(result.subject_id, {
 subject_id: result.subject_id,
 correct_count: result.correct_count,
 wrong_count: result.wrong_count,
 empty_count: result.empty_count,
 });
 });
 
 studentResultsMap.forEach((subjectsMap, studentId) => {
 const student = students.find((s) => s.id === studentId);
 if (student) {
 newResults.set(studentId, {
 studentId,
 studentName: `${student.name} ${student.surname}`,
 subjects: subjectsMap,
 totalNet: calculateTotalNet(subjectsMap),
 });
 }
 });
 
 setResults(newResults);
 }
 }, [open, existingResults, students, calculateTotalNet]);

 // Validation function
 const validateCell = useCallback(
 (studentId: string, subjectId: string, field: string, value: number): string | null => {
 const subject = subjects.find((s) => s.id === subjectId);
 if (!subject) return null;

 if (value < 0) return 'Negatif değer girilemez';
 if (value > subject.question_count) return `Maksimum ${subject.question_count} olabilir`;

 const result = results.get(studentId)?.subjects.get(subjectId);
 if (result) {
 const total = 
 (field === 'correct_count' ? value : result.correct_count) +
 (field === 'wrong_count' ? value : result.wrong_count) +
 (field === 'empty_count' ? value : result.empty_count);
 
 if (total > subject.question_count) {
 return `Toplam ${subject.question_count}'i geçemez`;
 }
 }

 return null;
 },
 [subjects, results]
 );

 const handleCellChange = useCallback(
 (
 studentId: string,
 subjectId: string,
 field: 'correct_count' | 'wrong_count' | 'empty_count',
 value: string
 ) => {
 const numValue = Math.max(0, parseInt(value) || 0);
 
 // Validate
 const errorMsg = validateCell(studentId, subjectId, field, numValue);
 setErrors((prev) => {
 const filtered = prev.filter(
 (e) => !(e.studentId === studentId && e.subjectId === subjectId && e.field === field)
 );
 if (errorMsg) {
 return [...filtered, { studentId, subjectId, field, message: errorMsg }];
 }
 return filtered;
 });

 const currentResult = results.get(studentId) || createEmptyStudentResult(studentId);
 
 const subjectResult = currentResult.subjects.get(subjectId) || {
 subject_id: subjectId,
 correct_count: 0,
 wrong_count: 0,
 empty_count: 0,
 };

 const updatedSubjectResult = { ...subjectResult, [field]: numValue };
 const newSubjects = new Map(currentResult.subjects);
 newSubjects.set(subjectId, updatedSubjectResult);

 const totalNet = calculateTotalNet(newSubjects);
 
 const newResults = new Map(results);
 newResults.set(studentId, {
 ...currentResult,
 subjects: newSubjects,
 totalNet,
 });
 
 setResults(newResults);

 // Trigger auto-save
 if (autoSaveEnabled) {
 if (autoSaveTimerRef.current) {
 clearTimeout(autoSaveTimerRef.current);
 }
 autoSaveTimerRef.current = setTimeout(() => {
 setLastSaveTime(new Date());
 }, 30000); // 30 seconds
 }
 },
 [results, validateCell, autoSaveEnabled, createEmptyStudentResult, calculateTotalNet]
 );

 const calculateNet = (studentId: string, subjectId: string): number => {
 const result = results.get(studentId)?.subjects.get(subjectId);
 if (!result) return 0;
 return calculateNetScore(result.correct_count, result.wrong_count, penaltyDivisor);
 };

 const handleKeyDown = (
 e: React.KeyboardEvent<HTMLInputElement>,
 studentIndex: number,
 subjectIndex: number,
 field: 'correct' | 'wrong' | 'empty'
 ) => {
 const fieldOrder = ['correct', 'wrong', 'empty'];
 const currentFieldIndex = fieldOrder.indexOf(field);
 
 if (e.key === 'Enter' || e.key === 'ArrowDown') {
 e.preventDefault();
 const nextStudent = studentIndex + 1;
 if (nextStudent < filteredStudents.length) {
 const key = `${filteredStudents[nextStudent].id}-${subjects[subjectIndex].id}-${field}`;
 inputRefs.current.get(key)?.focus();
 }
 } else if (e.key === 'ArrowUp') {
 e.preventDefault();
 const prevStudent = studentIndex - 1;
 if (prevStudent >= 0) {
 const key = `${filteredStudents[prevStudent].id}-${subjects[subjectIndex].id}-${field}`;
 inputRefs.current.get(key)?.focus();
 }
 } else if (e.key === 'Tab' && !e.shiftKey) {
 e.preventDefault();
 const nextFieldIndex = currentFieldIndex + 1;
 if (nextFieldIndex < fieldOrder.length) {
 const key = `${filteredStudents[studentIndex].id}-${subjects[subjectIndex].id}-${fieldOrder[nextFieldIndex]}`;
 inputRefs.current.get(key)?.focus();
 } else {
 const nextSubjectIndex = subjectIndex + 1;
 if (nextSubjectIndex < subjects.length) {
 const key = `${filteredStudents[studentIndex].id}-${subjects[nextSubjectIndex].id}-correct`;
 inputRefs.current.get(key)?.focus();
 } else {
 const nextStudent = studentIndex + 1;
 if (nextStudent < filteredStudents.length) {
 const key = `${filteredStudents[nextStudent].id}-${subjects[0].id}-correct`;
 inputRefs.current.get(key)?.focus();
 }
 }
 }
 } else if (e.key === 'Tab' && e.shiftKey) {
 e.preventDefault();
 const prevFieldIndex = currentFieldIndex - 1;
 if (prevFieldIndex >= 0) {
 const key = `${filteredStudents[studentIndex].id}-${subjects[subjectIndex].id}-${fieldOrder[prevFieldIndex]}`;
 inputRefs.current.get(key)?.focus();
 } else {
 const prevSubjectIndex = subjectIndex - 1;
 if (prevSubjectIndex >= 0) {
 const key = `${filteredStudents[studentIndex].id}-${subjects[prevSubjectIndex].id}-empty`;
 inputRefs.current.get(key)?.focus();
 }
 }
 }
 };

 const handlePasteData = () => {
 try {
 const rows = pasteData.trim().split('\n');
 const newResults = new Map(results);

 rows.forEach((row) => {
 const cells = row.split('\t').map((cell) => cell.trim());
 
 if (cells.length < 2) return;

 const studentIdOrName = cells[0];
 const student = students.find(
 (s) =>
 s.id === studentIdOrName ||
 s.name === studentIdOrName ||
 `${s.name} ${s.surname}` === studentIdOrName
 );

 if (!student) return;

 const studentResult = newResults.get(student.id) || createEmptyStudentResult(student.id);
 const newSubjects = new Map(studentResult.subjects);

 let cellIndex = 1;
 subjects.forEach((subject) => {
 const correct = parseInt(cells[cellIndex] || '0') || 0;
 const wrong = parseInt(cells[cellIndex + 1] || '0') || 0;
 const empty = parseInt(cells[cellIndex + 2] || '0') || 0;

 newSubjects.set(subject.id, {
 subject_id: subject.id,
 correct_count: correct,
 wrong_count: wrong,
 empty_count: empty,
 });

 cellIndex += 3;
 });

 const totalNet = calculateTotalNet(newSubjects);
 newResults.set(student.id, {
 ...studentResult,
 subjects: newSubjects,
 totalNet,
 });
 });

 setResults(newResults);
 setPasteData('');
 setActiveTab('table');
 setSaveSuccess(true);
 setTimeout(() => setSaveSuccess(false), 2000);
 } catch (error) {
 console.error('Error parsing paste data:', error);
 }
 };

 const handleSaveAll = async () => {
 if (errors.length > 0) {
 alert('Lütfen önce hataları düzeltin');
 return;
 }

 try {
 setIsSaving(true);
 setSaveSuccess(false);

 const savePromises: Promise<void>[] = [];

 results.forEach((studentResult) => {
 if (studentResult.subjects.size > 0) {
 const subjectResults: SubjectResults[] = Array.from(studentResult.subjects.values());
 savePromises.push(onSave(session.id, studentResult.studentId, subjectResults));
 }
 });

 await Promise.all(savePromises);
 
 setSaveSuccess(true);
 setLastSaveTime(new Date());
 setTimeout(() => {
 setSaveSuccess(false);
 onOpenChange(false);
 setResults(new Map());
 }, 1500);
 } catch (error) {
 console.error('Error saving bulk results:', error);
 } finally {
 setIsSaving(false);
 }
 };

 const hasAnyData = results.size > 0;
 const totalStudentsWithData = Array.from(results.values()).filter(
 (r) => r.subjects.size > 0
 ).length;
 const completionPercentage = students.length > 0 
 ? Math.round((totalStudentsWithData / students.length) * 100) 
 : 0;

 const getCellError = (studentId: string, subjectId: string, field: string) => {
 return errors.find((e) => e.studentId === studentId && e.subjectId === subjectId && e.field === field);
 };

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2">
 <TableIcon className="h-5 w-5" />
 Hızlı Toplu Giriş - {session.name}
 </DialogTitle>
 <DialogDescription className="flex items-center gap-4">
 <span>Tab/Enter ile hızlı geçiş yapabilirsiniz</span>
 {lastSaveTime && (
 <Badge variant="secondary" className="text-xs">
 <Clock className="h-3 w-3 mr-1" />
 Son kayıt: {lastSaveTime.toLocaleTimeString('tr-TR')}
 </Badge>
 )}
 </DialogDescription>
 </DialogHeader>

 {/* Progress Bar */}
 <div className="space-y-2 px-1">
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">İlerleme</span>
 <span className="font-medium">
 {totalStudentsWithData} / {students.length} öğrenci ({completionPercentage}%)
 </span>
 </div>
 <Progress value={completionPercentage} className="h-2" />
 </div>

 {/* Error Alert */}
 {errors.length > 0 && (
 <Alert variant="destructive" className="border-l-4">
 <AlertCircle className="h-4 w-4" />
 <AlertDescription>
 {errors.length} hata bulundu. Lütfen düzeltiniz.
 </AlertDescription>
 </Alert>
 )}

 <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'table' | 'paste')} className="flex-1 flex flex-col overflow-hidden">
 <TabsList variant="nested">
 <TabsTrigger value="table" variant="nested">
 <TableIcon className="h-4 w-4" />
 Tablo Girişi
 </TabsTrigger>
 <TabsTrigger value="paste" variant="nested">
 <ClipboardPaste className="h-4 w-4" />
 Yapıştır
 </TabsTrigger>
 </TabsList>

 <TabsContent value="table" className="flex-1 flex flex-col overflow-hidden mt-4">
 <div className="flex items-center gap-3 mb-3">
 <div className="flex-1 relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder="Öğrenci ara..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-9"
 />
 </div>
 <Badge variant="secondary" className="text-sm px-3 py-1.5">
 {totalStudentsWithData} / {students.length}
 </Badge>
 </div>

 {saveSuccess && (
 <Alert className="bg-green-50 border-green-200 mb-3">
 <CheckCircle2 className="h-4 w-4 text-green-600" />
 <AlertDescription className="text-green-800">
 Veriler başarıyla kaydedildi!
 </AlertDescription>
 </Alert>
 )}

 <div className="flex-1 overflow-auto border rounded-md">
 <table className="w-full text-sm">
 <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
 <tr className="border-b">
 <th className="p-2 text-left font-medium sticky left-0 bg-muted/80 backdrop-blur min-w-[150px]">
 Öğrenci
 </th>
 {subjects.map((subject) => (
 <th
 key={subject.id}
 className="p-2 text-center font-medium border-l"
 colSpan={3}
 >
 <div className="flex flex-col gap-1">
 <span>{subject.subject_name}</span>
 <span className="text-xs text-muted-foreground font-normal">
 ({subject.question_count} soru)
 </span>
 </div>
 </th>
 ))}
 <th className="p-2 text-center font-medium border-l bg-primary/10">
 Toplam Net
 </th>
 </tr>
 <tr className="border-b bg-muted/60">
 <th className="p-2 sticky left-0 bg-muted/60 backdrop-blur"></th>
 {subjects.map((subject) => (
 <>
 <th key={`${subject.id}-d`} className="p-1 text-xs border-l w-20">D</th>
 <th key={`${subject.id}-y`} className="p-1 text-xs w-20">Y</th>
 <th key={`${subject.id}-b`} className="p-1 text-xs w-20">B</th>
 </>
 ))}
 <th className="p-2 border-l bg-primary/10"></th>
 </tr>
 </thead>
 <tbody>
 {filteredStudents.length === 0 ? (
 <tr>
 <td colSpan={subjects.length * 3 + 2} className="p-8 text-center text-muted-foreground">
 Öğrenci bulunamadı
 </td>
 </tr>
 ) : (
 filteredStudents.map((student, studentIndex) => {
 const studentResult = results.get(student.id);
 return (
 <tr
 key={student.id}
 className={`${studentIndex % 2 === 0 ? 'bg-white' : 'bg-muted/20'}`}
 >
 <td className="p-2 font-medium sticky left-0 bg-inherit border-r">
 <div className="flex flex-col">
 <span className="text-xs text-muted-foreground">{student.id}</span>
 <span>{student.name} {student.surname}</span>
 </div>
 </td>
 {subjects.map((subject, subjectIndex) => {
 const result = studentResult?.subjects.get(subject.id);
 const correctError = getCellError(student.id, subject.id, 'correct_count');
 const wrongError = getCellError(student.id, subject.id, 'wrong_count');
 const emptyError = getCellError(student.id, subject.id, 'empty_count');
 
 return (
 <>
 <td key={`${subject.id}-correct`} className="p-1 border-l">
 <Input
 ref={(el) => {
 if (el) {
 inputRefs.current.set(
 `${student.id}-${subject.id}-correct`,
 el
 );
 }
 }}
 type="number"
 min="0"
 max={subject.question_count}
 value={result?.correct_count || ''}
 onChange={(e) =>
 handleCellChange(
 student.id,
 subject.id,
 'correct_count',
 e.target.value
 )
 }
 onKeyDown={(e) =>
 handleKeyDown(e, studentIndex, subjectIndex, 'correct')
 }
 className={`text-center h-9 border-0 focus:ring-2 ${
 correctError ? 'ring-2 ring-red-500' : 'focus:ring-primary'
 }`}
 placeholder="0"
 title={correctError?.message}
 />
 </td>
 <td key={`${subject.id}-wrong`} className="p-1">
 <Input
 ref={(el) => {
 if (el) {
 inputRefs.current.set(
 `${student.id}-${subject.id}-wrong`,
 el
 );
 }
 }}
 type="number"
 min="0"
 max={subject.question_count}
 value={result?.wrong_count || ''}
 onChange={(e) =>
 handleCellChange(
 student.id,
 subject.id,
 'wrong_count',
 e.target.value
 )
 }
 onKeyDown={(e) =>
 handleKeyDown(e, studentIndex, subjectIndex, 'wrong')
 }
 className={`text-center h-9 border-0 focus:ring-2 ${
 wrongError ? 'ring-2 ring-red-500' : 'focus:ring-primary'
 }`}
 placeholder="0"
 title={wrongError?.message}
 />
 </td>
 <td key={`${subject.id}-empty`} className="p-1">
 <Input
 ref={(el) => {
 if (el) {
 inputRefs.current.set(
 `${student.id}-${subject.id}-empty`,
 el
 );
 }
 }}
 type="number"
 min="0"
 max={subject.question_count}
 value={result?.empty_count || ''}
 onChange={(e) =>
 handleCellChange(
 student.id,
 subject.id,
 'empty_count',
 e.target.value
 )
 }
 onKeyDown={(e) =>
 handleKeyDown(e, studentIndex, subjectIndex, 'empty')
 }
 className={`text-center h-9 border-0 focus:ring-2 ${
 emptyError ? 'ring-2 ring-red-500' : 'focus:ring-primary'
 }`}
 placeholder="0"
 title={emptyError?.message}
 />
 </td>
 </>
 );
 })}
 <td className="p-2 text-center font-bold text-primary border-l bg-primary/5">
 {studentResult?.totalNet.toFixed(2) || '0.00'}
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>
 </TabsContent>

 <TabsContent value="paste" className="flex-1 flex flex-col overflow-hidden mt-4">
 <Alert className="mb-3">
 <Info className="h-4 w-4" />
 <AlertDescription className="text-xs">
 Excel'den kopyalayıp buraya yapıştırın. Format: Öğrenci No/Ad [Tab] D [Tab] Y [Tab] B ... 
 (Her satır bir öğrenci, her ders için D-Y-B değerleri)
 </AlertDescription>
 </Alert>

 <textarea
 value={pasteData}
 onChange={(e) => setPasteData(e.target.value)}
 className="flex-1 w-full p-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
 placeholder="Öğrenci verilerini buraya yapıştırın..."
 />

 <div className="flex justify-end gap-2 mt-3">
 <Button variant="outline" onClick={() => setPasteData('')}>
 Temizle
 </Button>
 <Button onClick={handlePasteData} disabled={!pasteData.trim()}>
 <ClipboardPaste className="h-4 w-4 mr-2" />
 Verileri İşle
 </Button>
 </div>
 </TabsContent>
 </Tabs>

 <div className="flex justify-between items-center pt-3 border-t">
 <Button
 variant="outline"
 onClick={() => {
 setResults(new Map());
 setPasteData('');
 setErrors([]);
 }}
 >
 Tümünü Temizle
 </Button>
 <Button 
 onClick={handleSaveAll} 
 disabled={!hasAnyData || isSaving || errors.length > 0}
 size="lg"
 className="min-w-[180px]"
 >
 {isSaving ? (
 <>
 <Loader2 className="h-4 w-4 mr-2" />
 Kaydediliyor...
 </>
 ) : (
 <>
 <Save className="h-4 w-4 mr-2" />
 Tümünü Kaydet ({totalStudentsWithData})
 </>
 )}
 </Button>
 </div>
 </DialogContent>
 </Dialog>
 );
}
