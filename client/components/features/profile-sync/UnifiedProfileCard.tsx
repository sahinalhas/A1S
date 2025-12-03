import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, RefreshCw } from 'lucide-react';
import { handleApiError } from '@/lib/utils/errors/error';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';

interface UnifiedStudentIdentity {
 studentId: string;
 lastUpdated: string;
 summary: string;
 keyCharacteristics: string[];
 currentState: string;
 academicScore: number;
 socialEmotionalScore: number;
 behavioralScore: number;
 motivationScore: number;
 riskLevel: number;
 strengths: string[];
 challenges: string[];
 recentChanges: string[];
 personalityProfile: string;
 learningStyle: string;
 interventionPriority: 'low' | 'medium' | 'high' | 'critical';
 recommendedActions: string[];
}

interface UnifiedProfileCardProps {
 studentId: string;
}

export default function UnifiedProfileCard({ studentId }: UnifiedProfileCardProps) {
 const [identity, setIdentity] = useState<UnifiedStudentIdentity | null>(null);
 const [loading, setLoading] = useState(true);
 const [refreshing, setRefreshing] = useState(false);

 const fetchIdentity = async () => {
 try {
 const response = await fetchWithSchool(`/api/profile-sync/identity/${studentId}`);
 if (response.ok) {
 const payload = await response.json();
 const fetchedIdentity = payload.data ?? payload;
 if (fetchedIdentity && fetchedIdentity.studentId) {
 setIdentity(fetchedIdentity);
 } else {
 setIdentity(null);
 }
 } else if (response.status === 400 || response.status === 404) {
 setIdentity(null);
 } else {
 handleApiError(new Error(`HTTP ${response.status}`), {
 title: 'Profil yüklenemedi',
 description: 'Öğrenci profil bilgileri yüklenirken bir hata oluştu',
 context: 'fetchIdentity'
 });
 }
 } catch (error) {
 handleApiError(error, {
 title: 'Profil yüklenemedi',
 description: 'Bağlantı hatası oluştu',
 context: 'fetchIdentity'
 });
 } finally {
 setLoading(false);
 }
 };

 const handleRefresh = async () => {
 setRefreshing(true);
 try {
 await fetchWithSchool(`/api/profile-sync/identity/${studentId}/refresh`, { method: 'POST' });
 // Yenileme başladı, 3 saniye sonra tekrar çek
 setTimeout(fetchIdentity, 3000);
 } catch (error) {
 console.error('Error refreshing identity:', error);
 } finally {
 setRefreshing(false);
 }
 };

 useEffect(() => {
 fetchIdentity();
 }, [studentId]);

 if (loading) {
 return (
 <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
 <CardContent className="p-6">
 <div className=" space-y-4">
 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
 <div className="h-4 bg-gray-200 rounded w-1/2"></div>
 </div>
 </CardContent>
 </Card>
 );
 }

 if (!identity) return null;

 const getPriorityColor = (priority: string) => {
 switch (priority) {
 case 'critical': return 'destructive' as const;
 case 'high': return 'destructive' as const;
 case 'medium': return 'default' as const;
 case 'low': return 'secondary' as const;
 default: return 'secondary' as const;
 }
 };

 const getScoreColor = (score: number) => {
 if (score >= 70) return 'text-green-600';
 if (score >= 40) return 'text-yellow-600';
 return 'text-red-600';
 };

 return (
 <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
 <CardHeader className="pb-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Sparkles className="h-5 w-5 text-purple-600" />
 <CardTitle className="text-lg">Kim Bu Öğrenci?</CardTitle>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={handleRefresh}
 disabled={refreshing}
 >
 <RefreshCw className="h-4 w-4" />
 </Button>
 </div>
 <p className="text-xs text-gray-500">
 Son güncelleme: {new Date(identity.lastUpdated).toLocaleString('tr-TR')}
 </p>
 </CardHeader>
 
 <CardContent className="space-y-4">
 {/* Özet */}
 <div>
 <p className="text-sm font-medium text-gray-700">{identity.summary}</p>
 </div>

 {/* Şu Anki Durum */}
 <div className="flex items-start gap-2 bg-white p-3 rounded-lg">
 <AlertTriangle className="h-4 w-4 mt-0.5 text-purple-600" />
 <div className="flex-1">
 <p className="text-xs font-semibold text-gray-600">Şu Anki Durum</p>
 <p className="text-sm">{identity.currentState}</p>
 </div>
 <Badge variant={getPriorityColor(identity.interventionPriority)}>
 {identity.interventionPriority.toUpperCase()}
 </Badge>
 </div>

 {/* Skorlar */}
 <div className="grid grid-cols-2 gap-2">
 <div className="bg-white p-2 rounded">
 <p className="text-xs text-gray-600">Akademik</p>
 <p className={`text-lg font-bold ${getScoreColor(identity.academicScore)}`}>
 {identity.academicScore}
 </p>
 </div>
 <div className="bg-white p-2 rounded">
 <p className="text-xs text-gray-600">Sosyal-Duygusal</p>
 <p className={`text-lg font-bold ${getScoreColor(identity.socialEmotionalScore)}`}>
 {identity.socialEmotionalScore}
 </p>
 </div>
 <div className="bg-white p-2 rounded">
 <p className="text-xs text-gray-600">Davranış</p>
 <p className={`text-lg font-bold ${getScoreColor(identity.behavioralScore)}`}>
 {identity.behavioralScore}
 </p>
 </div>
 <div className="bg-white p-2 rounded">
 <p className="text-xs text-gray-600">Risk</p>
 <p className={`text-lg font-bold ${identity.riskLevel >= 70 ? 'text-red-600' : identity.riskLevel >= 40 ? 'text-yellow-600' : 'text-green-600'}`}>
 {identity.riskLevel}
 </p>
 </div>
 </div>

 {/* Güçlü Yönler & Zorluklar */}
 <div className="grid grid-cols-2 gap-3">
 <div>
 <div className="flex items-center gap-1 mb-1">
 <TrendingUp className="h-3 w-3 text-green-600" />
 <p className="text-xs font-semibold text-gray-600">Güçlü Yönler</p>
 </div>
 <div className="space-y-1">
 {identity.strengths.slice(0, 3).map((strength, i) => (
 <Badge key={i} variant="outline" className="text-xs">
 {strength}
 </Badge>
 ))}
 </div>
 </div>
 <div>
 <div className="flex items-center gap-1 mb-1">
 <TrendingDown className="h-3 w-3 text-orange-600" />
 <p className="text-xs font-semibold text-gray-600">Zorluklar</p>
 </div>
 <div className="space-y-1">
 {identity.challenges.slice(0, 3).map((challenge, i) => (
 <Badge key={i} variant="outline" className="text-xs">
 {challenge}
 </Badge>
 ))}
 </div>
 </div>
 </div>

 {/* Öneriler */}
 {identity.recommendedActions.length > 0 && (
 <div className="bg-purple-100 p-3 rounded-lg">
 <p className="text-xs font-semibold text-purple-900 mb-2">AI Önerileri</p>
 <ul className="space-y-1">
 {identity.recommendedActions.slice(0, 3).map((action, i) => (
 <li key={i} className="text-xs text-purple-800 flex items-start gap-1">
 <span>•</span>
 <span>{action}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 </CardContent>
 </Card>
 );
}
