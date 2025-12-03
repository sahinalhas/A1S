import { useState } from "react";
import { Evaluation360, addEvaluation360 } from "@/lib/storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/atoms/Select";
import { Users } from "lucide-react";

interface Degerlendirme360SectionProps {
 studentId: string;
 evaluations360: Evaluation360[];
 onUpdate: () => void;
}

export default function Degerlendirme360Section({ 
 studentId, 
 evaluations360, 
 onUpdate 
}: Degerlendirme360SectionProps) {
 const [evaluatorType, setEvaluatorType] = useState<string>("ÖĞRENCI");
 const [evaluatorName, setEvaluatorName] = useState<string>("");
 const [academic, setAcademic] = useState<string>("5");
 const [social, setSocial] = useState<string>("5");
 const [communication, setCommunication] = useState<string>("5");
 const [leadership, setLeadership] = useState<string>("5");
 const [teamwork, setTeamwork] = useState<string>("5");

 const handleSave = () => {
 const scores = {
 academic: Number(academic),
 social: Number(social),
 communication: Number(communication),
 leadership: Number(leadership),
 teamwork: Number(teamwork),
 confidence: 5,
 motivation: 5,
 timeManagement: 5,
 problemSolving: 5,
 creativity: 5,
 };
 const overallRating = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;

 const eval360: Evaluation360 = {
 id: crypto.randomUUID(),
 studentId,
 evaluatorType: evaluatorType as any,
 evaluatorName: evaluatorName || undefined,
 academicPerformance: scores.academic,
 socialSkills: scores.social,
 communication: scores.communication,
 leadership: scores.leadership,
 teamwork: scores.teamwork,
 selfConfidence: scores.confidence,
 motivation: scores.motivation,
 timeManagement: scores.timeManagement,
 problemSolving: scores.problemSolving,
 creativity: scores.creativity,
 overallRating,
 evaluationDate: new Date().toISOString(),
 };
 addEvaluation360(eval360);
 setEvaluatorName("");
 setAcademic("5");
 setSocial("5");
 setCommunication("5");
 setLeadership("5");
 setTeamwork("5");
 onUpdate();
 };

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Users className="h-5 w-5" />
 360° Değerlendirme
 </CardTitle>
 <CardDescription>Çok yönlü değerlendirme (1-10 arası)</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 <div className="space-y-1">
 <label className="text-sm">Değerlendirici</label>
 <Select
 value={evaluatorType}
 onValueChange={setEvaluatorType}
 >
 <SelectTrigger>
 <SelectValue placeholder="Seçiniz" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="ÖĞRENCI">Öğrenci</SelectItem>
 <SelectItem value="ÖĞRETMEN">Öğretmen</SelectItem>
 <SelectItem value="VELİ">Veli</SelectItem>
 <SelectItem value="ARKADAŞ">Arkadaş</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-1">
 <label className="text-sm">Değerlendirici Adı</label>
 <Input 
 placeholder="İsim (opsiyonel)"
 value={evaluatorName}
 onChange={(e) => setEvaluatorName(e.target.value)}
 />
 </div>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
 <div className="space-y-1">
 <label className="text-sm">Akademik</label>
 <Input 
 type="number" 
 min="1" 
 max="10" 
 value={academic}
 onChange={(e) => setAcademic(e.target.value)} 
 />
 </div>
 <div className="space-y-1">
 <label className="text-sm">Sosyal</label>
 <Input 
 type="number" 
 min="1" 
 max="10" 
 value={social}
 onChange={(e) => setSocial(e.target.value)} 
 />
 </div>
 <div className="space-y-1">
 <label className="text-sm">İletişim</label>
 <Input 
 type="number" 
 min="1" 
 max="10" 
 value={communication}
 onChange={(e) => setCommunication(e.target.value)} 
 />
 </div>
 <div className="space-y-1">
 <label className="text-sm">Liderlik</label>
 <Input 
 type="number" 
 min="1" 
 max="10" 
 value={leadership}
 onChange={(e) => setLeadership(e.target.value)} 
 />
 </div>
 <div className="space-y-1">
 <label className="text-sm">Takım Çalışması</label>
 <Input 
 type="number" 
 min="1" 
 max="10" 
 value={teamwork}
 onChange={(e) => setTeamwork(e.target.value)} 
 />
 </div>
 </div>

 <Button 
 className="w-full"
 onClick={handleSave}
 >
 360° Değerlendirme Kaydet
 </Button>

 <div className="space-y-3">
 <h3 className="font-medium">Değerlendirme Geçmişi</h3>
 {evaluations360.map(evaluation => (
 <div key={evaluation.id} className="border rounded-lg p-4 space-y-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Badge variant="outline">{evaluation.evaluatorType}</Badge>
 {evaluation.evaluatorName && (
 <span className="text-sm text-muted-foreground">
 {evaluation.evaluatorName}
 </span>
 )}
 </div>
 <div className="text-right">
 <div className="text-sm text-muted-foreground">Genel Puan</div>
 <div className="font-medium">{evaluation.overallRating.toFixed(1)}/10</div>
 </div>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
 <div>Akademik: {evaluation.academicPerformance}/10</div>
 <div>Sosyal: {evaluation.socialSkills}/10</div>
 <div>İletişim: {evaluation.communication}/10</div>
 <div>Liderlik: {evaluation.leadership}/10</div>
 <div>Takım: {evaluation.teamwork}/10</div>
 </div>

 <div className="text-xs text-muted-foreground">
 {new Date(evaluation.evaluationDate).toLocaleDateString()}
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 );
}