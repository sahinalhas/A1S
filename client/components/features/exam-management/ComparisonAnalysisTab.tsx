import { useState, useMemo } from 'react';
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Skeleton } from '@/components/atoms/Skeleton';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/atoms/Select';
import { GitCompare, BarChart3, TrendingUp, Users, AlertCircle } from 'lucide-react';
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
 RadarChart,
 PolarGrid,
 PolarAngleAxis,
 PolarRadiusAxis,
 Radar,
} from 'recharts';
import { useSessionComparison } from '@/hooks/queries/exams.query-hooks';
import type { ExamSession, ExamType, SessionComparison } from '../../../shared/types/exam-management.types';
import { toast } from 'sonner';

interface ComparisonAnalysisTabProps {
 examTypes: ExamType[];
 sessions: ExamSession[];
}

export function ComparisonAnalysisTab({ examTypes, sessions }: ComparisonAnalysisTabProps) {
 const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
 const [comparisonType, setComparisonType] = useState<'overall' | 'subject' | 'student'>('overall');
 const [filterExamType, setFilterExamType] = useState<string>('all');
 const [comparisonData, setComparisonData] = useState<SessionComparison | null>(null);

 const comparison = useSessionComparison();

 const filteredSessions = useMemo(() => {
 return sessions.filter(s => filterExamType === 'all' || s.exam_type_id === filterExamType)
 .sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime());
 }, [sessions, filterExamType]);

 const toggleSession = (sessionId: string) => {
 setSelectedSessions(prev => 
 prev.includes(sessionId) 
 ? prev.filter(id => id !== sessionId)
 : [...prev, sessionId]
 );
 };

 const handleCompare = async () => {
 if (selectedSessions.length < 2) {
 toast.error('En az 2 deneme seçmelisiniz');
 return;
 }

 try {
 const result = await comparison.mutateAsync({
 sessionIds: selectedSessions,
 comparisonType
 });
 setComparisonData(result);
 toast.success('Karşılaştırma tamamlandı');
 } catch (error) {
 toast.error('Karşılaştırma yapılamadı');
 }
 };

 const overallChartData = useMemo(() => {
 if (!comparisonData) return [];
 return comparisonData.sessions.map(s => ({
 name: s.session_name,
 ortalama: s.avg_net,
 enYüksek: s.highest_net,
 enDüşük: s.lowest_net,
 katılım: s.participants,
 }));
 }, [comparisonData]);

 const subjectChartData = useMemo(() => {
 if (!comparisonData?.subject_comparisons) return [];
 
 return comparisonData.subject_comparisons.map(subject => {
 const dataPoint: any = { subject: subject.subject_name };
 subject.sessions.forEach((session, idx) => {
 dataPoint[`deneme${idx + 1}`] = session.avg_net;
 });
 return dataPoint;
 });
 }, [comparisonData]);

 return (
 <div className="space-y-6 fade-in slide-in-from-bottom-4">
 <div>
 <h2 className="text-3xl font-bold flex items-center gap-3">
 <div className="p-2 bg-primary/10 rounded-lg">
 <GitCompare className="h-7 w-7 text-primary" />
 </div>
 Deneme Karşılaştırma
 </h2>
 <p className="text-muted-foreground mt-2 text-base">
 Farklı denemeleri karşılaştırarak performans trendlerini görüntüleyin
 </p>
 </div>

 <Card>
 <CardHeader>
 <CardTitle className="text-base">Karşılaştırma Ayarları</CardTitle>
 <CardDescription>Karşılaştırmak istediğiniz denemeleri seçin</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="space-y-2">
 <label className="text-sm font-medium">Sınav Türü</label>
 <Select value={filterExamType} onValueChange={setFilterExamType}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tüm Sınav Türleri</SelectItem>
 {examTypes.map(type => (
 <SelectItem key={type.id} value={type.id}>
 {type.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Karşılaştırma Türü</label>
 <Select value={comparisonType} onValueChange={(v) => setComparisonType(v as any)}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="overall">Genel Performans</SelectItem>
 <SelectItem value="subject">Ders Bazlı</SelectItem>
 <SelectItem value="student">Öğrenci Bazlı</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="flex items-end">
 <Button 
 onClick={handleCompare}
 disabled={selectedSessions.length < 2 || comparison.isPending}
 className="w-full"
 >
 <BarChart3 className="h-4 w-4 mr-2" />
 {comparison.isPending ? 'Karşılaştırılıyor...' : 'Karşılaştır'}
 </Button>
 </div>
 </div>

 <div>
 <div className="flex items-center justify-between mb-3">
 <label className="text-sm font-medium">
 Denemeler ({selectedSessions.length} seçili)
 </label>
 {selectedSessions.length > 0 && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setSelectedSessions([])}
 >
 Temizle
 </Button>
 )}
 </div>
 
 <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
 {filteredSessions.length === 0 ? (
 <p className="text-sm text-muted-foreground text-center py-4">
 Bu sınav türünde deneme bulunamadı
 </p>
 ) : (
 filteredSessions.map(session => {
 const examType = examTypes.find(t => t.id === session.exam_type_id);
 const isSelected = selectedSessions.includes(session.id);
 
 return (
 <div
 key={session.id}
 className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                  isSelected ? 'bg-primary/10 border-primary' : 'bg-background border-border'
 }`}
 onClick={() => toggleSession(session.id)}
 >
 <Checkbox 
 checked={isSelected}
 onCheckedChange={() => toggleSession(session.id)}
 />
 <div className="flex-1">
 <div className="font-medium text-sm">{session.name}</div>
 <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
 <Badge variant="outline" className="text-xs">
 {examType?.name}
 </Badge>
 <span>
 {new Date(session.exam_date).toLocaleDateString('tr-TR')}
 </span>
 </div>
 </div>
 </div>
 );
 })
 )}
 </div>
 </div>
 </CardContent>
 </Card>

 {comparisonData && (
 <>
 <Card>
 <CardHeader>
 <CardTitle className="text-base">Genel Karşılaştırma</CardTitle>
 <CardDescription>Seçilen denemelerin genel performans karşılaştırması</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
 {comparisonData.sessions.map(session => (
 <Card key={session.session_id} className="border-2">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm">{session.session_name}</CardTitle>
 <CardDescription className="text-xs">
 {new Date(session.exam_date).toLocaleDateString('tr-TR')}
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-2">
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Ortalama Net:</span>
 <span className="font-bold text-primary">{session.avg_net.toFixed(2)}</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">En Yüksek:</span>
 <span className="font-bold text-green-600">{session.highest_net.toFixed(2)}</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">En Düşük:</span>
 <span className="font-bold text-red-600">{session.lowest_net.toFixed(2)}</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Katılım:</span>
 <span className="font-bold flex items-center gap-1">
 <Users className="h-3 w-3" />
 {session.participants}
 </span>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>

 <ResponsiveContainer width="100%" height={350}>
 <BarChart data={overallChartData}>
 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
 <XAxis 
 dataKey="name" 
 angle={-15} 
 textAnchor="end" 
 height={80}
 tick={{ fontSize: 11 }}
 />
 <YAxis tick={{ fontSize: 11 }} />
 <Tooltip 
 contentStyle={{
 backgroundColor: '#fff',
 border: '1px solid #e5e7eb',
 borderRadius: '8px',
 fontSize: '12px',
 }}
 />
 <Legend wrapperStyle={{ fontSize: '11px' }} />
 <Bar dataKey="ortalama" fill="#3b82f6" name="Ortalama" radius={[4, 4, 0, 0]} />
 <Bar dataKey="enYüksek" fill="#10b981" name="En Yüksek" radius={[4, 4, 0, 0]} />
 <Bar dataKey="enDüşük" fill="#ef4444" name="En Düşük" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 {comparisonType === 'subject' && comparisonData.subject_comparisons && (
 <Card>
 <CardHeader>
 <CardTitle className="text-base">Ders Bazlı Karşılaştırma</CardTitle>
 <CardDescription>Her ders için deneme performansı</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={400}>
 <BarChart data={subjectChartData}>
 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
 <XAxis 
 dataKey="subject" 
 angle={-30} 
 textAnchor="end" 
 height={100}
 tick={{ fontSize: 11 }}
 />
 <YAxis tick={{ fontSize: 11 }} />
 <Tooltip 
 contentStyle={{
 backgroundColor: '#fff',
 border: '1px solid #e5e7eb',
 borderRadius: '8px',
 fontSize: '12px',
 }}
 />
 <Legend wrapperStyle={{ fontSize: '11px' }} />
 {selectedSessions.map((_, idx) => (
 <Bar 
 key={idx}
 dataKey={`deneme${idx + 1}`} 
 fill={`hsl(${idx * 60}, 70%, 50%)`}
 name={comparisonData.sessions[idx]?.session_name || `Deneme ${idx + 1}`}
 radius={[4, 4, 0, 0]}
 />
 ))}
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 )}
 </>
 )}

 {!comparisonData && (
 <Card className="border-2 border-dashed border-muted-foreground/30 bg-muted/20">
 <CardContent className="p-16">
 <div className="text-center space-y-4">
 <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
 <GitCompare className="h-10 w-10 text-muted-foreground" />
 </div>
 <div>
 <h3 className="font-semibold text-lg mb-2">Karşılaştırma Hazır</h3>
 <p className="text-muted-foreground max-w-md mx-auto">
 Yukarıdan en az 2 deneme seçin ve"Karşılaştır" butonuna tıklayarak detaylı performans karşılaştırması yapın.
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 )}
 </div>
 );
}
