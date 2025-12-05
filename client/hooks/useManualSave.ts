/**
 * useManualSave - Hook for manual save functionality in forms
 * Replaces auto-save with explicit save button
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseManualSaveOptions {
    onSave: () => Promise<void>;
    successMessage?: string;
}

export function useManualSave({ onSave, successMessage = "Kaydedildi" }: UseManualSaveOptions) {
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const markDirty = useCallback(() => {
        setIsDirty(true);
    }, []);

    const handleSave = useCallback(async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await onSave();
            setIsDirty(false);
            setShowSuccess(true);
            toast.success(successMessage);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            toast.error("Kayıt sırasında hata oluştu");
            console.error("Save error:", error);
        } finally {
            setIsSaving(false);
        }
    }, [onSave, isSaving, successMessage]);

    const resetDirty = useCallback(() => {
        setIsDirty(false);
    }, []);

    return {
        isDirty,
        isSaving,
        showSuccess,
        markDirty,
        handleSave,
        resetDirty,
    };
}

export default useManualSave;
