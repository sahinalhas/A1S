export const SESSION_DURATION = {
 STANDARD: 60,
 EXTENDED: 75,
 WARNING_THRESHOLD: 5,
 CAUTION_THRESHOLD: 15,
 ALERT_THRESHOLD: 30,
} as const;

export const TIME_CONVERSION = {
 MS_TO_MINUTES: 1000 * 60,
 REFERENCE_DATE: '2000-01-01',
} as const;

export const SESSION_COLORS = {
 CRITICAL: 'text-red-600',
 WARNING: 'text-orange-600',
 CAUTION: 'text-yellow-600',
 NORMAL: 'text-green-600',
} as const;
