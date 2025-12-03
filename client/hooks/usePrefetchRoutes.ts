import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const prefetchMap: Record<string, () => Promise<any>> = {
 '/ogrenci': () => import('@/pages/Students'),
 '/ogrenci/:id': () => import('@/pages/StudentProfile/StudentProfile'),
 '/gorusmeler': () => import('@/pages/CounselingSessions'),
 '/raporlar': () => import('@/pages/Reports'),
 '/anketler': () => import('@/pages/Surveys'),
 '/olcme-degerlendirme': () => import('@/pages/ExamManagementPage'),
 '/ayarlar': () => import('@/pages/Settings'),
 '/ai-araclari': () => import('@/pages/AIToolsPage'),
 '/bildirimler': () => import('@/pages/Notifications'),
};

const prefetchedRoutes = new Set<string>();

export function usePrefetchRoutes() {
 const location = useLocation();

 useEffect(() => {
 const currentPath = location.pathname;
 
 // Prefetch commonly accessed routes based on current location
 const routesToPrefetch: string[] = [];

 if (currentPath === '/') {
 routesToPrefetch.push('/ogrenci', '/raporlar', '/ai-araclari');
 } else if (currentPath === '/ogrenci') {
 routesToPrefetch.push('/ogrenci/:id', '/raporlar', '/gorusmeler');
 } else if (currentPath.startsWith('/ogrenci/')) {
 routesToPrefetch.push('/gorusmeler', '/raporlar', '/ai-araclari');
 } else if (currentPath === '/gorusmeler') {
 routesToPrefetch.push('/ogrenci', '/raporlar');
 } else if (currentPath === '/raporlar') {
 routesToPrefetch.push('/ogrenci', '/ai-araclari');
 }

 // Prefetch routes with a small delay to not block the main thread
 const timeout = setTimeout(() => {
 routesToPrefetch.forEach((route) => {
 if (!prefetchedRoutes.has(route) && prefetchMap[route]) {
 prefetchMap[route]()
 .then(() => {
 prefetchedRoutes.add(route);
 })
 .catch(() => {
 // Silently ignore prefetch errors
 });
 }
 });
 }, 100);

 return () => clearTimeout(timeout);
 }, [location.pathname]);
}

// Export a function to manually prefetch a route (for hover prefetching)
export function prefetchRoute(path: string) {
 const normalizedPath = path.split('?')[0]; // Remove query params
 
 // Find the matching route pattern
 let routeKey = normalizedPath;
 if (normalizedPath.match(/^\/ogrenci\/\d+/)) {
 routeKey = '/ogrenci/:id';
 }
 
 if (prefetchedRoutes.has(routeKey)) {
 return Promise.resolve();
 }
 
 const prefetchFn = prefetchMap[routeKey];
 if (prefetchFn) {
 return prefetchFn()
 .then(() => {
 prefetchedRoutes.add(routeKey);
 })
 .catch(() => {
 // Silently ignore prefetch errors
 });
 }
 
 return Promise.resolve();
}
