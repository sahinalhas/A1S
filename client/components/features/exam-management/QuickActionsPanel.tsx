import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
import { Label } from '@/components/atoms/Label';
import {
 Zap,
 FileDown,
 FilePlus,
 FileSpreadsheet,
 TrendingUp,
 Download,
 Loader2,
 FileText,
 BarChart3,
 GitCompare,
 Upload,
} from 'lucide-react';
import { toast } from 'sonner';

async function fetchStudents() {
 const response = await fetchWithSchool('/api/students');
 if (!response.ok) throw new Error('Öğrenciler yüklenemedi');
 const data = await response.json();
 return data.data || [];
}

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

interface QuickActionsPanelProps {
 examTypes: any[];
 onNavigateToTab?: (tab: string) => void;
 onCreateSession?: () => void;
}

export function QuickActionsPanel({ examTypes, onNavigateToTab, onCreateSession }: QuickActionsPanelProps) {
 const [selectedStudent, setSelectedStudent] = useState('');
 const [selectedExamType, setSelectedExamType] = useState('');

 const { data: students = [] } = useQuery({
 queryKey: ['students'],
 queryFn: fetchStudents,
 });

 const downloadMutation = useMutation({
 mutationFn: ({ studentId, examTypeId }: { studentId: string; examTypeId: string }) =>
 downloadPDFReport(studentId, examTypeId),
 onSuccess: () => {
 toast.success('PDF rapor başarıyla indirildi');
 },
 onError: (error: any) => {
 toast.error(error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Rapor indirilemedi');
 },
 });

 const handleDownloadPDF = () => {
 if (!selectedStudent || !selectedExamType) {
 toast.error('Lütfen öğrenci ve sınav türü seçin');
 return;
 }
 downloadMutation.mutate({ studentId: selectedStudent, examTypeId: selectedExamType });
 };

 return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card className="border-2 border-primary/20">
 <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 border-b">
 <CardTitle className="flex items-center gap-2 text-lg">
 <FileDown className="h-5 w-5 text-primary" />
 PDF Rapor İndirme
 </CardTitle>
 <CardDescription>
 Öğrenci performans raporu oluşturun ve indirin
 </CardDescription>
 </CardHeader>
 <CardContent className="pt-6 space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="quick-student">Öğrenci</Label>
 <Select value={selectedStudent} onValueChange={setSelectedStudent}>
 <SelectTrigger id="quick-student">
 <SelectValue placeholder="Öğrenci seçin" />
 </SelectTrigger>
 <SelectContent>
 {students.map((student: any) => (
 <SelectItem key={student.id} value={student.id}>
 {student.fullName || student.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label htmlFor="quick-exam-type">Sınav Türü</Label>
 <Select value={selectedExamType} onValueChange={setSelectedExamType}>
 <SelectTrigger id="quick-exam-type">
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
 </div>

 {selectedStudent && selectedExamType && (
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
 <div className="flex items-start gap-2">
 <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
 <div className="text-xs text-blue-800 space-y-1">
 <p className="font-medium">Rapor İçeriği:</p>
 <ul className="list-disc list-inside space-y-0.5 ml-2">
 <li>Detaylı performans analizi</li>
 <li>Ders bazında değerlendirme</li>
 <li>Hedef ilerleme durumu</li>
 <li>Tahminsel analiz ve öneriler</li>
 </ul>
 </div>
 </div>
 </div>
 )}

 <Button
 onClick={handleDownloadPDF}
 disabled={downloadMutation.isPending || !selectedStudent || !selectedExamType}
 className="w-full"
 size="lg"
 >
 {downloadMutation.isPending ? (
 <>
 <Loader2 className="h-4 w-4 mr-2" />
 İndiriliyor...
 </>
 ) : (
 <>
 <Download className="h-4 w-4 mr-2" />
 PDF Rapor İndir
 </>
 )}
 </Button>
 </CardContent>
 </Card>

 <Card className="border-2 border-accent/20">
 <CardHeader className="bg-gradient-to-br from-accent/10 to-accent/5 border-b">
 <CardTitle className="flex items-center gap-2 text-lg">
 <Zap className="h-5 w-5 text-accent-foreground" />
 Hızlı Aksiyonlar
 </CardTitle>
 <CardDescription>
 Sık kullanılan işlemlere hızlı erişim
 </CardDescription>
 </CardHeader>
 <CardContent className="pt-6">
 <div className="grid grid-cols-1 gap-3">
 <Button
 variant="outline"
 className="h-auto flex items-start gap-3 p-4 justify-start border-2"
 onClick={onCreateSession}
 >
 <div className="p-2 bg-primary/10 rounded-lg">
 <FilePlus className="h-5 w-5 text-primary" />
 </div>
 <div className="text-left flex-1">
 <div className="font-semibold text-sm">Yeni Deneme Oluştur</div>
 <div className="text-xs text-muted-foreground mt-1">
 Hızlıca yeni bir deneme sınavı ekleyin
 </div>
 </div>
 </Button>

 <Button
 variant="outline"
 className="h-auto flex items-start gap-3 p-4 justify-start border-2"
 onClick={() => onNavigateToTab?.('practice-exams')}
 >
 <div className="p-2 bg-green-500/10 rounded-lg">
 <FileSpreadsheet className="h-5 w-5 text-green-600" />
 </div>
 <div className="text-left flex-1">
 <div className="font-semibold text-sm">Sonuç Girişi</div>
 <div className="text-xs text-muted-foreground mt-1">
 Deneme sonuçlarını girin veya Excel ile yükleyin
 </div>
 </div>
 </Button>

 <Button
 variant="outline"
 className="h-auto flex items-start gap-3 p-4 justify-start border-2"
 onClick={() => onNavigateToTab?.('analysis')}
 >
 <div className="p-2 bg-blue-500/10 rounded-lg">
 <BarChart3 className="h-5 w-5 text-blue-600" />
 </div>
 <div className="text-left flex-1">
 <div className="font-semibold text-sm">Analiz Merkezi</div>
 <div className="text-xs text-muted-foreground mt-1">
 İstatistikler ve performans trendleri
 </div>
 </div>
 </Button>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
