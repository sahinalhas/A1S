import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { notificationsApi } from '@/lib/api/endpoints/notifications.api';
import type { NotificationLog } from '@/../../shared/types/notification.types';

export interface UseNotificationsOptions {
  autoRefetch?: boolean;
  refetchInterval?: number;
  limit?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    autoRefetch = true,
    refetchInterval = 30000,
    limit = 50,
  } = options;

  const queryClient = useQueryClient();
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  const unreadCountQuery = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      try {
        return await notificationsApi.getUnreadCount();
      } catch {
        return 0;
      }
    },
    refetchInterval: autoRefetch ? refetchInterval : false,
    staleTime: 10000,
  });

  const notificationsQuery = useQuery({
    queryKey: ['notifications-list', limit],
    queryFn: async () => {
      try {
        const result = await notificationsApi.getNotificationLogs({ limit });
        return result || [];
      } catch {
        return [];
      }
    },
    staleTime: 15000,
  });

  const statsQuery = useQuery({
    queryKey: ['notifications-stats'],
    queryFn: async () => {
      try {
        return await notificationsApi.getNotificationStats();
      } catch {
        return null;
      }
    },
    staleTime: 60000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
    },
  });

  useEffect(() => {
    const currentCount = unreadCountQuery.data || 0;
    if (currentCount > lastNotificationCount && lastNotificationCount > 0) {
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
    }
    setLastNotificationCount(currentCount);
  }, [unreadCountQuery.data, lastNotificationCount, queryClient]);

  const markAsRead = useCallback((notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-stats'] });
  }, [queryClient]);

  const getUnreadNotifications = useCallback((): NotificationLog[] => {
    return (notificationsQuery.data || []).filter(n => n.status !== 'READ');
  }, [notificationsQuery.data]);

  const getNotificationsByType = useCallback((type: string): NotificationLog[] => {
    return (notificationsQuery.data || []).filter(n => n.notificationType === type);
  }, [notificationsQuery.data]);

  const getNotificationsByPriority = useCallback((priority: string): NotificationLog[] => {
    return (notificationsQuery.data || []).filter(n => n.priority === priority);
  }, [notificationsQuery.data]);

  return {
    notifications: notificationsQuery.data || [],
    unreadCount: unreadCountQuery.data || 0,
    stats: statsQuery.data,
    isLoading: notificationsQuery.isLoading || unreadCountQuery.isLoading,
    isError: notificationsQuery.isError || unreadCountQuery.isError,
    markAsRead,
    markAllAsRead,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    refetch,
    getUnreadNotifications,
    getNotificationsByType,
    getNotificationsByPriority,
  };
}
