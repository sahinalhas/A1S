/**
 * i18n Configuration
 * 
 * This file provides the configuration for internationalization (i18n).
 * It defines available languages, default language, and locale settings.
 * 
 * To use translations in your components:
 * 1. Import the translations from public/locales/[lang].json
 * 2. Use the useTranslation hook (when react-i18next is installed)
 * 
 * Example:
 * ```tsx
 * import { useTranslation } from 'react-i18next';
 * 
 * function MyComponent() {
 * const { t } = useTranslation();
 * return <h1>{t('common.save')}</h1>;
 * }
 * ```
 */

export type SupportedLanguage = 'tr' | 'en';

export interface I18nConfig {
 defaultLanguage: SupportedLanguage;
 supportedLanguages: SupportedLanguage[];
 fallbackLanguage: SupportedLanguage;
}

/**
 * Default i18n configuration
 */
export const i18nConfig: I18nConfig = {
 defaultLanguage: 'tr',
 supportedLanguages: ['tr', 'en'],
 fallbackLanguage: 'tr',
};

/**
 * Language metadata for UI display
 */
export const languageMetadata: Record<SupportedLanguage, { name: string; nativeName: string; flag: string }> = {
 tr: {
 name: 'Turkish',
 nativeName: 'Türkçe',
 flag: '🇹🇷',
 },
 en: {
 name: 'English',
 nativeName: 'English',
 flag: '🇬🇧',
 },
};

/**
 * Get the current language from localStorage or default
 */
export function getCurrentLanguage(): SupportedLanguage {
 if (typeof window === 'undefined') {
 return i18nConfig.defaultLanguage;
 }
 
 const stored = localStorage.getItem('language') as SupportedLanguage | null;
 if (stored && i18nConfig.supportedLanguages.includes(stored)) {
 return stored;
 }
 
 return i18nConfig.defaultLanguage;
}

/**
 * Set the current language in localStorage
 */
export function setCurrentLanguage(language: SupportedLanguage): void {
 if (typeof window === 'undefined') {
 return;
 }
 
 if (!i18nConfig.supportedLanguages.includes(language)) {
 console.warn(`Language"${language}" is not supported. Using default language.`);
 language = i18nConfig.defaultLanguage;
 }
 
 localStorage.setItem('language', language);
}

/**
 * Get the browser's preferred language
 */
export function getBrowserLanguage(): SupportedLanguage {
 if (typeof window === 'undefined') {
 return i18nConfig.defaultLanguage;
 }
 
 const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
 
 if (i18nConfig.supportedLanguages.includes(browserLang)) {
 return browserLang;
 }
 
 return i18nConfig.defaultLanguage;
}
