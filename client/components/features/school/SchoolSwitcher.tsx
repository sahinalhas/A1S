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
}

export default function SchoolSwitcher({ collapsed = false }: SchoolSwitcherProps) {
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
    
    // Hard refresh to reload with new school data
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
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
            "w-full justify-start gap-2 px-3 py-2 h-auto",
            "hover:bg-accent/50 transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
        >
          <div className={cn(
            "size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0",
            "text-primary"
          )}>
            <Building2 className="h-4 w-4" />
          </div>
          
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate text-foreground">
                  {selectedSchool.name}
                </p>
                {userSchools.length > 1 && (
                  <p className="text-xs text-muted-foreground">
                    {userSchools.length} okul
                  </p>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        className="w-64"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Okullarım
        </DropdownMenuLabel>
        
        {userSchools.map((school) => (
          <DropdownMenuItem
            key={school.id}
            onClick={() => handleSelectSchool(school)}
            className="flex items-center gap-3 py-2.5 cursor-pointer"
          >
            <div className={cn(
              "size-8 rounded-lg flex items-center justify-center shrink-0",
              school.id === selectedSchool.id 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted"
            )}>
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{school.name}</p>
              {school.code && (
                <p className="text-xs text-muted-foreground">{school.code}</p>
              )}
            </div>
            {school.id === selectedSchool.id && (
              <Check className="h-4 w-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleManageSchools}
          className="flex items-center gap-3 py-2.5 cursor-pointer"
        >
          <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
            <Settings className="h-4 w-4" />
          </div>
          <span className="text-sm">Okul Yönetimi</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
