import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, School } from '@/lib/auth-context';
import { Button } from '@/components/atoms/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/organisms/DropdownMenu';
import { Building2, ChevronDown, Check, Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SchoolSwitcherProps {
  collapsed?: boolean;
  mode?: 'sidebar' | 'header';
}

export default function SchoolSwitcher({ collapsed = false, mode = 'sidebar' }: SchoolSwitcherProps) {
  const { selectedSchool, userSchools, selectSchool } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelectSchool = (school: School) => {
    if (school.id === selectedSchool?.id) {
      setOpen(false);
      return;
    }

    selectSchool(school);
    setOpen(false);

    // Note: selectSchool already invalidates queries via auth-context
    // No need for hard refresh - queries will refetch automatically
  };

  const handleManageSchools = () => {
    setOpen(false);
    navigate('/ayarlar?tab=okullar');
  };

  if (!selectedSchool) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto transition-all duration-300 group relative overflow-hidden",
            mode === 'header'
              ? "px-3 py-1.5 h-8 rounded-full border border-border/40 hover:bg-accent/50 hover:border-border/60 bg-background/50 backdrop-blur-sm"
              : cn(
                "w-full justify-start gap-2 px-2.5 py-2.5 rounded-xl",
                "hover:bg-sidebar-accent/50",
                collapsed && "justify-center px-2 py-3"
              )
          )}
        >
          {/* Hover glow (only for sidebar mode as header has its own style) */}
          {mode === 'sidebar' && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}

          <div className={cn(
            "flex items-center gap-2 relative z-10",
            mode === 'sidebar' && "w-full"
          )}>
            <div className={cn(
              "flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-105",
              mode === 'header'
                ? "size-5 rounded bg-primary/10 border-primary/10 text-primary"
                : "size-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border-primary/10 text-primary"
            )}>
              <Building2 className={cn(mode === 'header' ? "h-3 w-3" : "h-4 w-4")} />
            </div>

            {(mode === 'header' || !collapsed) && (
              <>
                <div className={cn(
                  "flex-1 text-left min-w-0 pr-1",
                  mode === 'header' ? "flex items-center gap-2" : "block"
                )}>
                  <p className={cn(
                    "font-semibold truncate",
                    mode === 'header' ? "text-xs text-foreground" : "text-xs text-sidebar-foreground"
                  )}>
                    {selectedSchool.name}
                  </p>
                  {mode === 'sidebar' && userSchools.length > 1 && (
                    <p className="text-[10px] text-sidebar-foreground/50">
                      {userSchools.length} okul
                    </p>
                  )}
                </div>
                <ChevronDown className={cn(
                  "shrink-0 transition-colors",
                  mode === 'header' ? "h-3.5 w-3.5 text-muted-foreground" : "h-4 w-4 text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                )} />
              </>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={mode === 'header' ? "end" : "start"}
        className={cn(
          "w-64 backdrop-blur-xl border-border/50",
          mode === 'header' ? "mt-2" : "bg-sidebar/95 border-sidebar-border/50"
        )}
        sideOffset={8}
      >
        <DropdownMenuLabel className={cn(
          "text-xs font-medium px-3 py-2",
          mode === 'header' ? "text-muted-foreground" : "text-sidebar-foreground/60"
        )}>
          OKULLARIM
        </DropdownMenuLabel>

        <div className="p-1 space-y-0.5">
          {userSchools.map((school) => (
            <DropdownMenuItem
              key={school.id}
              onClick={() => handleSelectSchool(school)}
              className={cn(
                "flex items-center gap-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
                "focus:bg-accent/50",
                school.id === selectedSchool.id && "bg-accent/50"
              )}
            >
              <div className={cn(
                "size-8 rounded-md flex items-center justify-center shrink-0 border",
                school.id === selectedSchool.id
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-muted border-transparent text-muted-foreground"
              )}>
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-xs font-medium truncate",
                  school.id === selectedSchool.id ? "text-primary" : "text-foreground"
                )}>
                  {school.name}
                </p>
                {school.code && (
                  <p className="text-[10px] text-muted-foreground">{school.code}</p>
                )}
              </div>
              {school.id === selectedSchool.id && (
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="mx-1" />

        <div className="p-1">
          <DropdownMenuItem
            onClick={handleManageSchools}
            className="flex items-center gap-3 py-2 rounded-lg cursor-pointer focus:bg-accent/50"
          >
            <div className="size-8 rounded-md bg-muted flex items-center justify-center border border-transparent text-muted-foreground">
              <Settings className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-foreground">Okul Yönetimi</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
