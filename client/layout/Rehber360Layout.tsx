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
import { SidebarGroup } from "@/components/organisms/Sidebar/SidebarGroup";
import { ApplicationBreadcrumb } from "@/components/features/common/ApplicationBreadcrumb";
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

// Navigation Structure
const navigationGroups = [
  {
    key: 'general',
    label: 'Genel',
    items: [
      { label: "Gösterge Paneli", icon: Home, to: "/", end: true },
    ]
  },
  {
    key: 'management',
    label: 'Öğrenci & Okul',
    items: [
      { label: "Öğrenci Yönetimi", icon: Users2, to: "/ogrenci" },
      { label: "Görüşme & Randevu", icon: CalendarDays, to: "/gorusmeler" },
    ]
  },
  {
    key: 'analysis',
    label: 'Analiz & Akademik',
    items: [
      { label: "Analiz & Raporlar", icon: FileText, to: "/raporlar" },
      { label: "Sınav & Denemeler", icon: ClipboardList, to: "/olcme-degerlendirme" },
      { label: "Ölçek & Anketler", icon: MessageSquare, to: "/anketler" },
    ]
  },
  {
    key: 'tools',
    label: 'Araçlar',
    items: [
      { label: 'AI Asistanım', icon: Brain, to: '/ai-araclari' },
      { label: "İçerik Kütüphanesi", icon: BookOpen, to: "/icerik-yonetimi" },
      { label: "Profil & Ayarlar", icon: Settings, to: "/ayarlar" },
    ]
  }
];

// Flatten for mobile usage if needed
const navigationItems = navigationGroups.flatMap(g => g.items);

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
          <ScrollArea className={cn("flex-1 py-4", sidebarOpen ? "px-3" : "px-0")}>
            <div className={cn("mb-2 transition-all duration-300", !sidebarOpen ? "px-0" : "px-0")}>
              <SidebarSearch collapsed={!sidebarOpen} />
            </div>

            <nav className={cn("transition-all duration-300", sidebarOpen ? "space-y-4" : "space-y-2")}>
              {navigationGroups.map((group) => (
                <SidebarGroup key={group.key} label={group.label} collapsed={!sidebarOpen}>
                  {group.items.map((item) => (
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
                </SidebarGroup>
              ))}
            </nav>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border/40 space-y-3">
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
        <header className="h-16 px-6 flex items-center justify-between z-20 gap-4 border-b border-border/40 bg-background/50 backdrop-blur-md supports-[backdrop-filter]:bg-background/20">

          <div className="flex items-center gap-4 flex-1">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
            )}

            {/* Breadcrumb Navigation */}
            <div className="flex-1 overflow-hidden pointer-events-auto">
              <ApplicationBreadcrumb />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Global Search Trigger - Compact */}
            <Button
              variant="outline"
              className="hidden md:flex h-9 text-muted-foreground bg-muted/40 hover:bg-muted border-border/50 gap-2 px-3 text-xs font-normal"
              onClick={() => { /* Trigger Command Palette */ }}
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Ara...</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            <div className="hidden md:block w-px h-6 bg-border/60 mx-1" />

            <div className="hidden md:block">
              <SchoolSwitcher mode="header" />
            </div>

            <NotificationCenter />

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-9 h-9 text-muted-foreground hover:text-foreground"
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
        <main className="flex-1 overflow-auto px-4 pb-4 md:px-8 md:pb-8 pt-6">
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