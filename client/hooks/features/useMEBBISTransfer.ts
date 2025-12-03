import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { 
 MEBBISTransferState, 
 MEBBISTransferProgress,
 StartTransferRequest, 
 SessionCompletedEvent, 
 MEBBISTransferError,
 TransferResultSummary
} from '@shared/types/mebbis-transfer.types';
import { toast } from 'sonner';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';

const SOCKET_URL = window.location.origin;

interface SocketManager {
 socket: Socket;
 subscribe: (transferId: string) => void;
 teardown: () => void;
}

function createTransferSocket(
 setTransferState: React.Dispatch<React.SetStateAction<MEBBISTransferState>>,
 onTeardown: () => void
): SocketManager {
 const socket = io(SOCKET_URL, {
 path: '/socket.io',
 transports: ['websocket', 'polling'],
 reconnection: true,
 reconnectionAttempts: 10,
 reconnectionDelay: 1000,
 reconnectionDelayMax: 5000,
 rejectUnauthorized: false,
 secure: true,
 upgrade: true,
 forceNew: false,
 autoConnect: false
 });

 let currentTransferId: string | null = null;
 let isFirstConnect = true;

 const handleConnect = () => {
 console.log('[Socket] Connected');
 if (currentTransferId) {
 console.log('[Socket] Subscribing to transfer:', currentTransferId);
 socket.emit('mebbis:subscribe', currentTransferId);
 }
 if (!isFirstConnect) {
 toast.success('Bağlantı yeniden kuruldu');
 }
 isFirstConnect = false;
 };

 const handleDisconnect = (reason: string) => {
 console.log('[Socket] Disconnected:', reason);
 };

 const handleReconnectAttempt = (attemptNumber: number) => {
 console.log(`[Socket] Reconnection attempt ${attemptNumber}`);
 toast.warning(`Bağlantı koptu. Yeniden bağlanılıyor... (${attemptNumber}/5)`);
 };

 const handleReconnectFailed = () => {
 console.error('[Socket] All reconnection attempts failed');
 toast.error('Bağlantı kurulamadı. Lütfen sayfayı yenileyin.');
 setTransferState(prev => ({ ...prev, status: 'error' }));
 };

 const handleConnectError = (error: Error) => {
 console.error('[Socket] Connection error:', error);
 };

 const handleProgress = (progress: MEBBISTransferProgress) => {
 setTransferState(prev => ({ ...prev, progress }));
 };

 const handleStatus = ({ status, message }: { status: MEBBISTransferState['status']; message?: string }) => {
 setTransferState(prev => ({ ...prev, status }));
 if (message) {
 toast.info(message);
 }
 };

 const handleSessionStart = (session: { id: string; studentNo: string; studentName: string }) => {
 setTransferState(prev => ({ ...prev, currentSession: session }));
 };

 const handleSessionCompleted = (event: SessionCompletedEvent) => {
 if (event.success) {
 toast.success(`Öğrenci ${event.studentNo} başarıyla aktarıldı`);
 }
 };

 const handleSessionFailed = (error: MEBBISTransferError) => {
 setTransferState(prev => ({ ...prev, errors: [...prev.errors, error] }));
 toast.error(`Öğrenci ${error.studentNo} aktarılamadı: ${error.error}`);
 };

 const handleTransferCompleted = (summary: TransferResultSummary) => {
 setTransferState(prev => ({ ...prev, status: 'completed' }));
 toast.success(`Aktarım tamamlandı! ${summary.successful} başarılı, ${summary.failed} başarısız`);
 onTeardown();
 };

 const handleTransferError = ({ error }: { error: string }) => {
 setTransferState(prev => ({ ...prev, status: 'error' }));
 toast.error(`Aktarım hatası: ${error}`);
 onTeardown();
 };

 socket.on('connect', handleConnect);
 socket.on('disconnect', handleDisconnect);
 socket.on('reconnect_attempt', handleReconnectAttempt);
 socket.on('reconnect_failed', handleReconnectFailed);
 socket.on('connect_error', handleConnectError);
 socket.on('mebbis:progress', handleProgress);
 socket.on('mebbis:status', handleStatus);
 socket.on('mebbis:session-start', handleSessionStart);
 socket.on('mebbis:session-completed', handleSessionCompleted);
 socket.on('mebbis:session-failed', handleSessionFailed);
 socket.on('mebbis:transfer-completed', handleTransferCompleted);
 socket.on('mebbis:transfer-error', handleTransferError);

 return {
 socket,
 subscribe: (transferId: string) => {
 currentTransferId = transferId;
 if (socket.connected) {
 socket.emit('mebbis:subscribe', transferId);
 }
 socket.connect();
 },
 teardown: () => {
 console.log('[Socket] Tearing down');
 currentTransferId = null;
 isFirstConnect = true;
 socket.off('connect', handleConnect);
 socket.off('disconnect', handleDisconnect);
 socket.off('reconnect_attempt', handleReconnectAttempt);
 socket.off('reconnect_failed', handleReconnectFailed);
 socket.off('connect_error', handleConnectError);
 socket.off('mebbis:progress', handleProgress);
 socket.off('mebbis:status', handleStatus);
 socket.off('mebbis:session-start', handleSessionStart);
 socket.off('mebbis:session-completed', handleSessionCompleted);
 socket.off('mebbis:session-failed', handleSessionFailed);
 socket.off('mebbis:transfer-completed', handleTransferCompleted);
 socket.off('mebbis:transfer-error', handleTransferError);
 socket.disconnect();
 socket.close();
 }
 };
}

export function useMEBBISTransfer() {
 const [transferState, setTransferState] = useState<MEBBISTransferState>({
 transferId: null,
 status: 'idle',
 progress: { total: 0, completed: 0, failed: 0, current: 0 },
 errors: []
 });

 const socketManagerRef = useRef<SocketManager | null>(null);

 const teardown = useCallback(() => {
 if (socketManagerRef.current) {
 socketManagerRef.current.teardown();
 socketManagerRef.current = null;
 }
 }, []);

 const ensureSocketManager = useCallback(() => {
 if (!socketManagerRef.current) {
 socketManagerRef.current = createTransferSocket(setTransferState, teardown);
 }
 return socketManagerRef.current;
 }, [teardown]);

 useEffect(() => {
 ensureSocketManager();
 
 return () => {
 teardown();
 socketManagerRef.current = null;
 };
 }, [ensureSocketManager, teardown]);

 const startTransfer = useCallback(async (request: StartTransferRequest) => {
 try {
 const manager = ensureSocketManager();

 setTransferState(prev => ({ ...prev, status: 'connecting' }));

 const response = await fetchWithSchool('/api/mebbis/start-transfer', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(request),
 credentials: 'include'
 });

 const data = await response.json();

 if (!data.success) {
 throw new Error(data.error || 'Aktarım başlatılamadı');
 }

 const { transferId } = data;

 setTransferState({
 transferId,
 status: 'waiting_qr',
 progress: { total: data.totalSessions, completed: 0, failed: 0, current: 0 },
 errors: [],
 currentSession: undefined
 });

 manager.subscribe(transferId);

 return { success: true, transferId };
 } catch (error) {
 const err = error as Error;
 setTransferState(prev => ({ ...prev, status: 'error' }));
 toast.error(err.message);
 return { success: false, error: err.message };
 }
 }, [ensureSocketManager]);

 const cancelTransfer = useCallback(async () => {
 if (!transferState.transferId) return;

 try {
 await fetchWithSchool('/api/mebbis/cancel-transfer', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ transferId: transferState.transferId }),
 credentials: 'include'
 });

 teardown();
 setTransferState(prev => ({ ...prev, status: 'cancelled' }));
 toast.info('Aktarım iptal edildi');
 } catch (error) {
 const err = error as Error;
 toast.error(`İptal hatası: ${err.message}`);
 }
 }, [transferState.transferId, teardown]);

 const resetTransfer = useCallback(() => {
 teardown();
 setTransferState({
 transferId: null,
 status: 'idle',
 progress: { total: 0, completed: 0, failed: 0, current: 0 },
 errors: []
 });
 }, [teardown]);

 return {
 transferState,
 startTransfer,
 cancelTransfer,
 resetTransfer
 };
}
