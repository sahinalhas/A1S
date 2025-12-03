
import { useIsMobile } from "@/hooks/utils/mobile.utils";
import { ReactNode } from "react";

interface MobileResponsiveGridProps {
 children: ReactNode;
 columns?: {
 mobile?: number;
 tablet?: number;
 desktop?: number;
 };
 gap?: {
 mobile?: number;
 tablet?: number;
 desktop?: number;
 };
 className?: string;
}

export function MobileResponsiveGrid({ 
 children, 
 columns = { mobile: 1, tablet: 2, desktop: 3 },
 gap = { mobile: 3, tablet: 4, desktop: 6 },
 className ="" 
}: MobileResponsiveGridProps) {
 const isMobile = useIsMobile();
 
 const gridCols: Record<number, string> = {
 1: 'grid-cols-1',
 2: 'grid-cols-2',
 3: 'grid-cols-3',
 4: 'grid-cols-4',
 };
 
 const gapSize: Record<number, string> = {
 2: 'gap-2',
 3: 'gap-3',
 4: 'gap-4',
 6: 'gap-6',
 };
 
 return (
 <div 
 className={`
 grid 
 ${gridCols[columns.mobile || 1]} 
 sm:${gridCols[columns.tablet || 2]} 
 lg:${gridCols[columns.desktop || 3]}
 ${gapSize[gap.mobile || 3]}
 sm:${gapSize[gap.tablet || 4]}
 lg:${gapSize[gap.desktop || 6]}
 ${className}
 `}
 >
 {children}
 </div>
 );
}
