export type SpeechRecognitionLanguage = 'tr-TR' | 'en-US';

export type SpeechRecognitionStatus = 
  | 'idle' 
  | 'listening'
  | 'processing' 
  | 'error' 
  | 'success';

export interface SpeechRecognitionConfig {
  language: SpeechRecognitionLanguage;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export interface SpeechRecognitionError {
  code: 
    | 'no-speech'
    | 'aborted'
    | 'audio-capture'
    | 'network'
    | 'not-allowed'
    | 'service-not-allowed'
    | 'bad-grammar'
    | 'language-not-supported'
    | 'not-supported';
  message: string;
  solution?: string;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
}

export interface UseSpeechRecognitionOptions {
  language?: SpeechRecognitionLanguage;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onResult?: (result: SpeechRecognitionResult) => void;
  onError?: (error: SpeechRecognitionError) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  confidence: number;
  error: SpeechRecognitionError | null;
  startListening: () => void;
  stopListening: () => void;
  abortListening: () => void;
  resetTranscript: () => void;
  browserSupport: {
    isSupported: boolean;
    browserName: string;
    recommendation?: string;
  };
}

export interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  onError?: (error: SpeechRecognitionError) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'floating';
  language?: SpeechRecognitionLanguage;
  disabled?: boolean;
  className?: string;
  showWaveform?: boolean;
}

export interface VoiceInputStatusProps {
  status: SpeechRecognitionStatus;
  message?: string;
  confidence?: number;
}

export interface EnhancedTextareaVoiceProps {
  enableVoice?: boolean;
  voiceMode?: 'append' | 'replace';
  voiceLanguage?: SpeechRecognitionLanguage;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
}
