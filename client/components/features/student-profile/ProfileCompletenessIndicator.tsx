/**
 * Profile Completeness Indicator - Modern & Compact Edition
 * Profil Tamlık Göstergesi - Modern ve Kompakt Tasarım
 * 
 * Özellikler:
 * - Grid layout ile kompakt görünüm
 * - Sadece kritik bilgiler gösterilir
 * - Modern badge ve progress tasarımı
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Progress } from "@/components/atoms/Progress";
import { Badge } from "@/components/atoms/Badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ProfileCompletenessProps {
 overall: number;
 sections: {
 temelBilgiler: number;
 iletisimBilgileri: number;
 veliBilgileri: number;
 akademikProfil: number;
 sosyalDuygusalProfil: number;
 yetenekIlgiProfil: number;
 saglikProfil: number;
 davranisalProfil: number;
 };
 eksikAlanlar?: {
 kategori: string;
 alanlar: string[];
 }[];
}

export function ProfileCompletenessIndicator({ overall, sections, eksikAlanlar }: ProfileCompletenessProps) {
 const getScoreColor = (score: number) => {
 if (score >= 90) return"text-green-600";
 if (score >= 70) return"text-blue-600";
 if (score >= 50) return"text-amber-600";
 return"text-red-600";
 };

 const getProgressColor = (score: number) => {
 if (score >= 90) return"bg-green-500";
 if (score >= 70) return"bg-blue-500";
 if (score >= 50) return"bg-amber-500";
 return"bg-red-500";
 };

 const getBadgeVariant = (score: number):"default" |"secondary" |"destructive" => {
 if (score >= 90) return"default";
 if (score >= 70) return"secondary";
 return"destructive";
 };

 const profileSections = [
 { name:"Temel", score: sections.temelBilgiler },
 { name:"İletişim", score: sections.iletisimBilgileri },
 { name:"Veli", score: sections.veliBilgileri },
 { name:"Akademik", score: sections.akademikProfil },
 { name:"Sosyal", score: sections.sosyalDuygusalProfil },
 { name:"Yetenek", score: sections.yetenekIlgiProfil },
 { name:"Sağlık", score: sections.saglikProfil },
 { name:"Davranış", score: sections.davranisalProfil },
 ];

 // Sadece kritik eksikleri göster (<%50)
 const kritikEksikler = profileSections.filter(s => s.score < 50);

 return (
 <Card>
 <CardHeader className="pb-3">
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="text-lg">Profil Bütünlüğü</CardTitle>
 <CardDescription className="text-xs">Veri tamlık durumu</CardDescription>
 </div>
 <div className="text-center">
 <div className={`text-3xl font-bold ${getScoreColor(overall)}`}>
 {Math.round(overall)}%
 </div>
 <Badge variant={getBadgeVariant(overall)} className="text-xs mt-1">
 {overall >= 90 ?"Mükemmel" : overall >= 70 ?"İyi" : overall >= 50 ?"Orta" :"Eksik"}
 </Badge>
 </div>
 </div>
 </CardHeader>
 
 <CardContent className="space-y-4">
 {/* Genel Progress - Kompakt */}
 <div className="relative">
 <Progress value={overall} className="h-2" />
 <div 
 className={`absolute top-0 left-0 h-2 rounded-full ${getProgressColor(overall)}`}
 style={{ width: `${overall}%` }}
 />
 </div>

 {/* Bölümler - Kompakt Grid */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
 {profileSections.map((section) => (
 <div 
 key={section.name} 
 className="flex flex-col gap-1 p-2 rounded-lg bg-muted/30"
 >
 <div className="flex items-center justify-between">
 <span className="text-xs font-medium truncate" title={section.name}>
 {section.name}
 </span>
 {section.score === 100 ? (
 <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
 ) : section.score < 50 ? (
 <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
 ) : null}
 </div>
 <div className="flex items-center gap-2">
 <Progress value={section.score} className="h-1 flex-1" />
 <span className={`text-xs font-semibold ${getScoreColor(section.score)} min-w-[32px] text-right`}>
 {Math.round(section.score)}%
 </span>
 </div>
 </div>
 ))}
 </div>

 {/* Kritik Eksikler - Sadece Önemli Olanlar */}
 {kritikEksikler.length > 0 && (
 <div className="pt-2 border-t">
 <div className="flex items-center gap-2 mb-2">
 <AlertCircle className="h-3.5 w-3.5 text-red-600" />
 <span className="text-xs font-semibold text-red-600">
 Kritik Eksikler ({kritikEksikler.length})
 </span>
 </div>
 <div className="flex flex-wrap gap-1.5">
 {kritikEksikler.map((section) => (
 <Badge key={section.name} variant="destructive" className="text-xs">
 {section.name}: {Math.round(section.score)}%
 </Badge>
 ))}
 </div>
 </div>
 )}

 {/* Öneri - Sadece Düşük Skor */}
 {overall < 70 && (
 <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg">
 Nesnel değerlendirme için profil tamlığının %70'in üzerine çıkarılması önerilir.
 </div>
 )}
 </CardContent>
 </Card>
 );
}
