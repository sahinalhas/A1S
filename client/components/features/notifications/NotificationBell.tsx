import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Settings,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/organisms/Popover';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import { Separator } from '@/components/atoms/Separator';
import { NotificationItem } from './NotificationItem';
import { notificationsApi } from '@/lib/api/endpoints/notifications.api';
import { cn } from '@/lib/utils';
import type { NotificationLog } from '@/../../shared/types/notification.types';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['user-notifications'],
    queryFn: async () => {
      const result = await notificationsApi.getNotificationLogs({ limit: 20 });
      return result || [];
    },
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });

  const unreadCount = notifications.filter(
    (n: NotificationLog) => n.status !== 'READ'
  ).length;

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-7 w-7 relative', className)}
        >
          <Bell className="h-3.5 w-3.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground animate-in zoom-in">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[380px] p-0"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Bildirimler</h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                {unreadCount} yeni
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCheck className="h-3 w-3" />
                Tümünü Oku
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Bildirim yok
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Yeni bildirimler burada görünecek
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification: NotificationLog) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  compact
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />
        <div className="p-2 flex items-center justify-between">
          <Link to="/bildirimler" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
              Tümünü Gör
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          <Link to="/ayarlar?tab=notifications" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
