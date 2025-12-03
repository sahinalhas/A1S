import * as repository from '../repository/intervention-tracking.repository.js';
import { NotificationEngineService } from '../../notifications/services/notification-engine.service.js';
import type { EscalationLog } from '../../../../shared/types/notification.types';

export class EscalationService {
  private notificationEngine: NotificationEngineService;

  constructor() {
    this.notificationEngine = new NotificationEngineService();
  }

  async triggerEscalation(
    studentId: string,
    escalationType: EscalationLog['escalationType'],
    triggerReason: string,
    riskLevel?: string,
    alertId?: string,
    interventionId?: string
  ): Promise<string> {
    const escalationChain = this.getEscalationChain(riskLevel);
    const currentLevel = escalationChain[0];

    const escalationId = repository.createEscalationLog({
      studentId,
      alertId,
      interventionId,
      escalationType,
      currentLevel: currentLevel.role,
      escalatedTo: currentLevel.contact,
      triggerReason,
      riskLevel: riskLevel as any,
      escalatedBy: 'system',
      escalatedAt: new Date().toISOString(),
      status: 'OPEN',
      notificationsSent: JSON.stringify([currentLevel.role])
    });

    await this.notifyEscalationLevel(escalationId, currentLevel, {
      studentId,
      triggerReason,
      riskLevel: riskLevel || 'ORTA'
    });

    return escalationId;
  }

  async respondToEscalation(
    escalationId: string,
    respondedBy: string,
    actionTaken: string,
    resolved: boolean
  ): Promise<void> {
    const status = resolved ? 'RESOLVED' : 'IN_PROGRESS';
    
    repository.updateEscalationResponse(
      escalationId,
      respondedBy,
      actionTaken,
      status
    );

    if (resolved) {
      const escalation = repository.getActiveEscalations().find(e => e.id === escalationId);
      
      if (escalation) {
        await this.notificationEngine.sendNotification({
          recipientType: 'COUNSELOR',
          recipientContact: 'counselor@school.edu',
          channel: 'IN_APP',
          subject: '✅ Eskalasyon Çözüldü',
          message: `${escalation.triggerReason} durumu çözüldü.\n\nAlınan Aksiyon: ${actionTaken}`,
          studentId: escalation.studentId,
          priority: 'NORMAL'
        });
      }
    }
  }

  async checkAndEscalateUnresponded(): Promise<{ escalated: number }> {
    const activeEscalations = repository.getActiveEscalations();
    let escalated = 0;

    for (const escalation of activeEscalations) {
      const hoursSinceEscalation = 
        (new Date().getTime() - new Date(escalation.escalatedAt).getTime()) / (1000 * 60 * 60);

      const threshold = escalation.riskLevel === 'KRİTİK' ? 2 : 24;

      if (hoursSinceEscalation > threshold && !escalation.respondedAt) {
        await this.escalateToNextLevel(escalation);
        escalated++;
      }
    }

    return { escalated };
  }

  private async escalateToNextLevel(escalation: EscalationLog): Promise<void> {
    const chain = this.getEscalationChain(escalation.riskLevel);
    const currentIndex = chain.findIndex(l => l.role === escalation.currentLevel);
    
    if (currentIndex < chain.length - 1) {
      const nextLevel = chain[currentIndex + 1];
      
      const notificationsSent = escalation.notificationsSent 
        ? JSON.parse(escalation.notificationsSent) 
        : [];
      notificationsSent.push(nextLevel.role);

      repository.updateInterventionEffectiveness(escalation.id, {
        escalatedTo: nextLevel.contact,
        currentLevel: nextLevel.role,
        notificationsSent: JSON.stringify(notificationsSent)
      } as any);

      await this.notifyEscalationLevel(escalation.id, nextLevel, {
        studentId: escalation.studentId,
        triggerReason: escalation.triggerReason,
        riskLevel: escalation.riskLevel || 'ORTA',
        previousLevel: escalation.currentLevel,
        hoursSinceEscalation: Math.floor(
          (new Date().getTime() - new Date(escalation.escalatedAt).getTime()) / (1000 * 60 * 60)
        )
      });
    }
  }

  private getEscalationChain(riskLevel?: string): Array<{ role: string; contact: string }> {
    if (riskLevel === 'KRİTİK') {
      return [
        { role: 'Rehber Öğretmen', contact: 'counselor@school.edu' },
        { role: 'Müdür Yardımcısı', contact: 'assistant-principal@school.edu' },
        { role: 'Müdür', contact: 'principal@school.edu' }
      ];
    }

    return [
      { role: 'Rehber Öğretmen', contact: 'counselor@school.edu' },
      { role: 'Müdür Yardımcısı', contact: 'assistant-principal@school.edu' }
    ];
  }

  private async notifyEscalationLevel(
    escalationId: string,
    level: { role: string; contact: string },
    context: any
  ): Promise<void> {
    const urgency = context.riskLevel === 'KRİTİK' ? '🚨 ACİL' : '⚠️';
    const message = context.previousLevel
      ? `${urgency} Eskalasyon - ${context.previousLevel} ${context.hoursSinceEscalation} saattir yanıt vermedi\n\nÖğrenci ID: ${context.studentId}\nDurum: ${context.triggerReason}\nRisk: ${context.riskLevel}`
      : `${urgency} Yeni Eskalasyon\n\nÖğrenci ID: ${context.studentId}\nDurum: ${context.triggerReason}\nRisk: ${context.riskLevel}`;

    await this.notificationEngine.sendNotification({
      recipientType: 'ADMIN',
      recipientContact: level.contact,
      channel: 'EMAIL',
      subject: `${urgency} Öğrenci Eskalasyonu - ${level.role}`,
      message,
      studentId: context.studentId,
      priority: context.riskLevel === 'KRİTİK' ? 'URGENT' : 'HIGH'
    });
  }

  async getEscalationMetrics(): Promise<any> {
    const stats = repository.getEscalationStats();
    const active = repository.getActiveEscalations();

    return {
      ...stats,
      activeCount: active.length,
      criticalActive: active.filter(e => e.riskLevel === 'KRİTİK').length,
      overdueCount: active.filter(e => {
        const hours = (new Date().getTime() - new Date(e.escalatedAt).getTime()) / (1000 * 60 * 60);
        const threshold = e.riskLevel === 'KRİTİK' ? 2 : 24;
        return hours > threshold;
      }).length
    };
  }
}
