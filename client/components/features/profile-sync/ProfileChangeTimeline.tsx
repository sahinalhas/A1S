import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import { Clock, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';

interface ProfileSyncLog {
 id: string;
 studentId: string;
 source: string;
 sourceId: string;
 domain: string;
 action: string;
 validationScore: number;
 aiReasoning: string;
 extractedInsights?: Record<string, any>;
 timestamp: string;
 processedBy: string;
}

interface ProfileChangeTimelineProps {
 studentId: string;
}

export default function ProfileChangeTimeline({ studentId }: ProfileChangeTimelineProps) {
 const [logs, setLogs] = useState<ProfileSyncLog[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchLogs = async () => {
 try {
 const response = await fetchWithSchool(`/api/profile-sync/logs/student/${studentId}?limit=20`);
 if (response.ok) {
 const data = await response.json();
 setLogs(data);
 }
 } catch (error) {
 console.error('Error fetching logs:', error);
 } finally {
 setLoading(false);
 }
 };

 fetchLogs();
 }, [studentId]);

 const getSourceLabel = (source: string) => {
 const labels: Record<string, string> = {
 counseling_session: 'Görüşme',
 survey_response: 'Anket',
 exam_result: 'Sınav',
 behavior_incident: 'Davranış',
 meeting_note: 'Görüşme Notu',
 attendance: 'Devamsızlık',
 parent_meeting: 'Veli Görüşmesi',
 self_assessment: 'Öz Değerlendirme',
 manual_input: 'Manuel Giriş'
 };
 return labels[source] || source;
 };

 const getDomainLabel = (domain: string) => {
 const labels: Record<string, string> = {
 academic: 'Akademik',
 social_emotional: 'Sosyal-Duygusal',
 behavioral: 'Davranışsal',
 motivation: 'Motivasyon',
 risk_factors: 'Risk Faktörleri',
 talents_interests: 'Yetenek/İlgi',
 health: 'Sağlık',
 family: 'Aile'
 };
 return labels[domain] || domain;
 };

 if (loading) {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="text-lg flex items-center gap-2">
 <Clock className="h-5 w-5" />
 Profil Değişim Geçmişi
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className=" space-y-3">
 {[1, 2, 3].map((i) => (
 <div key={i} className="h-16 bg-gray-200 rounded"></div>
 ))}
 </div>
 </CardContent>
 </Card>
 );
 }

 return (
 <Card>
 <CardHeader>
 <CardTitle className="text-lg flex items-center gap-2">
 <Clock className="h-5 w-5" />
 Profil Değişim Geçmişi
 </CardTitle>
 <p className="text-xs text-gray-500">Son 20 güncelleme</p>
 </CardHeader>
 
 <CardContent>
 <ScrollArea className="h-[400px] pr-4">
 {logs.length === 0 ? (
 <p className="text-sm text-gray-500 text-center py-8">
 Henüz profil güncellemesi yok
 </p>
 ) : (
 <div className="space-y-3">
 {logs.map((log) => (
 <div key={log.id} className="border rounded-lg p-3">
 <div className="flex items-start justify-between mb-2">
 <div className="flex items-center gap-2">
 {log.action === 'updated' ? (
 <CheckCircle2 className="h-4 w-4 text-green-600" />
 ) : (
 <XCircle className="h-4 w-4 text-gray-400" />
 )}
 <div>
 <Badge variant="outline" className="text-xs">
 {getSourceLabel(log.source)}
 </Badge>
 <Badge variant="secondary" className="text-xs ml-1">
 {getDomainLabel(log.domain)}
 </Badge>
 </div>
 </div>
 <span className="text-xs text-gray-500">
 {new Date(log.timestamp).toLocaleString('tr-TR', {
 day: '2-digit',
 month: '2-digit',
 hour: '2-digit',
 minute: '2-digit'
 })}
 </span>
 </div>

 {log.aiReasoning && (
 <div className="text-sm text-gray-700 mb-2">
 <FileText className="h-3 w-3 inline mr-1" />
 {log.aiReasoning}
 </div>
 )}

 {log.extractedInsights && Object.keys(log.extractedInsights).length > 0 && (
 <div className="bg-blue-50 p-2 rounded text-xs">
 <p className="font-semibold text-blue-900 mb-1">Çıkarılan Bilgiler:</p>
 <div className="space-y-1">
 {Object.entries(log.extractedInsights).slice(0, 3).map(([key, value]) => (
 <div key={key} className="text-blue-800">
 <span className="font-medium">{key}:</span> {String(value)}
 </div>
 ))}
 </div>
 </div>
 )}

 <div className="mt-2 flex items-center justify-between">
 <Badge 
 variant={log.validationScore >= 70 ? 'default' : 'secondary'}
 className="text-xs"
 >
 Güven: %{log.validationScore}
 </Badge>
 <span className="text-xs text-gray-500">
 {log.processedBy === 'ai' ? '🤖 AI' : '👤 Manuel'}
 </span>
 </div>
 </div>
 ))}
 </div>
 )}
 </ScrollArea>
 </CardContent>
 </Card>
 );
}
