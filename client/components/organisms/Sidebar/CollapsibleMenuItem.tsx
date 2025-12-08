import * as React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { prefetchRoute } from "@/hooks/usePrefetchRoutes";

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
            "hover:text-sidebar-foreground/90",
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
    <div className="relative">
      <button
        onClick={() => {
          if (onToggle) {
            onToggle(to);
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={cn(
          "w-full group flex items-center gap-3 px-3 py-2 rounded-lg",
          "text-xs font-medium text-sidebar-foreground/70",
          "transition-all duration-200 ease-out",
          "hover:text-sidebar-foreground/90",
          "relative",
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

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isOpenState ? "max-h-[148px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div
          className={cn(
            "relative ml-4 pl-3 border-l border-sidebar-border/50",
            "py-1 overflow-y-auto max-h-[140px]",
            collapsed && "ml-0 pl-0 border-l-0"
          )}
        >
          {subItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onMouseEnter={() => prefetchRoute(item.to)}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center h-9 px-3 rounded-md",
                  "text-xs font-medium text-sidebar-foreground/60",
                  "transition-all duration-200 ease-out",
                  "hover:text-sidebar-foreground/80",
                  isActive &&
                    "text-sidebar-foreground bg-sidebar-accent/50 font-semibold"
                )
              }
            >
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}

          {subItems.length > 3 && (
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-sidebar to-transparent pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
}

export default CollapsibleMenuItem;
