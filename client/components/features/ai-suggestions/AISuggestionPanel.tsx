/**
 * AI Suggestion Panel
 * Kullanıcı dostu AI öneri yönetimi paneli
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { 
 getPendingSuggestions, 
 getStudentSuggestions,
 approveSuggestion, 
 rejectSuggestion,
 modifySuggestion,
 getSuggestionStats
} from '@/lib/api/endpoints/ai-suggestions.api';
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Separator } from '@/components/atoms/Separator';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from '@/components/organisms/Dialog';
import { Textarea } from '@/components/atoms/Textarea';
import { Label } from '@/components/atoms/Label';
import {
 CheckCircle2,
 XCircle,
 Edit3,
 Sparkles,
 AlertCircle,
 Info,
 TrendingUp,
 Clock,
 User,
 Star
} from 'lucide-react';
import { toast } from 'sonner';
import type { AISuggestion } from '@shared/types/ai-suggestion.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { getPriorityColor, getPriorityLabel } from '@/lib/ai/ai-utils';

interface AISuggestionPanelProps {
 studentId?: string;
 className?: string;
}

export default function AISuggestionPanel({ studentId, className }: AISuggestionPanelProps) {
 const queryClient = useQueryClient();
 const { user } = useAuth();
 const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);
 const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
 const [reviewNotes, setReviewNotes] = useState('');
 const [feedbackRating, setFeedbackRating] = useState<number>(0);
 const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'modify'>('approve');

 // Önerileri getir
 const { data: suggestions, isLoading } = useQuery({
 queryKey: studentId ? ['suggestions', 'student', studentId] : ['suggestions', 'pending'],
 queryFn: () => studentId ? getStudentSuggestions(studentId) : getPendingSuggestions(),
 refetchInterval: 30000 // 30 saniyede bir yenile
 });

 // İstatistikleri getir
 const { data: stats } = useQuery({
 queryKey: ['suggestions', 'stats'],
 queryFn: getSuggestionStats,
 enabled: !studentId // Sadece genel görünümde göster
 });

 // Onayla mutation
 const approveMutation = useMutation({
 mutationFn: ({ id, notes, rating }: { id: string; notes: string; rating: number }) =>
 approveSuggestion(id, user?.id || 'unknown', notes, rating),
 onSuccess: () => {
 toast.success('Öneri onaylandı ve uygulandı');
 queryClient.invalidateQueries({ queryKey: ['suggestions'] });
 setIsReviewDialogOpen(false);
 setSelectedSuggestion(null);
 },
 onError: (error: any) => {
 toast.error(error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Öneri onaylanamadı');
 }
 });

 // Reddet mutation
 const rejectMutation = useMutation({
 mutationFn: ({ id, notes, rating }: { id: string; notes: string; rating: number }) =>
 rejectSuggestion(id, user?.id || 'unknown', notes, rating),
 onSuccess: () => {
 toast.success('Öneri reddedildi');
 queryClient.invalidateQueries({ queryKey: ['suggestions'] });
 setIsReviewDialogOpen(false);
 setSelectedSuggestion(null);
 },
 onError: (error: any) => {
 toast.error(error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Öneri reddedilemedi');
 }
 });

 const handleReview = () => {
 if (!selectedSuggestion || !user?.id) {
 toast.error('Kullanıcı bilgisi alınamadı');
 return;
 }

 if (reviewAction === 'approve') {
 approveMutation.mutate({
 id: selectedSuggestion.id,
 notes: reviewNotes,
 rating: feedbackRating
 });
 } else if (reviewAction === 'reject') {
 rejectMutation.mutate({
 id: selectedSuggestion.id,
 notes: reviewNotes,
 rating: feedbackRating
 });
 }
 };

 const openReviewDialog = (suggestion: AISuggestion, action: 'approve' | 'reject' | 'modify') => {
 setSelectedSuggestion(suggestion);
 setReviewAction(action);
 setReviewNotes('');
 setFeedbackRating(0);
 setIsReviewDialogOpen(true);
 };


 if (isLoading) {
 return (
 <Card className={className}>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Sparkles className="h-5 w-5" />
 AI Önerileri
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex items-center justify-center h-40">
 <div className=" rounded-full h-8 w-8 border-b-2 border-primary"></div>
 </div>
 </CardContent>
 </Card>
 );
 }

 return (
 <>
 <Card className={className}>
 <CardHeader>
 <CardTitle className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Sparkles className="h-5 w-5" />
 AI Önerileri
 {suggestions && suggestions.length > 0 && (
 <Badge variant="secondary">{suggestions.length}</Badge>
 )}
 </div>
 </CardTitle>
 <CardDescription>
 AI asistanın analiz ve önerileri. İnceleyip karar verin.
 </CardDescription>
 </CardHeader>
 <CardContent>
 {!suggestions || suggestions.length === 0 ? (
 <div className="text-center py-8 text-muted-foreground">
 <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
 <p>Bekleyen AI önerisi yok</p>
 <p className="text-sm mt-2">AI asistan yeni veri geldiğinde öneriler oluşturacak</p>
 </div>
 ) : (
 <Tabs defaultValue="pending" className="w-full">
 <TabsList variant="nested">
 <TabsTrigger value="pending" variant="nested">
 Bekleyen ({suggestions.length})
 </TabsTrigger>
 <TabsTrigger value="priority" variant="nested">
 Öncelikli
 </TabsTrigger>
 <TabsTrigger value="stats" variant="nested" disabled={!!studentId}>
 İstatistikler
 </TabsTrigger>
 </TabsList>

 <TabsContent value="pending" className="space-y-4">
 <ScrollArea className="h-[500px] pr-4">
 {suggestions.map((suggestion: AISuggestion) => (
 <Card key={suggestion.id} className="mb-3">
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-2 flex-1">
 <div className="p-2 bg-primary/10 rounded-md">
 {suggestion.suggestionType === 'PROFILE_UPDATE' ? <User className="h-4 w-4" /> :
 suggestion.suggestionType === 'RISK_ALERT' ? <AlertCircle className="h-4 w-4" /> :
 suggestion.suggestionType === 'INTERVENTION_PLAN' ? <TrendingUp className="h-4 w-4" /> :
 <Info className="h-4 w-4" />}
 </div>
 <div className="flex-1">
 <h4 className="font-medium text-sm">{suggestion.title}</h4>
 <p className="text-xs text-muted-foreground mt-1">
 {suggestion.description}
 </p>
 </div>
 </div>
 <Badge variant={getPriorityColor(suggestion?.priority)}>
 {getPriorityLabel(suggestion?.priority)}
 </Badge>
 </div>
 </CardHeader>
 <CardContent className="pt-0">
 <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
 <div className="flex items-center gap-1">
 <Clock className="h-3 w-3" />
 {new Date(suggestion.createdAt).toLocaleString('tr-TR')}
 </div>
 {suggestion.confidence && (
 <div className="flex items-center gap-1">
 <Star className="h-3 w-3" />
 Güven: %{(suggestion.confidence * 100).toFixed(0)}
 </div>
 )}
 </div>

 {suggestion.reasoning && (
 <div className="text-xs bg-muted/50 p-3 rounded-md mb-3">
 <p className="font-medium mb-1">Gerekçe:</p>
 <p>{suggestion.reasoning}</p>
 </div>
 )}

 {suggestion.proposedChanges && suggestion.proposedChanges.length > 0 && (
 <div className="text-xs bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md mb-3">
 <p className="font-medium mb-2">Önerilen Değişiklikler:</p>
 {suggestion.proposedChanges.map((change: any, idx: number) => (
 <div key={idx} className="mb-2 last:mb-0">
 <p className="font-medium text-blue-700 dark:text-blue-300">
 {change.field}:
 </p>
 <p className="text-muted-foreground">
 {change.currentValue || '(boş)'} → {change.proposedValue}
 </p>
 <p className="text-xs italic mt-1">{change.reason}</p>
 </div>
 ))}
 </div>
 )}

 <Separator className="my-3" />

 <div className="flex gap-2">
 <Button
 size="sm"
 onClick={() => openReviewDialog(suggestion, 'approve')}
 className="flex-1"
 >
 <CheckCircle2 className="h-4 w-4 mr-1" />
 Onayla
 </Button>
 <Button
 size="sm"
 variant="outline"
 onClick={() => openReviewDialog(suggestion, 'reject')}
 className="flex-1"
 >
 <XCircle className="h-4 w-4 mr-1" />
 Reddet
 </Button>
 <Button
 size="sm"
 variant="secondary"
 onClick={() => openReviewDialog(suggestion, 'modify')}
 >
 <Edit3 className="h-4 w-4" />
 </Button>
 </div>
 </CardContent>
 </Card>
 ))}
 </ScrollArea>
 </TabsContent>

 <TabsContent value="priority">
 <div className="text-center py-8 text-muted-foreground">
 <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
 <p>Kritik ve yüksek öncelikli öneriler burada gösterilecek</p>
 </div>
 </TabsContent>

 <TabsContent value="stats">
 {stats && (
 <div className="grid grid-cols-2 gap-4">
 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-sm">Bekleyen</CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-3xl font-bold">{stats.totalPending}</p>
 </CardContent>
 </Card>
 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-sm">Onaylanan</CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-3xl font-bold text-green-600">{stats.totalApproved}</p>
 </CardContent>
 </Card>
 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-sm">Reddedilen</CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-3xl font-bold text-red-600">{stats.totalRejected}</p>
 </CardContent>
 </Card>
 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-sm">Ort. Güven</CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-3xl font-bold">%{(stats.avgConfidence * 100).toFixed(0)}</p>
 </CardContent>
 </Card>
 </div>
 )}
 </TabsContent>
 </Tabs>
 )}
 </CardContent>
 </Card>

 {/* Review Dialog */}
 <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
 <DialogContent className="max-w-2xl">
 <DialogHeader>
 <DialogTitle>
 {reviewAction === 'approve' && 'Öneriyi Onayla'}
 {reviewAction === 'reject' && 'Öneriyi Reddet'}
 {reviewAction === 'modify' && 'Öneriyi Düzenle'}
 </DialogTitle>
 <DialogDescription>
 {selectedSuggestion?.title}
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-4">
 <div>
 <Label>Geri Bildirim (İsteğe Bağlı)</Label>
 <Textarea
 placeholder="Bu öneri hakkında notlarınız..."
 value={reviewNotes}
 onChange={(e) => setReviewNotes(e.target.value)}
 className="mt-2"
 />
 </div>

 <div>
 <Label>Öneri Kalitesi Değerlendirmesi (1-5)</Label>
 <div className="flex gap-2 mt-2">
 {[1, 2, 3, 4, 5].map((rating) => (
 <Button
 key={rating}
 size="sm"
 variant={feedbackRating === rating ? 'default' : 'outline'}
 onClick={() => setFeedbackRating(rating)}
 >
 {rating} 
 </Button>
 ))}
 </div>
 </div>
 </div>

 <DialogFooter>
 <Button
 variant="outline"
 onClick={() => setIsReviewDialogOpen(false)}
 >
 İptal
 </Button>
 <Button
 onClick={handleReview}
 disabled={approveMutation.isPending || rejectMutation.isPending}
 >
 {reviewAction === 'approve' && 'Onayla ve Uygula'}
 {reviewAction === 'reject' && 'Reddet'}
 {reviewAction === 'modify' && 'Düzenle ve Uygula'}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </>
 );
}