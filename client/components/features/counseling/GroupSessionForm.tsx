import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Loader2, CheckCircle2 } from "lucide-react";

import { Form } from "@/components/organisms/Form";
import { Button } from "@/components/atoms/Button";

import type { GroupSessionFormValues, Student } from "./types";
import FormProgress from "./form-widgets/FormProgress";
import ParticipantStep from "./form-steps/ParticipantStep";
import SessionDetailsStep from "./form-steps/SessionDetailsStep";

interface GroupSessionFormProps {
 form: UseFormReturn<GroupSessionFormValues>;
 students: Student[];
 selectedStudents: Student[];
 onSelectedStudentsChange: (students: Student[]) => void;
 onSubmit: (data: GroupSessionFormValues) => void;
 onCancel: () => void;
 isPending: boolean;
}

export default function GroupSessionForm({
 form,
 students,
 selectedStudents,
 onSelectedStudentsChange,
 onSubmit,
 onCancel,
 isPending,
}: GroupSessionFormProps) {
 const [currentStep, setCurrentStep] = useState(1);
 const totalSteps = 2;

 const validateStep = async (step: number): Promise<boolean> => {
 let fieldsToValidate: (keyof GroupSessionFormValues)[] = [];

 switch (step) {
 case 1:
 fieldsToValidate = ['studentIds', 'participantType'];
 break;
 case 2:
 fieldsToValidate = ['sessionDate', 'sessionTime', 'sessionMode', 'sessionLocation'];
 break;
 default:
 return true;
 }

 return await form.trigger(fieldsToValidate);
 };

 const handleNext = async () => {
 const isValid = await validateStep(currentStep);
 if (isValid && currentStep < totalSteps) {
 setCurrentStep(currentStep + 1);
 }
 };

 const handleBack = () => {
 if (currentStep > 1) {
 setCurrentStep(currentStep - 1);
 }
 };

 const handleFormSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 e.stopPropagation();

 if (currentStep === totalSteps) {
 form.handleSubmit(onSubmit)();
 } else {
 await handleNext();
 }
 };

 return (
 <Form {...form}>
 <form onSubmit={handleFormSubmit} className="space-y-6">
 {/* Progress */}
 <FormProgress currentStep={currentStep} totalSteps={totalSteps} />

 {/* Steps */}
 <div className="min-h-[400px]">
 {currentStep === 1 && (
 <ParticipantStep
 form={form}
 students={students}
 sessionType="group"
 selectedStudents={selectedStudents}
 onSelectedStudentsChange={onSelectedStudentsChange}
 />
 )}

 {currentStep === 2 && (
 <SessionDetailsStep form={form} />
 )}
 </div>

 {/* Actions */}
 <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
 <Button 
 type="button" 
 variant="outline" 
 onClick={currentStep === 1 ? onCancel : handleBack}
 className="px-5"
 >
 {currentStep === 1 ? 'İptal' : 'Geri'}
 </Button>

 {currentStep < totalSteps ? (
 <Button 
 type="button"
 onClick={(e) => {
 e.preventDefault();
 handleNext();
 }}
 className="px-8"
 >
 Devam Et
 </Button>
 ) : (
 <Button 
 type="submit" 
 disabled={isPending}
 className="px-8"
 >
 {isPending ? (
 <>
 <Loader2 className="mr-2 h-4 w-4" />
 Kaydediliyor...
 </>
 ) : (
 <>
 <CheckCircle2 className="mr-2 h-4 w-4" />
 Grup Görüşmesini Başlat
 </>
 )}
 </Button>
 )}
 </div>
 </form>
 </Form>
 );
}