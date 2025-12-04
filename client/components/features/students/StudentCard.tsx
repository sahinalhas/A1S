import { Card, CardContent } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Eye, Pencil, Trash2, User, GraduationCap, MoreVertical } from 'lucide-react';
import type { Student } from '@/lib/storage';
import { Link } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/organisms/DropdownMenu';

interface StudentCardProps {
    student: Student;
    isSelected?: boolean;
    onSelect?: (selected: boolean) => void;
    onEdit?: (student: Student) => void;
    onDelete?: (student: Student) => void;
    onView?: (student: Student) => void;
}

export function StudentCard({
    student,
    isSelected = false,
    onSelect,
    onEdit,
    onDelete,
    onView,
}: StudentCardProps) {
    const getRiskBadge = (risk?: string) => {
        switch (risk) {
            case 'Yüksek':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            case 'Orta':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
            default:
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
        }
    };

    return (
        <Card
            className={`
        group relative border hover:shadow-md transition-all duration-200
        ${isSelected ? 'ring-2 ring-primary shadow-md' : ''}
        cursor-pointer h-full bg-card
      `}
            onClick={() => onView?.(student)}
        >
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                        {onSelect && (
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => onSelect(checked as boolean)}
                                onClick={(e) => e.stopPropagation()}
                                className="mt-1"
                            />
                        )}

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base truncate text-foreground">
                                        {student.name} {student.surname}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        #{student.id}
                                    </p>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link to={`/ogrenci/${student.id}`} className="cursor-pointer">
                                                <Eye className="h-4 w-4 mr-2" />
                                                Profili Görüntüle
                                            </Link>
                                        </DropdownMenuItem>
                                        {onEdit && (
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(student);
                                            }}>
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Düzenle
                                            </DropdownMenuItem>
                                        )}
                                        {onDelete && (
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(student);
                                                }}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Sil
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Info */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                <Badge variant="secondary" className="text-xs font-normal">
                                    <GraduationCap className="h-3 w-3 mr-1" />
                                    {student.class}
                                </Badge>
                                <Badge variant="secondary" className="text-xs font-normal">
                                    {student.gender === 'E' ? 'Erkek' : 'Kız'}
                                </Badge>
                                <Badge className={`text-xs font-medium ${getRiskBadge(student.risk)}`}>
                                    {student.risk || 'Düşük'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
