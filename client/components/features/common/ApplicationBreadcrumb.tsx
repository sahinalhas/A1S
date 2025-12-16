import { useLocation, Link } from 'react-router-dom';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';
import React from 'react';

// Map of path segments to friendly names
const ROUTE_NAMES: Record<string, string> = {
    'ogrenci': 'Öğrenci Yönetimi',
    'gorusmeler': 'Görüşme & Randevu',
    'ai-araclari': 'AI Asistanım',
    'raporlar': 'Analiz & Raporlar',
    'olcme-degerlendirme': 'Sınav & Denemeler',
    'anketler': 'Ölçek & Anketler',
    'icerik-yonetimi': 'İçerik Kütüphanesi',
    'ayarlar': 'Ayarlar',
};

// Map for dynamic ID handling or specific sub-routes if needed
const CUSTOM_ROUTE_HANDLERS: Record<string, (id: string) => string> = {
    // Example: If we had 'classes' -> '10-A' etc.
};

export function ApplicationBreadcrumb() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Don't show on dashboard home
    if (pathnames.length === 0) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground/80">
                <Home className="h-4 w-4" />
                <span className="text-sm font-medium">Gösterge Paneli</span>
            </div>
        );
    }

    return (
        <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/" className="flex items-center hover:text-primary transition-colors">
                            <Home className="h-4 w-4" />
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />

                {pathnames.map((value, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;

                    // Friendly name resolution
                    let displayName = ROUTE_NAMES[value] || value;

                    // Basic capitalization for unknown segments (like IDs or new routes)
                    if (!ROUTE_NAMES[value]) {
                        // If it looks like a uuid, maybe say "Detay"
                        if (value.match(/^[0-9a-fA-F-]{36}$/)) {
                            displayName = "Detay";
                        } else {
                            displayName = value.charAt(0).toUpperCase() + value.slice(1);
                        }
                    }

                    return (
                        <React.Fragment key={to}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage className="font-semibold text-foreground">
                                        {displayName}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={to} className="hover:text-primary transition-colors">
                                            {displayName}
                                        </Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
