import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { forwardRef } from "react";

interface EnhancedFormFieldProps
 extends React.InputHTMLAttributes<HTMLInputElement> {
 label?: string;
 error?: string;
 success?: boolean;
 hint?: string;
 loading?: boolean;
 optional?: boolean;
 leftIcon?: React.ReactNode;
 rightIcon?: React.ReactNode;
 containerClassName?: string;
}

export const EnhancedFormField = forwardRef<
 HTMLInputElement,
 EnhancedFormFieldProps
>(
 (
 {
 label,
 error,
 success,
 hint,
 loading,
 optional,
 leftIcon,
 rightIcon,
 containerClassName,
 className,
 disabled,
 ...props
 },
 ref
 ) => {
 const hasError = !!error;
 const hasSuccess = success && !error;

 return (
 <div className={cn("space-y-2", containerClassName)}>
 {label && (
 <Label
 htmlFor={props.id}
 className="flex items-center gap-2 text-sm font-medium"
 >
 {label}
 {optional && (
 <span className="text-xs text-muted-foreground font-normal">
 (İsteğe bağlı)
 </span>
 )}
 </Label>
 )}

 <div className="relative">
 {leftIcon && (
 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
 {leftIcon}
 </div>
 )}

 <Input
 ref={ref}
 className={cn(
"",
 leftIcon &&"pl-10",
 (rightIcon || loading || hasError || hasSuccess) &&"pr-10",
 hasError &&"border-destructive focus-visible:ring-destructive",
 hasSuccess &&"border-success focus-visible:ring-success",
 className
 )}
 disabled={disabled || loading}
 aria-invalid={hasError}
 aria-describedby={
 error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined
 }
 {...props}
 />

 <AnimatePresence mode="wait">
 {loading && (
 <motion.div
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.8 }}
 className="absolute right-3 top-1/2 -translate-y-1/2"
 >
 <Loader2 className="h-4 w-4 text-muted-foreground" />
 </motion.div>
 )}

 {!loading && hasError && (
 <motion.div
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.8 }}
 className="absolute right-3 top-1/2 -translate-y-1/2"
 >
 <AlertCircle className="h-4 w-4 text-destructive" />
 </motion.div>
 )}

 {!loading && hasSuccess && (
 <motion.div
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.8 }}
 className="absolute right-3 top-1/2 -translate-y-1/2"
 >
 <CheckCircle2 className="h-4 w-4 text-success" />
 </motion.div>
 )}

 {!loading && !hasError && !hasSuccess && rightIcon && (
 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
 {rightIcon}
 </div>
 )}
 </AnimatePresence>
 </div>

 <AnimatePresence mode="wait">
 {error && (
 <motion.p
 id={`${props.id}-error`}
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="text-sm text-destructive flex items-center gap-1.5"
 role="alert"
 >
 <AlertCircle className="h-3.5 w-3.5" />
 {error}
 </motion.p>
 )}

 {!error && hint && (
 <motion.p
 id={`${props.id}-hint`}
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-sm text-muted-foreground flex items-center gap-1.5"
 >
 <Info className="h-3.5 w-3.5" />
 {hint}
 </motion.p>
 )}
 </AnimatePresence>
 </div>
 );
 }
);

EnhancedFormField.displayName ="EnhancedFormField";

interface EnhancedTextareaFieldProps
 extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
 label?: string;
 error?: string;
 success?: boolean;
 hint?: string;
 loading?: boolean;
 optional?: boolean;
 containerClassName?: string;
 showCharacterCount?: boolean;
 maxCharacters?: number;
}

export const EnhancedTextareaField = forwardRef<
 HTMLTextAreaElement,
 EnhancedTextareaFieldProps
>(
 (
 {
 label,
 error,
 success,
 hint,
 loading,
 optional,
 containerClassName,
 className,
 disabled,
 showCharacterCount,
 maxCharacters,
 value,
 ...props
 },
 ref
 ) => {
 const hasError = !!error;
 const hasSuccess = success && !error;
 const characterCount = value ? String(value).length : 0;
 const isOverLimit = maxCharacters ? characterCount > maxCharacters : false;

 return (
 <div className={cn("space-y-2", containerClassName)}>
 <div className="flex items-center justify-between">
 {label && (
 <Label
 htmlFor={props.id}
 className="flex items-center gap-2 text-sm font-medium"
 >
 {label}
 {optional && (
 <span className="text-xs text-muted-foreground font-normal">
 (İsteğe bağlı)
 </span>
 )}
 </Label>
 )}

 {showCharacterCount && (
 <span
 className={cn(
"text-xs text-muted-foreground",
 isOverLimit &&"text-destructive"
 )}
 >
 {characterCount}
 {maxCharacters && ` / ${maxCharacters}`}
 </span>
 )}
 </div>

 <div className="relative">
 <Textarea
 ref={ref}
 className={cn(
"",
 hasError &&"border-destructive focus-visible:ring-destructive",
 hasSuccess &&"border-success focus-visible:ring-success",
 isOverLimit &&"border-destructive",
 className
 )}
 disabled={disabled || loading}
 aria-invalid={hasError || isOverLimit}
 aria-describedby={
 error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined
 }
 value={value}
 {...props}
 />
 </div>

 <AnimatePresence mode="wait">
 {error && (
 <motion.p
 id={`${props.id}-error`}
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="text-sm text-destructive flex items-center gap-1.5"
 role="alert"
 >
 <AlertCircle className="h-3.5 w-3.5" />
 {error}
 </motion.p>
 )}

 {!error && isOverLimit && (
 <motion.p
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="text-sm text-destructive flex items-center gap-1.5"
 role="alert"
 >
 <AlertCircle className="h-3.5 w-3.5" />
 Karakter sınırı aşıldı
 </motion.p>
 )}

 {!error && !isOverLimit && hint && (
 <motion.p
 id={`${props.id}-hint`}
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-sm text-muted-foreground flex items-center gap-1.5"
 >
 <Info className="h-3.5 w-3.5" />
 {hint}
 </motion.p>
 )}
 </AnimatePresence>
 </div>
 );
 }
);

EnhancedTextareaField.displayName ="EnhancedTextareaField";
