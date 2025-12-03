import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/organisms/Command";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
 value: string;
 label: string;
 category?: string;
}

interface MultiSelectProps {
 options: readonly MultiSelectOption[];
 selected: string[];
 onChange: (selected: string[]) => void;
 placeholder?: string;
 className?: string;
 maxItems?: number;
 groupByCategory?: boolean;
}

export function MultiSelect({
 options,
 selected,
 onChange,
 placeholder ="Seçiniz...",
 className,
 maxItems,
 groupByCategory = false,
}: MultiSelectProps) {
 const [open, setOpen] = React.useState(false);
 const [search, setSearch] = React.useState("");

 const handleUnselect = (value: string) => {
 onChange(selected.filter((s) => s !== value));
 };

 const handleSelect = (value: string) => {
 if (selected.includes(value)) {
 handleUnselect(value);
 } else {
 if (maxItems && selected.length >= maxItems) {
 return;
 }
 onChange([...selected, value]);
 }
 };

 const getLabel = (value: string) => {
 const option = options.find((opt) => opt.value === value);
 return option?.label || value;
 };

 const filteredOptions = React.useMemo(() => {
 if (!search) return options;
 return options.filter((option) =>
 option.label.toLowerCase().includes(search.toLowerCase())
 );
 }, [options, search]);

 const groupedOptions = React.useMemo(() => {
 if (!groupByCategory) return { '': filteredOptions };
 
 const groups: Record<string, MultiSelectOption[]> = {};
 filteredOptions.forEach((option) => {
 const category = option.category || 'Diğer';
 if (!groups[category]) {
 groups[category] = [];
 }
 groups[category].push(option);
 });
 return groups;
 }, [filteredOptions, groupByCategory]);

 return (
 <div className={cn("relative", className)}>
 <Command className="overflow-visible bg-transparent">
 <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
 <div className="flex gap-1 flex-wrap">
 {selected.map((value) => (
 <Badge key={value} variant="secondary" className="rounded-sm px-1 font-normal">
 {getLabel(value)}
 <button
 className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
 onKeyDown={(e) => {
 if (e.key ==="Enter") {
 handleUnselect(value);
 }
 }}
 onMouseDown={(e) => {
 e.preventDefault();
 e.stopPropagation();
 }}
 onClick={() => handleUnselect(value)}
 >
 <X className="h-3 w-3 text-muted-foreground" />
 </button>
 </Badge>
 ))}
 <CommandInput
 placeholder={selected.length === 0 ? placeholder :"Daha fazla ekle..."}
 className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
 value={search}
 onValueChange={setSearch}
 onFocus={() => setOpen(true)}
 onBlur={() => setTimeout(() => setOpen(false), 200)}
 />
 </div>
 </div>
 {open && (
 <div className="absolute w-full z-10 top-full mt-1">
 <CommandList className="bg-popover text-popover-foreground rounded-md border">
 <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
 {Object.entries(groupedOptions).map(([category, items]) => (
 <CommandGroup key={category} heading={category !== '' ? category : undefined}>
 {items.map((option) => (
 <CommandItem
 key={option.value}
 onSelect={() => handleSelect(option.value)}
 className={cn(
"cursor-pointer",
 selected.includes(option.value) &&"bg-accent"
 )}
 >
 <div
 className={cn(
"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
 selected.includes(option.value)
 ?"bg-primary text-primary-foreground"
 :"opacity-50 [&_svg]:invisible"
 )}
 >
 <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
 <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
 </svg>
 </div>
 <span>{option.label}</span>
 </CommandItem>
 ))}
 </CommandGroup>
 ))}
 </CommandList>
 </div>
 )}
 </Command>
 </div>
 );
}
