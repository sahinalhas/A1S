import {
  Link,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Button } from "@/components/atoms/Button";
import {
  Sun,
  Moon,
  Users2,
  CalendarDays,
  FileText,
  MessageSquare,
  Settings,
  ClipboardList,
  Home,
  Menu,
  X,
  PanelLeftClose,
  Lightbulb,
  BookOpen,
  Brain,
  Search,
  ChevronRight,
  LogOut
} from "lucide-react";
import { NotificationCenter } from "@/components/features/notifications";
import { useEffect, useState } from "react";
import { loadSettings, updateSettings, SETTINGS_KEY, AppSettings } from "@/lib/app-settings";
import { ScrollArea } from "@/components/organisms/ScrollArea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/organisms/Tooltip/tooltip";
import { useAuth } from "@/lib/auth-context";
import AIStatusIndicator from "@/components/features/common/AIStatusIndicator";
import { useIsMobile } from "@/hooks/utils/mobile.utils";
import { cn } from "@/lib/utils";
import GuidanceTipBalloon from "@/components/features/guidance-tips/GuidanceTipBalloon";
import { useGuidanceTipQueue } from "@/hooks/useGuidanceTipQueue";
import SchoolSwitcher from "@/components/features/school/SchoolSwitcher";
import { CollapsibleMenuItem } from "@/components/organisms/Sidebar/CollapsibleMenuItem";
import { SidebarSearch } from "@/components/organisms/Sidebar/SidebarSearch";
import { SidebarUserProfile } from "@/components/organisms/Sidebar/SidebarUserProfile";

// --- Enhanced Logo Component ---
function AppLogo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link
      to="/"
      className={cn(
        "flex items-center gap-3 group transition-all duration-300 py-2",
        collapsed ? "justify-center px-0" : "px-2"
      )}
    >
      <div className={cn(
        "relative flex items-center justify-center shrink-0 transition-all duration-500",
        collapsed ? "size-10" : "size-10"
      )}>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent rounded-xl opacity-100 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-500" />
        <span className="relative text-white font-bold text-lg">R</span>
      </div>

      <div className={cn(
        "flex flex-col overflow-hidden transition-all duration-300",
        collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
      )}>
        <span className="font-heading font-bold text-lg leading-none tracking-tight text-foreground">
          Rehber360
        </span>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">
          Premium Suite
        </span>
      </div>
    </Link>
  );
}

// Navigation Items
const navigationItems = [
  { label: "Gösterge Paneli", icon: Home, to: "/", end: true },
  { label: "Öğrenci Yönetimi", icon: Users2, to: "/ogrenci" },
  { label: "Görüşme & Randevu", icon: CalendarDays, to: "/gorusmeler" },
  { label: 'AI Asistanım', icon: Brain, to: '/ai-araclari' },
  { label: "Analiz & Raporlar", icon: FileText, to: "/raporlar" },
  { label: "Sınav & Denemeler", icon: ClipboardList, to: "/olcme-degerlendirme" },
  { label: "Ölçek & Anketler", icon: MessageSquare, to: "/anketler" },
  { label: "İçerik Kütüphanesi", icon: BookOpen, to: "/icerik-yonetimi" },
  { label: "Profil & Ayarlar", icon: Settings, to: "/ayarlar" },
];

export default function Rehber360Layout() {
  const { isAuthenticated, isLoading, logout } = useAuth(); // Added logout here if needed
  const [dark, setDark] = useState(false);
  const [account, setAccount] = useState<AppSettings["account"] | undefined>(undefined);

  // Sidebar State - Floating logic
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenuItem, setOpenMenuItem] = useState<string | null>(null);

  // Feature States
  const [showTipNotification, setShowTipNotification] = useState(false);

  const isMobile = useIsMobile();
  const location = useLocation();
  const tipQueueStatus = useGuidanceTipQueue();

  // Settings Loading
  useEffect(() => {
    loadSettings().then(settings => {
      setDark(settings.theme === "dark");
      setAccount(settings.account);
    }).catch(console.error);
  }, []);

  // Theme Sync
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  // Sidebar Auto-collapse on smaller desktop screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280 && window.innerWidth > 768) {
        setSidebarOpen(false);
      } else if (window.innerWidth >= 1280) {
        setSidebarOpen(true);
      }
    };

    // Initial check
    if (!isMobile) handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-background"><div className="animate-pulse-slow text-primary font-medium">Yükleniyor...</div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleMenuToggle = (to: string) => setOpenMenuItem(openMenuItem === to ? null : to);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground relative">

      {/* --- Ambient Background Effects --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] animate-float" style={{ animationDelay: '-2s' }} />
      </div>

      {/* --- Desktop Floating Sidebar --- */}
      {!isMobile && (
        <aside
          className={cn(
            "relative z-30 flex flex-col my-4 ml-4 rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
            "bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/5 dark:shadow-black/20",
            sidebarOpen ? "w-[280px]" : "w-[90px]"
          )}
        >
          {/* Sidebar Header */}
          <div className="h-20 flex items-center justify-between px-4 border-b border-border/40">
            <AppLogo collapsed={!sidebarOpen} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden xl:flex text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full w-8 h-8"
            >
              <PanelLeftClose className={cn("w-4 h-4 transition-transform duration-300", !sidebarOpen && "rotate-180")} />
            </Button>
          </div>

          {/* Sidebar Content */}
          <ScrollArea className="flex-1 px-3 py-6">
            <div className={cn("mb-6 transition-all duration-300", !sidebarOpen && "px-1")}>
              <SidebarSearch collapsed={!sidebarOpen} />
            </div>

            <nav className="space-y-1.5 font-medium">
              {navigationItems.map((item) => (
                <CollapsibleMenuItem
                  key={item.to}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  end={item.end}
                  collapsed={!sidebarOpen}
                  isOpen={openMenuItem === item.to}
                  onToggle={handleMenuToggle}
                />
              ))}
            </nav>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border/40 space-y-4">
            <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
              <AIStatusIndicator collapsed={!sidebarOpen} />
            </div>

            <SidebarUserProfile
              collapsed={!sidebarOpen}
              displayName={account?.displayName}
            />
          </div>
        </aside>
      )}

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">

        {/* Header (Glassmorphism) */}
        <header className="h-20 px-6 flex items-center justify-between z-20">

          <div className="flex items-center gap-4">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="w-6 h-6" />
              </Button>
            )}

            {/* Dynamic Page Title / Breadcrumb Placeholder */}
            {!isMobile && (
              <div className="flex flex-col animate-fade-in-up">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  {/* Could use a breadcrumb hook here */}
                  Rehberlik Servisi
                </span>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  Hoş Geldiniz, {account?.displayName?.split(' ')[0] || 'Danışman'}
                </h1>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <SchoolSwitcher mode="header" />
            </div>

            <NotificationCenter />

            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-border/60 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 transition-all"
              onClick={() => {
                const next = !dark;
                setDark(next);
                updateSettings({ theme: next ? "dark" : "light" });
              }}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-auto px-4 pb-4 md:px-8 md:pb-8">
          <div className="w-full h-full max-w-[1600px] mx-auto animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>

      {/* --- Mobile Drawer --- */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-[320px] bg-card border-r shadow-2xl p-4 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <AppLogo />
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2">
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <CollapsibleMenuItem
                    key={item.to}
                    icon={item.icon}
                    label={item.label}
                    to={item.to}
                    end={item.end}
                    collapsed={false}
                    isOpen={openMenuItem === item.to}
                    onToggle={handleMenuToggle}
                    onNavigate={() => setMobileMenuOpen(false)}
                  />
                ))}
              </nav>
            </ScrollArea>

            <div className="mt-4 pt-4 border-t space-y-4">
              <SchoolSwitcher collapsed={false} />
              <SidebarUserProfile displayName={account?.displayName} collapsed={false} />
            </div>
          </div>
        </div>
      )}

      {/* Global Features */}
      {showTipNotification && (
        <GuidanceTipBalloon
          autoShow={false}
          position="header-right"
          onDismiss={() => setShowTipNotification(false)}
        />
      )}
    </div>
  );
}