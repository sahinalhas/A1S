import { Card, CardContent, CardHeader } from '@/components/organisms/Card';
import { Skeleton } from '@/components/atoms/Skeleton';

export function StatsCardSkeleton() {
 return (
 <Card>
 <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
 <Skeleton className="h-4 w-24" />
 <Skeleton className="h-8 w-8 rounded-lg" />
 </CardHeader>
 <CardContent>
 <Skeleton className="h-8 w-16 mb-2" />
 <Skeleton className="h-3 w-32" />
 </CardContent>
 </Card>
 );
}

export function CalendarSkeleton() {
 return (
 <Card>
 <CardHeader>
 <div className="flex items-start justify-between">
 <div className="space-y-2">
 <Skeleton className="h-5 w-32" />
 <Skeleton className="h-4 w-48" />
 </div>
 <div className="flex gap-2">
 <Skeleton className="h-6 w-16" />
 <Skeleton className="h-6 w-16" />
 <Skeleton className="h-6 w-16" />
 <Skeleton className="h-6 w-16" />
 </div>
 </div>
 </CardHeader>
 <CardContent>
 <Skeleton className="h-[700px] w-full" />
 </CardContent>
 </Card>
 );
}

export function TableSkeleton() {
 return (
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div className="space-y-2">
 <Skeleton className="h-5 w-32" />
 <Skeleton className="h-4 w-24" />
 </div>
 <div className="flex gap-2">
 <Skeleton className="h-9 w-24" />
 <Skeleton className="h-9 w-32" />
 </div>
 </div>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {[...Array(5)].map((_, i) => (
 <Skeleton key={i} className="h-12 w-full" />
 ))}
 </div>
 </CardContent>
 </Card>
 );
}

export function SessionCardSkeleton() {
 return (
 <Card>
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between gap-2">
 <div className="flex items-center gap-2 flex-1">
 <Skeleton className="h-5 w-5 flex-shrink-0" />
 <Skeleton className="h-5 w-32" />
 </div>
 <Skeleton className="h-6 w-20" />
 </div>
 </CardHeader>
 <CardContent className="space-y-3 pb-3">
 <Skeleton className="h-4 w-full" />
 <Skeleton className="h-4 w-3/4" />
 <div className="flex gap-2">
 <Skeleton className="h-5 w-16" />
 <Skeleton className="h-5 w-20" />
 </div>
 <div className="space-y-2">
 <Skeleton className="h-3 w-full" />
 <Skeleton className="h-3 w-full" />
 </div>
 </CardContent>
 </Card>
 );
}

export function SessionGridSkeleton() {
 return (
 <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
 {[...Array(6)].map((_, i) => (
 <SessionCardSkeleton key={i} />
 ))}
 </div>
 );
}
