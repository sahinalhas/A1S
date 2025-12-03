import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

interface AnimatedButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 variant?:
 |"default"
 |"destructive"
 |"outline"
 |"secondary"
 |"ghost"
 |"link";
 size?:"default" |"sm" |"lg" |"icon";
 loading?: boolean;
 leftIcon?: React.ReactNode;
 rightIcon?: React.ReactNode;
 ripple?: boolean;
 glow?: boolean;
 pulse?: boolean;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
 (
 {
 className,
 children,
 variant ="default",
 size ="default",
 loading = false,
 leftIcon,
 rightIcon,
 ripple = true,
 glow = false,
 pulse = false,
 disabled,
 ...props
 },
 ref
 ) => {
 return (
 <motion.div
 whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
 transition={{ type:"spring", stiffness: 400, damping: 17 }}
 >
 <Button
 ref={ref}
 variant={variant}
 size={size}
 className={cn(
"relative overflow-hidden",
 glow &&"",
 pulse && !disabled && !loading &&"",
 className
 )}
 disabled={disabled || loading}
 {...props}
 >
 {ripple && !disabled && !loading && (
 <span className="absolute inset-0 overflow-hidden rounded-md">
 <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-" />
 </span>
 )}

 {loading && (
 <Loader2 className="mr-2 h-4 w-4" />
 )}

 {!loading && leftIcon && (
 <span className="mr-2">{leftIcon}</span>
 )}

 <span className="relative z-10">{children}</span>

 {!loading && rightIcon && (
 <span className="ml-2">{rightIcon}</span>
 )}
 </Button>
 </motion.div>
 );
 }
);

AnimatedButton.displayName ="AnimatedButton";

export const IconButton = forwardRef<
 HTMLButtonElement,
 AnimatedButtonProps & { icon: React.ReactNode; label: string }
>(({ icon, label, className, ...props }, ref) => {
 return (
 <AnimatedButton
 ref={ref}
 size="icon"
 className={cn("group", className)}
 aria-label={label}
 {...props}
 >
 <span className=" group-">
 {icon}
 </span>
 </AnimatedButton>
 );
});

IconButton.displayName ="IconButton";

export const FloatingActionButton = forwardRef<
 HTMLButtonElement,
 AnimatedButtonProps
>(({ className, children, ...props }, ref) => {
 return (
 <motion.div
 initial={{ scale: 0, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0, opacity: 0 }}
 transition={{ type:"spring", stiffness: 260, damping: 20 }}
 whileTap={{ scale: 0.9 }}
 className="fixed bottom-6 right-6 z-50"
 >
 <Button
 ref={ref}
 size="lg"
 className={cn(
"rounded-full h-14 w-14",
"bg-gradient-to-br from-primary to-primary/80",
"",
 className
 )}
 {...props}
 >
 {children}
 </Button>
 </motion.div>
 );
});

FloatingActionButton.displayName ="FloatingActionButton";

export const GradientButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
 ({ className, children, glow = true, ...props }, ref) => {
 return (
 <AnimatedButton
 ref={ref}
 className={cn(
"relative bg-gradient-to-r from-primary via-primary to-chart-2",
"",
"text-primary-foreground border-0",
"",
"",
 className
 )}
 glow={glow}
 {...props}
 >
 {children}
 </AnimatedButton>
 );
 }
);

GradientButton.displayName ="GradientButton";

export const OutlineAnimatedButton = forwardRef<
 HTMLButtonElement,
 AnimatedButtonProps
>(({ className, children, ...props }, ref) => {
 return (
 <motion.div
 whileTap={{ scale: 0.98 }}
 transition={{ type:"spring", stiffness: 400, damping: 17 }}
 >
 <Button
 ref={ref}
 variant="outline"
 className={cn(
"relative group overflow-hidden",
"before:absolute before:inset-0",
"before:bg-primary before: before:origin-left",
"before: before:",
"",
"",
"",
 className
 )}
 {...props}
 >
 <span className="relative z-10">{children}</span>
 </Button>
 </motion.div>
 );
});

OutlineAnimatedButton.displayName ="OutlineAnimatedButton";
