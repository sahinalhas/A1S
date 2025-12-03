import { UseFormReturn } from "react-hook-form";
import { FileText, CheckCircle2, Calendar, MapPin, Users, MessageSquare, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";

import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/organisms/Form";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Separator } from "@/components/atoms/Separator";

import PastMeetingHistory from "../form-widgets/PastMeetingHistory";
import type { IndividualSessionFormValues, GroupSessionFormValues, Student } from "../types";
import { SESSION_MODE_LABELS, type SessionMode } from "@shared/constants/common.constants";

interface NotesStepProps {
 form: UseFormReturn<IndividualSessionFormValues | GroupSessionFormValues>;
 sessionType: 'individual' | 'group';
 students?: Student[];
 selectedStudents?: Student[];
}

export default function NotesStep({ 
 form, 
 sessionType, 
 students = [],
 selectedStudents = []
}: NotesStepProps) {
 const formValues = form.getValues();
 
 const getStudentInfo = () => {
 if (sessionType === 'individual' && 'studentId' in formValues) {
 const student = students.find(s => s.id === formValues.studentId);
 return student ? [student] : [];
 }
 return selectedStudents;
 };

 const studentList = getStudentInfo();

 const getSessionModeLabel = (mode: string) => {
 return SESSION_MODE_LABELS[mode as SessionMode] || mode;
 };

 return (
 <div className="space-y-8 fade-in-50 slide-in-from-bottom-4">
 {/* Section Header */}
 <div className="flex items-center gap-3 pb-4 border-b-2">
 <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ring-2 ring-primary/20">
 <Sparkles className="h-6 w-6 text-primary" />
 </div>
 <div>
 <h3 className="font-semibold text-xl">Notlar & Özet</h3>
 <p className="text-sm text-muted-foreground mt-0.5">
 Ek notlar ekleyin ve bilgileri kontrol edin
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
 {/* Left side - Notes */}
 <div className="lg:col-span-3 space-y-6">
 <FormField
 control={form.control}
 name="sessionDetails"
 render={({ field }) => (
 <FormItem className=" fade-in-50 slide-in-from-left-4">
 <FormLabel className="text-base font-semibold">Görüşme Notları (Opsiyonel)</FormLabel>
 <FormControl>
 <Textarea
 {...field}
 placeholder="Görüşme hakkında eklemek istediğiniz notlar..."
 className="min-h-[220px] resize-none focus:ring-2 focus:ring-primary/20"
 />
 </FormControl>
 <FormDescription className="text-xs">
 Görüşme sırasında veya sonrasında eklemek istediğiniz notları yazabilirsiniz
 </FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />

 {/* Tips */}
 <Card className="border-blue-200 bg-gradient-to-br from-blue-50/80 to-blue-50/40 dark:from-blue-950/20 dark:to-blue-950/10 dark:border-blue-900 fade-in-50 slide-in-from-left-6">
 <CardContent className="pt-5">
 <div className="flex items-start gap-3">
 <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
 <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
 </div>
 <div className="space-y-2.5 text-sm">
 <p className="font-semibold text-blue-900 dark:text-blue-100">
 Görüşme Kayıt İpuçları
 </p>
 <ul className="space-y-1.5 text-blue-800 dark:text-blue-200">
 <li className="flex items-start gap-2">
 <span className="text-blue-500 mt-0.5">•</span>
 <span>Görüşme sonrasında detaylı notlar ekleyebilirsiniz</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-blue-500 mt-0.5">•</span>
 <span>Gözlemlerinizi ve önemli noktaları kaydedin</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-blue-500 mt-0.5">•</span>
 <span>Öğrencinin durumu ve gelişimi hakkında bilgi ekleyin</span>
 </li>
 </ul>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Past Meeting History - Only for individual sessions */}
 {sessionType === 'individual' && 'studentId' in formValues && formValues.studentId && (
 <div className=" fade-in-50 slide-in-from-left-8">
 <PastMeetingHistory 
 studentId={formValues.studentId}
 studentName={studentList[0]?.name || 'Öğrenci'}
 />
 </div>
 )}
 </div>

 {/* Right side - Summary */}
 <div className="lg:col-span-2">
 <Card className="sticky top-4 border-2 fade-in-50 slide-in-from-right-4">
 <CardHeader className="pb-4">
 <CardTitle className="text-base flex items-center gap-2">
 <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
 <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
 </div>
 <span className="font-semibold">Özet Bilgiler</span>
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-5">
 {/* Students */}
 <div className="p-3 rounded-lg bg-muted/30">
 <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2.5">
 <Users className="h-4 w-4" />
 <span className="font-semibold">
 {sessionType === 'individual' ? 'Öğrenci' : 'Öğrenciler'}
 </span>
 </div>
 <div className="space-y-2">
 {studentList.map((student) => (
 <div key={student.id} className="text-sm bg-background p-2 rounded-md">
 <p className="font-semibold">{student.name} {student.surname}</p>
 <p className="text-xs text-muted-foreground mt-0.5">{student.className}</p>
 </div>
 ))}
 {studentList.length === 0 && (
 <p className="text-sm text-muted-foreground italic">Seçilmedi</p>
 )}
 </div>
 </div>

 <Separator />

 {/* Topic */}
 <div className="p-3 rounded-lg bg-muted/30">
 <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2.5">
 <MessageSquare className="h-4 w-4" />
 <span className="font-semibold">Konu</span>
 </div>
 <p className="text-sm font-medium">
 {formValues.topic || <span className="text-muted-foreground italic font-normal">Seçilmedi</span>}
 </p>
 </div>

 <Separator />

 {/* Date & Time */}
 <div className="p-3 rounded-lg bg-muted/30">
 <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2.5">
 <Calendar className="h-4 w-4" />
 <span className="font-semibold">Tarih & Saat</span>
 </div>
 <div className="text-sm space-y-1.5">
 {formValues.sessionDate ? (
 <p className="font-medium">{format(formValues.sessionDate, 'd MMMM yyyy, EEEE', { locale: tr })}</p>
 ) : (
 <p className="text-muted-foreground italic">Tarih seçilmedi</p>
 )}
 {formValues.sessionTime && (
 <p className="text-muted-foreground font-medium">{formValues.sessionTime}</p>
 )}
 </div>
 </div>

 <Separator />

 {/* Location & Mode */}
 <div className="p-3 rounded-lg bg-muted/30">
 <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2.5">
 <MapPin className="h-4 w-4" />
 <span className="font-semibold">Yer & Şekil</span>
 </div>
 <div className="space-y-2.5">
 <p className="text-sm font-medium">
 {formValues.sessionLocation || <span className="text-muted-foreground italic font-normal">Belirtilmedi</span>}
 </p>
 <Badge variant="secondary" className="font-medium">
 {getSessionModeLabel(formValues.sessionMode || '')}
 </Badge>
 </div>
 </div>

 {/* Participant Type */}
 {formValues.participantType && formValues.participantType !== 'öğrenci' && (
 <>
 <Separator />
 <div className="p-3 rounded-lg bg-muted/30">
 <div className="text-sm text-muted-foreground mb-2.5">
 <span className="font-semibold">Ek Katılımcı</span>
 </div>
 <Badge variant="outline" className="font-medium capitalize">
 {formValues.participantType}
 </Badge>
 </div>
 </>
 )}
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 );
}
