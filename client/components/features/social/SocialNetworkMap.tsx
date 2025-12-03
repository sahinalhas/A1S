import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Users, AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api/core/client';

interface SocialNetworkMapProps {
 studentId: string;
}

const getRiskColor = (risk: string) => {
 switch (risk) {
 case 'LOW': return 'bg-green-500';
 case 'MEDIUM': return 'bg-yellow-500';
 case 'HIGH': return 'bg-orange-500';
 case 'CRITICAL': return 'bg-red-500';
 default: return 'bg-gray-500';
 }
};

const getInsightIcon = (type: string) => {
 switch (type) {
 case 'strength': return <Shield className="h-4 w-4 text-green-600" />;
 case 'concern': return <AlertTriangle className="h-4 w-4 text-red-600" />;
 case 'opportunity': return <TrendingUp className="h-4 w-4 text-blue-600" />;
 default: return <Users className="h-4 w-4" />;
 }
};

export function SocialNetworkMap({ studentId }: SocialNetworkMapProps) {
 const { data, isLoading, error } = useQuery({
 queryKey: ['social-network', studentId],
 queryFn: async () => {
 const response = await apiClient.get<{ success: boolean; data: any }>(
 `/api/social-network/student/${studentId}`
 );
 return response.data.data;
 },
 staleTime: 10 * 60 * 1000,
 });

 if (isLoading) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Sosyal Ağ Analizi</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex items-center justify-center h-40">
 <div className=" rounded-full h-8 w-8 border-b-2 border-primary"></div>
 </div>
 </CardContent>
 </Card>
 );
 }

 if (error || !data) {
 return null;
 }

 return (
 <div className="space-y-4">
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <CardTitle className="flex items-center gap-2">
 <Users className="h-5 w-5" />
 Sosyal Ağ Analizi
 </CardTitle>
 <Badge className={getRiskColor(data.networkMetrics.isolationRisk)}>
 {data.networkMetrics.isolationRisk} Risk
 </Badge>
 </div>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="grid grid-cols-3 gap-4">
 <div className="text-center">
 <p className="text-2xl font-bold">{data.relationships.totalConnections}</p>
 <p className="text-sm text-muted-foreground">Toplam Bağlantı</p>
 </div>
 <div className="text-center">
 <p className="text-2xl font-bold">{data.relationships.closeFriends}</p>
 <p className="text-sm text-muted-foreground">Yakın Arkadaş</p>
 </div>
 <div className="text-center">
 <p className="text-2xl font-bold">{data.networkMetrics.influenceScore.toFixed(0)}</p>
 <p className="text-sm text-muted-foreground">Etki Skoru</p>
 </div>
 </div>

 <div className="space-y-2">
 <h4 className="font-medium text-sm">Sosyal Rol</h4>
 <Badge variant="outline" className="text-sm">
 {data.networkMetrics.socialRole}
 </Badge>
 </div>

 <div className="space-y-2">
 <h4 className="font-medium text-sm">Sınıf İçi Konum</h4>
 <div className="grid grid-cols-2 gap-2 text-sm">
 <div>
 <span className="text-muted-foreground">Popülerlik: </span>
 <span className="font-medium">
 %{data.classPositioning.popularityPercentile.toFixed(0)}
 </span>
 </div>
 <div>
 <span className="text-muted-foreground">Entegrasyon: </span>
 <span className="font-medium">{data.classPositioning.integrationLevel}</span>
 </div>
 </div>
 </div>

 {data.peerGroups.length > 0 && (
 <div className="space-y-2">
 <h4 className="font-medium text-sm">Akran Grupları</h4>
 <div className="space-y-2">
 {data.peerGroups.map((group: any, index: number) => (
 <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
 <div>
 <p className="font-medium text-sm">{group.groupName}</p>
 <p className="text-xs text-muted-foreground">
 {group.role} • {group.memberCount} üye
 </p>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 <div className="space-y-3">
 <h4 className="font-medium text-sm">Sosyal İçgörüler</h4>
 {data.socialInsights.map((insight: any, index: number) => (
 <div key={index} className="border rounded-lg p-3 space-y-2">
 <div className="flex items-start gap-2">
 {getInsightIcon(insight.type)}
 <div className="flex-1">
 <h5 className="font-medium text-sm">{insight.title}</h5>
 <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
 <div className="bg-muted/50 p-2 rounded mt-2 text-xs">
 <span className="font-medium">Öneri: </span>
 {insight.recommendation}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
