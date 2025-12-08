import {
 Link,
 Outlet,
 Navigate,
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
} from "lucide-react";
import { NotificationCenter } from "@/components/features/notifications";
import { useEffect, useMemo, useState } from "react";
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

// Modern navigation with submenus
const navigationItems = [
 { 
   label: "Gösterge Paneli", 
   icon: Home, 
   to: "/", 
   end: true,
   subItems: [
     { label: "Genel Bakış", to: "/" },
     { label: "İstatistikler", to: "/?tab=stats" },
     { label: "Hızlı Erişim", to: "/?tab=quick" },
   ]
 },
 { 
   label: "Öğrenci Yönetimi", 
   icon: Users2, 
   to: "/ogrenci",
   subItems: [
     { label: "Öğrenci Listesi", to: "/ogrenci" },
     { label: "Yeni Öğrenci", to: "/ogrenci?action=new" },
     { label: "Sınıflar", to: "/ogrenci?tab=classes" },
   ]
 },
 { 
   label: "Görüşme & Randevu", 
   icon: CalendarDays, 
   to: "/gorusmeler",
   subItems: [
     { label: "Tüm Görüşmeler", to: "/gorusmeler" },
     { label: "Takvim", to: "/gorusmeler?view=calendar" },
     { label: "Yeni Randevu", to: "/gorusmeler?action=new" },
     { label: "Bekleyen", to: "/gorusmeler?status=pending" },
   ]
 },
 {
   icon: Brain,
   label: 'AI Asistanım',
   to: '/ai-araclari',
   subItems: [
     { label: "AI Sohbet", to: "/ai-araclari" },
     { label: "Toplu Analiz", to: "/ai-araclari?tab=batch" },
     { label: "Risk Takip", to: "/ai-araclari?tab=risk" },
     { label: "Günlük Plan", to: "/ai-araclari?tab=daily" },
   ]
 },
 { 
   label: "Analiz & Raporlar", 
   icon: FileText, 
   to: "/raporlar",
   subItems: [
     { label: "Genel Raporlar", to: "/raporlar" },
     { label: "Öğrenci Raporları", to: "/raporlar?type=student" },
     { label: "İstatistikler", to: "/raporlar?type=stats" },
   ]
 },
 { 
   label: "Sınav & Denemeler", 
   icon: ClipboardList, 
   to: "/olcme-degerlendirme",
   subItems: [
     { label: "Genel Bakış", to: "/olcme-degerlendirme?tab=overview" },
     { label: "Denemeler", to: "/olcme-degerlendirme?tab=practice-exams" },
     { label: "Okul Sınavları", to: "/olcme-degerlendirme?tab=school-exams" },
     { label: "Analizler", to: "/olcme-degerlendirme?tab=analysis" },
     { label: "Gelişmiş Analitik", to: "/olcme-degerlendirme?tab=advanced" },
     { label: "Öğrenci Panosu", to: "/olcme-degerlendirme?tab=student-dashboard" },
   ]
 },
 { 
   label: "Ölçek & Anketler", 
   icon: MessageSquare, 
   to: "/anketler",
   subItems: [
     { label: "Aktif Anketler", to: "/anketler" },
     { label: "Şablonlar", to: "/anketler?tab=templates" },
     { label: "Sonuçlar", to: "/anketler?tab=results" },
   ]
 },
 { 
   label: "İçerik Kütüphanesi", 
   icon: BookOpen, 
   to: "/icerik-yonetimi",
   subItems: [
     { label: "Tüm İçerikler", to: "/icerik-yonetimi" },
     { label: "Kategoriler", to: "/icerik-yonetimi?tab=categories" },
   ]
 },
 { 
   label: "Profil & Ayarlar", 
   icon: Settings, 
   to: "/ayarlar",
   subItems: [
     { label: "Hesap Ayarları", to: "/ayarlar" },
     { label: "Bildirimler", to: "/ayarlar?tab=notifications" },
     { label: "Tema", to: "/ayarlar?tab=theme" },
   ]
 },
];

export default function Rehber360Layout() {
 const { isAuthenticated, isLoading } = useAuth();
 const [dark, setDark] = useState(false);
 const [account, setAccount] = useState<AppSettings["account"] | undefined>(undefined);
 const [sidebarOpen, setSidebarOpen] = useState(true);
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [showTipNotification, setShowTipNotification] = useState(false);
 const [openMenuItem, setOpenMenuItem] = useState<string | null>(null);
 const isMobile = useIsMobile();
 const tipQueueStatus = useGuidanceTipQueue();

 const handleMenuToggle = (to: string) => {
   setOpenMenuItem(openMenuItem === to ? null : to);
 };

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

 {/* Header section with Logo */}
 <div className="relative h-14 flex items-center justify-between px-3 border-b border-sidebar-border/50 bg-sidebar/80">
 {sidebarOpen && <AppLogo collapsed={false} />}
 <TooltipProvider>
 <Tooltip>
 <TooltipTrigger asChild>
 <Button
 variant="ghost"
 size="icon"
 onClick={() => setSidebarOpen(!sidebarOpen)}
 className="shrink-0 h-8 w-8"
 >
 <PanelLeftClose className={cn(
"h-4 w-4 transition-transform duration-200",
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

 {/* Search section */}
 <div className="relative px-3 py-3 border-b border-sidebar-border/30">
 <SidebarSearch collapsed={!sidebarOpen} />
 </div>

 {/* Navigation section with Collapsible Menus */}
 <ScrollArea className="relative flex-1 px-3 py-3">
 <div className="mb-2">
 {sidebarOpen && (
   <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
     Ana Menü
   </span>
 )}
 </div>
 <nav className="space-y-0.5">
 {navigationItems.map((item) => (
   <CollapsibleMenuItem
     key={item.to}
     icon={item.icon}
     label={item.label}
     to={item.to}
     end={item.end}
     subItems={item.subItems}
     collapsed={!sidebarOpen}
     isOpen={openMenuItem === item.to}
     onToggle={handleMenuToggle}
   />
 ))}
 </nav>
 </ScrollArea>

 {/* School Switcher */}
 <div className="relative border-t border-sidebar-border/50 px-3 py-2 bg-sidebar/80">
 <SchoolSwitcher collapsed={!sidebarOpen} />
 </div>

 {/* AI Status */}
 <div className="relative border-t border-sidebar-border/50 px-3 py-2 bg-sidebar/80">
 <AIStatusIndicator collapsed={!sidebarOpen} />
 </div>

 {/* User Profile Footer */}
 <div className="relative border-t border-sidebar-border/50 px-3 py-2 bg-sidebar/80">
 <SidebarUserProfile 
   collapsed={!sidebarOpen} 
   displayName={account?.displayName}
 />
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
 className="h-8 w-8"
 onClick={() => setMobileMenuOpen(false)}
 >
 <X className="h-4 w-4" />
 </Button>
 </div>

 {/* Mobile search */}
 <div className="relative px-4 py-3 border-b border-sidebar-border/30">
 <SidebarSearch collapsed={false} />
 </div>

 {/* Mobile navigation with Collapsible Menus */}
 <div className="relative flex-1 overflow-y-auto overflow-x-hidden p-4">
 <div className="mb-2">
   <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
     Ana Menü
   </span>
 </div>
 <nav className="space-y-0.5">
 {navigationItems.map((item) => (
   <CollapsibleMenuItem
     key={item.to}
     icon={item.icon}
     label={item.label}
     to={item.to}
     end={item.end}
     subItems={item.subItems}
     collapsed={false}
     isOpen={openMenuItem === item.to}
     onToggle={handleMenuToggle}
     onNavigate={() => setMobileMenuOpen(false)}
   />
 ))}
 </nav>
 </div>

 {/* Mobile school switcher */}
 <div className="relative border-t border-sidebar-border/50 p-3 bg-sidebar/80">
 <SchoolSwitcher collapsed={false} />
 </div>

 {/* Mobile AI Status */}
 <div className="relative border-t border-sidebar-border/50 p-3 bg-sidebar/80">
 <AIStatusIndicator />
 </div>

 {/* Mobile User Profile */}
 <div className="relative border-t border-sidebar-border/50 p-3 bg-sidebar/80">
 <SidebarUserProfile 
   collapsed={false} 
   displayName={account?.displayName}
 />
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