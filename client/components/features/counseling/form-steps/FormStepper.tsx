import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
 id: number;
 title: string;
 description: string;
}

interface FormStepperProps {
 steps: Step[];
 currentStep: number;
 onStepClick?: (stepId: number) => void;
}

export default function FormStepper({ steps, currentStep, onStepClick }: FormStepperProps) {
 return (
 <div className="w-full py-5 px-2">
 <div className="flex items-center justify-between relative max-w-2xl mx-auto">
 <div className="absolute top-6 left-0 right-0 h-1.5 bg-slate-200/60 dark:bg-slate-700/60 rounded-full" style={{ zIndex: 0 }} />
 
 <div 
 className={cn(
"absolute top-6 left-0 h-1.5 rounded-full ease-in-out",
 currentStep === 1 &&"bg-violet-400/80",
 currentStep === 2 &&"bg-emerald-400/80"
 )}
 style={{ 
 width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
 zIndex: 1
 }} 
 />

 {steps.map((step) => {
 const isCompleted = currentStep > step.id;
 const isCurrent = currentStep === step.id;
 const isClickable = onStepClick && (isCompleted || isCurrent);

 return (
 <div 
 key={step.id} 
 className="flex flex-col items-center relative"
 style={{ zIndex: 2 }}
 >
 <button
 onClick={() => isClickable && onStepClick(step.id)}
 disabled={!isClickable}
 className={cn(
"w-14 h-14 rounded-full flex items-center justify-center",
"border-2 font-semibold text-base",
 isCompleted &&"border-violet-400/60 bg-violet-400/80 text-white",
 isCurrent &&"bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border-violet-400/80 ring-2 ring-violet-400/20",
 !isCompleted && !isCurrent &&"bg-slate-100/60 dark:bg-slate-800/60 border-slate-300/50 dark:border-slate-600/50 text-slate-400",
 isClickable &&" cursor-pointer",
 !isClickable &&"cursor-not-allowed opacity-60"
 )}
 >
 {isCompleted ? (
 <Check className="h-6 w-6 zoom-in-50" />
 ) : (
 <span className="text-lg">{step.id}</span>
 )}
 </button>

 <div className="mt-3 text-center max-w-[140px]">
 <p className={cn(
"text-sm font-semibold",
 (isCurrent || isCompleted) ?"text-slate-700 dark:text-slate-200" :"text-slate-500 dark:text-slate-400"
 )}>
 {step.title}
 </p>
 <p className={cn(
"text-xs text-slate-500 dark:text-slate-400 mt-0.5",
 (isCurrent || isCompleted) ?"opacity-100" :"opacity-50"
 )}>
 {step.description}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}
