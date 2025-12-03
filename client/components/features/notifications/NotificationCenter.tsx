import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  MessageSquare,
  Calendar,
  TrendingUp,
  X,
  ChevronRight,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/organisms/Popover';
import { Separator } from '@/components/atoms/Separator';
import { cn } from '@/lib/utils';
import { notificationsApi } from '@/lib/api/endpoints/notifications.api';
import type { NotificationLog } from '@/../../shared/types/notification.types';

interface NotificationCenterProps {
  className?: string;
}

const notificationIcons: Record<string, React.ElementType> = {
  RISK_ALERT: AlertTriangle,
  INTERVENTION_REMINDER: Calendar,
  PROGRESS_UPDATE: TrendingUp,
  MEETING_SCHEDULED: Calendar,
  WEEKLY_DIGEST: MessageSquare,
  MONTHLY_REPORT: MessageSquare,
  CUSTOM: Info,
};

const notificationColors: Record<string, string> = {
  RISK_ALERT: 'text-red-500 bg-red-500/10',
  INTERVENTION_REMINDER: 'text-amber-500 bg-amber-500/10',
  PROGRESS_UPDATE: 'text-emerald-500 bg-emerald-500/10',
  MEETING_SCHEDULED: 'text-blue-500 bg-blue-500/10',
  WEEKLY_DIGEST: 'text-purple-500 bg-purple-500/10',
  MONTHLY_REPORT: 'text-indigo-500 bg-indigo-500/10',
  CUSTOM: 'text-slate-500 bg-slate-500/10',
};

const priorityColors: Record<string, string> = {
  URGENT: 'bg-red-500',
  HIGH: 'bg-orange-500',
  NORMAL: 'bg-blue-500',
  LOW: 'bg-slate-400',
};

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const queryClient = useQueryClient();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      try {
        return await notificationsApi.getUnreadCount();
      } catch {
        return 0;
      }
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications-recent'],
    queryFn: async () => {
      try {
        const result = await notificationsApi.getNotificationLogs({ limit: 10 });
        return result || [];
      } catch {
        return [];
      }
    },
    enabled: isOpen,
    staleTime: 5000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const handleMarkAsRead = useCallback((notificationId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const getNotificationIcon = (type: string) => {
    const Icon = notificationIcons[type] || Info;
    return Icon;
  };

  const renderNotification = (notification: NotificationLog) => {
    const Icon = getNotificationIcon(notification.notificationType);
    const colorClass = notificationColors[notification.notificationType] || notificationColors.CUSTOM;
    const isUnread = notification.status !== 'READ';

    return (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={cn(
          'group relative flex gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer',
          isUnread
            ? 'bg-primary/5 hover:bg-primary/10 border-l-2 border-primary'
            : 'hover:bg-muted/50'
        )}
        onClick={() => isUnread && handleMarkAsRead(notification.id)}
      >
        <div className={cn(
          'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
          colorClass
        )}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className={cn(
              'text-sm line-clamp-2',
              isUnread ? 'font-medium text-foreground' : 'text-muted-foreground'
            )}>
              {notification.subject || notification.message}
            </p>
            {notification.priority && notification.priority !== 'NORMAL' && (
              <span className={cn(
                'flex-shrink-0 w-2 h-2 rounded-full mt-1.5',
                priorityColors[notification.priority]
              )} />
            )}
          </div>

          {notification.subject && notification.message && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {notification.message}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
                locale: tr,
              })}
            </span>
            {isUnread && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleMarkAsRead(notification.id, e)}
              >
                <Check className="w-3 h-3 mr-1" />
                Okundu
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-7 w-7 relative', className)}
        >
          <Bell className="h-3.5 w-3.5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[380px] p-0 shadow-lg"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Bildirimler</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {unreadCount} yeni
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Sesi kapat' : 'Sesi aç'}
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              asChild
            >
              <Link to="/ayarlar?tab=notifications" onClick={() => setIsOpen(false)}>
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </Button>
          </div>
        </div>

        {unreadCount > 0 && (
          <div className="px-4 py-2 border-b bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs justify-center gap-1.5"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Tümünü okundu olarak işaretle
            </Button>
          </div>
        )}

        <ScrollArea className="h-[350px]">
          <div className="p-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground">Yükleniyor...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Bell className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Bildirim yok
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Yeni bildirimler burada görünecek
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-1">
                  {notifications.map(renderNotification)}
                </div>
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full h-9 text-sm justify-between group"
            asChild
          >
            <Link to="/bildirimler" onClick={() => setIsOpen(false)}>
              <span>Tüm bildirimleri gör</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationCenter;
