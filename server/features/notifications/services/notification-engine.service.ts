import * as repository from '../repository/notifications.repository.js';
import type { NotificationRequest, NotificationLog } from '../../../../shared/types/notification.types';

export class NotificationEngineService {
  
  async sendNotification(request: NotificationRequest): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    try {
      const notificationId = repository.createNotification({
        recipientType: request.recipientType,
        recipientContact: request.recipientContact,
        notificationType: 'CUSTOM',
        channel: request.channel,
        subject: request.subject,
        message: request.message,
        studentId: request.studentId,
        alertId: request.alertId,
        interventionId: request.interventionId,
        status: 'PENDING',
        priority: request.priority || 'NORMAL',
        metadata: request.metadata ? JSON.stringify(request.metadata) : undefined,
        templateId: request.templateId
      });

      this.processNotification(notificationId);

      return { success: true, notificationId };
    } catch (error: unknown) {
      console.error('Failed to create notification:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async sendBulkNotifications(requests: NotificationRequest[]): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    details: Array<{ success: boolean; notificationId?: string; error?: string }>;
  }> {
    const results = [];
    
    for (const request of requests) {
      const result = await this.sendNotification(request);
      results.push(result);
    }

    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      success: true,
      sent,
      failed,
      details: results
    };
  }

  async sendTemplatedNotification(
    templateName: string,
    recipientContact: string,
    recipientType: 'PARENT' | 'TEACHER' | 'COUNSELOR' | 'ADMIN',
    variables: Record<string, string>,
    options?: {
      studentId?: string;
      alertId?: string;
      interventionId?: string;
      priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    }
  ): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    try {
      const template = repository.getTemplateByName(templateName);
      
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      let subject = template.subjectTemplate || '';
      let message = template.messageTemplate;

      for (const [key, value] of Object.entries(variables)) {
        subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }

      return await this.sendNotification({
        recipientType,
        recipientContact,
        channel: template.channel === 'ALL' ? 'EMAIL' : template.channel as any,
        templateId: template.id,
        subject,
        message,
        priority: options?.priority,
        studentId: options?.studentId,
        alertId: options?.alertId,
        interventionId: options?.interventionId
      });
    } catch (error: unknown) {
      console.error('Failed to send templated notification:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async processNotification(notificationId: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      repository.updateNotificationStatus(notificationId, 'SENT', {
        sentAt: now
      });

      setTimeout(() => {
        repository.updateNotificationStatus(notificationId, 'DELIVERED', {
          deliveredAt: new Date().toISOString()
        });
      }, 100);

    } catch (error) {
      console.error('Failed to process notification:', error);
      repository.updateNotificationStatus(notificationId, 'FAILED', {
        failureReason: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async retryFailedNotifications(): Promise<{ retried: number }> {
    const failed = repository.getPendingNotifications().filter(
      n => n.status === 'FAILED' && 
      new Date(n.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    for (const notification of failed) {
      await this.processNotification(notification.id);
    }

    return { retried: failed.length };
  }

  async getNotificationStats(dateFrom?: string): Promise<any> {
    return repository.getNotificationStats(dateFrom);
  }

  async getPendingNotifications(): Promise<NotificationLog[]> {
    return repository.getPendingNotifications();
  }
}
