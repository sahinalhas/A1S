import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/atoms/Select';
import { Search, X } from 'lucide-react';

interface AdvancedFiltersProps {
 searchQuery: string;
 onSearchChange: (value: string) => void;
 selectedClass: string;
 onClassChange: (value: string) => void;
 selectedGender: string;
 onGenderChange: (value: string) => void;
 onResetFilters: () => void;
 hasActiveFilters: boolean;
 activeFilterCount: number;
 availableClasses?: string[];
}

export function AdvancedFilters({
 searchQuery,
 onSearchChange,
 selectedClass,
 onClassChange,
 selectedGender,
 onGenderChange,
 onResetFilters,
 hasActiveFilters,
 activeFilterCount,
 availableClasses = [],
}: AdvancedFiltersProps) {
 return (
 <div className="flex items-center gap-2">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
 <Input
 placeholder="Öğrenci ara..."
 value={searchQuery}
 onChange={(e) => onSearchChange(e.target.value)}
 className="pl-10 h-9"
 />
 </div>

 <Select value={selectedClass} onValueChange={onClassChange}>
 <SelectTrigger className="w-[140px] h-9">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="tum">Tüm Sınıflar</SelectItem>
 {availableClasses.map((className) => (
 <SelectItem key={className} value={className}>
 {className}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Select value={selectedGender} onValueChange={onGenderChange}>
 <SelectTrigger className="w-[140px] h-9">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="tum">Tüm Cinsiyetler</SelectItem>
 <SelectItem value="K">Kız</SelectItem>
 <SelectItem value="E">Erkek</SelectItem>
 </SelectContent>
 </Select>

 {hasActiveFilters && (
 <Button
 variant="ghost"
 size="sm"
 onClick={onResetFilters}
 className="h-9 px-3"
 >
 <X className="mr-1 h-4 w-4" />
 Temizle
 {activeFilterCount > 0 && (
 <Badge variant="secondary" className="ml-2 text-xs">
 {activeFilterCount}
 </Badge>
 )}
 </Button>
 )}
 </div>
 );
}
