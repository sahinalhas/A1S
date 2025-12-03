import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { PROFILE_SYNC_ENDPOINTS } from '@/lib/constants/api-endpoints';
import { apiClient, createApiHandler } from '@/lib/api/core/client';

interface ConflictResolution {
 id: string;
 studentId: string;
 conflictType: string;
 domain?: string;
 oldValue: unknown;
 newValue: unknown;
 resolvedValue: unknown;
 resolutionMethod: string;
 severity?: string;
 reasoning: string;
 timestamp: string;
 resolvedBy?: string;
}

interface ConflictResolutionPanelProps {
 studentId: string;
}

export default function ConflictResolutionPanel({ studentId }: ConflictResolutionPanelProps) {
 const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchConflicts = async () => {
 setLoading(true);
 const data = await createApiHandler(
 async () => {
 return await apiClient.get<ConflictResolution[]>(
 PROFILE_SYNC_ENDPOINTS.CONFLICTS_BY_STUDENT(studentId),
 { showErrorToast: false }
 );
 },
 []
 )();
 setConflicts(data);
 setLoading(false);
 };

 fetchConflicts();
 }, [studentId]);

 const getSeverityColor = (severity?: string) => {
 switch (severity) {
 case 'high': return 'destructive' as const;
 case 'medium': return 'default' as const;
 case 'low': return 'secondary' as const;
 default: return 'secondary' as const;
 }
 };

 const getResolutionIcon = (method: string) => {
 if (method === 'manual') return '👤';
 return '🤖';
 };

 if (loading) {
 return (
 <Card className="border-orange-200">
 <CardHeader>
 <CardTitle className="text-lg flex items-center gap-2">
 <AlertTriangle className="h-5 w-5 text-orange-600" />
 Veri Çelişkileri
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className=" h-20 bg-gray-200 rounded"></div>
 </CardContent>
 </Card>
 );
 }

 if (conflicts.length === 0) {
 return (
 <Card className="border-green-200 bg-green-50">
 <CardContent className="p-6 text-center">
 <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
 <p className="text-sm font-medium text-green-900">Veri Çelişkisi Yok</p>
 <p className="text-xs text-green-700 mt-1">
 Tüm profil verileri tutarlı
 </p>
 </CardContent>
 </Card>
 );
 }

 return (
 <Card className="border-orange-200">
 <CardHeader>
 <div className="flex items-center justify-between">
 <CardTitle className="text-lg flex items-center gap-2">
 <AlertTriangle className="h-5 w-5 text-orange-600" />
 Veri Çelişkileri
 </CardTitle>
 <Badge variant="destructive">{conflicts.length}</Badge>
 </div>
 <p className="text-xs text-gray-500">Tespit edilen çelişkili veriler</p>
 </CardHeader>
 
 <CardContent className="space-y-3">
 {conflicts.slice(0, 5).map((conflict) => (
 <div key={conflict.id} className="border border-orange-200 rounded-lg p-3 bg-orange-50">
 <div className="flex items-start justify-between mb-2">
 <div>
 <Badge variant={getSeverityColor(conflict.severity)} className="text-xs">
 {conflict.severity?.toUpperCase() || 'MEDIUM'}
 </Badge>
 {conflict.domain && (
 <Badge variant="outline" className="text-xs ml-1">
 {conflict.domain}
 </Badge>
 )}
 </div>
 <span className="text-xs text-gray-500">
 {new Date(conflict.timestamp).toLocaleDateString('tr-TR')}
 </span>
 </div>

 <p className="text-sm font-medium text-gray-900 mb-2">
 {conflict.conflictType}
 </p>

 <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
 <div className="bg-white p-2 rounded">
 <p className="text-gray-600 font-semibold mb-1">Eski Değer:</p>
 <p className="text-gray-900">{JSON.stringify(conflict.oldValue)}</p>
 </div>
 <div className="bg-white p-2 rounded">
 <p className="text-gray-600 font-semibold mb-1">Yeni Değer:</p>
 <p className="text-gray-900">{JSON.stringify(conflict.newValue)}</p>
 </div>
 </div>

 <div className="bg-green-100 p-2 rounded text-xs mb-2">
 <p className="text-green-900 font-semibold mb-1">
 {getResolutionIcon(conflict.resolutionMethod)} Çözüm:
 </p>
 <p className="text-green-800">{JSON.stringify(conflict.resolvedValue)}</p>
 </div>

 <p className="text-xs text-gray-600 italic">
 {conflict.reasoning}
 </p>
 </div>
 ))}

 {conflicts.length > 5 && (
 <Button variant="outline" size="sm" className="w-full">
 {conflicts.length - 5} çelişki daha göster
 </Button>
 )}
 </CardContent>
 </Card>
 );
}
