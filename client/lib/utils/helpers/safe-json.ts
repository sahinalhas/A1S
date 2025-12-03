/**
 * Safe JSON parsing utilities to prevent crashes from malformed data
 */

import { logger } from '../logger';

export function safeJsonParse<T>(
  json: string | null | undefined,
  fallback: T,
  context?: string
): T {
  if (json === null || json === undefined || json === '') {
    return fallback;
  }
  
  try {
    const parsed = JSON.parse(json);
    return parsed as T;
  } catch (error) {
    logger.warn(
      `Failed to parse JSON${context ? ` in ${context}` : ''}`,
      'SafeJSON',
      { error: error instanceof Error ? error.message : 'Unknown error', json: json.substring(0, 100) }
    );
    return fallback;
  }
}

export function safeJsonStringify(
  value: unknown,
  fallback: string = '{}',
  context?: string
): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  try {
    return JSON.stringify(value);
  } catch (error) {
    logger.warn(
      `Failed to stringify JSON${context ? ` in ${context}` : ''}`,
      'SafeJSON',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
    return fallback;
  }
}

export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return fallback;
    }
    return safeJsonParse<T>(item, fallback, `localStorage:${key}`);
  } catch (error) {
    logger.warn('Failed to read from localStorage', 'SafeJSON', { key, error });
    return fallback;
  }
}

export function safeLocalStorageSet(key: string, value: unknown): boolean {
  try {
    const json = safeJsonStringify(value, '', `localStorage:${key}`);
    if (json === '') {
      return false;
    }
    localStorage.setItem(key, json);
    return true;
  } catch (error) {
    logger.warn('Failed to write to localStorage', 'SafeJSON', { key, error });
    return false;
  }
}

export function safeLocalStorageRemove(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    logger.warn('Failed to remove from localStorage', 'SafeJSON', { key, error });
    return false;
  }
}
