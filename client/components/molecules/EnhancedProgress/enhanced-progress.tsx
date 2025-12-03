import { Progress } from "@/components/atoms/Progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface EnhancedProgressProps {
 value: number;
 max?: number;
 label?: string;
 showPercentage?: boolean;
 className?: string;
 variant?:"default" |"success" |"warning" |"error";
 size?:"sm" |"md" |"lg";
 animated?: boolean;
}

export function EnhancedProgress({
 value,
 max = 100,
 label,
 showPercentage = true,
 className,
 variant ="default",
 size ="md",
 animated = true,
}: EnhancedProgressProps) {
 const percentage = Math.min((value / max) * 100, 100);

 const sizeClasses = {
 sm:"h-2",
 md:"h-3",
 lg:"h-4",
 };

 const variantClasses = {
 default:"[&>div]:bg-primary",
 success:"[&>div]:bg-success",
 warning:"[&>div]:bg-warning",
 error:"[&>div]:bg-destructive",
 };

 return (
 <div className={cn("space-y-2", className)}>
 {(label || showPercentage) && (
 <div className="flex items-center justify-between text-sm">
 {label && <span className="font-medium text-foreground">{label}</span>}
 {showPercentage && (
 <span className="text-muted-foreground font-mono">
 {Math.round(percentage)}%
 </span>
 )}
 </div>
 )}

 <Progress
 value={percentage}
 className={cn(
"relative overflow-hidden",
 sizeClasses[size],
 variantClasses[variant]
 )}
 />
 </div>
 );
}

interface CircularProgressProps {
 value: number;
 max?: number;
 size?: number;
 strokeWidth?: number;
 label?: string;
 showValue?: boolean;
 className?: string;
 variant?:"default" |"success" |"warning" |"error";
}

export function CircularProgress({
 value,
 max = 100,
 size = 120,
 strokeWidth = 8,
 label,
 showValue = true,
 className,
 variant ="default",
}: CircularProgressProps) {
 const percentage = Math.min((value / max) * 100, 100);
 const radius = (size - strokeWidth) / 2;
 const circumference = radius * 2 * Math.PI;
 const offset = circumference - (percentage / 100) * circumference;

 const variantColors = {
 default:"stroke-primary",
 success:"stroke-success",
 warning:"stroke-warning",
 error:"stroke-destructive",
 };

 return (
 <div className={cn("relative inline-flex items-center justify-center", className)}>
 <svg width={size} height={size} className="transform -rotate-90">
 <circle
 cx={size / 2}
 cy={size / 2}
 r={radius}
 stroke="currentColor"
 strokeWidth={strokeWidth}
 fill="none"
 className="text-muted/30"
 />

 <motion.circle
 cx={size / 2}
 cy={size / 2}
 r={radius}
 stroke="currentColor"
 strokeWidth={strokeWidth}
 fill="none"
 strokeLinecap="round"
 strokeDasharray={circumference}
 strokeDashoffset={offset}
 className={cn("", variantColors[variant])}
 initial={{ strokeDashoffset: circumference }}
 animate={{ strokeDashoffset: offset }}
 transition={{ duration: 1, ease:"easeInOut" }}
 />
 </svg>

 <div className="absolute inset-0 flex flex-col items-center justify-center">
 {showValue && (
 <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
 )}
 {label && (
 <span className="text-xs text-muted-foreground mt-1">{label}</span>
 )}
 </div>
 </div>
 );
}

interface StepProgressProps {
 steps: string[];
 currentStep: number;
 className?: string;
}

export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
 return (
 <div className={cn("w-full", className)}>
 <div className="flex items-center justify-between">
 {steps.map((step, index) => {
 const isCompleted = index < currentStep;
 const isCurrent = index === currentStep;
 const isUpcoming = index > currentStep;

 return (
 <div key={index} className="flex items-center flex-1 last:flex-none">
 <div className="flex flex-col items-center">
 <motion.div
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ delay: index * 0.1 }}
 className={cn(
"w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm",
 isCompleted &&
"bg-primary text-primary-foreground",
 isCurrent &&
"bg-primary/20 text-primary border-2 border-primary ring-4 ring-primary/20",
 isUpcoming &&"bg-muted text-muted-foreground"
 )}
 >
 {isCompleted ? (
 <CheckCircle2 className="h-5 w-5" />
 ) : (
 index + 1
 )}
 </motion.div>

 <motion.span
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.1 + 0.1 }}
 className={cn(
"text-xs mt-2 text-center max-w-[100px]",
 isCurrent ?"font-semibold text-foreground" :"text-muted-foreground"
 )}
 >
 {step}
 </motion.span>
 </div>

 {index < steps.length - 1 && (
 <div className="flex-1 h-0.5 bg-muted mx-2 relative overflow-hidden">
 <motion.div
 initial={{ scaleX: 0 }}
 animate={{ scaleX: isCompleted ? 1 : 0 }}
 transition={{ duration: 0.5, delay: index * 0.1 }}
 className="h-full bg-primary origin-left"
 />
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 );
}

interface LoadingDotsProps {
 className?: string;
 size?:"sm" |"md" |"lg";
}

export function LoadingDots({ className, size ="md" }: LoadingDotsProps) {
 const sizeClasses = {
 sm:"h-1.5 w-1.5",
 md:"h-2 w-2",
 lg:"h-3 w-3",
 };

 return (
 <div className={cn("flex items-center gap-1.5", className)}>
 {[0, 1, 2].map((i) => (
 <motion.div
 key={i}
 className={cn("rounded-full bg-primary", sizeClasses[size])}
 animate={{
 y: ["0%","-50%","0%"],
 opacity: [0.5, 1, 0.5],
 }}
 transition={{
 duration: 0.6,
 repeat: Infinity,
 delay: i * 0.15,
 ease:"easeInOut",
 }}
 />
 ))}
 </div>
 );
}
