import { toast as sonnerToast } from 'sonner';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Bell,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'notification';

export interface NotificationOptions {
  title?: string;
  description?: string;
  type?: NotificationType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const iconMap: Record<NotificationType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  notification: Bell,
};

const colorMap: Record<NotificationType, { bg: string; text: string; border: string }> = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  notification: {
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-800',
  },
};

export function showNotification(options: NotificationOptions | string) {
  const opts: NotificationOptions = typeof options === 'string' 
    ? { description: options, type: 'info' } 
    : options;

  const {
    title,
    description,
    type = 'info',
    duration = 5000,
    action,
    onDismiss,
  } = opts;

  const Icon = iconMap[type];
  const colors = colorMap[type];

  return sonnerToast.custom(
    (t) => (
      <div
        className={cn(
          'w-full max-w-sm rounded-lg border shadow-lg',
          'animate-in slide-in-from-top-2 fade-in-0',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full',
          colors.bg,
          colors.border
        )}
      >
        <div className="flex items-start gap-3 p-4">
          <div className={cn('flex-shrink-0 mt-0.5', colors.text)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <p className={cn('text-sm font-semibold', colors.text)}>
                {title}
              </p>
            )}
            {description && (
              <p className={cn(
                'text-sm mt-0.5',
                title ? 'text-muted-foreground' : colors.text
              )}>
                {description}
              </p>
            )}
            {action && (
              <button
                onClick={() => {
                  action.onClick();
                  sonnerToast.dismiss(t);
                }}
                className={cn(
                  'mt-2 text-sm font-medium underline-offset-4 hover:underline',
                  colors.text
                )}
              >
                {action.label}
              </button>
            )}
          </div>
          <button
            onClick={() => {
              sonnerToast.dismiss(t);
              onDismiss?.();
            }}
            className={cn(
              'flex-shrink-0 p-1 rounded-md transition-colors',
              'hover:bg-black/5 dark:hover:bg-white/5',
              'text-muted-foreground hover:text-foreground'
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    ),
    {
      duration,
      position: 'top-right',
    }
  );
}

export const notify = {
  success: (message: string, options?: Omit<NotificationOptions, 'type' | 'description'>) =>
    showNotification({ ...options, description: message, type: 'success' }),
  
  error: (message: string, options?: Omit<NotificationOptions, 'type' | 'description'>) =>
    showNotification({ ...options, description: message, type: 'error' }),
  
  warning: (message: string, options?: Omit<NotificationOptions, 'type' | 'description'>) =>
    showNotification({ ...options, description: message, type: 'warning' }),
  
  info: (message: string, options?: Omit<NotificationOptions, 'type' | 'description'>) =>
    showNotification({ ...options, description: message, type: 'info' }),
  
  notification: (message: string, options?: Omit<NotificationOptions, 'type' | 'description'>) =>
    showNotification({ ...options, description: message, type: 'notification' }),
};

export function NotificationToast() {
  return null;
}

export default notify;
