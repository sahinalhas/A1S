import { memo, useMemo } from 'react';
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/organisms/Table';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from '@/components/organisms/DropdownMenu';
import { Eye, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, GraduationCap, Heart, Target, BookOpen, Calendar } from 'lucide-react';
import type { Student } from '@/lib/storage';
import { Link } from 'react-router-dom';
import type { ColumnVisibility } from './TableControls';

export type SortColumn = 'id' | 'fullName' | 'class' | 'gender' | 'risk';
export type SortDirection = 'asc' | 'desc' | null;

interface EnhancedStudentTableProps {
 students: Student[];
 selectedIds: Set<string>;
 onSelectAll: (selected: boolean) => void;
 onSelectOne: (id: string, selected: boolean) => void;
 onEdit: (student: Student) => void;
 onDelete: (student: Student) => void;
 onRowClick?: (student: Student) => void;
 sortColumn: SortColumn | null;
 sortDirection: SortDirection;
 onSort: (column: SortColumn) => void;
 columnVisibility: ColumnVisibility;
}

const StudentRow = memo(
 ({
 student,
 isSelected,
 onSelect,
 onEdit,
 onDelete,
 onRowClick,
 columnVisibility,
 }: {
 student: Student;
 isSelected: boolean;
 onSelect: (selected: boolean) => void;
 onEdit: (s: Student) => void;
 onDelete: (s: Student) => void;
 onRowClick?: (s: Student) => void;
 columnVisibility: ColumnVisibility;
 }) => {
 const getRiskBadgeVariant = (risk?: string) => {
 switch (risk) {
 case 'Yüksek':
 return 'destructive';
 case 'Orta':
 return 'default';
 default:
 return 'secondary';
 }
 };

 return (
 <TableRow className=" group border-b">
 <TableCell className="py-2.5 w-8">
 <Checkbox checked={isSelected} onCheckedChange={onSelect} />
 </TableCell>
 {columnVisibility.id && (
 <TableCell
 className="font-medium py-2.5 cursor-pointer w-12"
 onClick={() => onRowClick?.(student)}
 >
 {student.id}
 </TableCell>
 )}
 {columnVisibility.fullName && (
 <TableCell
 className="font-medium py-2.5 cursor-pointer min-w-[180px] whitespace-nowrap"
 onClick={() => onRowClick?.(student)}
 >
 {student.name} {student.surname}
 </TableCell>
 )}
 {columnVisibility.class && (
 <TableCell className="py-2.5 w-12">
 <Badge variant="outline" className="font-normal text-xs px-1.5">
 {student.class}
 </Badge>
 </TableCell>
 )}
 {columnVisibility.gender && (
 <TableCell className="py-2.5 w-12">
 <Badge variant="outline" className="font-normal text-xs px-1.5">
 {student.gender === 'E' ? 'Erkek' : 'Kız'}
 </Badge>
 </TableCell>
 )}
 {columnVisibility.risk && (
 <TableCell className="py-2.5 w-16">
 <Badge variant={getRiskBadgeVariant(student.risk)} className="font-normal text-xs px-1.5">
 {student.risk || 'Düşük'}
 </Badge>
 </TableCell>
 )}
 {columnVisibility.actions && (
 <TableCell className="py-2.5">
 <div className="flex items-center gap-0.5">
 <Button 
 asChild 
 size="sm" 
 variant="ghost" 
 className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
 title="Profili Görüntüle"
 >
 <Link to={`/ogrenci/${student.id}`}>
 <Eye className="h-4 w-4" />
 </Link>
 </Button>

 <Button 
 asChild 
 size="sm" 
 variant="ghost" 
 className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
 title="Kariyer Rehberliği"
 >
 <Link to={`/ogrenci/${student.id}?tab=career`}>
 <Target className="h-4 w-4" />
 </Link>
 </Button>

 <Button 
 asChild 
 size="sm" 
 variant="ghost" 
 className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
 title="Tanıtıcı Bilgiler"
 >
 <Link to={`/ogrenci/${student.id}?tab=demographics`}>
 <BookOpen className="h-4 w-4" />
 </Link>
 </Button>

 <Button 
 asChild 
 size="sm" 
 variant="ghost" 
 className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600"
 title="Çalışma Programı"
 >
 <Link to={`/ogrenci/${student.id}?tab=academic&subtab=calisma-programi`}>
 <Calendar className="h-4 w-4" />
 </Link>
 </Button>
 
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button
 size="sm"
 variant="ghost"
 className="h-8 w-8 p-0"
 title="Daha Fazla İşlem"
 >
 <MoreVertical className="h-4 w-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-40">
 <DropdownMenuItem
 onClick={() => onEdit(student)}
 className="cursor-pointer gap-2"
 >
 <Pencil className="h-4 w-4 text-orange-600" />
 <span>Düzenle</span>
 </DropdownMenuItem>
 <DropdownMenuItem
 onClick={() => onDelete(student)}
 className="cursor-pointer gap-2 text-destructive focus:text-destructive"
 >
 <Trash2 className="h-4 w-4" />
 <span>Sil</span>
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </TableCell>
 )}
 </TableRow>
 );
 }
);

StudentRow.displayName = 'StudentRow';

export function EnhancedStudentTable({
 students,
 selectedIds,
 onSelectAll,
 onSelectOne,
 onEdit,
 onDelete,
 onRowClick,
 sortColumn,
 sortDirection,
 onSort,
 columnVisibility,
}: EnhancedStudentTableProps) {
 const allSelected = students.length > 0 && students.every((s) => selectedIds.has(s.id));
 const someSelected = students.some((s) => selectedIds.has(s.id)) && !allSelected;

 const SortIcon = ({ column }: { column: SortColumn }) => {
 if (sortColumn !== column) {
 return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
 }
 if (sortDirection === 'asc') {
 return <ArrowUp className="ml-2 h-4 w-4" />;
 }
 if (sortDirection === 'desc') {
 return <ArrowDown className="ml-2 h-4 w-4" />;
 }
 return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
 };

 return (
 <div className="rounded-md border overflow-hidden">
 <div className="overflow-x-auto">
 <Table>
 <TableHeader className="sticky top-0 bg-background z-10">
 <TableRow>
 <TableHead className="py-2.5 w-8">
 <Checkbox
 checked={allSelected || someSelected}
 onCheckedChange={onSelectAll}
 />
 </TableHead>
 {columnVisibility.id && (
 <TableHead className="py-2.5 w-12">
 <Button
 variant="ghost"
 size="sm"
 className="-ml-3 h-8 font-semibold text-xs"
 onClick={() => onSort('id')}
 >
 No
 <SortIcon column="id" />
 </Button>
 </TableHead>
 )}
 {columnVisibility.fullName && (
 <TableHead className="py-2.5 min-w-[180px]">
 <Button
 variant="ghost"
 size="sm"
 className="-ml-3 h-8 font-semibold"
 onClick={() => onSort('fullName')}
 >
 Ad Soyad
 <SortIcon column="fullName" />
 </Button>
 </TableHead>
 )}
 {columnVisibility.class && (
 <TableHead className="py-2.5 w-12">
 <Button
 variant="ghost"
 size="sm"
 className="-ml-3 h-8 font-semibold text-xs px-1"
 onClick={() => onSort('class')}
 >
 Sınıf
 <SortIcon column="class" />
 </Button>
 </TableHead>
 )}
 {columnVisibility.gender && (
 <TableHead className="py-2.5 w-12">
 <Button
 variant="ghost"
 size="sm"
 className="-ml-3 h-8 font-semibold text-xs px-1"
 onClick={() => onSort('gender')}
 >
 Cins.
 <SortIcon column="gender" />
 </Button>
 </TableHead>
 )}
 {columnVisibility.risk && (
 <TableHead className="py-2.5 w-16">
 <Button
 variant="ghost"
 size="sm"
 className="-ml-3 h-8 font-semibold text-xs px-1"
 onClick={() => onSort('risk')}
 >
 Risk
 <SortIcon column="risk" />
 </Button>
 </TableHead>
 )}
 {columnVisibility.actions && (
 <TableHead className="py-2.5">İşlemler</TableHead>
 )}
 </TableRow>
 </TableHeader>
 <TableBody>
 {students.map((student) => (
 <StudentRow
 key={student.id}
 student={student}
 isSelected={selectedIds.has(student.id)}
 onSelect={(selected) => onSelectOne(student.id, selected)}
 onEdit={onEdit}
 onDelete={onDelete}
 onRowClick={onRowClick}
 columnVisibility={columnVisibility}
 />
 ))}
 </TableBody>
 </Table>
 </div>
 </div>
 );
}
