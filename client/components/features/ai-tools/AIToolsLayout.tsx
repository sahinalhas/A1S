import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface AIToolsLayoutProps {
 title: string;
 description?: string;
 icon?: LucideIcon;
 actions?: ReactNode;
 children: ReactNode;
}

export function AIToolsLayout({
 title,
 description,
 icon: Icon,
 actions,
 children,
}: AIToolsLayoutProps) {
 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between gap-4">
 <div>
 <h2 className="text-2xl font-bold flex items-center gap-2">
 {Icon && <Icon className="h-6 w-6 text-primary" />}
 {title}
 </h2>
 {description && (
 <p className="text-muted-foreground mt-1">{description}</p>
 )}
 </div>
 {actions && <div className="flex items-center gap-2">{actions}</div>}
 </div>
 <div>{children}</div>
 </div>
 );
}
