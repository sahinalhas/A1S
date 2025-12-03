/**
 * i18n Utility Functions
 * 
 * This file contains utility functions for working with translations.
 * These utilities can be used until a full i18n library is integrated.
 */

import type { SupportedLanguage } from './config';
import type { TranslationKeys } from './types';

/**
 * Load translations from public/locales
 */
export async function loadTranslations(language: SupportedLanguage): Promise<Partial<TranslationKeys>> {
 try {
 const response = await fetch(`/locales/${language}.json`);
 if (!response.ok) {
 throw new Error(`Failed to load translations for language: ${language}`);
 }
 return await response.json();
 } catch (error) {
 console.error('Error loading translations:', error);
 return {};
 }
}

/**
 * Get nested translation value from object
 * Example: getNestedValue(translations, 'common.save') returns translations.common.save
 */
export function getNestedValue(obj: any, path: string): string {
 const keys = path.split('.');
 let current = obj;
 
 for (const key of keys) {
 if (current && typeof current === 'object' && key in current) {
 current = current[key];
 } else {
 return path; // Return the key itself if not found
 }
 }
 
 return typeof current === 'string' ? current : path;
}

/**
 * Simple translation function (without i18n library)
 * This can be used as a fallback or for simple cases
 * 
 * @param translations - The translations object
 * @param key - The translation key (e.g., 'common.save')
 * @param params - Optional parameters for interpolation (e.g., { name: 'John' })
 * @returns The translated string
 */
export function translate(
 translations: Partial<TranslationKeys>,
 key: string,
 params?: Record<string, string | number>
): string {
 let value = getNestedValue(translations, key);
 
 // If params are provided, replace placeholders
 if (params) {
 Object.entries(params).forEach(([paramKey, paramValue]) => {
 value = value.replace(`{${paramKey}}`, String(paramValue));
 });
 }
 
 return value;
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date | string, language: SupportedLanguage): string {
 const dateObj = typeof date === 'string' ? new Date(date) : date;
 
 const localeMap: Record<SupportedLanguage, string> = {
 tr: 'tr-TR',
 en: 'en-US',
 };
 
 return dateObj.toLocaleDateString(localeMap[language], {
 year: 'numeric',
 month: 'long',
 day: 'numeric',
 });
}

/**
 * Format number according to locale
 */
export function formatNumber(num: number, language: SupportedLanguage): string {
 const localeMap: Record<SupportedLanguage, string> = {
 tr: 'tr-TR',
 en: 'en-US',
 };
 
 return num.toLocaleString(localeMap[language]);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(amount: number, language: SupportedLanguage, currency = 'TRY'): string {
 const localeMap: Record<SupportedLanguage, string> = {
 tr: 'tr-TR',
 en: 'en-US',
 };
 
 return new Intl.NumberFormat(localeMap[language], {
 style: 'currency',
 currency,
 }).format(amount);
}
