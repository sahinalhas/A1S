
/**
 * AI Health Monitor Service
 * Provider sağlığını izler ve otomatik failover yapar
 */

import { AIProviderService, type AIProvider } from './ai-provider.service.js';

interface ProviderHealth {
  provider: AIProvider;
  isHealthy: boolean;
  lastChecked: Date;
  consecutiveFailures: number;
  averageResponseTime: number;
  errorRate: number;
}

export class AIHealthMonitor {
  private static instance: AIHealthMonitor;
  private healthStatus = new Map<AIProvider, ProviderHealth>();
  private readonly CHECK_INTERVAL = 60000; // 1 dakika
  private readonly MAX_FAILURES = 3;
  
  private constructor() {
    this.startMonitoring();
  }
  
  static getInstance(): AIHealthMonitor {
    if (!this.instance) {
      this.instance = new AIHealthMonitor();
    }
    return this.instance;
  }
  
  private startMonitoring(): void {
    setInterval(() => {
      this.checkAllProviders();
    }, this.CHECK_INTERVAL);
  }
  
  private async checkAllProviders(): Promise<void> {
    const providers: AIProvider[] = ['gemini', 'openai', 'ollama'];
    
    for (const provider of providers) {
      try {
        const start = Date.now();
        const service = AIProviderService.getInstance({ provider, model: 'test' });
        const isAvailable = await service.isAvailable();
        const responseTime = Date.now() - start;
        
        const current = this.healthStatus.get(provider);
        
        this.healthStatus.set(provider, {
          provider,
          isHealthy: isAvailable,
          lastChecked: new Date(),
          consecutiveFailures: isAvailable ? 0 : (current?.consecutiveFailures || 0) + 1,
          averageResponseTime: current 
            ? (current.averageResponseTime + responseTime) / 2 
            : responseTime,
          errorRate: current
            ? isAvailable 
              ? current.errorRate * 0.9 
              : Math.min(current.errorRate + 0.1, 1)
            : 0
        });
        
        // Auto-failover
        if (!isAvailable && current?.consecutiveFailures === this.MAX_FAILURES) {
          console.warn(`⚠️ Provider ${provider} unhealthy, triggering failover`);
          await this.triggerFailover(provider);
        }
      } catch (error) {
        console.error(`Health check failed for ${provider}:`, error);
      }
    }
  }
  
  private async triggerFailover(failedProvider: AIProvider): Promise<void> {
    const healthyProviders = Array.from(this.healthStatus.values())
      .filter(h => h.isHealthy && h.provider !== failedProvider)
      .sort((a, b) => a.averageResponseTime - b.averageResponseTime);
    
    if (healthyProviders.length > 0) {
      const best = healthyProviders[0];
      console.log(`🔄 Auto-switching from ${failedProvider} to ${best.provider}`);
      
      const service = AIProviderService.getInstance();
      service.setProvider(best.provider);
    }
  }
  
  getHealthStatus(): Map<AIProvider, ProviderHealth> {
    return new Map(this.healthStatus);
  }
  
  getBestProvider(): AIProvider | null {
    const healthy = Array.from(this.healthStatus.values())
      .filter(h => h.isHealthy)
      .sort((a, b) => {
        // Skor = hız + güvenilirlik
        const scoreA = (1 / a.averageResponseTime) * (1 - a.errorRate);
        const scoreB = (1 / b.averageResponseTime) * (1 - b.errorRate);
        return scoreB - scoreA;
      });
    
    return healthy.length > 0 ? healthy[0].provider : null;
  }
}
