import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
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
import { Badge } from "@/components/atoms/Badge";
import { Switch } from "@/components/atoms/Switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { 
 Users, 
 Download, 
 Link2, 
 Calendar,
 FileSpreadsheet,
 Globe,
 Settings,
 CheckSquare,
 Square,
 Lock,
 QrCode
} from "lucide-react";
import {
 SurveyTemplate,
 SurveyQuestion,
 DistributionType,
 ExcelTemplateConfig
} from "@/lib/survey-types";
import { Student } from "@/lib/storage";
import { generateExcelTemplate } from "@/lib/excel-template-generator";
import { useStudents } from "@/hooks/queries/students.query-hooks";

const distributionSchema = z.object({
 title: z.string().min(1,"Başlık gereklidir"),
 description: z.string().optional(),
 participationType: z.enum(["PUBLIC","STUDENT_INFO","SECURITY_CODE"]),
 targetClasses: z.array(z.string()).optional(),
 targetStudents: z.array(z.string()).optional(),
 startDate: z.string().optional(),
 endDate: z.string().optional(),
 maxResponses: z.number().optional(),
 excelConfig: z.object({
 includeStudentInfo: z.boolean(),
 includeInstructions: z.boolean(),
 responseFormat: z.enum(["single_sheet","multi_sheet"]),
 includeValidation: z.boolean(),
 }),
}).refine((data) => {
 // Tarih kontrolü: Bitiş tarihi başlangıçtan sonra olmalı
 if (data.startDate && data.endDate) {
 return new Date(data.startDate) < new Date(data.endDate);
 }
 return true;
}, {
 message: "Bitiş tarihi başlangıç tarihinden sonra olmalı",
 path: ["endDate"],
});

type DistributionForm = z.infer<typeof distributionSchema>;

interface SurveyDistributionDialogProps {
 children: React.ReactNode;
 survey: SurveyTemplate;
 questions: SurveyQuestion[];
 onDistributionCreated?: (distribution: DistributionForm) => void;
 open?: boolean;
 onOpenChange?: (open: boolean) => void;
}

export default function SurveyDistributionDialog({ 
 children, 
 survey,
 questions,
 onDistributionCreated,
 open: externalOpen,
 onOpenChange 
}: SurveyDistributionDialogProps) {
 const [internalOpen, setInternalOpen] = useState(false);
 const open = externalOpen !== undefined ? externalOpen : internalOpen;
 
 const handleOpenChange = (newOpen: boolean) => {
 if (onOpenChange) {
 onOpenChange(newOpen);
 } else {
 setInternalOpen(newOpen);
 }
 };
 
 const { students: studentsFromHook, isLoading: studentsLoading } = useStudents();
 const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
 const [currentStep, setCurrentStep] = useState<"basic" |"selection" |"config">("basic");
 const [filterOptions, setFilterOptions] = useState({
 gender:"all", //"all","male","female"
 riskLevel:"all", //"all","low","medium","high"
 searchTerm:""
 });
 
 const students = studentsFromHook || [];

 const form = useForm<DistributionForm>({
 resolver: zodResolver(distributionSchema),
 defaultValues: {
 title: `${survey.title} - Dağıtım`,
 description:"",
 participationType:"PUBLIC",
 targetClasses: [],
 targetStudents: [],
 excelConfig: {
 includeStudentInfo: true,
 includeInstructions: true,
 responseFormat:"single_sheet",
 includeValidation: true,
 },
 },
 });

 useEffect(() => {
 if (open) {
 console.log('Loading students for distribution dialog:', students.length);
 
 // Dialog açıldığında form'u sıfırla
 form.reset({
 title: `${survey.title} - Dağıtım`,
 description:"",
 participationType:"PUBLIC",
 targetClasses: [],
 targetStudents: [],
 excelConfig: {
 includeStudentInfo: true,
 includeInstructions: true,
 responseFormat:"single_sheet",
 includeValidation: true,
 },
 });
 setCurrentStep("basic");
 }
 }, [open, survey.title, form, students]);

 const watchedClasses = form.watch("targetClasses") || [];
 const watchedParticipationType = form.watch("participationType") as 'PUBLIC' | 'STUDENT_INFO' | 'SECURITY_CODE';

 // Get unique class names from students
 const availableClasses = Array.from(
 new Set(students.map(s => s.class))
 ).sort();

 // Filter students based on selected criteria
 const getFilteredStudents = (): typeof students => {
 return students.filter(student => {
 // Gender filter
 if (filterOptions.gender !=="all") {
 const studentGender = student.gender?.toLowerCase();
 if (filterOptions.gender ==="male" && studentGender !=="e") return false;
 if (filterOptions.gender ==="female" && studentGender !=="k") return false;
 }

 // Risk level filter
 if (filterOptions.riskLevel !=="all") {
 const riskLevel = student.risk?.toLowerCase();
 if (filterOptions.riskLevel ==="low" && riskLevel !=="düşük") return false;
 if (filterOptions.riskLevel ==="medium" && riskLevel !=="orta") return false;
 if (filterOptions.riskLevel ==="high" && riskLevel !=="yüksek") return false;
 }

 // Search term filter
 if (filterOptions.searchTerm) {
 const searchTerm = filterOptions.searchTerm.toLowerCase();
 const fullName = `${student.name} ${student.surname}`.toLowerCase();
 const studentId = student.id.toString().toLowerCase();
 if (!fullName.includes(searchTerm) && !studentId.includes(searchTerm)) {
 return false;
 }
 }

 return true;
 });
 };

 const filteredStudents = getFilteredStudents();

 // Filter students by selected classes
 const studentsInSelectedClasses = students.filter(student => 
 student.class && watchedClasses.includes(student.class)
 );

 // Update selected students when classes change
 useEffect(() => {
 const newSelectedStudents = studentsInSelectedClasses.map(s => s.id);
 setSelectedStudents(newSelectedStudents);
 form.setValue("targetStudents", newSelectedStudents);
 }, [watchedClasses, studentsInSelectedClasses, form]);

 const toggleStudentSelection = (studentId: string) => {
 const newSelected = selectedStudents.includes(studentId)
 ? selectedStudents.filter(id => id !== studentId)
 : [...selectedStudents, studentId];
 
 setSelectedStudents(newSelected);
 form.setValue("targetStudents", newSelected);
 };

 const toggleAllStudentsInClass = (className: string) => {
 const classStudents = students.filter(s => s.class && s.class === className);
 const allSelected = classStudents.every(s => selectedStudents.includes(s.id));
 
 let newSelected;
 if (allSelected) {
 // Deselect all students in this class
 newSelected = selectedStudents.filter(id => 
 !classStudents.some(s => s.id === id)
 );
 } else {
 // Select all students in this class
 const classStudentIds = classStudents.map(s => s.id);
 newSelected = [...new Set([...selectedStudents, ...classStudentIds])];
 }
 
 setSelectedStudents(newSelected);
 form.setValue("targetStudents", newSelected);
 };

 const generateAndDownloadExcelTemplate = () => {
 const formData = form.getValues();
 
 // Get students: either from targetStudents, or from targetClasses
 let selectedStudentsList = [];
 
 if (formData.targetStudents && formData.targetStudents.length > 0) {
 // If specific students are selected, use them
 selectedStudentsList = students.filter(s => 
 formData.targetStudents?.includes(s.id)
 );
 } else if (formData.targetClasses && formData.targetClasses.length > 0) {
 // If classes are selected but no specific students, use all students in those classes
 selectedStudentsList = students.filter(s => 
 s.class && formData.targetClasses?.includes(s.class)
 );
 }

 const excelData = generateExcelTemplate({
 survey,
 questions,
 students: selectedStudentsList,
 config: {
 includeStudentInfo: formData.excelConfig.includeStudentInfo ?? true,
 includeInstructions: formData.excelConfig.includeInstructions ?? true,
 responseFormat: formData.excelConfig.responseFormat ?? 'single_sheet',
 includeValidation: formData.excelConfig.includeValidation ?? true,
 },
 distributionTitle: formData.title
 });

 // Create download link
 const binaryString = atob(excelData);
 const bytes = new Uint8Array(binaryString.length);
 for (let i = 0; i < binaryString.length; i++) {
 bytes[i] = binaryString.charCodeAt(i);
 }

 const blob = new Blob([bytes], { 
 type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
 });
 const url = URL.createObjectURL(blob);
 
 const link = document.createElement('a');
 link.href = url;
 link.download = `${formData.title.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);
 };

 const onSubmit = async (data: DistributionForm) => {
 try {
 // Ensure targetStudents is populated from selectedStudents (set by class selection)
 const finalData = {
 ...data,
 targetStudents: data.targetStudents && data.targetStudents.length > 0 
 ? data.targetStudents 
 : selectedStudents
 };
 
 // Generate Excel template for students
 let excelTemplate: string | undefined = undefined;
 let selectedStudentsList: (typeof students) = [];
 
 if (finalData.targetStudents && finalData.targetStudents.length > 0) {
 // If specific students are selected, use them
 selectedStudentsList = students.filter(s => 
 finalData.targetStudents?.includes(s.id)
 );
 } else if (finalData.targetClasses && finalData.targetClasses.length > 0) {
 // If classes are selected, use all students in those classes
 selectedStudentsList = students.filter(s => 
 s.class && finalData.targetClasses?.includes(s.class)
 );
 }
 
 excelTemplate = generateExcelTemplate({
 survey,
 questions,
 students: selectedStudentsList,
 config: {
 includeStudentInfo: data.excelConfig.includeStudentInfo ?? true,
 includeInstructions: data.excelConfig.includeInstructions ?? true,
 responseFormat: data.excelConfig.responseFormat ?? 'single_sheet',
 includeValidation: data.excelConfig.includeValidation ?? true,
 },
 distributionTitle: data.title
 });

 const distributionData = {
 ...finalData,
 id: crypto.randomUUID(),
 excelTemplate,
 publicLink: crypto.randomUUID()
 };

 onDistributionCreated?.(distributionData);
 handleOpenChange(false);
 form.reset();
 setCurrentStep("basic");
 } catch (error) {
 console.error("Error creating distribution:", error);
 }
 };

 return (
 <Dialog open={open} onOpenChange={handleOpenChange}>
 <DialogTrigger asChild>
 {children}
 </DialogTrigger>
 <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
 <DialogHeader>
 <DialogTitle>Anket Dağıtımı Oluştur</DialogTitle>
 <DialogDescription>
 {survey.title} anketini sınıflara dağıtın
 </DialogDescription>
 </DialogHeader>

 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
 <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
 <TabsList variant="nested">
 <TabsTrigger value="basic" variant="nested">
 <Settings className="mr-2 h-4 w-4" />
 Temel Bilgiler
 </TabsTrigger>
 <TabsTrigger value="selection" variant="nested">
 <Users className="mr-2 h-4 w-4" />
 Sınıf/Öğrenci Seçimi
 </TabsTrigger>
 <TabsTrigger value="config" variant="nested">
 <FileSpreadsheet className="mr-2 h-4 w-4" />
 Dağıtım Yapılandırması
 </TabsTrigger>
 </TabsList>

 <TabsContent value="basic" className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <FormField
 control={form.control}
 name="title"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Dağıtım Başlığı</FormLabel>
 <FormControl>
 <Input placeholder="Örn: 2024-2025 Öğrenci Memnuniyet Anketi" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="participationType"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Katılımcı Bilgi Toplama Türü</FormLabel>
 <div className="space-y-3">
   {(['PUBLIC', 'STUDENT_INFO', 'SECURITY_CODE'] as const).map((type) => (
     <div key={type} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
       onClick={() => field.onChange(type)}>
       <input type="radio" name="participationType" value={type} checked={field.value === type}
         onChange={() => field.onChange(type)} className="mt-1" />
       <div>
         <div className="font-medium">
           {type === 'PUBLIC' && '🌐 Herkese Açık (Anonim)'}
           {type === 'STUDENT_INFO' && '👤 Öğrenci Bilgileri Zorunlu'}
           {type === 'SECURITY_CODE' && '🔐 Güvenlik Kodu (QR) ile Erişim'}
         </div>
         <div className="text-sm text-gray-500">
           {type === 'PUBLIC' && 'Kişisel bilgi girilmeden anonim yanıt alınır'}
           {type === 'STUDENT_INFO' && 'Ad, Soyad, Sınıf, Cinsiyet, Numara zorunlu'}
           {type === 'SECURITY_CODE' && 'QR kod ile öğrenci eşleştirmesi - PDF olarak yazdırılabilir'}
         </div>
       </div>
     </div>
   ))}
 </div>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <FormField
 control={form.control}
 name="description"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Açıklama</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Dağıtım hakkında açıklama yazın..."
 className="resize-none"
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <FormField
 control={form.control}
 name="startDate"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Başlangıç Tarihi</FormLabel>
 <FormControl>
 <Input type="date" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="endDate"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Bitiş Tarihi</FormLabel>
 <FormControl>
 <Input type="date" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <div className="flex justify-end">
 <Button 
 type="button" 
 onClick={() => setCurrentStep("selection")}
 >
 Sonraki: Öğrenci Seçimi
 </Button>
 </div>
 </TabsContent>

 <TabsContent value="selection" className="space-y-4">
 {/* Advanced Filters */}
 <Card>
 <CardHeader>
 <CardTitle className="text-sm">Gelişmiş Filtreler</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {/* Search */}
 <div>
 <label className="text-sm font-medium">Öğrenci Ara</label>
 <Input
 placeholder="Ad, soyad veya numara..."
 value={filterOptions.searchTerm}
 onChange={(e) => setFilterOptions(prev => ({
 ...prev,
 searchTerm: e.target.value
 }))}
 />
 </div>

 {/* Gender Filter */}
 <div>
 <label className="text-sm font-medium">Cinsiyet</label>
 <Select
 value={filterOptions.gender}
 onValueChange={(value) => setFilterOptions(prev => ({
 ...prev,
 gender: value
 }))}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tümü</SelectItem>
 <SelectItem value="female">Kız</SelectItem>
 <SelectItem value="male">Erkek</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {/* Risk Level Filter */}
 <div>
 <label className="text-sm font-medium">Risk Durumu</label>
 <Select
 value={filterOptions.riskLevel}
 onValueChange={(value) => setFilterOptions(prev => ({
 ...prev,
 riskLevel: value
 }))}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tümü</SelectItem>
 <SelectItem value="low">Düşük Risk</SelectItem>
 <SelectItem value="medium">Orta Risk</SelectItem>
 <SelectItem value="high">Yüksek Risk</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Class Selection */}
 <Card>
 <CardHeader>
 <CardTitle className="text-sm">
 Sınıf Seçimi
 <Badge variant="outline" className="ml-2">
 {filteredStudents.length} öğrenci
 </Badge>
 </CardTitle>
 </CardHeader>
 <CardContent>
 <FormField
 control={form.control}
 name="targetClasses"
 render={() => (
 <FormItem>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
 {availableClasses.map((className) => (
 <FormField
 key={className}
 control={form.control}
 name="targetClasses"
 render={({ field }) => {
 const studentCount = students.filter(s => s.class && s.class === className).length;
 return (
 <FormItem
 key={className}
 className="flex flex-row items-start space-x-3 space-y-0"
 >
 <FormControl>
 <Checkbox
 checked={field.value?.includes(className as string)}
 onCheckedChange={(checked) => {
 const currentValue = field.value || [];
 return checked
 ? field.onChange([...currentValue, className])
 : field.onChange(
 currentValue.filter(
 (value) => value !== className
 )
 )
 }}
 />
 </FormControl>
 <FormLabel className="text-sm font-normal">
 {className}
 <Badge variant="secondary" className="ml-2">
 {studentCount}
 </Badge>
 </FormLabel>
 </FormItem>
 )
 }}
 />
 ))}
 </div>
 <FormMessage />
 </FormItem>
 )}
 />
 </CardContent>
 </Card>

 {/* Student Selection */}
 {watchedClasses.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="text-sm">
 Öğrenci Seçimi 
 <Badge variant="outline" className="ml-2">
 {selectedStudents.length} / {studentsInSelectedClasses.length}
 </Badge>
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 {watchedClasses.map((className) => {
 const classStudents = students.filter(s => s.class && s.class === className);
 const selectedInClass = classStudents.filter(s => 
 selectedStudents.includes(s.id)
 ).length;
 const allSelectedInClass = selectedInClass === classStudents.length;

 return (
 <div key={className} className="space-y-2">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-2">
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => toggleAllStudentsInClass(className)}
 >
 {allSelectedInClass ? (
 <CheckSquare className="h-4 w-4" />
 ) : (
 <Square className="h-4 w-4" />
 )}
 </Button>
 <span className="font-medium">{className}</span>
 <Badge variant="secondary">
 {selectedInClass} / {classStudents.length}
 </Badge>
 </div>
 </div>
 
 <div className="ml-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
 {classStudents.map((student) => (
 <div
 key={student.id}
 className="flex items-center space-x-2 p-2 rounded border"
 >
 <Checkbox
 checked={selectedStudents.includes(student.id)}
 onCheckedChange={() => toggleStudentSelection(student.id)}
 />
 <span className="text-sm">
 {student.id} - {student.name} {student.surname}
 </span>
 </div>
 ))}
 </div>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>
 )}

 <div className="flex justify-between">
 <Button 
 type="button" 
 variant="outline"
 onClick={() => setCurrentStep("basic")}
 >
 Önceki
 </Button>
 <Button 
 type="button" 
 onClick={() => setCurrentStep("config")}
 disabled={selectedStudents.length === 0}
 >
 Sonraki: Yapılandırma
 </Button>
 </div>
 </TabsContent>

 <TabsContent value="config" className="space-y-4">
 {/* Excel Configuration */}
 {(watchedParticipationType === 'STUDENT_INFO' || watchedParticipationType === 'SECURITY_CODE') && (
 <Card>
 <CardHeader>
 <CardTitle className="text-sm">Excel Şablonu Ayarları</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <FormField
 control={form.control}
 name="excelConfig.includeStudentInfo"
 render={({ field }) => (
 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
 <div className="space-y-0.5">
 <FormLabel className="text-sm">Öğrenci Bilgileri</FormLabel>
 <FormDescription className="text-xs">
 Öğrenci no, ad, soyad bilgilerini dahil et
 </FormDescription>
 </div>
 <FormControl>
 <Switch
 checked={field.value}
 onCheckedChange={field.onChange}
 />
 </FormControl>
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="excelConfig.includeInstructions"
 render={({ field }) => (
 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
 <div className="space-y-0.5">
 <FormLabel className="text-sm">Doldurma Talimatları</FormLabel>
 <FormDescription className="text-xs">
 Excel dosyasına talimatlar ekle
 </FormDescription>
 </div>
 <FormControl>
 <Switch
 checked={field.value}
 onCheckedChange={field.onChange}
 />
 </FormControl>
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="excelConfig.includeValidation"
 render={({ field }) => (
 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
 <div className="space-y-0.5">
 <FormLabel className="text-sm">Veri Doğrulama</FormLabel>
 <FormDescription className="text-xs">
 Hücrelere veri doğrulama kuralları ekle
 </FormDescription>
 </div>
 <FormControl>
 <Switch
 checked={field.value}
 onCheckedChange={field.onChange}
 />
 </FormControl>
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="excelConfig.responseFormat"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-sm">Sayfa Formatı</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 <SelectItem value="single_sheet">Tek Sayfa</SelectItem>
 <SelectItem value="multi_sheet">Çoklu Sayfa</SelectItem>
 </SelectContent>
 </Select>
 </FormItem>
 )}
 />
 </div>

 <div className="flex gap-2">
 <Button
 type="button"
 variant="outline"
 onClick={generateAndDownloadExcelTemplate}
 disabled={(form.getValues("targetStudents")?.length || 0) === 0 && (form.getValues("targetClasses")?.length || 0) === 0}
 >
 <Download className="mr-2 h-4 w-4" />
 Şablonu Önizle
 </Button>
 </div>
 </CardContent>
 </Card>
 )}

 {/* Online Settings - Her participation type için */}
 <Card>
 <CardHeader>
 <CardTitle className="text-sm">Anket Ayarları</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <FormField
 control={form.control}
 name="maxResponses"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-sm">Maksimum Yanıt</FormLabel>
 <FormControl>
 <Input 
 type="number" 
 placeholder="Sınırsız için boş bırakın"
 {...field}
 onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
 />
 </FormControl>
 </FormItem>
 )}
 />
 </div>
 </CardContent>
 </Card>

 <div className="flex justify-between">
 <Button 
 type="button" 
 variant="outline"
 onClick={() => setCurrentStep("selection")}
 >
 Önceki
 </Button>
 <Button type="submit">
 Dağıtımı Oluştur
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