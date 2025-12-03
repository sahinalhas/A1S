import { apiClient } from '../core/client';
import type { NotificationPreference, NotificationLog, NotificationTemplate } from '@/../../shared/types/notification.types';

export const notificationsApi = {
 // Notification Preferences
 getPreferences: (userId: number) => 
 apiClient.get<NotificationPreference>(`/api/notifications/preferences/${userId}`),
 
 updatePreferences: (userId: number, data: Partial<NotificationPreference>) => 
 apiClient.put<NotificationPreference>(`/api/notifications/preferences/${userId}`, data),

 // Notification Logs
 getNotificationLogs: async (params?: { 
 userId?: number; 
 studentId?: number; 
 status?: 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED';
 dateFrom?: string;
 limit?: number;
 }) => {
 const query = new URLSearchParams();
 if (params?.userId) query.set('userId', params.userId.toString());
 if (params?.studentId) query.set('studentId', params.studentId.toString());
 if (params?.status) query.set('status', params.status);
 if (params?.dateFrom) query.set('dateFrom', params.dateFrom);
 if (params?.limit) query.set('limit', params.limit.toString());
 
 const response = await apiClient.get<{ success: boolean; data: NotificationLog[] }>(
 `/api/notifications/logs?${query.toString()}`
 );
 return response.data;
 },

 // Manual notification sending
 sendNotification: (data: {
 userId: number;
 studentId?: number;
 type: 'RISK_ALERT' | 'INTERVENTION_REMINDER' | 'PROGRESS_UPDATE' | 'MEETING_SCHEDULED';
 channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
 subject?: string;
 body: string;
 priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
 }) => apiClient.post<NotificationLog>('/api/notifications/send', data),

 // Templates
 getTemplates: () => 
 apiClient.get<NotificationTemplate[]>('/api/notifications/templates'),

 createTemplate: (data: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>) =>
 apiClient.post<NotificationTemplate>('/api/notifications/templates', data),

 updateTemplate: (id: number, data: Partial<NotificationTemplate>) =>
 apiClient.put<NotificationTemplate>(`/api/notifications/templates/${id}`, data),

 deleteTemplate: (id: number) =>
 apiClient.delete(`/api/notifications/templates/${id}`),

 // Stats
 getNotificationStats: async (dateFrom?: string) => {
 const response = await apiClient.get<{
 success: boolean;
 data: {
 total: number;
 sent: number;
 failed: number;
 delivered: number;
 byChannel: Record<string, number>;
 byType: Record<string, number>;
 };
 }>(`/api/notifications/stats${dateFrom ? `?dateFrom=${dateFrom}` : ''}`);
 return response.data;
 },

 // Retry failed notifications
 retryFailed: async () => {
 const response = await apiClient.post<{ success: boolean; data: { retried: number } }>(
 '/api/notifications/retry-failed',
 {}
 );
 return response.data;
 },

 // Parent dashboard access
 generateParentAccess: (studentId: number, expiresInDays?: number) =>
 apiClient.post<{ token: string; link: string; expires_at: string }>(
 '/api/notifications/parent-access',
 { studentId, expiresInDays }
 ),

 getParentAccessTokens: (studentId: number) =>
 apiClient.get<Array<{
 id: number;
 student_id: number;
 token: string;
 expires_at: string;
 created_at: string;
 }>>(`/api/notifications/parent-access/${studentId}`),

 revokeParentAccess: (tokenId: number) =>
 apiClient.delete(`/api/notifications/parent-access/${tokenId}`),

 markAsRead: async (notificationId: string) => {
   const response = await apiClient.patch<{ success: boolean }>(
     `/api/notifications/${notificationId}/status`,
     { status: 'READ', readAt: new Date().toISOString() }
   );
   return response;
 },

 markAllAsRead: async () => {
   const response = await apiClient.post<{ success: boolean; count: number }>(
     '/api/notifications/mark-all-read',
     {}
   );
   return response;
 },

 getUnreadCount: async () => {
   const response = await apiClient.get<{ success: boolean; count: number }>(
     '/api/notifications/unread-count'
   );
   return response.count;
 },
};
