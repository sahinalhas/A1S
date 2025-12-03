import { useQuery } from '@tanstack/react-query';
import { enhancedRiskAPI, type EnhancedRiskScore } from '@/lib/api/endpoints/enhanced-risk.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Progress } from '@/components/atoms/Progress';
import { 
 AlertTriangle, 
 TrendingUp, 
 TrendingDown, 
 Minus,
 Shield,
 Brain,
 Heart,
 Users,
 Home,
 Activity
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { cn } from '@/lib/utils';

interface EnhancedRiskCardProps {
 studentId: string;
}

const getRiskColor = (level: string) => {
 switch (level) {
 case 'DÜŞÜK': return 'bg-green-500';
 case 'ORTA': return 'bg-yellow-500';
 case 'YÜKSEK': return 'bg-orange-500';
 case 'KRİTİK': return 'bg-red-500';
 default: return 'bg-gray-500';
 }
};

const getSeverityColor = (severity: string) => {
 switch (severity) {
 case 'LOW': return 'text-green-600';
 case 'MEDIUM': return 'text-yellow-600';
 case 'HIGH': return 'text-orange-600';
 case 'CRITICAL': return 'text-red-600';
 default: return 'text-gray-600';
 }
};

const getTrendIcon = (trend: string) => {
 switch (trend) {
 case 'IMPROVING': return <TrendingUp className="h-4 w-4 text-green-500" />;
 case 'DECLINING': return <TrendingDown className="h-4 w-4 text-red-500" />;
 default: return <Minus className="h-4 w-4 text-gray-500" />;
 }
};

const getFactorIcon = (factor: string) => {
 const iconMap: Record<string, any> = {
 'Akademik Performans': Brain,
 'Davranışsal Sorunlar': AlertTriangle,
 'Devam Durumu': Activity,
 'Sosyal-Duygusal Gelişim': Heart,
 'Aile Desteği': Home,
 'Akran İlişkileri': Users,
 };
 const Icon = iconMap[factor] || Shield;
 return <Icon className="h-4 w-4" />;
};

export function EnhancedRiskCard({ studentId }: EnhancedRiskCardProps) {
 const { data: riskScore, isLoading, error } = useQuery({
 queryKey: ['enhanced-risk', studentId],
 queryFn: () => enhancedRiskAPI.getEnhancedRiskScore(studentId),
 staleTime: 5 * 60 * 1000,
 });

 if (isLoading) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Gelişmiş Risk Değerlendirmesi</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex items-center justify-center h-40">
 <div className=" rounded-full h-8 w-8 border-b-2 border-primary"></div>
 </div>
 </CardContent>
 </Card>
 );
 }

 if (error || !riskScore) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Gelişmiş Risk Değerlendirmesi</CardTitle>
 </CardHeader>
 <CardContent>
 <Alert>
 <AlertTriangle className="h-4 w-4" />
 <AlertDescription>
 Risk analizi yüklenirken bir hata oluştu.
 </AlertDescription>
 </Alert>
 </CardContent>
 </Card>
 );
 }

 return (
 <Card className="relative overflow-hidden">
 {/* Gradient Background */}
 <div className={cn(
"absolute inset-0 opacity-5",
 riskScore.riskLevel === 'KRİTİK' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
 riskScore.riskLevel === 'YÜKSEK' ? 'bg-gradient-to-br from-orange-500 to-yellow-500' :
 riskScore.riskLevel === 'ORTA' ? 'bg-gradient-to-br from-yellow-500 to-amber-500' :
 'bg-gradient-to-br from-green-500 to-emerald-500'
 )} />
 
 <CardHeader className="relative">
 <div className="flex items-center justify-between">
 <CardTitle className="flex items-center gap-2">
 <div className={cn(
"p-2 rounded-lg",
 riskScore.riskLevel === 'KRİTİK' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
 riskScore.riskLevel === 'YÜKSEK' ? 'bg-gradient-to-br from-orange-500 to-yellow-500' :
 riskScore.riskLevel === 'ORTA' ? 'bg-gradient-to-br from-yellow-500 to-amber-500' :
 'bg-gradient-to-br from-green-500 to-emerald-500'
 )}>
 <Shield className="h-5 w-5 text-white" />
 </div>
 Gelişmiş Risk Değerlendirmesi
 </CardTitle>
 <Badge className={cn("font-semibold", getRiskColor(riskScore.riskLevel),"text-white")}>
 {riskScore.riskLevel}
 </Badge>
 </div>
 <p className="text-sm text-muted-foreground mt-2">
 Güven Skoru: {riskScore.confidence.toFixed(0)}%
 </p>
 </CardHeader>
 <CardContent className="space-y-6">
 <div>
 <div className="flex items-center justify-between mb-2">
 <span className="text-sm font-medium">Genel Risk Skoru</span>
 <span className="text-2xl font-bold">
 {(riskScore.overallRiskScore * 100).toFixed(0)}%
 </span>
 </div>
 <Progress value={riskScore.overallRiskScore * 100} className="h-3" />
 </div>

 <Tabs defaultValue="factors" className="w-full">
 <TabsList variant="nested">
 <TabsTrigger value="factors" variant="nested">Faktörler</TabsTrigger>
 <TabsTrigger value="predictions" variant="nested">Tahminler</TabsTrigger>
 <TabsTrigger value="risks" variant="nested">Riskler</TabsTrigger>
 <TabsTrigger value="protective" variant="nested">Koruyucular</TabsTrigger>
 </TabsList>

 <TabsContent value="factors" className="space-y-3 mt-4">
 {Object.entries(riskScore.factorScores).map(([key, value]) => (
 <div key={key} className="space-y-1">
 <div className="flex items-center justify-between text-sm">
 <span className="capitalize">
 {key === 'academic' ? 'Akademik' :
 key === 'behavioral' ? 'Davranışsal' :
 key === 'attendance' ? 'Devam' :
 key === 'socialEmotional' ? 'Sosyal-Duygusal' :
 key === 'familySupport' ? 'Aile Desteği' :
 key === 'peerRelations' ? 'Akran İlişkileri' :
 key === 'motivation' ? 'Motivasyon' :
 key === 'health' ? 'Sağlık' : key}
 </span>
 <span className="font-medium">{(value * 100).toFixed(0)}%</span>
 </div>
 <Progress value={value * 100} className="h-2" />
 </div>
 ))}
 </TabsContent>

 <TabsContent value="predictions" className="space-y-4 mt-4">
 <div className="space-y-2">
 <h4 className="font-medium text-sm">Kısa Vadeli (1 Hafta)</h4>
 <p className="text-sm text-muted-foreground">
 {riskScore.predictiveIndicators.shortTerm.nextWeek}
 </p>
 <Progress 
 value={riskScore.predictiveIndicators.shortTerm.probability} 
 className="h-2" 
 />
 {riskScore.predictiveIndicators.shortTerm.suggestedActions.length > 0 && (
 <ul className="text-xs space-y-1 mt-2">
 {riskScore.predictiveIndicators.shortTerm.suggestedActions.map((action, i) => (
 <li key={i} className="flex items-start gap-1">
 <span className="text-primary">•</span>
 <span>{action}</span>
 </li>
 ))}
 </ul>
 )}
 </div>

 <div className="space-y-2">
 <h4 className="font-medium text-sm">Orta Vadeli (1 Ay)</h4>
 <p className="text-sm text-muted-foreground">
 {riskScore.predictiveIndicators.mediumTerm.nextMonth}
 </p>
 <Progress 
 value={riskScore.predictiveIndicators.mediumTerm.probability} 
 className="h-2" 
 />
 </div>

 <div className="space-y-2">
 <h4 className="font-medium text-sm">Uzun Vadeli (1 Dönem)</h4>
 <p className="text-sm text-muted-foreground">
 {riskScore.predictiveIndicators.longTerm.nextSemester}
 </p>
 <Progress 
 value={riskScore.predictiveIndicators.longTerm.probability} 
 className="h-2" 
 />
 </div>
 </TabsContent>

 <TabsContent value="risks" className="space-y-3 mt-4">
 {riskScore.keyRiskFactors.length === 0 ? (
 <p className="text-sm text-muted-foreground text-center py-4">
 Önemli risk faktörü tespit edilmedi
 </p>
 ) : (
 riskScore.keyRiskFactors.map((risk, index) => (
 <div key={index} className="p-3 border rounded-lg space-y-2">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-2">
 {getFactorIcon(risk.factor)}
 <span className="font-medium text-sm">{risk.factor}</span>
 </div>
 <div className="flex items-center gap-2">
 {getTrendIcon(risk.trend)}
 <Badge 
 variant="outline" 
 className={getSeverityColor(risk.severity)}
 >
 {risk.severity}
 </Badge>
 </div>
 </div>
 <p className="text-xs text-muted-foreground">{risk.description}</p>
 <div className="bg-muted/50 p-2 rounded text-xs">
 <span className="font-medium">Öneri: </span>
 {risk.recommendation}
 </div>
 </div>
 ))
 )}
 </TabsContent>

 <TabsContent value="protective" className="space-y-3 mt-4">
 {riskScore.protectiveFactors.length === 0 ? (
 <p className="text-sm text-muted-foreground text-center py-4">
 Koruyucu faktör bilgisi mevcut değil
 </p>
 ) : (
 riskScore.protectiveFactors.map((factor, index) => (
 <div key={index} className="p-3 border rounded-lg space-y-2">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Shield className="h-4 w-4 text-green-600" />
 <span className="font-medium text-sm">{factor.factor}</span>
 </div>
 <Badge variant="outline" className="text-green-600">
 Güç: {factor.strength}/10
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground">{factor.description}</p>
 </div>
 ))
 )}
 </TabsContent>
 </Tabs>

 <div className="text-xs text-muted-foreground text-center pt-2 border-t">
 Son güncelleme: {new Date(riskScore.calculatedAt).toLocaleString('tr-TR')}
 </div>
 </CardContent>
 </Card>
 );
}
