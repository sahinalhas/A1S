import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronRight, LucideIcon, Circle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/organisms/Tooltip/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/organisms/Collapsible";

interface SubMenuItem {
  label: string;
  to: string;
}

interface CollapsibleMenuItemProps {
  icon: LucideIcon;
  label: string;
  to?: string;
  end?: boolean;
  items?: SubMenuItem[];
  collapsed?: boolean;
  isOpen?: boolean;
  onToggle?: (to: string) => void;
  onNavigate?: () => void;
}

// Helper for exact path matching
const isPathActive = (currentPath: string, itemPath: string, end: boolean = false) => {
  if (end) return currentPath === itemPath;
  return currentPath.startsWith(itemPath);
};

export function CollapsibleMenuItem({
  icon: Icon,
  label,
  to,
  end,
  items,
  collapsed,
  isOpen,
  onToggle,
  onNavigate,
}: CollapsibleMenuItemProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasSubMenu = items && items.length > 0;

  // Determine if this item or any sub-item is active
  const isActive = to
    ? isPathActive(location.pathname, to, end)
    : items?.some((sub) => isPathActive(location.pathname, sub.to));

  // --- Collapsed Mode ---
  if (collapsed) {
    if (hasSubMenu) {
      // Only show tooltip in collapsed mode
      // Clicking expands the main sidebar? Or acts as link to first item?
      // For now, let's link to the first item if exists
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate();
                  // For collapsed submenus, maybe navigate to first item
                  if (items && items[0]) navigate(items[0].to);
                }}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg mx-auto transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to={to!}
              onClick={onNavigate}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg mx-auto transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Icon className="w-5 h-5" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // --- Expanded Mode ---

  // 1. Simple Link
  if (!hasSubMenu && to) {
    return (
      <NavLink
        to={to}
        end={end}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )
        }
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="truncate">{label}</span>
        {/* Active Indicator Dot */}
        {useLocation().pathname === to && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        )}
      </NavLink>
    );
  }

  // 2. Collapsible Submenu
  return (
    <Collapsible open={isOpen} onOpenChange={() => onToggle && onToggle(to || label)} className="space-y-1">
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm font-medium group",
            isActive
              ? "text-foreground bg-muted/50"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{label}</span>
          </div>
          <ChevronRight
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-1 relative">
        {/* Connecting line for tree view effect */}
        <div className="absolute left-[1.15rem] top-0 bottom-2 w-px bg-border/40" />

        {items?.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 pl-9 pr-3 py-2 rounded-lg transition-colors text-sm font-medium block relative",
                isActive
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )
            }
          >
            {/* Dot for bullet point */}
            {isActive && (
              <div className="absolute left-[1rem] w-1.5 h-1.5 rounded-full bg-primary -ml-[3px]" />
            )}

            {item.label}
          </NavLink>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
