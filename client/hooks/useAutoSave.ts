import { useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveOptions {
  onSave: () => Promise<void>;
  debounceMs?: number;
}

export function useAutoSave({ onSave, debounceMs = 2000 }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const hasErrorRef = useRef(false);

  const triggerAutoSave = useCallback(async () => {
    if (isSavingRef.current || hasErrorRef.current) return;

    isSavingRef.current = true;
    hasErrorRef.current = false;

    try {
      // Show "Saving..." toast
      toast.loading('Kaydediliyor...', { id: 'auto-save' });

      await onSave();

      // Replace with success toast
      toast.success('Değişiklikler kaydedildi', { id: 'auto-save' });
    } catch (error) {
      hasErrorRef.current = true;
      console.error('Auto-save error:', error);
      
      toast.error(
        error instanceof Error ? error.message : 'Kaydet sırasında hata oluştu',
        { id: 'auto-save' }
      );
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave]);

  const debouncedSave = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      triggerAutoSave();
    }, debounceMs);
  }, [triggerAutoSave, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedSave, isSaving: isSavingRef.current };
}
