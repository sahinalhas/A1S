import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'guidance_tips_queue';

interface StoredQueue {
  tips: { id: string }[];
  currentIndex: number;
  viewedTipIds: string[];
  batchId: string;
  fetchedAt: string;
}

export interface TipQueueStatus {
  totalTips: number;
  remainingTips: number;
  viewedTips: number;
  hasQueue: boolean;
}

export function useGuidanceTipQueue(): TipQueueStatus {
  const [status, setStatus] = useState<TipQueueStatus>({
    totalTips: 0,
    remainingTips: 0,
    viewedTips: 0,
    hasQueue: false
  });

  const loadStatus = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredQueue = JSON.parse(stored);
        if (data.tips && data.tips.length > 0) {
          const remaining = data.tips.length - (data.currentIndex || 0);
          setStatus({
            totalTips: data.tips.length,
            remainingTips: remaining,
            viewedTips: data.viewedTipIds?.length || 0,
            hasQueue: true
          });
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load tip queue status:', error);
    }
    
    setStatus({
      totalTips: 0,
      remainingTips: 0,
      viewedTips: 0,
      hasQueue: false
    });
  }, []);

  useEffect(() => {
    loadStatus();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadStatus();
      }
    };

    const handleCustomEvent = () => {
      loadStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tipQueueUpdated', handleCustomEvent);

    const interval = setInterval(loadStatus, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tipQueueUpdated', handleCustomEvent);
      clearInterval(interval);
    };
  }, [loadStatus]);

  return status;
}
