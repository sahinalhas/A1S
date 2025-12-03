export default function FormProgress({ currentStep, totalSteps }: FormProgressProps) {
 const progress = (currentStep / totalSteps) * 100;

 return (
 <div className="w-full space-y-3 mb-1">
 <div className="flex justify-between items-center text-sm">
 <span className="font-semibold text-slate-600 dark:text-slate-400">
 Adım {currentStep} / {totalSteps}
 </span>
 <span className="font-bold text-violet-600 dark:text-violet-400 tabular-nums">
 {Math.round(progress)}%
 </span>
 </div>
 <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
 <div
 className="h-full bg-gradient-to-r from-violet-500 to-purple-600 ease-out rounded-full relative"
 style={{ width: `${progress}%` }}
 >
 <div className="absolute inset-0 bg-white/20" />
 </div>
 </div>
 </div>
 );
}