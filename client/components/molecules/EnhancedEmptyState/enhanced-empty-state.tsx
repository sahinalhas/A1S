import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EnhancedEmptyStateProps {
 icon?: LucideIcon;
 title: string;
 description: string;
 action?: {
 label: string;
 onClick: () => void;
 icon?: LucideIcon;
 variant?:"default" |"outline" |"ghost";
 };
 secondaryAction?: {
 label: string;
 onClick: () => void;
 icon?: LucideIcon;
 };
 illustration?:"default" |"search" |"data" |"error" |"success";
 className?: string;
 compact?: boolean;
}

export function EnhancedEmptyState({
 icon: Icon,
 title,
 description,
 action,
 secondaryAction,
 illustration ="default",
 className,
 compact = false,
}: EnhancedEmptyStateProps) {
 const containerVariants: Variants = {
 hidden: { opacity: 0, y: 20 },
 visible: {
 opacity: 1,
 y: 0,
 transition: {
 duration: 0.5,
 ease:"easeOut" as const,
 staggerChildren: 0.1,
 },
 },
 };

 const itemVariants: Variants = {
 hidden: { opacity: 0, y: 10 },
 visible: { opacity: 1, y: 0 },
 };

 const iconVariants: Variants = {
 hidden: { scale: 0.8, opacity: 0 },
 visible: {
 scale: 1,
 opacity: 1,
 transition: {
 type:"spring" as const,
 stiffness: 200,
 damping: 15,
 },
 },
 };

 return (
 <motion.div
 variants={containerVariants}
 initial="hidden"
 animate="visible"
 className={cn(
"flex flex-col items-center justify-center text-center",
 compact ?"py-8 px-4" :"py-16 px-4 min-h-[400px]",
 className
 )}
 >
 {Icon && (
 <motion.div
 variants={iconVariants}
 className={cn(
"rounded-full mb-6 flex items-center justify-center relative",
"bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
"border border-primary/20",
 compact ?"p-4" :"p-6"
 )}
 >
 <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/5 to-transparent" />
 <Icon
 className={cn(
"text-primary relative z-10",
 compact ?"h-8 w-8" :"h-12 w-12"
 )}
 />
 </motion.div>
 )}

 <motion.h3
 variants={itemVariants}
 className={cn(
"font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text",
 compact ?"text-lg" :"text-2xl"
 )}
 >
 {title}
 </motion.h3>

 <motion.p
 variants={itemVariants}
 className={cn(
"text-muted-foreground mb-6 max-w-md leading-relaxed",
 compact ?"text-sm" :"text-base"
 )}
 >
 {description}
 </motion.p>

 {(action || secondaryAction) && (
 <motion.div
 variants={itemVariants}
 className="flex flex-col sm:flex-row gap-3 items-center"
 >
 {action && (
 <Button
 onClick={action.onClick}
 variant={action.variant ||"default"}
 className={cn(
"gap-2",
""
 )}
 size={compact ?"sm" :"default"}
 >
 {action.icon && <action.icon className="h-4 w-4" />}
 {action.label}
 </Button>
 )}

 {secondaryAction && (
 <Button
 onClick={secondaryAction.onClick}
 variant="outline"
 className="gap-2"
 size={compact ?"sm" :"default"}
 >
 {secondaryAction.icon && (
 <secondaryAction.icon className="h-4 w-4" />
 )}
 {secondaryAction.label}
 </Button>
 )}
 </motion.div>
 )}
 </motion.div>
 );
}

export function EmptyStateWithIllustration({
 type ="data",
 title,
 description,
 action,
 className,
}: {
 type?:"data" |"search" |"error" |"empty";
 title: string;
 description: string;
 action?: {
 label: string;
 onClick: () => void;
 icon?: LucideIcon;
 };
 className?: string;
}) {
 const illustrations = {
 data: (
 <svg
 className="w-48 h-48 mb-6"
 viewBox="0 0 200 200"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <circle cx="100" cy="100" r="80" className="fill-primary/10" />
 <rect
 x="60"
 y="70"
 width="80"
 height="60"
 rx="4"
 className="fill-primary/20 stroke-primary/40"
 strokeWidth="2"
 />
 <line
 x1="70"
 y1="85"
 x2="120"
 y2="85"
 className="stroke-primary/60"
 strokeWidth="2"
 strokeLinecap="round"
 />
 <line
 x1="70"
 y1="100"
 x2="110"
 y2="100"
 className="stroke-primary/60"
 strokeWidth="2"
 strokeLinecap="round"
 />
 <line
 x1="70"
 y1="115"
 x2="130"
 y2="115"
 className="stroke-primary/60"
 strokeWidth="2"
 strokeLinecap="round"
 />
 </svg>
 ),
 search: (
 <svg
 className="w-48 h-48 mb-6"
 viewBox="0 0 200 200"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <circle cx="90" cy="90" r="50" className="fill-muted stroke-muted-foreground/40" strokeWidth="3" />
 <line
 x1="130"
 y1="130"
 x2="160"
 y2="160"
 className="stroke-muted-foreground/40"
 strokeWidth="6"
 strokeLinecap="round"
 />
 </svg>
 ),
 error: (
 <svg
 className="w-48 h-48 mb-6"
 viewBox="0 0 200 200"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <circle cx="100" cy="100" r="60" className="fill-destructive/10 stroke-destructive/40" strokeWidth="3" />
 <line
 x1="80"
 y1="80"
 x2="120"
 y2="120"
 className="stroke-destructive"
 strokeWidth="4"
 strokeLinecap="round"
 />
 <line
 x1="120"
 y1="80"
 x2="80"
 y2="120"
 className="stroke-destructive"
 strokeWidth="4"
 strokeLinecap="round"
 />
 </svg>
 ),
 empty: (
 <svg
 className="w-48 h-48 mb-6"
 viewBox="0 0 200 200"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <rect
 x="40"
 y="60"
 width="120"
 height="80"
 rx="8"
 className="fill-muted/50 stroke-muted-foreground/20"
 strokeWidth="2"
 strokeDasharray="5 5"
 />
 <circle cx="100" cy="100" r="4" className="fill-muted-foreground/40" />
 </svg>
 ),
 };

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className={cn(
"flex flex-col items-center justify-center py-16 px-4 min-h-[500px]",
 className
 )}
 >
 <motion.div
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ delay: 0.2, type:"spring" }}
 >
 {illustrations[type]}
 </motion.div>

 <motion.h3
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 className="text-2xl font-bold mb-2"
 >
 {title}
 </motion.h3>

 <motion.p
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.4 }}
 className="text-muted-foreground text-center mb-8 max-w-md"
 >
 {description}
 </motion.p>

 {action && (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.5 }}
 >
 <Button
 onClick={action.onClick}
 className="gap-2"
 >
 {action.icon && <action.icon className="h-4 w-4" />}
 {action.label}
 </Button>
 </motion.div>
 )}
 </motion.div>
 );
}
