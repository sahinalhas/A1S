import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
 "relative rounded-xl text-card-foreground transition-all duration-300",
 {
 variants: {
 variant: {
 default:
"border-[1.5px] border-border/70 bg-card shadow-[0_2px_8px_hsl(var(--foreground)/0.06),0_1px_3px_hsl(var(--foreground)/0.09),0_0_0_1px_hsl(var(--border)/0.15)] hover:shadow-[0_8px_16px_hsl(var(--foreground)/0.08),0_4px_8px_hsl(var(--foreground)/0.06),0_0_0_1.5px_hsl(var(--primary)/0.2)] hover:border-primary/40 hover:-translate-y-0.5",
 elevated:
"elevated-card",
 glass:
"glass text-foreground shadow-glass hover:shadow-glass-lg hover:-translate-y-1",
 gradient:
"gradient-border-animated shadow-depth-3 hover:shadow-depth-5 hover:-translate-y-1",
 neuro:
"neuro-soft hover:-translate-y-0.5",
 depth3d:
"card-3d shadow-depth-2 border border-border/50 bg-card hover:shadow-depth-4",
 spotlight:
"spotlight border border-border/70 bg-card shadow-depth-2 hover:shadow-depth-3 hover:-translate-y-0.5",
 interactive:
"card-interactive border border-border/70 bg-card shadow-depth-2",
 },
 },
 defaultVariants: {
 variant:"default",
 },
 },
);

interface CardProps
 extends React.HTMLAttributes<HTMLDivElement>,
 VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
 ({ className, variant, ...props }, ref) => (
 <div
 ref={ref}
 className={cn(cardVariants({ variant }), className)}
 {...props}
 />
 ),
);
Card.displayName ="Card";

const CardHeader = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div
 ref={ref}
 className={cn("flex flex-col space-y-1.5 p-5", className)}
 {...props}
 />
));
CardHeader.displayName ="CardHeader";

const CardTitle = React.forwardRef<
 HTMLParagraphElement,
 React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
 <h3
 ref={ref}
 className={cn(
"text-base md:text-lg font-medium leading-tight tracking-tight",
 className,
 )}
 {...props}
 />
));
CardTitle.displayName ="CardTitle";

const CardDescription = React.forwardRef<
 HTMLParagraphElement,
 React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
 <p
 ref={ref}
 className={cn("text-sm text-muted-foreground leading-snug", className)}
 {...props}
 />
));
CardDescription.displayName ="CardDescription";

const CardContent = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
));
CardContent.displayName ="CardContent";

const CardFooter = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div
 ref={ref}
 className={cn("flex items-center p-5 pt-0 gap-2", className)}
 {...props}
 />
));
CardFooter.displayName ="CardFooter";

export {
 Card,
 CardHeader,
 CardFooter,
 CardTitle,
 CardDescription,
 CardContent,
};
