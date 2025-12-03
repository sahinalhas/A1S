
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/organisms/Card";
import { useIsMobile } from "@/hooks/utils/mobile.utils";
import { ReactNode } from "react";

interface MobileOptimizedCardProps {
 title?: string;
 description?: string;
 children: ReactNode;
 footer?: ReactNode;
 className?: string;
}

export function MobileOptimizedCard({ 
 title, 
 description, 
 children, 
 footer, 
 className ="" 
}: MobileOptimizedCardProps) {
 const isMobile = useIsMobile();
 
 return (
 <Card className={`${isMobile ? 'rounded-lg' : 'rounded-xl'} ${className}`}>
 {(title || description) && (
 <CardHeader className={isMobile ? 'p-4 pb-3' : 'p-6'}>
 {title && (
 <CardTitle className={isMobile ? 'text-lg' : 'text-xl'}>
 {title}
 </CardTitle>
 )}
 {description && (
 <CardDescription className={isMobile ? 'text-sm' : 'text-base'}>
 {description}
 </CardDescription>
 )}
 </CardHeader>
 )}
 <CardContent className={isMobile ? 'p-4 pt-0' : 'p-6'}>
 {children}
 </CardContent>
 {footer && (
 <CardFooter className={isMobile ? 'p-4 pt-0' : 'p-6'}>
 {footer}
 </CardFooter>
 )}
 </Card>
 );
}
