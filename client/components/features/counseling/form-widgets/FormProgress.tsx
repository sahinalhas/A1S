import { Check, Sparkles } from "lucide-react";
import { Progress } from "@/components/atoms/Progress";
import { cn } from "@/lib/utils";

interface FormProgressProps {
 currentStep: number;
 totalSteps: number;
}

export default function FormProgress({ currentStep, totalSteps }: FormProgressProps) {
 const progress = (currentStep / totalSteps) * 100;

 return (
 <div className="space-y-2">
 <div className="flex items-center justify-between text-xs font-medium">
 <span className="text-slate-600 dark:text-slate-400">
 Adım {currentStep} / {totalSteps}
 </span>
 <span className="text-violet-600 dark:text-violet-400">
 %{Math.round(progress)}
 </span>
 </div>
 <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
 <div
 className="h-full bg-gradient-to-r from-violet-500 to-purple-600 ease-out"
 style={{ width: `${progress}%` }}
 />
 </div>
 </div>
 );
}