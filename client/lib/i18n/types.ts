/**
 * i18n Type Definitions
 * 
 * This file contains type definitions for translations.
 * Auto-generated types can be added here based on locale files.
 */

import type { SupportedLanguage } from './config';

/**
 * Translation keys structure (based on public/locales/*.json)
 * This provides type-safety for translation keys
 */
export interface TranslationKeys {
 app: {
 name: string;
 description: string;
 version: string;
 };
 common: {
 save: string;
 cancel: string;
 delete: string;
 edit: string;
 create: string;
 update: string;
 search: string;
 filter: string;
 export: string;
 import: string;
 loading: string;
 error: string;
 success: string;
 warning: string;
 info: string;
 [key: string]: string;
 };
 navigation: {
 dashboard: string;
 students: string;
 counseling: string;
 sessions: string;
 surveys: string;
 exams: string;
 analytics: string;
 reports: string;
 settings: string;
 profile: string;
 };
 students: {
 title: string;
 list: string;
 profile: string;
 add: string;
 edit: string;
 delete: string;
 [key: string]: string | object;
 };
 counseling: {
 title: string;
 sessions: string;
 [key: string]: string | object;
 };
 surveys: {
 title: string;
 [key: string]: string | object;
 };
 exams: {
 title: string;
 [key: string]: string | object;
 };
 analytics: {
 title: string;
 [key: string]: string;
 };
 reports: {
 title: string;
 [key: string]: string;
 };
 errors: {
 generic: string;
 network: string;
 notFound: string;
 unauthorized: string;
 [key: string]: string;
 };
 messages: {
 saveSuccess: string;
 updateSuccess: string;
 deleteSuccess: string;
 [key: string]: string;
 };
 validation: {
 required: string;
 email: string;
 phone: string;
 [key: string]: string;
 };
}

/**
 * Translation function type
 */
export type TranslateFunction = (key: string, params?: Record<string, string | number>) => string;

/**
 * i18n Context type
 */
export interface I18nContext {
 language: SupportedLanguage;
 setLanguage: (language: SupportedLanguage) => void;
 t: TranslateFunction;
 translations: Partial<TranslationKeys>;
}
