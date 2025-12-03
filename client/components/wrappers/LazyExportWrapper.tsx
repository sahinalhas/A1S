import { Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyExportWrapperProps {
 component: ComponentType<any>;
 fallback?: React.ReactNode;
 [key: string]: any;
}

const ExportSkeleton = () => (
 <div className="flex items-center justify-center p-4 bg-muted/10 rounded-lg">
 <Loader2 className="h-5 w-5 text-muted-foreground mr-2" />
 <span className="text-sm text-muted-foreground">Yükleniyor...</span>
 </div>
);

export const LazyExportWrapper = ({ 
 component: Component, 
 fallback = <ExportSkeleton />,
 ...props 
}: LazyExportWrapperProps) => {
 return (
 <Suspense fallback={fallback}>
 <Component {...props} />
 </Suspense>
 );
};
