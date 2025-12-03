import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/atoms/Select';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import {
 Upload,
 Download,
 FileSpreadsheet,
 CheckCircle2,
 AlertCircle,
 Loader2,
} from 'lucide-react';
import { Progress } from '@/components/atoms/Progress';
import type { ExamSession } from '../../../shared/types/exam-management.types';

interface ExcelImportExportProps {
 sessions: ExamSession[];
 examTypeId: string;
 examTypeName: string;
 onImport: (sessionId: string, file: File) => Promise<{ success: boolean; message: string }>;
 onExport: (sessionId: string) => Promise<void>;
 onDownloadTemplate: (examTypeId: string) => Promise<void>;
}

export function ExcelImportExport({
 sessions,
 examTypeId,
 examTypeName,
 onImport,
 onExport,
 onDownloadTemplate,
}: ExcelImportExportProps) {
 const [selectedSession, setSelectedSession] = useState<string>('');
 const [isUploading, setIsUploading] = useState(false);
 const [isExporting, setIsExporting] = useState(false);
 const [uploadResult, setUploadResult] = useState<{
 success: boolean;
 message: string;
 } | null>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);

 const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
 const file = event.target.files?.[0];
 if (!file || !selectedSession) return;

 try {
 setIsUploading(true);
 setUploadResult(null);

 const result = await onImport(selectedSession, file);
 setUploadResult(result);

 if (fileInputRef.current) {
 fileInputRef.current.value = '';
 }
 } catch (error) {
 setUploadResult({
 success: false,
 message: 'Dosya yüklenirken bir hata oluştu',
 });
 } finally {
 setIsUploading(false);
 }
 };

 const handleExport = async () => {
 if (!selectedSession) return;

 try {
 setIsExporting(true);
 await onExport(selectedSession);
 } catch (error) {
 console.error('Export error:', error);
 } finally {
 setIsExporting(false);
 }
 };

 const handleDownloadTemplate = async () => {
 try {
 await onDownloadTemplate(examTypeId);
 } catch (error) {
 console.error('Template download error:', error);
 }
 };

 return (
 <div className="space-y-6">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <FileSpreadsheet className="h-5 w-5" />
 Excel Şablonu İndir
 </CardTitle>
 <CardDescription>
 {examTypeName} sınavları için boş Excel şablonunu indirin
 </CardDescription>
 </CardHeader>
 <CardContent>
 <Button onClick={handleDownloadTemplate} variant="outline" className="w-full sm:w-auto">
 <Download className="h-4 w-4 mr-2" />
 {examTypeName} Şablonunu İndir
 </Button>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Upload className="h-5 w-5" />
 Toplu Sonuç Yükle
 </CardTitle>
 <CardDescription>
 Doldurulmuş Excel dosyasını yükleyerek toplu sonuç girişi yapın
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <label className="text-sm font-medium">Deneme Sınavı Seç</label>
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

 {selectedSession && (
 <div className="space-y-3">
 <input
 ref={fileInputRef}
 type="file"
 accept=".xlsx,.xls"
 onChange={handleFileSelect}
 className="hidden"
 disabled={isUploading}
 />
 <Button
 onClick={() => fileInputRef.current?.click()}
 disabled={isUploading}
 className="w-full"
 >
 {isUploading ? (
 <>
 <Loader2 className="h-4 w-4 mr-2" />
 Yükleniyor...
 </>
 ) : (
 <>
 <Upload className="h-4 w-4 mr-2" />
 Excel Dosyası Seç
 </>
 )}
 </Button>

 {uploadResult && (
 <Alert
 variant={uploadResult.success ? 'default' : 'destructive'}
 className={uploadResult.success ? 'bg-green-50 border-green-200' : ''}
 >
 {uploadResult.success ? (
 <CheckCircle2 className="h-4 w-4 text-green-600" />
 ) : (
 <AlertCircle className="h-4 w-4" />
 )}
 <AlertDescription
 className={uploadResult.success ? 'text-green-800' : ''}
 >
 {uploadResult.message}
 </AlertDescription>
 </Alert>
 )}
 </div>
 )}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Download className="h-5 w-5" />
 Sonuçları Dışa Aktar
 </CardTitle>
 <CardDescription>
 Girilen sonuçları Excel formatında indirin
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <label className="text-sm font-medium">Deneme Sınavı Seç</label>
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

 {selectedSession && (
 <Button
 onClick={handleExport}
 disabled={isExporting}
 variant="outline"
 className="w-full"
 >
 {isExporting ? (
 <>
 <Loader2 className="h-4 w-4 mr-2" />
 İndiriliyor...
 </>
 ) : (
 <>
 <Download className="h-4 w-4 mr-2" />
 Excel Olarak İndir
 </>
 )}
 </Button>
 )}
 </CardContent>
 </Card>

 <Alert>
 <AlertCircle className="h-4 w-4" />
 <AlertDescription>
 <strong>Önemli:</strong> Excel dosyası yüklerken şablon formatını değiştirmemeye dikkat
 edin. Öğrenci isimleri ve sütun başlıkları olduğu gibi kalmalıdır.
 </AlertDescription>
 </Alert>
 </div>
 );
}
