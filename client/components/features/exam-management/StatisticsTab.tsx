import { useState } from 'react';
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from '@/components/organisms/Card';
import { Label } from '@/components/atoms/Label';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/atoms/Select';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { BarChart3, TrendingUp, Filter } from 'lucide-react';
import { ModernStatisticsDashboard } from './ModernStatisticsDashboard';
import type {
 ExamType,
 ExamSession,
 ExamStatistics as ExamStatisticsType,
} from '../../../shared/types/exam-management.types';

interface StatisticsTabProps {
 examTypes: ExamType[];
 sessions: ExamSession[];
 statistics: ExamStatisticsType | null;
 isLoading: boolean;
 onSessionChange: (sessionId: string) => void;
 selectedSessionId?: string;
}

export function StatisticsTab({
 examTypes,
 sessions,
 statistics,
 isLoading,
 onSessionChange,
 selectedSessionId,
}: StatisticsTabProps) {
 const [filterExamType, setFilterExamType] = useState<string>('all');

 const filteredSessions = sessions.filter((session) => {
 if (filterExamType === 'all') return true;
 return session.exam_type_id === filterExamType;
 });

 const getExamTypeName = (examTypeId: string) => {
 return examTypes.find((t) => t.id === examTypeId)?.name || examTypeId;
 };

 return (
 <div className="space-y-5">
 <Card className="overflow-hidden">
 <CardHeader className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b">
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="flex items-center gap-2 text-lg">
 <BarChart3 className="h-5 w-5 text-primary" />
 İstatistikler ve Analizler
 </CardTitle>
 <CardDescription className="mt-1">
 Deneme sınavı sonuçlarını analiz edin ve performans trendlerini görüntüleyin
 </CardDescription>
 </div>
 </div>
 </CardHeader>
 <CardContent className="space-y-4 pt-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <div className="space-y-1.5">
 <Label htmlFor="stats-exam-type" className="text-sm">Sınav Türü Filtresi</Label>
 <Select value={filterExamType} onValueChange={setFilterExamType}>
 <SelectTrigger id="stats-exam-type">
 <Filter className="h-4 w-4 mr-2" />
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tüm Sınav Türleri</SelectItem>
 {examTypes.map((type) => (
 <SelectItem key={type.id} value={type.id}>
 {type.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1.5">
 <Label htmlFor="stats-session" className="text-sm">Deneme Seçin</Label>
 <Select value={selectedSessionId} onValueChange={onSessionChange}>
 <SelectTrigger id="stats-session">
 <SelectValue placeholder="Deneme sınavı seçin" />
 </SelectTrigger>
 <SelectContent>
 {filteredSessions.length === 0 ? (
 <div className="p-2 text-sm text-muted-foreground">
 {filterExamType === 'all'
 ? 'Henüz deneme oluşturulmamış'
 : 'Bu sınav türünde deneme bulunamadı'}
 </div>
 ) : (
 filteredSessions.map((session) => (
 <SelectItem key={session.id} value={session.id}>
 {session.name} ({getExamTypeName(session.exam_type_id)}) -{' '}
 {new Date(session.exam_date).toLocaleDateString('tr-TR')}
 </SelectItem>
 ))
 )}
 </SelectContent>
 </Select>
 </div>
 </div>

 {!selectedSessionId ? (
 <Alert>
 <TrendingUp className="h-4 w-4" />
 <AlertDescription>
 İstatistikleri görüntülemek için yukarıdan bir deneme sınavı seçin.
 </AlertDescription>
 </Alert>
 ) : (
 <ModernStatisticsDashboard
 sessions={sessions}
 selectedSession={selectedSessionId}
 statistics={statistics}
 isLoading={isLoading}
 />
 )}
 </CardContent>
 </Card>

 {sessions.length > 0 && (
 <Card className="overflow-hidden">
 <CardHeader className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
 <CardTitle className="text-base flex items-center gap-2">
 <TrendingUp className="h-4 w-4 text-primary" />
 Genel Özet
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-6">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="space-y-1">
 <p className="text-sm text-muted-foreground">Toplam Deneme</p>
 <p className="text-2xl font-bold">{sessions.length}</p>
 </div>
 <div className="space-y-1">
 <p className="text-sm text-muted-foreground">Sınav Türü</p>
 <p className="text-2xl font-bold">{examTypes.length}</p>
 </div>
 <div className="space-y-1">
 <p className="text-sm text-muted-foreground">Son Deneme</p>
 <p className="text-sm font-medium">
 {sessions.length > 0
 ? new Date(sessions[0].exam_date).toLocaleDateString('tr-TR')
 : '-'}
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 )}
 </div>
 );
}
