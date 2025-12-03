import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
"inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-sm font-medium tracking-tight transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
 {
 variants: {
 variant: {
 default:
"bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.98]",
 destructive:
"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md active:scale-[0.98]",
 outline:
"border border-border/50 bg-background hover:bg-accent hover:border-border/80 active:scale-[0.98]",
 secondary:
"bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]",
 ghost:"hover:bg-accent/60 hover:text-accent-foreground",
 link:"text-primary underline-offset-4 hover:underline",
 premium:
"bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 hover:scale-102 active:scale-[0.98] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
 glass:
"glass text-foreground shadow-glass hover:shadow-glass-lg hover:-translate-y-0.5 hover:scale-101 active:scale-[0.98] border border-border/30",
 gradient:
"bg-gradient-to-r from-primary via-accent to-chart-2 text-primary-foreground shadow-depth-2 hover:shadow-depth-4 hover:-translate-y-1 hover:scale-102 active:scale-[0.98] relative overflow-hidden",
 neuro:
"neuro-soft text-foreground hover:shadow-depth-3 active:scale-[0.98]",
 magnetic:
"bg-primary text-primary-foreground shadow-sm magnetic-hover active:scale-[0.98]",
 },
 size: {
 default:"h-10 px-3.5 py-2",
 sm:"h-9 rounded-md px-2.5 text-xs",
 lg:"h-11 rounded-lg px-4 text-sm",
 xl:"h-12 rounded-xl px-6 text-base",
 icon:"h-10 w-10 rounded-lg",
 },
 },
 defaultVariants: {
 variant:"default",
 size:"default",
 },
 },
);

export interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement>,
 VariantProps<typeof buttonVariants> {
 asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant, size, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot :"button";
 return (
 <Comp
 className={cn(buttonVariants({ variant, size, className }))}
 ref={ref}
 {...props}
 />
 );
 },
);
Button.displayName ="Button";

export { Button, buttonVariants };
