import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/organisms/AlertDialog/alert-dialog';
import { Button } from '@/components/atoms/Button/button';

interface IdleWarningModalProps {
    open: boolean;
    remainingTime: string;
    onContinue: () => void;
    onLogout: () => void;
}

export function IdleWarningModal({
    open,
    remainingTime,
    onContinue,
    onLogout,
}: IdleWarningModalProps) {
    return (
        <AlertDialog open={open}>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <span className="text-2xl">⚠️</span>
                        Oturum Hareketsizlik Uyarısı
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3 pt-2">
                        <p className="text-base">
                            60 dakikadır herhangi bir aktivite gösterilmedi.
                        </p>
                        <p className="text-base font-medium text-destructive">
                            <span className="font-mono text-lg">{remainingTime}</span> sonra otomatik çıkış yapılacak.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Çalışmaya devam etmek için "Devam Et" butonuna tıklayın.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onLogout}
                        className="sm:mr-2"
                    >
                        Çıkış Yap
                    </Button>
                    <AlertDialogAction
                        onClick={onContinue}
                        className="bg-primary hover:bg-primary/90"
                    >
                        Devam Et
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
