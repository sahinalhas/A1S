import { useState, useMemo } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Badge } from "@/components/atoms/Badge";
import {
 Popover,
 PopoverContent,
 PopoverTrigger,
} from "@/components/organisms/Popover";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/atoms/Select";

import type { SessionFilters, CounselingTopic } from "./types";

interface SessionFiltersProps {
 filters: SessionFilters;
 onFiltersChange: (filters: SessionFilters) => void;
 onApplyFilters: () => void;
 onClearFilters: () => void;
 topics: CounselingTopic[];
 isApplying?: boolean;
}

export default function SessionFiltersComponent({
 filters,
 onFiltersChange,
 onApplyFilters,
 onClearFilters,
 topics,
 isApplying = false,
}: SessionFiltersProps) {
 const [open, setOpen] = useState(false);

 const handleFilterChange = (key: keyof SessionFilters, value: string) => {
 onFiltersChange({
 ...filters,
 [key]: value,
 });
 };

 const activeFilterCount = useMemo(() => {
 let count = 0;
 if (filters.startDate) count++;
 if (filters.endDate) count++;
 if (filters.topic && filters.topic !== 'all') count++;
 if (filters.className) count++;
 if (filters.status && filters.status !== 'all') count++;
 if (filters.participantType && filters.participantType !== 'all') count++;
 if (filters.sessionType && filters.sessionType !== 'all') count++;
 if (filters.sessionMode && filters.sessionMode !== 'all') count++;
 return count;
 }, [filters]);

 const handleApply = () => {
 onApplyFilters();
 setOpen(false);
 };

 const handleClear = () => {
 onClearFilters();
 };

 return (
 <Popover open={open} onOpenChange={setOpen}>
 <PopoverTrigger asChild>
 <Button variant="outline" size="sm" className="gap-2">
 <Filter className="h-4 w-4" />
 Filtrele
 {activeFilterCount > 0 && (
 <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
 {activeFilterCount}
 </Badge>
 )}
 <ChevronDown className="h-3 w-3 opacity-50" />
 </Button>
 </PopoverTrigger>
 <PopoverContent className="w-[480px] p-4" align="start">
 <div className="space-y-4">
 <div className="flex items-center justify-between pb-2 border-b">
 <div className="flex items-center gap-2">
 <Filter className="h-4 w-4" />
 <h4 className="font-semibold text-sm">Filtreler</h4>
 {activeFilterCount > 0 && (
 <Badge variant="secondary" className="h-5 px-1.5 text-xs">
 {activeFilterCount} aktif
 </Badge>
 )}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1.5">
 <Label htmlFor="startDate" className="text-xs font-medium">Başlangıç</Label>
 <Input
 id="startDate"
 type="date"
 className="h-8 text-xs"
 value={filters.startDate || ''}
 onChange={(e) => handleFilterChange('startDate', e.target.value)}
 />
 </div>

 <div className="space-y-1.5">
 <Label htmlFor="endDate" className="text-xs font-medium">Bitiş</Label>
 <Input
 id="endDate"
 type="date"
 className="h-8 text-xs"
 value={filters.endDate || ''}
 onChange={(e) => handleFilterChange('endDate', e.target.value)}
 />
 </div>

 <div className="space-y-1.5">
 <Label htmlFor="status" className="text-xs font-medium">Durum</Label>
 <Select
 value={filters.status || 'all'}
 onValueChange={(value) => handleFilterChange('status', value)}
 >
 <SelectTrigger id="status" className="h-8 text-xs">
 <SelectValue placeholder="Tümü" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tümü</SelectItem>
 <SelectItem value="completed">Tamamlanan</SelectItem>
 <SelectItem value="active">Aktif</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1.5">
 <Label htmlFor="sessionType" className="text-xs font-medium">Tür</Label>
 <Select
 value={filters.sessionType || 'all'}
 onValueChange={(value) => handleFilterChange('sessionType', value)}
 >
 <SelectTrigger id="sessionType" className="h-8 text-xs">
 <SelectValue placeholder="Tümü" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tümü</SelectItem>
 <SelectItem value="individual">Bireysel</SelectItem>
 <SelectItem value="group">Grup</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1.5">
 <Label htmlFor="participantType" className="text-xs font-medium">Katılımcı</Label>
 <Select
 value={filters.participantType || 'all'}
 onValueChange={(value) => handleFilterChange('participantType', value)}
 >
 <SelectTrigger id="participantType" className="h-8 text-xs">
 <SelectValue placeholder="Tümü" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tümü</SelectItem>
 <SelectItem value="öğrenci">Öğrenci</SelectItem>
 <SelectItem value="veli">Veli</SelectItem>
 <SelectItem value="öğretmen">Öğretmen</SelectItem>
 <SelectItem value="diğer">Diğer</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1.5">
 <Label htmlFor="sessionMode" className="text-xs font-medium">Şekil</Label>
 <Select
 value={filters.sessionMode || 'all'}
 onValueChange={(value) => handleFilterChange('sessionMode', value)}
 >
 <SelectTrigger id="sessionMode" className="h-8 text-xs">
 <SelectValue placeholder="Tümü" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tümü</SelectItem>
 <SelectItem value="yüz_yüze">Yüz yüze</SelectItem>
 <SelectItem value="telefon">Telefon</SelectItem>
 <SelectItem value="online">Online</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1.5 col-span-2">
 <Label htmlFor="topic" className="text-xs font-medium">Konu</Label>
 <Select
 value={filters.topic || 'all'}
 onValueChange={(value) => handleFilterChange('topic', value)}
 >
 <SelectTrigger id="topic" className="h-8 text-xs">
 <SelectValue placeholder="Tümü" />
 </SelectTrigger>
 <SelectContent className="max-h-[200px]">
 <SelectItem value="all">Tümü</SelectItem>
 {topics.map((topic) => (
 <SelectItem key={topic.id} value={topic.title}>
 {topic.title}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1.5 col-span-2">
 <Label htmlFor="className" className="text-xs font-medium">Sınıf</Label>
 <Input
 id="className"
 placeholder="Örn: 9/A"
 className="h-8 text-xs"
 value={filters.className || ''}
 onChange={(e) => handleFilterChange('className', e.target.value)}
 />
 </div>
 </div>

 <div className="flex gap-2 pt-2 border-t">
 <Button 
 onClick={handleApply} 
 disabled={isApplying} 
 size="sm" 
 className="flex-1 h-8 text-xs"
 >
 Uygula
 </Button>
 <Button 
 variant="outline" 
 onClick={handleClear} 
 size="sm" 
 className="h-8 text-xs"
 >
 <X className="mr-1.5 h-3 w-3" />
 Temizle
 </Button>
 </div>
 </div>
 </PopoverContent>
 </Popover>
 );
}
