import * as React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { prefetchRoute } from "@/hooks/usePrefetchRoutes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/organisms/Popover";

interface SubMenuItem {
  label: string;
  to: string;
}

interface CollapsibleMenuItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  end?: boolean;
  subItems?: SubMenuItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
  isOpen?: boolean;
  onToggle?: (to: string) => void;
}

export function CollapsibleMenuItem({
  icon: Icon,
  label,
  to,
  end,
  subItems,
  collapsed,
  onNavigate,
  isOpen: isOpenProp,
  onToggle,
}: CollapsibleMenuItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isOpenState = isOpenProp !== undefined ? isOpenProp : isOpen;
  const hasSubItems = subItems && subItems.length > 0;

  if (!hasSubItems) {
    return (
      <NavLink
        to={to}
        end={end}
        onMouseEnter={() => prefetchRoute(to)}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "group flex items-center gap-3 px-3 py-2 rounded-lg",
            "text-xs font-medium text-sidebar-foreground/70",
            "transition-all duration-200 ease-out",
            "hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            "relative",
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
            collapsed && "justify-center px-2 py-2.5"
          )
        }
      >
        {({ isActive }) => (
          <>
            <div
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full",
                "bg-gradient-to-b from-primary to-chart-2",
                isActive ? "opacity-100" : "opacity-0",
                collapsed && "left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
              )}
            />
            <Icon
              className={cn(
                "shrink-0 transition-colors",
                collapsed ? "h-5 w-5" : "h-4 w-4"
              )}
            />
            <span
              className={cn(
                "truncate whitespace-nowrap overflow-hidden transition-all",
                collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              )}
            >
              {label}
            </span>
          </>
        )}
      </NavLink>
    );
  }

  return (
    <Popover open={isOpenState} onOpenChange={(open) => {
      if (onToggle) {
        if (open) onToggle(to);
        else onToggle("");
      } else {
        setIsOpen(open);
      }
    }}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full group flex items-center gap-3 px-3 py-2 rounded-lg",
            "text-xs font-medium text-sidebar-foreground/70",
            "transition-all duration-200 ease-out",
            "hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            "relative",
            isOpenState && "bg-sidebar-accent/30",
            collapsed && "justify-center px-2 py-2.5"
          )}
        >
          <Icon
            className={cn(
              "shrink-0 transition-colors",
              collapsed ? "h-5 w-5" : "h-4 w-4"
            )}
          />
          <span
            className={cn(
              "flex-1 text-left truncate whitespace-nowrap overflow-hidden transition-all",
              collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}
          >
            {label}
          </span>
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        side="right" 
        align="start"
        className="w-48 p-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 shadow-lg rounded-xl"
      >
        <div className="flex flex-col gap-1">
          {subItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onMouseEnter={() => prefetchRoute(item.to)}
              onClick={() => {
                onNavigate?.();
                setIsOpen(false);
              }}
              className={({ isActive }) =>
                cn(
                  "flex items-center h-9 px-3 rounded-lg",
                  "text-sm font-medium text-gray-700 dark:text-gray-300",
                  "transition-all duration-200 ease-out",
                  "hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800",
                  isActive &&
                    "text-primary bg-blue-50 dark:bg-blue-950/30 font-semibold"
                )
              }
            >
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default CollapsibleMenuItem;
