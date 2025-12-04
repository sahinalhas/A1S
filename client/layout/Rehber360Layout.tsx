import {
 Link,
 NavLink,
 Outlet,
 useLocation,
 useNavigate,
 Navigate,
} from "react-router-dom";
import { Button } from "@/components/atoms/Button";
import { Separator } from "@/components/atoms/Separator";
import { Avatar, AvatarFallback } from "@/components/atoms/Avatar";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/organisms/DropdownMenu";
import {
 Breadcrumb,
 BreadcrumbItem,
 BreadcrumbLink,
 BreadcrumbList,
 BreadcrumbPage,
 BreadcrumbSeparator,
} from "@/components/molecules/Breadcrumb";
import {
 Sun,
 Moon,
 Users2,
 CalendarDays,
 FileText,
 MessageSquare,
 BarChart3,
 Settings,
 Search,
 ClipboardList,
 LogOut,
 User,
 Bell,
 Home,
 Menu,
 X,
 PanelLeftClose,
 PanelLeftOpen,
 Lightbulb,
 BookOpen,
 Brain,
} from "lucide-react";
import { NotificationCenter } from "@/components/features/notifications";
import { Fragment, useEffect, useMemo, useState } from "react";
import { loadSettings, updateSettings, SETTINGS_KEY, AppSettings } from "@/lib/app-settings";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/core/client";
import { Input } from "@/components/atoms/Input";
import { Card } from "@/components/organisms/Card";
import { ScrollArea } from "@/components/organisms/ScrollArea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/organisms/Tooltip/tooltip";
import { useAuth } from "@/lib/auth-context";
import AIStatusIndicator from "@/components/features/common/AIStatusIndicator";
import { useIsMobile } from "@/hooks/utils/mobile.utils";
import { cn } from "@/lib/utils";
import { prefetchRoute } from "@/hooks/usePrefetchRoutes";
import GuidanceTipBalloon from "@/components/features/guidance-tips/GuidanceTipBalloon";
import { useGuidanceTipQueue } from "@/hooks/useGuidanceTipQueue";
import SchoolSwitcher from "@/components/features/school/SchoolSwitcher";

// 2025 Ultra Minimalist Logo
function AppLogo({ collapsed }: { collapsed?: boolean }) {
 return (
 <Link
 to="/"
 className={cn(
"flex items-center gap-3 px-3 py-4 group transition-all duration-300",
"hover:bg-accent/50 rounded-xl"
 )}
 >
 <div className={cn(
"size-9 rounded-xl bg-primary",
"flex items-center justify-center text-primary-foreground font-bold text-base",
"shrink-0 transition-all duration-300",
"shadow-sm group-hover:shadow"
 )}>
 R
 </div>

 <div className={cn(
"flex flex-col leading-none transition-all duration-300",
 collapsed ?"opacity-0 w-0" :"opacity-100 w-auto"
 )}>
 <span className="text-base font-semibold tracking-tight text-foreground whitespace-nowrap">
 Rehber360
 </span>
 <span className="text-[10px] text-muted-foreground mt-1 font-medium whitespace-nowrap">
 Dijital Rehberlik
 </span>
 </div>
 </Link>
 );
}

// Modern breadcrumb
function useBreadcrumbs() {
 const location = useLocation();
 const crumbs = useMemo(() => {
 const map: Record<string, string> = {
"": "Gösterge Paneli",
 ogrenci: "Öğrenci Portföyü",
 gorusmeler: "Görüşme & Randevu",
 anketler: "Ölçek & Anketler",
 raporlar: "Analiz & Raporlar",
"olcme-degerlendirme": "Sınav & Denemeler",
 ayarlar: "Profil & Ayarlar",
"ai-araclari": "AI Asistanım", // Raporlar sayfasından AI Analiz buraya taşındı
"icerik-yonetimi": "İçerik Kütüphanesi",
 };
 const parts = location.pathname.split("/").filter(Boolean);
 return parts.map((p, i) => ({
 key: p,
 label: map[p] || p,
 to: "/" + parts.slice(0, i + 1).join("/"),
 }));
 }, [location.pathname]);
 return crumbs;
}

// Modern navigation
const navigationItems = [
 { label: "Gösterge Paneli", icon: Home, to: "/", end: true },
 { label: "Öğrenci Portföyü", icon: Users2, to: "/ogrenci" },
 { label: "Görüşme & Randevu", icon: CalendarDays, to: "/gorusmeler" },
 {
  icon: Brain,
  label: 'AI Asistanım',
  to: '/ai-araclari',
  description: 'AI sohbet, toplu analiz, risk takip ve günlük planlama',
 },
 { label: "Analiz & Raporlar", icon: FileText, to: "/raporlar" },
 { label: "Sınav & Denemeler", icon: ClipboardList, to: "/olcme-degerlendirme" },
 { label: "Ölçek & Anketler", icon: MessageSquare, to: "/anketler" },
 { label: "İçerik Kütüphanesi", icon: BookOpen, to: "/icerik-yonetimi" },
 { label: "Profil & Ayarlar", icon: Settings, to: "/ayarlar" },
];

export default function Rehber360Layout() {
 const { isAuthenticated, isLoading, logout } = useAuth();
 const [dark, setDark] = useState(false);
 const [account, setAccount] = useState<AppSettings["account"] | undefined>(undefined);
 const [searchOpen, setSearchOpen] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const [sidebarOpen, setSidebarOpen] = useState(true);
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [showTipNotification, setShowTipNotification] = useState(false);
 const isMobile = useIsMobile();
 const crumbs = useBreadcrumbs();
 const navigate = useNavigate();
 const tipQueueStatus = useGuidanceTipQueue();

 const initials = useMemo(() => {
 const n = account?.displayName || "";
 const parts = n.trim().split(/\s+/).filter(Boolean);
 const first = parts[0]?.[0] || "K";
 const second = parts[1]?.[0] || "";
 return (first + second).toUpperCase();
 }, [account]);

 useEffect(() => {
 loadSettings().then(settings => {
 setDark(settings.theme === "dark");
 setAccount(settings.account);
 }).catch(err => {
 console.error('Failed to load settings:', err);
 });
 }, []);

 useEffect(() => {
 const root = document.documentElement;
 if (dark) root.classList.add("dark");
 else root.classList.remove("dark");
 }, [dark]);

 useEffect(() => {
 const onStorage = (e: StorageEvent) => {
 if (e.key === SETTINGS_KEY) {
 try {
 loadSettings().then(next => {
 setDark(next.theme === "dark");
 setAccount(next.account);
 });
 } catch {}
 }
 };
 window.addEventListener("storage", onStorage);
 return () => window.removeEventListener("storage", onStorage);
 }, []);

 const { data: searchResults, isLoading: isSearchLoading, error: searchError } = useQuery<{
 students: any[];
 counselingSessions: any[];
 surveys: any[];
 pages: any[];
 }>({
 queryKey: ['/api/search/global', searchQuery],
 queryFn: async () => {
 if (!searchQuery.trim() || searchQuery.length < 2) {
 return { students: [], counselingSessions: [], surveys: [], pages: [] };
 }
 return apiClient.get(`/api/search/global?q=${encodeURIComponent(searchQuery)}`, {
 showErrorToast: false
 });
 },
 enabled: searchQuery.length >= 2,
 });

 useEffect(() => {
 const onKey = (e: KeyboardEvent) => {
 if (e.key && e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
 e.preventDefault();
 setSearchOpen((v) => !v);
 if (!searchOpen) {
 setTimeout(() => {
 document.getElementById('header-search-input')?.focus();
 }, 100);
 }
 }
 if (e.key === "Escape" && searchOpen) {
 e.preventDefault();
 setSearchOpen(false);
 setSearchQuery("");
 }
 };
 window.addEventListener("keydown", onKey);
 return () => window.removeEventListener("keydown", onKey);
 }, [searchOpen]);

 const handleLogout = async () => {
 await logout();
 navigate('/login');
 };

 if (isLoading) {
 return (
 <div className="flex items-center justify-center h-screen bg-background">
 <div className="text-center space-y-4">
 <div className=" rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
 <p className="text-muted-foreground">Yükleniyor...</p>
 </div>
 </div>
 );
 }

 if (!isAuthenticated) {
 return <Navigate to="/login" replace />;
 }

 return (
 <div className="flex h-screen overflow-hidden bg-background">
 {/* Desktop Sidebar */}
 {!isMobile && (
 <aside
 className={cn(
"flex flex-col border-r bg-sidebar ease-in-out relative overflow-hidden",
"",
 sidebarOpen ?"w-60" :"w-16"
 )}
 >
 {/* Sidebar gradient background */}
 <div className="absolute inset-0 bg-gradient-to-b from-sidebar via-sidebar to-sidebar-background opacity-90" />
 <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-chart-2/5 opacity-30" />

 {/* Header section */}
 <div className="relative h-16 flex items-center justify-between px-3 border-b border-sidebar-border/50 bg-sidebar/80">
 {sidebarOpen && <AppLogo collapsed={false} />}
 <TooltipProvider>
 <Tooltip>
 <TooltipTrigger asChild>
 <Button
 variant="ghost"
 size="icon"
 onClick={() => setSidebarOpen(!sidebarOpen)}
 className={cn(
"shrink-0",
""
 )}
 >
 <PanelLeftClose className={cn(
"h-4 w-4",
 sidebarOpen ?"rotate-0" :"rotate-180"
 )} />
 </Button>
 </TooltipTrigger>
 {!sidebarOpen && (
 <TooltipContent side="right" className="bg-sidebar border-sidebar-border">
 <p className="text-sidebar-foreground text-xs">Kenar çubuğunu aç</p>
 </TooltipContent>
 )}
 </Tooltip>
 </TooltipProvider>
 </div>

 {/* Navigation section */}
 <ScrollArea className="relative flex-1 px-3 py-4">
 <TooltipProvider>
 <nav className={cn(
"space-y-1",
 !sidebarOpen &&"space-y-1"
 )}>
 {navigationItems.map((item, index) => (
 <Tooltip key={item.to} delayDuration={sidebarOpen ? 0 : 100}>
 <TooltipTrigger asChild>
 <NavLink
 to={item.to}
 end={item.end}
 onMouseEnter={() => prefetchRoute(item.to)}
 className={({ isActive }) => cn(
"group flex items-center gap-3 px-3 py-2 rounded-lg",
"",
"text-xs font-medium text-sidebar-foreground/70",
"relative",
 isActive &&"bg-sidebar-accent text-sidebar-accent-foreground",
 !sidebarOpen &&"justify-center px-2 py-2.5",
""
 )}
 style={{ animationDelay: `${index * 30}ms` }}
 >
 {/* Active indicator */}
 <div className={cn(
"absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full",
"bg-gradient-to-b from-primary to-chart-2",
"opacity-0 group-",
 !sidebarOpen &&"left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
 )}/>

 <item.icon className={cn(
"shrink-0",
 sidebarOpen ?"h-4 w-4" :"h-5 w-5",
"group- group-"
 )} />

 <span className={cn(
"truncate whitespace-nowrap overflow-hidden",
 sidebarOpen ?"opacity-100 w-auto delay-75" :"opacity-0 w-0"
 )}>
 {item.label}
 </span>
 </NavLink>
 </TooltipTrigger>
 {!sidebarOpen && (
 <TooltipContent side="right" className="bg-sidebar border-sidebar-border">
 <p className="text-sidebar-foreground text-xs font-medium">{item.label}</p>
 </TooltipContent>
 )}
 </Tooltip>
 ))}
 </nav>
 </TooltipProvider>
 </ScrollArea>

 {/* School Switcher */}
 <div className="relative border-t border-sidebar-border/50 px-3 py-3 bg-sidebar/80">
 <SchoolSwitcher collapsed={!sidebarOpen} />
 </div>

 {/* Footer section */}
 <div className="relative border-t border-sidebar-border/50 px-3 py-4 bg-sidebar/80">
 <AIStatusIndicator collapsed={!sidebarOpen} />
 </div>
 </aside>
 )}

 {/* Mobile Menu */}
 {isMobile && mobileMenuOpen && (
 <div className="fixed inset-0 z-50 bg-background/95">
 {/* Mobile overlay with gradient */}
 <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-sidebar/90 to-sidebar-background" />

 <div className="relative flex h-full flex-col">
 {/* Mobile header */}
 <div className="relative flex items-center justify-between border-b border-sidebar-border/50 px-4 py-3 bg-sidebar/80">
 <AppLogo />
 <Button
 variant="ghost"
 size="icon"
 className=""
 onClick={() => setMobileMenuOpen(false)}
 >
 <X className="h-4 w-4" />
 </Button>
 </div>

 {/* Mobile navigation */}
 <ScrollArea className="relative flex-1 p-4">
 <nav className="space-y-1">
 {navigationItems.map((item, index) => (
 <NavLink
 key={item.to}
 to={item.to}
 end={item.end}
 onClick={() => setMobileMenuOpen(false)}
 onMouseEnter={() => prefetchRoute(item.to)}
 style={{ animationDelay: `${index * 30}ms` }}
 >
 {( { isActive }) => (
 <div className={cn(
"group flex items-center gap-3 px-3 py-2.5 rounded-lg",
"",
"text-xs font-medium text-sidebar-foreground/70",
"relative",
 isActive &&"bg-sidebar-accent text-sidebar-accent-foreground",
""
 )}>
 {/* Active indicator */}
 <div className={cn(
"absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full",
"bg-gradient-to-b from-primary to-chart-2",
 isActive ?"opacity-100" :"opacity-0 group-"
 )}/>

 <item.icon className={cn(
"h-4 w-4 shrink-0",
"group- group-"
 )}/>

 <span className="truncate whitespace-nowrap">
 {item.label}
 </span>
 </div>
 )}
 </NavLink>
 ))}
 </nav>
 </ScrollArea>

 {/* Mobile school switcher */}
 <div className="relative border-t border-sidebar-border/50 p-4 bg-sidebar/80">
 <SchoolSwitcher collapsed={false} />
 </div>

 {/* Mobile footer */}
 <div className="relative border-t border-sidebar-border/50 p-4 bg-sidebar/80">
 <AIStatusIndicator />
 </div>
 </div>
 </div>
 )}

 {/* Main Content */}
 <div className="flex flex-1 flex-col overflow-hidden">
 <header className="sticky top-0 z-40 border-b border-border/30 bg-background/95 supports-[backdrop-filter]:bg-background/70">
 <div className="flex h-10 items-center gap-2 px-3 md:px-5">
 {isMobile && (
 <Button
 variant="ghost"
 size="icon"
 className="shrink-0 h-7 w-7"
 onClick={() => setMobileMenuOpen(true)}
 >
 <Menu className="h-3.5 w-3.5" />
 </Button>
 )}

 <div className="ml-auto flex items-center gap-1">
 {!searchOpen ? (
 <Button
 variant="ghost"
 size="icon"
 className="h-7 w-7"
 onClick={() => {
 setSearchOpen(true);
 setTimeout(() => {
 document.getElementById('header-search-input')?.focus();
 }, 100);
 }}
 >
 <Search className="h-3.5 w-3.5" />
 </Button>
 ) : (
 <div className="relative w-[260px] fade-in slide-in-from-right-2">
 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
 <Input
 id="header-search-input"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Ara... (⌘K)"
 className="h-7 pl-8 pr-2.5 text-[11px] border-border/30 focus-visible:ring-1 focus-visible:ring-primary/15 rounded-md"
 onBlur={() => {
 setTimeout(() => {
 setSearchOpen(false);
 setSearchQuery("");
 }, 50);
 }}
 />
 {searchQuery && searchQuery.length >= 2 && (
 <Card className="absolute top-9 w-full max-h-[380px] overflow-hidden border-border/30 z-50 fade-in slide-in-from-top-2">
 <ScrollArea className="h-full max-h-[400px]">
 {isSearchLoading && (
 <div className="p-4 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
 Aranıyor...
 </div>
 )}
 {searchError && (
 <div className="p-4 text-sm text-destructive text-center">
 Arama sırasında bir hata oluştu
 </div>
 )}
 {!isSearchLoading && !searchError && searchResults && (
 <>
 {searchResults.students.length > 0 && (
 <div className="p-2">
 <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
 Öğrenciler
 </div>
 {searchResults.students.map((student) => (
 <button
 key={student.id}
 onMouseDown={() => {
 navigate(`/ogrenci/${student.id}`);
 setSearchOpen(false);
 setSearchQuery("");
 }}
 className="w-full flex items-center gap-2 px-2 py-2 rounded text-left hover:bg-accent"
 >
 <Users2 className="h-4 w-4 text-muted-foreground" />
 <div className="flex-1 text-sm">
 <div>{student.name} {student.surname}</div>
 {student.class && (
 <div className="text-xs text-muted-foreground">{student.class}</div>
 )}
 </div>
 </button>
 ))}
 </div>
 )}
 {searchResults.counselingSessions?.length > 0 && (
 <div className="p-2">
 <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
 Görüşmeler
 </div>
 {searchResults.counselingSessions.map((session) => (
 <button
 key={session.id}
 onMouseDown={() => {
 navigate(`/gorusmeler`);
 setSearchOpen(false);
 setSearchQuery("");
 }}
 className="w-full flex items-center gap-2 px-2 py-2 rounded text-left hover:bg-accent"
 >
 <MessageSquare className="h-4 w-4 text-muted-foreground" />
 <div className="flex-1 text-sm">
 <div>{session.title}</div>
 {session.studentNames && (
 <div className="text-xs text-muted-foreground">{session.studentNames}</div>
 )}
 </div>
 </button>
 ))}
 </div>
 )}
 {searchResults.surveys?.length > 0 && (
 <div className="p-2">
 <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
 Anketler
 </div>
 {searchResults.surveys.map((survey) => (
 <button
 key={survey.id}
 onMouseDown={() => {
 navigate(`/anketler`);
 setSearchOpen(false);
 setSearchQuery("");
 }}
 className="w-full flex items-center gap-2 px-2 py-2 rounded text-left hover:bg-accent"
 >
 <FileText className="h-4 w-4 text-muted-foreground" />
 <div className="text-sm">{survey.title}</div>
 </button>
 ))}
 </div>
 )}
 {searchResults.pages?.length > 0 && (
 <div className="p-2">
 <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
 Sayfalar
 </div>
 {searchResults.pages.map((page) => (
 <button
 key={page.path}
 onMouseDown={() => {
 navigate(page.path);
 setSearchOpen(false);
 setSearchQuery("");
 }}
 className="w-full flex items-center gap-2 px-2 py-2 rounded text-left hover:bg-accent"
 >
 <Search className="h-4 w-4 text-muted-foreground" />
 <div className="text-sm">{page.label}</div>
 </button>
 ))}
 </div>
 )}
 {searchResults.students.length === 0 &&
 searchResults.counselingSessions?.length === 0 &&
 searchResults.surveys?.length === 0 &&
 searchResults.pages?.length === 0 && (
 <div className="p-4 text-sm text-muted-foreground text-center">
 Sonuç bulunamadı
 </div>
 )}
 </>
 )}
 </ScrollArea>
 </Card>
 )}
 </div>
 )}

 <Button
 variant="ghost"
 size="icon"
 className="h-7 w-7"
 onClick={() =>
 setDark((v) => {
 const next = !v;
 updateSettings({ theme: next ?"dark" :"light" });
 return next;
 })
 }
 >
 {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
 </Button>

 <NotificationCenter />

 <Button
 variant="ghost"
 size="icon"
 className="h-7 w-7 relative"
 onClick={() => setShowTipNotification(true)}
 title={tipQueueStatus.hasQueue ? `${tipQueueStatus.remainingTips} bilgi pakette` : "Rehberlik İpuçlarını Göster"}
 >
 <Lightbulb className="h-3.5 w-3.5" />
 {tipQueueStatus.hasQueue && tipQueueStatus.remainingTips > 0 && (
 <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
 {tipQueueStatus.remainingTips > 99 ? '99+' : tipQueueStatus.remainingTips}
 </span>
 )}
 </Button>

 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="rounded-full h-7 w-7">
 <Avatar className="h-6 w-6">
 <AvatarFallback className="text-[10px] font-semibold">
 {initials}
 </AvatarFallback>
 </Avatar>
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-48">
 <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
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
 </div>
 </div>
 </header>

 <main className="flex-1 overflow-auto bg-background">
 <div className={cn(
"w-full py-3 md:py-3 mx-auto",
"px-2 md:px-3"
 )}>
 <Outlet />
 </div>
 </main>
 </div>

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