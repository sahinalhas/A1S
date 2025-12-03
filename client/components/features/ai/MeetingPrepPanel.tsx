import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/organisms/Tooltip';
import { 
 Users, 
 UserCog, 
 FileText, 
 Loader2, 
 Copy, 
 Check,
 Sparkles,
 Target,
 Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
 generateParentMeetingPrep,
 generateInterventionPlan,
 generateTeacherMeetingPrep
} from '@/lib/api/endpoints/ai-assistant.api';

interface MeetingPrepPanelProps {
 selectedStudent?: string;
 students?: any[];
}

export default function MeetingPrepPanel({ selectedStudent, students = [] }: MeetingPrepPanelProps) {
 const [activeTab, setActiveTab] = useState('parent');
 const [localStudentId, setLocalStudentId] = useState(selectedStudent || '');
 const [focusArea, setFocusArea] = useState('');
 const [meetingPurpose, setMeetingPurpose] = useState('');
 const [copiedType, setCopiedType] = useState<string | null>(null);

 const currentStudentId = selectedStudent || localStudentId;
 const currentStudent = students.find(s => s.id === currentStudentId);

 const parentMeetingMutation = useMutation({
 mutationFn: () => generateParentMeetingPrep(currentStudentId),
 onSuccess: () => {
 toast.success('Veli görüşmesi hazırlığı oluşturuldu');
 },
 onError: () => {
 toast.error('Hazırlık oluşturulamadı');
 }
 });

 const interventionMutation = useMutation({
 mutationFn: () => generateInterventionPlan(currentStudentId, focusArea),
 onSuccess: () => {
 toast.success('Müdahale planı oluşturuldu');
 },
 onError: () => {
 toast.error('Plan oluşturulamadı');
 }
 });

 const teacherMeetingMutation = useMutation({
 mutationFn: () => generateTeacherMeetingPrep(currentStudentId, meetingPurpose),
 onSuccess: () => {
 toast.success('Öğretmen toplantısı brifingi oluşturuldu');
 },
 onError: () => {
 toast.error('Brifing oluşturulamadı');
 }
 });

 const handleCopy = (content: string, type: string) => {
 navigator.clipboard.writeText(content);
 setCopiedType(type);
 setTimeout(() => setCopiedType(null), 2000);
 toast.success('Kopyalandı');
 };

 const renderContent = (content: string | undefined, type: string) => {
 if (!content) return null;

 return (
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <CardTitle>Oluşturulan İçerik</CardTitle>
 <Button
 variant="outline"
 size="sm"
 onClick={() => handleCopy(content, type)}

 >
 {copiedType === type ? (
 <>
 <Check className="h-4 w-4" />
 Kopyalandı
 </>
 ) : (
 <>
 <Copy className="h-4 w-4" />
 Kopyala
 </>
 )}
 </Button>
 </div>
 </CardHeader>
 <CardContent>
 <ScrollArea className="h-[500px] pr-4">
 <div className="prose prose-sm dark:prose-invert max-w-none">
 <ReactMarkdown remarkPlugins={[remarkGfm]}>
 {content}
 </ReactMarkdown>
 </div>
 </ScrollArea>
 </CardContent>
 </Card>
 );
 };

 if (!currentStudentId) {
 return (
 <Card className="border-dashed">
 <CardContent className="flex flex-col items-center justify-center py-12 text-center">
 <Target className="h-12 w-12 text-muted-foreground mb-4" />
 <p className="text-muted-foreground mb-4">
 Toplantı hazırlığı için lütfen bir öğrenci seçin
 </p>
 <Select value={localStudentId} onValueChange={setLocalStudentId}>
 <SelectTrigger className="w-64">
 <SelectValue placeholder="Öğrenci seçin..." />
 </SelectTrigger>
 <SelectContent>
 {students.map((student) => (
 <SelectItem key={student.id} value={student.id}>
 {student.name} {student.surname}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </CardContent>
 </Card>
 );
 }

 return (
 <TooltipProvider>
 <div className="space-y-6">
 {currentStudent && (
 <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Calendar className="h-5 w-5" />
 {currentStudent.name}
 </CardTitle>
 <CardDescription>
 {currentStudent.class} • Toplantı Hazırlık Asistanı
 </CardDescription>
 </CardHeader>
 </Card>
 )}

 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList variant="nested">
 <Tooltip delayDuration={200}>
 <TooltipTrigger asChild>
 <TabsTrigger value="parent" variant="nested">
 <Users className="h-4 w-4" />
 Veli Görüşmesi
 </TabsTrigger>
 </TooltipTrigger>
 <TooltipContent>Veli ile görüşme için konuşulacak noktalar ve stratejiler</TooltipContent>
 </Tooltip>
 <Tooltip delayDuration={200}>
 <TooltipTrigger asChild>
 <TabsTrigger value="intervention" variant="nested">
 <Target className="h-4 w-4" />
 Müdahale Planı
 </TabsTrigger>
 </TooltipTrigger>
 <TooltipContent>Belirli bir alandaki gelişim için adım adım müdahale stratejileri</TooltipContent>
 </Tooltip>
 <Tooltip delayDuration={200}>
 <TooltipTrigger asChild>
 <TabsTrigger value="teacher" variant="nested">
 <UserCog className="h-4 w-4" />
 Öğretmen Toplantısı
 </TabsTrigger>
 </TooltipTrigger>
 <TooltipContent>Öğretmenle koordinasyon için hazırlık ve bilgi aktarma noktaları</TooltipContent>
 </Tooltip>
 </TabsList>

 <TabsContent value="parent" className="space-y-4 mt-6">
 <Card>
 <CardHeader>
 <CardTitle>Veli Görüşmesi Hazırlığı</CardTitle>
 <CardDescription>
 AI destekli veli görüşmesi hazırlık notları oluştur
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex gap-2">
 <Button
 onClick={() => parentMeetingMutation.mutate()}
 disabled={parentMeetingMutation.isPending}

 >
 {parentMeetingMutation.isPending ? (
 <>
 <Loader2 className="h-4 w-4" />
 Oluşturuluyor...
 </>
 ) : (
 <>
 <Sparkles className="h-4 w-4" />
 Hazırlık Notları Oluştur
 </>
 )}
 </Button>
 </div>

 {parentMeetingMutation.data?.data?.prep && 
 renderContent(parentMeetingMutation.data.data.prep, 'parent')}
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="intervention" className="space-y-4 mt-6">
 <Card>
 <CardHeader>
 <CardTitle>Müdahale Planı Oluştur</CardTitle>
 <CardDescription>
 Öğrenci için özelleştirilmiş müdahale planı hazırla
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="focus-area">Odak Alan</Label>
 <Select value={focusArea} onValueChange={setFocusArea}>
 <SelectTrigger>
 <SelectValue placeholder="Odak alanı seçin..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="AKADEMİK">Akademik Başarı</SelectItem>
 <SelectItem value="DAVRANIŞSAL">Davranış Yönetimi</SelectItem>
 <SelectItem value="SOSYAL_DUYGUSAL">Sosyal-Duygusal Gelişim</SelectItem>
 <SelectItem value="DEVAMSIZLIK">Devamsızlık</SelectItem>
 <SelectItem value="MOTİVASYON">Motivasyon</SelectItem>
 <SelectItem value="AİLE_İLİŞKİLERİ">Aile İlişkileri</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="flex gap-2">
 <Button
 onClick={() => interventionMutation.mutate()}
 disabled={interventionMutation.isPending || !focusArea}

 >
 {interventionMutation.isPending ? (
 <>
 <Loader2 className="h-4 w-4" />
 Oluşturuluyor...
 </>
 ) : (
 <>
 <Sparkles className="h-4 w-4" />
 Plan Oluştur
 </>
 )}
 </Button>
 </div>

 {interventionMutation.data?.data?.plan && 
 renderContent(interventionMutation.data.data.plan, 'intervention')}
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="teacher" className="space-y-4 mt-6">
 <Card>
 <CardHeader>
 <CardTitle>Öğretmen Toplantısı Brifingi</CardTitle>
 <CardDescription>
 Öğretmen işbirliği için hazırlık brifingi oluştur
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="meeting-purpose">Toplantı Amacı (İsteğe Bağlı)</Label>
 <Input
 id="meeting-purpose"
 value={meetingPurpose}
 onChange={(e) => setMeetingPurpose(e.target.value)}
 placeholder="Örn: Akademik destek planı görüşmesi"
 />
 </div>

 <div className="flex gap-2">
 <Button
 onClick={() => teacherMeetingMutation.mutate()}
 disabled={teacherMeetingMutation.isPending}

 >
 {teacherMeetingMutation.isPending ? (
 <>
 <Loader2 className="h-4 w-4" />
 Oluşturuluyor...
 </>
 ) : (
 <>
 <Sparkles className="h-4 w-4" />
 Brifing Oluştur
 </>
 )}
 </Button>
 </div>

 {teacherMeetingMutation.data?.data?.brief && 
 renderContent(teacherMeetingMutation.data.data.brief, 'teacher')}
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 </TooltipProvider>
 );
}
