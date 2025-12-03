import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from "@/components/organisms/Dialog";
import {
 Form,
 FormControl,
 FormDescription,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/atoms/Select";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Badge } from "@/components/atoms/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Plus, Trash2, Edit2, GripVertical } from "lucide-react";
import { SurveyTemplate, SurveyQuestion, SurveyQuestionType } from "@/lib/survey-types";
import { useToast } from "@/hooks/utils/toast.utils";
import { 
 useTemplateQuestions,
 useUpdateTemplate,
 useCreateQuestion,
 useUpdateQuestion,
 useDeleteQuestion
} from "@/hooks/features/surveys";

const editSchema = z.object({
 title: z.string().min(1,"Başlık gereklidir"),
 description: z.string().optional(),
 tags: z.array(z.string()),
 targetAudience: z.enum([
"STUDENT",
"PARENT",
"TEACHER",
"ADMINISTRATOR",
"STAFF",
"ALUMNI",
"EXTERNAL_STAKEHOLDER"
 ]),
});

const targetAudienceLabels: Record<string, string> = {
 STUDENT:"Öğrenci Anketleri",
 PARENT:"Veli Anketleri",
 TEACHER:"Öğretmen Anketleri",
 ADMINISTRATOR:"İdareci Anketleri",
 STAFF:"Personel Anketleri",
 ALUMNI:"Mezun Anketleri",
 EXTERNAL_STAKEHOLDER:"Kurum Dışı Paydaş Anketleri"
};

const questionSchema = z.object({
 questionText: z.string().min(1,"Soru metni gereklidir"),
 questionType: z.enum(["MULTIPLE_CHOICE","OPEN_ENDED","LIKERT","YES_NO","RATING","DROPDOWN"]),
 options: z.array(z.string()).optional(),
 required: z.boolean(),
 orderIndex: z.number(),
});

type EditForm = z.infer<typeof editSchema>;
type QuestionForm = z.infer<typeof questionSchema>;

interface SurveyTemplateEditDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 template: SurveyTemplate;
 onEditComplete?: () => void;
}

const QUESTION_TYPES: { value: SurveyQuestionType; label: string }[] = [
 { value:"MULTIPLE_CHOICE", label:"Çoktan Seçmeli" },
 { value:"LIKERT", label:"Likert Ölçeği" },
 { value:"OPEN_ENDED", label:"Açık Uçlu" },
 { value:"RATING", label:"Puanlama" },
 { value:"YES_NO", label:"Evet/Hayır" },
 { value:"DROPDOWN", label:"Açılır Liste" },
];

export default function SurveyTemplateEditDialog({
 open,
 onOpenChange,
 template,
 onEditComplete
}: SurveyTemplateEditDialogProps) {
 const { toast } = useToast();
 const [activeTab, setActiveTab] = useState("info");
 const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
 const [showQuestionForm, setShowQuestionForm] = useState(false);
 const [newTag, setNewTag] = useState("");

 const { data: questions = [], isLoading: loadingQuestions } = useTemplateQuestions(
 template.id,
 open && !!template.id
 );
 
 const updateTemplate = useUpdateTemplate();
 const createQuestion = useCreateQuestion();
 const updateQuestion = useUpdateQuestion();
 const deleteQuestion = useDeleteQuestion();

 const form = useForm<EditForm>({
 resolver: zodResolver(editSchema),
 defaultValues: {
 title: template.title,
 description: template.description ||"",
 tags: template.tags || [],
 targetAudience: template.targetAudience ||"STUDENT",
 },
 });

 const questionForm = useForm<QuestionForm>({
 resolver: zodResolver(questionSchema),
 defaultValues: {
 questionText:"",
 questionType:"MULTIPLE_CHOICE",
 options: [],
 required: true,
 orderIndex: 0,
 },
 });

 useEffect(() => {
 if (open && template) {
 form.reset({
 title: template.title,
 description: template.description ||"",
 tags: template.tags || [],
 targetAudience: template.targetAudience ||"STUDENT",
 });
 } else if (!open) {
 form.reset();
 }
 }, [open, template, form]);

 const onSubmit = async (data: EditForm) => {
 try {
 await updateTemplate.mutateAsync({ id: template.id, data });
 onOpenChange(false);
 
 if (onEditComplete) {
 await onEditComplete();
 }
 } catch (error) {
 console.error("Error updating template:", error);
 }
 };

 const handleAddQuestion = () => {
 setEditingQuestion(null);
 questionForm.reset({
 questionText:"",
 questionType:"MULTIPLE_CHOICE",
 options: [],
 required: true,
 orderIndex: questions.length,
 });
 setShowQuestionForm(true);
 };

 const handleEditQuestion = (question: SurveyQuestion) => {
 setEditingQuestion(question);
 questionForm.reset({
 questionText: question.questionText,
 questionType: question.questionType,
 options: question.options || [],
 required: question.required,
 orderIndex: question.orderIndex,
 });
 setShowQuestionForm(true);
 };

 const handleDeleteQuestion = async (questionId: string) => {
 if (!confirm("Bu soruyu silmek istediğinizden emin misiniz?")) {
 return;
 }

 try {
 await deleteQuestion.mutateAsync({ questionId, templateId: template.id });
 } catch (error) {
 console.error("Error deleting question:", error);
 }
 };

 const onQuestionSubmit = async (data: QuestionForm) => {
 try {
 if (editingQuestion) {
 await updateQuestion.mutateAsync({ 
 id: editingQuestion.id, 
 data: { ...data, templateId: template.id }
 });
 } else {
 await createQuestion.mutateAsync({
 ...data,
 templateId: template.id,
 });
 }

 setShowQuestionForm(false);
 setEditingQuestion(null);
 questionForm.reset();
 } catch (error) {
 console.error("Error saving question:", error);
 }
 };

 const watchedQuestionType = questionForm.watch("questionType");
 const needsOptions = ["MULTIPLE_CHOICE","LIKERT","DROPDOWN"].includes(watchedQuestionType);

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
 <DialogHeader>
 <DialogTitle>Anket Şablonunu Düzenle</DialogTitle>
 <DialogDescription>
 Anket şablonunun bilgilerini ve sorularını güncelleyin
 </DialogDescription>
 </DialogHeader>

 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
 <TabsList variant="nested">
 <TabsTrigger value="info" variant="nested">Temel Bilgiler</TabsTrigger>
 <TabsTrigger value="questions" variant="nested">
 Sorular ({questions.length})
 </TabsTrigger>
 </TabsList>

 <TabsContent value="info" className="space-y-6">
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
 <FormField
 control={form.control}
 name="title"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Anket Başlığı</FormLabel>
 <FormControl>
 <Input {...field} placeholder="Örn: Öğrenci Memnuniyet Anketi" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="description"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Açıklama</FormLabel>
 <FormControl>
 <Textarea {...field} placeholder="Anket açıklaması..." rows={3} />
 </FormControl>
 <FormDescription>
 Anketin amacını ve kapsamını açıklayın
 </FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
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
 control={form.control}
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
 <Badge key={tag} variant="secondary">
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
 <FormDescription>
 Anketinizi kategorize etmek için etiketler ekleyin
 </FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />

 <DialogFooter>
 <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
 İptal
 </Button>
 <Button type="submit">
 Bilgileri Güncelle
 </Button>
 </DialogFooter>
 </form>
 </Form>
 </TabsContent>

 <TabsContent value="questions" className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-lg font-medium">Anket Soruları</h3>
 <p className="text-sm text-muted-foreground">
 Soruları ekleyin, düzenleyin veya silin
 </p>
 </div>
 <Button onClick={handleAddQuestion} size="sm">
 <Plus className="mr-2 h-4 w-4" />
 Yeni Soru
 </Button>
 </div>

 {showQuestionForm && (
 <Card>
 <CardHeader>
 <CardTitle>{editingQuestion ?"Soruyu Düzenle" :"Yeni Soru Ekle"}</CardTitle>
 </CardHeader>
 <CardContent>
 <Form {...questionForm}>
 <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-4">
 <FormField
 control={questionForm.control}
 name="questionText"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Soru Metni</FormLabel>
 <FormControl>
 <Textarea {...field} placeholder="Sorunuzu buraya yazın..." rows={3} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <div className="grid grid-cols-2 gap-4">
 <FormField
 control={questionForm.control}
 name="questionType"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Soru Türü</FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 {QUESTION_TYPES.map((type) => (
 <SelectItem key={type.value} value={type.value}>
 {type.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={questionForm.control}
 name="required"
 render={({ field }) => (
 <FormItem className="flex items-center justify-between rounded-lg border p-4">
 <FormLabel>Zorunlu Soru</FormLabel>
 <FormControl>
 <Checkbox
 checked={field.value}
 onCheckedChange={field.onChange}
 />
 </FormControl>
 </FormItem>
 )}
 />
 </div>

 {needsOptions && (
 <FormField
 control={questionForm.control}
 name="options"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Seçenekler</FormLabel>
 <FormDescription>
 Her seçeneği virgül ile ayırın
 </FormDescription>
 <FormControl>
 <Textarea
 value={field.value?.join(",") ||""}
 onChange={(e) => {
 const options = e.target.value
 .split(",")
 .map(opt => opt.trim())
 .filter(opt => opt.length > 0);
 field.onChange(options);
 }}
 placeholder="Ör: Kesinlikle Katılıyorum, Katılıyorum, Kararsızım, Katılmıyorum"
 rows={3}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 )}

 <div className="flex gap-2 justify-end">
 <Button
 type="button"
 variant="outline"
 onClick={() => {
 setShowQuestionForm(false);
 setEditingQuestion(null);
 questionForm.reset();
 }}
 >
 İptal
 </Button>
 <Button type="submit">
 {editingQuestion ?"Güncelle" :"Ekle"}
 </Button>
 </div>
 </form>
 </Form>
 </CardContent>
 </Card>
 )}

 {loadingQuestions ? (
 <div className="text-center py-8 text-muted-foreground">
 Yükleniyor...
 </div>
 ) : questions.length === 0 ? (
 <div className="text-center py-12 border-2 border-dashed rounded-lg">
 <p className="text-muted-foreground">Henüz soru eklenmemiş</p>
 <Button onClick={handleAddQuestion} variant="outline" className="mt-4">
 <Plus className="mr-2 h-4 w-4" />
 İlk Soruyu Ekle
 </Button>
 </div>
 ) : (
 <div className="space-y-3">
 {questions.map((question, index) => (
 <Card key={question.id}>
 <CardContent className="pt-6">
 <div className="flex items-start gap-3">
 <div className="flex-shrink-0">
 <GripVertical className="h-5 w-5 text-muted-foreground" />
 </div>
 <div className="flex-1">
 <div className="flex items-start justify-between">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <Badge variant="outline">{index + 1}</Badge>
 <Badge variant="secondary">
 {QUESTION_TYPES.find(t => t.value === question.questionType)?.label}
 </Badge>
 {question.required && (
 <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
 )}
 </div>
 <p className="text-sm font-medium">{question.questionText}</p>
 {question.options && question.options.length > 0 && (
 <div className="text-xs text-muted-foreground">
 Seçenekler: {question.options.join(",")}
 </div>
 )}
 </div>
 <div className="flex gap-2">
 <Button
 size="sm"
 variant="ghost"
 onClick={() => handleEditQuestion(question)}
 >
 <Edit2 className="h-4 w-4" />
 </Button>
 <Button
 size="sm"
 variant="ghost"
 onClick={() => handleDeleteQuestion(question.id)}
 className="text-destructive"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 )}

 <DialogFooter>
 <Button variant="outline" onClick={() => onOpenChange(false)}>
 Kapat
 </Button>
 </DialogFooter>
 </TabsContent>
 </Tabs>
 </DialogContent>
 </Dialog>
 );
}
