import { useState, useEffect } from "react";
import { MultipleIntelligence, addMultipleIntelligence } from "@/lib/storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Brain } from "lucide-react";

interface KisilikProfiliSectionProps {
 studentId: string;
 multipleIntelligence: MultipleIntelligence | null;
 onUpdate: () => void;
}

export default function KisilikProfiliSection({ 
 studentId, 
 multipleIntelligence, 
 onUpdate 
}: KisilikProfiliSectionProps) {
 const [linguistic, setLinguistic] = useState<number>(5);
 const [logicalMathematical, setLogicalMathematical] = useState<number>(5);
 const [spatial, setSpatial] = useState<number>(5);
 const [musical, setMusical] = useState<number>(5);
 const [bodilyKinesthetic, setBodilyKinesthetic] = useState<number>(5);
 const [interpersonal, setInterpersonal] = useState<number>(5);
 const [intrapersonal, setIntrapersonal] = useState<number>(5);
 const [naturalistic, setNaturalistic] = useState<number>(5);

 // Form verilerini multipleIntelligence prop'u değiştiğinde güncelle
 useEffect(() => {
 if (multipleIntelligence) {
 setLinguistic(multipleIntelligence.linguistic ?? 5);
 setLogicalMathematical(multipleIntelligence.logicalMathematical ?? 5);
 setSpatial(multipleIntelligence.spatial ?? 5);
 setMusical(multipleIntelligence.musicalRhythmic ?? 5);
 setBodilyKinesthetic(multipleIntelligence.bodilyKinesthetic ?? 5);
 setInterpersonal(multipleIntelligence.interpersonal ?? 5);
 setIntrapersonal(multipleIntelligence.intrapersonal ?? 5);
 setNaturalistic(multipleIntelligence.naturalistic ?? 5);
 } else {
 // Veri yoksa varsayılan değerlere döndür
 setLinguistic(5);
 setLogicalMathematical(5);
 setSpatial(5);
 setMusical(5);
 setBodilyKinesthetic(5);
 setInterpersonal(5);
 setIntrapersonal(5);
 setNaturalistic(5);
 }
 }, [multipleIntelligence]);

 const handleSave = () => {
 const multipleIntel: MultipleIntelligence = {
 id: crypto.randomUUID(),
 studentId,
 linguistic: Number(linguistic),
 logicalMathematical: Number(logicalMathematical),
 spatial: Number(spatial),
 musicalRhythmic: Number(musical),
 bodilyKinesthetic: Number(bodilyKinesthetic),
 interpersonal: Number(interpersonal),
 intrapersonal: Number(intrapersonal),
 naturalistic: Number(naturalistic),
 existential: 5,
 assessmentDate: new Date().toISOString(),
 };
 addMultipleIntelligence(multipleIntel);
 onUpdate();
 };

 return (
 <div className="grid gap-4">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Brain className="h-5 w-5" />
 Çoklu Zeka Profili
 </CardTitle>
 <CardDescription>8 farklı zeka alanında kendini değerlendir (1-10 arası)</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="space-y-1">
 <label className="text-sm font-medium">Dilsel Zeka</label>
 <Input 
 type="number" 
 min="1" 
 max="10" 
 value={linguistic}
 onChange={(e) => setLinguistic(Number(e.target.value))}
 />
 </div>
 <div className="space-y-1">
 <label className="text-sm font-medium">Mantıksal-Matematik</label>
 <Input 
 type="number" 
 min="1" 
 max="10"
 value={logicalMathematical}
 onChange={(e) => setLogicalMathematical(Number(e.target.value))}
 />
 </div>
 <div className="space-y-1">
 <label className="text-sm font-medium">Uzamsal Zeka</label>
 <Input 
 type="number" 
 min="1" 
 max="10"
 value={spatial}
 onChange={(e) => setSpatial(Number(e.target.value))}
 />
 </div>
 <div className="space-y-1">
 <label className="text-sm font-medium">Müzikal Zeka</label>
 <Input 
 type="number" 
 min="1" 
 max="10"
 value={musical}
 onChange={(e) => setMusical(Number(e.target.value))}
 />
 </div>
 <div className="space-y-1">
 <label className="text-sm font-medium">Bedensel-Kinestetik</label>
 <Input 
 type="number" 
 min="1" 
 max="10"
 value={bodilyKinesthetic}
 onChange={(e) => setBodilyKinesthetic(Number(e.target.value))}
 />
 </div>
 <div className="space-y-1">
 <label className="text-sm font-medium">Kişilerarası</label>
 <Input 
 type="number" 
 min="1" 
 max="10"
 value={interpersonal}
 onChange={(e) => setInterpersonal(Number(e.target.value))}
 />
 </div>
 <div className="space-y-1">
 <label className="text-sm font-medium">İçsel</label>
 <Input 
 type="number" 
 min="1" 
 max="10"
 value={intrapersonal}
 onChange={(e) => setIntrapersonal(Number(e.target.value))}
 />
 </div>
 <div className="space-y-1">
 <label className="text-sm font-medium">Doğacı</label>
 <Input 
 type="number" 
 min="1" 
 max="10"
 value={naturalistic}
 onChange={(e) => setNaturalistic(Number(e.target.value))}
 />
 </div>
 </div>

 <Button
 className="w-full"
 onClick={handleSave}
 >
 Çoklu Zeka Profili Kaydet
 </Button>

 <div className="space-y-2">
 <h4 className="font-medium">Son Zeka Profili</h4>
 {!multipleIntelligence ? (
 <div className="text-sm text-muted-foreground">Henüz değerlendirme yok.</div>
 ) : (
 <div className="border rounded p-3 space-y-2">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
 <div>Dilsel: {multipleIntelligence.linguistic}/10</div>
 <div>Matematik: {multipleIntelligence.logicalMathematical}/10</div>
 <div>Uzamsal: {multipleIntelligence.spatial}/10</div>
 <div>Müzikal: {multipleIntelligence.musicalRhythmic}/10</div>
 <div>Bedensel: {multipleIntelligence.bodilyKinesthetic}/10</div>
 <div>Kişilerarası: {multipleIntelligence.interpersonal}/10</div>
 <div>İçsel: {multipleIntelligence.intrapersonal}/10</div>
 <div>Doğacı: {multipleIntelligence.naturalistic}/10</div>
 </div>
 <div className="text-xs text-muted-foreground">
 {new Date(multipleIntelligence.assessmentDate).toLocaleDateString()}
 </div>
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
