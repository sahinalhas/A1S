import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/atoms/Badge';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';

interface AIStatusIndicatorProps {
 className?: string;
 collapsed?: boolean;
}

export default function AIStatusIndicator({ className, collapsed = false }: AIStatusIndicatorProps) {
 const { data: status, isLoading, error } = useQuery({
 queryKey: ['ai-status'],
 queryFn: async () => {
 const response = await fetchWithSchool('/api/ai/status');
 if (!response.ok) throw new Error('Failed to fetch AI status');
 return response.json();
 },
 refetchInterval: 30000,
 });

 // Sarı - Bağlantı kontrol ediliyor
 if (isLoading) {
 return (
 <Badge variant="outline" className={cn("gap-1.5 border-yellow-500 bg-yellow-50 text-yellow-700", className)}>
 <Brain className="h-3 w-3 shrink-0" />
 {!collapsed && (
 <span className="hidden md:inline whitespace-nowrap overflow-hidden delay-150">
 Kontrol ediliyor...
 </span>
 )}
 </Badge>
 );
 }

 // Kırmızı - AI devre dışı veya hata var
 if (error || !status?.isActive) {
 return (
 <Badge variant="destructive" className={cn("gap-1.5", className)}>
 <Brain className="h-3 w-3 shrink-0 opacity-50" />
 {!collapsed && (
 <span className="hidden md:inline whitespace-nowrap overflow-hidden delay-150">
 AI Devre Dışı
 </span>
 )}
 </Badge>
 );
 }

 // Yeşil - AI aktif ve sağlıklı
 return (
 <Badge
 className={cn("gap-1.5 border-green-500 bg-green-50 text-green-700", className)}
 >
 <Brain className="h-3 w-3 shrink-0" />
 {!collapsed && (
 <span className="hidden md:inline whitespace-nowrap overflow-hidden delay-150">
 AI: {status.providerName || status.provider || 'Aktif'}
 </span>
 )}
 </Badge>
 );
}