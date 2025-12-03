import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { logger } from '@/lib/utils/logger';

interface WidgetErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  widgetName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  compact?: boolean;
}

interface WidgetErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class WidgetErrorBoundary extends Component<WidgetErrorBoundaryProps, WidgetErrorBoundaryState> {
  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): WidgetErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { widgetName, onError } = this.props;
    
    logger.error(
      `Widget error${widgetName ? ` in ${widgetName}` : ''}`,
      'WidgetErrorBoundary',
      { error: error.message, stack: errorInfo.componentStack }
    );
    
    onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback, widgetName, compact = false } = this.props;

    if (hasError) {
      if (fallback) {
        return <>{fallback}</>;
      }

      if (compact) {
        return (
          <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground bg-muted/50 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <span className="truncate">
              {widgetName ? `${widgetName} yüklenemedi` : 'Bir hata oluştu'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={this.handleRetry}
              className="h-6 px-2 ml-auto shrink-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 text-center bg-muted/30 rounded-lg border border-dashed">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
          <h4 className="font-medium text-sm mb-1">
            {widgetName ? `${widgetName} yüklenemedi` : 'Bir hata oluştu'}
          </h4>
          <p className="text-xs text-muted-foreground mb-3 max-w-xs">
            Bu bileşen geçici olarak kullanılamıyor. Lütfen tekrar deneyin.
          </p>
          {import.meta.env.DEV && error && (
            <pre className="text-xs text-left bg-muted p-2 rounded mb-3 max-w-full overflow-auto">
              {error.message}
            </pre>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            className="gap-2"
          >
            <RefreshCw className="h-3 w-3" />
            Tekrar Dene
          </Button>
        </div>
      );
    }

    return <>{children}</>;
  }
}

export default WidgetErrorBoundary;
