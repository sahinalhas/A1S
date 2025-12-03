import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import {
 MoreHorizontal,
 Pencil,
 Trash2,
 FileText,
 Users,
 Plus,
} from 'lucide-react';
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/organisms/Table';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from '@/components/organisms/DropdownMenu';
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from '@/components/organisms/AlertDialog';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import type { ExamSession } from '../../../shared/types/exam-management.types';

interface ExamSessionsListProps {
 sessions: ExamSession[];
 examTypeName: string;
 onEdit: (session: ExamSession) => void;
 onDelete: (sessionId: string) => void;
 onCreate: () => void;
 onViewResults: (session: ExamSession) => void;
}

export function ExamSessionsList({
 sessions,
 examTypeName,
 onEdit,
 onDelete,
 onCreate,
 onViewResults,
}: ExamSessionsListProps) {
 const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
 const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

 const handleDeleteClick = (sessionId: string) => {
 setSessionToDelete(sessionId);
 setDeleteDialogOpen(true);
 };

 const handleDeleteConfirm = () => {
 if (sessionToDelete) {
 onDelete(sessionToDelete);
 setDeleteDialogOpen(false);
 setSessionToDelete(null);
 }
 };

 if (sessions.length === 0) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>{examTypeName} Deneme Sınavları</CardTitle>
 <CardDescription>
 Henüz hiç {examTypeName} denemesi oluşturulmamış
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="text-center py-12">
 <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
 <p className="text-sm text-muted-foreground mb-4">
 İlk deneme sınavınızı oluşturarak başlayın
 </p>
 <Button onClick={onCreate}>
 <Plus className="h-4 w-4 mr-2" />
 Yeni Deneme Oluştur
 </Button>
 </div>
 </CardContent>
 </Card>
 );
 }

 return (
 <>
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
 <div>
 <CardTitle>{examTypeName} Deneme Sınavları</CardTitle>
 <CardDescription>
 Toplam {sessions.length} deneme sınavı
 </CardDescription>
 </div>
 <Button onClick={onCreate}>
 <Plus className="h-4 w-4 mr-2" />
 Yeni Deneme
 </Button>
 </CardHeader>
 <CardContent>
 <div className="rounded-md border">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Sınav Adı</TableHead>
 <TableHead>Tarih</TableHead>
 <TableHead>Açıklama</TableHead>
 <TableHead>Oluşturulma</TableHead>
 <TableHead className="text-right">İşlemler</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {sessions.map((session) => (
 <TableRow key={session.id}>
 <TableCell className="font-medium">{session.name}</TableCell>
 <TableCell>
 <Badge variant="outline">
 {format(new Date(session.exam_date), 'dd MMM yyyy', { locale: tr })}
 </Badge>
 </TableCell>
 <TableCell className="max-w-xs truncate text-muted-foreground">
 {session.description || '-'}
 </TableCell>
 <TableCell className="text-sm text-muted-foreground">
 {format(new Date(session.created_at), 'dd.MM.yyyy', { locale: tr })}
 </TableCell>
 <TableCell className="text-right">
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" className="h-8 w-8 p-0">
 <span className="sr-only">Menüyü aç</span>
 <MoreHorizontal className="h-4 w-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
 <DropdownMenuItem onClick={() => onViewResults(session)}>
 <Users className="mr-2 h-4 w-4" />
 Sonuçları Gör
 </DropdownMenuItem>
 <DropdownMenuSeparator />
 <DropdownMenuItem onClick={() => onEdit(session)}>
 <Pencil className="mr-2 h-4 w-4" />
 Düzenle
 </DropdownMenuItem>
 <DropdownMenuItem
 onClick={() => handleDeleteClick(session.id)}
 className="text-destructive focus:text-destructive"
 >
 <Trash2 className="mr-2 h-4 w-4" />
 Sil
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 </CardContent>
 </Card>

 <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Deneme Sınavını Sil</AlertDialogTitle>
 <AlertDialogDescription>
 Bu deneme sınavını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve
 sınava ait tüm sonuçlar silinecektir.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>İptal</AlertDialogCancel>
 <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive">
 Sil
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </>
 );
}
