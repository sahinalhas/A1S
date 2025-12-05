/**
 * SectionCard - A reusable card component for student profile sections
 * Shows a save button when form is dirty and allows manual save
 */

import { useState, useEffect, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Save, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    children: ReactNode;
    onSave?: () => Promise<void>;
    isDirty?: boolean;
    className?: string;
    headerClassName?: string;
}

export function SectionCard({
    title,
    description,
    icon,
    children,
    onSave,
    isDirty = false,
    className,
    headerClassName,
}: SectionCardProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = async () => {
        if (!onSave || isSaving) return;

        setIsSaving(true);
        try {
            await onSave();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className={cn("relative", className)}>
            <CardHeader className={cn("pb-4", headerClassName)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="p-2 rounded-lg bg-primary/10">
                                {icon}
                            </div>
                        )}
                        <div>
                            <CardTitle className="text-lg">{title}</CardTitle>
                            {description && (
                                <CardDescription className="text-xs">{description}</CardDescription>
                            )}
                        </div>
                    </div>

                    {onSave && (isDirty || showSuccess) && (
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving || showSuccess}
                            className={cn(
                                "transition-all duration-300",
                                showSuccess
                                    ? "bg-green-600 hover:bg-green-600"
                                    : isDirty
                                        ? "bg-primary animate-pulse"
                                        : ""
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
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-0">{children}</CardContent>
        </Card>
    );
}

export default SectionCard;
