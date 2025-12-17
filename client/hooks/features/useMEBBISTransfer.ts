import { useState, useCallback, useRef, useEffect } from 'react';
import type {
    MEBBISTransferState,
    StartTransferRequest,
} from '@shared/types/mebbis-transfer.types';
import { toast } from 'sonner';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { useQueryClient } from '@tanstack/react-query';

export function useMEBBISTransfer() {
    const queryClient = useQueryClient();
    const [transferState, setTransferState] = useState<MEBBISTransferState>({
        transferId: null,
        status: 'idle',
        progress: { total: 0, completed: 0, failed: 0, current: 0 },
        errors: []
    });

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isPollingRef = useRef(false);

    // Start polling for transfer status
    const startPolling = useCallback((transferId: string) => {
        if (isPollingRef.current) return;

        isPollingRef.current = true;

        const pollStatus = async () => {
            try {
                const response = await fetchWithSchool(`/api/mebbis/status/${transferId}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                const data = await response.json();

                if (data.success) {
                    setTransferState(prev => ({
                        ...prev,
                        status: data.status,
                        progress: data.progress,
                        currentSession: data.currentSession,
                        errors: data.errors || []
                    }));

                    // Stop polling if transfer is finished
                    if (data.status === 'completed' || data.status === 'error' || data.status === 'cancelled') {
                        stopPolling();

                        // Invalidate queries when completed
                        if (data.status === 'completed') {
                            queryClient.invalidateQueries({ queryKey: ['counseling-sessions'] });
                        }
                    }
                }
            } catch (error) {
                console.error('[Polling] Error fetching transfer status:', error);
                // Don't stop polling on error, just log it
            }
        };

        // Poll immediately, then every 1 second
        pollStatus();
        pollingIntervalRef.current = setInterval(pollStatus, 1000);
    }, [queryClient]);

    // Stop polling
    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        isPollingRef.current = false;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    const startTransfer = useCallback(async (request: StartTransferRequest) => {
        try {
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

            // Start polling for status updates
            startPolling(transferId);

            return { success: true, transferId };
        } catch (error) {
            const err = error as Error;
            setTransferState(prev => ({ ...prev, status: 'error' }));
            toast.error(err.message);
            stopPolling();
            return { success: false, error: err.message };
        }
    }, [startPolling, stopPolling]);

    const cancelTransfer = useCallback(async () => {
        if (!transferState.transferId) return;

        try {
            await fetchWithSchool('/api/mebbis/cancel-transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transferId: transferState.transferId }),
                credentials: 'include'
            });

            stopPolling();
            setTransferState(prev => ({ ...prev, status: 'cancelled' }));
            toast.info('Aktarım iptal edildi');
        } catch (error) {
            const err = error as Error;
            toast.error(`İptal hatası: ${err.message}`);
        }
    }, [transferState.transferId, stopPolling]);

    const resetTransfer = useCallback(() => {
        stopPolling();
        setTransferState({
            transferId: null,
            status: 'idle',
            progress: { total: 0, completed: 0, failed: 0, current: 0 },
            errors: []
        });
        // Explicit invalidation on reset just in case
        queryClient.invalidateQueries({ queryKey: ['counseling-sessions'] });
    }, [stopPolling, queryClient]);

    return {
        transferState,
        startTransfer,
        cancelTransfer,
        resetTransfer
    };
}
