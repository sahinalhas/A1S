import { useToast, type ToasterToast } from "@/hooks/utils/toast.utils";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/atoms/Toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

function ToastContent({ toast }: { toast: ToasterToast }) {
  const { id, title, description, action, timestamp, variant, duration, showIcon, showProgress, open, onOpenChange } = toast;

  return (
    <Toast 
      key={id} 
      variant={variant}
      duration={duration}
      showIcon={showIcon}
      showProgress={showProgress}
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {title && (
              <ToastTitle>{title}</ToastTitle>
            )}
            {description && (
              <ToastDescription>{description}</ToastDescription>
            )}
          </div>
        </div>
        
        {(action || timestamp) && (
          <div className="flex items-center justify-between gap-2 mt-2">
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
            {timestamp && (
              <span className={cn(
                "text-xs opacity-60 ml-auto",
                variant === "destructive" && "text-white/70"
              )}>
                {formatDistanceToNow(timestamp, { addSuffix: true, locale: tr })}
              </span>
            )}
          </div>
        )}
      </div>
      <ToastClose />
    </Toast>
  );
}

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map((toast) => (
        <ToastContent key={toast.id} toast={toast} />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
