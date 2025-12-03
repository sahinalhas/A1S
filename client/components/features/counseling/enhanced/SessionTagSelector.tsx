import { useState, useEffect } from "react";
import { X, Tag, Sparkles } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { ScrollArea } from "@/components/organisms/ScrollArea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { fetchWithSchool } from "@/lib/api/core/fetch-helpers";

interface SessionTag {
 id: string;
 label: string;
 category: string;
 color?: string;
}

interface SessionTagSelectorProps {
 selectedTags: string[];
 onTagsChange: (tags: string[]) => void;
 topicPath?: string;
}

export default function SessionTagSelector({ 
 selectedTags, 
 onTagsChange,
 topicPath 
}: SessionTagSelectorProps) {
 const [allTags, setAllTags] = useState<SessionTag[]>([]);
 const [suggestedTags, setSuggestedTags] = useState<SessionTag[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 loadTags();
 }, []);

 useEffect(() => {
 if (topicPath) {
 loadSuggestions(topicPath);
 }
 }, [topicPath]);

 const loadTags = async () => {
 try {
 const response = await fetchWithSchool('/api/counseling-sessions/tags');
 if (response.ok) {
 const data = await response.json();
 setAllTags(data);
 }
 } catch (error) {
 console.error('Error loading tags:', error);
 } finally {
 setLoading(false);
 }
 };

 const loadSuggestions = async (topic: string) => {
 try {
 const response = await fetchWithSchool(`/api/counseling-sessions/tags/suggest?topic=${encodeURIComponent(topic)}`);
 if (response.ok) {
 const data = await response.json();
 setSuggestedTags(data);
 }
 } catch (error) {
 console.error('Error loading suggestions:', error);
 }
 };

 const toggleTag = (tagId: string) => {
 if (selectedTags.includes(tagId)) {
 onTagsChange(selectedTags.filter(t => t !== tagId));
 } else {
 onTagsChange([...selectedTags, tagId]);
 }
 };

 const getTagById = (id: string) => allTags.find(t => t.id === id);

 const tagsByCategory = allTags.reduce((acc, tag) => {
 if (!acc[tag.category]) {
 acc[tag.category] = [];
 }
 acc[tag.category].push(tag);
 return acc;
 }, {} as Record<string, SessionTag[]>);

 const categoryLabels: Record<string, string> = {
 topic: 'Konular',
 status: 'Durum',
 action: 'Aksiyon',
 emotion: 'Duygu',
 custom: 'Özel'
 };

 if (loading) {
 return <div className="text-sm text-muted-foreground">Etiketler yükleniyor...</div>;
 }

 return (
 <div className="space-y-4">
 {selectedTags.length > 0 && (
 <div className="flex flex-wrap gap-2">
 {selectedTags.map(tagId => {
 const tag = getTagById(tagId);
 return tag ? (
 <Badge
 key={tag.id}
 variant="secondary"
 className="pr-1"
 style={{ borderColor: tag.color, borderWidth: '2px' }}
 >
 {tag.label}
 <Button
 variant="ghost"
 size="sm"
 className="h-4 w-4 p-0 ml-2"
 onClick={() => toggleTag(tag.id)}
 >
 <X className="h-3 w-3" />
 </Button>
 </Badge>
 ) : null;
 })}
 </div>
 )}

 {suggestedTags.length > 0 && (
 <div className="space-y-2">
 <div className="flex items-center gap-2 text-sm font-medium">
 <Sparkles className="h-4 w-4 text-yellow-500" />
 Önerilen Etiketler
 </div>
 <div className="flex flex-wrap gap-2">
 {suggestedTags.map(tag => (
 <Badge
 key={tag.id}
 variant={selectedTags.includes(tag.id) ?"default" :"outline"}
 className="cursor-pointer"
 style={{ 
 borderColor: tag.color,
 backgroundColor: selectedTags.includes(tag.id) ? tag.color + '20' : 'transparent'
 }}
 onClick={() => toggleTag(tag.id)}
 >
 {tag.label}
 </Badge>
 ))}
 </div>
 </div>
 )}

 <Tabs defaultValue="topic" className="w-full">
 <TabsList variant="nested">
 {Object.entries(categoryLabels).map(([key, label]) => (
 <TabsTrigger key={key} value={key} variant="nested">
 {label}
 </TabsTrigger>
 ))}
 </TabsList>

 {Object.entries(tagsByCategory).map(([category, tags]) => (
 <TabsContent key={category} value={category}>
 <ScrollArea className="h-40">
 <div className="flex flex-wrap gap-2 p-2">
 {tags.map(tag => (
 <Badge
 key={tag.id}
 variant={selectedTags.includes(tag.id) ?"default" :"outline"}
 className="cursor-pointer"
 style={{ 
 borderColor: tag.color,
 backgroundColor: selectedTags.includes(tag.id) ? tag.color + '20' : 'transparent'
 }}
 onClick={() => toggleTag(tag.id)}
 >
 {tag.label}
 </Badge>
 ))}
 </div>
 </ScrollArea>
 </TabsContent>
 ))}
 </Tabs>
 </div>
 );
}
