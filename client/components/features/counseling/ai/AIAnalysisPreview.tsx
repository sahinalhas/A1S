import { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, Brain, Target, ListChecks, Calendar, Loader2 } from 'lucide-react';
import type { AISessionAnalysisResponse } from '@/../../shared/schemas/ai-session-analysis.schemas';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Card, CardContent } from '@/components/organisms/Card';
import {
 Drawer,
 DrawerContent,
 DrawerDescription,
 DrawerFooter,
 DrawerHeader,
 DrawerTitle,
} from '@/components/organisms/Drawer';
import { Separator } from '@/components/atoms/Separator';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Label } from '@/components/atoms/Label';
import { cn } from '@/lib/utils';

interface ApplySelections {
 summary: boolean;
 emotionalState: boolean;
 physicalState: boolean;
 cooperationLevel: boolean;
 communicationQuality: boolean;
 sessionFlow: boolean;
 studentParticipationLevel: boolean;
 actionItems: boolean[];
 followUp: boolean;
}

interface AIAnalysisPreviewProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 analysis: AISessionAnalysisResponse | null;
 isLoading: boolean;
 onApply: (selections: ApplySelections) => void;
}

export default function AIAnalysisPreview({
 open,
 onOpenChange,
 analysis,
 isLoading,
 onApply
}: AIAnalysisPreviewProps) {
 
 const [selections, setSelections] = useState<ApplySelections>({
 summary: true,
 emotionalState: true,
 physicalState: true,
 cooperationLevel: true,
 communicationQuality: true,
 sessionFlow: true,
 studentParticipationLevel: true,
 actionItems: [],
 followUp: true
 });

 const handleApply = () => {
 if (!analysis) return;

 const actionItemSelections = selections.actionItems.length > 0
 ? selections.actionItems
 : analysis.actionItems.map(() => true);

 onApply({
 ...selections,
 actionItems: actionItemSelections
 });

 onOpenChange(false);
 };

 const getConfidenceColor = (confidence: number) => {
 if (confidence >= 80) return 'text-emerald-600 bg-emerald-50';
 if (confidence >= 60) return 'text-amber-600 bg-amber-50';
 return 'text-rose-600 bg-rose-50';
 };

 const toggleAll = (value: boolean) => {
 setSelections({
 summary: value,
 emotionalState: value,
 physicalState: value,
 cooperationLevel: value,
 communicationQuality: value,
 sessionFlow: value,
 studentParticipationLevel: value,
 actionItems: analysis?.actionItems.map(() => value) || [],
 followUp: value
 });
 };

 return (
 <Drawer open={open} onOpenChange={onOpenChange}>
 <DrawerContent className="max-h-[90vh]">
 <DrawerHeader>
 <DrawerTitle className="flex items-center gap-2">
 <Sparkles className="h-5 w-5 text-violet-600" />
 AI Analiz Sonuçları
 </DrawerTitle>
 <DrawerDescription>
 Önerilen değerleri inceleyin ve uygulamak istediklerinizi seçin
 </DrawerDescription>
 </DrawerHeader>

 <div className="overflow-y-auto px-6 py-4 space-y-6">
 {isLoading ? (
 <div className="flex flex-col items-center justify-center py-12 space-y-4">
 <Loader2 className="h-8 w-8 text-violet-600" />
 <p className="text-sm text-muted-foreground">AI görüşme notlarını analiz ediyor...</p>
 </div>
 ) : analysis ? (
 <>
 {/* Güven Skoru */}
 <Card className="border-2 border-violet-200 bg-violet-50/50">
 <CardContent className="p-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Brain className="h-5 w-5 text-violet-600" />
 <div>
 <p className="font-semibold text-sm">AI Güven Skoru</p>
 <p className="text-xs text-muted-foreground">
 {analysis.formSuggestions.reasoning}
 </p>
 </div>
 </div>
 <Badge className={cn("text-sm font-bold", getConfidenceColor(analysis.formSuggestions.confidence))}>
 %{analysis.formSuggestions.confidence}
 </Badge>
 </div>
 </CardContent>
 </Card>

 {/* Hızlı Seçim */}
 <div className="flex items-center gap-3">
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={() => toggleAll(true)}
 >
 Tümünü Seç
 </Button>
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={() => toggleAll(false)}
 >
 Tümünü Kaldır
 </Button>
 </div>

 <Separator />

 {/* Profesyonel Özet */}
 <Card>
 <CardContent className="p-5 space-y-3">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-2">
 <CheckCircle2 className="h-5 w-5 text-emerald-600" />
 <h3 className="font-semibold">Profesyonel Özet</h3>
 </div>
 <Checkbox
 checked={selections.summary}
 onCheckedChange={(checked) =>
 setSelections({ ...selections, summary: !!checked })
 }
 />
 </div>
 <p className="text-sm text-muted-foreground leading-relaxed">
 {analysis.summary.professional}
 </p>
 
 {analysis.summary.keyTopics.length > 0 && (
 <div className="mt-3">
 <p className="text-xs font-medium mb-2">Ana Konular:</p>
 <div className="flex flex-wrap gap-2">
 {analysis.summary.keyTopics.map((topic, i) => (
 <Badge key={i} variant="secondary" className="text-xs">
 {topic}
 </Badge>
 ))}
 </div>
 </div>
 )}
 </CardContent>
 </Card>

 {/* Form Önerileri */}
 <Card>
 <CardContent className="p-5 space-y-4">
 <div className="flex items-center gap-2">
 <Target className="h-5 w-5 text-blue-600" />
 <h3 className="font-semibold">Form Değerlendirmeleri</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {[
 { key: 'emotionalState', label: 'Duygu Durumu', value: analysis.formSuggestions.emotionalState },
 { key: 'physicalState', label: 'Fiziksel Durum', value: analysis.formSuggestions.physicalState },
 { key: 'cooperationLevel', label: 'İşbirliği Seviyesi', value: `${analysis.formSuggestions.cooperationLevel}/5` },
 { key: 'communicationQuality', label: 'İletişim Kalitesi', value: analysis.formSuggestions.communicationQuality },
 { key: 'sessionFlow', label: 'Görüşme Seyri', value: analysis.formSuggestions.sessionFlow },
 { key: 'studentParticipationLevel', label: 'Katılım Düzeyi', value: analysis.formSuggestions.studentParticipationLevel },
 ].map((item) => (
 <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border bg-white">
 <div className="flex-1">
 <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
 <p className="text-sm font-semibold capitalize">{item.value}</p>
 </div>
 <Checkbox
 checked={selections[item.key as keyof ApplySelections] as boolean}
 onCheckedChange={(checked) =>
 setSelections({ ...selections, [item.key]: !!checked })
 }
 />
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Aksiyon Maddeleri */}
 {analysis.actionItems.length > 0 && (
 <Card>
 <CardContent className="p-5 space-y-3">
 <div className="flex items-center gap-2">
 <ListChecks className="h-5 w-5 text-amber-600" />
 <h3 className="font-semibold">Önerilen Aksiyon Maddeleri</h3>
 </div>
 <div className="space-y-2">
 {analysis.actionItems.map((item, index) => (
 <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-white">
 <Checkbox
 checked={selections.actionItems[index] !== false}
 onCheckedChange={(checked) => {
 const newActionItems = [...selections.actionItems];
 newActionItems[index] = !!checked;
 setSelections({ ...selections, actionItems: newActionItems });
 }}
 />
 <div className="flex-1">
 <p className="text-sm">{item.description}</p>
 <div className="flex gap-2 mt-2">
 <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
 {item.priority}
 </Badge>
 <Badge variant="outline" className="text-xs capitalize">
 {item.assignedTo}
 </Badge>
 <Badge variant="outline" className="text-xs">
 {item.category}
 </Badge>
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 )}

 {/* Takip Önerisi */}
 {analysis.followUpRecommendation.needed && (
 <Card className="border-2 border-orange-200 bg-orange-50/50">
 <CardContent className="p-5 space-y-3">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-2">
 <Calendar className="h-5 w-5 text-orange-600" />
 <h3 className="font-semibold">Takip Önerisi</h3>
 </div>
 <Checkbox
 checked={selections.followUp}
 onCheckedChange={(checked) =>
 setSelections({ ...selections, followUp: !!checked })
 }
 />
 </div>
 <p className="text-sm text-muted-foreground">
 {analysis.followUpRecommendation.reason}
 </p>
 {analysis.followUpRecommendation.suggestedDays && (
 <Badge variant="outline">
 {analysis.followUpRecommendation.suggestedDays} gün sonra
 </Badge>
 )}
 </CardContent>
 </Card>
 )}
 </>
 ) : (
 <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
 <XCircle className="h-12 w-12 text-muted-foreground/50" />
 <p className="text-sm text-muted-foreground">Analiz sonucu bulunamadı</p>
 </div>
 )}
 </div>

 <DrawerFooter className="border-t">
 <Button
 onClick={handleApply}
 disabled={!analysis || isLoading}
 className="w-full"
 >
 <CheckCircle2 className="h-4 w-4 mr-2" />
 Seçilenleri Uygula
 </Button>
 <Button
 variant="outline"
 onClick={() => onOpenChange(false)}
 className="w-full"
 >
 İptal
 </Button>
 </DrawerFooter>
 </DrawerContent>
 </Drawer>
 );
}
