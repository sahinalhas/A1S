import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: React.ElementType;
    actions?: ReactNode;
    className?: string; // Additional classes for the container
}

export function PageHeader({
    title,
    description,
    icon: Icon,
    actions,
    className
}: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8", className)}>
            <div className="flex items-start gap-4">
                {Icon && (
                    <div className="hidden md:flex items-center justify-center h-12 w-12 rounded-xl bg-primary/5 text-primary border border-primary/10 shadow-sm shrink-0">
                        <Icon className="h-6 w-6" />
                    </div>
                )}
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm md:text-base text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {actions && (
                <div className="flex flex-wrap items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}
