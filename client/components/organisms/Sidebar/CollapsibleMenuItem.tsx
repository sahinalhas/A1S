import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronRight, LucideIcon } from "lucide-react";
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

// Yol eşleştirme yardımcı fonksiyonu
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
  collapsed = false,
  isOpen,
  onToggle,
  onNavigate,
}: CollapsibleMenuItemProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasSubMenu = items && items.length > 0;

  // Bu öğe veya alt öğelerinden herhangi biri aktif mi?
  const isActive = to
    ? isPathActive(location.pathname, to, end)
    : items?.some((sub) => isPathActive(location.pathname, sub.to));

  // --- KAPALI MOD (Collapsed) ---
  if (collapsed) {
    if (hasSubMenu) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate();
                  if (items && items[0]) navigate(items[0].to);
                }}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
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
                  "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )
              }
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // --- AÇIK MOD (Expanded) ---

  // Basit Link
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
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )
        }
      >
        <Icon className="w-4 h-4" strokeWidth={2} />
        <span className="truncate flex-1">{label}</span>
      </NavLink>
    );
  }

  // Açılabilir Alt Menü
  return (
    <Collapsible open={isOpen} onOpenChange={() => onToggle && onToggle(to || label)} className="space-y-0.5">
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm font-medium",
            isActive
              ? "text-foreground bg-muted"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4" strokeWidth={2} />
            <span className="truncate">{label}</span>
          </div>
          <ChevronRight
            className={cn(
              "w-4 h-4 transition-transform",
              isOpen && "rotate-90"
            )}
            strokeWidth={2}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-0.5 pl-7">
        {items?.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-1.5 rounded-md transition-colors text-sm",
                isActive
                  ? "text-primary bg-primary/5 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
