import { Card, CardContent, CardHeader } from "@/components/organisms/Card";
import { Skeleton } from "@/components/atoms/Skeleton";

export function DashboardSkeleton() {
 return (
 <div className="space-y-4">
 <div className="grid gap-4 md:grid-cols-3">
 <Card className="md:col-span-2">
 <CardHeader>
 <Skeleton className="h-6 w-48" />
 <Skeleton className="h-4 w-64 mt-2" />
 </CardHeader>
 <CardContent className="space-y-3">
 <Skeleton className="h-11 w-full" />
 <Skeleton className="h-10 w-40" />
 </CardContent>
 </Card>
 
 <Card>
 <CardHeader>
 <Skeleton className="h-6 w-32" />
 <Skeleton className="h-4 w-40 mt-2" />
 </CardHeader>
 <CardContent className="space-y-3">
 <Skeleton className="h-16 w-full" />
 <Skeleton className="h-16 w-full" />
 </CardContent>
 </Card>
 </div>

 <div className="grid gap-4 md:grid-cols-4">
 {[...Array(4)].map((_, i) => (
 <Card key={i}>
 <CardContent className="p-5">
 <Skeleton className="h-20 w-full" />
 </CardContent>
 </Card>
 ))}
 </div>

 <div className="grid gap-4 md:grid-cols-3">
 <Card className="md:col-span-2">
 <CardHeader>
 <Skeleton className="h-6 w-40" />
 <Skeleton className="h-4 w-32 mt-2" />
 </CardHeader>
 <CardContent>
 <Skeleton className="h-48 w-full" />
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <Skeleton className="h-6 w-32" />
 <Skeleton className="h-4 w-40 mt-2" />
 </CardHeader>
 <CardContent className="space-y-2">
 {[...Array(4)].map((_, i) => (
 <Skeleton key={i} className="h-10 w-full" />
 ))}
 </CardContent>
 </Card>
 </div>
 </div>
 );
}
