import { useState, useCallback } from 'react';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
} from '@/components/organisms/Dialog';
import { Button } from '@/components/atoms/Button';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { Progress } from '@/components/atoms/Progress';
import { Badge } from '@/components/atoms/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/organisms/Table';
import {
 Upload,
 FileSpreadsheet,
 Loader2,
 CheckCircle2,
 Download,
 Info,
 AlertCircle,
 FileCheck,
 AlertTriangle,
 X,
} from 'lucide-react';
import type { ExamSession } from '../../../shared/types/exam-management.types';

interface EnhancedExcelImportProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 session: ExamSession;
 onImport: (sessionId: string, file: File) => Promise<{ 
 success: boolean; 
 message: string;
 imported_count?: number;
 errors?: Array<{ row: number; message: string; student?: string }>;
 }>;
 onDownloadTemplate: (examTypeId: string) => void;
}

interface PreviewData {
 studentId: string;
 studentName: string;
 subjects: Record<string, { correct: number; wrong: number; empty: number }>;
}

export function EnhancedExcelImport({
 open,
 onOpenChange,
 session,
 onImport,
 onDownloadTemplate,
}: EnhancedExcelImportProps) {
 const [isDragging, setIsDragging] = useState(false);
 const [isUploading, setIsUploading] = useState(false);
 const [uploadProgress, setUploadProgress] = useState(0);
 const [uploadResult, setUploadResult] = useState<{ 
 success: boolean; 
 message: string;
 imported_count?: number;
 errors?: Array<{ row: number; message: string; student?: string }>;
 } | null>(null);
 const [previewData, setPreviewData] = useState<PreviewData[]>([]);
 const [activeTab, setActiveTab] = useState<'upload' | 'preview' | 'result'>('upload');
 const [selectedFile, setSelectedFile] = useState<File | null>(null);

 const handleDragOver = useCallback((e: React.DragEvent) => {
 e.preventDefault();
 setIsDragging(true);
 }, []);

 const handleDragLeave = useCallback((e: React.DragEvent) => {
 e.preventDefault();
 setIsDragging(false);
 }, []);

 const handleDrop = useCallback(
 async (e: React.DragEvent) => {
 e.preventDefault();
 setIsDragging(false);

 const files = Array.from(e.dataTransfer.files);
 const excelFile = files.find(
 (file) =>
 file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
 file.type === 'application/vnd.ms-excel' ||
 file.name.endsWith('.xlsx') ||
 file.name.endsWith('.xls')
 );

 if (excelFile) {
 setSelectedFile(excelFile);
 await processFilePreview(excelFile);
 } else {
 setUploadResult({
 success: false,
 message: 'Lütfen geçerli bir Excel dosyası yükleyin (.xlsx veya .xls)',
 });
 }
 },
 []
 );

 const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 setSelectedFile(file);
 await processFilePreview(file);
 }
 e.target.value = '';
 };

 const processFilePreview = async (file: File) => {
 try {
 const XLSX = await import('xlsx');
 const buffer = await file.arrayBuffer();
 const workbook = XLSX.read(buffer, { type: 'array', codepage: 65001 });
 const sheetName = workbook.SheetNames[0];
 const worksheet = workbook.Sheets[sheetName];
 const data: unknown[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

 if (!data || data.length === 0) {
 setUploadResult({
 success: false,
 message: 'Excel dosyası boş veya geçersiz',
 });
 return;
 }

 const parsedData: PreviewData[] = [];

 data.forEach((row) => {
 const studentId = row['Öğrenci No'] || row['Ogrenci No'] || row['Student ID'] || '';
 const studentName = row['Öğrenci Adı'] || row['Ogrenci Adi'] || row['Student Name'] || '';

 if (!studentId && !studentName) return;

 const subjects: Record<string, { correct: number; wrong: number; empty: number }> = {};
 
 Object.keys(row).forEach((key) => {
 if (key.includes(' - Doğru')) {
 const subjectName = key.replace(' - Doğru', '');
 const correct = parseInt(row[key]) || 0;
 const wrong = parseInt(row[`${subjectName} - Yanlış`]) || 0;
 const empty = parseInt(row[`${subjectName} - Boş`]) || 0;
 
 subjects[subjectName] = { correct, wrong, empty };
 }
 });

 parsedData.push({
 studentId: studentId.toString(),
 studentName: studentName.toString(),
 subjects,
 });
 });

 setPreviewData(parsedData);
 setActiveTab('preview');
 } catch (error) {
 console.error('Preview error:', error);
 setUploadResult({
 success: false,
 message: 'Dosya önizlemesi oluşturulamadı. Lütfen Excel formatını kontrol edin.',
 });
 }
 };

 const handleConfirmUpload = async () => {
 if (!selectedFile) return;

 setIsUploading(true);
 setUploadResult(null);
 setUploadProgress(0);
 setActiveTab('result');

 const progressInterval = setInterval(() => {
 setUploadProgress((prev) => {
 if (prev >= 90) return prev;
 return prev + 10;
 });
 }, 200);

 try {
 const result = await onImport(session.id, selectedFile);
 clearInterval(progressInterval);
 setUploadProgress(100);
 setUploadResult(result);

 if (result.success) {
 setTimeout(() => {
 onOpenChange(false);
 resetState();
 }, 3000);
 }
 } catch (error) {
 clearInterval(progressInterval);
 setUploadResult({
 success: false,
 message: 'Dosya yüklenirken bir hata oluştu',
 });
 } finally {
 setIsUploading(false);
 }
 };

 const resetState = () => {
 setUploadResult(null);
 setUploadProgress(0);
 setPreviewData([]);
 setSelectedFile(null);
 setActiveTab('upload');
 };

 const handleDownloadTemplate = () => {
 onDownloadTemplate(session.exam_type_id);
 };

 return (
 <Dialog open={open} onOpenChange={(open) => {
 onOpenChange(open);
 if (!open) resetState();
 }}>
 <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2 text-lg">
 <FileSpreadsheet className="h-5 w-5 text-primary" />
 Excel ile Toplu Giriş - Gelişmiş
 </DialogTitle>
 <DialogDescription>
 {session.name}
 </DialogDescription>
 </DialogHeader>

 <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
 <TabsList variant="nested">
 <TabsTrigger value="upload" variant="nested" disabled={isUploading}>
 <Upload className="h-4 w-4 mr-2" />
 Yükle
 </TabsTrigger>
 <TabsTrigger value="preview" variant="nested" disabled={!selectedFile || isUploading}>
 <FileCheck className="h-4 w-4 mr-2" />
 Önizleme
 </TabsTrigger>
 <TabsTrigger value="result" variant="nested" disabled={!uploadResult}>
 <CheckCircle2 className="h-4 w-4 mr-2" />
 Sonuç
 </TabsTrigger>
 </TabsList>

 {/* Upload Tab */}
 <TabsContent value="upload" className="flex-1 overflow-auto space-y-4">
 <Alert className="bg-primary/5 border-primary/20">
 <Info className="h-4 w-4 text-primary" />
 <AlertDescription className="text-xs space-y-2">
 <p className="font-medium text-foreground">3 Basit Adımda İçe Aktarın:</p>
 <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
 <li>Aşağıdaki"Şablon İndir" butonuna tıklayıp Excel şablonunu indirin</li>
 <li>Şablonu açın ve öğrenci bilgilerini ve sonuçları girin</li>
 <li>Dosyayı buraya sürükleyip bırakın veya"Dosya Seç" butonuna tıklayın</li>
 </ol>
 </AlertDescription>
 </Alert>

 <div className="flex gap-2">
 <Button
 onClick={handleDownloadTemplate}
 variant="outline"
 className="flex-1"
 size="lg"
 >
 <Download className="mr-2 h-5 w-5" />
 <div className="text-left">
 <div>Şablon İndir</div>
 <div className="text-xs text-muted-foreground font-normal">
 Öğrenci bilgileriyle hazır
 </div>
 </div>
 </Button>
 </div>

 <div
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 onDrop={handleDrop}
 className={`
 border-2 border-dashed rounded-xl p-12 text-center 
 ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
 ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
 `}
 >
 <input
 type="file"
 id="excel-upload-enhanced"
 className="hidden"
 accept=".xlsx,.xls"
 onChange={handleFileSelect}
 disabled={isUploading}
 />
 <label
 htmlFor="excel-upload-enhanced"
 className="cursor-pointer flex flex-col items-center gap-4"
 >
 <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
 <Upload className="h-10 w-10 text-primary" />
 </div>
 <div className="space-y-2">
 <p className="text-lg font-medium">
 Dosyayı sürükleyip bırakın veya seçin
 </p>
 <p className="text-sm text-muted-foreground">
 Excel dosyaları (.xlsx, .xls) kabul edilir
 </p>
 {selectedFile && (
 <Badge variant="secondary" className="mt-2">
 {selectedFile.name}
 </Badge>
 )}
 </div>
 </label>
 </div>
 </TabsContent>

 {/* Preview Tab */}
 <TabsContent value="preview" className="flex-1 overflow-auto space-y-4">
 <Alert>
 <Info className="h-4 w-4" />
 <AlertDescription>
 Dosya içeriğini kontrol edin. Doğruysa"Onayla ve Yükle" butonuna tıklayın.
 </AlertDescription>
 </Alert>

 {selectedFile && (
 <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
 <div className="flex items-center gap-3">
 <FileSpreadsheet className="h-8 w-8 text-green-600" />
 <div>
 <p className="font-medium">{selectedFile.name}</p>
 <p className="text-sm text-muted-foreground">
 {(selectedFile.size / 1024).toFixed(2)} KB
 </p>
 </div>
 </div>
 <Badge variant="secondary">{previewData.length} öğrenci</Badge>
 </div>
 )}

 {previewData.length > 0 && (
 <div className="border rounded-lg overflow-auto max-h-96">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="sticky left-0 bg-muted/80 backdrop-blur z-10">Öğrenci No</TableHead>
 <TableHead className="sticky left-20 bg-muted/80 backdrop-blur z-10">Öğrenci Adı</TableHead>
 <TableHead>Ders Sayısı</TableHead>
 <TableHead>Toplam Soru</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {previewData.slice(0, 10).map((student, idx) => {
 const totalQuestions = Object.values(student.subjects).reduce(
 (sum, subject) => sum + subject.correct + subject.wrong + subject.empty,
 0
 );
 return (
 <TableRow key={idx}>
 <TableCell className="font-mono text-xs sticky left-0 bg-inherit">
 {student.studentId}
 </TableCell>
 <TableCell className="font-medium text-sm sticky left-20 bg-inherit">
 {student.studentName}
 </TableCell>
 <TableCell>
 <Badge variant="outline" className="text-xs">
 {Object.keys(student.subjects).length} ders
 </Badge>
 </TableCell>
 <TableCell className="text-sm text-muted-foreground">
 {totalQuestions} soru
 </TableCell>
 </TableRow>
 );
 })}
 {previewData.length > 10 && (
 <TableRow>
 <TableCell colSpan={4} className="text-center text-sm text-muted-foreground italic">
 ... ve {previewData.length - 10} öğrenci daha
 </TableCell>
 </TableRow>
 )}
 </TableBody>
 </Table>
 </div>
 )}

 <div className="flex gap-2 pt-4">
 <Button
 onClick={() => {
 setSelectedFile(null);
 setPreviewData([]);
 setActiveTab('upload');
 }}
 variant="outline"
 className="flex-1"
 >
 Geri
 </Button>
 <Button
 onClick={handleConfirmUpload}
 className="flex-1"
 disabled={isUploading}
 >
 Onayla ve Yükle
 </Button>
 </div>
 </TabsContent>

 {/* Result Tab */}
 <TabsContent value="result" className="flex-1 overflow-auto space-y-4">
 {isUploading && (
 <div className="flex flex-col items-center justify-center py-12 space-y-4">
 <Loader2 className="h-16 w-16 text-primary" />
 <div className="w-full max-w-md space-y-2">
 <Progress value={uploadProgress} className="h-2" />
 <p className="text-center text-sm font-medium text-primary">
 Yükleniyor... {uploadProgress}%
 </p>
 <p className="text-center text-xs text-muted-foreground">
 Lütfen bekleyin, sonuçlar işleniyor...
 </p>
 </div>
 </div>
 )}

 {uploadResult && !isUploading && (
 <div className="space-y-4">
 <Alert 
 variant={uploadResult.success ? 'default' : 'destructive'} 
 className={`border-l-4 ${uploadResult.success ? 'bg-green-50 border-green-500' : ''}`}
 >
 {uploadResult.success ? (
 <CheckCircle2 className="h-5 w-5 text-green-600" />
 ) : (
 <AlertCircle className="h-5 w-5" />
 )}
 <AlertDescription className="flex items-center justify-between">
 <div>
 <p className="font-medium">{uploadResult.message}</p>
 {uploadResult.imported_count !== undefined && (
 <p className="text-sm mt-1">
 {uploadResult.imported_count} sonuç başarıyla kaydedildi
 </p>
 )}
 </div>
 </AlertDescription>
 </Alert>

 {uploadResult.errors && uploadResult.errors.length > 0 && (
 <div className="space-y-2">
 <div className="flex items-center gap-2">
 <AlertTriangle className="h-4 w-4 text-amber-600" />
 <h4 className="font-medium text-sm">
 Hatalar ({uploadResult.errors.length})
 </h4>
 </div>
 <div className="border rounded-lg max-h-60 overflow-auto">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-20">Satır</TableHead>
 <TableHead>Öğrenci No</TableHead>
 <TableHead>Öğrenci Adı</TableHead>
 <TableHead>Hata Detayı</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {uploadResult.errors.map((error: any, idx) => (
 <TableRow key={idx}>
 <TableCell className="font-mono text-xs">{error.row}</TableCell>
 <TableCell className="text-xs font-mono">
 {error.student_id || '-'}
 </TableCell>
 <TableCell className="text-sm">
 {error.student_name || error.student || '-'}
 </TableCell>
 <TableCell className="text-sm text-destructive">
 {error.error || error instanceof Error ? error.message : String(error)}
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 </div>
 )}

 <div className="flex gap-2 pt-4">
 <Button
 onClick={() => {
 resetState();
 onOpenChange(false);
 }}
 className="flex-1"
 >
 Kapat
 </Button>
 </div>
 </div>
 )}
 </TabsContent>
 </Tabs>
 </DialogContent>
 </Dialog>
 );
}
