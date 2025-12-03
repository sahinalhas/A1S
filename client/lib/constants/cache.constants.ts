export const CACHE_TTL = {
 DEFAULT: 5 * 60 * 1000,
 MEMOIZE: 2 * 60 * 1000,
 AUTO_CLEANUP: 10 * 60 * 1000,
} as const;

export const CACHE_LIMITS = {
 MAX_MEMOIZE_ENTRIES: 100,
 MAX_PERFORMANCE_METRICS: 100,
 BACKGROUND_TASK_CHECK_INTERVAL: 100,
} as const;

export const CHART_OPTIMIZATION = {
 SMALL: {
 useVirtualization: false,
 maxDataPoints: 100,
 updateThrottle: 250,
 useWebGL: false,
 },
 MEDIUM: {
 useVirtualization: true,
 maxDataPoints: 500,
 updateThrottle: 500,
 useWebGL: false,
 },
 LARGE: {
 useVirtualization: true,
 maxDataPoints: 1000,
 updateThrottle: 1000,
 useWebGL: true,
 },
} as const;

export const DEFAULT_MAX_DATA_POINTS = 100;
