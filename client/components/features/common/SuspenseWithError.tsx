import React, { Suspense, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import WidgetErrorBoundary from './WidgetErrorBoundary';

interface SuspenseWithErrorProps {
  children: ReactNode;
  fallback?: ReactNode;
  widgetName?: string;
  compact?: boolean;
  loadingText?: string;
}

const DefaultLoadingFallback: React.FC<{ compact?: boolean; loadingText?: string }> = ({ 
  compact = false,
  loadingText = 'Yükleniyor...'
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{loadingText}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
      <span className="text-sm text-muted-foreground">{loadingText}</span>
    </div>
  );
};

const SuspenseWithError: React.FC<SuspenseWithErrorProps> = ({
  children,
  fallback,
  widgetName,
  compact = false,
  loadingText
}) => {
  const loadingFallback = fallback || (
    <DefaultLoadingFallback compact={compact} loadingText={loadingText} />
  );

  return (
    <WidgetErrorBoundary widgetName={widgetName} compact={compact}>
      <Suspense fallback={loadingFallback}>
        {children}
      </Suspense>
    </WidgetErrorBoundary>
  );
};

export default SuspenseWithError;
