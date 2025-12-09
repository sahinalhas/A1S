import * as React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { prefetchRoute } from "@/hooks/usePrefetchRoutes";
import { ChevronRight } from "lucide-react";

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
            "group flex items-center gap-3 px-3 py-2.5 rounded-xl",
            "text-sm font-medium text-sidebar-foreground/70",
            "transition-all duration-300 ease-out",
            "hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
            "relative overflow-hidden",
            isActive && [
              "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent",
              "text-sidebar-foreground font-semibold",
              "shadow-sm"
            ],
            collapsed && "justify-center px-2 py-3"
          )
        }
      >
        {({ isActive }) => (
          <>
            {/* Active indicator with gradient */}
            <div
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full",
                "bg-gradient-to-b from-primary via-primary to-chart-2",
                "transition-all duration-300",
                isActive ? "opacity-100 scale-100" : "opacity-0 scale-50",
                collapsed && "left-1/2 -translate-x-1/2 top-0 translate-y-0 w-6 h-1 rounded-b-full"
              )}
            />

            {/* Hover glow effect */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                "rounded-xl"
              )}
            />

            <Icon
              className={cn(
                "shrink-0 transition-all duration-300 relative z-10",
                collapsed ? "h-5 w-5" : "h-4.5 w-4.5",
                isActive && "text-primary"
              )}
            />
            <span
              className={cn(
                "truncate whitespace-nowrap overflow-hidden transition-all duration-300 relative z-10",
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
          "w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl",
          "text-sm font-medium text-sidebar-foreground/70",
          "transition-all duration-300 ease-out",
          "hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
          "relative overflow-hidden",
          isOpenState && "bg-sidebar-accent/30",
          collapsed && "justify-center px-2 py-3"
        )}
      >
        {/* Hover glow effect */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            "rounded-xl"
          )}
        />

        <Icon
          className={cn(
            "shrink-0 transition-all duration-300 relative z-10",
            collapsed ? "h-5 w-5" : "h-4.5 w-4.5",
            isOpenState && "text-primary"
          )}
        />
        <span
          className={cn(
            "flex-1 text-left truncate whitespace-nowrap overflow-hidden transition-all duration-300 relative z-10",
            collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
          )}
        >
          {label}
        </span>

        {!collapsed && (
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 transition-all duration-300 relative z-10",
              "text-sidebar-foreground/40",
              isOpenState && "rotate-90 text-primary"
            )}
          />
        )}
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isOpenState ? "max-h-[200px] opacity-100 mt-1" : "max-h-0 opacity-0"
        )}
      >
        <div
          className={cn(
            "relative ml-4 pl-4 border-l-2 border-sidebar-border/30",
            "py-1 overflow-y-auto max-h-[190px] space-y-0.5",
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
                  "flex items-center h-9 px-3 rounded-lg relative overflow-hidden group/sub",
                  "text-xs font-medium text-sidebar-foreground/60",
                  "transition-all duration-200 ease-out",
                  "hover:text-sidebar-foreground hover:bg-sidebar-accent/40",
                  isActive && [
                    "text-sidebar-foreground bg-sidebar-accent/50 font-semibold",
                    "shadow-sm"
                  ]
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Sub-item active indicator */}
                  <div
                    className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full",
                      "bg-primary transition-all duration-200",
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  />

                  {/* Hover effect */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent",
                      "opacity-0 group-hover/sub:opacity-100 transition-opacity duration-200"
                    )}
                  />

                  <span className="truncate relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {subItems.length > 4 && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-sidebar via-sidebar/80 to-transparent pointer-events-none rounded-b-lg" />
          )}
        </div>
      </div>
    </div>
  );
}

export default CollapsibleMenuItem;
