import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Progress } from "@/components/atoms/Progress";
import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { 
  Target, 
  AlertCircle,
  Sparkles
} from "lucide-react";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import UnifiedProfileCard from "@/components/features/profile-sync/UnifiedProfileCard";
import ConflictResolutionUI from "@/components/features/profile-sync/ConflictResolutionUI";

interface UnifiedScores {
  akademikSkor: number;
  sosyalDuygusalSkor: number;
  davranissalSkor: number;
  motivasyonSkor: number;
  riskSkoru: number;
  protectiveScore?: number;
  healthScore?: number;
  talentsScore?: number;
}

interface ProfileCompleteness {
  overall: number;
  akademikProfil: number;
  sosyalDuygusalProfil: number;
  yetenekIlgiProfil: number;
  saglikProfil: number;
  davranisalProfil: number;
  eksikAlanlar: Array<{ kategori: string; alanlar: string[] }>;
}

interface CompactProfileDashboardProps {
  studentId: string;
  scores?: UnifiedScores | null;
  completeness?: ProfileCompleteness | null;
  isLoading?: boolean;
}

export function CompactProfileDashboard({ 
  studentId, 
  scores, 
  completeness,
  isLoading 
}: CompactProfileDashboardProps) {

  const radarData = useMemo(() => {
    if (!scores) return [];
    
    return [
      { subject: 'Akademik', value: scores.akademikSkor || 0, fullMark: 100 },
      { subject: 'Sosyal', value: scores.sosyalDuygusalSkor || 0, fullMark: 100 },
      { subject: 'Davranış', value: scores.davranissalSkor || 0, fullMark: 100 },
      { subject: 'Motivasyon', value: scores.motivasyonSkor || 0, fullMark: 100 },
      { subject: 'Yetenek', value: scores.talentsScore || 0, fullMark: 100 },
      { subject: 'Sağlık', value: scores.healthScore || 0, fullMark: 100 },
    ];
  }, [scores]);

  const overallScore = useMemo(() => {
    if (!scores) return 0;
    const values = [
      scores.akademikSkor,
      scores.sosyalDuygusalSkor,
      scores.davranissalSkor,
      scores.motivasyonSkor,
      scores.talentsScore || 0,
      scores.healthScore || 0,
    ].filter(v => v > 0);
    
    return values.length > 0 
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;
  }, [scores]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profil Yükleniyor...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Canlı Profil Kartı */}
      <UnifiedProfileCard studentId={studentId} />

      {/* Çelişki Çözümü - Sadece çelişki varsa gösterir */}
      <ConflictResolutionUI studentId={studentId} />

      {/* Kompakt Profil Özeti */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Radar Chart - Çok Boyutlu Profil */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5">
              <Target className="h-3 w-3 text-primary" />
              Çok Boyutlu Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="py-1.5">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={130}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                  <Radar
                    name="Skor"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    content={({ payload }) => {
                      if (payload && payload.length > 0) {
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-lg">
                            <p className="text-sm font-semibold">{payload[0].payload.subject}</p>
                            <p className="text-sm text-primary">{payload[0].value}/100</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[130px] flex items-center justify-center text-muted-foreground text-xs">
                Henüz yeterli veri yok
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profil Tamamlama */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" />
              Profil Durumu
            </CardTitle>
          </CardHeader>
          <CardContent className="py-1.5 space-y-2">
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${(overallScore / 100) * 263.89} 263.89`}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{overallScore}</span>
                  <span className="text-[10px] text-muted-foreground">Genel</span>
                </div>
              </div>
            </div>
            {completeness && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tamamlanma</span>
                  <span className="font-semibold">{completeness.overall}%</span>
                </div>
                <Progress value={completeness.overall} className="h-1.5" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Eksik Alanlar - Sadece varsa göster */}
      {completeness && completeness.eksikAlanlar && completeness.eksikAlanlar.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Eksik alanlar:</strong> {completeness.eksikAlanlar.length} kategori tamamlanmalı
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
