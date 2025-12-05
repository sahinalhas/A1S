/**
 * SaveButton - A reusable save button component for profile sections
 * Shows different states: Save, Saving, Saved
 */

import { ReactNode } from "react";
import { Button } from "@/components/atoms/Button";
import { Save, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
    isDirty: boolean;
    isSaving: boolean;
    showSuccess: boolean;
    onSave: () => void;
    className?: string;
}

export function SaveButton({
    isDirty,
    isSaving,
    showSuccess,
    onSave,
    className,
}: SaveButtonProps) {
    if (!isDirty && !isSaving && !showSuccess) {
        return null;
    }

    return (
        <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={isSaving || showSuccess}
            className={cn(
                "transition-all duration-300",
                showSuccess
                    ? "bg-green-600 hover:bg-green-600"
                    : isDirty
                        ? "bg-primary"
                        : "",
                className
            )}
        >
            {isSaving ? (
                <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Kaydediliyor...
                </>
            ) : showSuccess ? (
                <>
                    <Check className="h-4 w-4 mr-1.5" />
                    Kaydedildi
                </>
            ) : (
                <>
                    <Save className="h-4 w-4 mr-1.5" />
                    Kaydet
                </>
            )}
        </Button>
    );
}

export default SaveButton;
