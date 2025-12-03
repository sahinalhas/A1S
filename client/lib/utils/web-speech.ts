import type { SpeechRecognitionLanguage } from '@shared/types/speech.types';

export interface BrowserSupportInfo {
 isSupported: boolean;
 browserName: string;
 recommendation?: string;
}

export function detectBrowser(): string {
 const ua = navigator.userAgent.toLowerCase();
 
 if (ua.includes('edg')) return 'Edge';
 if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
 if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
 if (ua.includes('firefox')) return 'Firefox';
 if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
 
 return 'Unknown';
}

export function checkWebSpeechSupport(): BrowserSupportInfo {
 const browserName = detectBrowser();
 
 const isSupported = !!(
 ('SpeechRecognition' in window) || 
 ('webkitSpeechRecognition' in window)
 );

 if (isSupported) {
 return {
 isSupported: true,
 browserName,
 };
 }

 let recommendation: string;
 
 if (browserName === 'Firefox') {
 recommendation = 'Firefox ses tanımayı desteklemiyor. Chrome, Edge veya Safari kullanın.';
 } else {
 recommendation = 'Tarayıcınız ses tanımayı desteklemiyor. Chrome, Edge veya Safari kullanın.';
 }

 return {
 isSupported: false,
 browserName,
 recommendation,
 };
}

export function createSpeechRecognition(): SpeechRecognition | null {
 const SpeechRecognitionAPI = 
 (window as any).SpeechRecognition || 
 (window as any).webkitSpeechRecognition;

 if (!SpeechRecognitionAPI) {
 return null;
 }

 return new SpeechRecognitionAPI();
}

export function getLanguageCode(language: SpeechRecognitionLanguage): string {
 return language;
}

export function formatErrorMessage(error: string): { message: string; solution?: string } {
 switch (error) {
 case 'no-speech':
 return {
 message: 'Ses algılanamadı',
 solution: 'Lütfen daha yüksek sesle konuşun',
 };
 case 'audio-capture':
 return {
 message: 'Mikrofon erişimi sağlanamadı',
 solution: 'Mikrofon bağlantınızı kontrol edin',
 };
 case 'not-allowed':
 return {
 message: 'Mikrofon izni reddedildi',
 solution: 'Tarayıcı ayarlarından mikrofon iznini açın',
 };
 case 'network':
 return {
 message: 'Ağ hatası oluştu',
 solution: 'İnternet bağlantınızı kontrol edin',
 };
 case 'not-supported':
 return {
 message: 'Tarayıcınız ses tanımayı desteklemiyor',
 solution: 'Chrome, Edge veya Safari kullanın',
 };
 case 'service-not-allowed':
 return {
 message: 'Ses tanıma servisi kullanılamıyor',
 solution: 'Tarayıcı ayarlarını kontrol edin',
 };
 case 'aborted':
 return {
 message: 'Ses tanıma iptal edildi',
 };
 default:
 return {
 message: 'Bir hata oluştu',
 solution: 'Lütfen tekrar deneyin',
 };
 }
}
