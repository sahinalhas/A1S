import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { useToast } from '@/hooks/utils/toast.utils';
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/organisms/Table';
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
 AlertDialogTrigger,
} from '@/components/organisms/AlertDialog';
import {
 Database,
 Download,
 Trash2,
 Shield,
 FileText,
 Clock,
 CheckCircle,
 XCircle,
 AlertTriangle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { apiClient } from '@/lib/api/core/client';
import { BACKUP_ENDPOINTS } from '@/lib/constants/api-endpoints';

interface BackupMetadata {
 id: string;
 filename: string;
 createdAt: string;
 createdBy: string;
 size: number;
 type: 'manual' | 'automatic';
 compressed: boolean;
 tables: string[];
 status: 'pending' | 'completed' | 'failed';
 error?: string;
}

export default function BackupManagement() {
 const { user } = useAuth();
 const { toast } = useToast();
 const queryClient = useQueryClient();
 const [creatingBackup, setCreatingBackup] = useState(false);
 
 const { data: backups = [], isLoading } = useQuery({
 queryKey: ['backups'],
 queryFn: async () => {
 return await apiClient.get<BackupMetadata[]>(BACKUP_ENDPOINTS.LIST);
 },
 });
 
 const createBackupMutation = useMutation({
 mutationFn: async () => {
 return await apiClient.post(BACKUP_ENDPOINTS.CREATE, {
 userId: user?.id,
 userName: user?.name,
 type: 'manual',
 options: { compress: true },
 });
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['backups'] });
 toast({
 title: 'Yedekleme Başarılı',
 description: 'Veritabanı yedeklemesi oluşturuldu',
 });
 setCreatingBackup(false);
 },
 onError: (error: Error) => {
 toast({
 title: 'Hata',
 description: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Yedekleme oluşturulamadı',
 variant: 'destructive',
 });
 setCreatingBackup(false);
 },
 });
 
 const restoreBackupMutation = useMutation({
 mutationFn: async (backupId: string) => {
 return await apiClient.post(BACKUP_ENDPOINTS.RESTORE(backupId), {
 userId: user?.id,
 userName: user?.name,
 });
 },
 onSuccess: () => {
 toast({
 title: 'Geri Yükleme Başarılı',
 description: 'Veritabanı geri yüklendi',
 });
 },
 onError: (error: Error) => {
 toast({
 title: 'Hata',
 description: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Geri yükleme başarısız',
 variant: 'destructive',
 });
 },
 });
 
 const deleteBackupMutation = useMutation({
 mutationFn: async (backupId: string) => {
 return await apiClient.delete(BACKUP_ENDPOINTS.DELETE(backupId));
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['backups'] });
 toast({
 title: 'Silme Başarılı',
 description: 'Yedek dosyası silindi',
 });
 },
 onError: (error: Error) => {
 toast({
 title: 'Hata',
 description: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Yedek dosyası silinemedi',
 variant: 'destructive',
 });
 },
 });
 
 const handleCreateBackup = () => {
 setCreatingBackup(true);
 createBackupMutation.mutate();
 };
 
 const formatFileSize = (bytes: number) => {
 if (bytes === 0) return '0 Bytes';
 const k = 1024;
 const sizes = ['Bytes', 'KB', 'MB', 'GB'];
 const i = Math.floor(Math.log(bytes) / Math.log(k));
 return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
 };
 
 return (
 <div className="w-full max-w-7xl mx-auto py-6 space-y-6">
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-3xl font-bold">Yedekleme ve Güvenlik</h1>
 <p className="text-muted-foreground">Veritabanı yedeklemeleri ve KVKK uyumluluk araçları</p>
 </div>
 <Button onClick={handleCreateBackup} disabled={creatingBackup} className="gap-2">
 <Database className="h-4 w-4" />
 {creatingBackup ? 'Oluşturuluyor...' : 'Yeni Yedek Oluştur'}
 </Button>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Toplam Yedek</CardTitle>
 <Database className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{backups.length}</div>
 <p className="text-xs text-muted-foreground">
 Son: {backups[0] ? formatDistanceToNow(new Date(backups[0].createdAt), { addSuffix: true, locale: tr }) : '-'}
 </p>
 </CardContent>
 </Card>
 
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Başarılı</CardTitle>
 <CheckCircle className="h-4 w-4 text-green-600" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold text-green-600">
 {backups.filter(b => b.status === 'completed').length}
 </div>
 <p className="text-xs text-muted-foreground">
 Tamamlanan yedeklemeler
 </p>
 </CardContent>
 </Card>
 
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Toplam Boyut</CardTitle>
 <FileText className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">
 {formatFileSize(backups.reduce((sum, b) => sum + b.size, 0))}
 </div>
 <p className="text-xs text-muted-foreground">
 Disk kullanımı
 </p>
 </CardContent>
 </Card>
 </div>
 
 <Card>
 <CardHeader>
 <CardTitle>Yedek Geçmişi</CardTitle>
 <CardDescription>Tüm veritabanı yedeklemeleriniz</CardDescription>
 </CardHeader>
 <CardContent>
 {isLoading ? (
 <div className="flex justify-center p-8">
 <div className=" h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
 </div>
 ) : backups.length === 0 ? (
 <div className="text-center p-8 text-muted-foreground">
 <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
 <p>Henüz yedekleme yapılmamış</p>
 </div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Tarih</TableHead>
 <TableHead>Dosya Adı</TableHead>
 <TableHead>Tip</TableHead>
 <TableHead>Boyut</TableHead>
 <TableHead>Durum</TableHead>
 <TableHead>İşlemler</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {backups.map((backup) => (
 <TableRow key={backup.id}>
 <TableCell>
 <div className="flex items-center gap-2">
 <Clock className="h-4 w-4 text-muted-foreground" />
 <span className="text-sm">
 {formatDistanceToNow(new Date(backup.createdAt), { addSuffix: true, locale: tr })}
 </span>
 </div>
 </TableCell>
 <TableCell className="font-mono text-xs">{backup.filename}</TableCell>
 <TableCell>
 <Badge variant={backup.type === 'manual' ? 'default' : 'secondary'}>
 {backup.type === 'manual' ? 'Manuel' : 'Otomatik'}
 </Badge>
 </TableCell>
 <TableCell>{formatFileSize(backup.size)}</TableCell>
 <TableCell>
 {backup.status === 'completed' && (
 <Badge variant="outline" className="gap-1 text-green-600">
 <CheckCircle className="h-3 w-3" />
 Tamamlandı
 </Badge>
 )}
 {backup.status === 'failed' && (
 <Badge variant="destructive" className="gap-1">
 <XCircle className="h-3 w-3" />
 Başarısız
 </Badge>
 )}
 {backup.status === 'pending' && (
 <Badge variant="secondary" className="gap-1">
 <AlertTriangle className="h-3 w-3" />
 Bekliyor
 </Badge>
 )}
 </TableCell>
 <TableCell>
 <div className="flex gap-2">
 <AlertDialog>
 <AlertDialogTrigger asChild>
 <Button variant="outline" size="sm" className="gap-1">
 <Download className="h-3 w-3" />
 Geri Yükle
 </Button>
 </AlertDialogTrigger>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Geri Yükleme Onayı</AlertDialogTitle>
 <AlertDialogDescription>
 Bu işlem mevcut veritabanını yedekteki verilerle değiştirecek. 
 Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>İptal</AlertDialogCancel>
 <AlertDialogAction onClick={() => restoreBackupMutation.mutate(backup.id)}>
 Geri Yükle
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 
 <AlertDialog>
 <AlertDialogTrigger asChild>
 <Button variant="outline" size="sm" className="gap-1 text-destructive">
 <Trash2 className="h-3 w-3" />
 Sil
 </Button>
 </AlertDialogTrigger>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Silme Onayı</AlertDialogTitle>
 <AlertDialogDescription>
 Bu yedek dosyası kalıcı olarak silinecek. Bu işlem geri alınamaz.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>İptal</AlertDialogCancel>
 <AlertDialogAction 
 onClick={() => deleteBackupMutation.mutate(backup.id)}
 className="bg-destructive text-destructive-foreground"
 >
 Sil
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </CardContent>
 </Card>
 
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Shield className="h-5 w-5" />
 KVKK Uyumluluk
 </CardTitle>
 <CardDescription>Veri güvenliği ve kişisel verilerin korunması</CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
 <div>
 <p className="font-medium">Veri Şifreleme</p>
 <p className="text-sm text-muted-foreground">Hassas veriler AES-256 ile şifrelenir</p>
 </div>
 <Badge variant="outline" className="text-green-600">Aktif</Badge>
 </div>
 
 <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
 <div>
 <p className="font-medium">Erişim Logları</p>
 <p className="text-sm text-muted-foreground">Tüm veri erişimleri kaydedilir</p>
 </div>
 <Badge variant="outline" className="text-green-600">Aktif</Badge>
 </div>
 
 <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
 <div>
 <p className="font-medium">Veri Maskeleme</p>
 <p className="text-sm text-muted-foreground">Kişisel veriler raporlarda maskelenir</p>
 </div>
 <Badge variant="outline" className="text-green-600">Aktif</Badge>
 </div>
 
 <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
 <div>
 <p className="font-medium">Otomatik Yedekleme</p>
 <p className="text-sm text-muted-foreground">Günlük otomatik yedekleme</p>
 </div>
 <Badge variant="outline" className="text-blue-600">Yapılandırılmış</Badge>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
