import { Button } from '@/components/atoms/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/organisms/Dialog';
import { Progress } from '@/components/atoms/Progress';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Upload } from 'lucide-react';
import { useMEBBISTransfer } from '@/hooks/features/useMEBBISTransfer';
import type { StartTransferRequest } from '@shared/types/mebbis-transfer.types';

interface MEBBISTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionIds: string[];
  totalSessions: number;
  schoolId: string;
}

export function MEBBISTransferDialog({
  open,
  onOpenChange,
  sessionIds,
  totalSessions,
  schoolId
}: MEBBISTransferDialogProps) {
  const { transferState, startTransfer, cancelTransfer, resetTransfer } = useMEBBISTransfer();

  const handleStart = async () => {
    const request: StartTransferRequest = {
      sessionIds,
      schoolId,
      filters: {
        onlyNotTransferred: false
      }
    };
    await startTransfer(request);
  };

  const handleClose = () => {
    if (transferState.status === 'running' || transferState.status === 'waiting_qr') {
      if (!confirm('Aktarım devam ediyor. İptal etmek istediğinizden emin misiniz?')) {
        return;
      }
      cancelTransfer();
    }
    resetTransfer();
    onOpenChange(false);
  };

  const getStatusColor = () => {
    switch (transferState.status) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'cancelled': return 'text-yellow-600';
      case 'running': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (transferState.status) {
      case 'idle': return 'Başlamaya hazır';
      case 'connecting': return 'Bağlanıyor...';
      case 'waiting_qr': return 'QR kod girişi bekleniyor';
      case 'running': return 'Aktarım devam ediyor...';
      case 'completed': return 'Tamamlandı';
      case 'error': return 'Hata oluştu';
      case 'cancelled': return 'İptal edildi';
      default: return '';
    }
  };

  const progressPercentage = transferState.progress.total > 0
    ? Math.round((transferState.progress.completed + transferState.progress.failed) / transferState.progress.total * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Upload className="h-5 w-5" />
            MEBBIS'e Aktarım
          </DialogTitle>
          <DialogDescription className="text-sm">
            {totalSessions} görüşme MEBBIS e-Rehberlik sistemine aktarılacak
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {transferState.status === 'idle' && (
            <Alert>
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <AlertDescription>
                <div className="space-y-2 text-xs sm:text-sm">
                  <p>Aktarım başlatıldığında arka planda tarayıcı açılacak.</p>
                  <p className="font-medium">Lütfen bu adımları izleyin:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>QR kodu telefonunuzla okutacaksınız</li>
                    <li>MEBBIS'e giriş yaptıktan sonra otomatik aktarım başlayacak</li>
                    <li>İşlem tamamlanana kadar bu pencereyi kapatmayın</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {transferState.status === 'waiting_qr' && (
            <Alert className="bg-blue-50 border-blue-200">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600 flex-shrink-0" />
              <AlertDescription>
                <div className="space-y-3 text-xs sm:text-sm">
                  <p className="font-medium text-blue-900">📱 Telefonunuzla QR Kodu Okutun</p>
                  <p className="text-blue-700">MEBBIS giriş sayfası açıldı. Aşağıdaki QR kodu telefonunuzla okutarak giriş yapın.</p>
                  <div className="bg-white p-3 rounded-lg border-2 border-blue-300">
                    <img 
                      src="/mebbis-qr-code.png" 
                      alt="MEBBIS QR Code" 
                      className="w-full max-w-sm mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <p className="text-center text-xs text-gray-500 mt-2">
                      QR kod görünmüyorsa: <a href="https://mebbis.meb.gov.tr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">MEBBIS sayfasını aç</a>
                    </p>
                  </div>
                  <p className="text-blue-600 text-xs">⏱️ 3 dakika içinde giriş yapmalısınız</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
              <span className={`font-medium ${getStatusColor()}`}>{getStatusText()}</span>
              {transferState.status === 'running' && transferState.currentSession && (
                <span className="text-gray-600 text-xs sm:text-sm truncate">
                  Öğrenci: {transferState.currentSession.studentNo} - {transferState.currentSession.studentName}
                </span>
              )}
            </div>

            {transferState.progress.total > 0 && (
              <>
                <Progress value={progressPercentage} className="h-2" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 text-center text-sm">
                  <div className="p-2 rounded-lg bg-gray-50">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{transferState.progress.total}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Toplam</div>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{transferState.progress.current}</div>
                    <div className="text-xs sm:text-sm text-gray-600">İşleniyor</div>
                  </div>
                  <div className="p-2 rounded-lg bg-green-50">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{transferState.progress.completed}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Başarılı</div>
                  </div>
                  <div className="p-2 rounded-lg bg-red-50">
                    <div className="text-xl sm:text-2xl font-bold text-red-600">{transferState.progress.failed}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Başarısız</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {transferState.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Hatalar ({transferState.errors.length})</h4>
              <ScrollArea className="h-32 sm:h-40 rounded-md border p-2 sm:p-3">
                <div className="space-y-2">
                  {transferState.errors.map((error, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                      <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">Öğrenci {error.studentNo}:</span>
                        <span className="text-gray-700 ml-1 break-words">{error.error}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {transferState.status === 'completed' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <AlertDescription className="text-green-900 text-xs sm:text-sm">
                Aktarım başarıyla tamamlandı! {transferState.progress.completed} görüşme MEBBIS'e aktarıldı.
                {transferState.progress.failed > 0 && ` ${transferState.progress.failed} görüşme aktarılamadı.`}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
          {transferState.status === 'idle' && (
            <>
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                İptal
              </Button>
              <Button onClick={handleStart} className="w-full sm:w-auto">
                Aktarımı Başlat
              </Button>
            </>
          )}

          {(transferState.status === 'running' || transferState.status === 'waiting_qr') && (
            <Button variant="destructive" onClick={cancelTransfer} className="w-full sm:w-auto">
              İptal Et
            </Button>
          )}

          {(transferState.status === 'completed' || transferState.status === 'error' || transferState.status === 'cancelled') && (
            <Button onClick={handleClose} className="w-full sm:w-auto">
              Kapat
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
