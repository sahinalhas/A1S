import { Control } from "react-hook-form";
import {
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/atoms/Select";
import { X } from "lucide-react";
import { SurveyTemplateForm, targetAudienceLabels } from "../types";
import { useState } from "react";

interface BasicInfoFormProps {
 control: Control<SurveyTemplateForm>;
}

export function BasicInfoForm({ control }: BasicInfoFormProps) {
 const [newTag, setNewTag] = useState("");

 return (
 <div className="space-y-4">
 <FormField
 control={control}
 name="title"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Anket Başlığı</FormLabel>
 <FormControl>
 <Input placeholder="Örn: Öğrenci Memnuniyet Anketi" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={control}
 name="description"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Açıklama</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Anketin amacını ve kapsamını açıklayın..."
 className="resize-none"
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={control}
 name="targetAudience"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Hedef Kitle</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Hedef kitle seçin..." />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 {Object.entries(targetAudienceLabels).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={control}
 name="tags"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Etiketler (Opsiyonel)</FormLabel>
 <div className="flex gap-2">
 <Input
 placeholder="Etiket ekle..."
 value={newTag}
 onChange={(e) => setNewTag(e.target.value)}
 onKeyDown={(e) => {
 if (e.key ==="Enter") {
 e.preventDefault();
 if (newTag.trim()) {
 const currentTags = field.value || [];
 if (!currentTags.includes(newTag.trim())) {
 field.onChange([...currentTags, newTag.trim()]);
 }
 setNewTag("");
 }
 }
 }}
 />
 <Button
 type="button"
 variant="outline"
 onClick={() => {
 if (newTag.trim()) {
 const currentTags = field.value || [];
 if (!currentTags.includes(newTag.trim())) {
 field.onChange([...currentTags, newTag.trim()]);
 }
 setNewTag("");
 }
 }}
 >
 Ekle
 </Button>
 </div>
 {field.value && field.value.length > 0 && (
 <div className="flex flex-wrap gap-2 mt-2">
 {field.value.map((tag) => (
 <Badge key={tag} variant="secondary" className="gap-1">
 {tag}
 <Button
 type="button"
 variant="ghost"
 size="sm"
 className="h-auto p-0 ml-1"
 onClick={() => {
 field.onChange(field.value?.filter((t) => t !== tag));
 }}
 >
 <X className="h-3 w-3" />
 </Button>
 </Badge>
 ))}
 </div>
 )}
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 );
}
