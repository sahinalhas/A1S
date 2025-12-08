import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronUp, User, Bell, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/atoms/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/organisms/DropdownMenu";
import { useAuth } from "@/lib/auth-context";

interface SidebarUserProfileProps {
  collapsed?: boolean;
  displayName?: string;
  role?: string;
}

export function SidebarUserProfile({
  collapsed,
  displayName,
  role,
}: SidebarUserProfileProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const initials = React.useMemo(() => {
    const n = displayName || "";
    const parts = n.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "K";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
  }, [displayName]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" className="w-48">
          <DropdownMenuLabel>{displayName || "Kullanıcı"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/ayarlar" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/bildirimler" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Bildirimler
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center gap-3 p-2 rounded-lg",
            "hover:bg-sidebar-accent/50 transition-all duration-200",
            "group"
          )}
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left min-w-0">
            <div className="text-xs font-medium text-sidebar-foreground truncate">
              {displayName || "Kullanıcı"}
            </div>
            <div className="text-[10px] text-sidebar-foreground/50 truncate">
              {role || "Rehber Öğretmen"}
            </div>
          </div>
          <ChevronUp className="h-4 w-4 text-sidebar-foreground/50 group-hover:text-sidebar-foreground transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-[200px]">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{displayName || "Kullanıcı"}</p>
            <p className="text-xs text-muted-foreground">
              {role || "Rehber Öğretmen"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/ayarlar" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ayarlar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/bildirimler" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Bildirimler
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SidebarUserProfile;
