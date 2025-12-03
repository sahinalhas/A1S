import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import {
  Bell,
  AlertTriangle,
  Calendar,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Clock,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/atoms/Button';
import type { NotificationLog } from '@/../../shared/types/notification.types';

interface NotificationItemProps {
  notification: NotificationLog;
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDismiss,
  compact = false,
}: NotificationItemProps) {
  const isRead = notification.status === 'READ';
  const isUrgent = notification.priority === 'URGENT' || notification.priority === 'HIGH';

  const getNotificationIcon = () => {
    const type = notification.notificationType;
    if (type === 'RISK_ALERT') {
      return <AlertTriangle className={cn('h-4 w-4', isUrgent ? 'text-red-500' : 'text-orange-500')} />;
    }
    if (type === 'MEETING_SCHEDULED') {
      return <Calendar className="h-4 w-4 text-blue-500" />;
    }
    if (type === 'PROGRESS_UPDATE' || type === 'WEEKLY_DIGEST' || type === 'MONTHLY_REPORT') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    if (type === 'INTERVENTION_REMINDER') {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    return <Bell className="h-4 w-4 text-muted-foreground" />;
  };

  const getPriorityBadge = () => {
    if (notification.priority === 'URGENT') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Acil
        </span>
      );
    }
    if (notification.priority === 'HIGH') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
          Yüksek
        </span>
      );
    }
    return null;
  };

  const getRecipientLabel = () => {
    switch (notification.recipientType) {
      case 'PARENT':
        return 'Veli';
      case 'TEACHER':
        return 'Öğretmen';
      case 'COUNSELOR':
        return 'Rehber';
      case 'ADMIN':
        return 'Yönetici';
      default:
        return notification.recipientType;
    }
  };

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className={cn(
          'group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all',
          'hover:bg-accent/50',
          !isRead && 'bg-primary/5 border-l-2 border-primary'
        )}
      >
        <div className="shrink-0 mt-0.5">{getNotificationIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn('text-sm truncate', !isRead && 'font-medium')}>
              {notification.subject || 'Bildirim'}
            </p>
            {getPriorityBadge()}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
              locale: tr,
            })}
          </p>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(notification.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border',
        'hover:shadow-sm hover:border-border',
        !isRead
          ? 'bg-primary/5 border-primary/20'
          : 'bg-card border-transparent hover:bg-accent/30'
      )}
    >
      <div
        className={cn(
          'shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          isUrgent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted'
        )}
      >
        {getNotificationIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={cn('text-sm', !isRead && 'font-semibold')}>
                {notification.subject || 'Bildirim'}
              </h4>
              {getPriorityBadge()}
              {!isRead && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {notification.message}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(notification.id);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {notification.recipientName || getRecipientLabel()}
          </span>
          <span>•</span>
          <span>
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
              locale: tr,
            })}
          </span>
          {notification.status === 'DELIVERED' && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                Teslim edildi
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
