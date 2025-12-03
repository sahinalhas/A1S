import { toast } from "sonner";

interface ErrorLog {
 timestamp: string;
 message: string;
 stack?: string;
 context?: string;
 userAgent: string;
}

const errorLogs: ErrorLog[] = [];
const MAX_ERROR_LOGS = 50;

function logError(error: Error | string, context?: string): void {
 const errorMessage = error instanceof Error ? error.message : String(error);
 const errorStack = error instanceof Error ? error.stack : undefined;

 const errorLog: ErrorLog = {
 timestamp: new Date().toISOString(),
 message: errorMessage,
 stack: errorStack,
 context,
 userAgent: navigator.userAgent,
 };

 errorLogs.push(errorLog);
 if (errorLogs.length > MAX_ERROR_LOGS) {
 errorLogs.shift();
 }

 if (import.meta.env.DEV) {
 console.error('[Error Handler]', errorLog);
 }
}

export function setupGlobalErrorHandlers(): () => void {
 const handleError = (event: ErrorEvent) => {
 event.preventDefault();
 
 logError(event.error || event.message, 'window.onerror');
 
 toast.error('Beklenmeyen bir hata oluştu', {
 description: 'Lütfen sayfayı yenileyip tekrar deneyin.',
 });
 };

 const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
 event.preventDefault();
 
 const error = event.reason instanceof Error 
 ? event.reason 
 : new Error(String(event.reason));
 
 logError(error, 'unhandledrejection');
 
 if (!event.reason?.message?.includes('NetworkError')) {
 toast.error('İşlem tamamlanamadı', {
 description: 'Lütfen tekrar deneyin veya sayfayı yenileyin.',
 });
 }
 };

 window.addEventListener('error', handleError);
 window.addEventListener('unhandledrejection', handleUnhandledRejection);

 return () => {
 window.removeEventListener('error', handleError);
 window.removeEventListener('unhandledrejection', handleUnhandledRejection);
 };
}

export function getErrorLogs(): ErrorLog[] {
 return [...errorLogs];
}

export function clearErrorLogs(): void {
 errorLogs.length = 0;
}
