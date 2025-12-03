import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import type { 
 UseSpeechRecognitionReturn, 
 UseSpeechRecognitionOptions,
 SpeechRecognitionError,
 SpeechRecognitionResult,
 SpeechRecognitionLanguage
} from '@shared/types/speech.types';
import { 
 checkWebSpeechSupport, 
 createSpeechRecognition, 
 formatErrorMessage,
 getLanguageCode
} from '@/lib/utils/web-speech';

export function useSpeechRecognition(
 options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
 const {
 language = 'tr-TR',
 continuous = false,
 interimResults = true,
 maxAlternatives = 1,
 onResult,
 onError,
 onStart,
 onEnd
 } = options;

 const [isListening, setIsListening] = useState(false);
 const [transcript, setTranscript] = useState('');
 const [interimTranscript, setInterimTranscript] = useState('');
 const [confidence, setConfidence] = useState(0);
 const [error, setError] = useState<SpeechRecognitionError | null>(null);
 
 const browserSupport = checkWebSpeechSupport();
 const recognitionRef = useRef<SpeechRecognition | null>(null);
 const finalTranscriptRef = useRef('');

 useEffect(() => {
 if (!browserSupport.isSupported) {
 return;
 }

 const recognition = createSpeechRecognition();
 
 if (!recognition) {
 return;
 }

 recognition.lang = getLanguageCode(language);
 recognition.continuous = continuous;
 recognition.interimResults = interimResults;
 recognition.maxAlternatives = maxAlternatives;

 recognition.onstart = () => {
 setIsListening(true);
 setError(null);
 onStart?.();
 };

 recognition.onresult = (event: SpeechRecognitionEvent) => {
 let interimText = '';
 let finalText = '';

 for (let i = event.resultIndex; i < event.results.length; i++) {
 const result = event.results[i];
 const transcriptText = result[0].transcript;

 if (result.isFinal) {
 finalText += transcriptText + ' ';
 setConfidence(result[0].confidence);
 
 const speechResult: SpeechRecognitionResult = {
 transcript: transcriptText,
 confidence: result[0].confidence,
 isFinal: true,
 timestamp: Date.now(),
 };
 
 onResult?.(speechResult);
 } else {
 interimText += transcriptText;
 }
 }

 if (finalText) {
 finalTranscriptRef.current += finalText;
 setTranscript(finalTranscriptRef.current);
 }

 setInterimTranscript(interimText);
 };

 recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
 const { message, solution } = formatErrorMessage(event.error);
 
 const errorObj: SpeechRecognitionError = {
 code: event.error as SpeechRecognitionError['code'],
 message,
 solution,
 };

 setError(errorObj);
 setIsListening(false);
 onError?.(errorObj);

 if (event.error !== 'aborted' && event.error !== 'no-speech') {
 toast.error(message, solution ? { description: solution } : undefined);
 }
 };

 recognition.onend = () => {
 setIsListening(false);
 setInterimTranscript('');
 onEnd?.();
 };

 recognitionRef.current = recognition;

 return () => {
 if (recognitionRef.current) {
 try {
 recognitionRef.current.stop();
 } catch (e) {
 // Ignore errors on cleanup
 }
 }
 };
 }, [language, continuous, interimResults, maxAlternatives, onResult, onError, onStart, onEnd, browserSupport.isSupported]);

 const startListening = useCallback(() => {
 if (!browserSupport.isSupported) {
 const errorObj: SpeechRecognitionError = {
 code: 'not-supported',
 message: browserSupport.recommendation || 'Tarayıcınız ses tanımayı desteklemiyor',
 solution: 'Chrome, Edge veya Safari kullanın',
 };
 setError(errorObj);
 toast.error(errorObj.message, { description: errorObj.solution });
 return;
 }

 if (isListening || !recognitionRef.current) {
 return;
 }

 try {
 setError(null);
 finalTranscriptRef.current = transcript;
 recognitionRef.current.start();
 
 toast.success('Dinlemeye başlandı', {
 description: 'Konuşmaya başlayabilirsiniz',
 });
 } catch (err) {
 console.error('Speech recognition start error:', err);
 toast.error('Ses tanıma başlatılamadı', {
 description: 'Lütfen tekrar deneyin',
 });
 }
 }, [browserSupport, isListening, transcript]);

 const stopListening = useCallback(() => {
 if (!recognitionRef.current || !isListening) {
 return;
 }

 try {
 recognitionRef.current.stop();
 } catch (err) {
 console.error('Speech recognition stop error:', err);
 }
 }, [isListening]);

 const abortListening = useCallback(() => {
 if (!recognitionRef.current) {
 return;
 }

 try {
 recognitionRef.current.abort();
 setIsListening(false);
 setInterimTranscript('');
 } catch (err) {
 console.error('Speech recognition abort error:', err);
 }
 }, []);

 const resetTranscript = useCallback(() => {
 setTranscript('');
 setInterimTranscript('');
 setConfidence(0);
 setError(null);
 finalTranscriptRef.current = '';
 }, []);

 return {
 isListening,
 isSupported: browserSupport.isSupported,
 transcript,
 interimTranscript,
 confidence,
 error,
 startListening,
 stopListening,
 abortListening,
 resetTranscript,
 browserSupport,
 };
}

export function useContinuousSpeechRecognition(
 language: SpeechRecognitionLanguage = 'tr-TR',
 onTranscript?: (text: string) => void
) {
 return useSpeechRecognition({
 language,
 continuous: true,
 interimResults: true,
 onResult: (result) => {
 if (result.isFinal && onTranscript) {
 onTranscript(result.transcript);
 }
 },
 });
}
