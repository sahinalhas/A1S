import { Skeleton } from "@/components/atoms/Skeleton";
import { cn } from "@/lib/utils";

interface EnhancedSkeletonProps {
 className?: string;
 variant?:"default" |"shimmer" |"pulse" |"wave";
 lines?: number;
 rounded?:"sm" |"md" |"lg" |"full";
}

export function EnhancedSkeleton({
 className,
 variant ="shimmer",
 lines = 1,
 rounded ="md",
}: EnhancedSkeletonProps) {
 const roundedClass = {
 sm:"rounded-sm",
 md:"rounded-md",
 lg:"rounded-lg",
 full:"rounded-full",
 }[rounded];

 const variantClass = {
 default:"",
 shimmer:"shimmer-effect",
 pulse:"",
 wave:"shimmer-effect",
 }[variant];

 if (lines === 1) {
 return (
 <div
 className={cn(
"bg-muted",
 roundedClass,
 variantClass,
 className
 )}
 />
 );
 }

 return (
 <div className="space-y-2">
 {Array.from({ length: lines }).map((_, i) => (
 <div
 key={i}
 className={cn(
"bg-muted h-4",
 roundedClass,
 variantClass,
 i === lines - 1 &&"w-3/4",
 className
 )}
 />
 ))}
 </div>
 );
}

export function EnhancedSkeletonCard({ className }: { className?: string }) {
 return (
 <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
 <div className="flex items-start justify-between">
 <div className="space-y-2 flex-1">
 <EnhancedSkeleton variant="shimmer" className="h-5 w-1/3" />
 <EnhancedSkeleton variant="shimmer" className="h-4 w-2/3" />
 </div>
 <EnhancedSkeleton variant="shimmer" className="h-10 w-10" rounded="lg" />
 </div>
 <div className="space-y-3">
 <EnhancedSkeleton variant="shimmer" lines={3} />
 </div>
 <div className="flex gap-2 pt-2">
 <EnhancedSkeleton variant="shimmer" className="h-8 w-20" rounded="md" />
 <EnhancedSkeleton variant="shimmer" className="h-8 w-20" rounded="md" />
 </div>
 </div>
 );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
 return (
 <div className="rounded-lg border bg-card overflow-hidden">
 <div className="border-b bg-muted/30 p-4">
 <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
 {Array.from({ length: columns }).map((_, i) => (
 <EnhancedSkeleton key={i} variant="shimmer" className="h-4" />
 ))}
 </div>
 </div>
 <div className="divide-y">
 {Array.from({ length: rows }).map((_, rowIndex) => (
 <div key={rowIndex} className="p-4">
 <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
 {Array.from({ length: columns }).map((_, colIndex) => (
 <EnhancedSkeleton
 key={colIndex}
 variant="shimmer"
 className="h-4"
 />
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}

export function SkeletonProfile() {
 return (
 <div className="space-y-6">
 <div className="flex items-start gap-6">
 <EnhancedSkeleton variant="shimmer" className="h-24 w-24" rounded="full" />
 <div className="flex-1 space-y-3">
 <EnhancedSkeleton variant="shimmer" className="h-8 w-1/3" />
 <EnhancedSkeleton variant="shimmer" className="h-4 w-1/2" />
 <div className="flex gap-2 pt-2">
 <EnhancedSkeleton variant="shimmer" className="h-9 w-24" rounded="md" />
 <EnhancedSkeleton variant="shimmer" className="h-9 w-24" rounded="md" />
 </div>
 </div>
 </div>
 
 <div className="grid gap-4 md:grid-cols-3">
 {Array.from({ length: 3 }).map((_, i) => (
 <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
 <EnhancedSkeleton variant="shimmer" className="h-4 w-1/2" />
 <EnhancedSkeleton variant="shimmer" className="h-8 w-3/4" />
 </div>
 ))}
 </div>

 <div className="space-y-4">
 <EnhancedSkeleton variant="shimmer" className="h-6 w-1/4" />
 <EnhancedSkeletonCard />
 <EnhancedSkeletonCard />
 </div>
 </div>
 );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
 return (
 <div className="space-y-3">
 {Array.from({ length: items }).map((_, i) => (
 <div
 key={i}
 className="flex items-center gap-4 rounded-lg border bg-card p-4"
 >
 <EnhancedSkeleton variant="shimmer" className="h-12 w-12" rounded="full" />
 <div className="flex-1 space-y-2">
 <EnhancedSkeleton variant="shimmer" className="h-4 w-1/3" />
 <EnhancedSkeleton variant="shimmer" className="h-3 w-1/2" />
 </div>
 <EnhancedSkeleton variant="shimmer" className="h-8 w-20" rounded="md" />
 </div>
 ))}
 </div>
 );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
 return (
 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
 {Array.from({ length: count }).map((_, i) => (
 <div key={i} className="rounded-lg border bg-card p-6 space-y-3">
 <div className="flex items-center justify-between">
 <EnhancedSkeleton variant="shimmer" className="h-4 w-24" />
 <EnhancedSkeleton variant="shimmer" className="h-8 w-8" rounded="lg" />
 </div>
 <EnhancedSkeleton variant="shimmer" className="h-8 w-1/2" />
 <EnhancedSkeleton variant="shimmer" className="h-3 w-3/4" />
 </div>
 ))}
 </div>
 );
}

export function SkeletonForm() {
 return (
 <div className="space-y-6 rounded-lg border bg-card p-6">
 <div className="space-y-2">
 <EnhancedSkeleton variant="shimmer" className="h-4 w-24" />
 <EnhancedSkeleton variant="shimmer" className="h-10 w-full" rounded="md" />
 </div>
 <div className="space-y-2">
 <EnhancedSkeleton variant="shimmer" className="h-4 w-32" />
 <EnhancedSkeleton variant="shimmer" className="h-10 w-full" rounded="md" />
 </div>
 <div className="space-y-2">
 <EnhancedSkeleton variant="shimmer" className="h-4 w-28" />
 <EnhancedSkeleton variant="shimmer" className="h-24 w-full" rounded="md" />
 </div>
 <div className="flex gap-3 pt-4">
 <EnhancedSkeleton variant="shimmer" className="h-10 w-24" rounded="md" />
 <EnhancedSkeleton variant="shimmer" className="h-10 w-24" rounded="md" />
 </div>
 </div>
 );
}
