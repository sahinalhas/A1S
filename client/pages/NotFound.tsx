import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        // Only log 404 errors in development environment
        if (import.meta.env.DEV) {
            console.warn(
                "404 Error: User attempted to access non-existent route:",
                location.pathname,
            );
        }
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
            <div className="text-center space-y-6 p-8">
                <div className="inline-flex p-6 rounded-full bg-primary/10 mb-4">
                    <h1 className="text-6xl font-bold text-primary">404</h1>
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Sayfa Bulunamadı</h2>
                <p className="text-muted-foreground max-w-md">
                    Aradığınız sayfa mevcut değil veya taşınmış olabilir.
                </p>
                <a
                    href="/"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    Ana Sayfaya Dön
                </a>
            </div>
        </div>
    );
};

export default NotFound;
