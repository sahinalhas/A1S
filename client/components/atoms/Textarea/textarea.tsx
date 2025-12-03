import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
 ({ className, ...props }, ref) => {
 return (
 <textarea
 className={cn(
"flex min-h-[100px] w-full rounded-lg border border-border/40 bg-background px-3 py-2.5 text-sm transition-all duration-200 placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-card disabled:cursor-not-allowed disabled:opacity-50 resize-none",
 className,
 )}
 ref={ref}
 {...props}
 />
 );
 },
);
Textarea.displayName ="Textarea";

export { Textarea };
