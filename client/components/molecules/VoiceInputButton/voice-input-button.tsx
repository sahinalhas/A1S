import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/organisms/Tooltip';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/utils/speech-recognition.utils';
import type { VoiceInputButtonProps } from '@shared/types/speech.types';

export function VoiceInputButton({
 onTranscript,
 onError,
 size = 'md',
 variant = 'inline',
 language = 'tr-TR',
 disabled = false,
 className,
 showWaveform = true
}: VoiceInputButtonProps) {
 const [duration, setDuration] = useState(0);
 const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

 const {
 isListening,
 isSupported,
 transcript,
 interimTranscript,
 error,
 startListening,
 stopListening,
 resetTranscript,
 browserSupport
 } = useSpeechRecognition({
 language,
 continuous: false,
 interimResults: true,
 onResult: (result) => {
 if (result.isFinal) {
 onTranscript(result.transcript);
 }
 },
 onError: (err) => {
 onError?.(err);
 }
 });

 const handleClick = () => {
 if (isListening) {
 stopListening();
 if (durationIntervalRef.current) {
 clearInterval(durationIntervalRef.current);
 }
 setDuration(0);
 } else {
 resetTranscript();
 startListening();
 setDuration(0);
 durationIntervalRef.current = setInterval(() => {
 setDuration(prev => prev + 1);
 }, 1000);
 }
 };

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.ctrlKey && e.shiftKey && e.key === 'S') {
 e.preventDefault();
 handleClick();
 }
 };

 window.addEventListener('keydown', handleKeyDown);
 return () => {
 window.removeEventListener('keydown', handleKeyDown);
 if (durationIntervalRef.current) {
 clearInterval(durationIntervalRef.current);
 }
 };
 }, [isListening]);

 useEffect(() => {
 if (!isListening && durationIntervalRef.current) {
 clearInterval(durationIntervalRef.current);
 durationIntervalRef.current = null;
 setDuration(0);
 }
 }, [isListening]);

 const sizeClasses = {
 sm: 'h-8 w-8',
 md: 'h-10 w-10',
 lg: 'h-12 w-12'
 };

 const iconSizes = {
 sm: 'h-4 w-4',
 md: 'h-5 w-5',
 lg: 'h-6 w-6'
 };

 if (!isSupported) {
 return (
 <div className="relative group">
 <TooltipProvider>
 <Tooltip>
 <TooltipTrigger asChild>
 <Button
 type="button"
 variant="outline"
 size="icon"
 className={cn(
 sizeClasses[size],
 'cursor-not-allowed opacity-50',
 className
 )}
 disabled
 >
 <MicOff className={iconSizes[size]} />
 </Button>
 </TooltipTrigger>
 <TooltipContent className="max-w-xs">
 <p className="font-medium">{browserSupport.recommendation || 'Tarayıcınız ses tanımayı desteklemiyor'}</p>
 <p className="text-xs text-muted-foreground mt-1">Chrome, Edge veya Safari kullanın</p>
 </TooltipContent>
 </Tooltip>
 </TooltipProvider>
 </div>
 );
 }

 return (
 <div className="relative">
 <TooltipProvider>
 <Tooltip>
 <TooltipTrigger asChild>
 <Button
 type="button"
 variant={isListening ? 'destructive' : 'outline'}
 size="icon"
 className={cn(
 sizeClasses[size],
 'relative z-10',
 variant === 'floating' && 'rounded-full',
 className
 )}
 onClick={handleClick}
 disabled={disabled}
 aria-label={isListening ? 'Dinlemeyi durdur' : 'Dinlemeye başla'}
 >
 {isListening ? (
 <div className="relative">
 <Mic className={cn(iconSizes[size], 'text-white')} />
 <span className="absolute -top-1 -right-1 flex h-3 w-3">
 <span className=" absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
 </span>
 </div>
 ) : (
 <Mic className={iconSizes[size]} />
 )}
 </Button>
 </TooltipTrigger>
 <TooltipContent>
 <p>
 {isListening 
 ? 'Dinlemeyi durdur' 
 : 'Mikrofona tıklayıp konuşun'}
 </p>
 <p className="text-xs text-muted-foreground">Kısayol: Ctrl+Shift+S</p>
 {duration > 0 && (
 <p className="text-xs font-mono mt-1">
 {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
 </p>
 )}
 </TooltipContent>
 </Tooltip>
 </TooltipProvider>
 
 {showWaveform && isListening && (
 <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 h-8">
 {[0, 1, 2, 3].map((i) => (
 <div
 key={i}
 className="w-1 bg-red-500 rounded-full"
 style={{
 height: '8px',
 animationDelay: `${i * 150}ms`,
 animationDuration: '600ms'
 }}
 />
 ))}
 </div>
 )}

 {interimTranscript && isListening && (
 <div className="absolute top-full mt-2 left-0 right-0 z-50">
 <div className="bg-muted/95 px-3 py-2 rounded-md border">
 <p className="text-xs text-muted-foreground mb-1">Dinleniyor...</p>
 <p className="text-sm">{interimTranscript}</p>
 </div>
 </div>
 )}
 </div>
 );
}
