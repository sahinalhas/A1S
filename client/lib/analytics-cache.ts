// Performance optimization utilities for analytics
// Implements caching, memoization, and background calculations

import React from "react";
import { CACHE_TTL, CACHE_LIMITS, CHART_OPTIMIZATION, DEFAULT_MAX_DATA_POINTS } from "./constants/cache.constants";
import { CacheManager } from "./cache/cache-manager";
import { BackgroundProcessor } from "./cache/background-processor";

export const analyticsCache = new CacheManager(CACHE_TTL.DEFAULT);

// =================== MEMOIZATION HELPERS ===================

export function memoize<T extends (...args: any[]) => any>(
 fn: T,
 keyFn?: (...args: Parameters<T>) => string
): T {
 const cache = new Map<string, { result: ReturnType<T>; timestamp: number }>();
 const TTL = CACHE_TTL.MEMOIZE;

 return ((...args: Parameters<T>): ReturnType<T> => {
 const key = keyFn ? keyFn(...args) : JSON.stringify(args);
 const now = Date.now();
 
 const cached = cache.get(key);
 if (cached && now - cached.timestamp < TTL) {
 return cached.result;
 }

 const result = fn(...args);
 cache.set(key, { result, timestamp: now });
 
 // Clean old entries periodically
 if (cache.size > CACHE_LIMITS.MAX_MEMOIZE_ENTRIES) {
 for (const [k, v] of cache.entries()) {
 if (now - v.timestamp > TTL) {
 cache.delete(k);
 }
 }
 }

 return result;
 }) as T;
}

export const backgroundProcessor = new BackgroundProcessor({
 cacheManager: analyticsCache,
 checkInterval: CACHE_LIMITS.BACKGROUND_TASK_CHECK_INTERVAL
});

// =================== CHART OPTIMIZATION ===================

export interface ChartOptimization {
 useVirtualization: boolean;
 maxDataPoints: number;
 updateThrottle: number;
 useWebGL: boolean;
}

export const CHART_OPTIMIZATION_CONFIGS = CHART_OPTIMIZATION;

export function optimizeChartData<T>(
 data: T[],
 maxPoints: number = DEFAULT_MAX_DATA_POINTS
): T[] {
 if (data.length <= maxPoints) return data;

 // Use sampling for large datasets
 const step = Math.ceil(data.length / maxPoints);
 return data.filter((_, index) => index % step === 0);
}

// =================== DEBOUNCE & THROTTLE ===================

export function debounce<T extends (...args: any[]) => any>(
 func: T,
 wait: number
): T {
 let timeout: NodeJS.Timeout | null = null;
 
 return ((...args: Parameters<T>) => {
 const later = () => {
 timeout = null;
 func(...args);
 };
 
 if (timeout) clearTimeout(timeout);
 timeout = setTimeout(later, wait);
 }) as T;
}

export function throttle<T extends (...args: any[]) => any>(
 func: T,
 limit: number
): T {
 let inThrottle: boolean;
 
 return ((...args: Parameters<T>) => {
 if (!inThrottle) {
 func(...args);
 inThrottle = true;
 setTimeout(() => inThrottle = false, limit);
 }
 }) as T;
}

// =================== PERFORMANCE MONITORING ===================

export class PerformanceMonitor {
 private metrics = new Map<string, number[]>();

 startTiming(operation: string): () => void {
 const start = performance.now();
 
 return () => {
 const duration = performance.now() - start;
 this.recordMetric(operation, duration);
 };
 }

 recordMetric(operation: string, value: number): void {
 if (!this.metrics.has(operation)) {
 this.metrics.set(operation, []);
 }
 
 const values = this.metrics.get(operation)!;
 values.push(value);
 
 // Keep only last measurements
 if (values.length > CACHE_LIMITS.MAX_PERFORMANCE_METRICS) {
 values.shift();
 }
 }

 getAverageTime(operation: string): number {
 const values = this.metrics.get(operation);
 if (!values || values.length === 0) return 0;
 
 return values.reduce((sum, val) => sum + val, 0) / values.length;
 }

 getMetrics(): Record<string, { average: number; count: number; latest: number }> {
 const result: Record<string, { average: number; count: number; latest: number }> = {};
 
 for (const [operation, values] of this.metrics.entries()) {
 if (values.length > 0) {
 result[operation] = {
 average: values.reduce((sum, val) => sum + val, 0) / values.length,
 count: values.length,
 latest: values[values.length - 1],
 };
 }
 }
 
 return result;
 }

 clearMetrics(): void {
 this.metrics.clear();
 }
}

export const performanceMonitor = new PerformanceMonitor();

// =================== OPTIMIZED HOOKS ===================

export function useOptimizedCalculation<T>(
 calculation: () => T,
 dependencies: any[],
 cacheKey?: string
): [T | null, boolean] {
 const [result, setResult] = React.useState<T | null>(null);
 const [isLoading, setIsLoading] = React.useState(false);

 React.useEffect(() => {
 const key = cacheKey || JSON.stringify(dependencies);
 
 // Check cache first
 const cached = analyticsCache.get<T>(key);
 if (cached) {
 setResult(cached);
 return;
 }

 setIsLoading(true);
 
 // Run calculation in background
 backgroundProcessor
 .process(key, calculation)
 .then((calculatedResult) => {
 setResult(calculatedResult);
 setIsLoading(false);
 })
 .catch((error) => {
 console.error('Calculation failed:', error);
 setIsLoading(false);
 });
 }, dependencies);

 return [result, isLoading];
}

// =================== EXPORT OPTIMIZED ANALYTICS FUNCTIONS ===================

// Import functions lazily to avoid circular dependencies
const getAnalyticsFunctions = () => {
 return import("./analytics").then(module => ({
 generateEarlyWarnings: module.generateEarlyWarnings,
 generateClassComparisons: module.generateClassComparisons,
 predictStudentSuccess: module.predictStudentSuccess,
 calculateRiskScore: module.calculateRiskScore,
 }));
};

// Memoized versions of expensive functions with lazy loading
export const optimizedGenerateEarlyWarnings = memoize(
 async () => {
 const { generateEarlyWarnings } = await getAnalyticsFunctions();
 return generateEarlyWarnings();
 },
 () =>"early_warnings"
);

export const optimizedGenerateClassComparisons = memoize(
 async () => {
 const { generateClassComparisons } = await getAnalyticsFunctions();
 return generateClassComparisons();
 },
 () =>"class_comparisons"
);

export const optimizedPredictStudentSuccess = memoize(
 async (studentId: string) => {
 const { predictStudentSuccess } = await getAnalyticsFunctions();
 return predictStudentSuccess(studentId);
 },
 (studentId: string) => `student_success_${studentId}`
);

export const optimizedCalculateRiskScore = memoize(
 async (studentId: string) => {
 const { calculateRiskScore } = await getAnalyticsFunctions();
 return calculateRiskScore(studentId);
 },
 (studentId: string) => `risk_score_${studentId}`
);

// =================== CACHE INVALIDATION HELPERS ===================

export function invalidateStudentCache(studentId: string): void {
 analyticsCache.invalidate(studentId);
}

export function invalidateAllAnalyticsCache(): void {
 analyticsCache.invalidate();
}

// Auto-cleanup cache periodically
if (typeof window !== 'undefined') {
 setInterval(() => {
 // This automatically happens in the cache get method
 // but this ensures periodic cleanup
 analyticsCache.invalidate();
 }, CACHE_TTL.AUTO_CLEANUP);
}