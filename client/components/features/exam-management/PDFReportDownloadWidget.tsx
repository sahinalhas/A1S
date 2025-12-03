import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card/card';
import { Button } from '@/components/atoms/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select/select';
import { Label } from '@/components/atoms/Label/label';
import { FileDown, Download, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

async function downloadPDFReport(studentId: string, examTypeId: string) {
 const response = await fetchWithSchool(`/api/exam-management/reports/detailed/${studentId}/${examTypeId}/pdf`);
 
 if (!response.ok) {
 const error = await response.json();
 throw new Error(error.error || 'Rapor indirilemedi');
 }
 
 const blob = await response.blob();
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `rapor-${studentId}-${new Date().toISOString().split('T')[0]}.pdf`;
 document.body.appendChild(a);
 a.click();
 window.URL.revokeObjectURL(url);
 document.body.removeChild(a);
 
 return true;
}

async function fetchReportPreview(studentId: string, examTypeId: string) {
 const response = await fetchWithSchool(`/api/exam-management/reports/detailed/${studentId}/${examTypeId}/data`);
 const result = await response.json();
 if (!result.success) throw new Error(result.error);
 return result.data;
}

interface PDFReportDownloadWidgetProps {
 studentId: string;
 examTypes: any[];
 studentName?: string;
}

export function PDFReportDownloadWidget({ studentId, examTypes, studentName }: PDFReportDownloadWidgetProps) {
 const [selectedExamType, setSelectedExamType] = useState('');

 const downloadMutation = useMutation({
 mutationFn: ({ studentId, examTypeId }: { studentId: string; examTypeId: string }) =>
 downloadPDFReport(studentId, examTypeId),
 onSuccess: () => {
 toast.success('Rapor başarıyla indirildi');
 },
 onError: (error: any) => {
 toast.error(error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Rapor indirilemedi');
 },
 });

 const previewMutation = useMutation({
 mutationFn: ({ studentId, examTypeId }: { studentId: string; examTypeId: string }) =>
 fetchReportPreview(studentId, examTypeId),
 });

 const handleDownload = () => {
 if (!selectedExamType) {
 toast.error('Lütfen sınav türü seçin');
 return;
 }
 downloadMutation.mutate({ studentId, examTypeId: selectedExamType });
 };

 const handlePreview = () => {
 if (!selectedExamType) {
 toast.error('Lütfen sınav türü seçin');
 return;
 }
 previewMutation.mutate({ studentId, examTypeId: selectedExamType });
 };

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <FileDown className="h-5 w-5 text-primary" />
 Gelişmiş PDF Rapor
 </CardTitle>
 <CardDescription>
 {studentName} için detaylı performans raporu oluşturun ve indirin
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="space-y-2">
 <Label>Sınav Türü</Label>
 <Select value={selectedExamType} onValueChange={setSelectedExamType}>
 <SelectTrigger>
 <SelectValue placeholder="Sınav türü seçin" />
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

 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
 <h4 className="font-medium mb-2 text-blue-900 flex items-center gap-2">
 <FileText className="h-4 w-4" />
 Rapor İçeriği
 </h4>
 <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
 <li>Öğrenci bilgileri ve özet performans</li>
 <li>Ders bazında detaylı performans analizi</li>
 <li>Hedef ilerleme durumu ve başarı oranları</li>
 <li>Benchmark karşılaştırmaları (sınıf, okul)</li>
 <li>Zaman analizi ve deneme sıklığı değerlendirmesi</li>
 <li>Tahminsel performans analizi ve risk değerlendirmesi</li>
 <li>Kişiselleştirilmiş öneriler ve gelişim planı</li>
 </ul>
 </div>

 <div className="flex gap-3">
 <Button
 onClick={handleDownload}
 disabled={downloadMutation.isPending || !selectedExamType}
 className="flex-1"
 >
 {downloadMutation.isPending ? (
 <>
 <Loader2 className="h-4 w-4 mr-2" />
 İndiriliyor...
 </>
 ) : (
 <>
 <Download className="h-4 w-4 mr-2" />
 PDF İndir
 </>
 )}
 </Button>
 <Button
 onClick={handlePreview}
 variant="outline"
 disabled={previewMutation.isPending || !selectedExamType}
 className="flex-1"
 >
 {previewMutation.isPending ? (
 <>
 <Loader2 className="h-4 w-4 mr-2" />
 Yükleniyor...
 </>
 ) : (
 <>
 <FileText className="h-4 w-4 mr-2" />
 Önizle
 </>
 )}
 </Button>
 </div>

 {previewMutation.data && (
 <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
 <h4 className="font-medium">Rapor Özeti</h4>
 <div className="grid grid-cols-2 gap-3 text-sm">
 <div>
 <span className="text-muted-foreground">Toplam Sınav:</span>
 <span className="ml-2 font-medium">{previewMutation.data.summary.total_exams}</span>
 </div>
 <div>
 <span className="text-muted-foreground">Ort. Performans:</span>
 <span className="ml-2 font-medium">{previewMutation.data.summary.avg_performance.toFixed(1)}</span>
 </div>
 <div>
 <span className="text-muted-foreground">Hedef Sayısı:</span>
 <span className="ml-2 font-medium">{previewMutation.data.goal_progress.length}</span>
 </div>
 <div>
 <span className="text-muted-foreground">Benchmark:</span>
 <span className="ml-2 font-medium">{previewMutation.data.benchmark_data.length} deneme</span>
 </div>
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 );
}
