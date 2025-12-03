
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPendingSuggestions } from '@/lib/api/endpoints/ai-suggestions.api';
import { useNavigate } from 'react-router-dom';

export function AIPendingSuggestionsWidget() {
 const navigate = useNavigate();
 const { data: suggestions } = useQuery({
 queryKey: ['pending-suggestions-widget'],
 queryFn: () => getPendingSuggestions(5),
 refetchInterval: 60000
 });

 const count = suggestions?.length || 0;

 if (count === 0) return null;

 return (
 <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-transparent">
 <CardHeader>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Sparkles className="h-5 w-5 text-purple-600" />
 <CardTitle className="text-lg">AI Önerileri</CardTitle>
 </div>
 <Badge variant="secondary">{count} bekliyor</Badge>
 </div>
 <CardDescription>
 Yapay zeka asistanın inceleşmeniz için önerileri var
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-2 mb-4">
 {suggestions?.slice(0, 3).map((sug) => (
 <div key={sug.id} className="text-sm p-2 bg-white rounded border">
 <p className="font-medium">{sug.title}</p>
 <p className="text-muted-foreground text-xs mt-1">{sug.description}</p>
 </div>
 ))}
 </div>
 <Button 
 onClick={() => navigate('/ai-araclari?tab=ai-asistan')} 
 className="w-full gap-2"
 >
 Tüm Önerileri Gör
 <ArrowRight className="h-4 w-4" />
 </Button>
 </CardContent>
 </Card>
 );
}
