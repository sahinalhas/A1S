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
import { 
 Upload, 
 FileSpreadsheet, 
 Loader2, 
 CheckCircle2, 
 Download,
 Info,
 AlertCircle,
} from 'lucide-react';
import type { ExamSession } from '@shared/types/exam-management.types';

interface ExcelImportDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 session: ExamSession;
 onImport: (sessionId: string, file: File) => Promise<{ success: boolean; message: string }>;
 onDownloadTemplate: (examTypeId: string) => void;
}

export function ExcelImportDialog({
 open,
 onOpenChange,
 session,
 onImport,
 onDownloadTemplate,
}: ExcelImportDialogProps) {
 const [isDragging, setIsDragging] = useState(false);
 const [isUploading, setIsUploading] = useState(false);
 const [uploadProgress, setUploadProgress] = useState(0);
 const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(
 null
 );

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
 await handleFileUpload(excelFile);
 } else {
 setUploadResult({
 success: false,
 message: 'Lütfen geçerli bir Excel dosyası yükleyin (.xlsx veya .xls)',
 });
 }
 },
 [session.id]
 );

 const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 await handleFileUpload(file);
 }
 e.target.value = '';
 };

 const handleFileUpload = async (file: File) => {
 setIsUploading(true);
 setUploadResult(null);
 setUploadProgress(0);

 const progressInterval = setInterval(() => {
 setUploadProgress((prev) => {
 if (prev >= 90) return prev;
 return prev + 10;
 });
 }, 200);

 try {
 const result = await onImport(session.id, file);
 clearInterval(progressInterval);
 setUploadProgress(100);
 setUploadResult(result);
 
 if (result.success) {
 setTimeout(() => {
 onOpenChange(false);
 setUploadResult(null);
 setUploadProgress(0);
 }, 2000);
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

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-xl">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2 text-lg">
 <FileSpreadsheet className="h-5 w-5 text-primary" />
 Excel ile Toplu Giriş
 </DialogTitle>
 <DialogDescription>
 {session.name}
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-4">
 <Alert className="bg-primary/5 border-primary/20">
 <Info className="h-4 w-4 text-primary" />
 <AlertDescription className="text-xs space-y-1.5">
 <p className="font-medium text-foreground">Nasıl kullanılır?</p>
 <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
 <li>Şablon indirin ve Excel'de açın</li>
 <li>Öğrenci bilgilerini ve sonuçları girin</li>
 <li>Dosyayı buraya yükleyin</li>
 </ol>
 </AlertDescription>
 </Alert>

 <div
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 onDrop={handleDrop}
 className={`
 border-2 border-dashed rounded-xl p-8 text-center 
 ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
 ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
 `}
 >
 <input
 type="file"
 id="excel-upload"
 className="hidden"
 accept=".xlsx,.xls"
 onChange={handleFileSelect}
 disabled={isUploading}
 />
 <label
 htmlFor="excel-upload"
 className="cursor-pointer flex flex-col items-center gap-3"
 >
 {isUploading ? (
 <>
 <Loader2 className="h-10 w-10 text-primary" />
 <div className="w-full max-w-xs space-y-2">
 <Progress value={uploadProgress} className="h-1.5" />
 <p className="text-sm font-medium text-primary">
 {uploadProgress}%
 </p>
 </div>
 </>
 ) : (
 <>
 <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
 <Upload className="h-6 w-6 text-primary" />
 </div>
 <div className="space-y-1">
 <p className="text-sm font-medium">
 Dosya yükleyin veya sürükleyin
 </p>
 <p className="text-xs text-muted-foreground">
 .xlsx veya .xls formatı
 </p>
 </div>
 </>
 )}
 </label>
 </div>

 {uploadResult && (
 <Alert variant={uploadResult.success ? 'default' : 'destructive'} className="border-l-4">
 {uploadResult.success ? (
 <CheckCircle2 className="h-4 w-4 text-green-600" />
 ) : (
 <AlertCircle className="h-4 w-4" />
 )}
 <AlertDescription className="text-sm">
 {uploadResult.message}
 </AlertDescription>
 </Alert>
 )}

 <div className="flex gap-2">
 <Button
 variant="outline"
 className="flex-1"
 onClick={() => onDownloadTemplate(session.exam_type_id)}
 disabled={isUploading}
 size="sm"
 >
 <Download className="mr-2 h-4 w-4" />
 Şablon İndir
 </Button>
 <Button
 variant="ghost"
 onClick={() => onOpenChange(false)}
 disabled={isUploading}
 size="sm"
 >
 Kapat
 </Button>
 </div>
 </div>
 </DialogContent>
 </Dialog>
 );
}
