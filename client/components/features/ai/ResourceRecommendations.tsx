import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Badge } from '@/components/atoms/Badge';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import { 
 BookOpen, 
 Heart, 
 Users, 
 Home,
 ExternalLink,
 Sparkles,
 Loader2
} from 'lucide-react';
import { getResourceRecommendations } from '@/lib/api/endpoints/ai-assistant.api';

export default function ResourceRecommendations() {
 const [category, setCategory] = useState<string>('');

 const { data, isLoading } = useQuery({
 queryKey: ['resource-recommendations', category],
 queryFn: () => getResourceRecommendations(category || undefined),
 });

 const resources = data?.data?.resources || {};
 const isAllCategories = !category;

 const categoryIcons: Record<string, any> = {
 akademik: <BookOpen className="h-4 w-4" />,
 sosyalDuygusal: <Heart className="h-4 w-4" />,
 davranişsal: <Users className="h-4 w-4" />,
 aile: <Home className="h-4 w-4" />
 };

 const categoryLabels: Record<string, string> = {
 akademik: 'Akademik Destek',
 sosyalDuygusal: 'Sosyal-Duygusal',
 davranişsal: 'Davranışsal',
 aile: 'Aile Desteği'
 };

 const renderResourceList = (items: any[]) => {
 if (!items || items.length === 0) {
 return (
 <p className="text-sm text-muted-foreground text-center py-4">
 Kaynak bulunamadı
 </p>
 );
 }

 return (
 <div className="space-y-2">
 {items.map((resource, idx) => (
 <Card key={idx} className="">
 <CardContent className="p-4">
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <h4 className="font-medium">{resource.name}</h4>
 <Badge variant="outline" className="text-xs">
 {resource.type}
 </Badge>
 </div>
 {resource.description && (
 <p className="text-sm text-muted-foreground">
 {resource.description}
 </p>
 )}
 {resource.url && (
 <a
 href={resource.url}
 target="_blank"
 rel="noopener noreferrer"
 className="text-xs text-primary flex items-center gap-1 mt-2"
 >
 Bağlantıyı Aç
 <ExternalLink className="h-3 w-3" />
 </a>
 )}
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 );
 };

 if (isLoading) {
 return (
 <Card>
 <CardContent className="flex items-center justify-center py-12">
 <Loader2 className="h-8 w-8 text-muted-foreground" />
 </CardContent>
 </Card>
 );
 }

 return (
 <Card className="border-purple-200 dark:border-purple-900 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
 <CardHeader>
 <div className="flex items-center gap-2">
 <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
 <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
 </div>
 <div>
 <CardTitle>Kaynak Önerileri</CardTitle>
 <CardDescription>
 Müdahale ve destek kaynakları
 </CardDescription>
 </div>
 </div>
 </CardHeader>
 <CardContent>
 <Tabs value={category || 'all'} onValueChange={(val) => setCategory(val === 'all' ? '' : val)}>
 <TabsList variant="nested">
 <TabsTrigger value="all" variant="nested">Tümü</TabsTrigger>
 <TabsTrigger value="akademik" variant="nested">
 {categoryIcons.akademik}
 Akademik
 </TabsTrigger>
 <TabsTrigger value="sosyalDuygusal" variant="nested">
 {categoryIcons.sosyalDuygusal}
 Sosyal
 </TabsTrigger>
 <TabsTrigger value="davranişsal" variant="nested">
 {categoryIcons.davranişsal}
 Davranış
 </TabsTrigger>
 </TabsList>

 <ScrollArea className="h-[400px] pr-4">
 {isAllCategories ? (
 <div className="space-y-6">
 {Object.entries(resources).map(([key, items]) => (
 <div key={key} className="space-y-3">
 <div className="flex items-center gap-2">
 {categoryIcons[key]}
 <h3 className="font-semibold">{categoryLabels[key]}</h3>
 <Badge variant="secondary">{(items as any[]).length}</Badge>
 </div>
 {renderResourceList(items as any[])}
 </div>
 ))}
 </div>
 ) : (
 renderResourceList(resources as any[])
 )}
 </ScrollArea>
 </Tabs>
 </CardContent>
 </Card>
 );
}
