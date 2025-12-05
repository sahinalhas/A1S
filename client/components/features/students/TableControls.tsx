import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import {
 DropdownMenu,
 DropdownMenuCheckboxItem,
 DropdownMenuContent,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from '@/components/organisms/DropdownMenu';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/atoms/Select';
import { Columns3 } from 'lucide-react';

export interface ColumnVisibility {
 id: boolean;
 fullName: boolean;
 class: boolean;
 gender: boolean;
 actions: boolean;
}

interface TableControlsProps {
 columnVisibility: ColumnVisibility;
 onColumnVisibilityChange: (column: keyof ColumnVisibility) => void;
 pageSize: number;
 onPageSizeChange: (size: number) => void;
}

const COLUMN_LABELS: Record<keyof ColumnVisibility, string> = {
 id: 'Öğrenci No',
 fullName: 'Ad Soyad',
 class: 'Sınıf',
 gender: 'Cinsiyet',
 actions: 'İşlemler',
};

export function TableControls({
 columnVisibility,
 onColumnVisibilityChange,
 pageSize,
 onPageSizeChange,
}: TableControlsProps) {
 const visibleCount = Object.values(columnVisibility).filter(Boolean).length;

 return (
 <div className="flex items-center justify-between gap-2">
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="outline" size="sm" className="h-8">
 <Columns3 className="mr-2 h-4 w-4" />
 Sütunlar
 <Badge variant="secondary" className="ml-2">
 {visibleCount}
 </Badge>
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="start" className="w-48">
 <DropdownMenuLabel>Sütun Görünürlüğü</DropdownMenuLabel>
 <DropdownMenuSeparator />
 {(Object.keys(columnVisibility) as Array<keyof ColumnVisibility>).map(
 (column) => (
 <DropdownMenuCheckboxItem
 key={column}
 checked={columnVisibility[column]}
 onCheckedChange={() => onColumnVisibilityChange(column)}
 >
 {COLUMN_LABELS[column]}
 </DropdownMenuCheckboxItem>
 )
 )}
 </DropdownMenuContent>
 </DropdownMenu>

 <div className="flex items-center gap-2">
 <span className="text-sm text-muted-foreground">Sayfa başına:</span>
 <Select
 value={pageSize.toString()}
 onValueChange={(value) => onPageSizeChange(parseInt(value))}
 >
 <SelectTrigger className="h-8 w-20">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="10">10</SelectItem>
 <SelectItem value="25">25</SelectItem>
 <SelectItem value="50">50</SelectItem>
 <SelectItem value="100">100</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 );
}
