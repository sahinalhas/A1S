import { useState, useEffect } from 'react';

const SIDEBAR_STATE_KEY = 'rehber360_sidebar_collapsed';

export function useSidebarState() {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        // İlk yükleme - localStorage'dan oku
        const stored = localStorage.getItem(SIDEBAR_STATE_KEY);
        if (stored !== null) {
            return stored === 'true';
        }
        // Varsayılan: ekran boyutuna göre
        return window.innerWidth >= 1280;
    });

    // Sidebar durumu değiştiğinde localStorage'a kaydet
    useEffect(() => {
        localStorage.setItem(SIDEBAR_STATE_KEY, String(sidebarOpen));
    }, [sidebarOpen]);

    return { sidebarOpen, setSidebarOpen };
}
