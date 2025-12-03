import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
import { Textarea } from "@/components/molecules/EnhancedTextarea";
import { Label } from '@/components/atoms/Label';
import { Mail, Send, Loader2, FileText, Calendar, Award, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/utils/toast.utils';

interface ParentCommunicationProps {
 studentId: string;
 studentName: string;
}

export default function ParentCommunication({ studentId, studentName }: ParentCommunicationProps) {
 const [messageType, setMessageType] = useState<string>('general');
 const [specificContent, setSpecificContent] = useState('');
 const [loading, setLoading] = useState(false);
 const [generatedMessage, setGeneratedMessage] = useState<any>(null);

 const messageTypes = [
 { value: 'general', label: 'Genel Bilgilendirme', icon: Mail },
 { value: 'progress_update', label: 'İlerleme Raporu', icon: FileText },
 { value: 'meeting_request', label: 'Toplantı Daveti', icon: Calendar },
 { value: 'achievement', label: 'Başarı Kutlaması', icon: Award },
 { value: 'concern', label: 'Endişe Bildirimi', icon: AlertTriangle }
 ];

 const generateMessage = async () => {
 setLoading(true);
 try {
 const response = await fetchWithSchool(`/api/parent-communication/message/${studentId}`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ messageType, specificContent })
 });
 const data = await response.json();
 
 if (data.success) {
 setGeneratedMessage(data.data);
 toast({
 title: 'Mesaj Oluşturuldu',
 description: 'Veli mesajı başarıyla hazırlandı'
 });
 } else {
 throw new Error(data.error);
 }
 } catch (error: unknown) {
 toast({
 title: 'Hata',
 description: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Mesaj oluşturulamadı',
 variant: 'destructive'
 });
 } finally {
 setLoading(false);
 }
 };

 const generateReport = async () => {
 setLoading(true);
 try {
 const response = await fetchWithSchool(`/api/parent-communication/development-report/${studentId}`, {
 method: 'POST'
 });
 const data = await response.json();
 
 if (data.success) {
 toast({
 title: 'Rapor Oluşturuldu',
 description: 'Gelişim raporu hazır'
 });
 }
 } catch (error: unknown) {
 toast({
 title: 'Hata',
 description: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Rapor oluşturulamadı',
 variant: 'destructive'
 });
 } finally {
 setLoading(false);
 }
 };

 const SelectedIcon = messageTypes.find(t => t.value === messageType)?.icon || Mail;

 return (
 <div className="space-y-4">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Mail className="h-5 w-5" />
 Veli İletişim Asistanı
 </CardTitle>
 <CardDescription>
 {studentName} için AI destekli veli mesajları oluşturun
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <Label>Mesaj Tipi</Label>
 <Select value={messageType} onValueChange={setMessageType}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {messageTypes.map(type => {
 const Icon = type.icon;
 return (
 <SelectItem key={type.value} value={type.value}>
 <div className="flex items-center gap-2">
 <Icon className="h-4 w-4" />
 {type.label}
 </div>
 </SelectItem>
 );
 })}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label>Özel İçerik (Opsiyonel)</Label>
 <Textarea
 placeholder="Mesajda vurgulamak istediğiniz özel bilgiler..."
 value={specificContent}
 onChange={(e) => setSpecificContent(e.target.value)}
 rows={3}
 />
 </div>

 <div className="flex gap-2">
 <Button onClick={generateMessage} disabled={loading} className="flex-1">
 {loading ? (
 <>
 <Loader2 className="mr-2 h-4 w-4" />
 Oluşturuluyor...
 </>
 ) : (
 <>
 <Send className="mr-2 h-4 w-4" />
 Mesaj Oluştur
 </>
 )}
 </Button>
 <Button variant="outline" onClick={generateReport} disabled={loading}>
 <FileText className="mr-2 h-4 w-4" />
 Gelişim Raporu
 </Button>
 </div>
 </CardContent>
 </Card>

 {generatedMessage && (
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <CardTitle className="text-lg flex items-center gap-2">
 <SelectedIcon className="h-5 w-5" />
 Oluşturulan Mesaj
 </CardTitle>
 <Button
 size="sm"
 variant="outline"
 onClick={() => {
 navigator.clipboard.writeText(`${generatedMessage.subject}\n\n${generatedMessage.body}`);
 toast({ title: 'Kopyalandı', description: 'Mesaj panoya kopyalandı' });
 }}
 >
 Kopyala
 </Button>
 </div>
 </CardHeader>
 <CardContent className="space-y-4">
 <div>
 <Label className="text-xs text-muted-foreground">Konu</Label>
 <p className="font-medium">{generatedMessage.subject}</p>
 </div>
 <div>
 <Label className="text-xs text-muted-foreground">Mesaj İçeriği</Label>
 <div className="mt-2 p-4 bg-muted/50 rounded-lg whitespace-pre-wrap text-sm">
 {generatedMessage.body}
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Label className="text-xs text-muted-foreground">Ton:</Label>
 <span className="text-sm capitalize">{generatedMessage.tone}</span>
 </div>
 </CardContent>
 </Card>
 )}
 </div>
 );
}
