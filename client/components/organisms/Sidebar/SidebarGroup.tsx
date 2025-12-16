import React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/atoms/Separator";

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
        <div className={cn("flex flex-col gap-1", collapsed ? "py-1" : "py-2", className)}>
            {!collapsed && (
                <div className="px-3 py-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 font-heading">
                        {label}
                    </h3>
                </div>
            )}
            <div className={cn(collapsed ? "space-y-2" : "space-y-1")}>
                {children}
            </div>
        </div>
    );
}
