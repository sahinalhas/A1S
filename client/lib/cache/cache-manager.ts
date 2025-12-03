interface CacheEntry<T> {
 data: T;
 timestamp: number;
 ttl: number;
}

export class CacheManager {
 private cache = new Map<string, CacheEntry<any>>();
 private readonly defaultTTL: number;

 constructor(defaultTTL = 5 * 60 * 1000) {
 this.defaultTTL = defaultTTL;
 }

 set<T>(key: string, data: T, ttl = this.defaultTTL): void {
 this.cache.set(key, {
 data,
 timestamp: Date.now(),
 ttl,
 });
 }

 get<T>(key: string): T | null {
 const entry = this.cache.get(key);
 if (!entry) return null;

 if (this.isExpired(entry)) {
 this.cache.delete(key);
 return null;
 }

 return entry.data;
 }

 has(key: string): boolean {
 const entry = this.cache.get(key);
 if (!entry) return false;
 
 if (this.isExpired(entry)) {
 this.cache.delete(key);
 return false;
 }
 
 return true;
 }

 invalidate(pattern?: string): void {
 if (!pattern) {
 this.cache.clear();
 return;
 }

 for (const key of this.cache.keys()) {
 if (key.includes(pattern)) {
 this.cache.delete(key);
 }
 }
 }

 size(): number {
 return this.cache.size;
 }

 private isExpired(entry: CacheEntry<any>): boolean {
 return Date.now() - entry.timestamp > entry.ttl;
 }

 clear(): void {
 this.cache.clear();
 }
}
