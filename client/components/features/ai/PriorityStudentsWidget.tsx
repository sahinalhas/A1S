import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import { 
 AlertTriangle, 
 TrendingUp, 
 Users, 
 ArrowRight,
 RefreshCw,
 Loader2 
} from 'lucide-react';
import { getPriorityStudents } from '@/lib/api/endpoints/ai-assistant.api';
import { useNavigate } from 'react-router-dom';
import { useAIRecommendations } from '@/lib/ai/useAIRecommendations';
import { getStatusColor, getScoreColor } from '@/lib/ai/ai-utils';

export default function PriorityStudentsWidget() {
 const navigate = useNavigate();

 const { data, isLoading, refetch, isRefetching } = useAIRecommendations({
 queryKey: ['priority-students'],
 queryFn: () => getPriorityStudents(10),
 refetchInterval: 5 * 60 * 1000,
 });

 if (isLoading) {
 return (
 <Card>
 <CardContent className="flex items-center justify-center py-12">
 <Loader2 className="h-8 w-8 text-muted-foreground" />
 </CardContent>
 </Card>
 );
 }

 const priorities = data?.data?.priorities || [];
 const recommendations = data?.data?.recommendations || [];

 return (
 <Card className="border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20">
 <CardHeader>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
 <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
 </div>
 <div>
 <CardTitle>Öncelikli Öğrenciler</CardTitle>
 <CardDescription>
 Acil dikkat gerektiren {priorities.length} öğrenci
 </CardDescription>
 </div>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => refetch()}
 disabled={isRefetching}
 className="gap-2"
 >
 <RefreshCw className="h-4 w-4" />
 </Button>
 </div>
 </CardHeader>
 <CardContent className="space-y-4">
 {recommendations.length > 0 && (
 <div className="bg-orange-100/50 dark:bg-orange-900/30 rounded-lg p-3 space-y-2">
 <div className="flex items-center gap-2 text-sm font-medium">
 <TrendingUp className="h-4 w-4" />
 Öneriler
 </div>
 <ul className="text-sm space-y-1 text-muted-foreground">
 {recommendations.map((rec: string, idx: number) => (
 <li key={idx} className="flex items-start gap-2">
 <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
 <span>{rec}</span>
 </li>
 ))}
 </ul>
 </div>
 )}

 <ScrollArea className="h-[400px] pr-4">
 <div className="space-y-2">
 {priorities.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-8 text-center">
 <Users className="h-12 w-12 text-muted-foreground mb-3" />
 <p className="text-sm text-muted-foreground">
 Şu anda öncelikli öğrenci bulunmuyor
 </p>
 </div>
 ) : (
 priorities.map((student: any) => (
 <Card key={student.studentId} className="">
 <CardContent className="p-4">
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <h4 className="font-medium truncate">{student.studentName}</h4>
 <Badge variant={getStatusColor(student.status)} className="shrink-0">
 {student.status}
 </Badge>
 </div>
 <p className="text-sm text-muted-foreground truncate">
 {student.class}
 </p>
 <p className="text-xs text-muted-foreground mt-1">
 {student.reason}
 </p>
 </div>
 <div className="flex flex-col items-end gap-2 shrink-0">
 <div className="flex items-center gap-1">
 <span className="text-xs text-muted-foreground">Skor:</span>
 <span className={`text-sm font-bold ${getScoreColor(student.priorityScore)}`}>
 {student.priorityScore}
 </span>
 </div>
 {student.criticalAlerts > 0 && (
 <Badge variant="destructive" className="text-xs">
 {student.criticalAlerts} uyarı
 </Badge>
 )}
 </div>
 </div>
 <div className="mt-3 pt-3 border-t">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => navigate(`/ogrenci/${student.studentId}`)}
 className="w-full gap-2 text-xs"
 >
 Profili Görüntüle
 <ArrowRight className="h-3 w-3" />
 </Button>
 </div>
 </CardContent>
 </Card>
 ))
 )}
 </div>
 </ScrollArea>
 </CardContent>
 </Card>
 );
}
