import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ANIMATION_VARIANTS } from '@/lib/config/theme.config';

interface PageHeaderProps {
 title: string;
 subtitle?: string;
 icon?: LucideIcon;
 badge?: React.ReactNode;
 actions?: React.ReactNode;
 className?: string;
 animate?: boolean;
}

export function PageHeader({
 title,
 subtitle,
 icon: Icon,
 badge,
 actions,
 className,
 animate = true,
}: PageHeaderProps) {
 const HeaderWrapper = animate ? motion.div : 'div';
 const animationProps = animate
 ? {
 initial: ANIMATION_VARIANTS.fadeInUp.initial,
 animate: ANIMATION_VARIANTS.fadeInUp.animate,
 transition: { duration: 0.5 },
 }
 : {};

 return (
 <HeaderWrapper
 {...animationProps}
 className={cn(
 'flex items-center justify-between flex-wrap gap-4',
 className
 )}
 >
 <div className="flex items-start gap-4">
 {Icon && (
 <div className="p-3 rounded-md bg-primary/10 text-primary">
 <Icon className="h-6 w-6" />
 </div>
 )}
 <div>
 <div className="flex items-center gap-3">
 <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
 {badge}
 </div>
 {subtitle && (
 <p className="text-base text-muted-foreground mt-2">{subtitle}</p>
 )}
 </div>
 </div>
 
 {actions && (
 <div className="flex gap-2 flex-wrap">
 {actions}
 </div>
 )}
 </HeaderWrapper>
 );
}
