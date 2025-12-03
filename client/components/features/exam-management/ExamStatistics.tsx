import { useMemo } from 'react';
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from '@/components/organisms/Card';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/atoms/Select';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { Badge } from '@/components/atoms/Badge';
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
 ResponsiveContainer,
 LineChart,
 Line,
} from 'recharts';
import type { ExamSession } from '../../../shared/types/exam-management.types';

interface ExamStatisticsData {
 session_id: string;
 session_name: string;
 exam_type_id: string;
 exam_date: string;
 total_students: number;
 subject_stats: SubjectStats[];
 overall_stats: {
 avg_total_net: number;
 highest_total_net: number;
 lowest_total_net: number;
 };
}

interface SubjectStats {
 subject_id: string;
 subject_name: string;
 question_count: number;
 avg_correct: number;
 avg_wrong: number;
 avg_empty: number;
 avg_net: number;
 highest_net: number;
 lowest_net: number;
 std_deviation: number;
}

interface ExamStatisticsProps {
 sessions: ExamSession[];
 selectedSession: string;
 onSessionChange: (sessionId: string) => void;
 statistics: ExamStatisticsData | null;
 isLoading: boolean;
}

export function ExamStatistics({
 sessions,
 selectedSession,
 onSessionChange,
 statistics,
 isLoading,
}: ExamStatisticsProps) {
 const chartData = useMemo(() => {
 if (!statistics?.subject_stats) return [];
 return statistics.subject_stats.map((stat) => ({
 name: stat.subject_name,
 ortalama: stat.avg_net,
 enYüksek: stat.highest_net,
 enDüşük: stat.lowest_net,
 }));
 }, [statistics]);

 const performanceData = useMemo(() => {
 if (!statistics?.subject_stats) return [];
 return statistics.subject_stats.map((stat) => ({
 name: stat.subject_name,
 doğru: stat.avg_correct,
 yanlış: stat.avg_wrong,
 boş: stat.avg_empty,
 }));
 }, [statistics]);

 if (isLoading) {
 return (
 <Card>
 <CardContent className="p-8">
 <div className="text-center text-muted-foreground">Yükleniyor...</div>
 </CardContent>
 </Card>
 );
 }

 return (
 <div className="space-y-6">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <BarChart3 className="h-5 w-5" />
 İstatistikler ve Analizler
 </CardTitle>
 <CardDescription>Sınav sonuçlarının detaylı analizi</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 <label className="text-sm font-medium">Deneme Sınavı Seç</label>
 <Select value={selectedSession} onValueChange={onSessionChange}>
 <SelectTrigger>
 <SelectValue placeholder="Sınav seçin" />
 </SelectTrigger>
 <SelectContent>
 {sessions.map((session) => (
 <SelectItem key={session.id} value={session.id}>
 {session.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </CardContent>
 </Card>

 {!selectedSession && (
 <Alert>
 <AlertDescription>
 İstatistikleri görmek için bir deneme sınavı seçin.
 </AlertDescription>
 </Alert>
 )}

 {selectedSession && !statistics && (
 <Alert>
 <AlertDescription>
 Bu sınav için henüz sonuç girilmemiş veya istatistik hesaplanamamış.
 </AlertDescription>
 </Alert>
 )}

 {statistics && (
 <>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <Users className="h-4 w-4 text-blue-600" />
 Toplam Öğrenci
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-3xl font-bold">{statistics.total_students}</div>
 <p className="text-xs text-muted-foreground mt-1">Sınava giren öğrenci</p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <TrendingUp className="h-4 w-4 text-green-600" />
 Ortalama Net
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-3xl font-bold text-green-600">
 {statistics.overall_stats.avg_total_net.toFixed(2)}
 </div>
 <p className="text-xs text-muted-foreground mt-1">Toplam net ortalaması</p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <Target className="h-4 w-4 text-purple-600" />
 En Yüksek Net
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-3xl font-bold text-purple-600">
 {statistics.overall_stats.highest_total_net.toFixed(2)}
 </div>
 <p className="text-xs text-muted-foreground mt-1">En başarılı öğrenci</p>
 </CardContent>
 </Card>
 </div>

 <Card>
 <CardHeader>
 <CardTitle>Ders Bazında Ortalama Net Dağılımı</CardTitle>
 <CardDescription>Her ders için ortalama, en yüksek ve en düşük net değerleri</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={300}>
 <BarChart data={chartData}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
 <YAxis />
 <Tooltip />
 <Legend />
 <Bar dataKey="ortalama" fill="#3b82f6" name="Ortalama" />
 <Bar dataKey="enYüksek" fill="#10b981" name="En Yüksek" />
 <Bar dataKey="enDüşük" fill="#ef4444" name="En Düşük" />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle>Doğru-Yanlış-Boş Dağılımı</CardTitle>
 <CardDescription>Her ders için ortalama soru dağılımı</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={300}>
 <LineChart data={performanceData}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
 <YAxis />
 <Tooltip />
 <Legend />
 <Line type="monotone" dataKey="doğru" stroke="#10b981" strokeWidth={2} name="Doğru" />
 <Line type="monotone" dataKey="yanlış" stroke="#ef4444" strokeWidth={2} name="Yanlış" />
 <Line type="monotone" dataKey="boş" stroke="#f59e0b" strokeWidth={2} name="Boş" />
 </LineChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle>Ders Bazında Detaylı İstatistikler</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 {statistics.subject_stats.map((stat) => (
 <div
 key={stat.subject_id}
 className="p-4 border rounded-lg"
 >
 <div className="flex items-center justify-between mb-3">
 <h4 className="font-semibold text-lg">{stat.subject_name}</h4>
 <Badge variant="outline">{stat.question_count} soru</Badge>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
 <div>
 <div className="text-muted-foreground">Ort. Doğru</div>
 <div className="font-bold text-green-600">{stat.avg_correct.toFixed(1)}</div>
 </div>
 <div>
 <div className="text-muted-foreground">Ort. Yanlış</div>
 <div className="font-bold text-red-600">{stat.avg_wrong.toFixed(1)}</div>
 </div>
 <div>
 <div className="text-muted-foreground">Ort. Boş</div>
 <div className="font-bold text-orange-600">{stat.avg_empty.toFixed(1)}</div>
 </div>
 <div>
 <div className="text-muted-foreground">Ort. Net</div>
 <div className="font-bold text-blue-600">{stat.avg_net.toFixed(2)}</div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </>
 )}
 </div>
 );
}
