import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Badge } from '@/components/atoms/Badge';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/RadioGroup';
import { Label } from '@/components/atoms/Label';
import { Textarea } from '@/components/atoms/Textarea';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { handleApiError, showSuccessToast } from '@/lib/utils/errors/error';
import { API_ERROR_MESSAGES } from '@/lib/constants/messages.constants';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

interface ConflictResolutionUIProps {
 studentId: string;
}

interface PendingConflict {
 id: string;
 studentId: string;
 conflictType: string;
 domain?: string;
 oldValue: unknown;
 newValue: unknown;
 severity?: string;
 reasoning: string;
 timestamp: string;
}

export default function ConflictResolutionUI({ studentId }: ConflictResolutionUIProps) {
 const { user } = useAuth();
 const [conflicts, setConflicts] = useState<PendingConflict[]>([]);
 const [loading, setLoading] = useState(true);
 const [selectedConflict, setSelectedConflict] = useState<string | null>(null);
 const [selectedValue, setSelectedValue] = useState<'old' | 'new'>('new');
 const [resolutionReason, setResolutionReason] = useState('');
 const [resolving, setResolving] = useState(false);

 useEffect(() => {
 fetchPendingConflicts();
 }, [studentId]);

 const fetchPendingConflicts = async () => {
 try {
 const response = await fetchWithSchool(`/api/profile-sync/conflicts/pending?studentId=${studentId}`);
 if (response.ok) {
 const data = await response.json();
 setConflicts(Array.isArray(data) ? data : []);
 } else if (response.status === 400 || response.status === 404) {
 setConflicts([]);
 } else {
 handleApiError(new Error(`HTTP ${response.status}`), {
 title: 'Çelişkiler yüklenemedi',
 description: API_ERROR_MESSAGES.GENERIC.LOAD_ERROR_DESCRIPTION,
 context: 'fetchPendingConflicts'
 });
 }
 } catch (error) {
 handleApiError(error, {
 title: API_ERROR_MESSAGES.GENERIC.LOAD_ERROR,
 description: API_ERROR_MESSAGES.GENERIC.LOAD_ERROR_DESCRIPTION,
 context: 'fetchPendingConflicts'
 });
 } finally {
 setLoading(false);
 }
 };

 const handleResolve = async (conflictId: string) => {
 if (!resolutionReason) {
 toast.error('Lütfen çözüm nedenini açıklayın');
 return;
 }

 setResolving(true);
 try {
 const conflict = conflicts.find(c => c.id === conflictId);
 if (!conflict) return;

 const selectedValueData = selectedValue === 'old' ? conflict.oldValue : conflict.newValue;

 const response = await fetch('/api/profile-sync/conflicts/resolve', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 conflictId,
 selectedValue: selectedValueData,
 reason: resolutionReason,
 resolvedBy: user?.id || 'unknown'
 })
 });

 if (response.ok) {
 showSuccessToast('Çelişki çözüldü', 'Seçilen değer başarıyla kaydedildi');
 setConflicts(conflicts.filter(c => c.id !== conflictId));
 setSelectedConflict(null);
 setResolutionReason('');
 } else {
 handleApiError(new Error('Çelişki çözülemedi'), {
 title: 'Çelişki çözülemedi',
 description: 'Lütfen tekrar deneyin',
 context: 'resolveConflict'
 });
 }
 } catch (error) {
 handleApiError(error, {
 title: API_ERROR_MESSAGES.GENERIC.OPERATION_ERROR,
 description: API_ERROR_MESSAGES.GENERIC.OPERATION_ERROR_DESCRIPTION,
 context: 'resolveConflict'
 });
 } finally {
 setResolving(false);
 }
 };

 const getSeverityColor = (severity?: string) => {
 switch (severity) {
 case 'high': return 'bg-red-100 text-red-800 border-red-300';
 case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
 case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
 default: return 'bg-gray-100 text-gray-800 border-gray-300';
 }
 };

 const formatValue = (value: unknown): string => {
 if (value === null) return 'null';
 if (value === undefined) return 'undefined';
 if (typeof value === 'object') {
 return JSON.stringify(value, null, 2);
 }
 return String(value);
 };

 if (loading) {
 return null;
 }

 if (conflicts.length === 0) {
 return null;
 }

 return (
 <Card className="border-orange-200">
 <CardHeader>
 <CardTitle className="text-lg flex items-center gap-2">
 <AlertTriangle className="h-5 w-5 text-orange-600" />
 Çelişki Çözümü ({conflicts.length})
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 {conflicts.map((conflict) => (
 <div
 key={conflict.id}
 className={`border rounded-lg p-4 ${getSeverityColor(conflict.severity)}`}
 >
 <div className="flex items-center justify-between mb-3">
 <Badge variant="outline" className="bg-white">
 {conflict.domain || conflict.conflictType}
 </Badge>
 <span className="text-xs text-gray-600">
 {new Date(conflict.timestamp).toLocaleDateString('tr-TR')}
 </span>
 </div>

 <p className="text-sm mb-3 italic">{conflict.reasoning}</p>

 {selectedConflict === conflict.id ? (
 <div className="space-y-3 mt-4 bg-white p-3 rounded">
 <RadioGroup value={selectedValue} onValueChange={(v) => setSelectedValue(v as 'old' | 'new')}>
 <div className="flex items-center space-x-2 p-2 border rounded">
 <RadioGroupItem value="old" id={`old-${conflict.id}`} />
 <Label htmlFor={`old-${conflict.id}`} className="flex-1 cursor-pointer">
 <span className="text-xs text-gray-500">Eski Değer:</span>
 <p className="text-sm font-mono">{formatValue(conflict.oldValue)}</p>
 </Label>
 </div>
 
 <div className="flex items-center space-x-2 p-2 border rounded">
 <RadioGroupItem value="new" id={`new-${conflict.id}`} />
 <Label htmlFor={`new-${conflict.id}`} className="flex-1 cursor-pointer">
 <span className="text-xs text-gray-500">Yeni Değer:</span>
 <p className="text-sm font-mono">{formatValue(conflict.newValue)}</p>
 </Label>
 </div>
 </RadioGroup>

 <Textarea
 placeholder="Çözüm nedenini açıklayın..."
 value={resolutionReason}
 onChange={(e) => setResolutionReason(e.target.value)}
 rows={2}
 />

 <div className="flex gap-2">
 <Button
 onClick={() => handleResolve(conflict.id)}
 disabled={resolving}
 size="sm"
 className="flex-1"
 >
 {resolving ? 'Çözülüyor...' : 'Çöz'}
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => {
 setSelectedConflict(null);
 setResolutionReason('');
 }}
 >
 İptal
 </Button>
 </div>
 </div>
 ) : (
 <Button
 variant="outline"
 size="sm"
 onClick={() => setSelectedConflict(conflict.id)}
 className="w-full mt-2"
 >
 Çöz <ArrowRight className="h-4 w-4 ml-2" />
 </Button>
 )}
 </div>
 ))}
 </CardContent>
 </Card>
 );
}
