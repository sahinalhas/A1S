import { useState } from 'react';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { UseFormReturn } from 'react-hook-form';
import { AppSettings } from '@/lib/app-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Label } from '@/components/atoms/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
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
 Clock,
 CheckCircle,
 XCircle,
 AlertTriangle,
 RefreshCw,
 Upload,
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

interface BackupSettingsTabProps {
 form?: UseFormReturn<AppSettings>;
}

export default function BackupSettingsTab({ form }: BackupSettingsTabProps) {
 const { user } = useAuth();
 const { toast } = useToast();
 const queryClient = useQueryClient();
 const [creatingBackup, setCreatingBackup] = useState(false);
 const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
 const [selectedFile, setSelectedFile] = useState<File | null>(null);
 const [uploading, setUploading] = useState(false);
 
 const { data: backups = [], isLoading, refetch } = useQuery({
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
 description: error.message || 'Yedekleme oluşturulamadı',
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
 description: 'Veritabanı geri yüklendi. Sayfa yenileniyor...',
 });
 setTimeout(() => window.location.reload(), 2000);
 },
 onError: (error: Error) => {
 toast({
 title: 'Hata',
 description: error.message || 'Geri yükleme başarısız',
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
 description: error.message || 'Yedek dosyası silinemedi',
 variant: 'destructive',
 });
 },
 });
 
 const handleCreateBackup = () => {
 setCreatingBackup(true);
 createBackupMutation.mutate();
 };
 
 const handleDownloadBackup = async (backupId: string, filename: string) => {
 try {
 if (!user?.id) {
 throw new Error('Kullanıcı oturumu bulunamadı');
 }

 const response = await fetch(BACKUP_ENDPOINTS.DOWNLOAD(backupId), {
 method: 'GET',
 credentials: 'include',
 headers: {
 'x-user-id': user.id,
 },
 });
 
 if (!response.ok) {
 throw new Error('İndirme başarısız');
 }
 
 const blob = await response.blob();
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = filename;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 window.URL.revokeObjectURL(url);
 
 toast({
 title: 'İndirme Başarılı',
 description: 'Yedek dosyası indirildi',
 });
 } catch (error) {
 toast({
 title: 'Hata',
 description: error instanceof Error ? error.message : 'İndirme başarısız',
 variant: 'destructive',
 });
 }
 };
 
 const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
 const file = event.target.files?.[0];
 if (file) {
 if (file.name.endsWith('.sql') || file.name.endsWith('.sql.gz')) {
 setSelectedFile(file);
 } else {
 toast({
 title: 'Hata',
 description: 'Sadece .sql veya .sql.gz dosyaları yüklenebilir',
 variant: 'destructive',
 });
 event.target.value = '';
 }
 }
 };
 
 const handleUploadRestore = async () => {
 if (!selectedFile || !user?.id) {
 toast({
 title: 'Hata',
 description: 'Dosya seçilmedi veya kullanıcı oturumu bulunamadı',
 variant: 'destructive',
 });
 return;
 }
 
 setUploading(true);
 
 try {
 const formData = new FormData();
 formData.append('backup', selectedFile);
 
 const response = await fetch(BACKUP_ENDPOINTS.UPLOAD_RESTORE, {
 method: 'POST',
 credentials: 'include',
 headers: {
 'x-user-id': user.id,
 },
 body: formData,
 });
 
 if (!response.ok) {
 const errorData = await response.json();
 throw new Error(errorData.error || 'Yükleme başarısız');
 }
 
 toast({
 title: 'Geri Yükleme Başarılı',
 description: 'Yedek dosyası yüklendi ve veritabanı geri yüklendi. Sayfa yenileniyor...',
 });
 
 setUploadDialogOpen(false);
 setSelectedFile(null);
 
 setTimeout(() => window.location.reload(), 2000);
 } catch (error) {
 toast({
 title: 'Hata',
 description: error instanceof Error ? error.message : 'Dosya yükleme başarısız',
 variant: 'destructive',
 });
 } finally {
 setUploading(false);
 }
 };
 
 const formatFileSize = (bytes: number) => {
 if (bytes === 0) return '0 Bytes';
 const k = 1024;
 const sizes = ['Bytes', 'KB', 'MB', 'GB'];
 const i = Math.floor(Math.log(bytes) / Math.log(k));
 return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
 };

 const latestBackups = backups.slice(0, 5);
 
 return (
 <div className="space-y-6">
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle>Manuel Veritabanı Yedekleme</CardTitle>
 <CardDescription>
 Veritabanınızı manuel olarak yedekleyin ve gerektiğinde geri yükleyin
 </CardDescription>
 </div>
 <div className="flex gap-2">
 <Button
 variant="outline"
 size="sm"
 onClick={() => refetch()}
 disabled={isLoading}
 className="gap-2"
 >
 <RefreshCw className="h-4 w-4" />
 Yenile
 </Button>
 <Button
 variant="outline"
 onClick={() => setUploadDialogOpen(true)}
 className="gap-2"
 >
 <Upload className="h-4 w-4" />
 Dosya Yükle
 </Button>
 <Button
 onClick={handleCreateBackup}
 disabled={creatingBackup}
 className="gap-2"
 >
 <Database className="h-4 w-4" />
 {creatingBackup ? 'Oluşturuluyor...' : 'Yeni Yedek Oluştur'}
 </Button>
 </div>
 </div>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
 <div className="p-4 bg-muted rounded-lg">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Database className="h-5 w-5 text-muted-foreground" />
 <span className="text-sm font-medium">Toplam Yedek</span>
 </div>
 <span className="text-2xl font-bold">{backups.length}</span>
 </div>
 <p className="text-xs text-muted-foreground mt-2">
 Son: {backups[0] ? formatDistanceToNow(new Date(backups[0].createdAt), { addSuffix: true, locale: tr }) : '-'}
 </p>
 </div>
 
 <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <CheckCircle className="h-5 w-5 text-green-600" />
 <span className="text-sm font-medium">Başarılı</span>
 </div>
 <span className="text-2xl font-bold text-green-600">
 {backups.filter(b => b.status === 'completed').length}
 </span>
 </div>
 <p className="text-xs text-muted-foreground mt-2">
 Tamamlanan yedeklemeler
 </p>
 </div>
 
 <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Database className="h-5 w-5 text-blue-600" />
 <span className="text-sm font-medium">Toplam Boyut</span>
 </div>
 <span className="text-2xl font-bold text-blue-600">
 {formatFileSize(backups.reduce((sum, b) => sum + b.size, 0))}
 </span>
 </div>
 <p className="text-xs text-muted-foreground mt-2">
 Disk kullanımı
 </p>
 </div>
 </div>

 {isLoading ? (
 <div className="flex justify-center p-8">
 <div className=" h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
 </div>
 ) : backups.length === 0 ? (
 <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
 <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
 <p className="font-medium">Henüz yedekleme yapılmamış</p>
 <p className="text-sm mt-2">Veritabanınızın yedeğini almak için yukarıdaki butonu kullanın</p>
 </div>
 ) : (
 <>
 <h3 className="text-sm font-semibold mb-3">Son 5 Yedekleme</h3>
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Tarih</TableHead>
 <TableHead>Dosya</TableHead>
 <TableHead>Tip</TableHead>
 <TableHead>Boyut</TableHead>
 <TableHead>Durum</TableHead>
 <TableHead>İşlemler</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {latestBackups.map((backup) => (
 <TableRow key={backup.id}>
 <TableCell>
 <div className="flex items-center gap-2">
 <Clock className="h-4 w-4 text-muted-foreground" />
 <span className="text-sm">
 {formatDistanceToNow(new Date(backup.createdAt), { addSuffix: true, locale: tr })}
 </span>
 </div>
 </TableCell>
 <TableCell className="font-mono text-xs max-w-[200px] truncate">
 {backup.filename}
 </TableCell>
 <TableCell>
 <Badge variant={backup.type === 'manual' ? 'default' : 'secondary'}>
 {backup.type === 'manual' ? 'Manuel' : 'Otomatik'}
 </Badge>
 </TableCell>
 <TableCell className="text-sm">{formatFileSize(backup.size)}</TableCell>
 <TableCell>
 {backup.status === 'completed' && (
 <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
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
 <Button
 variant="outline"
 size="sm"
 className="gap-1"
 disabled={backup.status !== 'completed'}
 onClick={() => handleDownloadBackup(backup.id, backup.filename)}
 >
 <Download className="h-3 w-3" />
 İndir
 </Button>
 
 <AlertDialog>
 <AlertDialogTrigger asChild>
 <Button
 variant="outline"
 size="sm"
 className="gap-1"
 disabled={backup.status !== 'completed'}
 >
 <RefreshCw className="h-3 w-3" />
 Geri Yükle
 </Button>
 </AlertDialogTrigger>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Geri Yükleme Onayı</AlertDialogTitle>
 <AlertDialogDescription className="space-y-2">
 <p className="font-semibold text-destructive">
 DİKKAT: Bu işlem mevcut veritabanını tamamen silip yerine yedekteki verileri yükleyecektir!
 </p>
 <p>
 Bu işlem geri alınamaz. Devam etmeden önce lütfen mevcut veritabanınızın yedeğini alın.
 </p>
 <p className="text-sm text-muted-foreground">
 Yedek: <span className="font-mono">{backup.filename}</span>
 </p>
 <p className="text-sm text-muted-foreground">
 Tarih: {new Date(backup.createdAt).toLocaleString('tr-TR')}
 </p>
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>İptal</AlertDialogCancel>
 <AlertDialogAction
 onClick={() => restoreBackupMutation.mutate(backup.id)}
 className="bg-destructive text-destructive-foreground"
 >
 Evet, Geri Yükle
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 
 <AlertDialog>
 <AlertDialogTrigger asChild>
 <Button variant="ghost" size="sm" className="gap-1 text-destructive">
 <Trash2 className="h-3 w-3" />
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
 
 {backups.length > 5 && (
 <p className="text-sm text-muted-foreground mt-4 text-center">
 Tüm yedekleri görmek için <a href="/backup-management" className="text-primary">Yedekleme Yönetimi</a> sayfasını ziyaret edin.
 </p>
 )}
 </>
 )}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle>Önemli Bilgiler</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
 <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
 <div className="text-sm">
 <p className="font-medium text-blue-900 dark:text-blue-100">Yedekleme Hakkında</p>
 <p className="text-blue-800 dark:text-blue-200 mt-1">
 Yedeklemeler veritabanınızın tam bir kopyasını içerir ve sıkıştırılmış olarak saklanır. 
 Maksimum 30 yedek dosyası tutulur, en eskiler otomatik olarak silinir.
 </p>
 </div>
 </div>
 
 <div className="flex gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
 <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
 <div className="text-sm">
 <p className="font-medium text-yellow-900 dark:text-yellow-100">Geri Yükleme Uyarısı</p>
 <p className="text-yellow-800 dark:text-yellow-200 mt-1">
 Geri yükleme işlemi mevcut tüm verileri siler ve yerine yedekteki verileri yükler. 
 Bu işlem geri alınamaz, bu yüzden dikkatli olun!
 </p>
 </div>
 </div>
 
 <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
 <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
 <div className="text-sm">
 <p className="font-medium text-green-900 dark:text-green-100">Güvenlik</p>
 <p className="text-green-800 dark:text-green-200 mt-1">
 Tüm yedeklemeler güvenli bir şekilde saklanır ve sadece yetkili kullanıcılar tarafından erişilebilir. 
 Hassas veriler anonim hale getirilebilir.
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 
 <AlertDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>📤 Yedek Dosyası Yükle ve Geri Yükle</AlertDialogTitle>
 <AlertDialogDescription className="space-y-3">
 <p className="font-semibold text-destructive">
 DİKKAT: Bu işlem mevcut veritabanını tamamen silip yerine yüklediğiniz dosyadaki verileri yükleyecektir!
 </p>
 <p>
 Bilgisayarınızdan bir .sql veya .sql.gz yedek dosyası seçin ve veritabanına geri yükleyin.
 </p>
 <p className="text-sm">
 Bu işlem geri alınamaz. Devam etmeden önce lütfen mevcut veritabanınızın yedeğini aldığınızdan emin olun.
 </p>
 
 <div className="mt-4 p-4 border-2 border-dashed rounded-lg">
 <input
 type="file"
 accept=".sql,.sql.gz"
 onChange={handleFileSelect}
 className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:cursor-pointer"
 disabled={uploading}
 />
 {selectedFile && (
 <div className="mt-3 p-2 bg-muted rounded text-sm">
 <p className="font-medium">Seçilen dosya:</p>
 <p className="text-muted-foreground truncate">{selectedFile.name}</p>
 <p className="text-xs text-muted-foreground mt-1">
 Boyut: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
 </p>
 </div>
 )}
 </div>
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel disabled={uploading}>İptal</AlertDialogCancel>
 <AlertDialogAction
 onClick={handleUploadRestore}
 disabled={!selectedFile || uploading}
 className="bg-destructive text-destructive-foreground"
 >
 {uploading ? 'Yükleniyor...' : 'Evet, Yükle ve Geri Yükle'}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 );
}
