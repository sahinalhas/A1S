import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/Alert';

interface Props {
 children: ReactNode;
 fallback?: ReactNode;
}

interface State {
 hasError: boolean;
 error?: Error;
 errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
 constructor(props: Props) {
 super(props);
 this.state = { hasError: false };
 }

 static getDerivedStateFromError(error: Error): State {
 // Hata yakalandığında state'i güncelle
 return { hasError: true, error };
 }

 componentDidCatch(error: Error, errorInfo: ErrorInfo) {
 // Hata yakalandığında errorInfo'yu da state'e ekle
 this.setState({ errorInfo });
 
 // Production ortamında hatayı loglayalım
 console.error('React Error Boundary caught an error:', error, errorInfo);
 
 // Burada isteğe bağlı olarak error reporting servisi kullanılabilir
 // Örneğin: Sentry, Bugsnag, vb.
 if (process.env.NODE_ENV === 'production') {
 // Error reporting service'e gönder
 // reportError(error, errorInfo);
 }
 }

 handleRetry = () => {
 // Hatayı temizle ve tekrar dene
 this.setState({ hasError: false, error: undefined, errorInfo: undefined });
 };

 handleGoHome = () => {
 // Hatayı temizle ve ana sayfaya yönlendir
 this.setState({ hasError: false, error: undefined, errorInfo: undefined });
 
 // Use React Router navigation instead of full page reload
 if (window.history && window.history.pushState) {
 window.history.pushState({}, '', '/');
 window.dispatchEvent(new PopStateEvent('popstate'));
 }
 };

 render() {
 if (this.state.hasError) {
 // Özel fallback UI varsa onu kullan
 if (this.props.fallback) {
 return this.props.fallback;
 }

 const isDev = process.env.NODE_ENV === 'development';

 return (
 <div className="min-h-screen bg-background flex items-center justify-center p-4 fade-in">
 <div className="max-w-md w-full space-y-4 slide-in-from-bottom-4">
 <Alert variant="destructive">
 <AlertCircle className="h-4 w-4" />
 <AlertTitle>Beklenmeyen Bir Hata Oluştu</AlertTitle>
 <AlertDescription>
 Üzgünüz, uygulama beklenmeyen bir hatayla karşılaştı. Endişelenmeyin, 
 verileriniz güvende. Lütfen sayfayı yenilemeyi deneyin.
 </AlertDescription>
 </Alert>

 <div className="flex gap-2 flex-col sm:flex-row">
 <Button 
 onClick={this.handleRetry}
 className="flex-1 group"
 variant="outline"
 >
 <RefreshCw className="w-4 h-4 mr-2 hover-" />
 Tekrar Dene
 </Button>
 <Button 
 onClick={this.handleGoHome}
 className="flex-1 group"
 >
 <Home className="w-4 h-4 mr-2 hover-" />
 Ana Sayfa
 </Button>
 </div>

 {/* Development ortamında hata detaylarını göster */}
 {isDev && this.state.error && (
 <div className="mt-6 p-4 bg-muted rounded-lg">
 <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
 Geliştirici Bilgileri:
 </h3>
 <div className="text-xs font-mono space-y-2">
 <div>
 <strong>Hata:</strong>
 <pre className="mt-1 whitespace-pre-wrap break-all">
 {this.state.error.toString()}
 </pre>
 </div>
 {this.state.errorInfo && (
 <div>
 <strong>Stack Trace:</strong>
 <pre className="mt-1 whitespace-pre-wrap break-all text-xs">
 {this.state.errorInfo.componentStack}
 </pre>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 );
 }

 return this.props.children;
 }
}

export default ErrorBoundary;