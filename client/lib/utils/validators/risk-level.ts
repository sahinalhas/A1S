/**
 * Risk Level Utilities
 * Normalizes risk level comparisons and colors
 */

export type RiskLevel = 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik';

export const RISK_LEVELS = {
 LOW: 'Düşük',
 MEDIUM: 'Orta',
 HIGH: 'Yüksek',
 CRITICAL: 'Kritik',
} as const;

/**
 * Normalize risk level string to standard format
 * Handles case-insensitive comparisons (DÜŞÜK, düşük, Düşük all map to 'Düşük')
 */
export function normalizeRiskLevel(level: string | null | undefined): RiskLevel {
 if (!level) return RISK_LEVELS.LOW;
 
 const normalized = level.toUpperCase().trim();
 
 if (normalized.includes('KRİTİK') || normalized.includes('CRITICAL')) return RISK_LEVELS.CRITICAL;
 if (normalized.includes('YÜKSEK') || normalized.includes('HIGH')) return RISK_LEVELS.HIGH;
 if (normalized.includes('ORTA') || normalized.includes('MEDIUM') || normalized.includes('MODERATE')) return RISK_LEVELS.MEDIUM;
 
 return RISK_LEVELS.LOW;
}

/**
 * Get risk level color class
 */
export function getRiskColor(level: string | null | undefined): string {
 const normalized = normalizeRiskLevel(level);
 
 switch (normalized) {
 case RISK_LEVELS.CRITICAL:
 return 'bg-red-500';
 case RISK_LEVELS.HIGH:
 return 'bg-orange-500';
 case RISK_LEVELS.MEDIUM:
 return 'bg-yellow-500';
 case RISK_LEVELS.LOW:
 return 'bg-green-500';
 default:
 return 'bg-gray-500';
 }
}

/**
 * Get risk level text color class
 */
export function getRiskTextColor(level: string | null | undefined): string {
 const normalized = normalizeRiskLevel(level);
 
 switch (normalized) {
 case RISK_LEVELS.CRITICAL:
 return 'text-red-600';
 case RISK_LEVELS.HIGH:
 return 'text-orange-600';
 case RISK_LEVELS.MEDIUM:
 return 'text-yellow-600';
 case RISK_LEVELS.LOW:
 return 'text-green-600';
 default:
 return 'text-gray-600';
 }
}

/**
 * Get risk level border color class
 */
export function getRiskBorderColor(level: string | null | undefined): string {
 const normalized = normalizeRiskLevel(level);
 
 switch (normalized) {
 case RISK_LEVELS.CRITICAL:
 return 'border-red-500';
 case RISK_LEVELS.HIGH:
 return 'border-orange-500';
 case RISK_LEVELS.MEDIUM:
 return 'border-yellow-500';
 case RISK_LEVELS.LOW:
 return 'border-green-500';
 default:
 return 'border-gray-500';
 }
}

/**
 * Compare two risk levels
 */
export function compareRiskLevels(a: string | null | undefined, b: string | null | undefined): boolean {
 return normalizeRiskLevel(a) === normalizeRiskLevel(b);
}
