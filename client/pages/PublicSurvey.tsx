import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Progress } from "@/components/atoms/Progress";
import { Input } from "@/components/atoms/Input";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import { RadioGroup, RadioGroupItem } from "@/components/atoms/RadioGroup";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Label } from "@/components/atoms/Label";
import {
 Form,
 FormControl,
 FormDescription,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from "@/components/organisms/Form";
import { 
 FileText, 
 Clock, 
 Users, 
 CheckCircle, 
 AlertCircle,
 ArrowLeft,
 ArrowRight,
 Send,
 Lock
} from "lucide-react";
import { 
 SurveyDistribution, 
 SurveyTemplate, 
 SurveyQuestion, 
 SurveyQuestionType,
 StudentInfo 
} from "@/lib/survey-types";
import { useToast } from "@/hooks/utils/toast.utils";
import { apiClient } from "@/lib/api/core/client";
import { SURVEY_ENDPOINTS } from "@/lib/constants/api-endpoints";

const surveyResponseSchema = z.object({
 studentInfo: z.object({
 name: z.string().optional(),
 class: z.string().optional(),
 number: z.string().optional(),
 studentId: z.string().optional(),
 }).optional(),
 responseData: z.record(z.any()),
});

type SurveyResponseForm = z.infer<typeof surveyResponseSchema>;

export default function PublicSurvey() {
 const { publicLink } = useParams<{ publicLink: string }>();
 const searchParams = new URLSearchParams(window.location.search);
 const codeFromURL = searchParams.get('code');
 const navigate = useNavigate();
 const { toast } = useToast();
 
 const [distribution, setDistribution] = useState<SurveyDistribution | null>(null);
 const [template, setTemplate] = useState<SurveyTemplate | null>(null);
 const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [validationError, setValidationError] = useState<string | null>(null);
 const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
 const [isSubmitted, setIsSubmitted] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [needsSecurityCode, setNeedsSecurityCode] = useState(false);
 const [securityCodeInput, setSecurityCodeInput] = useState('');
 const [verifiedCode, setVerifiedCode] = useState<string | null>(codeFromURL);
 const [codeVerifying, setCodeVerifying] = useState(false);
 const [alreadySubmitted, setAlreadySubmitted] = useState(false);

 const form = useForm<SurveyResponseForm>({
 resolver: zodResolver(surveyResponseSchema),
 defaultValues: {
 studentInfo: {},
 responseData: {},
 },
 });

 useEffect(() => {
 if (publicLink) {
 const abortController = new AbortController();
 loadSurveyData(abortController.signal);
 return () => abortController.abort();
 }
 }, [publicLink]);

 const loadSurveyData = async (signal?: AbortSignal) => {
 try {
 setLoading(true);
 setError(null);

 // Load survey distribution by public link
 const distributionData = await apiClient.get<SurveyDistribution>(
 SURVEY_ENDPOINTS.DISTRIBUTION_BY_LINK(publicLink!),
 { showErrorToast: false, skipAuth: true }
 );
 setDistribution(distributionData);

 // Check if anket süresi dolmuşsa
 if (distributionData.endDate && new Date() > new Date(distributionData.endDate)) {
   setError('Anket süresi dolmuştur. Artık yanıt veremezsiniz.');
   setLoading(false);
   return;
 }

 // Check if security code is required
 if (distributionData.participationType === 'SECURITY_CODE' && !verifiedCode) {
   setNeedsSecurityCode(true);
   setLoading(false);
   return; // Don't load survey data yet
 }

 // Load survey template
 const templateData = await apiClient.get<SurveyTemplate>(
 SURVEY_ENDPOINTS.TEMPLATE_BY_ID(distributionData.templateId),
 { showErrorToast: false, skipAuth: true }
 );
 setTemplate(templateData);

 // Load questions
 const questionsData = await apiClient.get<SurveyQuestion[]>(
 SURVEY_ENDPOINTS.QUESTIONS(distributionData.templateId),
 { showErrorToast: false, skipAuth: true }
 );
 setQuestions(questionsData.sort((a: SurveyQuestion, b: SurveyQuestion) => a.orderIndex - b.orderIndex));

 setLoading(false);
 } catch (error: unknown) {
 if (error instanceof Error && error.name === 'AbortError') {
 return;
 }
 console.error('Error loading survey data:', error);
 setError(error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Anket yüklenirken hata oluştu');
 setLoading(false);
 }
 };

 const handleVerifyCode = async (code: string) => {
 try {
   if (!code.trim()) {
     toast({ title: 'Hata', description: 'Lütfen bir kod giriniz', variant: 'destructive' });
     return;
   }
   setCodeVerifying(true);
   const result = await apiClient.post(
     SURVEY_ENDPOINTS.VERIFY_CODE,
     { code },
     { showErrorToast: false, skipAuth: true }
   );
   
   setVerifiedCode(code);
   setSecurityCodeInput('');
   setNeedsSecurityCode(false);
   // Re-load survey data now that code is verified
   await loadSurveyData();
   toast({ title: 'Başarılı', description: 'Kod doğrulandı' });
 } catch (error) {
   const errorMsg = error instanceof Error ? error.message : 'Kod doğrulanamadı';
   toast({ title: 'Hata', description: errorMsg, variant: 'destructive' });
 } finally {
   setCodeVerifying(false);
 }
 };

 const handleSubmit = async (data: SurveyResponseForm) => {
 // Duplicate submission kontrolü
 if (alreadySubmitted || isSubmitted) {
   toast({ title: 'Uyarı', description: 'Bu anket zaten doldurulmuş', variant: 'destructive' });
   return;
 }

 // Validate ALL required questions before submission
 const isFormValid = validateAllRequiredQuestions();
 if (!isFormValid) {
 return; // Validation error is already set and user is navigated to problem
 }

 try {
 setIsSubmitting(true);

 const responseData = {
 distributionId: distribution?.id,
 studentInfo: data.studentInfo,
 responseData: data.responseData,
 submissionType: 'ONLINE',
 submittedAt: new Date().toISOString(),
 };
 
 console.log('📤 Submitting survey response:', {
   distributionId: responseData.distributionId,
   hasStudentInfo: !!responseData.studentInfo,
   responseDataKeys: Object.keys(responseData.responseData || {}).length,
   submissionType: responseData.submissionType
 });

 await apiClient.post(
 SURVEY_ENDPOINTS.RESPONSES,
 responseData,
 {
 showSuccessToast: true,
 successMessage:"Anket yanıtınız başarıyla gönderildi",
 showErrorToast: false,
 skipAuth: true,
 }
 );

 setAlreadySubmitted(true);
 setIsSubmitted(true);
 toast({ 
 title:"Başarılı", 
 description:"Anket yanıtınız başarıyla gönderildi" 
 });
 } catch (error) {
 console.error('Error submitting survey response:', error);
 const errorMessage = error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Yanıt gönderilirken hata oluştu';
 setValidationError(errorMessage);
 toast({ 
 title:"Hata", 
 description: errorMessage, 
 variant:"destructive" 
 });
 } finally {
 setIsSubmitting(false);
 }
 };

 const validateCurrentStep = () => {
 setValidationError(null);
 
 const currentQuestion = questions[currentQuestionIndex];
 const formValues = form.getValues();
 
 // Validate student info if on first question and not anonymous
 if (currentQuestionIndex === 0 && distribution?.participationType !== 'PUBLIC') {
 const studentInfo = formValues.studentInfo;
 if (!studentInfo?.name || !studentInfo?.class || !studentInfo?.number) {
 setValidationError('Öğrenci bilgileri zorunludur. Lütfen ad soyad, sınıf ve öğrenci numaranızı giriniz.');
 return false;
 }
 }
 
 // Check if current question is required and has a value
 if (currentQuestion.required) {
 const answer = formValues.responseData?.[currentQuestion.id];
 if (!answer || answer === '' || answer === null || answer === undefined) {
 setValidationError('Bu soru zorunludur. Lütfen yanıtlayın.');
 return false;
 }
 }
 
 return true;
 };

 const validateAllRequiredQuestions = () => {
 setValidationError(null);
 
 const formValues = form.getValues();
 
 // Validate student info if not anonymous
 if (distribution?.participationType !== 'PUBLIC') {
 const studentInfo = formValues.studentInfo;
 if (!studentInfo?.name || !studentInfo?.class || !studentInfo?.number) {
 setValidationError('Öğrenci bilgileri eksik. Lütfen tüm alanları doldurun.');
 return false;
 }
 }
 
 // Check all required questions
 for (const question of questions) {
 if (question.required) {
 const answer = formValues.responseData?.[question.id];
 if (!answer || answer === '' || answer === null || answer === undefined) {
 setValidationError(`Soru ${question.orderIndex + 1} zorunludur ve yanıtlanmamış. Lütfen tüm zorunlu soruları yanıtlayın.`);
 
 // Navigate to the unanswered question
 const questionIndex = questions.findIndex(q => q.id === question.id);
 if (questionIndex !== -1) {
 setCurrentQuestionIndex(questionIndex);
 }
 
 return false;
 }
 }
 }
 
 return true;
 };

 const handleNextQuestion = () => {
 const isStepValid = validateCurrentStep();
 
 if (!isStepValid) {
 return;
 }
 
 if (currentQuestionIndex < questions.length - 1) {
 setCurrentQuestionIndex(currentQuestionIndex + 1);
 }
 };

 const handlePreviousQuestion = () => {
 setValidationError(null);
 setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
 };

 const renderQuestionInput = (question: SurveyQuestion) => {
 const fieldName = `responseData.${question.id}` as any;

 switch (question.questionType) {
 case 'MULTIPLE_CHOICE':
 return (
 <FormField
 control={form.control}
 name={fieldName}
 rules={{ required: question.required }}
 render={({ field }) => (
 <FormItem className="space-y-3">
 <FormControl>
 <RadioGroup
 onValueChange={field.onChange}
 value={field.value}
 className="flex flex-col space-y-1"
 >
 {question.options?.map((option, index) => (
 <div key={index} className="flex items-center space-x-2">
 <RadioGroupItem value={option} id={`${question.id}-${index}`} />
 <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
 </div>
 ))}
 </RadioGroup>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 );

 case 'OPEN_ENDED':
 return (
 <FormField
 control={form.control}
 name={fieldName}
 rules={{ required: question.required }}
 render={({ field }) => (
 <FormItem>
 <FormControl>
 <Textarea
 placeholder="Yanıtınızı buraya yazın..."
 className="min-h-[100px]"
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 );

 case 'YES_NO':
 return (
 <FormField
 control={form.control}
 name={fieldName}
 rules={{ required: question.required }}
 render={({ field }) => (
 <FormItem className="space-y-3">
 <FormControl>
 <RadioGroup
 onValueChange={field.onChange}
 value={field.value}
 className="flex flex-row space-x-6"
 >
 <div className="flex items-center space-x-2">
 <RadioGroupItem value="evet" id={`${question.id}-yes`} />
 <Label htmlFor={`${question.id}-yes`}>Evet</Label>
 </div>
 <div className="flex items-center space-x-2">
 <RadioGroupItem value="hayir" id={`${question.id}-no`} />
 <Label htmlFor={`${question.id}-no`}>Hayır</Label>
 </div>
 </RadioGroup>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 );

 case 'LIKERT':
 const likertOptions = ['1 - Kesinlikle Katılmıyorum', '2 - Katılmıyorum', '3 - Kararsızım', '4 - Katılıyorum', '5 - Kesinlikle Katılıyorum'];
 return (
 <FormField
 control={form.control}
 name={fieldName}
 rules={{ required: question.required }}
 render={({ field }) => (
 <FormItem className="space-y-3">
 <FormControl>
 <RadioGroup
 onValueChange={field.onChange}
 value={field.value}
 className="flex flex-col space-y-1"
 >
 {likertOptions.map((option, index) => (
 <div key={index} className="flex items-center space-x-2">
 <RadioGroupItem value={option} id={`${question.id}-${index}`} />
 <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
 </div>
 ))}
 </RadioGroup>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 );

 case 'RATING':
 return (
 <FormField
 control={form.control}
 name={fieldName}
 rules={{ required: question.required }}
 render={({ field }) => (
 <FormItem>
 <FormControl>
 <div className="flex items-center space-x-4">
 <span className="text-sm">1</span>
 <RadioGroup
 onValueChange={field.onChange}
 value={field.value}
 className="flex flex-row space-x-2"
 >
 {[1, 2, 3, 4, 5].map((rating) => (
 <div key={rating} className="flex items-center">
 <RadioGroupItem value={rating.toString()} id={`${question.id}-${rating}`} />
 <Label htmlFor={`${question.id}-${rating}`} className="sr-only">
 {rating}
 </Label>
 </div>
 ))}
 </RadioGroup>
 <span className="text-sm">5</span>
 </div>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 );

 case 'DROPDOWN':
 return (
 <FormField
 control={form.control}
 name={fieldName}
 rules={{ required: question.required }}
 render={({ field }) => (
 <FormItem>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Seçiniz..." />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 {question.options?.map((option, index) => (
 <SelectItem key={index} value={option}>
 {option}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />
 );

 default:
 return (
 <FormField
 control={form.control}
 name={fieldName}
 rules={{ required: question.required }}
 render={({ field }) => (
 <FormItem>
 <FormControl>
 <Input placeholder="Yanıtınızı giriniz..." {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 );
 }
 };

 if (loading) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 flex items-center justify-center">
 <div className="text-center space-y-4">
 <div className=" rounded-full h-14 w-14 border-b-2 border-primary mx-auto"></div>
 <p className="text-muted-foreground font-medium">Anket yükleniyor...</p>
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 flex items-center justify-center p-4">
 <Card className="w-full max-w-md border-border/40">
 <CardHeader className="text-center pb-4">
 <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
 <AlertCircle className="h-8 w-8 text-destructive" />
 </div>
 <CardTitle className="text-2xl font-semibold">Bir Sorun Oluştu</CardTitle>
 </CardHeader>
 <CardContent className="text-center space-y-6">
 <p className="text-muted-foreground">{error}</p>
 <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
 <ArrowLeft className="h-4 w-4" />
 Ana Sayfaya Dön
 </Button>
 </CardContent>
 </Card>
 </div>
 );
 }

 if (isSubmitted) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 flex items-center justify-center p-4">
 <Card className="w-full max-w-md border-border/40">
 <CardHeader className="text-center pb-4">
 <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
 <CheckCircle className="h-8 w-8 text-emerald-600" />
 </div>
 <CardTitle className="text-2xl font-semibold text-emerald-700">Başarılı!</CardTitle>
 </CardHeader>
 <CardContent className="text-center space-y-6">
 <p className="text-muted-foreground text-base">
 Anket yanıtınız başarıyla gönderildi. Katılımınız için teşekkür ederiz.
 </p>
 <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
 <ArrowLeft className="h-4 w-4" />
 Ana Sayfaya Dön
 </Button>
 </CardContent>
 </Card>
 </div>
 );
 }

 if (!distribution || !template || questions.length === 0) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 flex items-center justify-center p-4">
 <Card className="w-full max-w-md border-border/40">
 <CardHeader className="text-center pb-4">
 <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
 <AlertCircle className="h-8 w-8 text-amber-600" />
 </div>
 <CardTitle className="text-2xl font-semibold">Anket Bulunamadı</CardTitle>
 </CardHeader>
 <CardContent className="text-center space-y-6">
 <p className="text-muted-foreground">
 Aranan anket bulunamadı veya artık aktif değil.
 </p>
 <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
 <ArrowLeft className="h-4 w-4" />
 Ana Sayfaya Dön
 </Button>
 </CardContent>
 </Card>
 </div>
 );
 }

 // Show security code verification if needed
 if (needsSecurityCode) {
   return (
     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 flex items-center justify-center p-4 md:p-8">
       <Card className="w-full max-w-md border-border/40">
         <CardHeader>
           <CardTitle className="text-xl font-semibold">Güvenlik Kodu Gerekli</CardTitle>
           <CardDescription>Ankete erişmek için öğretmeninizin verdiği kodu giriniz</CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <div>
             <Label htmlFor="security-code">Güvenlik Kodu</Label>
             <Input
               id="security-code"
               placeholder="Kodunuzu giriniz"
               maxLength={6}
               onChange={(e) => setSecurityCodeInput(e.target.value.toUpperCase())}
               onKeyPress={(e) => e.key === 'Enter' && handleVerifyCode(securityCodeInput)}
               disabled={codeVerifying}
               className="text-center tracking-widest font-mono text-lg mt-1 h-11"
             />
           </div>
           <Button 
             onClick={() => handleVerifyCode(securityCodeInput)}
             disabled={codeVerifying || !securityCodeInput.trim()}
             className="w-full"
             size="lg"
           >
             {codeVerifying ? 'Doğrulanıyor...' : 'Doğrula'}
           </Button>
         </CardContent>
       </Card>
     </div>
   );
 }

 const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
 const currentQuestion = questions[currentQuestionIndex];

 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 py-8 md:py-12">
 <div className="max-w-3xl mx-auto px-4 sm:px-6">
 {/* Header */}
 <Card className="mb-6 border-border/40">
 <CardHeader className="space-y-3">
 <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
 <div className="flex-1">
 <CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight">{template.title}</CardTitle>
 {template.description && (
 <CardDescription className="mt-2 text-base">
 {template.description}
 </CardDescription>
 )}
 </div>
 <div className="flex items-center gap-2">
 {template.estimatedDuration && (
 <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
 <Clock className="h-3.5 w-3.5" />
 <span>{template.estimatedDuration} dk</span>
 </Badge>
 )}
 {template.mebCompliant && (
 <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
 MEB Uyumlu
 </Badge>
 )}
 </div>
 </div>
 </CardHeader>
 </Card>

 {/* Progress */}
 <Card className="mb-6 border-border/40">
 <CardContent className="pt-6 pb-5">
 <div className="flex items-center justify-between mb-3">
 <span className="text-sm font-medium text-foreground">İlerleme</span>
 <span className="text-sm font-medium text-muted-foreground">
 {currentQuestionIndex + 1} / {questions.length}
 </span>
 </div>
 <Progress value={progress} className="h-2.5" />
 </CardContent>
 </Card>

 {/* Survey Form */}
 <Form {...form}>
 <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
 {/* Student Info (if not anonymous) */}
 {currentQuestionIndex === 0 && distribution?.participationType !== 'PUBLIC' && (
 <Card className="border-border/40">
 <CardHeader className="pb-4">
 <CardTitle className="text-xl font-semibold">Öğrenci Bilgileri</CardTitle>
 <CardDescription className="text-base">
 Lütfen kimlik bilgilerinizi giriniz
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-5">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <FormField
 control={form.control}
 name="studentInfo.name"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-sm font-medium">Ad Soyad</FormLabel>
 <FormControl>
 <Input 
 placeholder="Ad Soyadınızı giriniz" 
 className="h-11"
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 <FormField
 control={form.control}
 name="studentInfo.class"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-sm font-medium">Sınıf</FormLabel>
 <FormControl>
 <Input 
 placeholder="Sınıfınızı giriniz (ör: 9/A)" 
 className="h-11"
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 <FormField
 control={form.control}
 name="studentInfo.number"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-sm font-medium">Öğrenci No</FormLabel>
 <FormControl>
 <Input 
 placeholder="Öğrenci numaranızı giriniz" 
 className="h-11"
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 </CardContent>
 </Card>
 )}

 {/* Current Question */}
 <Card className="border-border/40">
 <CardHeader className="pb-4">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <CardTitle className="text-xl font-semibold">
 Soru {currentQuestionIndex + 1}
 {currentQuestion.required && (
 <span className="text-destructive ml-1">*</span>
 )}
 </CardTitle>
 <CardDescription className="mt-2 text-base">
 {currentQuestion.questionText}
 </CardDescription>
 </div>
 <Badge variant="outline">
 {currentQuestion.questionType === 'MULTIPLE_CHOICE' && 'Çoktan Seçmeli'}
 {currentQuestion.questionType === 'OPEN_ENDED' && 'Açık Uçlu'}
 {currentQuestion.questionType === 'LIKERT' && 'Likert Ölçeği'}
 {currentQuestion.questionType === 'YES_NO' && 'Evet/Hayır'}
 {currentQuestion.questionType === 'RATING' && 'Puanlama'}
 {currentQuestion.questionType === 'DROPDOWN' && 'Açılır Liste'}
 </Badge>
 </div>
 </CardHeader>
 <CardContent>
 {renderQuestionInput(currentQuestion)}
 
 {/* Validation Error */}
 {validationError && (
 <div className="mt-5 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
 <div className="flex items-start gap-3">
 <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
 <p className="text-sm text-destructive font-medium">{validationError}</p>
 </div>
 </div>
 )}
 </CardContent>
 </Card>

 {/* Navigation */}
 <div className="flex items-center justify-between pt-2">
 <Button
 type="button"
 variant="outline"
 onClick={handlePreviousQuestion}
 disabled={currentQuestionIndex === 0}
 className="gap-2"
 >
 <ArrowLeft className="h-4 w-4" />
 Önceki
 </Button>

 {currentQuestionIndex === questions.length - 1 ? (
 <Button
 type="submit"
 disabled={isSubmitting}
 className="gap-2 bg-emerald-600"
 >
 {isSubmitting ? (
 <>
 <div className=" rounded-full h-4 w-4 border-b-2 border-white" />
 Gönderiliyor...
 </>
 ) : (
 <>
 <Send className="h-4 w-4" />
 Anketi Gönder
 </>
 )}
 </Button>
 ) : (
 <Button
 type="button"
 onClick={handleNextQuestion}
 className="gap-2"
 >
 Sonraki
 <ArrowRight className="h-4 w-4" />
 </Button>
 )}
 </div>
 </form>
 </Form>
 </div>
 </div>
 );
}