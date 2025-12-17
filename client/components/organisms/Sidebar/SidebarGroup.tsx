import React from "react";
import { cn } from "@/lib/utils";

interface SidebarGroupProps {
    label: string;
    collapsed?: boolean;
    children: React.ReactNode;
    className?: string;
}

export function SidebarGroup({
    label,
    collapsed = false,
    children,
    className
}: SidebarGroupProps) {
    return (
        <div className={cn("flex flex-col", className)}>
            {!collapsed && (
                <div className="px-3 py-1.5 mb-1">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                        {label}
                    </h3>
                </div>
            )}
            <div className={cn(collapsed ? "flex flex-col items-center gap-2" : "space-y-0.5")}>
                {children}
            </div>
        </div>
    );
}
