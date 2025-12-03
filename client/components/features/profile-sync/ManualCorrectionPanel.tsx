import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { Textarea } from '@/components/atoms/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
import { Edit3, Save, X } from 'lucide-react';
import { handleApiError, showSuccessToast } from '@/lib/utils/errors/error';
import { API_ERROR_MESSAGES } from '@/lib/constants/messages.constants';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';

interface ManualCorrectionPanelProps {
 studentId: string;
 onCorrectionSaved?: () => void;
}

export default function ManualCorrectionPanel({ studentId, onCorrectionSaved }: ManualCorrectionPanelProps) {
 const { user } = useAuth();
 const [isOpen, setIsOpen] = useState(false);
 const [domain, setDomain] = useState('');
 const [field, setField] = useState('');
 const [oldValue, setOldValue] = useState('');
 const [newValue, setNewValue] = useState('');
 const [reason, setReason] = useState('');
 const [saving, setSaving] = useState(false);

 const handleSave = async () => {
 if (!domain || !field || !newValue || !reason) {
 toast.error('Lütfen tüm alanları doldurun');
 return;
 }

 setSaving(true);
 try {
 const response = await fetchWithSchool('/api/profile-sync/correction', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 studentId,
 domain,
 field,
 oldValue,
 newValue,
 reason,
 correctedBy: user?.id || 'unknown'
 })
 });

 if (response.ok) {
 showSuccessToast('Düzeltme başarıyla kaydedildi', 'AI düzeltmesi profilde güncellenmiştir');
 setIsOpen(false);
 resetForm();
 onCorrectionSaved?.();
 } else {
 handleApiError(new Error('Düzeltme kaydedilemedi'), {
 title: API_ERROR_MESSAGES.GENERIC.SAVE_ERROR,
 description: API_ERROR_MESSAGES.GENERIC.SAVE_ERROR_DESCRIPTION,
 context: 'saveCorrection'
 });
 }
 } catch (error) {
 handleApiError(error, {
 title: API_ERROR_MESSAGES.GENERIC.OPERATION_ERROR,
 description: API_ERROR_MESSAGES.GENERIC.OPERATION_ERROR_DESCRIPTION,
 context: 'saveCorrection'
 });
 } finally {
 setSaving(false);
 }
 };

 const resetForm = () => {
 setDomain('');
 setField('');
 setOldValue('');
 setNewValue('');
 setReason('');
 };

 if (!isOpen) {
 return (
 <Button
 onClick={() => setIsOpen(true)}
 variant="outline"
 size="sm"
 className="gap-2"
 >
 <Edit3 className="h-4 w-4" />
 AI Düzeltme
 </Button>
 );
 }

 return (
 <Card className="border-blue-200 bg-blue-50">
 <CardHeader className="pb-3">
 <CardTitle className="text-lg flex items-center justify-between">
 <span className="flex items-center gap-2">
 <Edit3 className="h-5 w-5 text-blue-600" />
 Manuel AI Düzeltme
 </span>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => {
 setIsOpen(false);
 resetForm();
 }}
 >
 <X className="h-4 w-4" />
 </Button>
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <Label>Alan (Domain)</Label>
 <Select value={domain} onValueChange={setDomain}>
 <SelectTrigger>
 <SelectValue placeholder="Alan seçin" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="health">Sağlık</SelectItem>
 <SelectItem value="academic">Akademik</SelectItem>
 <SelectItem value="social_emotional">Sosyal-Duygusal</SelectItem>
 <SelectItem value="talents_interests">Yetenek/İlgi</SelectItem>
 <SelectItem value="behavioral">Davranışsal</SelectItem>
 <SelectItem value="motivation">Motivasyon</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label>Özellik (Field)</Label>
 <Input
 value={field}
 onChange={(e) => setField(e.target.value)}
 placeholder="Örn: lastHealthCheckup, learningStyle"
 />
 </div>

 <div className="space-y-2">
 <Label>Eski Değer (Opsiyonel)</Label>
 <Input
 value={oldValue}
 onChange={(e) => setOldValue(e.target.value)}
 placeholder="Mevcut değer"
 />
 </div>

 <div className="space-y-2">
 <Label>Yeni Değer</Label>
 <Input
 value={newValue}
 onChange={(e) => setNewValue(e.target.value)}
 placeholder="Düzeltilmiş değer"
 />
 </div>

 <div className="space-y-2">
 <Label>Düzeltme Nedeni</Label>
 <Textarea
 value={reason}
 onChange={(e) => setReason(e.target.value)}
 placeholder="AI hatası, yanlış çıkarım, eksik bilgi vb."
 rows={3}
 />
 </div>

 <div className="flex gap-2">
 <Button
 onClick={handleSave}
 disabled={saving}
 className="flex-1"
 >
 <Save className="h-4 w-4 mr-2" />
 {saving ? 'Kaydediliyor...' : 'Kaydet'}
 </Button>
 <Button
 variant="outline"
 onClick={() => {
 setIsOpen(false);
 resetForm();
 }}
 >
 İptal
 </Button>
 </div>
 </CardContent>
 </Card>
 );
}
