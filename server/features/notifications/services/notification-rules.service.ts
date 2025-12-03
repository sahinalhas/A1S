import { NotificationEngineService } from './notification-engine.service.js';
import * as repository from '../repository/notifications.repository.js';
import getDatabase from '../../../lib/database.js';
import type { EarlyWarningAlert } from '../../../../shared/types/early-warning.types';

export class NotificationRulesService {
  private notificationEngine: NotificationEngineService;
  private db;

  constructor() {
    this.notificationEngine = new NotificationEngineService();
    this.db = getDatabase();
  }

  private getStudent(studentId: string): any {
    const stmt = this.db.prepare('SELECT * FROM students WHERE id = ?');
    return stmt.get(studentId);
  }

  async processAlertNotifications(alert: EarlyWarningAlert): Promise<void> {
    const student = this.getStudent(alert.studentId);
    if (!student) return;

    const parentPrefs = repository.getPreferenceByParent(alert.studentId);

    if (alert.alertLevel === 'KRİTİK' || alert.alertLevel === 'YÜKSEK') {
      const parentContact = student.veliTelefon || student.veliAdi;
      
      if (parentContact && this.shouldSendNotification(parentPrefs, alert.alertLevel)) {
        await this.notificationEngine.sendTemplatedNotification(
          'tpl_risk_alert_critical',
          parentContact,
          'PARENT',
          {
            studentName: `${student.name} ${student.surname}`,
            parentName: student.veliAdi || 'Sayın Veli',
            alertType: alert.alertType,
            description: alert.description || alert.title
          },
          {
            studentId: alert.studentId,
            alertId: alert.id,
            priority: alert.alertLevel === 'KRİTİK' ? 'URGENT' : 'HIGH'
          }
        );
      }
    }

    if (alert.alertLevel === 'KRİTİK') {
      await this.notificationEngine.sendNotification({
        recipientType: 'COUNSELOR',
        recipientContact: 'counselor@school.edu',
        channel: 'IN_APP',
        subject: `🚨 Kritik Uyarı: ${student.name} ${student.surname}`,
        message: `${alert.title}\n\n${alert.description}`,
        studentId: alert.studentId,
        alertId: alert.id,
        priority: 'URGENT'
      });
    }
  }

  async processInterventionNotifications(interventionId: string, studentId: string, interventionTitle: string, startDate: string): Promise<void> {
    const student = this.getStudent(studentId);
    if (!student) return;

    const parentContact = student.veliTelefon || student.veliAdi;
    const parentPrefs = repository.getPreferenceByParent(studentId);

    if (parentContact && parentPrefs?.emailEnabled) {
      const dashboardToken = await this.generateParentDashboardLink(studentId);
      
      await this.notificationEngine.sendTemplatedNotification(
        'tpl_intervention_created',
        parentContact,
        'PARENT',
        {
          studentName: `${student.name} ${student.surname}`,
          parentName: student.veliAdi || 'Sayın Veli',
          interventionTitle,
          startDate,
          dashboardLink: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/parent/dashboard/${dashboardToken}`
        },
        {
          studentId,
          interventionId,
          priority: 'NORMAL'
        }
      );
    }
  }

  async sendWeeklyDigest(studentId: string, progressSummary: string): Promise<void> {
    const student = this.getStudent(studentId);
    if (!student) return;

    const parentPrefs = repository.getPreferenceByParent(studentId);
    
    if (!parentPrefs?.weeklyDigest) return;

    const parentContact = student.veliTelefon || student.veliAdi;
    if (!parentContact) return;

    const dashboardToken = await this.generateParentDashboardLink(studentId);

    await this.notificationEngine.sendTemplatedNotification(
      'tpl_weekly_progress',
      parentContact,
      'PARENT',
      {
        studentName: `${student.name} ${student.surname}`,
        parentName: student.veliAdi || 'Sayın Veli',
        progressSummary,
        reportLink: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/parent/dashboard/${dashboardToken}`
      },
      {
        studentId,
        priority: 'LOW'
      }
    );
  }

  async scheduleMeetingInvitation(
    studentId: string,
    meetingDate: string,
    meetingTime: string,
    meetingTopic: string
  ): Promise<void> {
    const student = this.getStudent(studentId);
    if (!student) return;

    const parentContact = student.veliTelefon || student.veliAdi;
    if (!parentContact) return;

    const confirmToken = Math.random().toString(36).substring(2, 15);

    await this.notificationEngine.sendTemplatedNotification(
      'tpl_meeting_invitation',
      parentContact,
      'PARENT',
      {
        studentName: `${student.name} ${student.surname}`,
        parentName: student.veliAdi || 'Sayın Veli',
        meetingDate,
        meetingTime,
        meetingTopic,
        confirmLink: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/meeting/confirm/${confirmToken}`
      },
      {
        studentId,
        priority: 'NORMAL'
      }
    );
  }

  private shouldSendNotification(prefs: any, riskLevel: string): boolean {
    if (!prefs) return true;

    if (prefs.riskLevels) {
      const allowedLevels = JSON.parse(prefs.riskLevels);
      if (!allowedLevels.includes(riskLevel)) return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (prefs.quietHoursStart && prefs.quietHoursEnd) {
      if (currentTime >= prefs.quietHoursStart && currentTime <= prefs.quietHoursEnd) {
        return false;
      }
    }

    return true;
  }

  private async generateParentDashboardLink(studentId: string): Promise<string> {
    const student = this.getStudent(studentId);
    if (!student) throw new Error('Student not found');

    const accessToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    repository.createParentAccessToken({
      studentId,
      parentName: student.veliAdi || 'Veli',
      parentContact: student.veliTelefon || '',
      accessToken,
      accessLevel: 'VIEW_ONLY',
      expiresAt: expiresAt.toISOString(),
      isActive: 1,
      accessCount: 0,
      createdBy: 'system'
    });

    return accessToken;
  }
}
