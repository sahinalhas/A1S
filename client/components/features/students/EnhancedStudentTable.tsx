import { memo } from 'react';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/organisms/Tooltip';
import { Eye, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, Phone, Mail } from 'lucide-react';
import type { Student } from '@/lib/storage';
import { Link } from 'react-router-dom';
import type { ColumnVisibility } from './TableControls';

export type SortColumn = 'id' | 'fullName' | 'class' | 'gender';
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
        // Veli bilgilerini öncelik sırasına göre al
        const getParentContact = () => {
            // Önce anne bilgisi
            if (student.motherPhone || student.motherName) {
                return {
                    name: student.motherName || 'Anne',
                    phone: student.motherPhone,
                    email: student.motherEmail,
                    relation: 'Anne'
                };
            }
            // Sonra baba bilgisi
            if (student.fatherPhone || student.fatherName) {
                return {
                    name: student.fatherName || 'Baba',
                    phone: student.fatherPhone,
                    email: student.fatherEmail,
                    relation: 'Baba'
                };
            }
            // Son olarak vasi bilgisi
            if (student.guardianPhone || student.guardianName) {
                return {
                    name: student.guardianName || 'Vasi',
                    phone: student.guardianPhone,
                    email: student.guardianEmail,
                    relation: student.guardianRelation || 'Vasi'
                };
            }
            return null;
        };

        const parentContact = getParentContact();

        return (
            <TableRow className="hover:bg-muted/50 transition-colors">
                <TableCell className="w-12">
                    <Checkbox checked={isSelected} onCheckedChange={onSelect} />
                </TableCell>
                {columnVisibility.id && (
                    <TableCell
                        className="font-medium cursor-pointer text-muted-foreground"
                        onClick={() => onRowClick?.(student)}
                    >
                        {student.id}
                    </TableCell>
                )}
                {columnVisibility.fullName && (
                    <TableCell
                        className="font-medium cursor-pointer"
                        onClick={() => onRowClick?.(student)}
                    >
                        {student.name} {student.surname}
                    </TableCell>
                )}
                {columnVisibility.class && (
                    <TableCell>
                        <Badge variant="secondary" className="font-normal text-xs">
                            {student.class}
                        </Badge>
                    </TableCell>
                )}
                {columnVisibility.gender && (
                    <TableCell>
                        <Badge variant="secondary" className="font-normal text-xs">
                            {student.gender === 'E' ? 'Erkek' : 'Kız'}
                        </Badge>
                    </TableCell>
                )}
                {/* Veli İletişim Sütunu */}
                <TableCell>
                    {parentContact ? (
                        <TooltipProvider>
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-medium truncate">{parentContact.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{parentContact.relation}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                        <div className="space-y-1">
                                            <p className="font-semibold">{parentContact.name}</p>
                                            <p className="text-xs text-muted-foreground">{parentContact.relation}</p>
                                            {parentContact.phone && (
                                                <p className="text-xs flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {parentContact.phone}
                                                </p>
                                            )}
                                            {parentContact.email && (
                                                <p className="text-xs flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {parentContact.email}
                                                </p>
                                            )}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                                <div className="flex gap-0.5">
                                    {parentContact.phone && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.href = `tel:${parentContact.phone}`;
                                                    }}
                                                >
                                                    <Phone className="h-3.5 w-3.5 text-green-600" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">{parentContact.phone}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                    {parentContact.email && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.href = `mailto:${parentContact.email}`;
                                                    }}
                                                >
                                                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">{parentContact.email}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                        </TooltipProvider>
                    ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                    )}
                </TableCell>
                {columnVisibility.actions && (
                    <TableCell>
                        <div className="flex items-center justify-end gap-1">
                            <Button
                                asChild
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                            >
                                <Link to={`/ogrenci/${student.id}`}>
                                    <Eye className="h-4 w-4" />
                                </Link>
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => onEdit(student)}
                                        className="cursor-pointer"
                                    >
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Düzenle
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => onDelete(student)}
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Sil
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
        <div className="w-full rounded-lg border bg-card overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={allSelected || someSelected}
                                    onCheckedChange={onSelectAll}
                                />
                            </TableHead>
                            {columnVisibility.id && (
                                <TableHead className="w-20">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="-ml-3 h-8 font-semibold"
                                        onClick={() => onSort('id')}
                                    >
                                        No
                                        <SortIcon column="id" />
                                    </Button>
                                </TableHead>
                            )}
                            {columnVisibility.fullName && (
                                <TableHead>
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
                                <TableHead className="w-24">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="-ml-3 h-8 font-semibold"
                                        onClick={() => onSort('class')}
                                    >
                                        Sınıf
                                        <SortIcon column="class" />
                                    </Button>
                                </TableHead>
                            )}
                            {columnVisibility.gender && (
                                <TableHead className="w-24">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="-ml-3 h-8 font-semibold"
                                        onClick={() => onSort('gender')}
                                    >
                                        Cinsiyet
                                        <SortIcon column="gender" />
                                    </Button>
                                </TableHead>
                            )}
                            <TableHead className="w-48">
                                <span className="font-semibold">Veli İletişim</span>
                            </TableHead>
                            {columnVisibility.actions && (
                                <TableHead className="w-24 text-right">İşlemler</TableHead>
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
