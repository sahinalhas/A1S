import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/endpoints/notifications.api";
import { apiClient } from "@/lib/api/core/client";
import { PARENT_COMMUNICATION_ENDPOINTS } from "@/lib/constants/api-endpoints";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/atoms/Select";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/organisms/Table";
import { Badge } from "@/components/atoms/Badge";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/organisms/Dialog";
import { Link2, Copy, Trash2, Eye, Calendar, MessageSquare, FileText, Mail, Award, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Textarea } from "@/components/atoms/Textarea";

export default function ParentAccess() {
 const queryClient = useQueryClient();
 const [selectedStudentId, setSelectedStudentId] = useState<string>("");
 const [expiryDays, setExpiryDays] = useState<number>(30);
 const [isDialogOpen, setIsDialogOpen] = useState(false);
 const [messageType, setMessageType] = useState<string>("genel");
 const [messageContent, setMessageContent] = useState<string>("");
 const [meetingPurpose, setMeetingPurpose] = useState<string>("");
 const [achievement, setAchievement] = useState<string>("");
 const [concernArea, setConcernArea] = useState<string>("");
 const [concernDetails, setConcernDetails] = useState<string>("");

 const { data: students } = useQuery({
 queryKey: ["students"],
 queryFn: async () => {
 const response = await apiClient.get<{ data: any[] }>('/api/students');
 return response.data;
 },
 });

 const { data: tokens } = useQuery({
 queryKey: ["parent-access-tokens", selectedStudentId],
 queryFn: async () => {
 if (!selectedStudentId) return [];
 return await notificationsApi.getParentAccessTokens(Number(selectedStudentId));
 },
 enabled: !!selectedStudentId,
 });

 const generateMutation = useMutation({
 mutationFn: (data: { studentId: number; expiresInDays: number }) =>
 notificationsApi.generateParentAccess(data.studentId, data.expiresInDays),
 onSuccess: (result) => {
 toast.success("Veli erişim linki oluşturuldu");
 queryClient.invalidateQueries({ queryKey: ["parent-access-tokens"] });
 setIsDialogOpen(false);
 
 if (navigator.clipboard) {
 navigator.clipboard.writeText(result.link);
 toast.info("Link panoya kopyalandı");
 }
 },
 });

 const revokeMutation = useMutation({
 mutationFn: (tokenId: number) => notificationsApi.revokeParentAccess(tokenId),
 onSuccess: () => {
 toast.success("Erişim iptal edildi");
 queryClient.invalidateQueries({ queryKey: ["parent-access-tokens"] });
 },
 });

 const developmentReportMutation = useMutation({
 mutationFn: (studentId: string) => 
 apiClient.post(PARENT_COMMUNICATION_ENDPOINTS.DEVELOPMENT_REPORT(studentId)),
 onSuccess: (data) => {
 toast.success("Gelişim raporu oluşturuldu");
 console.log("Development report:", data);
 },
 });

 const parentMessageMutation = useMutation({
 mutationFn: (data: { studentId: string; messageType: string; specificContent?: string }) =>
 apiClient.post(PARENT_COMMUNICATION_ENDPOINTS.MESSAGE(data.studentId), {
 messageType: data.messageType,
 specificContent: data.specificContent,
 }),
 onSuccess: (data) => {
 toast.success("Veli mesajı oluşturuldu");
 setMessageContent("");
 console.log("Parent message:", data);
 },
 });

 const meetingInvitationMutation = useMutation({
 mutationFn: (data: { studentId: string; meetingPurpose: string; suggestedDates?: string[] }) =>
 apiClient.post(PARENT_COMMUNICATION_ENDPOINTS.MEETING_INVITATION(data.studentId), data),
 onSuccess: (data) => {
 toast.success("Toplantı daveti oluşturuldu");
 setMeetingPurpose("");
 console.log("Meeting invitation:", data);
 },
 });

 const achievementMutation = useMutation({
 mutationFn: (data: { studentId: string; achievement: string }) =>
 apiClient.post(PARENT_COMMUNICATION_ENDPOINTS.ACHIEVEMENT(data.studentId), data),
 onSuccess: (data) => {
 toast.success("Başarı bildirimi oluşturuldu");
 setAchievement("");
 console.log("Achievement message:", data);
 },
 });

 const concernMutation = useMutation({
 mutationFn: (data: { studentId: string; concernArea: string; details: string }) =>
 apiClient.post(PARENT_COMMUNICATION_ENDPOINTS.CONCERN(data.studentId), data),
 onSuccess: (data) => {
 toast.success("Endişe bildirimi oluşturuldu");
 setConcernArea("");
 setConcernDetails("");
 console.log("Concern message:", data);
 },
 });

 const handleGenerate = () => {
 if (!selectedStudentId) {
 toast.error("Lütfen bir öğrenci seçin");
 return;
 }
 generateMutation.mutate({
 studentId: Number(selectedStudentId),
 expiresInDays: expiryDays,
 });
 };

 const copyToClipboard = (link: string) => {
 if (navigator.clipboard) {
 navigator.clipboard.writeText(link);
 toast.success("Link panoya kopyalandı");
 } else {
 toast.error("Tarayıcınız kopyalamayı desteklemiyor");
 }
 };

 const getExpiryStatus = (expiresAt: string) => {
 const expiryDate = new Date(expiresAt);
 const now = new Date();
 
 if (expiryDate < now) {
 return <Badge variant="destructive">Süresi Doldu</Badge>;
 }
 
 const daysLeft = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
 
 if (daysLeft < 7) {
 return <Badge variant="outline" className="text-orange-600">
 {daysLeft} gün kaldı
 </Badge>;
 }
 
 return <Badge variant="secondary">{daysLeft} gün kaldı</Badge>;
 };

 return (
 <div className="w-full max-w-7xl mx-auto p-6 space-y-6 page-transition">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold">Veli İletişimi</h1>
 <p className="text-muted-foreground mt-2">
 Veli dashboard erişimi ve AI destekli iletişim araçları
 </p>
 </div>

 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
 <DialogTrigger asChild>
 <Button>
 <Link2 className="h-4 w-4 mr-2" />
 Yeni Erişim Oluştur
 </Button>
 </DialogTrigger>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Veli Erişim Linki Oluştur</DialogTitle>
 <DialogDescription>
 Velilerin çocuklarının ilerleme raporlarını görüntüleyebileceği
 güvenli bir link oluşturun
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-4 pt-4">
 <div className="space-y-2">
 <Label htmlFor="student">Öğrenci</Label>
 <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
 <SelectTrigger id="student">
 <SelectValue placeholder="Öğrenci seçin" />
 </SelectTrigger>
 <SelectContent>
 {students?.map((student: any) => (
 <SelectItem key={student.id} value={student.id.toString()}>
 {student.name} {student.surname} - {student.class}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label htmlFor="expiry">Geçerlilik Süresi (Gün)</Label>
 <Input
 id="expiry"
 type="number"
 value={expiryDays}
 onChange={(e) => setExpiryDays(Number(e.target.value))}
 min={1}
 max={365}
 />
 <p className="text-xs text-muted-foreground">
 1-365 gün arası bir süre belirleyin
 </p>
 </div>

 <Button
 onClick={handleGenerate}
 disabled={generateMutation.isPending || !selectedStudentId}
 className="w-full"
 >
 Link Oluştur ve Kopyala
 </Button>
 </div>
 </DialogContent>
 </Dialog>
 </div>

 <Tabs defaultValue="access" className="space-y-6">
 <TabsList variant="minimal" className="w-full justify-start sm:justify-center">
 <TabsTrigger value="access" variant="minimal">
 <Link2 className="h-4 w-4" />
 <span className="hidden sm:inline">Dashboard Erişimi</span>
 </TabsTrigger>
 <TabsTrigger value="communication" variant="minimal">
 <MessageSquare className="h-4 w-4" />
 <span className="hidden sm:inline">AI İletişim Araçları</span>
 </TabsTrigger>
 <TabsTrigger value="reports" variant="minimal">
 <FileText className="h-4 w-4" />
 <span className="hidden sm:inline">Gelişim Raporları</span>
 </TabsTrigger>
 </TabsList>

 <TabsContent value="access" className="space-y-6">
 <Card>
 <CardHeader>
 <CardTitle>Öğrenci Seçin</CardTitle>
 <CardDescription>
 Erişim linklerini görüntülemek için bir öğrenci seçin
 </CardDescription>
 </CardHeader>
 <CardContent>
 <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
 <SelectTrigger>
 <SelectValue placeholder="Öğrenci seçin" />
 </SelectTrigger>
 <SelectContent>
 {students?.map((student: any) => (
 <SelectItem key={student.id} value={student.id.toString()}>
 {student.name} {student.surname} - {student.class}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </CardContent>
 </Card>

 {selectedStudentId && (
 <Card>
 <CardHeader>
 <CardTitle>Aktif Erişim Linkleri</CardTitle>
 <CardDescription>
 Bu öğrenci için oluşturulmuş veli erişim linkleri
 </CardDescription>
 </CardHeader>
 <CardContent>
 {!tokens || tokens.length === 0 ? (
 <div className="text-center py-8 text-muted-foreground">
 Henüz erişim linki oluşturulmamış
 </div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Token</TableHead>
 <TableHead>Durum</TableHead>
 <TableHead>Erişim Sayısı</TableHead>
 <TableHead>Oluşturulma</TableHead>
 <TableHead>Son Erişim</TableHead>
 <TableHead className="text-right">İşlemler</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {tokens.map((token: any) => {
 const link = `${window.location.origin}/veli-dashboard/${token.token}`;
 return (
 <TableRow key={token.id}>
 <TableCell className="font-mono text-xs">
 {token.token.substring(0, 16)}...
 </TableCell>
 <TableCell>
 {getExpiryStatus(token.expires_at)}
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-2">
 <Eye className="h-4 w-4 text-muted-foreground" />
 {token.access_count || 0}
 </div>
 </TableCell>
 <TableCell className="text-sm text-muted-foreground">
 {formatDistanceToNow(new Date(token.created_at), {
 addSuffix: true,
 locale: tr,
 })}
 </TableCell>
 <TableCell className="text-sm text-muted-foreground">
 {token.last_accessed_at
 ? formatDistanceToNow(new Date(token.last_accessed_at), {
 addSuffix: true,
 locale: tr,
 })
 :"Henüz erişilmedi"}
 </TableCell>
 <TableCell className="text-right">
 <div className="flex items-center justify-end gap-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => copyToClipboard(link)}
 >
 <Copy className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => revokeMutation.mutate(token.id)}
 disabled={revokeMutation.isPending}
 >
 <Trash2 className="h-4 w-4 text-destructive" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 );
 })}
 </TableBody>
 </Table>
 )}
 </CardContent>
 </Card>
 )}

 <Card className="border-blue-200 bg-blue-50/50">
 <CardHeader>
 <CardTitle className="text-blue-900">Nasıl Çalışır?</CardTitle>
 </CardHeader>
 <CardContent className="text-sm text-blue-800 space-y-2">
 <p>
 <strong>1. Link Oluşturma:</strong> Öğrenci seçip geçerlilik süresi belirleyin.
 Link otomatik oluşturulur ve panoya kopyalanır.
 </p>
 <p>
 <strong>2. Veli ile Paylaşma:</strong> Linki veliye e-posta, SMS veya WhatsApp
 ile gönderin.
 </p>
 <p>
 <strong>3. Güvenli Erişim:</strong> Veli, link ile çocuğunun ilerleme raporlarını,
 risk değerlendirmelerini ve müdahale planlarını görüntüleyebilir.
 </p>
 <p>
 <strong>4. İptal:</strong> İstediğiniz zaman erişimi iptal edebilirsiniz.
 </p>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="communication" className="space-y-6">
 <Card>
 <CardHeader>
 <CardTitle>Öğrenci Seçin</CardTitle>
 <CardDescription>
 İletişim oluşturmak için bir öğrenci seçin
 </CardDescription>
 </CardHeader>
 <CardContent>
 <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
 <SelectTrigger>
 <SelectValue placeholder="Öğrenci seçin" />
 </SelectTrigger>
 <SelectContent>
 {students?.map((student: any) => (
 <SelectItem key={student.id} value={student.id.toString()}>
 {student.name} {student.surname} - {student.class}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </CardContent>
 </Card>

 {selectedStudentId && (
 <div className="grid gap-6 md:grid-cols-2">
 <Card className="card-lift">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Mail className="h-5 w-5 text-primary" />
 Genel Mesaj
 </CardTitle>
 <CardDescription>
 Veliye AI destekli özelleştirilmiş mesaj gönderin
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
 <SelectItem value="genel">Genel Bilgilendirme</SelectItem>
 <SelectItem value="akademik">Akademik İlerleme</SelectItem>
 <SelectItem value="davranış">Davranış Güncellemesi</SelectItem>
 <SelectItem value="sosyal">Sosyal-Duygusal</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <Label>Ek Detaylar (İsteğe Bağlı)</Label>
 <Textarea
 value={messageContent}
 onChange={(e) => setMessageContent(e.target.value)}
 placeholder="Mesaja eklemek istediğiniz özel notlar..."
 rows={3}
 />
 </div>
 <Button
 onClick={() =>
 parentMessageMutation.mutate({
 studentId: selectedStudentId,
 messageType,
 specificContent: messageContent || undefined,
 })
 }
 disabled={parentMessageMutation.isPending}
 className="w-full btn-ripple haptic-feedback"
 >
 Mesaj Oluştur
 </Button>
 </CardContent>
 </Card>

 <Card className="card-lift">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Calendar className="h-5 w-5 text-primary" />
 Toplantı Daveti
 </CardTitle>
 <CardDescription>
 Veli toplantısı için AI destekli davet oluşturun
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <Label>Toplantı Amacı</Label>
 <Textarea
 value={meetingPurpose}
 onChange={(e) => setMeetingPurpose(e.target.value)}
 placeholder="Toplantının amacını kısaca açıklayın..."
 rows={3}
 />
 </div>
 <Button
 onClick={() =>
 meetingInvitationMutation.mutate({
 studentId: selectedStudentId,
 meetingPurpose,
 })
 }
 disabled={meetingInvitationMutation.isPending || !meetingPurpose}
 className="w-full btn-ripple haptic-feedback"
 >
 Davet Oluştur
 </Button>
 </CardContent>
 </Card>

 <Card className="card-lift">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Award className="h-5 w-5 text-green-600" />
 Başarı Bildirimi
 </CardTitle>
 <CardDescription>
 Öğrencinin başarısını veliye bildirin
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <Label>Başarı Detayı</Label>
 <Textarea
 value={achievement}
 onChange={(e) => setAchievement(e.target.value)}
 placeholder="Öğrencinin başarısını açıklayın..."
 rows={3}
 />
 </div>
 <Button
 onClick={() =>
 achievementMutation.mutate({
 studentId: selectedStudentId,
 achievement,
 })
 }
 disabled={achievementMutation.isPending || !achievement}
 className="w-full btn-ripple haptic-feedback"
 >
 Bildiri Oluştur
 </Button>
 </CardContent>
 </Card>

 <Card className="card-lift">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <AlertCircle className="h-5 w-5 text-orange-600" />
 Endişe Bildirimi
 </CardTitle>
 <CardDescription>
 Veliye dikkat edilmesi gereken konular hakkında bilgi verin
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <Label>Endişe Alanı</Label>
 <Select value={concernArea} onValueChange={setConcernArea}>
 <SelectTrigger>
 <SelectValue placeholder="Alan seçin" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="akademik">Akademik Performans</SelectItem>
 <SelectItem value="davranış">Davranış</SelectItem>
 <SelectItem value="sosyal">Sosyal İlişkiler</SelectItem>
 <SelectItem value="duygusal">Duygusal Durum</SelectItem>
 <SelectItem value="devamsızlık">Devamsızlık</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <Label>Detaylar</Label>
 <Textarea
 value={concernDetails}
 onChange={(e) => setConcernDetails(e.target.value)}
 placeholder="Endişenizi detaylandırın..."
 rows={3}
 />
 </div>
 <Button
 onClick={() =>
 concernMutation.mutate({
 studentId: selectedStudentId,
 concernArea,
 details: concernDetails,
 })
 }
 disabled={concernMutation.isPending || !concernArea || !concernDetails}
 className="w-full btn-ripple haptic-feedback"
 >
 Bildiri Oluştur
 </Button>
 </CardContent>
 </Card>
 </div>
 )}
 </TabsContent>

 <TabsContent value="reports" className="space-y-6">
 <Card>
 <CardHeader>
 <CardTitle>Öğrenci Seçin</CardTitle>
 <CardDescription>
 Gelişim raporu oluşturmak için bir öğrenci seçin
 </CardDescription>
 </CardHeader>
 <CardContent>
 <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
 <SelectTrigger>
 <SelectValue placeholder="Öğrenci seçin" />
 </SelectTrigger>
 <SelectContent>
 {students?.map((student: any) => (
 <SelectItem key={student.id} value={student.id.toString()}>
 {student.name} {student.surname} - {student.class}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </CardContent>
 </Card>

 {selectedStudentId && (
 <Card className="card-lift">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <FileText className="h-5 w-5 text-primary" />
 AI Destekli Gelişim Raporu
 </CardTitle>
 <CardDescription>
 Öğrencinin tüm verilerini analiz eden kapsamlı gelişim raporu
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="bg-muted/50 rounded-lg p-4 space-y-2">
 <h4 className="font-semibold">Rapor İçeriği:</h4>
 <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
 <li>Akademik performans analizi</li>
 <li>Sosyal ve duygusal gelişim</li>
 <li>Davranış değerlendirmesi</li>
 <li>Güçlü yönler ve gelişim alanları</li>
 <li>Öneriler ve eylem planı</li>
 </ul>
 </div>
 <Button
 onClick={() => developmentReportMutation.mutate(selectedStudentId)}
 disabled={developmentReportMutation.isPending}
 className="w-full btn-ripple haptic-feedback"
 >
 {developmentReportMutation.isPending ?"Oluşturuluyor..." :"Gelişim Raporu Oluştur"}
 </Button>
 </CardContent>
 </Card>
 )}
 </TabsContent>
 </Tabs>

 <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
 <CardHeader>
 <CardTitle className="text-blue-900 dark:text-blue-100">Nasıl Kullanılır?</CardTitle>
 </CardHeader>
 <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-3">
 <div>
 <strong>Dashboard Erişimi:</strong> Velilere güvenli, zamanlı erişim linkleri oluşturun.
 Linkler otomatik expire olur ve erişim logları tutulur.
 </div>
 <div>
 <strong>AI İletişim Araçları:</strong> Öğrenci verilerine dayalı, profesyonel ve
 özelleştirilmiş veli mesajları otomatik oluşturun. AI, öğrencinin durumunu analiz
 ederek en uygun dil ve tonu seçer.
 </div>
 <div>
 <strong>Gelişim Raporları:</strong> Kapsamlı, AI destekli gelişim raporları ile
 velilere düzenli geri bildirim sağlayın. Raporlar tüm akademik, sosyal ve duygusal
 verileri analiz eder.
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
