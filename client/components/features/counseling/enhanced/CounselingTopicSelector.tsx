import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/organisms/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/organisms/Popover";
import { Badge } from "@/components/atoms/Badge";
import { cn } from "@/lib/utils";
import type { CounselingTopic } from "../types";

interface CounselingTopicSelectorProps {
 topics: CounselingTopic[];
 value?: string;
 onValueChange: (value: string) => void;
 placeholder?: string;
 disabled?: boolean;
}

export default function CounselingTopicSelector({
 topics,
 value,
 onValueChange,
 placeholder ="Görüşme konusu ara...",
 disabled = false,
}: CounselingTopicSelectorProps) {
 const [open, setOpen] = useState(false);
 const [search, setSearch] = useState("");

 const selectedTopic = topics.find((topic) => topic.id === value || topic.title === value);

 const filteredTopics = useMemo(() => {
 return search
 ? topics.filter((topic) => {
 const searchLower = search.toLowerCase();
 return (
 topic.title.toLowerCase().includes(searchLower) ||
 topic.category.toLowerCase().includes(searchLower) ||
 topic.fullPath.toLowerCase().includes(searchLower)
 );
 })
 : topics;
 }, [topics, search]);

 const handleSelect = (topicId: string) => {
 onValueChange(topicId);
 setOpen(false);
 setSearch("");
 };

 return (
 <Popover open={open} onOpenChange={setOpen}>
 <PopoverTrigger asChild>
 <Button
 variant="outline"
 role="combobox"
 aria-expanded={open}
 disabled={disabled}
 className={cn(
"w-full justify-between h-10 rounded-lg bg-white dark:bg-slate-900 border focus:border-purple-400 dark:",
 !value &&"text-slate-400"
 )}
 >
 <span className="flex items-center gap-2 truncate">
 <BookOpen className="h-4 w-4 shrink-0 text-purple-500" />
 {selectedTopic ? (
 <span className="truncate">{selectedTopic.title}</span>
 ) : (
 placeholder
 )}
 </span>
 <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
 </Button>
 </PopoverTrigger>
 <PopoverContent className="w-full p-0 popover-content-width-full" align="start">
 <Command shouldFilter={false}>
 <CommandInput
 placeholder="Konu ara..."
 value={search}
 onValueChange={setSearch}
 className="h-10"
 />
 <CommandList className="max-h-[350px]">
 <CommandEmpty>
 <div className="flex flex-col items-center justify-center py-8 text-center">
 <Search className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
 <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
 Konu bulunamadı
 </p>
 <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
 Farklı anahtar kelimeler deneyin
 </p>
 </div>
 </CommandEmpty>

 {filteredTopics.map((topic) => (
 <CommandItem
 key={topic.id}
 value={topic.title}
 onSelect={() => handleSelect(topic.id)}
 className="flex items-start gap-2 py-2.5 cursor-pointer"
 >
 <Check
 className={cn(
"h-4 w-4 shrink-0 mt-0.5",
 (value === topic.id || value === topic.title) ?"opacity-100 text-purple-600" :"opacity-0"
 )}
 />
 <div className="flex-1 min-w-0">
 <p className="font-medium text-sm leading-tight">
 {topic.title}
 </p>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
 {topic.fullPath}
 </p>
 </div>
 </CommandItem>
 ))}
 </CommandList>
 </Command>
 </PopoverContent>
 </Popover>
 );
}
