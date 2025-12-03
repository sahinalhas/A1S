/**
 * Async Operation Monitor Service
 * Asenkron işlemlerin hata ve performans izleme servisi
 */

export interface AsyncOperationLog {
  id: string;
  operationType: 
    | 'counseling-session-sync'
    | 'survey-response-sync'
    | 'exam-result-sync'
    | 'behavior-incident-sync'
    | 'meeting-note-sync'
    | 'parent-meeting-sync'
    | 'self-assessment-sync'
    | 'attendance-sync'
    | 'other';
  status: 'success' | 'error' | 'warning';
  startTime: number;
  endTime?: number;
  duration?: number;
  error?: Error;
  context?: Record<string, any>;
  retryCount?: number;
}

class AsyncOperationMonitorService {
  private static instance: AsyncOperationMonitorService;
  private operations: Map<string, AsyncOperationLog> = new Map();
  private operationHistory: AsyncOperationLog[] = [];
  private readonly MAX_HISTORY_SIZE = 500;

  private constructor() {}

  public static getInstance(): AsyncOperationMonitorService {
    if (!AsyncOperationMonitorService.instance) {
      AsyncOperationMonitorService.instance = new AsyncOperationMonitorService();
    }
    return AsyncOperationMonitorService.instance;
  }

  /**
   * Asenkron işlem başlat ve izle
   */
  async trackAsyncOperation<T>(
    operationType: AsyncOperationLog['operationType'],
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const id = `${operationType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const log: AsyncOperationLog = {
      id,
      operationType,
      status: 'success',
      startTime: Date.now(),
      context
    };

    this.operations.set(id, log);

    try {
      const result = await operation();
      
      log.endTime = Date.now();
      log.duration = log.endTime - log.startTime;
      log.status = 'success';
      
      this.logOperation(log);
      return result;
    } catch (error) {
      log.endTime = Date.now();
      log.duration = log.endTime - log.startTime;
      log.status = 'error';
      log.error = error as Error;
      
      this.logOperation(log);
      
      // Hatayı console'a logla ama throw etme (asenkron işlem ana işlemi etkilemez)
      this.logError(log);
      
      throw error;
    } finally {
      // İşlemi aktif listeden çıkar
      this.operations.delete(id);
      
      // History'e ekle
      this.addToHistory(log);
    }
  }

  /**
   * Asenkron işlemi güvenli bir şekilde çalıştır (hata ana işlemi etkilemez)
   */
  async executeAsyncSafely<T>(
    operationType: AsyncOperationLog['operationType'],
    operation: () => Promise<T>,
    context?: Record<string, any>,
    onError?: (error: Error) => void
  ): Promise<T | null> {
    try {
      return await this.trackAsyncOperation(operationType, operation, context);
    } catch (error) {
      // Hata callback'i varsa çağır
      if (onError) {
        onError(error as Error);
      }
      
      // Null döndür, ana işlemi etkileme
      return null;
    }
  }

  /**
   * İşlemi logla
   */
  private logOperation(log: AsyncOperationLog): void {
    const emoji = log.status === 'success' ? '✅' : log.status === 'error' ? '❌' : '⚠️';
    const duration = log.duration ? `${log.duration}ms` : 'N/A';
    
    if (log.status === 'success') {
      console.log(`${emoji} Async operation completed: ${log.operationType} (${duration})`);
    } else if (log.status === 'error') {
      // Hata detayları logError'da
    }
  }

  /**
   * Hata logla - detaylı
   */
  private logError(log: AsyncOperationLog): void {
    console.error(`
❌ ASYNC OPERATION FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Operation: ${log.operationType}
🆔 ID: ${log.id}
⏱️  Duration: ${log.duration}ms
${log.context ? `📊 Context: ${JSON.stringify(log.context, null, 2)}` : ''}
💥 Error: ${log.error?.name}: ${log.error?.message}
${log.error?.stack ? `📍 Stack: ${log.error.stack.split('\n').slice(0, 3).join('\n')}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  NOT: Bu hata asenkron bir işlemde oluştu ve ana işlemi ETKİLEMEDİ.
    Ancak background görev başarısız oldu, kontrol edilmelidir.
    `);
  }

  /**
   * History'e ekle
   */
  private addToHistory(log: AsyncOperationLog): void {
    this.operationHistory.push(log);
    
    // Boyutu sınırla
    if (this.operationHistory.length > this.MAX_HISTORY_SIZE) {
      this.operationHistory.shift();
    }
  }

  /**
   * Aktif işlemleri getir
   */
  getActiveOperations(): AsyncOperationLog[] {
    return Array.from(this.operations.values());
  }

  /**
   * İşlem geçmişini getir
   */
  getOperationHistory(limit: number = 50): AsyncOperationLog[] {
    return this.operationHistory.slice(-limit);
  }

  /**
   * İstatistikler
   */
  getStats(): {
    activeCount: number;
    totalHistoryCount: number;
    errorCount: number;
    successCount: number;
    averageDuration: number;
    byType: Record<string, { count: number; errors: number }>;
  } {
    const stats = {
      activeCount: this.operations.size,
      totalHistoryCount: this.operationHistory.length,
      errorCount: 0,
      successCount: 0,
      averageDuration: 0,
      byType: {} as Record<string, { count: number; errors: number }>
    };

    let totalDuration = 0;
    let durationCount = 0;

    this.operationHistory.forEach(log => {
      // Status counts
      if (log.status === 'error') stats.errorCount++;
      if (log.status === 'success') stats.successCount++;

      // Duration
      if (log.duration) {
        totalDuration += log.duration;
        durationCount++;
      }

      // By type
      if (!stats.byType[log.operationType]) {
        stats.byType[log.operationType] = { count: 0, errors: 0 };
      }
      stats.byType[log.operationType].count++;
      if (log.status === 'error') {
        stats.byType[log.operationType].errors++;
      }
    });

    stats.averageDuration = durationCount > 0 ? totalDuration / durationCount : 0;

    return stats;
  }

  /**
   * Hatalı işlemleri getir
   */
  getFailedOperations(limit: number = 20): AsyncOperationLog[] {
    return this.operationHistory
      .filter(log => log.status === 'error')
      .slice(-limit);
  }

  /**
   * History'i temizle
   */
  clearHistory(): void {
    this.operationHistory = [];
    console.log('✅ Async operation history cleared');
  }
}

export const asyncOpMonitor = AsyncOperationMonitorService.getInstance();
export default AsyncOperationMonitorService;
