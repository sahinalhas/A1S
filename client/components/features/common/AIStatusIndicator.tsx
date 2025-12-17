import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/atoms/Badge';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/organisms/Tooltip/tooltip';

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

    // Collapsed mod - sadece icon
    if (collapsed) {
        const isActive = !error && status?.isActive;
        const tooltipText = isLoading
            ? "AI: Kontrol ediliyor..."
            : isActive
                ? `AI: ${status?.providerName || 'Aktif'}`
                : "AI: Devre Dışı";

        return (
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted",
                            className
                        )}>
                            <Brain className="h-5 w-5" strokeWidth={2} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                        {tooltipText}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    // Expanded mod - badge
    if (isLoading) {
        return (
            <Badge variant="outline" className={cn("gap-1.5 border-yellow-500 bg-yellow-50 text-yellow-700", className)}>
                <Brain className="h-3 w-3 shrink-0" />
                <span className="hidden md:inline whitespace-nowrap overflow-hidden delay-150">
                    Kontrol ediliyor...
                </span>
            </Badge>
        );
    }

    if (error || !status?.isActive) {
        return (
            <Badge variant="destructive" className={cn("gap-1.5", className)}>
                <Brain className="h-3 w-3 shrink-0 opacity-50" />
                <span className="hidden md:inline whitespace-nowrap overflow-hidden delay-150">
                    AI Devre Dışı
                </span>
            </Badge>
        );
    }

    return (
        <Badge
            className={cn("gap-1.5 border-green-500 bg-green-50 text-green-700", className)}
        >
            <Brain className="h-3 w-3 shrink-0" />
            <span className="hidden md:inline whitespace-nowrap overflow-hidden delay-150">
                AI: {status.providerName || status.provider || 'Aktif'}
            </span>
        </Badge>
    );
}