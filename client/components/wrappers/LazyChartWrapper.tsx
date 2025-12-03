import { Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyChartWrapperProps {
 component: ComponentType<any>;
 fallback?: React.ReactNode;
 [key: string]: any;
}

const ChartSkeleton = () => (
 <div className="flex items-center justify-center h-64 bg-muted/10 rounded-lg">
 <Loader2 className="h-6 w-6 text-muted-foreground" />
 </div>
);

export const LazyChartWrapper = ({ 
 component: Component, 
 fallback = <ChartSkeleton />,
 ...props 
}: LazyChartWrapperProps) => {
 return (
 <Suspense fallback={fallback}>
 <Component {...props} />
 </Suspense>
 );
};
