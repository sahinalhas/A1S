import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Achievement } from "@/lib/storage";
import { addAchievement as addAchievementAPI, getAchievementsByStudent } from "@/lib/api/endpoints/coaching.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Award, Trophy, TrendingUp } from "lucide-react";

interface IlerlemeTakibiSectionProps {
 studentId: string;
 onUpdate: () => void;
}

export default function IlerlemeTakibiSection({ 
 studentId, 
 onUpdate 
}: IlerlemeTakibiSectionProps) {
 const queryClient = useQueryClient();
 const [achievementTitle, setAchievementTitle] = useState<string>("");
 const [achievementDescription, setAchievementDescription] = useState<string>("");
 const [achievementCategory, setAchievementCategory] = useState<string>("GENEL");

 // Backend'den başarıları çek
 const { data: achievements = [], isLoading } = useQuery<Achievement[]>({
 queryKey: ['achievements', studentId],
 queryFn: () => getAchievementsByStudent(studentId),
 staleTime: 2 * 60 * 1000,
 });

 // Backend'e başarı ekle
 const addMutation = useMutation({
 mutationFn: (achievement: Achievement) => addAchievementAPI(achievement),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['achievements', studentId] });
 onUpdate();
 },
 });

 const categories = [
 { value:"GENEL", label:"Genel Başarı", color:"#3B82F6" },
 { value:"AKADEMİK", label:"Akademik", color:"#10B981" },
 { value:"SOSYAL", label:"Sosyal-Duygusal", color:"#8B5CF6" },
 { value:"DAVRANIŞ", label:"Davranış", color:"#F59E0B" },
 { value:"HEDEFLER", label:"Hedef Başarısı", color:"#FFD700" },
 ];

 const addNewAchievement = () => {
 if (!achievementTitle.trim()) return;

 const selectedCategory = categories.find(c => c.value === achievementCategory);
 
 const achievement: Achievement = {
 id: crypto.randomUUID(),
 studentId,
 type:"ROZETLeR",
 title: achievementTitle,
 description: achievementDescription,
 icon:"trophy",
 color: selectedCategory?.color ||"#3B82F6",
 points: 0,
 earnedAt: new Date().toISOString(),
 category: achievementCategory as"AKADEMİK" |"SOSYAL" |"KİŞİSEL" |"ÇALIŞMA" |"HEDEFLeR",
 criteria:"Rehber öğretmen tarafından eklendi"
 };
 
 addMutation.mutate(achievement);
 setAchievementTitle("");
 setAchievementDescription("");
 setAchievementCategory("GENEL");
 };

 return (
 <div className="grid gap-4">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <TrendingUp className="h-5 w-5" />
 Başarılar ve İlerlemeler
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
 <h4 className="font-medium">Yeni Başarı Ekle</h4>
 <div className="space-y-3">
 <div className="space-y-2">
 <label className="text-sm font-medium">Başarı Başlığı</label>
 <Input 
 placeholder="Örn: İngilizce sınavında tam puan aldı"
 value={achievementTitle}
 onChange={(e) => setAchievementTitle(e.target.value)}
 />
 </div>
 
 <div className="space-y-2">
 <label className="text-sm font-medium">Açıklama</label>
 <Textarea
 placeholder="Başarı hakkında detaylar..."
 value={achievementDescription}
 onChange={(e) => setAchievementDescription(e.target.value)}
 rows={2}
 />
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Kategori</label>
 <div className="flex flex-wrap gap-2">
 {categories.map(category => (
 <Button
 key={category.value}
 type="button"
 size="sm"
 variant={achievementCategory === category.value ?"default" :"outline"}
 onClick={() => setAchievementCategory(category.value)}
 >
 {category.label}
 </Button>
 ))}
 </div>
 </div>

 <Button 
 onClick={addNewAchievement} 
 className="w-full"
 disabled={addMutation.isPending}
 >
 <Award className="mr-2 h-4 w-4" />
 {addMutation.isPending ?"Kaydediliyor..." :"Başarıyı Kaydet"}
 </Button>
 </div>
 </div>

 <div className="space-y-3">
 <h4 className="font-medium">Kaydedilen Başarılar</h4>
 {isLoading ? (
 <div className="text-center py-8 text-muted-foreground">
 Başarılar yükleniyor...
 </div>
 ) : achievements.length === 0 ? (
 <div className="text-center py-8 text-muted-foreground">
 <Award className="h-12 w-12 mx-auto mb-3 opacity-20" />
 <p>Henüz başarı kaydı eklenmemiş</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {achievements.map(achievement => (
 <div key={achievement.id} className="border rounded-lg p-4 space-y-3">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 <div 
 className="w-8 h-8 rounded-full flex items-center justify-center" 
 style={{ backgroundColor: achievement.color +"20", color: achievement.color }}
 >
 <Trophy className="h-4 w-4" />
 </div>
 <Badge variant="secondary" className="text-xs">
 {achievement.category}
 </Badge>
 </div>
 <div className="font-medium">{achievement.title}</div>
 {achievement.description && (
 <div className="text-sm text-muted-foreground mt-1">
 {achievement.description}
 </div>
 )}
 </div>
 </div>
 <div className="text-xs text-muted-foreground pt-2 border-t">
 {new Date(achievement.earnedAt).toLocaleDateString('tr-TR', {
 day: 'numeric',
 month: 'long',
 year: 'numeric'
 })}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
