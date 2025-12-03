import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/organisms/Card';
import { cn } from '@/lib/utils';
import { ANIMATION_VARIANTS, STAGGER_DELAYS } from '@/lib/config/theme.config';

interface StatsGridProps {
 children: React.ReactNode;
 columns?: 2 | 3 | 4;
 className?: string;
 animate?: boolean;
}

export function StatsGrid({
 children,
 columns = 4,
 className,
 animate = true,
}: StatsGridProps) {
 const gridClasses = {
 2: 'md:grid-cols-2',
 3: 'md:grid-cols-2 lg:grid-cols-3',
 4: 'md:grid-cols-2 lg:grid-cols-4',
 };

 const GridWrapper = animate ? motion.div : 'div';
 const animationProps = animate
 ? {
 initial: 'initial',
 animate: 'animate',
 variants: ANIMATION_VARIANTS.staggerContainer,
 }
 : {};

 return (
 <GridWrapper
 {...animationProps}
 className={cn(
 'grid gap-4',
 gridClasses[columns],
 className
 )}
 >
 {children}
 </GridWrapper>
 );
}

interface SkeletonCardProps {
 index?: number;
}

export function SkeletonCard({ index = 0 }: SkeletonCardProps) {
 return (
 <motion.div
 initial={ANIMATION_VARIANTS.fadeIn.initial}
 animate={ANIMATION_VARIANTS.fadeIn.animate}
 transition={{ delay: index * STAGGER_DELAYS.normal }}
 >
 <Card>
 <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
 <div className="h-4 w-24 bg-muted rounded" />
 <div className="h-8 w-8 bg-muted rounded-lg" />
 </CardHeader>
 <CardContent>
 <div className="h-8 w-16 bg-muted rounded mb-2" />
 <div className="h-3 w-32 bg-muted rounded" />
 </CardContent>
 </Card>
 </motion.div>
 );
}
