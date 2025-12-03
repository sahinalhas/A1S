import { Skeleton } from '@/components/atoms/Skeleton';
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/organisms/Table';

interface TableSkeletonProps {
 rows?: number;
 columns?: number;
}

export function TableSkeleton({ rows = 10, columns = 8 }: TableSkeletonProps) {
 return (
 <div className="rounded-md border">
 <Table>
 <TableHeader>
 <TableRow>
 {Array.from({ length: columns }).map((_, i) => (
 <TableHead key={i}>
 <Skeleton className="h-4 w-20" />
 </TableHead>
 ))}
 </TableRow>
 </TableHeader>
 <TableBody>
 {Array.from({ length: rows }).map((_, rowIndex) => (
 <TableRow key={rowIndex}>
 {Array.from({ length: columns }).map((_, colIndex) => (
 <TableCell key={colIndex}>
 <Skeleton
 className={`h-4 ${
 colIndex === 0 ? 'w-16' : colIndex === 1 ? 'w-24' : 'w-20'
 }`}
 />
 </TableCell>
 ))}
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 );
}
