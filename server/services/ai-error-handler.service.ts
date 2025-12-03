
/**
 * Helper function to extract error message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * AI Error Handler Service
 * AI servislerinde oluşan hataları merkezi olarak yönetir, loglar ve kritik durumlarda bildirim gönderir
 */

import { NotificationEngineService } from '../features/notifications/services/notification-engine.service.js';

export type AIServiceType = 
  | 'chat' 
  | 'deep-analysis' 
  | 'psychological-analysis' 
  | 'comparative-analysis'
  | 'predictive-timeline'
  | 'pattern-analysis'
  | 'other';

export type AIErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AIErrorContext {
  serviceType: AIServiceType;
  provider: string;
  model?: string;
  operation: string;
  studentId?: string;
  additionalData?: Record<string, any>;
}

export interface AIErrorDetails {
  error: Error;
  context: AIErrorContext;
  severity: AIErrorSeverity;
  timestamp: string;
  fallbackUsed: boolean;
}

class AIErrorHandlerService {
  private static instance: AIErrorHandlerService;
  private notificationEngine: NotificationEngineService;
  private errorLog: AIErrorDetails[] = [];
  private readonly MAX_LOG_SIZE = 100; // 100 ile sınırlandırılmış
  
  // Hata sayaçları (son 1 saat için)
  private errorCounts: Map<string, { count: number; lastReset: number }> = new Map();
  private readonly ERROR_THRESHOLD = 10; // 1 saatte 10 hata kritik
  private readonly RESET_INTERVAL = 60 * 60 * 1000; // 1 saat

  private constructor() {
    this.notificationEngine = new NotificationEngineService();
  }

  public static getInstance(): AIErrorHandlerService {
    if (!AIErrorHandlerService.instance) {
      AIErrorHandlerService.instance = new AIErrorHandlerService();
    }
    return AIErrorHandlerService.instance;
  }

  /**
   * AI hatasını logla ve gerekirse bildirim gönder
   */
  async handleAIError(
    error: Error,
    context: AIErrorContext,
    fallbackUsed: boolean = false
  ): Promise<void> {
    const severity = this.determineSeverity(error, context, fallbackUsed);
    
    const errorDetails: AIErrorDetails = {
      error,
      context,
      severity,
      timestamp: new Date().toISOString(),
      fallbackUsed
    };

    // Hatayı logla
    this.logError(errorDetails);

    // Console'a detaylı log
    this.consoleLog(errorDetails);

    // Kritik durumlarda bildirim gönder
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      await this.sendErrorNotification(errorDetails);
    }

    // Hata eşiğini kontrol et
    this.checkErrorThreshold(context.provider);
  }

  /**
   * Hata şiddetini belirle
   */
  private determineSeverity(
    error: Error,
    context: AIErrorContext,
    fallbackUsed: boolean
  ): AIErrorSeverity {
    const errorMsg = getErrorMessage(error);
    
    // API anahtarı veya kimlik doğrulama hataları
    if (errorMsg.includes('API key') || 
        errorMsg.includes('authentication') ||
        errorMsg.includes('unauthorized')) {
      return 'CRITICAL';
    }

    // Rate limit hataları
    if (errorMsg.includes('rate limit') || 
        errorMsg.includes('quota exceeded')) {
      return 'HIGH';
    }

    // Network hataları
    if (errorMsg.includes('ECONNREFUSED') ||
        errorMsg.includes('ETIMEDOUT') ||
        errorMsg.includes('network')) {
      return 'MEDIUM';
    }

    // Kritik servisler (fallback yoksa)
    if (!fallbackUsed && (
        context.serviceType === 'deep-analysis' ||
        context.serviceType === 'psychological-analysis'
    )) {
      return 'HIGH';
    }

    return 'LOW';
  }

  /**
   * Hatayı memory log'a ekle (max 100 kayıt)
   */
  private logError(errorDetails: AIErrorDetails): void {
    this.errorLog.push(errorDetails);
    
    // Log boyutunu 100 ile sınırla
    if (this.errorLog.length > this.MAX_LOG_SIZE) {
      this.errorLog.shift();
    }
  }

  /**
   * Console'a formatlanmış log yaz
   */
  private consoleLog(errorDetails: AIErrorDetails): void {
    const { error, context, severity, timestamp, fallbackUsed } = errorDetails;
    
    const severityEmoji = {
      'LOW': '⚠️',
      'MEDIUM': '🔶',
      'HIGH': '🔴',
      'CRITICAL': '🚨'
    };

    console.error(`
${severityEmoji[severity]} AI SERVICE ERROR [${severity}]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Timestamp: ${timestamp}
🤖 Service: ${context.serviceType}
🔧 Provider: ${context.provider}${context.model ? ` (${context.model})` : ''}
⚙️  Operation: ${context.operation}
${context.studentId ? `👤 Student ID: ${context.studentId}` : ''}
💥 Error: ${error.name}: ${error instanceof Error ? error.message : String(error)}
${error.stack ? `📍 Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}` : ''}
${fallbackUsed ? '🔄 Fallback: ✅ Used' : '🔄 Fallback: ❌ Not Available'}
${context.additionalData ? `📊 Additional: ${JSON.stringify(context.additionalData, null, 2)}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }

  /**
   * Kritik hatalarda bildirim gönder
   */
  private async sendErrorNotification(errorDetails: AIErrorDetails): Promise<void> {
    try {
      const { error, context, severity, timestamp } = errorDetails;
      
      await this.notificationEngine.sendNotification({
        recipientType: 'ADMIN',
        recipientContact: 'system@school.edu',
        channel: 'IN_APP',
        priority: severity === 'CRITICAL' ? 'URGENT' : 'HIGH',
        subject: `${severity === 'CRITICAL' ? '🚨' : '🔴'} AI Servisi Hatası`,
        message: `
AI servisi hatası tespit edildi:

🤖 Servis: ${context.serviceType}
🔧 Provider: ${context.provider}${context.model ? ` (${context.model})` : ''}
⚙️ İşlem: ${context.operation}
${context.studentId ? `👤 Öğrenci: ${context.studentId}` : ''}

💥 Hata: ${error instanceof Error ? error.message : String(error)}

🕐 Zaman: ${timestamp}

${errorDetails.fallbackUsed ? '✅ Fallback mekanizması devreye girdi.' : '❌ Fallback mevcut değil, işlem başarısız oldu.'}

Lütfen kontrol edin ve gerekirse müdahale edin.
        `.trim(),
        metadata: {
          errorType: 'AI_SERVICE_ERROR',
          severity,
          serviceType: context.serviceType,
          provider: context.provider
        }
      });

      console.log(`✅ AI hata bildirimi gönderildi (Severity: ${severity})`);
    } catch (notificationError) {
      console.error('❌ AI hata bildirimi gönderilemedi:', notificationError);
    }
  }

  /**
   * Hata eşiğini kontrol et - çok fazla hata varsa uyar
   */
  private checkErrorThreshold(provider: string): void {
    const now = Date.now();
    const key = `ai-error-${provider}`;
    
    let counter = this.errorCounts.get(key);
    
    // Sayacı sıfırla veya oluştur
    if (!counter || (now - counter.lastReset) > this.RESET_INTERVAL) {
      counter = { count: 1, lastReset: now };
      this.errorCounts.set(key, counter);
      return;
    }
    
    counter.count++;
    
    // Eşik aşıldıysa kritik bildirim gönder
    if (counter.count === this.ERROR_THRESHOLD) {
      this.sendThresholdNotification(provider, counter.count);
    }
  }

  /**
   * Eşik aşıldığında bildirim gönder
   */
  private async sendThresholdNotification(provider: string, errorCount: number): Promise<void> {
    try {
      await this.notificationEngine.sendNotification({
        recipientType: 'ADMIN',
        recipientContact: 'system@school.edu',
        channel: 'IN_APP',
        priority: 'URGENT',
        subject: '🚨 AI Servisi Kritik Hata Eşiği Aşıldı',
        message: `
UYARI: AI servisi kritik hata eşiği aşıldı!

🔧 Provider: ${provider}
📊 Hata Sayısı: ${errorCount} (son 1 saat içinde)
🚨 Durum: KRİTİK

Bu provider için son 1 saat içinde ${errorCount} hata oluştu. 
Sistemde ciddi bir sorun olabilir. Acil kontrol ve müdahale gerekebilir.

Önerilen Aksiyonlar:
1. Provider ayarlarını kontrol edin
2. API anahtarlarını ve kotaları doğrulayın
3. Network bağlantısını test edin
4. Gerekirse alternatif provider'a geçin
        `.trim(),
        metadata: {
          errorType: 'AI_ERROR_THRESHOLD',
          provider,
          errorCount
        }
      });

      console.error(`🚨 AI HATA EŞİĞİ AŞILDI: ${provider} - ${errorCount} hata (1 saat)`);
    } catch (error) {
      console.error('❌ Eşik bildirimi gönderilemedi:', error);
    }
  }

  /**
   * Son hataları getir (debug için)
   */
  getRecentErrors(limit: number = 50): AIErrorDetails[] {
    return this.errorLog.slice(-limit);
  }

  /**
   * Hata istatistikleri
   */
  getErrorStats(): {
    total: number;
    bySeverity: Record<AIErrorSeverity, number>;
    byService: Record<AIServiceType, number>;
    byProvider: Record<string, number>;
  } {
    const stats = {
      total: this.errorLog.length,
      bySeverity: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
      byService: {} as Record<AIServiceType, number>,
      byProvider: {} as Record<string, number>
    };

    this.errorLog.forEach(error => {
      stats.bySeverity[error.severity]++;
      
      const service = error.context.serviceType;
      stats.byService[service] = (stats.byService[service] || 0) + 1;
      
      const provider = error.context.provider;
      stats.byProvider[provider] = (stats.byProvider[provider] || 0) + 1;der = error.context.provider;
      stats.byProvider[provider] = (stats.byProvider[provider] || 0) + 1;
    });

    return stats;
  }

  /**
   * Hata loglarını temizle
   */
  clearErrorLog(): void {
    this.errorLog = [];
    this.errorCounts.clear();
    console.log('✅ AI hata logları temizlendi');
  }
}

export const aiErrorHandler = AIErrorHandlerService.getInstance();
export default AIErrorHandlerService;
