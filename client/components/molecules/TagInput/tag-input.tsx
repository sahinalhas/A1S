import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { Input } from "@/components/atoms/Input";
import { cn } from "@/lib/utils";

interface TagInputProps {
 tags: string[];
 onChange: (tags: string[]) => void;
 placeholder?: string;
 className?: string;
 maxTags?: number;
 suggestions?: string[];
}

export function TagInput({
 tags,
 onChange,
 placeholder ="Etiket ekle...",
 className,
 maxTags,
 suggestions = [],
}: TagInputProps) {
 const [inputValue, setInputValue] = React.useState("");
 const [showSuggestions, setShowSuggestions] = React.useState(false);
 const inputRef = React.useRef<HTMLInputElement>(null);

 const handleAddTag = (tag: string) => {
 const trimmedTag = tag.trim();
 if (trimmedTag && !tags.includes(trimmedTag)) {
 if (maxTags && tags.length >= maxTags) {
 return;
 }
 onChange([...tags, trimmedTag]);
 setInputValue("");
 }
 };

 const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
 if (e.key ==="Enter" && inputValue) {
 e.preventDefault();
 handleAddTag(inputValue);
 } else if (e.key ==="Backspace" && !inputValue && tags.length > 0) {
 onChange(tags.slice(0, -1));
 }
 };

 const handleRemoveTag = (tagToRemove: string) => {
 onChange(tags.filter((tag) => tag !== tagToRemove));
 };

 const filteredSuggestions = React.useMemo(() => {
 if (!inputValue) return [];
 return suggestions.filter(
 (suggestion) =>
 suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
 !tags.includes(suggestion)
 );
 }, [inputValue, suggestions, tags]);

 return (
 <div className={cn("relative", className)}>
 <div className="flex gap-2 flex-wrap p-2 border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
 {tags.map((tag) => (
 <Badge key={tag} variant="secondary" className="rounded-sm px-2 py-1">
 {tag}
 <button
 type="button"
 className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
 onClick={() => handleRemoveTag(tag)}
 >
 <X className="h-3 w-3 text-muted-foreground" />
 </button>
 </Badge>
 ))}
 <Input
 ref={inputRef}
 type="text"
 value={inputValue}
 onChange={(e) => setInputValue(e.target.value)}
 onKeyDown={handleKeyDown}
 onFocus={() => setShowSuggestions(true)}
 onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
 placeholder={tags.length === 0 ? placeholder :""}
 className="flex-1 border-0 focus-visible:ring-0 p-0 h-6"
 />
 </div>
 {showSuggestions && filteredSuggestions.length > 0 && (
 <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md max-h-60 overflow-y-auto">
 {filteredSuggestions.map((suggestion) => (
 <button
 key={suggestion}
 type="button"
 className="w-full text-left px-3 py-2 text-sm"
 onClick={() => handleAddTag(suggestion)}
 >
 {suggestion}
 </button>
 ))}
 </div>
 )}
 </div>
 );
}
