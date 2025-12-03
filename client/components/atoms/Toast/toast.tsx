import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Loader2,
  Bell,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[420px]",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 pr-10 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "border-border/50 bg-background/95 text-foreground shadow-md",
        success: "border-emerald-200/50 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-900 dark:border-emerald-800/50 dark:from-emerald-950/90 dark:to-green-950/90 dark:text-emerald-100",
        error: "border-red-200/50 bg-gradient-to-r from-red-50 to-rose-50 text-red-900 dark:border-red-800/50 dark:from-red-950/90 dark:to-rose-950/90 dark:text-red-100",
        warning: "border-amber-200/50 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 dark:border-amber-800/50 dark:from-amber-950/90 dark:to-yellow-950/90 dark:text-amber-100",
        info: "border-blue-200/50 bg-gradient-to-r from-blue-50 to-sky-50 text-blue-900 dark:border-blue-800/50 dark:from-blue-950/90 dark:to-sky-950/90 dark:text-blue-100",
        loading: "border-violet-200/50 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-900 dark:border-violet-800/50 dark:from-violet-950/90 dark:to-purple-950/90 dark:text-violet-100",
        notification: "border-indigo-200/50 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-900 dark:border-indigo-800/50 dark:from-indigo-950/90 dark:to-blue-950/90 dark:text-indigo-100",
        destructive: "border-red-300/50 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const iconVariants = cva(
  "flex-shrink-0 mt-0.5",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        success: "text-emerald-600 dark:text-emerald-400",
        error: "text-red-600 dark:text-red-400",
        warning: "text-amber-600 dark:text-amber-400",
        info: "text-blue-600 dark:text-blue-400",
        loading: "text-violet-600 dark:text-violet-400",
        notification: "text-indigo-600 dark:text-indigo-400",
        destructive: "text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const ToastIcon: React.FC<{ variant?: VariantProps<typeof toastVariants>["variant"] }> = ({ variant }) => {
  const iconClass = cn(iconVariants({ variant }), "h-5 w-5");
  
  switch (variant) {
    case "success":
      return <CheckCircle2 className={iconClass} />;
    case "error":
    case "destructive":
      return <XCircle className={iconClass} />;
    case "warning":
      return <AlertTriangle className={iconClass} />;
    case "info":
      return <Info className={iconClass} />;
    case "loading":
      return <Loader2 className={cn(iconClass, "animate-spin")} />;
    case "notification":
      return <Bell className={iconClass} />;
    default:
      return <Sparkles className={iconClass} />;
  }
};

interface ToastProgressProps {
  duration?: number;
  variant?: VariantProps<typeof toastVariants>["variant"];
  isPaused?: boolean;
}

const progressVariants = cva(
  "h-1 rounded-full transition-all ease-linear",
  {
    variants: {
      variant: {
        default: "bg-muted-foreground/30",
        success: "bg-emerald-500/50",
        error: "bg-red-500/50",
        warning: "bg-amber-500/50",
        info: "bg-blue-500/50",
        loading: "bg-violet-500/50",
        notification: "bg-indigo-500/50",
        destructive: "bg-white/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const ToastProgress: React.FC<ToastProgressProps> = ({ duration = 5000, variant, isPaused = false }) => {
  const [progress, setProgress] = React.useState(100);
  const startTimeRef = React.useRef<number>(Date.now());
  const remainingTimeRef = React.useRef<number>(duration);

  React.useEffect(() => {
    if (isPaused) {
      remainingTimeRef.current = (progress / 100) * duration;
      return;
    }

    startTimeRef.current = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, remainingTimeRef.current - elapsed);
      const newProgress = (remaining / duration) * 100;
      setProgress(newProgress);

      if (newProgress > 0) {
        requestAnimationFrame(animate);
      }
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [duration, isPaused, progress]);

  if (duration === Infinity) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-xl bg-black/5 dark:bg-white/5">
      <div 
        className={cn(progressVariants({ variant }))}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export interface ToastRootProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
  VariantProps<typeof toastVariants> {
  showIcon?: boolean;
  showProgress?: boolean;
  duration?: number;
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastRootProps
>(({ className, variant, showIcon = true, showProgress = true, duration, children, ...props }, ref) => {
  const [isPaused, setIsPaused] = React.useState(false);

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      duration={duration}
      onPause={() => setIsPaused(true)}
      onResume={() => setIsPaused(false)}
      {...props}
    >
      {showIcon && <ToastIcon variant={variant} />}
      <div className="flex-1 min-w-0">
        {children}
      </div>
      {showProgress && variant !== "loading" && (
        <ToastProgress duration={duration} variant={variant} isPaused={isPaused} />
      )}
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-current/20 bg-current/10 px-3 text-xs font-medium transition-colors hover:bg-current/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-3 top-3 rounded-lg p-1 opacity-60 transition-all hover:opacity-100 hover:bg-current/10 focus:outline-none focus:ring-2 focus:ring-ring",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-tight", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-80 mt-1 leading-relaxed", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastIcon,
  ToastProgress,
};
