/**
 * i18n Module
 * 
 * This module provides internationalization (i18n) support for the application.
 * 
 * Usage:
 * 1. Import the i18n utilities and configuration
 * 2. Load translations using loadTranslations
 * 3. Use translate function for simple translations
 * 4. For a complete solution, integrate react-i18next library
 * 
 * Example:
 * ```tsx
 * import { loadTranslations, translate, getCurrentLanguage } from '@/lib/i18n';
 * 
 * const language = getCurrentLanguage();
 * const translations = await loadTranslations(language);
 * const saveText = translate(translations, 'common.save');
 * ```
 * 
 * Future Enhancement:
 * - Install react-i18next for a complete i18n solution
 * - Add i18next configuration
 * - Create useTranslation hook wrapper
 */

export * from './config';
export * from './types';
export * from './utils';
