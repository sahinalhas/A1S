
/**
 * AI Cache Service
 * Aynı sorular için cache kullanarak maliyet ve latency azaltır
 * 
 * NOT: Bu servis şu anda hiçbir yerde kullanılmıyor.
 * Kullanmak için ai-provider.service.ts'de chat() metoduna entegre edin.
 */

import crypto from 'crypto';
import type { ChatMessage } from './ai-provider.service.js';

interface CacheEntry {
  response: string;
  timestamp: Date;
  provider: string;
  model: string;
  hitCount: number;
}

export class AICacheService {
  private static cache = new Map<string, CacheEntry>();
  private static readonly TTL = 24 * 60 * 60 * 1000; // 24 saat
  private static readonly MAX_CACHE_SIZE = 1000;
  
  /**
   * Cache key oluştur
   */
  private static generateKey(messages: ChatMessage[], temperature: number): string {
    const content = JSON.stringify({ messages, temperature });
    return crypto.createHash('sha256').update(content).digest('hex');
  }
  
  /**
   * Cache'den al
   */
  static get(messages: ChatMessage[], temperature: number): string | null {
    const key = this.generateKey(messages, temperature);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // TTL kontrolü
    const age = Date.now() - entry.timestamp.getTime();
    if (age > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    // Hit count artır
    entry.hitCount++;
    
    console.log(`✅ Cache hit! Saved API call. Hit count: ${entry.hitCount}`);
    return entry.response;
  }
  
  /**
   * Cache'e kaydet
   */
  static set(messages: ChatMessage[], temperature: number, response: string, provider: string, model: string): void {
    // Cache size kontrolü
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // En az kullanılanı sil (LRU)
      const leastUsed = Array.from(this.cache.entries())
        .sort((a, b) => a[1].hitCount - b[1].hitCount)[0];
      this.cache.delete(leastUsed[0]);
    }
    
    const key = this.generateKey(messages, temperature);
    this.cache.set(key, {
      response,
      timestamp: new Date(),
      provider,
      model,
      hitCount: 0
    });
  }
  
  /**
   * Cache istatistikleri
   */
  static getStats() {
    const entries = Array.from(this.cache.values());
    return {
      totalEntries: this.cache.size,
      totalHits: entries.reduce((sum, e) => sum + e.hitCount, 0),
      avgHitsPerEntry: entries.length > 0 
        ? entries.reduce((sum, e) => sum + e.hitCount, 0) / entries.length 
        : 0,
      cacheEfficiency: entries.length > 0
        ? (entries.reduce((sum, e) => sum + e.hitCount, 0) / entries.length) * 100
        : 0
    };
  }
  
  /**
   * Cache temizle
   */
  static clear(): void {
    this.cache.clear();
  }
}
