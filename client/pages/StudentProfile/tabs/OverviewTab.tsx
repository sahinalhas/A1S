import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { 
  TrendingUp, 
  Heart, 
  ShieldAlert, 
  Target,
  Info,
  Sparkles,
  MessageCircle,
  Users,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { Student } from "@/lib/storage";
import ProfileUpdateTimeline from "@/components/features/live-profile/ProfileUpdateTimeline";
import { CompactProfileDashboard } from "../components/CompactProfileDashboard";
import { 
  RecentGradesWidget, 
  AttendanceWidget, 
  AlertsWidget, 
  ActiveInterventionsWidget 
} from "../components/widgets";
import { useEffect, useState } from "react";
import { getNotesByStudent } from "@/lib/api/endpoints/notes.api";

interface OverviewTabProps {
  student: Student;
  studentId: string;
  scoresData?: any;
  loadingScores?: boolean;
}

export function OverviewTab({
  student,
  studentId,
  scoresData,
  loadingScores,
}: OverviewTabProps) {
  const academicScore = scoresData?.akademikSkor || 0;
  const socialScore = scoresData?.sosyalDuygusalSkor || 0;
  const riskScore = scoresData?.riskSkoru || 0;
  const motivationScore = scoresData?.motivasyonSkor || 0;

  const [meetingStats, setMeetingStats] = useState({
    veli: 0,
    bireysel: 0,
    grup: 0
  });

  useEffect(() => {
    loadMeetingStats();
  }, [studentId]);

  const loadMeetingStats = async () => {
    try {
      const notes = await getNotesByStudent(studentId);
      const veli = notes.filter(n => n.type === 'Veli').length;
      const bireysel = notes.filter(n => n.type === 'Bireysel').length;
      const grup = notes.filter(n => n.type === 'Grup').length;
      
      setMeetingStats({ veli, bireysel, grup });
    } catch (error) {
      console.error('Error loading meeting stats:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Çok İyi";
    if (score >= 60) return "İyi";
    if (score >= 40) return "Orta";
    return "Gelişmeli";
  };

  return (
    <div className="space-y-4">
      {/* Bilgilendirme */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Bu sekme öğrencinin genel durumunu özetler. Detaylı bilgiler için ilgili sekmeleri ziyaret edin.
        </AlertDescription>
      </Alert>

      {/* Hızlı Özet Kartlar - Ana Metrikler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Akademik
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className={`text-2xl font-bold ${getScoreColor(academicScore)}`}>
              {Math.round(academicScore)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {getScoreLabel(academicScore)}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Sosyal-Duygusal
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className={`text-2xl font-bold ${getScoreColor(socialScore)}`}>
              {Math.round(socialScore)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {getScoreLabel(socialScore)}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" />
              Risk Seviyesi
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className={`text-2xl font-bold ${riskScore > 60 ? 'text-red-600' : riskScore > 30 ? 'text-yellow-600' : 'text-green-600'}`}>
              {Math.round(riskScore)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {riskScore > 60 ? 'Yüksek' : riskScore > 30 ? 'Orta' : 'Düşük'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Target className="h-3 w-3" />
              Motivasyon
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className={`text-2xl font-bold ${getScoreColor(motivationScore)}`}>
              {Math.round(motivationScore)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {getScoreLabel(motivationScore)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ana Dashboard Bölümü - 2/3 + 1/3 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sol Kolon - Ana Bilgiler (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profil Tamamlama ve Radar Chart */}
          <CompactProfileDashboard
            studentId={studentId}
            scores={scoresData}
            isLoading={loadingScores}
          />

          {/* Görüşme İstatistikleri */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                <MessageCircle className="h-3 w-3 text-muted-foreground" />
                Görüşme & İletişim
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Veli:</span>
                  <span className="text-xs font-semibold">{meetingStats.veli}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-muted-foreground">Bireysel:</span>
                  <span className="text-xs font-semibold">{meetingStats.bireysel}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-purple-500" />
                  <span className="text-xs text-muted-foreground">Grup:</span>
                  <span className="text-xs font-semibold">{meetingStats.grup}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Son Profil Güncellemeleri - Kompakt */}
          <ProfileUpdateTimeline studentId={studentId} maxItems={3} />
        </div>

        {/* Sağ Kolon - Hızlı Erişim ve Özetler (1/3) */}
        <div className="space-y-4">
          {/* Hızlı Aksiyonlar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                Hızlı Aksiyonlar
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 space-y-1.5">
              <Button asChild variant="outline" className="w-full justify-start h-8 text-xs" size="sm">
                <Link to="/gorusmeler">
                  Görüşme Ekle
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start h-8 text-xs" size="sm">
                <Link to={`/ai-asistan?student=${studentId}`}>
                  AI Analiz
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start h-8 text-xs" size="sm">
                <Link to={`#academics`}>
                  Not Gir
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start h-8 text-xs" size="sm">
                <Link to={`#communication`}>
                  Veli İletişim
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Widget'lar */}
          <RecentGradesWidget studentId={studentId} />
          <AttendanceWidget studentId={studentId} />
          <AlertsWidget studentId={studentId} />
          <ActiveInterventionsWidget studentId={studentId} />
        </div>
      </div>
    </div>
  );
}
