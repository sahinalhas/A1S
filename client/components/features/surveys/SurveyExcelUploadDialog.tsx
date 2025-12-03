import { useState } from "react";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
} from "@/components/organisms/Dialog";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent } from "@/components/organisms/Card";
import { Progress } from "@/components/atoms/Progress";
import { Alert, AlertDescription } from "@/components/atoms/Alert";
import {
 Upload,
 FileSpreadsheet,
 CheckCircle,
 AlertCircle,
 Download,
 Loader2
} from "lucide-react";
import { useToast } from "@/hooks/utils/toast.utils";
import { apiClient } from "@/lib/api/core/client";
import { SURVEY_ENDPOINTS } from "@/lib/constants/api-endpoints";
import { SurveyDistribution } from "@/lib/survey-types";

interface SurveyExcelUploadDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 distribution: SurveyDistribution;
 onUploadComplete?: () => void;
}

interface UploadResult {
 success: boolean;
 totalRows: number;
 successCount: number;
 errorCount: number;
 errors: Array<{
 row: number;
 studentId?: string;
 studentName?: string;
 error: string;
 }>;
}

export default function SurveyExcelUploadDialog({
 open,
 onOpenChange,
 distribution,
 onUploadComplete
}: SurveyExcelUploadDialogProps) {
 const { toast } = useToast();
 const [selectedFile, setSelectedFile] = useState<File | null>(null);
 const [uploading, setUploading] = useState(false);
 const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
 const [dragActive, setDragActive] = useState(false);

 const handleDrag = (e: React.DragEvent) => {
 e.preventDefault();
 e.stopPropagation();
 if (e.type ==="dragenter" || e.type ==="dragover") {
 setDragActive(true);
 } else if (e.type ==="dragleave") {
 setDragActive(false);
 }
 };

 const handleDrop = (e: React.DragEvent) => {
 e.preventDefault();
 e.stopPropagation();
 setDragActive(false);

 if (e.dataTransfer.files && e.dataTransfer.files[0]) {
 handleFileSelect(e.dataTransfer.files[0]);
 }
 };

 const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files && e.target.files[0]) {
 handleFileSelect(e.target.files[0]);
 }
 };

 const handleFileSelect = (file: File) => {
 const validExtensions = ['.xlsx', '.xls'];
 const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

 if (!validExtensions.includes(fileExtension)) {
 toast({
 title:"Geçersiz dosya",
 description:"Lütfen bir Excel dosyası (.xlsx veya .xls) seçin",
 variant:"destructive"
 });
 return;
 }

 setSelectedFile(file);
 setUploadResult(null);
 };

 const handleUpload = async () => {
 if (!selectedFile) {
 toast({
 title:"Dosya seçilmedi",
 description:"Lütfen yüklemek için bir Excel dosyası seçin",
 variant:"destructive"
 });
 return;
 }

 try {
 setUploading(true);
 setUploadResult(null);

 const formData = new FormData();
 formData.append('file', selectedFile);

 const response = await fetch(
 `${import.meta.env.VITE_API_BASE_URL || ''}/api/surveys/survey-responses/import/${distribution.id}`,
 {
 method: 'POST',
 body: formData,
 credentials: 'include'
 }
 );

 const result = await response.json();

 if (!response.ok) {
 throw new Error(result.error || 'Yükleme başarısız oldu');
 }

 setUploadResult(result);

 if (result.success) {
 toast({
 title:"Başarılı!",
 description: `${result.successCount} öğrenci yanıtı başarıyla yüklendi`
 });

 if (onUploadComplete) {
 onUploadComplete();
 }
 } else {
 toast({
 title:"Kısmi başarı",
 description: `${result.successCount} yanıt yüklendi, ${result.errorCount} hata oluştu`,
 variant:"destructive"
 });
 }
 } catch (error: unknown) {
 console.error('Excel upload error:', error);
 toast({
 title:"Hata",
 description: error instanceof Error ? error instanceof Error ? error.message : String(error) :"Excel dosyası yüklenirken hata oluştu",
 variant:"destructive"
 });
 } finally {
 setUploading(false);
 }
 };

 const handleClose = () => {
 setSelectedFile(null);
 setUploadResult(null);
 onOpenChange(false);
 };

 return (
 <Dialog open={open} onOpenChange={handleClose}>
 <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2">
 <FileSpreadsheet className="h-5 w-5" />
 Excel ile Toplu Yanıt Yükleme
 </DialogTitle>
 <DialogDescription>
 Sınıf listenizdeki öğrencilerin anket yanıtlarını Excel dosyası ile toplu olarak yükleyin
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-4">
 {/* Instructions */}
 <Alert>
 <AlertDescription>
 <div className="space-y-2">
 <p className="font-medium">Nasıl kullanılır:</p>
 <ol className="list-decimal list-inside space-y-1 text-sm">
 <li>Excel şablonunu indirin</li>
 <li>Öğrenci bilgilerini ve anket yanıtlarını doldurun</li>
 <li>Doldurduğunuz dosyayı buraya yükleyin</li>
 </ol>
 </div>
 </AlertDescription>
 </Alert>

 {/* File Upload Area */}
 <Card>
 <CardContent className="pt-6">
 <div
 className={`border-2 border-dashed rounded-lg p-8 text-center ${
 dragActive
 ? 'border-primary bg-primary/5'
 : 'border-gray-300'
 }`}
 onDragEnter={handleDrag}
 onDragLeave={handleDrag}
 onDragOver={handleDrag}
 onDrop={handleDrop}
 >
 {selectedFile ? (
 <div className="space-y-3">
 <FileSpreadsheet className="h-12 w-12 mx-auto text-green-600" />
 <div>
 <p className="font-medium">{selectedFile.name}</p>
 <p className="text-sm text-muted-foreground">
 {(selectedFile.size / 1024).toFixed(2)} KB
 </p>
 </div>
 <Button
 variant="outline"
 size="sm"
 onClick={() => setSelectedFile(null)}
 >
 Farklı dosya seç
 </Button>
 </div>
 ) : (
 <div className="space-y-3">
 <Upload className="h-12 w-12 mx-auto text-gray-400" />
 <div>
 <p className="font-medium">Excel dosyasını sürükleyin veya seçin</p>
 <p className="text-sm text-muted-foreground">
 .xlsx veya .xls formatında
 </p>
 </div>
 <div>
 <input
 type="file"
 id="file-upload"
 className="hidden"
 accept=".xlsx,.xls"
 onChange={handleFileInputChange}
 />
 <label htmlFor="file-upload">
 <Button variant="outline" asChild>
 <span className="cursor-pointer">
 Dosya Seç
 </span>
 </Button>
 </label>
 </div>
 </div>
 )}
 </div>
 </CardContent>
 </Card>

 {/* Upload Result */}
 {uploadResult && (
 <Card className={uploadResult.success ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
 <CardContent className="pt-6 space-y-3">
 <div className="flex items-center gap-2">
 {uploadResult.success ? (
 <CheckCircle className="h-5 w-5 text-green-600" />
 ) : (
 <AlertCircle className="h-5 w-5 text-yellow-600" />
 )}
 <p className="font-medium">
 {uploadResult.success ? 'Yükleme Başarılı' : 'Kısmi Başarı'}
 </p>
 </div>

 <div className="space-y-2">
 <div className="flex justify-between text-sm">
 <span>Toplam Satır:</span>
 <span className="font-medium">{uploadResult.totalRows}</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-green-600">Başarılı:</span>
 <span className="font-medium text-green-600">{uploadResult.successCount}</span>
 </div>
 {uploadResult.errorCount > 0 && (
 <div className="flex justify-between text-sm">
 <span className="text-red-600">Hatalı:</span>
 <span className="font-medium text-red-600">{uploadResult.errorCount}</span>
 </div>
 )}
 <Progress 
 value={(uploadResult.successCount / uploadResult.totalRows) * 100} 
 className="mt-2"
 />
 </div>

 {uploadResult.errors.length > 0 && (
 <div className="mt-4 max-h-40 overflow-y-auto">
 <p className="text-sm font-medium mb-2">Hatalar:</p>
 <div className="space-y-1">
 {uploadResult.errors.map((error, index) => (
 <div key={index} className="text-sm p-2 bg-white rounded border">
 <p className="font-medium">Satır {error.row}</p>
 {error.studentName && (
 <p className="text-muted-foreground">
 {error.studentName} ({error.studentId})
 </p>
 )}
 <p className="text-red-600">{error.error}</p>
 </div>
 ))}
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 )}

 {/* Actions */}
 <div className="flex justify-between gap-2 pt-4">
 <Button
 variant="outline"
 onClick={handleClose}
 >
 Kapat
 </Button>

 <div className="flex gap-2">
 <Button
 variant="secondary"
 disabled={uploading}
 onClick={() => {
 // Download template logic will be added in next step
 toast({
 title:"İndirme",
 description:"Excel şablonu dağıtım sayfasından indirilebilir"
 });
 }}
 >
 <Download className="mr-2 h-4 w-4" />
 Şablon İndir
 </Button>

 <Button
 onClick={handleUpload}
 disabled={!selectedFile || uploading}
 >
 {uploading ? (
 <>
 <Loader2 className="mr-2 h-4 w-4" />
 Yükleniyor...
 </>
 ) : (
 <>
 <Upload className="mr-2 h-4 w-4" />
 Yükle
 </>
 )}
 </Button>
 </div>
 </div>
 </div>
 </DialogContent>
 </Dialog>
 );
}
