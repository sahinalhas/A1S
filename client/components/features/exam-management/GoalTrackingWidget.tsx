import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card/card';
import { Button } from '@/components/atoms/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/organisms/Dialog/dialog';
import { Input } from '@/components/atoms/Input/input';
import { Label } from '@/components/atoms/Label/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select/select';
import { Progress } from '@/components/atoms/Progress/progress';
import { Badge } from '@/components/atoms/Badge/badge';
import { Target, Plus, TrendingUp, Calendar, X } from 'lucide-react';
import { toast } from 'sonner';

async function fetchGoals(studentId: string) {
 const response = await fetchWithSchool(`/api/exam-management/goals/student/${studentId}`);
 const result = await response.json();
 if (!result.success) throw new Error(result.error);
 return result.data;
}

async function createGoal(data: any) {
 const response = await fetchWithSchool('/api/exam-management/goals', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(data),
 });
 const result = await response.json();
 if (!result.success) throw new Error(result.error);
 return result.data;
}

interface GoalTrackingWidgetProps {
 studentId: string;
 examTypes: any[];
 subjects: any[];
}

export function GoalTrackingWidget({ studentId, examTypes, subjects }: GoalTrackingWidgetProps) {
 const [isDialogOpen, setIsDialogOpen] = useState(false);
 const [formData, setFormData] = useState({
 exam_type_id: '',
 subject_id: '',
 target_net: '',
 deadline: '',
 priority: 'medium',
 });

 const queryClient = useQueryClient();

 const { data: goals, isLoading } = useQuery({
 queryKey: ['student-goals', studentId],
 queryFn: () => fetchGoals(studentId),
 });

 const createMutation = useMutation({
 mutationFn: createGoal,
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['student-goals', studentId] });
 toast.success('Hedef oluşturuldu');
 setIsDialogOpen(false);
 setFormData({ exam_type_id: '', subject_id: '', target_net: '', deadline: '', priority: 'medium' });
 },
 onError: (error: any) => {
 toast.error(error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Hedef oluşturulamadı');
 },
 });

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 createMutation.mutate({
 student_id: studentId,
 ...formData,
 target_net: parseFloat(formData.target_net),
 });
 };

 const getPriorityColor = (priority: string) => {
 switch (priority) {
 case 'high': return 'bg-red-100 text-red-700 border-red-200';
 case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
 case 'low': return 'bg-green-100 text-green-700 border-green-200';
 default: return 'bg-gray-100 text-gray-700 border-gray-200';
 }
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'achieved': return 'bg-emerald-100 text-emerald-700';
 case 'active': return 'bg-blue-100 text-blue-700';
 case 'cancelled': return 'bg-gray-100 text-gray-700';
 default: return 'bg-gray-100 text-gray-700';
 }
 };

 return (
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="flex items-center gap-2">
 <Target className="h-5 w-5 text-primary" />
 Hedef Takip
 </CardTitle>
 <CardDescription>Belirlenen hedefler ve ilerleme durumu</CardDescription>
 </div>
 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
 <DialogTrigger asChild>
 <Button size="sm">
 <Plus className="h-4 w-4 mr-2" />
 Yeni Hedef
 </Button>
 </DialogTrigger>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Yeni Hedef Belirle</DialogTitle>
 <DialogDescription>Öğrenci için yeni bir performans hedefi oluşturun</DialogDescription>
 </DialogHeader>
 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <Label>Sınav Türü</Label>
 <Select value={formData.exam_type_id} onValueChange={(v) => setFormData({ ...formData, exam_type_id: v })}>
 <SelectTrigger>
 <SelectValue placeholder="Seçin" />
 </SelectTrigger>
 <SelectContent>
 {examTypes.map((type) => (
 <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label>Ders (Opsiyonel)</Label>
 <Select value={formData.subject_id} onValueChange={(v) => setFormData({ ...formData, subject_id: v })}>
 <SelectTrigger>
 <SelectValue placeholder="Genel" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="">Genel</SelectItem>
 {subjects.map((subject) => (
 <SelectItem key={subject.id} value={subject.id}>{subject.subject_name}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label>Hedef Net</Label>
 <Input
 type="number"
 step="0.1"
 value={formData.target_net}
 onChange={(e) => setFormData({ ...formData, target_net: e.target.value })}
 required
 />
 </div>
 <div>
 <Label>Son Tarih (Opsiyonel)</Label>
 <Input
 type="date"
 value={formData.deadline}
 onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
 />
 </div>
 <div>
 <Label>Öncelik</Label>
 <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="high">Yüksek</SelectItem>
 <SelectItem value="medium">Orta</SelectItem>
 <SelectItem value="low">Düşük</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <Button type="submit" className="w-full" disabled={createMutation.isPending}>
 {createMutation.isPending ? 'Oluşturuluyor...' : 'Hedef Oluştur'}
 </Button>
 </form>
 </DialogContent>
 </Dialog>
 </div>
 </CardHeader>
 <CardContent>
 {isLoading ? (
 <div className="space-y-3">
 {[...Array(3)].map((_, i) => (
 <div key={i} className="h-20 bg-muted rounded" />
 ))}
 </div>
 ) : goals && goals.length > 0 ? (
 <div className="space-y-3">
 {goals.map((goal: any) => {
 const progress = (goal.current_net / goal.target_net) * 100;
 return (
 <div key={goal.id} className="border rounded-lg p-4 space-y-2">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <h4 className="font-medium">{goal.exam_type_name}</h4>
 {goal.subject_name && <span className="text-sm text-muted-foreground">• {goal.subject_name}</span>}
 <Badge variant="outline" className={getPriorityColor(goal.priority)}>
 {goal.priority === 'high' ? 'Yüksek' : goal.priority === 'medium' ? 'Orta' : 'Düşük'}
 </Badge>
 <Badge className={getStatusColor(goal.status)}>
 {goal.status === 'achieved' ? 'Ulaşıldı' : goal.status === 'active' ? 'Aktif' : 'İptal'}
 </Badge>
 </div>
 <div className="flex items-center gap-4 text-sm">
 <span className="font-semibold text-primary">{goal.current_net.toFixed(1)} / {goal.target_net.toFixed(1)} net</span>
 {goal.deadline && (
 <span className="flex items-center gap-1 text-muted-foreground">
 <Calendar className="h-3 w-3" />
 {new Date(goal.deadline).toLocaleDateString('tr-TR')}
 </span>
 )}
 </div>
 </div>
 </div>
 <div className="space-y-1">
 <div className="flex items-center justify-between text-xs text-muted-foreground">
 <span>İlerleme</span>
 <span>%{Math.min(100, progress).toFixed(0)}</span>
 </div>
 <Progress value={Math.min(100, progress)} />
 </div>
 {progress >= 100 && goal.status === 'active' && (
 <div className="flex items-center gap-2 text-sm text-green-600">
 <TrendingUp className="h-4 w-4" />
 Hedefe ulaştınız!
 </div>
 )}
 </div>
 );
 })}
 </div>
 ) : (
 <div className="text-center py-8 text-muted-foreground">
 <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
 <p>Henüz hedef belirlenmemiş</p>
 <p className="text-sm">Yeni hedef eklemek için yukarıdaki butonu kullanın</p>
 </div>
 )}
 </CardContent>
 </Card>
 );
}
