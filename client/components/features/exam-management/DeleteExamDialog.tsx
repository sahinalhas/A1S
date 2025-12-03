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
import { AlertTriangle } from 'lucide-react';
import type { ExamSession } from '../../../shared/types/exam-management.types';

interface DeleteExamDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 session: ExamSession | null;
 onConfirm: () => void;
}

export function DeleteExamDialog({
 open,
 onOpenChange,
 session,
 onConfirm,
}: DeleteExamDialogProps) {
 if (!session) return null;

 return (
 <AlertDialog open={open} onOpenChange={onOpenChange}>
 <AlertDialogContent className="max-w-md">
 <AlertDialogHeader>
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
 <AlertTriangle className="h-5 w-5 text-destructive" />
 </div>
 <AlertDialogTitle className="text-lg">
 Deneme Sınavını Sil
 </AlertDialogTitle>
 </div>
 <AlertDialogDescription className="space-y-2 pt-4">
 <p className="font-medium text-foreground">
 <span className="text-primary">"{session.name}"</span> silinecek.
 </p>
 <p className="text-sm">
 Tüm öğrenci sonuçları kalıcı olarak silinecektir.
 </p>
 <p className="text-sm text-destructive font-medium">
 Bu işlem geri alınamaz.
 </p>
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>İptal</AlertDialogCancel>
 <AlertDialogAction
 onClick={onConfirm}
 className="bg-destructive"
 >
 Sil
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 );
}
