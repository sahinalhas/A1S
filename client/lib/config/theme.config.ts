export const CHART_COLORS = {
 primary:"#2563eb",
 success:"#16a34a",
 warning:"#d97706",
 danger:"#dc2626",
 info:"#0891b2",
 muted:"#6b7280",
 accent:"#7c3aed",
} as const;

export const GRADIENT_COLORS = {
 primary:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
 success:"linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
 warning:"linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
 danger:"linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
 info:"linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
 accent:"linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
 vibrant:"linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
 sunset:"linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
 ocean:"linear-gradient(135deg, #2e3192 0%, #1bffff 100%)",
} as const;

// Modern Education Platform Gradients (2025) - Premium Edition
export const MODERN_GRADIENTS = {
 blue:"bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600",
 green:"bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600",
 amber:"bg-gradient-to-br from-amber-500 via-orange-500 to-red-500",
 purple:"bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-600",
 indigo:"bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600",
 teal:"bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600",
 rose:"bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-600",
 cyan:"bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-600",
} as const;

// Card Background Gradients with Opacity
export const CARD_GRADIENTS = {
 blue:"bg-gradient-to-br from-blue-50 to-blue-100",
 green:"bg-gradient-to-br from-green-50 to-green-100",
 amber:"bg-gradient-to-br from-amber-50 to-amber-100",
 purple:"bg-gradient-to-br from-purple-50 to-purple-100",
 indigo:"bg-gradient-to-br from-indigo-50 to-indigo-100",
 teal:"bg-gradient-to-br from-teal-50 to-teal-100",
 rose:"bg-gradient-to-br from-rose-50 to-rose-100",
 cyan:"bg-gradient-to-br from-cyan-50 to-cyan-100",
 gray:"bg-gradient-to-br from-gray-50 to-gray-100",
} as const;

// Modern Shadow System
export const MODERN_SHADOWS = {
 sm: "shadow-sm hover:shadow-md transition-shadow duration-300",
 md: "shadow-md hover:shadow-lg hover:shadow-primary/10 transition-shadow duration-300",
 lg: "shadow-lg hover:shadow-xl hover:shadow-primary/15 transition-shadow duration-300",
 xl: "shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-shadow duration-300",
 glow: "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow duration-300",
 none: "",
} as const;

// Animation Variants for Framer Motion
export const ANIMATION_VARIANTS = {
 fadeIn: {
 initial: { opacity: 0, y: 20 },
 animate: { opacity: 1, y: 0 },
 exit: { opacity: 0, y: -20 },
 },
 fadeInUp: {
 initial: { opacity: 0, y: 40 },
 animate: { opacity: 1, y: 0 },
 exit: { opacity: 0, y: 40 },
 },
 scaleIn: {
 initial: { opacity: 0, scale: 0.9 },
 animate: { opacity: 1, scale: 1 },
 exit: { opacity: 0, scale: 0.9 },
 },
 slideInRight: {
 initial: { opacity: 0, x: 100 },
 animate: { opacity: 1, x: 0 },
 exit: { opacity: 0, x: 100 },
 },
 slideInLeft: {
 initial: { opacity: 0, x: -100 },
 animate: { opacity: 1, x: 0 },
 exit: { opacity: 0, x: -100 },
 },
 staggerContainer: {
 animate: {
 transition: {
 staggerChildren: 0.1,
 },
 },
 },
} as const;

// Stagger Animation Delays
export const STAGGER_DELAYS = {
 fast: 0.05,
 normal: 0.1,
 slow: 0.15,
} as const;

export const GLASS_STYLES = {
 light:"bg-white/70 border border-white/20",
 dark:"bg-gray-900/70 border border-gray-700/20",
 primary:"bg-primary/10 border border-primary/20",
 accent:"bg-accent/10 border border-accent/20",
} as const;

export const RISK_COLORS = {
 Düşük:"#16a34a",
 Orta:"#d97706",
 Yüksek:"#dc2626",
 Kritik:"#991b1b",
} as const;

export const RISK_BADGE_COLORS = {
 Düşük:"bg-green-100 text-green-800",
 Orta:"bg-yellow-100 text-yellow-800",
 Yüksek:"bg-orange-100 text-orange-800",
 Kritik:"bg-red-100 text-red-800",
} as const;

export const MASTERY_COLORS = {
 Başlangıç:"bg-gray-100 text-gray-800",
 Gelişiyor:"bg-blue-100 text-blue-800",
 Yeterli:"bg-green-100 text-green-800",
 İleri:"bg-purple-100 text-purple-800",
} as const;

export const DIFFICULTY_COLORS = {
 Kolay:"bg-green-50 border-green-200",
 Orta:"bg-yellow-50 border-yellow-200",
 Zor:"bg-red-50 border-red-200",
} as const;

export const STATUS_SURFACE_COLORS = {
 success:"bg-green-50 border-green-200",
 error:"bg-red-50 border-red-200",
 neutral:"bg-gray-50 border-gray-200",
} as const;

export const STATUS_BAR_COLORS = {
 success:"bg-green-500",
 warning:"bg-yellow-500",
 danger:"bg-red-500",
} as const;

export const PERFORMANCE_COLORS = [
"#16a34a",
"#22c55e",
"#65a30d",
"#84cc16",
"#a3e635",
] as const;

export type RiskLevel = keyof typeof RISK_COLORS;
export type ChartColorKey = keyof typeof CHART_COLORS;
export type MasteryLevel = keyof typeof MASTERY_COLORS;
export type DifficultyLevel = keyof typeof DIFFICULTY_COLORS;
export type ModernGradient = keyof typeof MODERN_GRADIENTS;
export type CardGradient = keyof typeof CARD_GRADIENTS;
