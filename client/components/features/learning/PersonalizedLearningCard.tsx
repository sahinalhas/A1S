import { useQuery } from '@tanstack/react-query';
import { personalizedLearningAPI } from '@/lib/api/endpoints/personalized-learning.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Progress } from '@/components/atoms/Progress';
import { 
 Brain, 
 Target, 
 TrendingUp, 
 BookOpen, 
 CheckCircle2,
 AlertCircle,
 Lightbulb,
 Star
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Alert, AlertDescription } from '@/components/atoms/Alert';

interface PersonalizedLearningCardProps {
 studentId: string;
}

const getLearningStyleColor = (style: string) => {
 const colors: Record<string, string> = {
 'GÖRSEL': 'bg-blue-500',
 'İŞİTSEL': 'bg-purple-500',
 'KİNESTETİK': 'bg-green-500',
 'OKUMA/YAZMA': 'bg-orange-500',
 };
 return colors[style] || 'bg-gray-500';
};

const getMotivationColor = (type: string) => {
 const colors: Record<string, string> = {
 'İÇSEL': 'text-green-600',
 'DIŞSAL': 'text-blue-600',
 'KARMA': 'text-purple-600',
 };
 return colors[type] || 'text-gray-600';
};

export function PersonalizedLearningCard({ studentId }: PersonalizedLearningCardProps) {
 const { data: learningData, isLoading, error } = useQuery({
 queryKey: ['personalized-learning', studentId],
 queryFn: () => personalizedLearningAPI.getPersonalizedRecommendations(studentId),
 staleTime: 5 * 60 * 1000,
 });

 if (isLoading) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Kişiselleştirilmiş Öğrenme Planı</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex items-center justify-center h-40">
 <div className=" rounded-full h-8 w-8 border-b-2 border-primary"></div>
 </div>
 </CardContent>
 </Card>
 );
 }

 if (error || !learningData) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Kişiselleştirilmiş Öğrenme Planı</CardTitle>
 </CardHeader>
 <CardContent>
 <Alert>
 <AlertCircle className="h-4 w-4" />
 <AlertDescription>
 Öğrenme planı yüklenirken bir hata oluştu.
 </AlertDescription>
 </Alert>
 </CardContent>
 </Card>
 );
 }

 return (
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <CardTitle className="flex items-center gap-2">
 <Brain className="h-5 w-5" />
 Kişiselleştirilmiş Öğrenme Planı
 </CardTitle>
 <Badge className={getLearningStyleColor(learningData.learningProfile.primaryStyle)}>
 {learningData.learningProfile.primaryStyle}
 </Badge>
 </div>
 </CardHeader>
 <CardContent className="space-y-6">
 <Tabs defaultValue="profile" className="w-full">
 <TabsList variant="nested">
 <TabsTrigger value="profile" variant="nested">Profil</TabsTrigger>
 <TabsTrigger value="strengths" variant="nested">Güçlü Yönler</TabsTrigger>
 <TabsTrigger value="weaknesses" variant="nested">Gelişim Alanları</TabsTrigger>
 <TabsTrigger value="strategies" variant="nested">Stratejiler</TabsTrigger>
 </TabsList>

 <TabsContent value="profile" className="space-y-4 mt-4">
 <div className="space-y-3">
 <div>
 <h4 className="font-medium text-sm mb-2">Öğrenme Stili</h4>
 <div className="flex items-center gap-2">
 <Badge variant="outline" className={getLearningStyleColor(learningData.learningProfile.primaryStyle)}>
 {learningData.learningProfile.primaryStyle}
 </Badge>
 {learningData.learningProfile.secondaryStyle && (
 <Badge variant="outline">
 {learningData.learningProfile.secondaryStyle}
 </Badge>
 )}
 </div>
 </div>

 <div>
 <h4 className="font-medium text-sm mb-2">Motivasyon Tipi</h4>
 <Badge variant="outline" className={getMotivationColor(learningData.learningProfile.motivationType)}>
 {learningData.learningProfile.motivationType}
 </Badge>
 </div>

 <div>
 <h4 className="font-medium text-sm mb-2">Öğrenme Hızı</h4>
 <Badge variant="outline">
 {learningData.learningProfile.learningPace}
 </Badge>
 </div>

 <div>
 <h4 className="font-medium text-sm mb-2">Tercih Edilen Çalışma Zamanı</h4>
 <p className="text-sm text-muted-foreground">
 {learningData.learningProfile.preferredStudyTime}
 </p>
 </div>
 </div>
 </TabsContent>

 <TabsContent value="strengths" className="space-y-3 mt-4">
 {learningData.strengths.length === 0 ? (
 <p className="text-sm text-muted-foreground text-center py-4">
 Henüz güçlü yön verisi mevcut değil
 </p>
 ) : (
 learningData.strengths.map((strength: any, index: number) => (
 <div key={index} className="p-3 border rounded-lg space-y-2">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-2">
 <Star className="h-4 w-4 text-yellow-500" />
 <span className="font-medium text-sm">{strength.subject}</span>
 </div>
 <Badge variant="outline" className="text-green-600">
 {strength.score}%
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground">{strength.description}</p>
 <div className="flex flex-wrap gap-1">
 {strength.skills.map((skill: string, i: number) => (
 <Badge key={i} variant="secondary" className="text-xs">
 {skill}
 </Badge>
 ))}
 </div>
 </div>
 ))
 )}
 </TabsContent>

 <TabsContent value="weaknesses" className="space-y-3 mt-4">
 {learningData.weaknesses.length === 0 ? (
 <p className="text-sm text-muted-foreground text-center py-4">
 Gelişim alanı verisi mevcut değil
 </p>
 ) : (
 learningData.weaknesses.map((weakness: any, index: number) => (
 <div key={index} className="p-3 border rounded-lg space-y-2">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-2">
 <Target className="h-4 w-4 text-orange-500" />
 <span className="font-medium text-sm">{weakness.subject}</span>
 </div>
 <Badge variant="outline" className="text-orange-600">
 {weakness.score}%
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground">{weakness.description}</p>
 <div className="space-y-2 mt-2">
 <p className="text-xs font-medium">Hedef Beceriler:</p>
 <div className="flex flex-wrap gap-1">
 {weakness.targetSkills.map((skill: string, i: number) => (
 <Badge key={i} variant="outline" className="text-xs">
 {skill}
 </Badge>
 ))}
 </div>
 </div>
 </div>
 ))
 )}
 </TabsContent>

 <TabsContent value="strategies" className="space-y-3 mt-4">
 {learningData.recommendedStrategies.length === 0 ? (
 <p className="text-sm text-muted-foreground text-center py-4">
 Strateji önerisi mevcut değil
 </p>
 ) : (
 learningData.recommendedStrategies.map((strategy: any, index: number) => (
 <div key={index} className="p-3 border rounded-lg space-y-2">
 <div className="flex items-start gap-2">
 <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
 <div className="flex-1 space-y-2">
 <div className="flex items-center justify-between">
 <h5 className="font-medium text-sm">{strategy.strategy}</h5>
 <Badge variant="outline">{strategy.category}</Badge>
 </div>
 <p className="text-xs text-muted-foreground">{strategy.description}</p>
 
 <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded space-y-2">
 <p className="text-xs font-medium">Uygulama Adımları:</p>
 <ul className="space-y-1">
 {strategy.steps.map((step: string, i: number) => (
 <li key={i} className="text-xs flex items-start gap-2">
 <CheckCircle2 className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
 <span>{step}</span>
 </li>
 ))}
 </ul>
 </div>

 <div className="flex items-center justify-between pt-2">
 <span className="text-xs text-muted-foreground">
 Beklenen Süre: {strategy.expectedDuration}
 </span>
 <div className="flex items-center gap-1">
 <TrendingUp className="h-3 w-3 text-green-600" />
 <span className="text-xs text-green-600">
 Başarı: {strategy.successProbability}%
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>
 ))
 )}
 </TabsContent>
 </Tabs>

 {learningData.studyPlan && (
 <div className="border-t pt-4">
 <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
 <BookOpen className="h-4 w-4" />
 Günlük Çalışma Planı
 </h4>
 <div className="space-y-2">
 {learningData.studyPlan.dailySchedule.map((schedule: any, index: number) => (
 <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
 <div className="flex items-center gap-3">
 <span className="text-sm font-medium">{schedule.time}</span>
 <span className="text-sm">{schedule.subject}</span>
 </div>
 <Badge variant="secondary" className="text-xs">
 {schedule.duration} dk
 </Badge>
 </div>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 Toplam çalışma süresi: {learningData.studyPlan.totalDuration} dakika
 </p>
 </div>
 )}

 <div className="text-xs text-muted-foreground text-center pt-2 border-t">
 Son güncelleme: {new Date().toLocaleString('tr-TR')}
 </div>
 </CardContent>
 </Card>
 );
}
