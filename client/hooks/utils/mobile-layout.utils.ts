
import { useIsMobile } from "./mobile.utils";

export function useMobileLayout() {
 const isMobile = useIsMobile();

 const getResponsiveSpacing = (type: 'padding' | 'margin' | 'gap') => {
 const baseClasses = {
 padding: isMobile ? 'p-3' : 'p-6',
 margin: isMobile ? 'm-3' : 'm-6',
 gap: isMobile ? 'gap-3' : 'gap-6',
 };
 return baseClasses[type];
 };

 const getResponsiveTextSize = (variant: 'sm' | 'base' | 'lg' | 'xl') => {
 const sizeMap = {
 sm: isMobile ? 'text-xs' : 'text-sm',
 base: isMobile ? 'text-sm' : 'text-base',
 lg: isMobile ? 'text-base' : 'text-lg',
 xl: isMobile ? 'text-lg' : 'text-xl',
 };
 return sizeMap[variant];
 };

 const getResponsiveColumns = (defaultCols: number = 1) => {
 return isMobile ? 1 : defaultCols;
 };

 const getTouchTargetSize = () => {
 return 'min-h-[44px] min-w-[44px]';
 };

 const getCardPadding = () => {
 return isMobile ? 'p-4' : 'p-6';
 };

 const getGridGap = () => {
 return isMobile ? 'gap-3' : 'gap-6';
 };

 return {
 isMobile,
 getResponsiveSpacing,
 getResponsiveTextSize,
 getResponsiveColumns,
 getTouchTargetSize,
 getCardPadding,
 getGridGap,
 };
}
