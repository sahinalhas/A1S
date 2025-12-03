import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MODERN_SHADOWS, ANIMATION_VARIANTS, STAGGER_DELAYS } from '@/lib/config/theme.config';

interface ModernCardProps {
 title: string;
 description?: string;
 children: React.ReactNode;
 icon?: LucideIcon;
 gradient?: string;
 shadow?: keyof typeof MODERN_SHADOWS;
 className?: string;
 headerClassName?: string;
 contentClassName?: string;
 delay?: number;
 onClick?: () => void;
}

export function ModernCard({
 title,
 description,
 children,
 icon: Icon,
 gradient,
 shadow = 'md',
 className,
 headerClassName,
 contentClassName,
 delay = 0,
 onClick,
}: ModernCardProps) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ 
 duration: 0.5, 
 delay,
 ease: [0.4, 0, 0.2, 1]
 }}
 whileHover={{ 
 y: -4,
 transition: { duration: 0.2 }
 }}
 >
 <Card 
 className={cn(
 'relative overflow-hidden card-modern group',
 'border border-border/50 backdrop-blur-sm',
 'transition-all duration-300',
 onClick && 'cursor-pointer hover:border-primary/50',
 className
 )}
 onClick={onClick}
 >
 {gradient && (
 <>
 <div className={cn('absolute inset-0 opacity-[0.08] group-hover:opacity-[0.12] transition-opacity duration-300', gradient)} />
 <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
 </>
 )}
 
 {/* Top accent line */}
 <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
 
 <CardHeader className={cn('relative', headerClassName)}>
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <CardTitle className="text-sm font-semibold flex items-center gap-2 group-hover:text-primary transition-colors duration-200">
 {Icon && <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />}
 <span className="gradient-text-on-hover">{title}</span>
 </CardTitle>
 {description && (
 <CardDescription className="mt-1 text-xs">
 {description}
 </CardDescription>
 )}
 </div>
 {Icon && gradient && (
 <motion.div 
 className={cn(
 'p-2.5 rounded-xl relative overflow-hidden',
 gradient,
 'bg-opacity-10 group-hover:bg-opacity-20',
 'transition-all duration-300'
 )}
 whileHover={{ rotate: 5, scale: 1.1 }}
 transition={{ type: "spring", stiffness: 400 }}
 >
 <Icon className="h-5 w-5 relative z-10 text-primary" />
 <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
 </motion.div>
 )}
 </div>
 </CardHeader>
 
 <CardContent className={cn('relative', contentClassName)}>
 {children}
 </CardContent>
 </Card>
 </motion.div>
 );
}
