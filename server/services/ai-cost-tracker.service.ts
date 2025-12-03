
/**
 * AI Cost Tracker Service
 * API kullanım maliyetlerini takip eder
 */

import { AIProvider } from './ai-provider.service.js';

interface UsageRecord {
  timestamp: Date;
  provider: AIProvider;
  model: string;
  tokenCount: number;
  estimatedCost: number;
  taskType?: string;
}

export class AICostTracker {
  private static records: UsageRecord[] = [];
  
  // Token başına tahmini maliyet (USD)
  private static readonly COSTS: Record<string, number> = {
    'gemini-2.5-flash': 0,
    'gemini-2.5-pro': 0,
    'gpt-4o': 0.0001,
    'gpt-4o-mini': 0.00001,
    'llama3.2:3b': 0,
    'llama3.2': 0,  // Legacy support
    'llama3': 0  // Legacy support
  };
  
  static track(
    provider: AIProvider, 
    model: string, 
    tokenCount: number,
    taskType?: string
  ): void {
    const cost = this.COSTS[model] || 0;
    
    this.records.push({
      timestamp: new Date(),
      provider,
      model,
      tokenCount,
      estimatedCost: cost * tokenCount,
      taskType
    });
    
    // Son 30 günü tut
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.records = this.records.filter(r => r.timestamp > thirtyDaysAgo);
  }
  
  static getDailyStats(days: number = 7) {
    const now = new Date();
    const stats: Record<string, { cost: number; calls: number }> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      
      const dayRecords = this.records.filter(r => 
        r.timestamp.toISOString().split('T')[0] === key
      );
      
      stats[key] = {
        cost: dayRecords.reduce((sum, r) => sum + r.estimatedCost, 0),
        calls: dayRecords.length
      };
    }
    
    return stats;
  }
  
  static getMonthlyTotal(): number {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return this.records
      .filter(r => r.timestamp >= monthStart)
      .reduce((sum, r) => sum + r.estimatedCost, 0);
  }
  
  static getProviderBreakdown() {
    const breakdown: Record<AIProvider, { cost: number; calls: number; tokens: number }> = {
      gemini: { cost: 0, calls: 0, tokens: 0 },
      openai: { cost: 0, calls: 0, tokens: 0 },
      ollama: { cost: 0, calls: 0, tokens: 0 }
    };
    
    this.records.forEach(r => {
      breakdown[r.provider].cost += r.estimatedCost;
      breakdown[r.provider].calls++;
      breakdown[r.provider].tokens += r.tokenCount;
    });
    
    return breakdown;
  }
}
