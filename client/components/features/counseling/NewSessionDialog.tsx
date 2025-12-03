
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Users, Sparkles, X } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/organisms/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";

import IndividualSessionForm from "./IndividualSessionForm";
import GroupSessionForm from "./GroupSessionForm";
import { 
 individualSessionSchema, 
 groupSessionSchema,
 type IndividualSessionFormValues, 
 type GroupSessionFormValues,
 type Student,
} from "./types";

interface NewSessionDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 sessionType: 'individual' | 'group';
 onSessionTypeChange: (type: 'individual' | 'group') => void;
 students: Student[];
 selectedStudents: Student[];
 onSelectedStudentsChange: (students: Student[]) => void;
 onSubmit: (data: IndividualSessionFormValues | GroupSessionFormValues) => void;
 isPending: boolean;
}

export default function NewSessionDialog({
 open,
 onOpenChange,
 sessionType,
 onSessionTypeChange,
 students,
 selectedStudents,
 onSelectedStudentsChange,
 onSubmit,
 isPending,
}: NewSessionDialogProps) {
 const now = new Date();
 const currentTime = now.toTimeString().slice(0, 5);

 const individualForm = useForm<IndividualSessionFormValues>({
 resolver: zodResolver(individualSessionSchema) as any,
 defaultValues: {
 studentId:"",
 participantType:"öğrenci",
 relationshipType:"",
 sessionMode:"yüz_yüze",
 sessionLocation:"Rehberlik Servisi",
 disciplineStatus:"none",
 sessionDate: now,
 sessionTime: currentTime,
 sessionDetails:"",
 },
 });

 const groupForm = useForm<GroupSessionFormValues>({
 resolver: zodResolver(groupSessionSchema) as any,
 defaultValues: {
 groupName:"",
 studentIds: [],
 participantType:"öğrenci",
 sessionMode:"yüz_yüze",
 sessionLocation:"Rehberlik Servisi",
 disciplineStatus:"none",
 sessionDate: now,
 sessionTime: currentTime,
 sessionDetails:"",
 },
 });

 const handleClose = () => {
 onOpenChange(false);
 individualForm.reset();
 groupForm.reset();
 onSelectedStudentsChange([]);
 };

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent hideCloseButton className="max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0 border-0 bg-white dark:bg-slate-950">
 {/* Modern Header */}
 <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
 <button
 onClick={handleClose}
 className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 dark:"
 aria-label="Kapat"
 >
 <X className="h-4 w-4" />
 </button>
 
 <div className="flex items-center gap-3">
 <div className="p-2.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
 <Sparkles className="h-5 w-5 text-white" />
 </div>
 <div>
 <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
 Yeni Görüşme
 </DialogTitle>
 <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
 Rehberlik görüşmesi başlat
 </DialogDescription>
 </div>
 </div>
 </div>

 {/* Session Type Tabs */}
 <div className="px-6 pt-4">
 <Tabs value={sessionType} onValueChange={(v) => onSessionTypeChange(v as 'individual' | 'group')}>
 <TabsList variant="nested">
 <TabsTrigger 
 value="individual"
 variant="nested"
 >
 <User className="h-4 w-4 mr-2" />
 Bireysel
 </TabsTrigger>
 <TabsTrigger 
 value="group"
 variant="nested"
 >
 <Users className="h-4 w-4 mr-2" />
 Grup
 </TabsTrigger>
 </TabsList>

 {/* Form Content */}
 <div className="mt-4 overflow-y-auto max-h-[calc(90vh-200px)] pr-1">
 <TabsContent value="individual" className="mt-0">
 <IndividualSessionForm
 form={individualForm}
 students={students}
 onSubmit={onSubmit}
 onCancel={handleClose}
 isPending={isPending}
 />
 </TabsContent>

 <TabsContent value="group" className="mt-0">
 <GroupSessionForm
 form={groupForm}
 students={students}
 selectedStudents={selectedStudents}
 onSelectedStudentsChange={onSelectedStudentsChange}
 onSubmit={onSubmit}
 onCancel={handleClose}
 isPending={isPending}
 />
 </TabsContent>
 </div>
 </Tabs>
 </div>
 </DialogContent>
 </Dialog>
 );
}
