import { Mic, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { cn } from '@/lib/utils';
import type { VoiceInputStatusProps } from '@shared/types/speech.types';

export function VoiceInputStatus({ 
 status, 
 message, 
 confidence 
}: VoiceInputStatusProps) {
 const statusConfig = {
 idle: {
 icon: Mic,
 text: 'Mikrofona tıklayarak başlayın',
 className: 'bg-muted text-muted-foreground',
 variant: 'outline' as const
 },
 listening: {
 icon: Mic,
 text: 'Dinleniyor...',
 className: 'bg-red-50 text-red-700 border-red-200',
 variant: 'default' as const
 },
 processing: {
 icon: Loader2,
 text: 'İşleniyor...',
 className: 'bg-blue-50 text-blue-700 border-blue-200',
 variant: 'default' as const
 },
 error: {
 icon: AlertCircle,
 text: message || 'Hata oluştu',
 className: 'bg-destructive/10 text-destructive border-destructive/20',
 variant: 'destructive' as const
 },
 success: {
 icon: CheckCircle,
 text: 'Metin eklendi',
 className: 'bg-green-50 text-green-700 border-green-200',
 variant: 'default' as const
 }
 };

 const config = statusConfig[status];
 const Icon = config.icon;

 if (status === 'idle') {
 return (
 <div className="text-xs text-muted-foreground flex items-center gap-1">
 <Icon className="h-3 w-3" />
 <span>{config.text}</span>
 </div>
 );
 }

 if (status === 'error') {
 return (
 <Alert variant="destructive" className="py-2">
 <AlertCircle className="h-4 w-4" />
 <AlertDescription className="text-sm">
 {config.text}
 </AlertDescription>
 </Alert>
 );
 }

 return (
 <Badge 
 variant={config.variant}
 className={cn('flex items-center gap-1.5 px-3 py-1', config.className)}
 >
 <Icon className={cn('h-3.5 w-3.5')} />
 <span>{config.text}</span>
 {confidence !== undefined && status === 'success' && confidence > 0 && (
 <span className="ml-1 text-xs opacity-75">
 {Math.round(confidence * 100)}%
 </span>
 )}
 </Badge>
 );
}
