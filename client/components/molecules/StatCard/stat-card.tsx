import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MODERN_SHADOWS, ANIMATION_VARIANTS } from '@/lib/config/theme.config';

interface StatCardProps {
 title: string;
 value: string | number;
 subtitle?: string;
 icon: LucideIcon;
 gradient: string;
 trend?: {
 value: string | number;
 isPositive?: boolean;
 };
 delay?: number;
 shadow?: keyof typeof MODERN_SHADOWS;
 onClick?: () => void;
 className?: string;
}

export function StatCard({
 title,
 value,
 subtitle,
 icon: Icon,
 gradient,
 trend,
 delay = 0,
 shadow = 'md',
 onClick,
 className,
}: StatCardProps) {
 return (
 <motion.div
 initial={ANIMATION_VARIANTS.fadeIn.initial}
 animate={ANIMATION_VARIANTS.fadeIn.animate}
 transition={{ delay }}
 >
 <Card 
 className={cn(
 'relative overflow-hidden',
 MODERN_SHADOWS[shadow],
 onClick && 'cursor-pointer',
 className
 )}
 onClick={onClick}
 >
 <div className={cn('absolute inset-0 opacity-5', gradient)} />
 
 <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
 <CardTitle className="text-sm font-medium text-muted-foreground">
 {title}
 </CardTitle>
 <div className={cn('p-2 rounded-lg bg-opacity-10', gradient)}>
 <Icon className="h-4 w-4" />
 </div>
 </CardHeader>
 
 <CardContent>
 <div className="text-2xl font-bold">{value}</div>
 
 {subtitle && (
 <p className="text-xs text-muted-foreground mt-1">
 {subtitle}
 </p>
 )}
 
 {trend && (
 <div className="flex items-center gap-1 mt-2">
 {trend.isPositive !== false ? (
 <TrendingUp className="h-3 w-3 text-green-600" />
 ) : (
 <TrendingDown className="h-3 w-3 text-red-600" />
 )}
 <span className={cn(
 'text-xs font-medium',
 trend.isPositive !== false ? 'text-green-600' : 'text-red-600'
 )}>
 {trend.value}
 </span>
 </div>
 )}
 </CardContent>
 </Card>
 </motion.div>
 );
}
