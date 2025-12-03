import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { 
 Download, 
 Eye, 
 FileSpreadsheet, 
 Filter,
 Calendar,
 User
} from "lucide-react";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/organisms/Table";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/atoms/Select";
import { SurveyDistribution } from "@/lib/survey-types";
import { useToast } from "@/hooks/utils/toast.utils";
import { useSurveyResponses } from "@/hooks/features/surveys";

interface SurveyResponse {
 id: string;
 distributionId: string;
 studentId?: string;
 studentName?: string;
 responses: Record<string, any>;
 submittedAt: string;
 source:"EXCEL" |"ONLINE";
}

interface SurveyResponsesListProps {
 distributions: SurveyDistribution[];
}

export default function SurveyResponsesList({ distributions }: SurveyResponsesListProps) {
 const { toast } = useToast();
 const [selectedDistribution, setSelectedDistribution] = useState<string>("");
 
 const { data: responses = [], isLoading: loading } = useSurveyResponses(
 selectedDistribution || undefined
 );

 const handleExportExcel = async () => {
 if (!selectedDistribution) return;

 try {
 const XLSX = await import('xlsx');
 
 const exportData = responses.map((response, index) => ({
"Sıra": index + 1,
"Öğrenci": response.studentName ||"Anonim",
"Kaynak": response.source ==="EXCEL" ?"Excel" :"Online",
"Gönderim Tarihi": new Date(response.submittedAt).toLocaleDateString('tr-TR'),
"Gönderim Saati": new Date(response.submittedAt).toLocaleTimeString('tr-TR'),
 ...Object.fromEntries(
 Object.entries(response.responses).map(([key, value]) => [
 `Soru ${key}`,
 value
 ])
 )
 }));

 const worksheet = XLSX.utils.json_to_sheet(exportData);
 const workbook = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(workbook, worksheet,"Yanıtlar");

 const distribution = distributions.find(d => d.id === selectedDistribution);
 const fileName = `${distribution?.title || 'Anket'}_Yanitlar_${new Date().toISOString().split('T')[0]}.xlsx`;
 
 XLSX.writeFile(workbook, fileName);

 toast({
 title:"Başarılı",
 description:"Excel dosyası indirildi"
 });
 } catch (error) {
 console.error("Export error:", error);
 toast({
 title:"Hata",
 description:"Excel dosyası oluşturulamadı",
 variant:"destructive"
 });
 }
 };

 const getSourceBadge = (source: SurveyResponse["source"]) => {
 if (source ==="EXCEL") {
 return <Badge className="bg-green-100 text-green-700">Excel</Badge>;
 }
 return <Badge className="bg-blue-100 text-blue-700">Online</Badge>;
 };

 const selectedDist = distributions.find(d => d.id === selectedDistribution);

 return (
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle>Anket Yanıtları</CardTitle>
 <CardDescription>
 Gelen yanıtları görüntüleyin ve dışa aktarın
 </CardDescription>
 </div>
 {responses.length > 0 && (
 <Button onClick={handleExportExcel} variant="outline">
 <Download className="mr-2 h-4 w-4" />
 Excel İndir
 </Button>
 )}
 </div>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center gap-4">
 <div className="flex-1">
 <Select value={selectedDistribution} onValueChange={setSelectedDistribution}>
 <SelectTrigger>
 <SelectValue placeholder="Dağıtım seçin..." />
 </SelectTrigger>
 <SelectContent>
 {distributions.map((dist) => (
 <SelectItem key={dist.id} value={dist.id}>
 <div className="flex items-center gap-2">
 <span>{dist.title}</span>
 <Badge variant="secondary" className="text-xs">
 {dist.targetClasses?.join(', ') || 'Tümü'}
 </Badge>
 </div>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>

 {loading ? (
 <div className="text-center py-8 text-muted-foreground">
 <p>Yükleniyor...</p>
 </div>
 ) : !selectedDistribution ? (
 <div className="text-center py-12 text-muted-foreground">
 <Filter className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
 <p className="text-lg font-medium">Yanıtları görüntülemek için bir dağıtım seçin</p>
 <p className="text-sm mt-2">Yukarıdaki menüden bir anket dağıtımı seçerek başlayın</p>
 </div>
 ) : responses.length === 0 ? (
 <div className="text-center py-12 text-muted-foreground">
 <FileSpreadsheet className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
 <p className="text-lg font-medium">Henüz yanıt bulunmuyor</p>
 <p className="text-sm mt-2">
 Bu dağıtım için henüz yanıt kaydedilmemiş
 </p>
 </div>
 ) : (
 <>
 <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
 <span>Toplam {responses.length} yanıt</span>
 {selectedDist && (
 <span>
 {selectedDist.targetClasses?.join(', ') || 'Tüm Sınıflar'}
 </span>
 )}
 </div>

 <div className="border rounded-lg">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-12">#</TableHead>
 <TableHead>
 <div className="flex items-center gap-2">
 <User className="h-4 w-4" />
 Öğrenci
 </div>
 </TableHead>
 <TableHead>Kaynak</TableHead>
 <TableHead>
 <div className="flex items-center gap-2">
 <Calendar className="h-4 w-4" />
 Gönderim Tarihi
 </div>
 </TableHead>
 <TableHead>Yanıt Sayısı</TableHead>
 <TableHead className="text-right">İşlemler</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {responses.map((response, index) => (
 <TableRow key={response.id}>
 <TableCell className="font-medium">{index + 1}</TableCell>
 <TableCell>
 {response.studentName || (
 <span className="text-muted-foreground italic">Anonim</span>
 )}
 </TableCell>
 <TableCell>{getSourceBadge(response.source)}</TableCell>
 <TableCell>
 <div className="flex flex-col">
 <span>{new Date(response.submittedAt).toLocaleDateString('tr-TR')}</span>
 <span className="text-xs text-muted-foreground">
 {new Date(response.submittedAt).toLocaleTimeString('tr-TR')}
 </span>
 </div>
 </TableCell>
 <TableCell>
 <Badge variant="secondary">
 {Object.keys(response.responses).length} soru
 </Badge>
 </TableCell>
 <TableCell className="text-right">
 <Button 
 variant="ghost" 
 size="sm"
 onClick={() => {
 toast({
 title:"Yanıt Detayları",
 description: JSON.stringify(response.responses, null, 2)
 });
 }}
 >
 <Eye className="h-4 w-4 mr-2" />
 Detay
 </Button>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 </>
 )}
 </CardContent>
 </Card>
 );
}
