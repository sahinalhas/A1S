import { useQuery } from '@tanstack/react-query';
import { personalizedLearningAPI, type PersonalizedStudyPlan } from '@/lib/api/endpoints/personalized-learning.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { 
 Brain, 
 Calendar, 
 Target, 
 BookOpen, 
 TrendingUp,
 Clock,
 CheckCircle2,
 Lightbulb,
 ExternalLink
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';

interface PersonalizedStudyPlanProps {
 studentId: string;
}

const getPriorityColor = (priority: string) => {
 switch (priority) {
 case 'HIGH': return 'bg-red-500';
 case 'MEDIUM': return 'bg-yellow-500';
 case 'LOW': return 'bg-green-500';
 default: return 'bg-gray-500';
 }
};

export function PersonalizedStudyPlanComponent({ studentId }: PersonalizedStudyPlanProps) {
 const { data: studyPlan, isLoading, error, refetch } = useQuery({
 queryKey: ['personalized-study-plan', studentId],
 queryFn: () => personalizedLearningAPI.getStudyPlan(studentId),
 staleTime: 30 * 60 * 1000,
 });

 const { data: learningStyle } = useQuery({
 queryKey: ['learning-style', studentId],
 queryFn: () => personalizedLearningAPI.getLearningStyleProfile(studentId),
 staleTime: 30 * 60 * 1000,
 });

 if (isLoading) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Kişiselleştirilmiş Çalışma Planı</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex items-center justify-center h-40">
 <div className=" rounded-full h-8 w-8 border-b-2 border-primary"></div>
 </div>
 </CardContent>
 </Card>
 );
 }

 if (error || !studyPlan) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Kişiselleştirilmiş Çalışma Planı</CardTitle>
 </CardHeader>
 <CardContent>
 <Alert>
 <Brain className="h-4 w-4" />
 <AlertDescription>
 Çalışma planı yüklenirken bir hata oluştu.
 </AlertDescription>
 </Alert>
 </CardContent>
 </Card>
 );
 }

 return (
 <div className="space-y-4">
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="flex items-center gap-2">
 <Brain className="h-5 w-5" />
 Kişiselleştirilmiş Çalışma Planı
 </CardTitle>
 <CardDescription className="mt-1">
 {studyPlan.studentName} için özel hazırlanmış plan
 </CardDescription>
 </div>
 <Button onClick={() => refetch()} variant="outline" size="sm">
 Planı Yenile
 </Button>
 </div>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 gap-4 mb-4">
 <div className="flex items-center gap-2">
 <BookOpen className="h-4 w-4 text-muted-foreground" />
 <div>
 <p className="text-sm text-muted-foreground">Öğrenme Stili</p>
 <p className="font-medium">{studyPlan.learningStyle}</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <TrendingUp className="h-4 w-4 text-muted-foreground" />
 <div>
 <p className="text-sm text-muted-foreground">Motivasyon Tipi</p>
 <p className="font-medium">{studyPlan.motivationType}</p>
 </div>
 </div>
 </div>

 <Tabs defaultValue="goals" className="w-full">
 <TabsList variant="nested">
 <TabsTrigger value="goals" variant="nested">Hedefler</TabsTrigger>
 <TabsTrigger value="schedule" variant="nested">Program</TabsTrigger>
 <TabsTrigger value="motivation" variant="nested">Motivasyon</TabsTrigger>
 <TabsTrigger value="resources" variant="nested">Kaynaklar</TabsTrigger>
 <TabsTrigger value="tracking" variant="nested">Takip</TabsTrigger>
 </TabsList>

 <TabsContent value="goals" className="space-y-3 mt-4">
 {studyPlan.weeklyGoals.map((goal, index) => (
 <div key={index} className="border rounded-lg p-4 space-y-3">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <Target className="h-4 w-4 text-primary" />
 <h4 className="font-medium">{goal.subject}</h4>
 <Badge className={getPriorityColor(goal.priority)}>
 {goal.priority}
 </Badge>
 </div>
 <p className="text-sm text-muted-foreground">{goal.goal}</p>
 </div>
 <div className="flex items-center gap-1 text-sm text-muted-foreground">
 <Clock className="h-4 w-4" />
 <span>{goal.estimatedHours} saat</span>
 </div>
 </div>
 <div className="bg-muted/50 p-3 rounded space-y-1">
 <p className="text-xs font-medium">Stratejiler:</p>
 <ul className="space-y-1">
 {goal.strategies.map((strategy, i) => (
 <li key={i} className="text-xs flex items-start gap-1">
 <span className="text-primary">•</span>
 <span>{strategy}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 ))}
 </TabsContent>

 <TabsContent value="schedule" className="space-y-3 mt-4">
 {studyPlan.dailySchedule.map((day, index) => (
 <div key={index} className="border rounded-lg p-4">
 <div className="flex items-center gap-2 mb-3">
 <Calendar className="h-4 w-4 text-primary" />
 <h4 className="font-medium">{day.day}</h4>
 </div>
 <div className="space-y-2">
 {day.sessions.map((session, i) => (
 <div key={i} className="flex items-start gap-3 p-2 bg-muted/30 rounded">
 <div className="min-w-[80px] text-sm font-medium text-primary">
 {session.time}
 </div>
 <div className="flex-1">
 <p className="font-medium text-sm">{session.subject}</p>
 <p className="text-xs text-muted-foreground">{session.activity}</p>
 <p className="text-xs text-muted-foreground mt-1">
 Yöntem: {session.method}
 </p>
 </div>
 <div className="text-xs text-muted-foreground">
 {session.duration}dk
 </div>
 </div>
 ))}
 </div>
 </div>
 ))}
 </TabsContent>

 <TabsContent value="motivation" className="space-y-3 mt-4">
 {studyPlan.motivationStrategies.map((strategy, index) => (
 <div key={index} className="border rounded-lg p-4 space-y-2">
 <div className="flex items-start gap-2">
 <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
 <div className="flex-1">
 <h4 className="font-medium text-sm">{strategy.strategy}</h4>
 <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
 <span>Sıklık: {strategy.frequency}</span>
 <span>•</span>
 <span>Beklenen: {strategy.expectedOutcome}</span>
 </div>
 </div>
 </div>
 </div>
 ))}
 </TabsContent>

 <TabsContent value="resources" className="space-y-3 mt-4">
 {studyPlan.resources.map((resource, index) => (
 <div key={index} className="border rounded-lg p-4">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <BookOpen className="h-4 w-4 text-primary" />
 <h4 className="font-medium text-sm">{resource.subject}</h4>
 <Badge variant="outline">{resource.resourceType}</Badge>
 </div>
 <p className="text-sm text-muted-foreground">{resource.description}</p>
 </div>
 {resource.link && (
 <Button variant="ghost" size="sm" asChild>
 <a href={resource.link} target="_blank" rel="noopener noreferrer">
 <ExternalLink className="h-4 w-4" />
 </a>
 </Button>
 )}
 </div>
 </div>
 ))}
 </TabsContent>

 <TabsContent value="tracking" className="space-y-4 mt-4">
 <div className="border rounded-lg p-4 space-y-3">
 <h4 className="font-medium flex items-center gap-2">
 <CheckCircle2 className="h-4 w-4 text-primary" />
 Kontrol Noktaları
 </h4>
 <ul className="space-y-2">
 {studyPlan.progressTracking.checkpoints.map((checkpoint, i) => (
 <li key={i} className="flex items-start gap-2 text-sm">
 <span className="text-primary">•</span>
 <span>{checkpoint}</span>
 </li>
 ))}
 </ul>
 </div>

 <div className="border rounded-lg p-4 space-y-3">
 <h4 className="font-medium flex items-center gap-2">
 <Target className="h-4 w-4 text-primary" />
 Başarı Ölçütleri
 </h4>
 <ul className="space-y-2">
 {studyPlan.progressTracking.successMetrics.map((metric, i) => (
 <li key={i} className="flex items-start gap-2 text-sm">
 <span className="text-primary">•</span>
 <span>{metric}</span>
 </li>
 ))}
 </ul>
 </div>
 </TabsContent>
 </Tabs>

 {learningStyle && (
 <div className="mt-6 p-4 bg-primary/5 rounded-lg">
 <h4 className="font-medium text-sm mb-2">Öğrenme Stili Önerileri</h4>
 <div className="grid grid-cols-2 gap-2">
 {learningStyle.recommendations.slice(0, 4).map((rec, i) => (
 <div key={i} className="text-xs flex items-start gap-1">
 <span className="text-primary">✓</span>
 <span>{rec}</span>
 </div>
 ))}
 </div>
 </div>
 )}

 <div className="text-xs text-muted-foreground text-center pt-4 border-t mt-4">
 Plan oluşturulma: {new Date(studyPlan.generatedAt).toLocaleString('tr-TR')}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
