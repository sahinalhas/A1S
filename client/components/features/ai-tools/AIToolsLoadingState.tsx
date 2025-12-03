import { LucideIcon } from 'lucide-react';
import { Brain } from 'lucide-react';

interface AIToolsLoadingStateProps {
 icon?: LucideIcon;
 message?: string;
}

export function AIToolsLoadingState({
 icon: Icon = Brain,
 message = 'Yükleniyor...',
}: AIToolsLoadingStateProps) {
 return (
 <div className="flex items-center justify-center min-h-[600px]">
 <div className="text-center">
 <Icon className="w-12 h-12 mx-auto mb-4 text-primary" />
 <p className="text-muted-foreground">{message}</p>
 </div>
 </div>
 );
}
