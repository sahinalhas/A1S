import * as React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button/button";
import { toast } from "sonner";
import { VoiceInputButton } from "@/components/molecules/VoiceInputButton/voice-input-button";
import { VoiceInputStatus } from "@/components/molecules/VoiceInputStatus/voice-input-status";
import type { 
 EnhancedTextareaVoiceProps,
 SpeechRecognitionStatus 
} from "@shared/types/speech.types";

export interface EnhancedTextareaProps
 extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value'>,
 EnhancedTextareaVoiceProps {
 enableAIPolish?: boolean;
 aiContext?: 'academic' | 'counseling' | 'notes' | 'general';
 onValueChange?: (value: string) => void;
 value?: string | number | readonly string[];
 defaultValue?: string | number | readonly string[];
}

const EnhancedTextarea = React.forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
 ({ className, enableAIPolish = true, aiContext = 'general', onValueChange,
 enableVoice = false,
 voiceMode = 'append',
 voiceLanguage = 'tr-TR',
 onVoiceStart,
 onVoiceEnd,
 onChange,
 value,
 defaultValue,
 ...props 
 }, ref) => {
 const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
 const [isPolishing, setIsPolishing] = React.useState(false);
 const [currentValue, setCurrentValue] = React.useState(value?.toString() || defaultValue?.toString() || '');
 const previousValueRef = React.useRef<string | undefined>(undefined);

 const [voiceStatus, setVoiceStatus] = React.useState<SpeechRecognitionStatus>('idle');
 const [voiceDuration, setVoiceDuration] = React.useState(0);
 const internalTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);

 React.useImperativeHandle(ref, () => internalTextareaRef.current!);

 const handleVoiceTranscript = (transcript: string) => {
 if (!internalTextareaRef.current) return;
 
 const currentTextareaValue = internalTextareaRef.current.value;
 const newValue = voiceMode === 'append' 
 ? `${currentTextareaValue}${currentTextareaValue ? ' ' : ''}${transcript}` 
 : transcript;
 
 // Directly update the textarea value and dispatch input event
 const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
 window.HTMLTextAreaElement.prototype,
 'value'
 )?.set;
 
 if (nativeInputValueSetter) {
 nativeInputValueSetter.call(internalTextareaRef.current, newValue);
 const event = new Event('input', { bubbles: true });
 internalTextareaRef.current.dispatchEvent(event);
 }
 
 if (onChange) {
 const syntheticEvent = {
 target: { value: newValue }
 } as React.ChangeEvent<HTMLTextAreaElement>;
 onChange(syntheticEvent);
 }
 
 setVoiceStatus('success');
 setTimeout(() => setVoiceStatus('idle'), 2000);
 };
 
 const handleVoiceError = (error: any) => {
 if (import.meta.env.DEV && error?.code !== 'audio-capture') {
   console.warn("Voice error:", error);
 }
 setVoiceStatus('error');
 onVoiceEnd?.();
 setTimeout(() => setVoiceStatus('idle'), 3000);
 };

 React.useEffect(() => {
 if (value !== undefined) {
 const newValue = value.toString();
 if (previousValueRef.current !== newValue) {
 previousValueRef.current = newValue;
 setCurrentValue(newValue);
 }
 }
 }, [value]);

 const handleAIPolish = async () => {
 const textarea = textareaRef.current;
 if (!textarea || !textarea.value.trim()) {
 toast.error('Temizlenecek metin bulunamadı');
 return;
 }

 setIsPolishing(true);
 try {
 const response = await fetch('/api/ai/polish-text', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 text: textarea.value,
 context: aiContext,
 }),
 });

 if (!response.ok) {
 throw new Error('Metin temizlenemedi');
 }

 const data = await response.json();
 const polishedText = data.polishedText;

 setCurrentValue(polishedText);
 onValueChange?.(polishedText);

 const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
 window.HTMLTextAreaElement.prototype,
 'value'
 )?.set;
 nativeInputValueSetter?.call(textarea, polishedText);

 const event = new Event('input', { bubbles: true });
 textarea.dispatchEvent(event);

 toast.success('Metin AI ile temizlendi');
 } catch (error) {
 console.error('AI polish error:', error);
 toast.error('Metin temizlenirken bir hata oluştu');
 } finally {
 setIsPolishing(false);
 }
 };

 const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
 const newValue = e.target.value;
 setCurrentValue(newValue);
 onValueChange?.(newValue);
 // Prop onChange should be handled by the caller, this internal one is for state management
 // props.onChange?.(e); 
 };

 const setRefs = React.useCallback(
 (node: HTMLTextAreaElement | null) => {
 textareaRef.current = node;
 internalTextareaRef.current = node!; // Assign to internal ref as well

 if (typeof ref === 'function') {
 ref(node);
 } else if (ref) {
 ref.current = node;
 }
 },
 [ref] // Dependency array includes ref
 );

 return (
 <div className="relative w-full">
 <textarea
 className={cn(
"flex min-h-[80px] w-full rounded-lg border border-input bg-background/80 supports-[backdrop-filter]:bg-background/60 px-3.5 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none",
 enableAIPolish &&"pr-12",
 enableVoice &&"pr-24", // Reserve space for voice button and status
 className,
 )}
 ref={setRefs}
 {...props}
 value={value !== undefined ? value : currentValue} // Use controlled value if provided
 onChange={onChange || handleChange} // Use provided onChange or internal handler
 />

 {enableAIPolish && (
 <div className="absolute top-2 right-2 flex items-center gap-1">
 <Button
 type="button"
 variant="ghost"
 size="sm"
 className={cn(
"h-8 w-8 p-0",
 isPolishing &&"text-primary"
 )}
 onClick={handleAIPolish}
 onMouseDown={(e) => e.preventDefault()}
 disabled={props.disabled || isPolishing || !currentValue.trim()}
 title="AI ile temizle ve düzelt"
 >
 {isPolishing ? (
 <Loader2 className="h-4 w-4" />
 ) : (
 <Sparkles className="h-4 w-4" />
 )}
 </Button>
 </div>
 )}

 {enableVoice && (
 <div className={cn(
 // Desktop (>768px): absolute position inside textarea - always visible
"hidden md:flex absolute top-2 right-2 items-center gap-1",
 enableAIPolish &&"right-14" // Adjust position if AI polish is also enabled
 )}>
 <VoiceInputButton
 onTranscript={handleVoiceTranscript}
 onError={handleVoiceError}
 language={voiceLanguage}
 size="sm"
 variant="inline"
 />
 </div>
 )}

 {enableVoice && voiceStatus !== 'idle' && (
 <div className="absolute bottom-2 right-2">
 <VoiceInputStatus status={voiceStatus} />
 </div>
 )}
 
 {/* Mobile & Tablet: Voice button below textarea */}
 {enableVoice && (
 <div className="md:hidden mt-2 flex justify-end">
 <VoiceInputButton
 onTranscript={handleVoiceTranscript}
 onError={handleVoiceError}
 language={voiceLanguage}
 size="md"
 variant="floating"
 />
 </div>
 )}
 </div>
 );
 }
);

EnhancedTextarea.displayName ="EnhancedTextarea";

export default EnhancedTextarea;
export { EnhancedTextarea };
export const Textarea = EnhancedTextarea;