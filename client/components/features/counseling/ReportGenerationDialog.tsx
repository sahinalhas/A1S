import { useState } from "react";
import { FileText, Download, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { cn } from "@/lib/utils";

import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from "@/components/organisms/Dialog";
import { Button } from "@/components/atoms/Button";
import { Label } from "@/components/atoms/Label";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/organisms/Popover";
import { Calendar } from "@/components/organisms/Calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Separator } from "@/components/atoms/Separator";
import { Badge } from "@/components/atoms/Badge";

interface ReportGenerationDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 onGenerate: (options: ReportOptions) => Promise<void>;
 sessionCount: number;
 outcomeCount: number;
}

export interface ReportOptions {
 format: 'pdf' | 'excel';
 includeSessions: boolean;
 includeOutcomes: boolean;
 dateRange?: {
 start: Date;
 end: Date;
 };
 title?: string;
}

export default function ReportGenerationDialog({
 open,
 onOpenChange,
 onGenerate,
 sessionCount,
 outcomeCount,
}: ReportGenerationDialogProps) {
 const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf');
 const [includeSessions, setIncludeSessions] = useState(true);
 const [includeOutcomes, setIncludeOutcomes] = useState(true);
 const [useDateRange, setUseDateRange] = useState(false);
 const [startDate, setStartDate] = useState<Date | undefined>();
 const [endDate, setEndDate] = useState<Date | undefined>();
 const [isGenerating, setIsGenerating] = useState(false);
 const [startDateOpen, setStartDateOpen] = useState(false);
 const [endDateOpen, setEndDateOpen] = useState(false);

 const handleGenerate = async () => {
 if (!includeSessions && !includeOutcomes) {
 return;
 }

 if (reportFormat === 'excel' && includeOutcomes && !includeSessions) {
 return;
 }

 setIsGenerating(true);
 try {
 const options: ReportOptions = {
 format: reportFormat,
 includeSessions,
 includeOutcomes,
 dateRange: useDateRange && startDate && endDate ? { start: startDate, end: endDate } : undefined,
 };

 await onGenerate(options);
 
 setIncludeSessions(true);
 setIncludeOutcomes(true);
 setUseDateRange(false);
 setStartDate(undefined);
 setEndDate(undefined);
 setReportFormat('pdf');
 
 onOpenChange(false);
 } finally {
 setIsGenerating(false);
 }
 };

 const canGenerate = (includeSessions || includeOutcomes) && 
 (!useDateRange || (startDate && endDate)) &&
 !(reportFormat === 'excel' && includeOutcomes && !includeSessions);

 const getEstimatedRecords = () => {
 let count = 0;
 if (includeSessions) count += sessionCount;
 if (includeOutcomes) count += outcomeCount;
 return count;
 };

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-md">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2">
 <FileText className="h-5 w-5" />
 Rapor Oluştur
 </DialogTitle>
 <DialogDescription>
 Görüşme ve sonuç raporunuzu özelleştirin ve indirin
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-6 py-4">
 <div className="space-y-3">
 <Label>Rapor Formatı</Label>
 <Select 
 value={reportFormat} 
 onValueChange={(value) => {
 if (value === 'excel' && includeOutcomes && !includeSessions) {
 return;
 }
 setReportFormat(value as 'pdf' | 'excel');
 }}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="pdf">
 <div className="flex items-center gap-2">
 <FileText className="h-4 w-4" />
 PDF Raporu
 </div>
 </SelectItem>
 <SelectItem value="excel" disabled={includeOutcomes && !includeSessions}>
 <div className="flex items-center gap-2">
 <FileText className="h-4 w-4" />
 Excel Tablosu {includeOutcomes && !includeSessions && '(Sadece görüşmeler için)'}
 </div>
 </SelectItem>
 </SelectContent>
 </Select>
 </div>

 <Separator />

 <div className="space-y-3">
 <Label>İçerik Seçimi</Label>
 
 <div className="space-y-2">
 <div className="flex items-center justify-between rounded-lg border p-3">
 <div className="flex items-center space-x-2">
 <Checkbox
 id="includeSessions"
 checked={includeSessions}
 onCheckedChange={(checked) => setIncludeSessions(checked as boolean)}
 />
 <Label htmlFor="includeSessions" className="text-sm font-normal cursor-pointer">
 Görüşmeler
 </Label>
 </div>
 <Badge variant="secondary">{sessionCount}</Badge>
 </div>

 <div className="flex items-center justify-between rounded-lg border p-3">
 <div className="flex items-center space-x-2">
 <Checkbox
 id="includeOutcomes"
 checked={includeOutcomes}
 onCheckedChange={(checked) => setIncludeOutcomes(checked as boolean)}
 />
 <Label htmlFor="includeOutcomes" className="text-sm font-normal cursor-pointer">
 Görüşme Sonuçları
 </Label>
 </div>
 <Badge variant="secondary">{outcomeCount}</Badge>
 </div>
 </div>

 {!includeSessions && !includeOutcomes && (
 <p className="text-sm text-destructive">En az bir içerik türü seçmelisiniz</p>
 )}
 {includeOutcomes && !includeSessions && reportFormat === 'excel' && (
 <p className="text-sm text-amber-600">
 Excel formatı sadece görüşmeler için desteklenmektedir. PDF formatını kullanın.
 </p>
 )}
 </div>

 <Separator />

 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <Label>Tarih Aralığı (Opsiyonel)</Label>
 <Checkbox
 id="useDateRange"
 checked={useDateRange}
 onCheckedChange={(checked) => setUseDateRange(checked as boolean)}
 />
 </div>

 {useDateRange && (
 <div className="space-y-3 pt-2">
 <div className="space-y-2">
 <Label htmlFor="startDate" className="text-sm text-muted-foreground">
 Başlangıç Tarihi
 </Label>
 <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
 <PopoverTrigger asChild>
 <Button
 id="startDate"
 variant="outline"
 className={cn(
"w-full justify-start text-left font-normal",
 !startDate &&"text-muted-foreground"
 )}
 >
 <CalendarIcon className="mr-2 h-4 w-4" />
 {startDate ? format(startDate,"PPP", { locale: tr }) :"Tarih seçin"}
 </Button>
 </PopoverTrigger>
 <PopoverContent className="w-auto p-0" align="start">
 <Calendar
 mode="single"
 selected={startDate}
 onSelect={(date) => {
 setStartDate(date);
 setStartDateOpen(false);
 }}
 disabled={(date) => endDate ? date > endDate : false}
 initialFocus
 locale={tr}
 />
 </PopoverContent>
 </Popover>
 </div>

 <div className="space-y-2">
 <Label htmlFor="endDate" className="text-sm text-muted-foreground">
 Bitiş Tarihi
 </Label>
 <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
 <PopoverTrigger asChild>
 <Button
 id="endDate"
 variant="outline"
 className={cn(
"w-full justify-start text-left font-normal",
 !endDate &&"text-muted-foreground"
 )}
 >
 <CalendarIcon className="mr-2 h-4 w-4" />
 {endDate ? format(endDate,"PPP", { locale: tr }) :"Tarih seçin"}
 </Button>
 </PopoverTrigger>
 <PopoverContent className="w-auto p-0" align="start">
 <Calendar
 mode="single"
 selected={endDate}
 onSelect={(date) => {
 setEndDate(date);
 setEndDateOpen(false);
 }}
 disabled={(date) => startDate ? date < startDate : false}
 initialFocus
 locale={tr}
 />
 </PopoverContent>
 </Popover>
 </div>

 {useDateRange && (!startDate || !endDate) && (
 <p className="text-sm text-destructive">
 Lütfen başlangıç ve bitiş tarihlerini seçin
 </p>
 )}
 </div>
 )}
 </div>

 <Separator />

 <div className="rounded-lg bg-muted p-3 text-sm">
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Tahmini Kayıt:</span>
 <span className="font-medium">{getEstimatedRecords()} kayıt</span>
 </div>
 </div>
 </div>

 <DialogFooter className="gap-2">
 <Button
 type="button"
 variant="outline"
 onClick={() => onOpenChange(false)}
 disabled={isGenerating}
 >
 İptal
 </Button>
 <Button
 type="button"
 onClick={handleGenerate}
 disabled={!canGenerate || isGenerating}
 >
 {isGenerating ? (
 <>
 <Loader2 className="mr-2 h-4 w-4" />
 Oluşturuluyor...
 </>
 ) : (
 <>
 <Download className="mr-2 h-4 w-4" />
 Rapor Oluştur
 </>
 )}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 );
}
