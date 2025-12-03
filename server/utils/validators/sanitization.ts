/**
 * Comprehensive Sanitization Utilities
 * XSS, SQL Injection, ve diğer güvenlik tehditlerine karşı kapsamlı koruma
 */

/**
 * SQL Injection pattern'leri
 */
const SQL_INJECTION_PATTERNS = [
  /(\bUNION\b.*\bSELECT\b)/gi,
  /(\bINSERT\b.*\bINTO\b)/gi,
  /(\bDELETE\b.*\bFROM\b)/gi,
  /(\bDROP\b.*\bTABLE\b)/gi,
  /(\bUPDATE\b.*\bSET\b)/gi,
  /(\bEXEC\b|\bEXECUTE\b)/gi,
  /(;\s*--)/g,
  /(;\s*\/\*)/g,
  /('\s*OR\s*'1'\s*=\s*'1)/gi,
  /('\s*OR\s*1\s*=\s*1)/gi,
  /(--\s*$)/g,
  /(#\s*$)/g,
  /(\bxp_\w+)/gi, // SQL Server extended stored procedures
  /(\bsp_\w+)/gi, // SQL Server system stored procedures
];

/**
 * XSS pattern'leri - Genişletilmiş
 */
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*>/gi,
  /<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi,
  /<meta\b[^<]*>/gi,
  /<link\b[^<]*>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  /<base\b[^<]*>/gi,
  /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  /on\w+\s*=/gi, // Event handlers (onclick, onerror, etc.)
  /expression\s*\(/gi, // CSS expressions
  /import\s+/gi, // CSS @import
  /&#x/gi, // HTML entities (hex)
  /&#\d+/g, // HTML entities (decimal)
];

/**
 * Path Traversal pattern'leri
 */
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\/g,
  /%2e%2e%2f/gi,
  /%2e%2e%5c/gi,
  /\.\.%2f/gi,
  /\.\.%5c/gi,
];

/**
 * Command Injection pattern'leri
 */
const COMMAND_INJECTION_PATTERNS = [
  /[;&|`$()]/g,
  /\$\{.*\}/g,
  /\$\(.*\)/g,
  /`.*`/g,
];

/**
 * Temel string sanitization - XSS koruması
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // XSS pattern'lerini temizle
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // HTML entity encoding
  sanitized = sanitized.replace(/[<>'"&]/g, char => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;',
    };
    return entities[char] || char;
  });

  // Null byte injection önleme
  sanitized = sanitized.replace(/\0/g, '');

  // Uzunluk limiti - DoS önlemi
  return sanitized.substring(0, 10000);
}

/**
 * SQL Injection koruması
 */
export function sanitizeSqlInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // SQL injection pattern'lerini temizle
  SQL_INJECTION_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Single quote escape (parameterized query kullanılsa bile ekstra koruma)
  sanitized = sanitized.replace(/'/g, "''");

  // Null byte injection önleme
  sanitized = sanitized.replace(/\0/g, '');

  return sanitized.substring(0, 5000);
}

/**
 * Path Traversal koruması
 */
export function sanitizePath(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // Path traversal pattern'lerini temizle
  PATH_TRAVERSAL_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Sadece alfanumerik, tire, alt çizgi ve nokta
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

  return sanitized.substring(0, 255);
}

/**
 * Command Injection koruması
 */
export function sanitizeCommand(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // Command injection pattern'lerini temizle
  COMMAND_INJECTION_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Sadece alfanumerik ve boşluk
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s]/g, '');

  return sanitized.substring(0, 1000);
}

/**
 * AI Prompt Sanitization - Genişletilmiş
 * Prompt injection ve jailbreak girişimlerini engelle
 */
export function sanitizeAIPrompt(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // Temel HTML ve script temizleme
  sanitized = sanitized.replace(/[<>]/g, '');

  // Prompt injection pattern'leri
  const promptInjectionPatterns = [
    // System message override attempts
    /ignore\s+(previous|all|above|prior|preceding)\s+(instructions?|prompts?|commands?|rules?|directions?)/gi,
    /disregard\s+(previous|all|above|prior)\s+(instructions?|prompts?)/gi,
    /forget\s+(previous|all|above|prior)\s+(instructions?|prompts?)/gi,
    /override\s+(previous|all|above)\s+(instructions?|prompts?)/gi,

    // Role manipulation
    /system\s*:\s*/gi,
    /assistant\s*:\s*/gi,
    /user\s*:\s*/gi,
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /\[SYS\]/gi,
    /\[\/SYS\]/gi,
    /<\|.*?\|>/g,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,

    // Role switching attempts
    /you\s+are\s+(now|a|an)\s+/gi,
    /act\s+as\s+(a|an)\s+/gi,
    /pretend\s+(to\s+be|you\s+are)\s+/gi,
    /simulate\s+(a|an|being)\s+/gi,
    /behave\s+(like|as)\s+/gi,

    // Jailbreak attempts
    /DAN\s+mode/gi,
    /developer\s+mode/gi,
    /jailbreak/gi,
    /do\s+anything\s+now/gi,

    // Code injection attempts
    /```[\s\S]*?```/g,
    /exec\s*\(/gi,
    /eval\s*\(/gi,
    /function\s*\(/gi,
    /=>\s*{/g,

    // Delimiter injection
    /---\s*END\s*OF\s*PROMPT\s*---/gi,
    /###\s*END\s*###/gi,
  ];

  promptInjectionPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Multiple whitespace normalize
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Uzunluk limiti - DoS önlemi
  return sanitized.substring(0, 5000);
}

/**
 * Email sanitization
 */
export function sanitizeEmail(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  const sanitized = input.trim().toLowerCase();

  // Email format validation
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }

  return sanitized.substring(0, 254); // RFC 5321 max length
}

/**
 * URL sanitization
 */
export function sanitizeUrl(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  const sanitized = input.trim();

  // Sadece http ve https protokollerine izin ver
  if (!sanitized.match(/^https?:\/\//i)) {
    return '';
  }

  // Tehlikeli protokolleri engelle
  if (sanitized.match(/^(javascript|data|vbscript|file):/i)) {
    return '';
  }

  try {
    const url = new URL(sanitized);
    return url.toString().substring(0, 2048);
  } catch {
    return '';
  }
}

/**
 * Number sanitization - DoS ve integer overflow önleme
 */
export function sanitizeNumber(input: any, options?: { min?: number; max?: number; integer?: boolean }): number | null {
  const num = Number(input);

  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  // Integer kontrolü
  if (options?.integer && !Number.isInteger(num)) {
    return null;
  }

  // Min/Max kontrolü
  if (options?.min !== undefined && num < options.min) {
    return null;
  }

  if (options?.max !== undefined && num > options.max) {
    return null;
  }

  return num;
}

/**
 * Deep object sanitization - Recursive
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  options?: {
    sanitizeType?: 'string' | 'sql' | 'ai' | 'path';
    maxDepth?: number;
    currentDepth?: number;
  }
): T {
  const maxDepth = options?.maxDepth ?? 10;
  const currentDepth = options?.currentDepth ?? 0;

  // Infinite recursion önleme
  if (currentDepth >= maxDepth) {
    return obj;
  }

  // Array handling
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'string') {
        return sanitizeByType(item, options?.sanitizeType);
      } else if (typeof item === 'object' && item !== null) {
        return sanitizeObject(item, { ...options, currentDepth: currentDepth + 1 });
      }
      return item;
    }) as unknown as T;
  }

  // Object handling
  const sanitized: any = {};

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      continue;
    }

    const value = obj[key];

    // Sanitize key
    const sanitizedKey = sanitizeString(key);

    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeByType(value, options?.sanitizeType);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[sanitizedKey] = sanitizeObject(value, { ...options, currentDepth: currentDepth + 1 });
    } else {
      sanitized[sanitizedKey] = value;
    }
  }

  return sanitized as T;
}

/**
 * Helper: Sanitization type seçici
 */
function sanitizeByType(value: string, type?: 'string' | 'sql' | 'ai' | 'path'): string {
  switch (type) {
    case 'sql':
      return sanitizeSqlInput(value);
    case 'ai':
      return sanitizeAIPrompt(value);
    case 'path':
      return sanitizePath(value);
    case 'string':
    default:
      return sanitizeString(value);
  }
}

/**
 * AI Prompt için özel object sanitization
 */
export function sanitizeAIObject<T extends Record<string, any>>(obj: T): T {
  return sanitizeObject(obj, { sanitizeType: 'ai', maxDepth: 5 });
}

/**
 * Excel import için object sanitization
 */
export function sanitizeExcelData<T extends Record<string, any>>(obj: T): T {
  return sanitizeObject(obj, { sanitizeType: 'string', maxDepth: 3 });
}

/**
 * Validate and sanitize array
 */
export function sanitizeArray<T>(
  arr: any[],
  validator: (item: any) => T | null,
  options?: { maxLength?: number }
): T[] {
  if (!Array.isArray(arr)) {
    return [];
  }

  const maxLength = options?.maxLength ?? 1000;
  const sanitized: T[] = [];

  for (let i = 0; i < Math.min(arr.length, maxLength); i++) {
    const validated = validator(arr[i]);
    if (validated !== null) {
      sanitized.push(validated);
    }
  }

  return sanitized;
}

/**
 * HTML temizleme - Sadece güvenli HTML tag'lerine izin ver
 */
export function sanitizeHTML(input: string, allowedTags: string[] = []): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  if (allowedTags.length === 0) {
    // Tüm HTML'i temizle
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  } else {
    // Sadece izin verilen tag'leri tut
    const allowedTagsRegex = new RegExp(`<(?!\\/?(${allowedTags.join('|')})[\\s>])[^>]*>`, 'gi');
    sanitized = sanitized.replace(allowedTagsRegex, '');
  }

  return sanitized;
}

/**
 * Comprehensive validation helper
 */
export function validateAndSanitize<T>(
  data: any,
  schema: {
    [K in keyof T]: {
      type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'array' | 'object';
      required?: boolean;
      sanitize?: (value: any) => any;
      validate?: (value: any) => boolean;
    };
  }
): T | null {
  const result: any = {};

  for (const key in schema) {
    const field = schema[key];
    const value = data[key];

    // Required check
    if (field.required && (value === undefined || value === null || value === '')) {
      return null;
    }

    // Type conversion and sanitization
    let sanitizedValue: any = value;

    switch (field.type) {
      case 'string':
        sanitizedValue = field.sanitize ? field.sanitize(value) : sanitizeString(String(value || ''));
        break;
      case 'number':
        sanitizedValue = sanitizeNumber(value);
        break;
      case 'boolean':
        sanitizedValue = Boolean(value);
        break;
      case 'email':
        sanitizedValue = sanitizeEmail(String(value || ''));
        break;
      case 'url':
        sanitizedValue = sanitizeUrl(String(value || ''));
        break;
      case 'array':
        sanitizedValue = Array.isArray(value) ? value : [];
        break;
      case 'object':
        sanitizedValue = typeof value === 'object' && value !== null ? value : {};
        break;
    }

    // Custom validation
    if (field.validate && !field.validate(sanitizedValue)) {
      return null;
    }

    result[key] = sanitizedValue;
  }

  return result as T;
}
