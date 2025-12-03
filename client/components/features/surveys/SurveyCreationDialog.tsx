import { useState } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from 'uuid';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/organisms/Dialog";
import { Form } from "@/components/organisms/Form";
import { Button } from "@/components/atoms/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Settings, FileText, Loader2 } from "lucide-react";
import { BasicInfoForm } from "./forms/BasicInfoForm";
import { QuestionsForm } from "./forms/QuestionsForm";
import { surveyTemplateSchema, SurveyTemplateForm } from "./types";
import { useCreateTemplate, useCreateQuestion } from "@/hooks/features/surveys";
import { useToast } from "@/hooks/utils/toast.utils";

interface SurveyCreationDialogProps {
 children: React.ReactNode;
}

export default function SurveyCreationDialog({ 
 children
}: SurveyCreationDialogProps) {
 const { toast } = useToast();
 const [open, setOpen] = useState(false);
 const [currentStep, setCurrentStep] = useState<"template" |"questions">("template");
 const [isCreatingQuestions, setIsCreatingQuestions] = useState(false);

 const createTemplate = useCreateTemplate();
 const createQuestion = useCreateQuestion();

 const form = useForm<SurveyTemplateForm>({
 resolver: zodResolver(surveyTemplateSchema),
 defaultValues: {
 title:"",
 description:"",
 tags: [],
 targetAudience:"STUDENT",
 questions: []
 }
 });

 const { fields: questions, append, remove } = useFieldArray<SurveyTemplateForm,"questions">({
 control: form.control,
 name:"questions",
 });

 const onSubmit: SubmitHandler<SurveyTemplateForm> = async (data) => {
 try {
 const templateId = uuidv4();
 const templateData = {
 id: templateId,
 title: data.title,
 description: data.description ||"",
 createdBy:"user",
 tags: data.tags || [],
 targetAudience: data.targetAudience ||"STUDENT"
 };

 await createTemplate.mutateAsync(templateData);

 if (data.questions.length > 0) {
 setIsCreatingQuestions(true);
 
 const questionPromises = data.questions.map((question, i) => {
 const questionData = {
 id: `question_${templateId}_${i}`,
 templateId: templateId,
 questionText: question.questionText,
 questionType: question.questionType,
 required: question.required,
 orderIndex: i,
 options: question.options,
 validation: question.validation
 };
 return createQuestion.mutateAsync(questionData);
 });

 await Promise.all(questionPromises);
 setIsCreatingQuestions(false);
 }

 toast({
 title:"Başarılı",
 description: `Anket şablonu ${data.questions.length > 0 ? `ve ${data.questions.length} soru` : ''} oluşturuldu`,
 });

 setOpen(false);
 form.reset();
 setCurrentStep("template");
 } catch (error) {
 setIsCreatingQuestions(false);
 toast({
 title:"Hata",
 description: error instanceof Error ? error.message :"Anket oluşturulurken bir hata oluştu",
 variant:"destructive",
 });
 }
 };

 const isLoading = createTemplate.isPending || isCreatingQuestions;

 return (
 <Dialog open={open} onOpenChange={setOpen}>
 <DialogTrigger asChild>
 {children}
 </DialogTrigger>
 <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
 <DialogHeader>
 <DialogTitle>Yeni Anket Oluştur</DialogTitle>
 <DialogDescription>
 Anket şablonunuzu oluşturun ve sorularınızı ekleyin
 </DialogDescription>
 </DialogHeader>

 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
 <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as"template" |"questions")}>
 <TabsList variant="nested">
 <TabsTrigger value="template" variant="nested" disabled={isLoading}>
 <Settings className="mr-2 h-4 w-4" />
 Temel Bilgiler
 </TabsTrigger>
 <TabsTrigger value="questions" variant="nested" disabled={isLoading}>
 <FileText className="mr-2 h-4 w-4" />
 Sorular
 </TabsTrigger>
 </TabsList>

 <TabsContent value="template" className="space-y-4">
 <BasicInfoForm control={form.control} />
 
 <div className="flex justify-end">
 <Button 
 type="button" 
 onClick={() => setCurrentStep("questions")}
 disabled={isLoading}
 >
 Sonraki: Sorular
 </Button>
 </div>
 </TabsContent>

 <TabsContent value="questions" className="space-y-4">
 <QuestionsForm
 control={form.control}
 questions={questions}
 append={append}
 remove={remove}
 setValue={form.setValue}
 watch={form.watch}
 />

 <div className="flex justify-between">
 <Button 
 type="button" 
 variant="outline"
 onClick={() => setCurrentStep("template")}
 disabled={isLoading}
 >
 Önceki
 </Button>
 <Button type="submit" disabled={isLoading}>
 {isLoading ? (
 <>
 <Loader2 className="mr-2 h-4 w-4" />
 {isCreatingQuestions ?"Sorular ekleniyor..." :"Şablon oluşturuluyor..."}
 </>
 ) : (
"Anket Oluştur"
 )}
 </Button>
 </div>
 </TabsContent>
 </Tabs>
 </form>
 </Form>
 </DialogContent>
 </Dialog>
 );
}
