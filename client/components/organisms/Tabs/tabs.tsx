import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: "default" | "pills" | "underline" | "minimal" | "nested";
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = {
    default: "bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm border-0",
    pills: "bg-transparent border-0 gap-2",
    underline: "bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none gap-1",
    minimal: "bg-transparent border-b border-slate-200/60 dark:border-slate-700/40 rounded-none gap-0 p-0",
    nested: "bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-700/30 gap-1 p-1.5"
  };

  const wrapperStyles = {
    default: "",
    pills: "",
    underline: "",
    minimal: "border-b border-slate-200/60 dark:border-slate-700/40",
    nested: ""
  };

  return (
    <div className={cn(
      "relative w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent",
      wrapperStyles[variant]
    )}>
      <div className="flex justify-start sm:justify-center min-w-max">
        <TabsPrimitive.List
          ref={ref}
          className={cn(
            "inline-flex h-auto items-center text-slate-600 dark:text-slate-400",
            variantStyles[variant],
            className,
          )}
          {...props}
        />
      </div>
    </div>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  icon?: LucideIcon;
  variant?: "default" | "pills" | "underline" | "minimal" | "nested";
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, children, icon: Icon, variant = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 relative group";
  
  const variantStyles = {
    default: cn(
      "rounded-md px-3 sm:px-4 py-2 sm:py-2.5 min-h-[40px] sm:min-h-[44px]",
      "text-slate-600 dark:text-slate-400",
      "hover:bg-slate-100/60 dark:hover:bg-slate-800/60",
      "hover:text-slate-800 dark:hover:text-slate-200",
      "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800",
      "data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50",
      "data-[state=active]:shadow-sm",
      "data-[state=active]:font-semibold"
    ),
    pills: cn(
      "rounded-full px-4 sm:px-5 py-2 sm:py-2.5 min-h-[40px] sm:min-h-[44px]",
      "text-slate-600 dark:text-slate-400",
      "bg-slate-100/50 dark:bg-slate-800/50",
      "hover:bg-slate-200/60 dark:hover:bg-slate-700/60",
      "data-[state=active]:bg-slate-800 dark:data-[state=active]:bg-slate-100",
      "data-[state=active]:text-white dark:data-[state=active]:text-slate-900",
      "data-[state=active]:shadow-sm",
      "data-[state=active]:font-semibold"
    ),
    underline: cn(
      "rounded-none px-4 py-2.5 border-b-2 border-transparent -mb-px",
      "text-slate-500 dark:text-slate-400",
      "hover:text-slate-700 dark:hover:text-slate-200",
      "hover:border-slate-300 dark:hover:border-slate-600",
      "data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50",
      "data-[state=active]:border-slate-900 dark:data-[state=active]:border-slate-100",
      "data-[state=active]:font-semibold"
    ),
    minimal: cn(
      "px-4 sm:px-5 py-3 sm:py-3.5 border-b-2 border-transparent -mb-px rounded-none",
      "text-slate-500 dark:text-slate-400",
      "hover:text-slate-700 dark:hover:text-slate-300",
      "data-[state=active]:text-slate-900 dark:data-[state=active]:text-white",
      "data-[state=active]:border-slate-800 dark:data-[state=active]:border-slate-200",
      "data-[state=active]:font-semibold",
      "data-[state=active]:bg-transparent"
    ),
    nested: cn(
      "rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 min-h-[36px] sm:min-h-[40px]",
      "text-slate-500 dark:text-slate-400 text-[13px]",
      "hover:text-slate-700 dark:hover:text-slate-300",
      "hover:bg-white/60 dark:hover:bg-slate-700/40",
      "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700",
      "data-[state=active]:text-slate-800 dark:data-[state=active]:text-slate-100",
      "data-[state=active]:shadow-sm",
      "data-[state=active]:font-medium"
    )
  };

  const iconStyles = {
    default: "h-4 w-4 sm:h-[18px] sm:w-[18px] opacity-70 group-data-[state=active]:opacity-100",
    pills: "h-4 w-4 sm:h-[18px] sm:w-[18px] opacity-70 group-data-[state=active]:opacity-100",
    underline: "h-4 w-4 sm:h-[18px] sm:w-[18px] opacity-60 group-data-[state=active]:opacity-100",
    minimal: "h-4 w-4 sm:h-[18px] sm:w-[18px] opacity-50 group-data-[state=active]:opacity-90",
    nested: "h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-60 group-data-[state=active]:opacity-100"
  };

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        baseStyles,
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {Icon && (
        <Icon className={iconStyles[variant]} />
      )}
      <span className="relative">{children}</span>
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 sm:mt-5 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
      "animate-in fade-in-0 duration-200",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
export type { TabsListProps, TabsTriggerProps };
