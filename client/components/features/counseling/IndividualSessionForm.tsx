import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Loader2, CheckCircle2 } from "lucide-react";

import { Form } from "@/components/organisms/Form";
import { Button } from "@/components/atoms/Button";

import type { IndividualSessionFormValues, Student } from "./types";
import FormProgress from "./form-widgets/FormProgress";
import ParticipantStep from "./form-steps/ParticipantStep";
import SessionDetailsStep from "./form-steps/SessionDetailsStep";

interface IndividualSessionFormProps {
 form: UseFormReturn<IndividualSessionFormValues>;
 students: Student[];
 onSubmit: (data: IndividualSessionFormValues) => void;
 onCancel: () => void;
 isPending: boolean;
}

export default function IndividualSessionForm({
 form,
 students,
 onSubmit,
 onCancel,
 isPending,
}: IndividualSessionFormProps) {
 const [currentStep, setCurrentStep] = useState(1);
 const totalSteps = 2;

 const validateStep = async (step: number): Promise<boolean> => {
 let fieldsToValidate: (keyof IndividualSessionFormValues)[] = [];

 switch (step) {
 case 1:
 fieldsToValidate = ['studentId', 'participantType'];
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
 sessionType="individual"
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
 Görüşmeyi Başlat
 </>
 )}
 </Button>
 )}
 </div>
 </form>
 </Form>
 );
}