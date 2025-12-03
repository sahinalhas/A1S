import { useState } from "react";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
 DialogFooter,
} from "@/components/organisms/Dialog";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Label } from "@/components/atoms/Label";
import { ScrollArea } from "@/components/organisms/ScrollArea";
import { Separator } from "@/components/atoms/Separator";
import { FileText, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
 getScheduleTemplates,
 applyScheduleTemplate,
 type ScheduleTemplate,
} from "@/lib/storage";
import { toast } from "sonner";

export default function ScheduleTemplateDialog({
 studentId,
 onApplied,
}: {
 studentId: string;
 onApplied?: () => void;
}) {
 const [open, setOpen] = useState(false);
 const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
 const [replaceExisting, setReplaceExisting] = useState(false);
 const [applying, setApplying] = useState(false);
 const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

 const templates = getScheduleTemplates();
 const selected = templates.find((t) => t.id === selectedTemplate);

 const filteredTemplates = selectedCategory === null 
 ? templates 
 : templates.filter((t) => t.category === selectedCategory);

 const handleApply = async () => {
 if (!selectedTemplate) {
 toast.error("Lütfen bir şablon seçin");
 return;
 }

 setApplying(true);
 try {
 await applyScheduleTemplate(selectedTemplate, studentId, replaceExisting);
 setOpen(false);
 setSelectedTemplate(null);
 setReplaceExisting(false);
 onApplied?.();
 } catch (error) {
 console.error("Error applying template:", error);
 } finally {
 setApplying(false);
 }
 };

 const getDifficultyColor = (difficulty: string) => {
 switch (difficulty) {
 case"Kolay":
 return"bg-green-50 text-green-700 border-green-200";
 case"Orta":
 return"bg-blue-50 text-blue-700 border-blue-200";
 case"Yoğun":
 return"bg-orange-50 text-orange-700 border-orange-200";
 case"Çok Yoğun":
 return"bg-red-50 text-red-700 border-red-200";
 default:
 return"bg-gray-50 text-gray-700 border-gray-200";
 }
 };

 const getCategoryColor = (category: string) => {
 switch (category) {
 case"LGS":
 return"bg-purple-100 text-purple-800";
 case"TYT":
 return"bg-blue-100 text-blue-800";
 case"AYT":
 return"bg-green-100 text-green-800";
 case"YDT":
 return"bg-amber-100 text-amber-800";
 case"YKS":
 return"bg-indigo-100 text-indigo-800";
 default:
 return"bg-gray-100 text-gray-800";
 }
 };

 return (
 <Dialog open={open} onOpenChange={setOpen}>
 <DialogTrigger asChild>
 <Button variant="outline" size="sm">
 <FileText className="h-4 w-4 mr-2" />
 Şablon Kullan
 </Button>
 </DialogTrigger>
 <DialogContent className="max-w-4xl max-h-[80vh]">
 <DialogHeader>
 <DialogTitle>Program Şablonları</DialogTitle>
 <DialogDescription>
 Hazır program şablonlarından birini seçip hızlıca başlayın
 </DialogDescription>
 </DialogHeader>

 <div className="mb-4 flex flex-wrap gap-2">
 <Badge 
 variant={selectedCategory === null ? "default" : "outline"}
 className="cursor-pointer"
 onClick={() => setSelectedCategory(null)}
 >
 Tümü
 </Badge>
 {["LGS", "TYT", "AYT", "YDT"].map((cat) => (
 <Badge
 key={cat}
 variant={selectedCategory === cat ? "default" : "outline"}
 className={`cursor-pointer ${getCategoryColor(cat)}`}
 onClick={() => setSelectedCategory(cat)}
 >
 {cat}
 </Badge>
 ))}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <ScrollArea className="h-[400px] pr-4">
 <div className="space-y-3">
 {filteredTemplates.map((template) => (
 <div
 key={template.id}
 className={`p-4 rounded-lg border-2 cursor-pointer ${
 selectedTemplate === template.id
 ?"border-primary bg-primary/5"
 :"border-border"
 }`}
 onClick={() => setSelectedTemplate(template.id)}
 >
 <div className="flex items-start justify-between gap-2 mb-2">
 <div className="flex-1 min-w-0">
 <h3 className="font-semibold text-sm truncate">
 {template.name}
 </h3>
 <p className="text-xs text-muted-foreground mt-1">
 {template.description}
 </p>
 </div>
 {selectedTemplate === template.id && (
 <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
 )}
 </div>

 <div className="flex flex-wrap gap-2 mt-3">
 <Badge
 variant="outline"
 className={getCategoryColor(template.category)}
 >
 {template.category}
 </Badge>
 <Badge
 variant="outline"
 className={getDifficultyColor(template.difficulty)}
 >
 {template.difficulty}
 </Badge>
 <Badge variant="outline" className="gap-1">
 <Clock className="h-3 w-3" />
 {template.estimatedWeeklyHours} saat/hafta
 </Badge>
 </div>

 <div className="flex flex-wrap gap-1 mt-2">
 {template.tags.slice(0, 3).map((tag) => (
 <span
 key={tag}
 className="text-[10px] px-1.5 py-0.5 bg-muted rounded"
 >
 {tag}
 </span>
 ))}
 </div>
 </div>
 ))}
 </div>
 </ScrollArea>

 <div className="border rounded-lg p-4">
 {selected ? (
 <div className="space-y-4">
 <div>
 <h3 className="font-semibold mb-2">{selected.name}</h3>
 <p className="text-sm text-muted-foreground">
 {selected.description}
 </p>
 </div>

 <Separator />

 <div>
 <h4 className="text-sm font-medium mb-2">Dersler</h4>
 <div className="flex flex-wrap gap-1.5">
 {selected.subjects.map((subject) => (
 <Badge key={subject.id} variant="secondary" className="text-xs">
 {subject.name}
 </Badge>
 ))}
 </div>
 </div>

 <div>
 <h4 className="text-sm font-medium mb-2">
 Haftalık Program Detayı
 </h4>
 <div className="space-y-1 text-xs">
 <div className="flex items-center gap-2">
 <Clock className="h-3 w-3 text-muted-foreground" />
 <span>
 Toplam {selected.estimatedWeeklyHours} saat çalışma
 </span>
 </div>
 <div className="flex items-center gap-2">
 <FileText className="h-3 w-3 text-muted-foreground" />
 <span>{selected.slots.length} ders bloğu</span>
 </div>
 </div>
 </div>

 <Separator />

 <div className="space-y-3">
 <div className="flex items-start gap-2">
 <Checkbox
 id="replace"
 checked={replaceExisting}
 onCheckedChange={(checked) =>
 setReplaceExisting(checked as boolean)
 }
 />
 <div className="grid gap-1.5 leading-none">
 <Label
 htmlFor="replace"
 className="text-sm font-normal cursor-pointer"
 >
 Mevcut programı değiştir
 </Label>
 <p className="text-xs text-muted-foreground">
 {replaceExisting
 ?"Tüm mevcut dersler silinip şablon uygulanacak"
 :"Şablon mevcut programa eklenecek"}
 </p>
 </div>
 </div>

 {replaceExisting && (
 <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200">
 <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
 <p className="text-xs text-amber-800">
 Dikkat: Mevcut tüm ders bloklarınız silinecek ve geri
 alınamayacak!
 </p>
 </div>
 )}
 </div>
 </div>
 ) : (
 <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
 Sol taraftan bir şablon seçin
 </div>
 )}
 </div>
 </div>

 <DialogFooter>
 <Button variant="outline" onClick={() => setOpen(false)}>
 İptal
 </Button>
 <Button onClick={handleApply} disabled={!selectedTemplate || applying}>
 {applying ?"Uygulanıyor..." :"Şablonu Uygula"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 );
}
